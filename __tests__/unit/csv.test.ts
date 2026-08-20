import { describe, it, expect } from 'vitest';
import { parseCsv, exportCsvToJson, exportCsvToMarkdown, exportCsvToSql } from '@/lib/csv';

describe('CSV Engine (lib/csv)', () => {
  it('parses quoted and unquoted CSV rows correctly', () => {
    const csv = 'name,role,location\n"Sekmen, Huseyin",Engineer,"Istanbul, TR"\nAlice,Designer,Berlin';
    const parsed = parseCsv(csv);

    expect(parsed.headers).toEqual(['name', 'role', 'location']);
    expect(parsed.rows).toHaveLength(2);
    expect(parsed.rows[0]).toEqual(['Sekmen, Huseyin', 'Engineer', 'Istanbul, TR']);
    expect(parsed.rows[1]).toEqual(['Alice', 'Designer', 'Berlin']);
  });

  it('exports CSV to JSON format', () => {
    const parsed = {
      headers: ['id', 'title'],
      rows: [
        ['1', 'First Post'],
        ['2', 'Second Post'],
      ],
    };
    const jsonStr = exportCsvToJson(parsed);
    const json = JSON.parse(jsonStr);
    expect(json).toHaveLength(2);
    expect(json[0].title).toBe('First Post');
  });

  it('exports CSV to Markdown table', () => {
    const parsed = {
      headers: ['Name', 'Age'],
      rows: [['John', '30']],
    };
    const md = exportCsvToMarkdown(parsed);
    expect(md).toContain('| Name | Age |');
    expect(md).toContain('| --- | --- |');
    expect(md).toContain('| John | 30 |');
  });

  it('exports CSV to SQL INSERT statements', () => {
    const parsed = {
      headers: ['id', 'user_name'],
      rows: [
        ['1', 'john_doe'],
        ['2', "o'connor"],
      ],
    };
    const sql = exportCsvToSql(parsed, 'users');
    expect(sql).toContain("INSERT INTO users (id, user_name) VALUES ('1', 'john_doe');");
    expect(sql).toContain("INSERT INTO users (id, user_name) VALUES ('2', 'o''connor');");
  });
});
