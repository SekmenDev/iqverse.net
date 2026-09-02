import { describe, it, expect } from 'vitest';
import {
  EASING_PRESETS,
  clampControlPoints,
  easingValue,
  formatCubicBezier,
  matchPreset,
  overshoots,
  parseCubicBezier,
  sampleCurve,
} from '@/lib/easing';

const LINEAR = { p1x: 0, p1y: 0, p2x: 1, p2y: 1 };
const EASE_IN = { p1x: 0.42, p1y: 0, p2x: 1, p2y: 1 };
const EASE_OUT = { p1x: 0, p1y: 0, p2x: 0.58, p2y: 1 };

describe('Easing Editor (lib/easing) - easingValue', () => {
  it('pins the endpoints', () => {
    expect(easingValue(EASE_IN, 0)).toBe(0);
    expect(easingValue(EASE_IN, 1)).toBe(1);
  });

  it('clamps input outside the 0..1 domain', () => {
    expect(easingValue(EASE_IN, -5)).toBe(0);
    expect(easingValue(EASE_IN, 5)).toBe(1);
  });

  it('maps linear to the identity curve', () => {
    [0.1, 0.25, 0.5, 0.75, 0.9].forEach(x => {
      expect(easingValue(LINEAR, x)).toBeCloseTo(x, 6);
    });
  });

  it('starts slow for ease-in and fast for ease-out', () => {
    expect(easingValue(EASE_IN, 0.25)).toBeLessThan(0.25);
    expect(easingValue(EASE_OUT, 0.25)).toBeGreaterThan(0.25);
  });

  it('stays monotonic for curves without overshoot', () => {
    const values = sampleCurve(EASE_IN, 50).map(point => point.y);
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });

  it('matches the known midpoint of the CSS ease curve', () => {
    const ease = EASING_PRESETS.find(p => p.name === 'ease');
    expect(ease).toBeDefined();
    expect(easingValue(ease!.points, 0.5)).toBeCloseTo(0.8024, 3);
  });
});

describe('Easing Editor (lib/easing) - sampleCurve', () => {
  it('returns one more point than the step count', () => {
    expect(sampleCurve(EASE_IN, 10)).toHaveLength(11);
  });

  it('spaces samples evenly along x', () => {
    const points = sampleCurve(LINEAR, 4);
    expect(points.map(p => p.x)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('never returns an empty curve', () => {
    expect(sampleCurve(EASE_IN, 0).length).toBeGreaterThan(0);
    expect(sampleCurve(EASE_IN, -10).length).toBeGreaterThan(0);
  });
});

describe('Easing Editor (lib/easing) - formatting', () => {
  it('renders CSS cubic-bezier notation', () => {
    expect(formatCubicBezier(EASE_IN)).toBe('cubic-bezier(0.42, 0, 1, 1)');
  });

  it('trims floating point noise', () => {
    expect(formatCubicBezier({ p1x: 0.1 + 0.2, p1y: 0, p2x: 1, p2y: 1 })).toBe(
      'cubic-bezier(0.3, 0, 1, 1)'
    );
  });
});

describe('Easing Editor (lib/easing) - parseCubicBezier', () => {
  it('parses full cubic-bezier notation', () => {
    expect(parseCubicBezier('cubic-bezier(0.42, 0, 0.58, 1)')).toEqual({
      p1x: 0.42,
      p1y: 0,
      p2x: 0.58,
      p2y: 1,
    });
  });

  it('parses a bare comma-separated list', () => {
    expect(parseCubicBezier('0.42,0,0.58,1')).toEqual({ p1x: 0.42, p1y: 0, p2x: 0.58, p2y: 1 });
  });

  it('resolves CSS keywords and preset names', () => {
    expect(parseCubicBezier('ease-in-out')).toEqual({ p1x: 0.42, p1y: 0, p2x: 0.58, p2y: 1 });
    expect(parseCubicBezier('easeOutBack')).toEqual({ p1x: 0.34, p1y: 1.56, p2x: 0.64, p2y: 1 });
  });

  it('accepts y values outside 0..1 for overshoot curves', () => {
    expect(parseCubicBezier('cubic-bezier(0.34, 1.56, 0.64, 1)')).not.toBeNull();
    expect(parseCubicBezier('cubic-bezier(0.36, 0, 0.66, -0.56)')).not.toBeNull();
  });

  it('rejects x values outside 0..1, which CSS does not allow', () => {
    expect(parseCubicBezier('cubic-bezier(1.5, 0, 0.5, 1)')).toBeNull();
    expect(parseCubicBezier('cubic-bezier(0.5, 0, -0.2, 1)')).toBeNull();
  });

  it('rejects malformed input', () => {
    expect(parseCubicBezier('')).toBeNull();
    expect(parseCubicBezier('cubic-bezier(0.42, 0, 0.58)')).toBeNull();
    expect(parseCubicBezier('cubic-bezier(a, b, c, d)')).toBeNull();
  });

  it('round-trips through formatCubicBezier', () => {
    EASING_PRESETS.forEach(preset => {
      expect(parseCubicBezier(formatCubicBezier(preset.points))).toEqual(preset.points);
    });
  });
});

describe('Easing Editor (lib/easing) - helpers', () => {
  it('clamps control point x but leaves y free', () => {
    const clamped = clampControlPoints({ p1x: -0.5, p1y: -2, p2x: 1.8, p2y: 3 });
    expect(clamped).toEqual({ p1x: 0, p1y: -2, p2x: 1, p2y: 3 });
  });

  it('identifies a curve that matches a preset', () => {
    expect(matchPreset(EASE_IN)?.name).toBe('ease-in');
    expect(matchPreset({ p1x: 0.11, p1y: 0.22, p2x: 0.33, p2y: 0.44 })).toBeNull();
  });

  it('detects curves that leave the 0..1 range', () => {
    expect(overshoots({ p1x: 0.34, p1y: 1.56, p2x: 0.64, p2y: 1 })).toBe(true);
    expect(overshoots({ p1x: 0.36, p1y: 0, p2x: 0.66, p2y: -0.56 })).toBe(true);
    expect(overshoots(EASE_IN)).toBe(false);
    expect(overshoots(LINEAR)).toBe(false);
  });

  it('gives every preset a unique name and valid x range', () => {
    const names = EASING_PRESETS.map(p => p.name);
    expect(new Set(names).size).toBe(names.length);

    EASING_PRESETS.forEach(({ points }) => {
      expect(points.p1x).toBeGreaterThanOrEqual(0);
      expect(points.p1x).toBeLessThanOrEqual(1);
      expect(points.p2x).toBeGreaterThanOrEqual(0);
      expect(points.p2x).toBeLessThanOrEqual(1);
    });
  });
});
