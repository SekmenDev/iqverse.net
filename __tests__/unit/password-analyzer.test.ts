import { describe, it, expect } from 'vitest';
import { analyzePassword, getCharacterSets } from '@/lib/password-analyzer';

describe('Password Analyzer Engine (lib/password-analyzer)', () => {
  it('rates breached passwords as very weak', () => {
    for (const password of ['password', '111111', '123456', 'qwerty']) {
      const analysis = analyzePassword(password);
      expect(analysis.score).toBe(0);
      expect(analysis.rating).toBe('Very Weak');
      expect(analysis.entropy).toBeLessThan(15);
      expect(analysis.patterns[0]?.label).toBe('Breached password');
    }
  });

  it('does not reward leetspeak on a common word', () => {
    const analysis = analyzePassword('P@ssw0rd!');
    expect(analysis.score).toBeLessThanOrEqual(2);
    expect(analysis.patterns.some((pattern) => pattern.detail.includes('leetspeak'))).toBe(true);
    expect(analysis.warning).not.toBe('');
  });

  it('detects keyboard patterns, sequences and repeats', () => {
    expect(analyzePassword('tyuiop[]').patterns.some((p) => p.label === 'Keyboard pattern')).toBe(
      true
    );
    expect(analyzePassword('abcdefgh').patterns.some((p) => p.label === 'Predictable sequence')).toBe(
      true
    );
    expect(analyzePassword('aaaaaaaaaa').patterns.some((p) => p.label === 'Repeated characters')).toBe(
      true
    );
  });

  it('flags a name followed by a recent year', () => {
    const analysis = analyzePassword('Michael2024');
    expect(analysis.score).toBeLessThanOrEqual(2);
    expect(analysis.patterns.some((pattern) => pattern.label === 'Recent year')).toBe(true);
  });

  it('rates a long random password as very strong', () => {
    const analysis = analyzePassword('Kx9#m$P2vL!8qZb7@wRt');
    expect(analysis.score).toBe(4);
    expect(analysis.rating).toBe('Very Strong');
    expect(analysis.entropy).toBeGreaterThan(60);
    expect(analysis.patterns).toHaveLength(0);
    expect(analysis.crackTimeOfflineFast).toBeTruthy();
  });

  it('rates a multi word passphrase above a short complex password', () => {
    const passphrase = analyzePassword('correct horse battery staple');
    const complex = analyzePassword('P@ssw0rd!');
    expect(passphrase.score).toBeGreaterThan(complex.score);
    expect(passphrase.entropy).toBeGreaterThan(complex.entropy);
  });

  it('penalizes user supplied context words', () => {
    const withoutContext = analyzePassword('iqverse-tools-99');
    const withContext = analyzePassword('iqverse-tools-99', ['iqverse']);
    expect(withContext.entropy).toBeLessThan(withoutContext.entropy);
  });

  it('suggests a longer password below 12 characters', () => {
    const analysis = analyzePassword('Ab3$xY7q');
    expect(analysis.suggestions[0]).toContain('12 characters');
  });

  it('handles empty input', () => {
    const analysis = analyzePassword('');
    expect(analysis.score).toBe(0);
    expect(analysis.rating).toBe('Very Weak');
    expect(analysis.entropy).toBe(0);
    expect(analysis.length).toBe(0);
    expect(analysis.patterns).toHaveLength(0);
  });

  it('reports character sets in use', () => {
    expect(getCharacterSets('abc')).toEqual({
      hasLower: true,
      hasUpper: false,
      hasDigit: false,
      hasSymbol: false,
      charsetSize: 26,
    });
    expect(getCharacterSets('Abc1!').charsetSize).toBe(95);
    expect(getCharacterSets('').charsetSize).toBe(0);
  });
});
