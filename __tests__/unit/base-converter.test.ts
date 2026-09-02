import { describe, it, expect } from 'vitest';
import {
  allWidthViews,
  baseLabel,
  basePrefix,
  bitLength,
  convertAll,
  detectBase,
  formatInBase,
  groupDigits,
  isValidBase,
  parseAuto,
  parseInBase,
  toggleBit,
  widthView,
} from '@/lib/base-converter';

describe('Base Converter (lib/base-converter) - parseInBase', () => {
  it('parses each common base', () => {
    expect(parseInBase('1010', 2)).toBe(10n);
    expect(parseInBase('777', 8)).toBe(511n);
    expect(parseInBase('255', 10)).toBe(255n);
    expect(parseInBase('ff', 16)).toBe(255n);
    expect(parseInBase('zz', 36)).toBe(1295n);
  });

  it('is case insensitive', () => {
    expect(parseInBase('FF', 16)).toBe(255n);
    expect(parseInBase('DeadBeef', 16)).toBe(3735928559n);
  });

  it('ignores separators used for readability', () => {
    expect(parseInBase('1111_0000', 2)).toBe(240n);
    expect(parseInBase('1 000 000', 10)).toBe(1000000n);
    expect(parseInBase('1,234', 10)).toBe(1234n);
  });

  it('handles signs', () => {
    expect(parseInBase('-42', 10)).toBe(-42n);
    expect(parseInBase('+42', 10)).toBe(42n);
  });

  it('keeps full precision beyond Number.MAX_SAFE_INTEGER', () => {
    expect(parseInBase('9007199254740993', 10)).toBe(9007199254740993n);
    expect(parseInBase('ffffffffffffffff', 16)).toBe(18446744073709551615n);
  });

  it('rejects digits outside the base', () => {
    expect(parseInBase('2', 2)).toBeNull();
    expect(parseInBase('8', 8)).toBeNull();
    expect(parseInBase('g', 16)).toBeNull();
  });

  it('rejects empty and sign-only input', () => {
    expect(parseInBase('', 10)).toBeNull();
    expect(parseInBase('   ', 10)).toBeNull();
    expect(parseInBase('-', 10)).toBeNull();
  });

  it('rejects bases outside 2 to 36', () => {
    expect(parseInBase('1', 1)).toBeNull();
    expect(parseInBase('1', 37)).toBeNull();
    expect(isValidBase(2)).toBe(true);
    expect(isValidBase(36)).toBe(true);
    expect(isValidBase(1)).toBe(false);
  });
});

describe('Base Converter (lib/base-converter) - detectBase and parseAuto', () => {
  it('detects prefixed input', () => {
    expect(detectBase('0xFF')).toEqual({ base: 16, digits: 'FF', negative: false });
    expect(detectBase('0b1010')).toEqual({ base: 2, digits: '1010', negative: false });
    expect(detectBase('0o777')).toEqual({ base: 8, digits: '777', negative: false });
  });

  it('falls back to decimal without a prefix', () => {
    expect(detectBase('123')).toEqual({ base: 10, digits: '123', negative: false });
  });

  it('records a leading minus', () => {
    expect(detectBase('-0xFF')).toEqual({ base: 16, digits: 'FF', negative: true });
  });

  it('rejects a bare prefix or empty input', () => {
    expect(detectBase('0x')).toBeNull();
    expect(detectBase('')).toBeNull();
    expect(detectBase('-')).toBeNull();
  });

  it('parses prefixed values end to end', () => {
    expect(parseAuto('0xff')).toBe(255n);
    expect(parseAuto('0b1010')).toBe(10n);
    expect(parseAuto('-0o10')).toBe(-8n);
    expect(parseAuto('42')).toBe(42n);
    expect(parseAuto('0xzz')).toBeNull();
  });
});

describe('Base Converter (lib/base-converter) - formatting', () => {
  it('renders a value in each base', () => {
    expect(formatInBase(255n, 2)).toBe('11111111');
    expect(formatInBase(255n, 8)).toBe('377');
    expect(formatInBase(255n, 16)).toBe('ff');
    expect(formatInBase(255n, 16, true)).toBe('FF');
  });

  it('keeps negatives signed', () => {
    expect(formatInBase(-255n, 16)).toBe('-ff');
  });

  it('converts to every common base at once', () => {
    const all = convertAll(255n);
    expect(all[2]).toBe('11111111');
    expect(all[10]).toBe('255');
    expect(all[16]).toBe('ff');
  });

  it('groups digits from the right', () => {
    expect(groupDigits('11110000', 4)).toBe('1111 0000');
    expect(groupDigits('101010', 4)).toBe('10 1010');
    expect(groupDigits('1234567', 3, ',')).toBe('1,234,567');
  });

  it('leaves short values and the sign alone when grouping', () => {
    expect(groupDigits('11', 4)).toBe('11');
    expect(groupDigits('-11110000', 4)).toBe('-1111 0000');
  });

  it('measures bit length', () => {
    expect(bitLength(0n)).toBe(0);
    expect(bitLength(1n)).toBe(1);
    expect(bitLength(255n)).toBe(8);
    expect(bitLength(256n)).toBe(9);
    expect(bitLength(-255n)).toBe(8);
  });

  it('names and prefixes the common bases', () => {
    expect(baseLabel(16)).toBe('Hexadecimal');
    expect(baseLabel(7)).toBe('Base 7');
    expect(basePrefix(2)).toBe('0b');
    expect(basePrefix(10)).toBe('');
  });
});

describe('Base Converter (lib/base-converter) - width views', () => {
  it('pads to the full width', () => {
    const view = widthView(5n, 8);
    expect(view.binary).toBe('00000101');
    expect(view.hex).toBe('05');
    expect(view.unsigned).toBe('5');
    expect(view.signed).toBe('5');
  });

  it('encodes negatives as two\'s complement', () => {
    const view = widthView(-1n, 8);
    expect(view.binary).toBe('11111111');
    expect(view.hex).toBe('FF');
    expect(view.signed).toBe('-1');
    expect(view.unsigned).toBe('255');
  });

  it('reads a high bit pattern as negative when signed', () => {
    const view = widthView(255n, 8);
    expect(view.signed).toBe('-1');
    expect(view.unsigned).toBe('255');
  });

  it('marks values that do not fit', () => {
    expect(widthView(256n, 8).fits).toBe(false);
    expect(widthView(255n, 8).fits).toBe(true);
    expect(widthView(-129n, 8).fits).toBe(false);
    expect(widthView(-128n, 8).fits).toBe(true);
  });

  it('handles the full 64-bit range', () => {
    const view = widthView(18446744073709551615n, 64);
    expect(view.fits).toBe(true);
    expect(view.hex).toBe('FFFFFFFFFFFFFFFF');
    expect(view.signed).toBe('-1');
  });

  it('returns one view per supported width', () => {
    expect(allWidthViews(5n).map(view => view.width)).toEqual([8, 16, 32, 64]);
  });
});

describe('Base Converter (lib/base-converter) - toggleBit', () => {
  it('sets and clears a bit', () => {
    expect(toggleBit(0n, 0, 8)).toBe(1n);
    expect(toggleBit(1n, 0, 8)).toBe(0n);
    expect(toggleBit(0n, 7, 8)).toBe(128n);
  });

  it('round-trips a toggle', () => {
    expect(toggleBit(toggleBit(42n, 3, 8), 3, 8)).toBe(42n);
  });

  it('keeps a negative value signed', () => {
    expect(toggleBit(-1n, 0, 8)).toBe(-2n);
    expect(toggleBit(-2n, 0, 8)).toBe(-1n);
  });
});
