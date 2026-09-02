import { clamp, hexToRgb } from './colors';

export interface ShadowLayer {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export interface ShadowPreset {
  name: string;
  layers: ShadowLayer[];
}

export function createLayer(overrides: Partial<ShadowLayer> = {}): ShadowLayer {
  return {
    offsetX: 0,
    offsetY: 4,
    blur: 12,
    spread: 0,
    color: '#000000',
    opacity: 0.25,
    inset: false,
    ...overrides,
  };
}

function shadowColor(layer: ShadowLayer): string {
  const { r, g, b } = hexToRgb(layer.color);
  const alpha = Number(clamp(layer.opacity, 0, 1).toFixed(3));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatShadowLayer(layer: ShadowLayer): string {
  const parts = [
    `${layer.offsetX}px`,
    `${layer.offsetY}px`,
    `${layer.blur}px`,
    `${layer.spread}px`,
    shadowColor(layer),
  ];

  return `${layer.inset ? 'inset ' : ''}${parts.join(' ')}`;
}

export function formatBoxShadow(layers: ShadowLayer[]): string {
  if (layers.length === 0) return 'none';
  return layers.map(formatShadowLayer).join(', ');
}

export function formatBoxShadowCss(layers: ShadowLayer[], indent = '  '): string {
  if (layers.length <= 1) return `box-shadow: ${formatBoxShadow(layers)};`;
  return `box-shadow:\n${layers.map(layer => `${indent}${formatShadowLayer(layer)}`).join(',\n')};`;
}

function splitLayers(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of value) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;

    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function toHexAndOpacity(token: string): { color: string; opacity: number } | null {
  const rgba = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(token);

  if (rgba) {
    const channels = [rgba[1], rgba[2], rgba[3]].map(part => clamp(Math.round(Number(part)), 0, 255));
    const rawAlpha = rgba[4];
    const opacity = rawAlpha === undefined
      ? 1
      : clamp(rawAlpha.endsWith('%') ? Number(rawAlpha.slice(0, -1)) / 100 : Number(rawAlpha), 0, 1);

    const hex = `#${channels.map(value => value.toString(16).padStart(2, '0')).join('')}`;
    return { color: hex, opacity };
  }

  const hex3 = /^#([0-9a-f]{3})$/i.exec(token);
  if (hex3) {
    const expanded = hex3[1]
      .split('')
      .map(char => char + char)
      .join('');
    return { color: `#${expanded.toLowerCase()}`, opacity: 1 };
  }

  const hex6 = /^#([0-9a-f]{6})$/i.exec(token);
  if (hex6) return { color: `#${hex6[1].toLowerCase()}`, opacity: 1 };

  const hex8 = /^#([0-9a-f]{6})([0-9a-f]{2})$/i.exec(token);
  if (hex8) {
    return { color: `#${hex8[1].toLowerCase()}`, opacity: Number((parseInt(hex8[2], 16) / 255).toFixed(3)) };
  }

  if (token.toLowerCase() === 'black') return { color: '#000000', opacity: 1 };
  if (token.toLowerCase() === 'white') return { color: '#ffffff', opacity: 1 };

  return null;
}

function parseLength(token: string): number | null {
  const match = /^(-?[\d.]+)(px|rem|em)?$/i.exec(token);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;

  const unit = (match[2] ?? 'px').toLowerCase();
  return unit === 'px' ? value : value * 16;
}

function parseLayer(value: string): ShadowLayer | null {
  const tokens = value
    .replace(/\s*,\s*/g, ',')
    .match(/(?:rgba?\([^)]*\))|[^\s]+/g);

  if (!tokens) return null;

  const inset = tokens.some(token => token.toLowerCase() === 'inset');
  const rest = tokens.filter(token => token.toLowerCase() !== 'inset');

  const lengths: number[] = [];
  let color: { color: string; opacity: number } | null = null;

  for (const token of rest) {
    const length = parseLength(token);
    if (length !== null && color === null) {
      lengths.push(length);
      continue;
    }

    const parsed = toHexAndOpacity(token);
    if (!parsed) return null;
    if (color) return null;
    color = parsed;
  }

  if (lengths.length < 2 || lengths.length > 4) return null;

  return createLayer({
    offsetX: lengths[0],
    offsetY: lengths[1],
    blur: lengths[2] ?? 0,
    spread: lengths[3] ?? 0,
    color: color?.color ?? '#000000',
    opacity: color?.opacity ?? 1,
    inset,
  });
}

export function parseBoxShadow(css: string): ShadowLayer[] | null {
  const text = css
    .replace(/^\s*box-shadow\s*:/i, '')
    .replace(/;\s*$/, '')
    .trim();

  if (!text || text.toLowerCase() === 'none') return [];

  const layers: ShadowLayer[] = [];
  for (const part of splitLayers(text)) {
    const layer = parseLayer(part);
    if (!layer) return null;
    layers.push(layer);
  }

  return layers.length > 0 ? layers : null;
}

export const SHADOW_PRESETS: ShadowPreset[] = [
  {
    name: 'Subtle',
    layers: [createLayer({ offsetY: 1, blur: 2, opacity: 0.08 })],
  },
  {
    name: 'Card',
    layers: [
      createLayer({ offsetY: 1, blur: 3, opacity: 0.12 }),
      createLayer({ offsetY: 1, blur: 2, spread: -1, opacity: 0.08 }),
    ],
  },
  {
    name: 'Raised',
    layers: [
      createLayer({ offsetY: 4, blur: 6, spread: -1, opacity: 0.12 }),
      createLayer({ offsetY: 2, blur: 4, spread: -2, opacity: 0.1 }),
    ],
  },
  {
    name: 'Floating',
    layers: [
      createLayer({ offsetY: 10, blur: 15, spread: -3, opacity: 0.12 }),
      createLayer({ offsetY: 4, blur: 6, spread: -4, opacity: 0.1 }),
    ],
  },
  {
    name: 'Modal',
    layers: [
      createLayer({ offsetY: 25, blur: 50, spread: -12, opacity: 0.25 }),
    ],
  },
  {
    name: 'Inner',
    layers: [createLayer({ offsetY: 2, blur: 4, opacity: 0.1, inset: true })],
  },
  {
    name: 'Glow',
    layers: [createLayer({ offsetY: 0, blur: 20, spread: 2, color: '#6366f1', opacity: 0.45 })],
  },
  {
    name: 'Hard edge',
    layers: [createLayer({ offsetX: 4, offsetY: 4, blur: 0, opacity: 1 })],
  },
  {
    name: 'Stacked',
    layers: [
      createLayer({ offsetY: 2, blur: 0, spread: 0, opacity: 1, color: '#e5e7eb' }),
      createLayer({ offsetY: 4, blur: 0, spread: 0, opacity: 1, color: '#d1d5db' }),
      createLayer({ offsetY: 6, blur: 0, spread: 0, opacity: 1, color: '#9ca3af' }),
    ],
  },
];
