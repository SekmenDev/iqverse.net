import { pickRandom, shuffle } from './random';

export const DEFAULT_SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';
export const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const LOWER = 'abcdefghijklmnopqrstuvwxyz';
export const DIGITS = '0123456789';
export const SIMILAR = '0Oo1IlL';
export const AMBIGUOUS = '{}[]()/\\\'"`~,;:.<>?';

export interface PasswordGeneratorOptions {
  length: number;
  useUpper?: boolean;
  uppercase?: boolean;
  useLower?: boolean;
  lowercase?: boolean;
  useDigits?: boolean;
  numbers?: boolean;
  useSymbols?: boolean;
  symbols?: boolean;
  excludeSimilar?: boolean;
  excludeAmbiguous?: boolean;
  customSymbols?: string;
  prefix?: string;
  suffix?: string;
  minUpper?: number;
  minLower?: number;
  minDigits?: number;
  minSymbols?: number;
}

export function buildCharacterPool(options: PasswordGeneratorOptions): string {
  const useUpper = options.uppercase !== undefined ? options.uppercase : (options.useUpper ?? true);
  const useLower = options.lowercase !== undefined ? options.lowercase : (options.useLower ?? true);
  const useDigits = options.numbers !== undefined ? options.numbers : (options.useDigits ?? true);
  const useSymbols = options.symbols !== undefined ? options.symbols : (options.useSymbols ?? true);

  let pool = '';
  if (useUpper) pool += UPPER;
  if (useLower) pool += LOWER;
  if (useDigits) pool += DIGITS;
  if (useSymbols) pool += options.customSymbols?.trim() || DEFAULT_SYMBOLS;

  if (options.excludeSimilar || options.excludeAmbiguous) {
    pool = [...pool].filter((char) => !SIMILAR.includes(char)).join('');
  }
  if (options.excludeAmbiguous) {
    pool = [...pool].filter((char) => !AMBIGUOUS.includes(char)).join('');
  }
  return pool;
}

export function generatePassword(options: PasswordGeneratorOptions): string {
  const useUpper = options.uppercase !== undefined ? options.uppercase : (options.useUpper ?? true);
  const useLower = options.lowercase !== undefined ? options.lowercase : (options.useLower ?? true);
  const useDigits = options.numbers !== undefined ? options.numbers : (options.useDigits ?? true);
  const useSymbols = options.symbols !== undefined ? options.symbols : (options.useSymbols ?? true);

  const {
    length = 20,
    prefix = '',
    suffix = '',
    minUpper = 0,
    minLower = 0,
    minDigits = 0,
    minSymbols = 0,
    customSymbols = '',
  } = options;

  if (!useUpper && !useLower && !useDigits && !useSymbols) {
    throw new Error('Select at least one character set.');
  }

  const pool = buildCharacterPool(options);
  if (!pool.length) {
    throw new Error('Character pool is empty after filters.');
  }

  const coreLength = length - prefix.length - suffix.length;
  if (coreLength < 1) {
    throw new Error('Length is too short for the selected prefix and suffix.');
  }

  const required: string[] = [];
  if (useUpper) {
    for (let i = 0; i < minUpper; i += 1) {
      const chars = [...UPPER].filter((char) => pool.includes(char));
      if (chars.length) required.push(pickRandom(chars));
    }
  }
  if (useLower) {
    for (let i = 0; i < minLower; i += 1) {
      const chars = [...LOWER].filter((char) => pool.includes(char));
      if (chars.length) required.push(pickRandom(chars));
    }
  }
  if (useDigits) {
    for (let i = 0; i < minDigits; i += 1) {
      const chars = [...DIGITS].filter((char) => pool.includes(char));
      if (chars.length) required.push(pickRandom(chars));
    }
  }
  if (useSymbols) {
    const symbols = customSymbols.trim() || DEFAULT_SYMBOLS;
    for (let i = 0; i < minSymbols; i += 1) {
      const chars = [...symbols].filter((char) => pool.includes(char));
      if (chars.length) required.push(pickRandom(chars));
    }
  }

  const remaining = coreLength - required.length;
  if (remaining < 0) {
    throw new Error('Minimum counts exceed password length.');
  }

  const passwordChars = [...required];
  const poolChars = [...pool];
  for (let i = 0; i < remaining; i += 1) {
    passwordChars.push(pickRandom(poolChars));
  }

  return prefix + shuffle(passwordChars).join('') + suffix;
}
