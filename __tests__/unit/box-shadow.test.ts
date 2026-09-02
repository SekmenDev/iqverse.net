import { describe, it, expect } from 'vitest';
import {
  SHADOW_PRESETS,
  createLayer,
  formatBoxShadow,
  formatBoxShadowCss,
  formatShadowLayer,
  parseBoxShadow,
} from '@/lib/box-shadow';

describe('Box Shadow Builder (lib/box-shadow) - formatting', () => {
  it('renders a single layer as CSS', () => {
    const layer = createLayer({ offsetX: 0, offsetY: 4, blur: 12, spread: 0, opacity: 0.25 });
    expect(formatShadowLayer(layer)).toBe('0px 4px 12px 0px rgba(0, 0, 0, 0.25)');
  });

  it('prefixes inset layers', () => {
    const layer = createLayer({ offsetY: 2, blur: 4, opacity: 0.1, inset: true });
    expect(formatShadowLayer(layer)).toBe('inset 0px 2px 4px 0px rgba(0, 0, 0, 0.1)');
  });

  it('honours negative offsets and spread', () => {
    const layer = createLayer({ offsetX: -6, offsetY: -8, blur: 10, spread: -3, opacity: 1 });
    expect(formatShadowLayer(layer)).toBe('-6px -8px 10px -3px rgba(0, 0, 0, 1)');
  });

  it('converts the layer colour to rgba', () => {
    const layer = createLayer({ color: '#6366f1', opacity: 0.45 });
    expect(formatShadowLayer(layer)).toContain('rgba(99, 102, 241, 0.45)');
  });

  it('clamps opacity into the 0..1 range', () => {
    expect(formatShadowLayer(createLayer({ opacity: 5 }))).toContain('rgba(0, 0, 0, 1)');
    expect(formatShadowLayer(createLayer({ opacity: -2 }))).toContain('rgba(0, 0, 0, 0)');
  });

  it('joins multiple layers with commas', () => {
    const layers = [createLayer({ offsetY: 1, blur: 2 }), createLayer({ offsetY: 4, blur: 8 })];
    expect(formatBoxShadow(layers).split('), ').length).toBe(2);
  });

  it('renders none for an empty stack', () => {
    expect(formatBoxShadow([])).toBe('none');
    expect(formatBoxShadowCss([])).toBe('box-shadow: none;');
  });

  it('keeps a single layer on one line and breaks multiple layers', () => {
    expect(formatBoxShadowCss([createLayer()])).not.toContain('\n');
    expect(formatBoxShadowCss([createLayer(), createLayer()])).toContain('\n');
  });
});

describe('Box Shadow Builder (lib/box-shadow) - parseBoxShadow', () => {
  it('parses a four-length layer with rgba', () => {
    const layers = parseBoxShadow('0px 4px 12px 0px rgba(0, 0, 0, 0.25)');
    expect(layers).toEqual([
      createLayer({ offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: '#000000', opacity: 0.25 }),
    ]);
  });

  it('accepts a leading property name and trailing semicolon', () => {
    expect(parseBoxShadow('box-shadow: 0 2px 4px #000;')).toHaveLength(1);
  });

  it('defaults blur and spread when omitted', () => {
    const layers = parseBoxShadow('2px 3px #000000');
    expect(layers?.[0].blur).toBe(0);
    expect(layers?.[0].spread).toBe(0);
  });

  it('parses the inset keyword in any position', () => {
    expect(parseBoxShadow('inset 0 2px 4px #000')?.[0].inset).toBe(true);
    expect(parseBoxShadow('0 2px 4px #000 inset')?.[0].inset).toBe(true);
    expect(parseBoxShadow('0 2px 4px #000')?.[0].inset).toBe(false);
  });

  it('splits multiple layers without breaking on commas inside rgba', () => {
    const layers = parseBoxShadow('0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)');
    expect(layers).toHaveLength(2);
    expect(layers?.[1].opacity).toBeCloseTo(0.08, 3);
  });

  it('expands shorthand hex and reads 8-digit hex alpha', () => {
    expect(parseBoxShadow('0 0 4px #f00')?.[0].color).toBe('#ff0000');

    const withAlpha = parseBoxShadow('0 0 4px #00000080');
    expect(withAlpha?.[0].color).toBe('#000000');
    expect(withAlpha?.[0].opacity).toBeCloseTo(0.502, 2);
  });

  it('converts rem and em lengths to pixels', () => {
    const layers = parseBoxShadow('0 1rem 0.5em 0 #000');
    expect(layers?.[0].offsetY).toBe(16);
    expect(layers?.[0].blur).toBe(8);
  });

  it('treats none as an empty stack', () => {
    expect(parseBoxShadow('none')).toEqual([]);
    expect(parseBoxShadow('box-shadow: none;')).toEqual([]);
  });

  it('rejects malformed values', () => {
    expect(parseBoxShadow('0px')).toBeNull();
    expect(parseBoxShadow('0 1px 2px 3px 4px #000')).toBeNull();
    expect(parseBoxShadow('0 2px 4px notacolor')).toBeNull();
    expect(parseBoxShadow('0 2px 4px #000 #fff')).toBeNull();
  });

  it('round-trips every preset', () => {
    SHADOW_PRESETS.forEach(preset => {
      const css = formatBoxShadow(preset.layers);
      expect(parseBoxShadow(css)).toEqual(preset.layers);
    });
  });
});

describe('Box Shadow Builder (lib/box-shadow) - presets', () => {
  it('names every preset uniquely', () => {
    const names = SHADOW_PRESETS.map(p => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every preset at least one layer', () => {
    SHADOW_PRESETS.forEach(preset => expect(preset.layers.length).toBeGreaterThan(0));
  });
});
