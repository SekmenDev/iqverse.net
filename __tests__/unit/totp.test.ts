import { describe, it, expect } from 'vitest';
import {
  base32Decode,
  base32Encode,
  buildOtpAuthUri,
  counterForTime,
  generateHotp,
  generateSecret,
  generateTotp,
  isValidSecret,
  parseOtpAuthUri,
  secondsRemaining,
} from '@/lib/totp';

const ascii = (text: string) => new TextEncoder().encode(text);

// jsdom's TextEncoder builds Uint8Array in a different realm, so compare contents
const bytes = (value: Uint8Array | null) => (value === null ? null : Array.from(value));

// RFC 6238 Appendix B seeds, keyed by algorithm
const SEED_SHA1 = base32Encode(ascii('12345678901234567890'));
const SEED_SHA256 = base32Encode(ascii('12345678901234567890123456789012'));
const SEED_SHA512 = base32Encode(
  ascii('1234567890123456789012345678901234567890123456789012345678901234')
);

describe('TOTP (lib/totp) - base32', () => {
  it('round-trips bytes through encode and decode', () => {
    const source = ascii('12345678901234567890');
    expect(bytes(base32Decode(base32Encode(source)))).toEqual(bytes(source));
  });

  it('matches RFC 4648 test vectors', () => {
    expect(base32Encode(ascii('f'))).toBe('MY======');
    expect(base32Encode(ascii('fo'))).toBe('MZXQ====');
    expect(base32Encode(ascii('foo'))).toBe('MZXW6===');
    expect(base32Encode(ascii('foobar'))).toBe('MZXW6YTBOI======');
  });

  it('decodes the RFC 4648 vectors back', () => {
    expect(bytes(base32Decode('MZXW6YTBOI======'))).toEqual(bytes(ascii('foobar')));
  });

  it('ignores spaces, dashes, padding and case', () => {
    expect(bytes(base32Decode('mzxw 6ytb-oi'))).toEqual(bytes(base32Decode('MZXW6YTBOI======')));
  });

  it('returns null for characters outside the alphabet', () => {
    expect(base32Decode('MZXW6YTB01')).toBeNull();
    expect(base32Decode('hello!')).toBeNull();
  });

  it('treats an empty secret as invalid', () => {
    expect(bytes(base32Decode(''))).toEqual([]);
    expect(isValidSecret('')).toBe(false);
    expect(isValidSecret('JBSWY3DPEHPK3PXP')).toBe(true);
    expect(isValidSecret('not base32!')).toBe(false);
  });
});

describe('TOTP (lib/totp) - RFC 6238 test vectors', () => {
  const times = [59, 1111111109, 1111111111, 1234567890, 2000000000, 20000000000];

  it('matches the SHA1 vectors', async () => {
    const expected = ['94287082', '07081804', '14050471', '89005924', '69279037', '65353130'];

    for (let i = 0; i < times.length; i += 1) {
      const code = await generateTotp(
        SEED_SHA1,
        { digits: 8, period: 30, algorithm: 'SHA1' },
        times[i] * 1000
      );
      expect(code).toBe(expected[i]);
    }
  });

  it('matches the SHA256 vectors', async () => {
    const expected = ['46119246', '68084774', '67062674', '91819424', '90698825', '77737706'];

    for (let i = 0; i < times.length; i += 1) {
      const code = await generateTotp(
        SEED_SHA256,
        { digits: 8, period: 30, algorithm: 'SHA256' },
        times[i] * 1000
      );
      expect(code).toBe(expected[i]);
    }
  });

  it('matches the SHA512 vectors', async () => {
    const expected = ['90693936', '25091201', '99943326', '93441116', '38618901', '47863826'];

    for (let i = 0; i < times.length; i += 1) {
      const code = await generateTotp(
        SEED_SHA512,
        { digits: 8, period: 30, algorithm: 'SHA512' },
        times[i] * 1000
      );
      expect(code).toBe(expected[i]);
    }
  });
});

describe('TOTP (lib/totp) - RFC 4226 HOTP vectors', () => {
  it('matches the published counter sequence', async () => {
    const expected = [
      '755224', '287082', '359152', '969429', '338314',
      '254676', '287922', '162583', '399871', '520489',
    ];

    for (let counter = 0; counter < expected.length; counter += 1) {
      expect(await generateHotp(SEED_SHA1, counter)).toBe(expected[counter]);
    }
  });
});

