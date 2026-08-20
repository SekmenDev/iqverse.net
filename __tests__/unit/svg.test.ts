import { describe, it, expect } from 'vitest';
import { optimizeSvgCode, calculateSvgSavings } from '@/lib/svg';

describe('SVG Optimizer Engine (lib/svg)', () => {
  it('removes XML prolog, doctype, comments, and extra whitespace', () => {
    const rawSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generator: Adobe Illustrator -->
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>`;

    const optimized = optimizeSvgCode(rawSvg, {
      removeComments: true,
      removeMetadata: true,
      minifyWhitespace: true,
      removeDimensions: false,
    });

    expect(optimized).not.toContain('<?xml');
    expect(optimized).not.toContain('<!DOCTYPE');
    expect(optimized).not.toContain('Adobe Illustrator');
    expect(optimized).toContain('<circle cx="50" cy="50" r="40" fill="red"');
  });

  it('calculates byte savings correctly', () => {
    const orig = 'a'.repeat(1000);
    const opt = 'a'.repeat(400);
    const savings = calculateSvgSavings(orig, opt);

    expect(savings.origSize).toBe(1000);
    expect(savings.optSize).toBe(400);
    expect(savings.savedBytes).toBe(600);
    expect(savings.savedPercent).toBe(60);
  });
});
