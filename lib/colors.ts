export type Shade = { hex: string; label: string; l: number };
export type PaletteGroup = { name: string; key: string; shades: Shade[] };

export const WCAG_THRESHOLDS: Record<string, number> = { A: 3, AA: 4.5, AAA: 7 };

export const CB_MATRICES: Record<string, number[]> = {
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
};

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;

  const n = parseInt(full, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((value) => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

export function applyLightnessCurve(t: number, curve: string): number {
  switch (curve) {
    case 'ease-in':
      return t * t;
    case 'ease-out':
      return 1 - (1 - t) * (1 - t);
    default:
      return t;
  }
}

export function getHarmonyHues(baseHue: number, harmony: string): number[] {
  switch (harmony) {
    case 'complementary':
      return [baseHue, (baseHue + 180) % 360];
    case 'triadic':
      return [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
    case 'analogous':
      return [baseHue, (baseHue + 30) % 360, (baseHue - 30 + 360) % 360];
    case 'split-complementary':
      return [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360];
    case 'tetradic':
      return [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];
    case 'monochromatic':
      return [baseHue];
    default:
      return [baseHue];
  }
}

export function getHarmonyNames(harmony: string): string[] {
  return {
    complementary: ['Primary', 'Accent'],
    triadic: ['Primary', 'Secondary', 'Tertiary'],
    analogous: ['Primary', 'Warm', 'Cool'],
    'split-complementary': ['Primary', 'Accent A', 'Accent B'],
    tetradic: ['Primary', 'Secondary', 'Tertiary', 'Quaternary'],
    monochromatic: ['Primary'],
  }[harmony] || ['Primary'];
}

export function generateShades(
  hex: string,
  count: number,
  opts: { curve: string; satBoost: number; hueRotate: number; lightnessShift: number }
): Shade[] {
  const { h, s } = hexToHsl(hex);
  const adjustedH = (h + opts.hueRotate + 360) % 360;
  const adjustedS = clamp(s + opts.satBoost, 0, 100);

  return Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0 : index / (count - 1);
    const lt = applyLightnessCurve(t, opts.curve);
    const l = clamp(95 - lt * 88 + opts.lightnessShift, 2, 98);
    return {
      hex: hslToHex(adjustedH, adjustedS, l),
      label: count === 10 ? String((index + 1) * 100) : String(Math.round(l)),
      l,
    };
  });
}

export function generatePalette(
  seedHex: string,
  harmony: string,
  shadesCount: number,
  curve: string,
  satBoost: number,
  hueRotate: number,
  lightnessShift: number,
  includeNeutrals: boolean,
  includeSemantic: boolean
): PaletteGroup[] {
  const { h, s, l } = hexToHsl(seedHex);
  const hues = getHarmonyHues(h, harmony);
  const names = getHarmonyNames(harmony);
  const opts = { curve, satBoost, hueRotate, lightnessShift };

  const groups: PaletteGroup[] = hues.map((hue, index) => {
    const baseHex = hslToHex(hue, s, l);
    return {
      name: names[index] || `Color ${index + 1}`,
      key: (names[index] || `color-${index + 1}`).toLowerCase().replace(/\s+/g, '-'),
      shades: generateShades(baseHex, shadesCount, opts),
    };
  });

  if (includeNeutrals) {
    const neutralHex = hslToHex(h, clamp(s * 0.08, 0, 15), 50);
    groups.push({
      name: 'Neutral',
      key: 'neutral',
      shades: generateShades(neutralHex, shadesCount, { ...opts, satBoost: 0 }),
    });
  }

  if (includeSemantic) {
    const semantics = [
      { name: 'Success', key: 'success', hex: '#10b981' },
      { name: 'Warning', key: 'warning', hex: '#f59e0b' },
      { name: 'Danger', key: 'danger', hex: '#ef4444' },
    ];
    semantics.forEach((sem) => {
      groups.push({
        name: sem.name,
        key: sem.key,
        shades: generateShades(sem.hex, shadesCount, opts),
      });
    });
  }

  return groups;
}

export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function wcagPass(ratio: number, level: string): boolean {
  return ratio >= (WCAG_THRESHOLDS[level] ?? 4.5);
}

export function simulateColorBlind(hex: string, mode: string): string {
  if (mode === 'none') return hex;
  const matrix = CB_MATRICES[mode];
  if (!matrix) return hex;
  const { r, g, b } = hexToRgb(hex);
  const sr = clamp(Math.round(r * matrix[0] + g * matrix[1] + b * matrix[2]), 0, 255);
  const sg = clamp(Math.round(r * matrix[3] + g * matrix[4] + b * matrix[5]), 0, 255);
  const sb = clamp(Math.round(r * matrix[6] + g * matrix[7] + b * matrix[8]), 0, 255);
  return rgbToHex(sr, sg, sb);
}

export function formatColor(hex: string, format: string): string {
  if (format === 'hex') return hex.toUpperCase();
  const { r, g, b } = hexToRgb(hex);
  if (format === 'rgb') return `rgb(${r}, ${g}, ${b})`;
  const { h, s, l } = rgbToHsl(r, g, b);
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

export function exportCSS(palette: PaletteGroup[], prefix: string, colorFormat: string): string {
  const lines = [':root {'];
  palette.forEach((group) => {
    lines.push(`  /* ${group.name} */`);
    group.shades.forEach((shade) => {
      lines.push(`  --${prefix}-${group.key}-${shade.label}: ${formatColor(shade.hex, colorFormat)};`);
    });
    lines.push('');
  });
  lines.push('}');
  return lines.join('\n');
}

export function exportSass(palette: PaletteGroup[], prefix: string, colorFormat: string): string {
  const lines: string[] = [];
  palette.forEach((group) => {
    lines.push(`// ${group.name}`);
    group.shades.forEach((shade) => {
      lines.push(`$${prefix}-${group.key}-${shade.label}: ${formatColor(shade.hex, colorFormat)};`);
    });
    lines.push('');
  });
  return lines.join('\n');
}

export function exportTailwind(palette: PaletteGroup[], prefix: string, colorFormat: string): string {
  const lines = ['// tailwind.config.js', 'module.exports = {', '  theme: {', '    extend: {', '      colors: {'];
  palette.forEach((group) => {
    lines.push(`        '${prefix}-${group.key}': {`);
    group.shades.forEach((shade) => {
      lines.push(`          '${shade.label}': '${formatColor(shade.hex, colorFormat)}',`);
    });
    lines.push('        },');
  });
  lines.push('      },', '    },', '  },', '};');
  return lines.join('\n');
}

export function exportFigma(palette: PaletteGroup[], prefix: string, colorFormat: string): string {
  const tokens: Record<string, Record<string, object>> = {};
  palette.forEach((group) => {
    tokens[group.key] = {};
    group.shades.forEach((shade) => {
      tokens[group.key][shade.label] = {
        value: formatColor(shade.hex, colorFormat),
        type: 'color',
        description: `${group.name} ${shade.label}`,
      };
    });
  });
  return JSON.stringify({ [prefix]: tokens }, null, 2);
}

export function exportJSON(palette: PaletteGroup[], prefix: string, colorFormat: string): string {
  const obj: Record<string, Record<string, string>> = {};
  palette.forEach((group) => {
    obj[group.key] = {};
    group.shades.forEach((shade) => {
      obj[group.key][shade.label] = formatColor(shade.hex, colorFormat);
    });
  });
  return JSON.stringify({ [prefix]: obj }, null, 2);
}

export function exportSwift(palette: PaletteGroup[], prefix: string): string {
  const lines: string[] = ['import UIKit', '', 'extension UIColor {', `  struct ${prefix.charAt(0).toUpperCase() + prefix.slice(1)} {`];
  palette.forEach((group) => {
    lines.push(`    struct ${group.key.charAt(0).toUpperCase() + group.key.slice(1)} {`);
    group.shades.forEach((shade) => {
      const { r, g, b } = hexToRgb(shade.hex);
      lines.push(
        `      static let shade${shade.label} = UIColor(red: ${(r / 255).toFixed(3)}, green: ${(g / 255).toFixed(3)}, blue: ${(b / 255).toFixed(3)}, alpha: 1.0)`,
      );
    });
    lines.push('    }');
  });
  lines.push('  }', '}');
  return lines.join('\n');
}
