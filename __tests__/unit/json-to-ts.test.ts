import { describe, it, expect } from 'vitest';
import { generateTypes, pascalCase, singularize, type GenerateOptions } from '@/lib/json-to-ts';

function code(json: string, options: Partial<GenerateOptions> = {}): string {
  const result = generateTypes(json, options);
  if (!result.ok) throw new Error(result.error);
  return result.code;
}

describe('JSON to TypeScript (lib/json-to-ts) - helpers', () => {
  it('converts names to PascalCase', () => {
    expect(pascalCase('user_profile')).toBe('UserProfile');
    expect(pascalCase('user-profile')).toBe('UserProfile');
    expect(pascalCase('userProfile')).toBe('UserProfile');
    expect(pascalCase('user profile')).toBe('UserProfile');
  });

  it('prefixes names that would start with a digit', () => {
    expect(pascalCase('2fa')).toBe('N2fa');
  });

  it('falls back when there is nothing usable', () => {
    expect(pascalCase('---')).toBe('Item');
  });

  it('singularises plural names', () => {
    expect(singularize('users')).toBe('user');
    expect(singularize('categories')).toBe('category');
    expect(singularize('address')).toBe('address');
    expect(singularize('status')).toBe('status');
  });
});

describe('JSON to TypeScript (lib/json-to-ts) - primitives', () => {
  it('maps each JSON primitive', () => {
    expect(code('{"a":"x","b":1,"c":true,"d":null}')).toContain('a: string;');
    expect(code('{"a":"x","b":1,"c":true,"d":null}')).toContain('b: number;');
    expect(code('{"a":"x","b":1,"c":true,"d":null}')).toContain('c: boolean;');
    expect(code('{"a":"x","b":1,"c":true,"d":null}')).toContain('d: null;');
  });

  it('aliases a bare primitive document', () => {
    expect(code('42')).toBe('export type Root = number;');
    expect(code('"hello"')).toBe('export type Root = string;');
  });

  it('quotes property names that are not valid identifiers', () => {
    const output = code('{"content-type":"json","valid_name":1}');
    expect(output).toContain('"content-type": string;');
    expect(output).toContain('valid_name: number;');
  });

  it('gives an empty object an index signature', () => {
    expect(code('{}')).toContain('[key: string]: unknown;');
  });
});

describe('JSON to TypeScript (lib/json-to-ts) - objects and arrays', () => {
  it('names a nested object after its key', () => {
    const output = code('{"user":{"name":"a"}}');
    expect(output).toContain('interface Root {');
    expect(output).toContain('user: User;');
    expect(output).toContain('interface User {');
  });

  it('singularises the element type of an array', () => {
    const output = code('{"users":[{"name":"a"}]}');
    expect(output).toContain('users: User[];');
    expect(output).toContain('interface User {');
  });

  it('types an empty array as unknown[]', () => {
    expect(code('{"items":[]}')).toContain('items: unknown[];');
  });

  it('unions mixed primitive arrays', () => {
    expect(code('{"mixed":[1,"a"]}')).toContain('mixed: (number | string)[];');
  });

  it('merges object shapes across array elements', () => {
    const output = code('{"users":[{"id":1,"name":"a"},{"id":2,"email":"b"}]}');
    expect(output).toContain('id: number;');
    expect(output).toContain('name?: string;');
    expect(output).toContain('email?: string;');
  });

  it('keeps fields required when every element has them', () => {
    const output = code('{"users":[{"id":1},{"id":2}]}');
    expect(output).toContain('id: number;');
    expect(output).not.toContain('id?:');
  });

  it('unions differing field types across elements', () => {
    const output = code('{"rows":[{"v":1},{"v":"a"}]}');
    expect(output).toMatch(/v: (number \| string|string \| number);/);
  });

  it('handles deep nesting', () => {
    const output = code('{"a":{"b":{"c":{"d":1}}}}');
    ['interface Root', 'interface A', 'interface B', 'interface C'].forEach(name => {
      expect(output).toContain(name);
    });
  });

  it('aliases a root array', () => {
    const output = code('[{"id":1}]');
    expect(output).toContain('interface Root {');
    expect(output).toContain('export type RootList = Root[];');
  });

  it('reuses one interface for structurally identical objects', () => {
    const output = code('{"from":{"x":1,"y":2},"to":{"x":1,"y":2}}');
    expect(output.match(/interface /g)).toHaveLength(2);
    expect(output).toContain('to: From;');
  });

  it('generates distinct names for different shapes with the same key', () => {
    const output = code('{"a":{"item":{"x":1}},"b":{"item":{"y":2}}}');
    expect(output).toContain('interface Item {');
    expect(output).toContain('interface Item2 {');
  });
});

describe('JSON to TypeScript (lib/json-to-ts) - options', () => {
  it('renames the root type', () => {
    expect(code('{"a":1}', { rootName: 'ApiResponse' })).toContain('interface ApiResponse {');
  });

  it('emits type aliases instead of interfaces', () => {
    const output = code('{"a":1}', { declaration: 'type' });
    expect(output).toContain('export type Root = {');
    expect(output).toContain('};');
  });

  it('drops the export keyword when asked', () => {
    expect(code('{"a":1}', { exportTypes: false })).toContain('interface Root {');
    expect(code('{"a":1}', { exportTypes: false }).startsWith('export')).toBe(false);
  });

  it('marks readonly properties', () => {
    expect(code('{"a":1}', { readonlyProps: true })).toContain('readonly a: number;');
  });

  it('turns nullable fields into optional ones', () => {
    expect(code('{"a":null}', { nullAsOptional: true })).toContain('a?: unknown;');

    const merged = code('{"rows":[{"v":1},{"v":null}]}', { nullAsOptional: true });
    expect(merged).toContain('v?: number;');
  });

  it('keeps null in the union by default', () => {
    expect(code('{"rows":[{"v":1},{"v":null}]}')).toMatch(/v: (number \| null|null \| number);/);
  });
});

describe('JSON to TypeScript (lib/json-to-ts) - errors', () => {
  it('reports empty input', () => {
    expect(generateTypes('')).toEqual({ ok: false, error: 'Paste some JSON to convert.' });
    expect(generateTypes('   ').ok).toBe(false);
  });

  it('reports invalid JSON with the parser message', () => {
    const result = generateTypes('{not json}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
  });
});
