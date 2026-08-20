import { describe, it, expect } from 'vitest';
import { generatePassword } from '@/lib/password';

describe('Password Generator Engine (lib/password)', () => {
  it('generates random password with specified length', () => {
    const pwd = generatePassword({
      length: 24,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    expect(pwd).toHaveLength(24);
  });

  it('excludes ambiguous characters when requested', () => {
    for (let i = 0; i < 20; i++) {
      const pwd = generatePassword({
        length: 32,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
        excludeAmbiguous: true,
      });
      expect(pwd).not.toMatch(/[O0I1l|]/);
    }
  });

  it('handles single character set requirement', () => {
    const pwd = generatePassword({
      length: 10,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
    });
    expect(pwd).toMatch(/^[0-9]+$/);
  });
});
