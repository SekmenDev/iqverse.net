export const COMMON_BASES = [2, 8, 10, 16, 36] as const;

export const BIT_WIDTHS = [8, 16, 32, 64] as const;

export type BitWidth = (typeof BIT_WIDTHS)[number];

export interface DetectedInput {
  base: number;
  digits: string;
  negative: boolean;
}

export interface WidthView {
  width: BitWidth;
  fits: boolean;
  binary: string;
  hex: string;
  signed: string;
  unsigned: string;
}

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

const PREFIXES: Array<{ prefix: string; base: number }> = [
  { prefix: '0x', base: 16 },
  { prefix: '0b', base: 2 },
  { prefix: '0o', base: 8 },
];

export function isValidBase(base: number): boolean {
  return Number.isInteger(base) && base >= 2 && base <= 36;
}

function clean(text: string): string {
  return text.trim().replace(/[_\s,]/g, '');
}

export function detectBase(text: string): DetectedInput | null {
  let body = clean(text);
  if (!body) return null;

  const negative = body.startsWith('-');
  if (negative || body.startsWith('+')) body = body.slice(1);
  if (!body) return null;

  const lower = body.toLowerCase();
  for (const { prefix, base } of PREFIXES) {
    if (lower.startsWith(prefix)) {
      const digits = body.slice(prefix.length);
      return digits ? { base, digits, negative } : null;
    }
  }

  return { base: 10, digits: body, negative };
}

export function parseInBase(text: string, base: number): bigint | null {
  if (!isValidBase(base)) return null;

  let body = clean(text);
  if (!body) return null;

  const negative = body.startsWith('-');
  if (negative || body.startsWith('+')) body = body.slice(1);
  if (!body) return null;

  const alphabet = DIGITS.slice(0, base);
  let value = 0n;
  const radix = BigInt(base);

  for (const char of body.toLowerCase()) {
    const digit = alphabet.indexOf(char);
    if (digit === -1) return null;
    value = value * radix + BigInt(digit);
  }

  return negative ? -value : value;
}

export function parseAuto(text: string): bigint | null {
  const detected = detectBase(text);
  if (!detected) return null;

  const value = parseInBase(detected.digits, detected.base);
  if (value === null) return null;

  return detected.negative ? -value : value;
}

export function groupDigits(text: string, size: number, separator = ' '): string {
  if (size <= 0 || text.length <= size) return text;

  const negative = text.startsWith('-');
  const body = negative ? text.slice(1) : text;
  const groups: string[] = [];

  for (let end = body.length; end > 0; end -= size) {
    groups.unshift(body.slice(Math.max(0, end - size), end));
  }

  return `${negative ? '-' : ''}${groups.join(separator)}`;
}

export function formatInBase(value: bigint, base: number, uppercase = false): string {
  if (!isValidBase(base)) return '';
  const text = value.toString(base);
  return uppercase ? text.toUpperCase() : text;
}

export function convertAll(value: bigint, uppercase = false): Record<number, string> {
  const result: Record<number, string> = {};
  for (const base of COMMON_BASES) {
    result[base] = formatInBase(value, base, uppercase);
  }
  return result;
}

export function bitLength(value: bigint): number {
  const magnitude = value < 0n ? -value : value;
  return magnitude === 0n ? 0 : magnitude.toString(2).length;
}

export function widthView(value: bigint, width: BitWidth): WidthView {
  const bits = BigInt(width);
  const span = 1n << bits;
  const signedMin = -(1n << (bits - 1n));
  const signedMax = (1n << (bits - 1n)) - 1n;
  const unsignedMax = span - 1n;

  const fits = value < 0n ? value >= signedMin : value <= unsignedMax;

  if (!fits) {
    return { width, fits: false, binary: '', hex: '', signed: '', unsigned: '' };
  }

  const pattern = value < 0n ? span + value : value;
  const binary = pattern.toString(2).padStart(width, '0');
  const hex = pattern.toString(16).padStart(width / 4, '0').toUpperCase();
  const signed = pattern > signedMax ? pattern - span : pattern;

  return {
    width,
    fits: true,
    binary,
    hex,
    signed: signed.toString(),
    unsigned: pattern.toString(),
  };
}

export function allWidthViews(value: bigint): WidthView[] {
  return BIT_WIDTHS.map(width => widthView(value, width));
}

export function toggleBit(value: bigint, index: number, width: BitWidth): bigint {
  const bits = BigInt(width);
  const span = 1n << bits;
  const pattern = value < 0n ? span + value : value;
  const flipped = pattern ^ (1n << BigInt(index));

  // Keep a negative input negative by reading the result back as signed
  if (value < 0n) {
    const signedMax = (1n << (bits - 1n)) - 1n;
    return flipped > signedMax ? flipped - span : flipped;
  }

  return flipped;
}

export function baseLabel(base: number): string {
  const names: Record<number, string> = {
    2: 'Binary',
    8: 'Octal',
    10: 'Decimal',
    16: 'Hexadecimal',
    36: 'Base 36',
  };
  return names[base] ?? `Base ${base}`;
}

export function basePrefix(base: number): string {
  const prefixes: Record<number, string> = { 2: '0b', 8: '0o', 16: '0x' };
  return prefixes[base] ?? '';
}
