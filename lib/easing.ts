export interface BezierPoints {
  p1x: number;
  p1y: number;
  p2x: number;
  p2y: number;
}

export interface EasingPreset {
  name: string;
  points: BezierPoints;
  group: 'CSS keyword' | 'Sine' | 'Quad' | 'Cubic' | 'Expo' | 'Back';
}

export const EASING_PRESETS: EasingPreset[] = [
  { name: 'linear', group: 'CSS keyword', points: { p1x: 0, p1y: 0, p2x: 1, p2y: 1 } },
  { name: 'ease', group: 'CSS keyword', points: { p1x: 0.25, p1y: 0.1, p2x: 0.25, p2y: 1 } },
  { name: 'ease-in', group: 'CSS keyword', points: { p1x: 0.42, p1y: 0, p2x: 1, p2y: 1 } },
  { name: 'ease-out', group: 'CSS keyword', points: { p1x: 0, p1y: 0, p2x: 0.58, p2y: 1 } },
  { name: 'ease-in-out', group: 'CSS keyword', points: { p1x: 0.42, p1y: 0, p2x: 0.58, p2y: 1 } },

  { name: 'easeInSine', group: 'Sine', points: { p1x: 0.12, p1y: 0, p2x: 0.39, p2y: 0 } },
  { name: 'easeOutSine', group: 'Sine', points: { p1x: 0.61, p1y: 1, p2x: 0.88, p2y: 1 } },
  { name: 'easeInOutSine', group: 'Sine', points: { p1x: 0.37, p1y: 0, p2x: 0.63, p2y: 1 } },

  { name: 'easeInQuad', group: 'Quad', points: { p1x: 0.11, p1y: 0, p2x: 0.5, p2y: 0 } },
  { name: 'easeOutQuad', group: 'Quad', points: { p1x: 0.5, p1y: 1, p2x: 0.89, p2y: 1 } },
  { name: 'easeInOutQuad', group: 'Quad', points: { p1x: 0.45, p1y: 0, p2x: 0.55, p2y: 1 } },

  { name: 'easeInCubic', group: 'Cubic', points: { p1x: 0.32, p1y: 0, p2x: 0.67, p2y: 0 } },
  { name: 'easeOutCubic', group: 'Cubic', points: { p1x: 0.33, p1y: 1, p2x: 0.68, p2y: 1 } },
  { name: 'easeInOutCubic', group: 'Cubic', points: { p1x: 0.65, p1y: 0, p2x: 0.35, p2y: 1 } },

  { name: 'easeInExpo', group: 'Expo', points: { p1x: 0.7, p1y: 0, p2x: 0.84, p2y: 0 } },
  { name: 'easeOutExpo', group: 'Expo', points: { p1x: 0.16, p1y: 1, p2x: 0.3, p2y: 1 } },
  { name: 'easeInOutExpo', group: 'Expo', points: { p1x: 0.87, p1y: 0, p2x: 0.13, p2y: 1 } },

  { name: 'easeInBack', group: 'Back', points: { p1x: 0.36, p1y: 0, p2x: 0.66, p2y: -0.56 } },
  { name: 'easeOutBack', group: 'Back', points: { p1x: 0.34, p1y: 1.56, p2x: 0.64, p2y: 1 } },
  { name: 'easeInOutBack', group: 'Back', points: { p1x: 0.68, p1y: -0.6, p2x: 0.32, p2y: 1.6 } },
];

const NEWTON_ITERATIONS = 8;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_EPSILON = 1e-7;
const SUBDIVISION_MAX_ITERATIONS = 20;

interface Coefficients {
  a: number;
  b: number;
  c: number;
}

function coefficients(p1: number, p2: number): Coefficients {
  const c = 3 * p1;
  const b = 3 * (p2 - p1) - c;
  return { a: 1 - c - b, b, c };
}

function sample({ a, b, c }: Coefficients, t: number): number {
  return ((a * t + b) * t + c) * t;
}

function slope({ a, b, c }: Coefficients, t: number): number {
  return (3 * a * t + 2 * b) * t + c;
}

function solveForT(x: number, cx: Coefficients): number {
  let t = x;

  for (let i = 0; i < NEWTON_ITERATIONS; i += 1) {
    const currentSlope = slope(cx, t);
    if (Math.abs(currentSlope) < NEWTON_MIN_SLOPE) break;
    t -= (sample(cx, t) - x) / currentSlope;
  }

  if (t >= 0 && t <= 1 && Math.abs(sample(cx, t) - x) < SUBDIVISION_EPSILON) return t;

  let low = 0;
  let high = 1;
  t = x;

  for (let i = 0; i < SUBDIVISION_MAX_ITERATIONS; i += 1) {
    const current = sample(cx, t);
    if (Math.abs(current - x) < SUBDIVISION_EPSILON) return t;
    if (current < x) low = t;
    else high = t;
    t = (low + high) / 2;
  }

  return t;
}

export function easingValue(points: BezierPoints, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const cx = coefficients(points.p1x, points.p2x);
  const cy = coefficients(points.p1y, points.p2y);
  return sample(cy, solveForT(x, cx));
}

export function sampleCurve(points: BezierPoints, steps = 100): Array<{ x: number; y: number }> {
  const safeSteps = Math.max(1, Math.floor(steps));
  const result: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= safeSteps; i += 1) {
    const x = i / safeSteps;
    result.push({ x, y: easingValue(points, x) });
  }

  return result;
}

function trimNumber(value: number): string {
  return String(Number(value.toFixed(4)));
}

export function formatCubicBezier(points: BezierPoints): string {
  const parts = [points.p1x, points.p1y, points.p2x, points.p2y].map(trimNumber);
  return `cubic-bezier(${parts.join(', ')})`;
}

export function parseCubicBezier(input: string): BezierPoints | null {
  const text = input.trim().toLowerCase();

  const preset = EASING_PRESETS.find(entry => entry.name.toLowerCase() === text);
  if (preset) return { ...preset.points };

  const match = /^cubic-bezier\(([^)]*)\)$/.exec(text);
  const body = match ? match[1] : text;
  const parts = body.split(',').map(part => part.trim());
  if (parts.length !== 4) return null;

  const numbers: number[] = [];
  for (const part of parts) {
    if (!/^-?\d*\.?\d+$/.test(part)) return null;
    numbers.push(Number(part));
  }

  const [p1x, p1y, p2x, p2y] = numbers;
  if (p1x < 0 || p1x > 1 || p2x < 0 || p2x > 1) return null;

  return { p1x, p1y, p2x, p2y };
}

export function clampControlPoints(points: BezierPoints): BezierPoints {
  return {
    p1x: Math.min(1, Math.max(0, points.p1x)),
    p1y: points.p1y,
    p2x: Math.min(1, Math.max(0, points.p2x)),
    p2y: points.p2y,
  };
}

export function matchPreset(points: BezierPoints): EasingPreset | null {
  return (
    EASING_PRESETS.find(
      entry =>
        Math.abs(entry.points.p1x - points.p1x) < 1e-6 &&
        Math.abs(entry.points.p1y - points.p1y) < 1e-6 &&
        Math.abs(entry.points.p2x - points.p2x) < 1e-6 &&
        Math.abs(entry.points.p2y - points.p2y) < 1e-6
    ) ?? null
  );
}

export function overshoots(points: BezierPoints): boolean {
  return sampleCurve(points, 60).some(point => point.y < -1e-6 || point.y > 1 + 1e-6);
}
