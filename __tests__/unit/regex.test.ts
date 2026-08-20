import { describe, it, expect } from 'vitest';
import { evaluateRegex, safeCompileRegex } from '@/lib/regex';

describe('RegExp Engine (lib/regex)', () => {
  it('safely compiles regular expressions', () => {
    expect(safeCompileRegex('\\d+', 'g')).not.toBeNull();
    expect(safeCompileRegex('[unclosed group', '')).toBeNull();
  });

  it('evaluates matches, captures, and replacements', () => {
    const res = evaluateRegex('(\\w+)@(\\w+\\.\\w+)', 'g', 'Contact us at info@iqverse.net or support@iqverse.net', '[$1]');
    expect(res.isValid).toBe(true);
    expect(res.matches).toHaveLength(2);
    expect(res.matches[0].match).toBe('info@iqverse.net');
    expect(res.matches[0].groups).toEqual(['info', 'iqverse.net']);
    expect(res.replacedText).toBe('Contact us at [info] or [support]');
  });

  it('returns friendly error object on invalid regex pattern', () => {
    const res = evaluateRegex('(unclosed group', '', 'text', '');
    expect(res.isValid).toBe(false);
    expect(res.error).toBeDefined();
    expect(res.matches).toHaveLength(0);
  });
});
