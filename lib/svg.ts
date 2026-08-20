export interface SvgOptimizerOptions {
  removeComments?: boolean;
  removeMetadata?: boolean;
  removeDoctype?: boolean;
  minifyWhitespace?: boolean;
  removeDimensions?: boolean;
}

export function optimizeSvgCode(
  svg: string,
  options: SvgOptimizerOptions = {}
): string {
  let res = svg;

  if (options.removeDoctype !== false) {
    res = res.replace(/<\?xml[^>]*\?>/gi, '').replace(/<!DOCTYPE[^>]*>/gi, '');
  }
  if (options.removeComments !== false) {
    res = res.replace(/<!--[\s\S]*?-->/g, '');
  }
  if (options.removeMetadata !== false) {
    res = res.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
  }

  res = res
    .replace(/\s*(enable-background|xml:space)="[^"]*"/gi, '')
    .replace(/\s*(x|y)="0(px)?"/gi, '');

  if (options.minifyWhitespace !== false) {
    res = res.replace(/>\s+</g, '><').trim();
  }

  return res;
}

export function calculateSvgSavings(raw: string, opt: string): {
  origSize: number;
  optSize: number;
  savedBytes: number;
  savedPercent: number;
} {
  const origSize = new TextEncoder().encode(raw).length;
  const optSize = new TextEncoder().encode(opt).length;
  const savedBytes = origSize - optSize;
  const savedPercent = origSize > 0 ? (savedBytes / origSize) * 100 : 0;

  return {
    origSize,
    optSize,
    savedBytes,
    savedPercent: Math.round(savedPercent * 10) / 10,
  };
}
