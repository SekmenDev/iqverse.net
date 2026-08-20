export type CssUnit = 'px' | 'rem' | 'em' | 'vh' | 'vw' | '%';

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface CssUnitConversions {
  px: string;
  rem: string;
  em: string;
  vh: string;
  vw: string;
  percent: string;
  '%': string;
}

function cleanNum(num: number, maxDecimals: number = 4): string {
  const rounded = Number(num.toFixed(maxDecimals));
  return String(rounded);
}

export function convertCssUnit(
  value: number,
  fromUnit: CssUnit,
  arg3?: CssUnit | number,
  arg4?: number | ViewportDimensions,
  arg5?: number,
  arg6?: number
): any {
  let rootFontSize = 16;
  let viewportWidth = 1920;
  let viewportHeight = 1080;

  if (typeof arg3 === 'number') {
    rootFontSize = arg3;
    if (typeof arg4 === 'number') viewportWidth = arg4;
    else if (typeof arg4 === 'object') {
      viewportWidth = arg4.width;
      viewportHeight = arg4.height;
    }
    if (typeof arg5 === 'number') viewportHeight = arg5;

    // Return conversions object
    let pxVal = value;
    if (fromUnit === 'rem' || fromUnit === 'em') pxVal = value * rootFontSize;
    else if (fromUnit === 'vh') pxVal = value * (viewportHeight / 100);
    else if (fromUnit === 'vw') pxVal = value * (viewportWidth / 100);
    else if (fromUnit === '%') pxVal = value * 0.01 * rootFontSize;

    const remVal = pxVal / rootFontSize;
    const emVal = pxVal / rootFontSize;
    const vhVal = (pxVal / viewportHeight) * 100;
    const vwVal = (pxVal / viewportWidth) * 100;
    const pctVal = (pxVal / rootFontSize) * 100;

    return {
      px: `${cleanNum(pxVal)}px`,
      rem: `${cleanNum(remVal)}rem`,
      em: `${cleanNum(emVal)}em`,
      vh: `${cleanNum(vhVal)}vh`,
      vw: `${cleanNum(vwVal)}vw`,
      percent: `${cleanNum(pctVal)}%`,
      '%': `${cleanNum(pctVal)}%`,
    };
  }

  const toUnit = arg3 as CssUnit;
  if (typeof arg4 === 'number') rootFontSize = arg4;
  else if (typeof arg4 === 'object') {
    viewportWidth = arg4.width;
    viewportHeight = arg4.height;
  }
  if (typeof arg5 === 'number') viewportWidth = arg5;
  if (typeof arg6 === 'number') viewportHeight = arg6;

  let toPx = value;
  if (fromUnit === 'rem' || fromUnit === 'em') toPx = value * rootFontSize;
  else if (fromUnit === 'vh') toPx = value * (viewportHeight / 100);
  else if (fromUnit === 'vw') toPx = value * (viewportWidth / 100);
  else if (fromUnit === '%') toPx = value * 0.01 * rootFontSize;

  if (toUnit === 'rem' || toUnit === 'em') return toPx / rootFontSize;
  if (toUnit === 'vh') return (toPx / viewportHeight) * 100;
  if (toUnit === 'vw') return (toPx / viewportWidth) * 100;
  if (toUnit === '%') return (toPx / rootFontSize) * 100;
  return toPx;
}

export interface ClampConfig {
  minFontSize?: number;
  minPx?: number;
  maxFontSize?: number;
  maxPx?: number;
  minViewport?: number;
  minVw?: number;
  maxViewport?: number;
  maxVw?: number;
  rootFontSize?: number;
}

export function generateClampFormula(
  arg1: number | ClampConfig,
  arg2?: number,
  arg3?: number,
  arg4?: number,
  arg5?: number
): string {
  let minPx = 16;
  let maxPx = 24;
  let minVw = 360;
  let maxVw = 1200;
  let rootFontSize = 16;

  if (typeof arg1 === 'object') {
    minPx = arg1.minFontSize ?? arg1.minPx ?? 16;
    maxPx = arg1.maxFontSize ?? arg1.maxPx ?? 24;
    minVw = arg1.minViewport ?? arg1.minVw ?? 360;
    maxVw = arg1.maxViewport ?? arg1.maxVw ?? 1200;
    rootFontSize = arg1.rootFontSize ?? 16;
  } else {
    minPx = arg1;
    if (typeof arg2 === 'number') maxPx = arg2;
    if (typeof arg3 === 'number') minVw = arg3;
    if (typeof arg4 === 'number') maxVw = arg4;
    if (typeof arg5 === 'number') rootFontSize = arg5;
  }

  const minRem = cleanNum(minPx / rootFontSize);
  const maxRem = cleanNum(maxPx / rootFontSize);
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const yAxisIntersection = -minVw * slope + minPx;
  const preferredVw = cleanNum(slope * 100);
  const preferredRem = cleanNum(yAxisIntersection / rootFontSize);

  return `clamp(${minRem}rem, ${preferredRem}rem + ${preferredVw}vw, ${maxRem}rem)`;
}
