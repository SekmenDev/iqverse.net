export interface WcagCompliance {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
  uiComponent: boolean;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  } else if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const normalize = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function calculateContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const lum1 = relativeLuminance(rgb1);
  const lum2 = relativeLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function evaluateWcagCompliance(
  fgHexOrRatio: string | number,
  bgHex?: string
): WcagCompliance {
  let ratio = 1;
  if (typeof fgHexOrRatio === 'number') {
    ratio = Math.round(fgHexOrRatio * 100) / 100;
  } else if (typeof fgHexOrRatio === 'string' && bgHex) {
    ratio = Math.round(calculateContrastRatio(fgHexOrRatio, bgHex) * 100) / 100;
  } else if (typeof fgHexOrRatio === 'string') {
    const parsed = parseFloat(fgHexOrRatio);
    if (!isNaN(parsed)) ratio = Math.round(parsed * 100) / 100;
  }

  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3.0,
    aaaNormal: ratio >= 7.0,
    aaaLarge: ratio >= 4.5,
    uiComponent: ratio >= 3.0,
  };
}
