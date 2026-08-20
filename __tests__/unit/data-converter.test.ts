import { describe, it, expect } from 'vitest';
import { convertDataFormat } from '@/lib/data-converter';

describe('Data Converter Engine (lib/data-converter)', () => {
  const jsonSample = JSON.stringify({ name: 'IQVerse', enabled: true, count: 42 });

  it('converts JSON to YAML', () => {
    const res = convertDataFormat(jsonSample, 'json', 'yaml');
    expect(res.success).toBe(true);
    expect(res.output).toContain('name: IQVerse');
    expect(res.output).toContain('enabled: true');
    expect(res.output).toContain('count: 42');
  });

  it('converts YAML to JSON', () => {
    const yamlSample = 'name: IQVerse\nenabled: true\ncount: 42\n';
    const res = convertDataFormat(yamlSample, 'yaml', 'json');
    expect(res.success).toBe(true);
    const parsed = JSON.parse(res.output);
    expect(parsed.name).toBe('IQVerse');
    expect(parsed.count).toBe(42);
  });

  it('converts JSON to TOML and back', () => {
    const resToml = convertDataFormat(jsonSample, 'json', 'toml');
    expect(resToml.success).toBe(true);
    expect(resToml.output).toContain('name = "IQVerse"');

    const resJson = convertDataFormat(resToml.output, 'toml', 'json');
    expect(resJson.success).toBe(true);
    const parsed = JSON.parse(resJson.output);
    expect(parsed.name).toBe('IQVerse');
  });

  it('returns error on invalid syntax', () => {
    const res = convertDataFormat('{ invalid json', 'json', 'yaml');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