describe('TOTP (lib/totp) - behaviour', () => {
  it('defaults to six digits', async () => {
    expect(await generateTotp(SEED_SHA1, {}, 59000)).toHaveLength(6);
  });

  it('pads short codes to the requested digit count', async () => {
    const code = await generateTotp(SEED_SHA1, { digits: 8 }, 1111111109000);
    expect(code).toBe('07081804');
    expect(code).toHaveLength(8);
  });

  it('keeps the same code across one period and changes at the boundary', async () => {
    const start = await generateTotp(SEED_SHA1, {}, 30_000);
    const mid = await generateTotp(SEED_SHA1, {}, 59_999);
    const next = await generateTotp(SEED_SHA1, {}, 60_000);

    expect(mid).toBe(start);
    expect(next).not.toBe(start);
  });

  it('honours a custom period', async () => {
    const at30 = await generateTotp(SEED_SHA1, { period: 60 }, 30_000);
    const at59 = await generateTotp(SEED_SHA1, { period: 60 }, 59_000);
    expect(at59).toBe(at30);
  });

  it('rejects invalid secrets and options', async () => {
    await expect(generateTotp('not base32!')).rejects.toThrow('valid base32');
    await expect(generateTotp('')).rejects.toThrow('empty');
    await expect(generateTotp(SEED_SHA1, { digits: 4 })).rejects.toThrow('between 6 and 10');
    await expect(generateTotp(SEED_SHA1, { period: 0 })).rejects.toThrow('greater than zero');
  });

  it('computes the counter and the seconds left in the window', () => {
    expect(counterForTime(59_000, 30)).toBe(1);
    expect(counterForTime(1111111109_000, 30)).toBe(37037036);
    expect(secondsRemaining(30, 0)).toBe(30);
    expect(secondsRemaining(30, 10_000)).toBe(20);
  });

  it('generates a random secret of the requested size', () => {
    const secret = generateSecret(20);
    expect(isValidSecret(secret)).toBe(true);
    expect(base32Decode(secret)).toHaveLength(20);
    expect(generateSecret(20)).not.toBe(secret);
  });
});

describe('TOTP (lib/totp) - otpauth URIs', () => {
  it('parses a full URI', () => {
    const parsed = parseOtpAuthUri(
      'otpauth://totp/IQVerse:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=IQVerse&algorithm=SHA256&digits=8&period=60'
    );

    expect(parsed).toEqual({
      type: 'totp',
      label: 'IQVerse:alice@example.com',
      issuer: 'IQVerse',
      account: 'alice@example.com',
      secret: 'JBSWY3DPEHPK3PXP',
      algorithm: 'SHA256',
      digits: 8,
      period: 60,
      counter: 0,
    });
  });

  it('falls back to defaults for missing parameters', () => {
    const parsed = parseOtpAuthUri('otpauth://totp/alice?secret=JBSWY3DPEHPK3PXP');
    expect(parsed?.algorithm).toBe('SHA1');
    expect(parsed?.digits).toBe(6);
    expect(parsed?.period).toBe(30);
    expect(parsed?.issuer).toBe('');
  });

  it('takes the issuer from the label when the parameter is absent', () => {
    expect(parseOtpAuthUri('otpauth://totp/Acme:bob?secret=JBSWY3DPEHPK3PXP')?.issuer).toBe('Acme');
  });

  it('ignores out-of-range digits and periods', () => {
    const parsed = parseOtpAuthUri('otpauth://totp/a?secret=JBSWY3DPEHPK3PXP&digits=99&period=-5');
    expect(parsed?.digits).toBe(6);
    expect(parsed?.period).toBe(30);
  });

  it('rejects anything that is not a valid otpauth URI', () => {
    expect(parseOtpAuthUri('https://example.com')).toBeNull();
    expect(parseOtpAuthUri('otpauth://mystery/a?secret=JBSWY3DPEHPK3PXP')).toBeNull();
    expect(parseOtpAuthUri('otpauth://totp/a?secret=notbase32!')).toBeNull();
    expect(parseOtpAuthUri('otpauth://totp/a')).toBeNull();
    expect(parseOtpAuthUri('nonsense')).toBeNull();
  });

  it('builds a URI that parses back to the same values', () => {
    const uri = buildOtpAuthUri({
      issuer: 'IQVerse',
      account: 'alice@example.com',
      secret: 'jbswy3dpehpk3pxp',
      algorithm: 'SHA512',
      digits: 8,
      period: 60,
    });

    const parsed = parseOtpAuthUri(uri);
    expect(parsed?.issuer).toBe('IQVerse');
    expect(parsed?.account).toBe('alice@example.com');
    expect(parsed?.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(parsed?.algorithm).toBe('SHA512');
    expect(parsed?.digits).toBe(8);
    expect(parsed?.period).toBe(60);
  });

  it('omits the issuer prefix when there is no issuer', () => {
    const uri = buildOtpAuthUri({ issuer: '', account: 'alice', secret: 'JBSWY3DPEHPK3PXP' });
    expect(uri).toContain('/alice?');
    expect(uri).not.toContain('issuer=');
  });
});
