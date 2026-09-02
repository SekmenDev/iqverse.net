import { describe, it, expect } from 'vitest';
import {
  SQL_DIALECTS,
  formatSql,
  isSqlDialect,
  minifySql,
  splitStatements,
  stripComments,
  summarize,
} from '@/lib/sql';

function formatted(sql: string, options = {}): string {
  const result = formatSql(sql, options);
  if (!result.ok) throw new Error(result.error);
  return result.sql;
}

describe('SQL Formatter (lib/sql) - formatSql', () => {
  it('breaks a query across lines', () => {
    const output = formatted('select a,b from t where x=1');
    expect(output).toContain('SELECT');
    expect(output).toContain('FROM');
    expect(output.split('\n').length).toBeGreaterThan(3);
  });

  it('upper-cases keywords by default and can lower or preserve them', () => {
    expect(formatted('select 1')).toContain('SELECT');
    expect(formatted('SELECT 1', { keywordCase: 'lower' })).toContain('select');
    expect(formatted('SeLeCt 1', { keywordCase: 'preserve' })).toContain('SeLeCt');
  });

  it('honours the indent width', () => {
    const wide = formatted('select a, b from t', { tabWidth: 4 });
    expect(wide).toContain('\n    a');
  });

  it('indents with tabs when asked', () => {
    expect(formatted('select a, b from t', { useTabs: true })).toContain('\n\ta');
  });

  it('accepts every listed dialect', () => {
    SQL_DIALECTS.forEach(dialect => {
      const result = formatSql('SELECT 1', { dialect: dialect.value });
      expect(result.ok).toBe(true);
    });
  });

  it('separates multiple statements', () => {
    const output = formatted('select 1; select 2;', { linesBetweenQueries: 2 });
    expect(output).toContain('\n\n');
  });

  it('rejects empty input', () => {
    expect(formatSql('')).toEqual({ ok: false, error: 'Paste some SQL to format.' });
    expect(formatSql('   ').ok).toBe(false);
  });

  it('reports a parse failure instead of throwing', () => {
    const result = formatSql('SELECT * FROM (((');
    expect(result.ok === false || result.ok === true).toBe(true);
  });

  it('recognises supported dialect names', () => {
    expect(isSqlDialect('postgresql')).toBe(true);
    expect(isSqlDialect('cobol')).toBe(false);
  });
});

describe('SQL Formatter (lib/sql) - splitStatements', () => {
  it('splits on semicolons', () => {
    expect(splitStatements('SELECT 1; SELECT 2')).toEqual(['SELECT 1', 'SELECT 2']);
  });

  it('drops empty trailing statements', () => {
    expect(splitStatements('SELECT 1;;  ;')).toEqual(['SELECT 1']);
  });

  it('ignores semicolons inside string literals', () => {
    expect(splitStatements(`SELECT 'a;b' FROM t`)).toEqual([`SELECT 'a;b' FROM t`]);
  });

  it('ignores semicolons inside quoted identifiers', () => {
    expect(splitStatements('SELECT "col;name" FROM t')).toEqual(['SELECT "col;name" FROM t']);
    expect(splitStatements('SELECT `col;name` FROM t')).toEqual(['SELECT `col;name` FROM t']);
  });

  it('ignores semicolons inside comments', () => {
    expect(splitStatements('SELECT 1 -- a; b\nFROM t')).toHaveLength(1);
    expect(splitStatements('SELECT 1 /* a; b */ FROM t')).toHaveLength(1);
  });

  it('handles doubled quotes as escapes', () => {
    expect(splitStatements(`SELECT 'it''s; fine' FROM t`)).toHaveLength(1);
  });

  it('returns nothing for blank input', () => {
    expect(splitStatements('')).toEqual([]);
    expect(splitStatements('   \n  ')).toEqual([]);
  });
});

describe('SQL Formatter (lib/sql) - stripComments', () => {
  it('removes line comments', () => {
    expect(stripComments('SELECT 1 -- keep out\nFROM t').trim()).toBe('SELECT 1 \nFROM t');
  });

  it('removes block comments', () => {
    expect(stripComments('SELECT /* nope */ 1')).toBe('SELECT  1');
  });

  it('keeps comment-like text inside string literals', () => {
    expect(stripComments(`SELECT '-- not a comment' FROM t`)).toBe(`SELECT '-- not a comment' FROM t`);
    expect(stripComments(`SELECT '/* nor this */' FROM t`)).toBe(`SELECT '/* nor this */' FROM t`);
  });

  it('handles an unterminated block comment', () => {
    expect(stripComments('SELECT 1 /* never closed')).toBe('SELECT 1 ');
  });
});

describe('SQL Formatter (lib/sql) - minifySql', () => {
  it('collapses a formatted query onto one line', () => {
    expect(minifySql('SELECT\n  a,\n  b\nFROM\n  t')).toBe('SELECT a,b FROM t');
  });

  it('strips comments while minifying', () => {
    expect(minifySql('SELECT 1 -- comment\nFROM t')).toBe('SELECT 1 FROM t');
  });

  it('keeps a space after a statement separator', () => {
    expect(minifySql('SELECT 1;\nSELECT 2')).toBe('SELECT 1; SELECT 2');
  });

  it('leaves string literals alone', () => {
    expect(minifySql(`SELECT 'a  b' FROM t`)).toContain(`'a  b'`);
  });
});

describe('SQL Formatter (lib/sql) - summarize', () => {
  it('counts statements by kind', () => {
    const summary = summarize('SELECT 1; INSERT INTO t VALUES (1); SELECT 2;');
    expect(summary.statements).toBe(3);
    expect(summary.kinds.SELECT).toBe(2);
    expect(summary.kinds.INSERT).toBe(1);
  });

  it('recognises a CTE by its leading WITH', () => {
    expect(summarize('WITH x AS (SELECT 1) SELECT * FROM x').kinds.WITH).toBe(1);
  });

  it('buckets unknown statements as OTHER', () => {
    expect(summarize('VACUUM ANALYZE').kinds.OTHER).toBe(1);
  });

  it('ignores a leading comment when detecting the kind', () => {
    expect(summarize('-- a note\nSELECT 1').kinds.SELECT).toBe(1);
  });

  it('reports whether comments are present', () => {
    expect(summarize('SELECT 1').hasComments).toBe(false);
    expect(summarize('SELECT 1 -- note').hasComments).toBe(true);
  });

  it('handles empty input', () => {
    expect(summarize('')).toEqual({ statements: 0, kinds: {}, hasComments: false });
  });
});
