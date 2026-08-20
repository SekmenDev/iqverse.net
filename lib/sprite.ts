export interface SpriteIconItem {
  name: string;
}

export interface SpriteLayoutOptions {
  iconSize?: number;
  padding?: number;
  columns?: number;
}

export interface SpriteCoordinate {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteCalculationResult {
  cols: number;
  rows: number;
  canvasWidth: number;
  canvasHeight: number;
  coordinates: Record<string, SpriteCoordinate>;
  cssCode: string;
  css: string;
  jsonMapping: Record<string, SpriteCoordinate>;
}

export function calculateSpriteSheet(
  icons: (string | SpriteIconItem)[],
  arg2?: SpriteLayoutOptions | number,
  arg3?: number,
  arg4?: number
): SpriteCalculationResult {
  let iconSize = 32;
  let padding = 8;
  let columns = 4;

  if (typeof arg2 === 'object') {
    if (arg2.iconSize !== undefined) iconSize = arg2.iconSize;
    if (arg2.padding !== undefined) padding = arg2.padding;
    if (arg2.columns !== undefined) columns = arg2.columns;
  } else if (typeof arg2 === 'number') {
    iconSize = arg2;
    if (arg3 !== undefined) padding = arg3;
    if (arg4 !== undefined) columns = arg4;
  }

  const normalizedIcons: SpriteIconItem[] = icons.map((i) =>
    typeof i === 'string' ? { name: i } : i
  );
  const count = normalizedIcons.length;

  if (count === 0) {
    return {
      cols: 0,
      rows: 0,
      canvasWidth: 0,
      canvasHeight: 0,
      coordinates: {},
      cssCode: '',
      css: '',
      jsonMapping: {},
    };
  }

  const cols = Math.min(columns, count);
  const rows = Math.ceil(count / cols);
  const cellWidth = iconSize + padding * 2;
  const cellHeight = iconSize + padding * 2;

  const canvasWidth = cols * cellWidth;
  const canvasHeight = rows * cellHeight;

  let cssCode = `.sprite {\n  background-image: url('sprite.png');\n  background-repeat: no-repeat;\n  display: inline-block;\n}\n\n`;
  const coordinates: Record<string, SpriteCoordinate> = {};

  normalizedIcons.forEach((icon, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const x = col * cellWidth + padding;
    const y = row * cellHeight + padding;

    coordinates[icon.name] = {
      x,
      y,
      width: iconSize,
      height: iconSize,
    };

    cssCode += `.icon-${icon.name} {\n  width: ${iconSize}px;\n  height: ${iconSize}px;\n  background-position: -${x}px -${y}px;\n}\n\n`;
  });

  const finalCss = cssCode.trim();

  return {
    cols,
    rows,
    canvasWidth,
    canvasHeight,
    coordinates,
    cssCode: finalCss,
    css: finalCss,
    jsonMapping: coordinates,
  };
}
