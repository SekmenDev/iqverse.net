import { describe, it, expect } from 'vitest';
import { computeLineDiff } from '@/lib/diff';

describe('Diff Engine (lib/diff)', () => {
  it('identifies unchanged lines', () => {
    const text = 'line 1\nline 2\nline 3';
    const diff = computeLineDiff(text, text, false);
    expect(diff.every((l) => l.type === 'unchanged')).toBe(true);
    expect(diff).toHaveLength(3);
  });

  it('identifies added and removed lines', () => {
    const left = 'apple\nbanana\ncherry';
    const right = 'apple\norange\ncherry';
    const diff = computeLineDiff(left, right, false);

    expect(diff.some((l) => l.type === 'removed' && l.content === 'banana')).toBe(true);
    expect(diff.some((l) => l.type === 'added' && l.content === 'orange')).toBe(true);
    expect(diff.some((l) => l.type === 'unchanged' && l.content === 'apple')).toBe(true);
  });

  it('honors ignoreWhitespace parameter', () => {
    const left = '  hello world  ';
    const right = 'hello world';

    const strictDiff = computeLineDiff(left, right, false);
    expect(strictDiff.some((l) => l.type === 'removed' || l.type === 'added')).toBe(true);

    const looseDiff = computeLineDiff(left, right, true);
    expect(looseDiff[0].type).toBe('unchanged');
  });
});
