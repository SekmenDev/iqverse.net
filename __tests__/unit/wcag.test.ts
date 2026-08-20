import { describe, it, expect } from 'vitest';
import { calculateContrastRatio, evaluateWcagCompliance } from '@/lib/wcag';

describe('WCAG Contrast Engine (lib/wcag)', () => {
  it('calculates 21:1 contrast ratio for black on white', () => {
    const ratio = calculateContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 1);
  });

  it('calculates 1:1 contrast ratio for identical colors', () => {
    const ratio = calculateContrastRatio('#123456', '#123456');
    expect(ratio).toBeCloseTo(1, 1);
  });

  it('evaluates WCAG 2.1 AA and AAA compliance thresholds', () => {
    const highContrast = evaluateWcagCompliance('#000000', '#ffffff');
    expect(highContrast.aaNormal).toBe(true);
    expect(highContrast.aaLarge).toBe(true);
    expect(highContrast.aaaNormal).toBe(true);
    expect(highContrast.aaaLarge).toBe(true);

    const midContrast = evaluateWcagCompliance('#767676', '#ffffff');
    expect(midContrast.aaNormal).toBe(true);
    expect(midContrast.aaaNormal).toBe(false);
  });
});
