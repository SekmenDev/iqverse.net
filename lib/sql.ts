import { format, type FormatOptionsWithLanguage, type SqlLanguage } from 'sql-formatter';

export const SQL_DIALECTS: Array<{ value: SqlLanguage; label: string }> = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'transactsql', label: 'SQL Server (T-SQL)' },
  { value: 'plsql', label: 'Oracle (PL/SQL)' },
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'redshift', label: 'Redshift' },
  { value: 'spark', label: 'Spark SQL' },
  { value: 'db2', label: 'Db2' },
];

export type KeywordCase = 'upper' | 'lower' | 'preserve';

export interface SqlFormatOptions {
  dialect: SqlLanguage;
  keywordCase: KeywordCase;
  tabWidth: number;
  useTabs: boolean;
  linesBetweenQueries: number;
}

export type SqlFormatResult = { ok: true; sql: string } | { ok: false; error: string };

export const DEFAULT_SQL_OPTIONS: SqlFormatOptions = {
  dialect: 'sql',
  keywordCase: 'upper',
  tabWidth: 2,
  useTabs: false,
  linesBetweenQueries: 2,
};

export function isSqlDialect(value: string): value is SqlLanguage {
  return SQL_DIALECTS.some(dialect => dialect.value === value);
}

export function formatSql(sql: string, overrides: Partial<SqlFormatOptions> = {}): SqlFormatResult {
  const trimmed = sql.trim();
  if (!trimmed) return { ok: false, error: 'Paste some SQL to format.' };

  const options: SqlFormatOptions = { ...DEFAULT_SQL_OPTIONS, ...overrides };

  const config: FormatOptionsWithLanguage = {
    language: options.dialect,
    keywordCase: options.keywordCase,
    tabWidth: options.tabWidth,
    useTabs: options.useTabs,
    linesBetweenQueries: options.linesBetweenQueries,
  };

  try {
    return { ok: true, sql: format(trimmed, config) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not format that SQL.' };
  }
}

export type SegmentKind = 'code' | 'literal' | 'comment';

export interface Segment {
  kind: SegmentKind;
  text: string;
  start: number;
}

/**
 * Splits SQL into code, string/identifier literals and comments, so that
 * separators and whitespace inside literals are never treated as syntax.
 */
export function segmentSql(sql: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  let index = 0;

  const flushCode = (upTo: number) => {
    if (upTo > cursor) segments.push({ kind: 'code', text: sql.slice(cursor, upTo), start: cursor });
  };

  while (index < sql.length) {
    const char = sql[index];
    const next = sql[index + 1] ?? '';

    if (char === '-' && next === '-') {
      flushCode(index);
      const end = sql.indexOf('\n', index);
      const stop = end === -1 ? sql.length : end;
      segments.push({ kind: 'comment', text: sql.slice(index, stop), start: index });
      index = stop;
      cursor = index;
      continue;
    }

    if (char === '/' && next === '*') {
      flushCode(index);
      const end = sql.indexOf('*/', index + 2);
      const stop = end === -1 ? sql.length : end + 2;
      segments.push({ kind: 'comment', text: sql.slice(index, stop), start: index });
      index = stop;
      cursor = index;
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      flushCode(index);
      const start = index;
      index += 1;

      while (index < sql.length) {
        if (sql[index] === '\\') {
          index += 2;
          continue;
        }
        if (sql[index] === char) {
          // A doubled quote is an escaped quote, not the end of the literal
          if (sql[index + 1] === char) {
            index += 2;
            continue;
          }
          break;
        }
        index += 1;
      }

      index = Math.min(index + 1, sql.length);
      segments.push({ kind: 'literal', text: sql.slice(start, index), start });
      cursor = index;
      continue;
    }

    index += 1;
  }

  flushCode(sql.length);
  return segments;
}

function mergeAdjacentCode(segments: Segment[]): Segment[] {
  const merged: Segment[] = [];

  for (const segment of segments) {
    const previous = merged[merged.length - 1];
    if (previous && previous.kind === 'code' && segment.kind === 'code') {
      previous.text += segment.text;
      continue;
    }
    merged.push({ ...segment });
  }

  return merged;
}

export function splitStatements(sql: string): string[] {
  const boundaries: number[] = [];

  for (const segment of segmentSql(sql)) {
    if (segment.kind !== 'code') continue;

    for (let offset = 0; offset < segment.text.length; offset += 1) {
      if (segment.text[offset] === ';') boundaries.push(segment.start + offset);
    }
  }

  const statements: string[] = [];
  let start = 0;

  for (const boundary of boundaries) {
    statements.push(sql.slice(start, boundary));
    start = boundary + 1;
  }
  statements.push(sql.slice(start));

  return statements.map(statement => statement.trim()).filter(Boolean);
}

export function stripComments(sql: string): string {
  return segmentSql(sql)
    .filter(segment => segment.kind !== 'comment')
    .map(segment => segment.text)
    .join('');
}

function minifyCode(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),])\s*/g, '$1')
    .replace(/\s*;\s*/g, '; ');
}

export function minifySql(sql: string): string {
  const segments = mergeAdjacentCode(segmentSql(sql).filter(segment => segment.kind !== 'comment'));

  return segments
    .map(segment => (segment.kind === 'literal' ? segment.text : minifyCode(segment.text)))
    .join('')
    .replace(/;\s+$/, ';')
    .trim();
}

export interface SqlSummary {
  statements: number;
  kinds: Record<string, number>;
  hasComments: boolean;
}

const STATEMENT_KINDS = [
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'MERGE',
  'CREATE', 'ALTER', 'DROP', 'TRUNCATE',
  'GRANT', 'REVOKE', 'WITH', 'EXPLAIN', 'BEGIN', 'COMMIT', 'ROLLBACK',
];

export function summarize(sql: string): SqlSummary {
  const statements = splitStatements(sql);
  const kinds: Record<string, number> = {};

  for (const statement of statements) {
    const cleaned = stripComments(statement).trim();
    const firstWord = /^\(*\s*([A-Za-z]+)/.exec(cleaned)?.[1]?.toUpperCase() ?? '';
    const kind = STATEMENT_KINDS.includes(firstWord) ? firstWord : 'OTHER';
    kinds[kind] = (kinds[kind] ?? 0) + 1;
  }

  return {
    statements: statements.length,
    kinds,
    hasComments: stripComments(sql).length !== sql.length,
  };
}
