export type CsvRow = string[] & Record<string, string>;

export interface ParsedCsvResult {
  headers: string[];
  rows: any[];
}

export function parseCSV(text: string, delimiter: string = ','): ParsedCsvResult {
  const lines = text.split(/\r?\n/).filter((row) => row.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseLine(line);
    const rowObj: any = [...values];
    headers.forEach((header, index) => {
      Object.defineProperty(rowObj, header, {
        value: values[index] ?? '',
        enumerable: false,
        writable: true,
        configurable: true,
      });
    });
    return rowObj;
  });

  return { headers, rows };
}

export function parseCsv(text: string, delimiter: string = ','): ParsedCsvResult {
  return parseCSV(text, delimiter);
}

export function exportCsvToJson(input: any[] | ParsedCsvResult): string {
  let headers: string[] = [];
  let rows: any[] = [];

  if (Array.isArray(input)) {
    rows = input;
  } else if (input && typeof input === 'object') {
    headers = input.headers || [];
    rows = input.rows || [];
  }

  const objects = rows.map((row) => {
    if (Array.isArray(row) && headers.length > 0) {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] ?? '';
      });
      return obj;
    }
    if (typeof row === 'object' && row !== null) {
      return row;
    }
    return { value: String(row) };
  });

  return JSON.stringify(objects, null, 2);
}

export function exportCsvToMarkdown(
  arg1: string[] | ParsedCsvResult,
  arg2?: any[]
): string {
  let headers: string[] = [];
  let rows: any[] = [];

  if (Array.isArray(arg1)) {
    headers = arg1;
    rows = arg2 || [];
  } else if (arg1 && typeof arg1 === 'object') {
    headers = arg1.headers || [];
    rows = arg1.rows || [];
  }

  if (headers.length === 0 || rows.length === 0) return '';
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => {
      const cells = headers.map((h, i) => (Array.isArray(row) ? row[i] ?? '' : row[h] ?? ''));
      return `| ${cells.join(' | ')} |`;
    }),
  ];
  return lines.join('\n');
}

export function exportCsvToSql(
  arg1: string[] | ParsedCsvResult,
  arg2?: any[] | string,
  arg3: string = 'table_name'
): string {
  let headers: string[] = [];
  let rows: any[] = [];
  let tableName = 'table_name';

  if (Array.isArray(arg1)) {
    headers = arg1;
    if (Array.isArray(arg2)) rows = arg2;
    if (typeof arg3 === 'string') tableName = arg3;
  } else if (arg1 && typeof arg1 === 'object') {
    headers = arg1.headers || [];
    rows = arg1.rows || [];
    if (typeof arg2 === 'string') tableName = arg2;
  }

  if (headers.length === 0 || rows.length === 0) return '';
  const inserts = rows.map((row) => {
    const values = headers
      .map((h, i) => {
        const val = Array.isArray(row) ? row[i] ?? '' : row[h] ?? '';
        const escaped = String(val).split("'").join("''");
        return `'${escaped}'`;
      })
      .join(', ');
    return `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${values});`;
  });
  return inserts.join('\n');
}
