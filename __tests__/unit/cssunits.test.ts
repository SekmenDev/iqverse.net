import { describe, it, expect } from 'vitest';
import { convertCssUnit, generateClampFormula } from '@/lib/cssunits';

describe('CSS Units Engine (lib/cssunits)', () => {
  it('converts px to rem, em, %, vh, vw accurately', () => {
    const res = convertCssUnit(16, 'px', 16, 1920, 1080);
    expect(res.rem).toBe('1rem');
    expect(res.em).toBe('1em');
    expect(res.px).toBe('16px');
    expect(res.percent).toBe('100%');
  });

  it('converts rem to px accurately', () => {
    const res = convertCssUnit(2, 'rem', 16, 1920, 1080);
    expect(res.px).toBe('32px');
    expect(res.em).toBe('2em');
  });

  it('generates fluid typography clamp() formula', () => {
    const clamp = generateClampFormula({
      minFontSize: 16,
      maxFontSize: 24,
      minViewport: 320,
      maxViewport: 1200,
      rootFontSize: 16,
    });

    expect(clamp).toContain('clamp(');
    expect(clamp).toContain('1rem');
    expect(clamp).toContain('1.5rem');
    expect(clamp).toContain('vw');
  });
});
