import { describe, it, expect } from 'vitest';
import { buildCssGradient, generateGradientCssRule } from '@/lib/gradient';

describe('Gradient Builder Engine (lib/gradient)', () => {
  const stops = [
    { color: '#ff0000', stop: 0 },
    { color: '#00ff00', stop: 50 },
    { color: '#0000ff', stop: 100 },
  ];

  it('builds linear gradient CSS expression and rule', () => {
    const expr = buildCssGradient('linear', stops, 90);
    expect(expr).toBe('linear-gradient(90deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)');

    const rule = generateGradientCssRule('linear', stops, 90);
    expect(rule).toBe('background: linear-gradient(90deg, #ff0000 0%, #00ff00 50%, #0000ff 100%);');
  });

  it('builds radial and conic gradient CSS expressions', () => {
    const radial = buildCssGradient('radial', stops);
    expect(radial).toBe('radial-gradient(circle at center, #ff0000 0%, #00ff00 50%, #0000ff 100%)');

    const conic = buildCssGradient('conic', stops, 45);
    expect(conic).toBe('conic-gradient(from 45deg at 50% 50%, #ff0000 0%, #00ff00 50%, #0000ff 100%)');
  });
});
