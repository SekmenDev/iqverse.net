import { describe, it, expect } from 'vitest';
import { convertAllCases } from '@/lib/case-converter';

describe('Case Converter Engine (lib/case-converter)', () => {
  it('converts camelCase, kebab-case, snake_case, PascalCase and CONSTANT_CASE correctly', () => {
    const input = 'hello-world_foo bar';
    const cases = convertAllCases(input);

    expect(cases.camel).toBe('helloWorldFooBar');
    expect(cases.pascal).toBe('HelloWorldFooBar');
    expect(cases.snake).toBe('hello_world_foo_bar');
    expect(cases.kebab).toBe('hello-world-foo-bar');
    expect(cases.constant).toBe('HELLO_WORLD_FOO_BAR');
    expect(cases.title).toBe('Hello World Foo Bar');
    expect(cases.lower).toBe('hello-world_foo bar');
    expect(cases.upper).toBe('HELLO-WORLD_FOO BAR');
  });

  it('handles empty inputs gracefully', () => {
    const cases = convertAllCases('');
    expect(cases.camel).toBe('');
    expect(cases.pascal).toBe('');
    expect(cases.snake).toBe('');
  });
});
