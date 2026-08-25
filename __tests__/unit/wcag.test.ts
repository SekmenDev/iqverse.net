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

  describe('Theme Color Tokens Accessibility (WCAG AA >= 4.5:1)', () => {
    const darkBg = '#0C0E14';
    const darkSurface = '#13161F';
    const darkCard = '#171B27';

    it('validates dark theme foreground colors on dark background', () => {
      const darkColors = {
        text: '#E8ECF4',
        textDark: '#A0A0A0',
        textMuted: '#8A95B2',
        muted: '#94A3B8',
        accent: '#818CF8',
        green: '#34D399',
        yellow: '#FBBF24',
        red: '#F87171',
      };

      Object.entries(darkColors).forEach(([name, color]) => {
        const result = evaluateWcagCompliance(color, darkBg);
        expect(result.aaNormal, `${name} (${color}) on ${darkBg} failed with ratio ${result.ratio}:1`).toBe(true);
      });
    });

    it('validates dark theme muted color on dark surface and card', () => {
      const muted = '#94A3B8';
      expect(evaluateWcagCompliance(muted, darkSurface).aaNormal).toBe(true);
      expect(evaluateWcagCompliance(muted, darkCard).aaNormal).toBe(true);
    });

    it('validates light theme foreground colors on light background and surface', () => {
      const lightBg = '#F8FAFC';
      const lightSurface = '#FFFFFF';
      const lightColors = {
        text: '#0F172A',
        textDark: '#334155',
        textMuted: '#475569',
        muted: '#475569',
        accent: '#4F46E5',
        accentDark: '#4338CA',
        green: '#047857',
        yellow: '#B45309',
        red: '#DC2626',
      };

      Object.entries(lightColors).forEach(([name, color]) => {
        const bgResult = evaluateWcagCompliance(color, lightBg);
        expect(bgResult.aaNormal, `${name} (${color}) on ${lightBg} failed with ratio ${bgResult.ratio}:1`).toBe(true);

        const surfResult = evaluateWcagCompliance(color, lightSurface);
        expect(surfResult.aaNormal, `${name} (${color}) on ${lightSurface} failed with ratio ${surfResult.ratio}:1`).toBe(true);
      });
    });
  });
});
