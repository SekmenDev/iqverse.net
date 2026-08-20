export interface GradientColorStop {
  color: string;
  stop?: number;
  pos?: number;
}

export type ColorStop = GradientColorStop;
export type GradientType = 'linear' | 'radial' | 'conic';

export function buildCssGradient(
  type: GradientType,
  arg2: GradientColorStop[] | number,
  arg3?: GradientColorStop[] | number
): string {
  let angle = 135;
  let stops: GradientColorStop[] = [];

  if (Array.isArray(arg2)) {
    stops = arg2;
    if (typeof arg3 === 'number') angle = arg3;
  } else if (typeof arg2 === 'number') {
    angle = arg2;
    if (Array.isArray(arg3)) stops = arg3;
  }

  const sortedStops = [...stops].sort((a, b) => (a.stop ?? a.pos ?? 0) - (b.stop ?? b.pos ?? 0));
  const stopsStr = sortedStops.map((s) => `${s.color} ${s.stop ?? s.pos ?? 0}%`).join(', ');

  if (type === 'linear') {
    return `linear-gradient(${angle}deg, ${stopsStr})`;
  } else if (type === 'radial') {
    return `radial-gradient(circle at center, ${stopsStr})`;
  } else {
    return `conic-gradient(from ${angle}deg at 50% 50%, ${stopsStr})`;
  }
}

export function generateGradientCssRule(
  type: GradientType,
  arg2: GradientColorStop[] | number,
  arg3?: GradientColorStop[] | number
): string {
  const grad = buildCssGradient(type, arg2 as any, arg3 as any);
  return `background: ${grad};`;
}
