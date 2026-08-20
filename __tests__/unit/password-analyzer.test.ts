import { describe, it, expect } from 'vitest';
import { analyzePasswordStrength } from '@/lib/password-analyzer';

describe('Password Analyzer Engine (lib/password-analyzer)', () => {
  it('analyzes weak password entropy and crack time', () => {
    const analysis = analyzePasswordStrength('123456');
    expect(['weak', 'very_weak']).toContain(analysis.strength);
    expect(analysis.score).toBeLessThan(40);
    expect(analysis.feedback.some((f) => f.includes('Length'))).toBe(true);
  });

  it('analyzes strong high-entropy password', () => {
    const analysis = analyzePasswordStrength('Kx9#m$P2vL!8qZb7@wRt');
    expect(analysis.strength).toBe('very_strong');
    expect(analysis.score).toBeGreaterThan(80);
    expect(analysis.entropy).toBeGreaterThan(60);
    expect(analysis.crackTime).toBeDefined();
  });

  it('handles empty input', () => {
    const analysis = analyzePasswordStrength('');
    expect(analysis.strength).toBe('very_weak');
    expect(analysis.entropy).toBe(0);
    expect(analysis.score).toBe(0);
  });
});
