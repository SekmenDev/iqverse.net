export const TOTP_ALGORITHMS = ['SHA1', 'SHA256', 'SHA512'] as const;

export type TotpAlgorithm = (typeof TOTP_ALGORITHMS)[number];

export interface TotpOptions {
  digits: number;
  period: number;
  algorithm: TotpAlgorithm;
}

export interface OtpAuthUri {
  type: 'totp' | 'hotp';
  label: string;
  issuer: string;
  account: string;
  secret: string;
  algorithm: TotpAlgorithm;
  digits: number;
  period: number;
  counter: number;
}

export const DEFAULT_OPTIONS: TotpOptions = { digits: 6, period: 30, algorithm: 'SHA1' };

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const SUBTLE_HASHES: Record<TotpAlgorithm, string> = {
  SHA1: 'SHA-1',
  SHA256: 'SHA-256',
  SHA512: 'SHA-512',
};

export function isTotpAlgorithm(value: string): value is TotpAlgorithm {
  return (TOTP_ALGORITHMS as readonly string[]).includes(value.toUpperCase());
}

export function base32Decode(input: string): Uint8Array | null {
  const clean = input
    .replace(/[\s-]/g, '')
    .replace(/=+$/, '')
    .toUpperCase();

  if (!clean) return new Uint8Array(0);

  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) return null;

    buffer = (buffer << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((buffer >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

export function base32Encode(bytes: Uint8Array): string {
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(buffer >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) output += BASE32_ALPHABET[(buffer << (5 - bits)) & 31];

  while (output.length % 8 !== 0) output += '=';
  return output;
}

export function isValidSecret(secret: string): boolean {
  const decoded = base32Decode(secret);
  return decoded !== null && decoded.length > 0;
}

export function generateSecret(byteLength = 20): string {
  if (typeof globalThis.crypto?.getRandomValues !== 'function') {
    throw new Error('Secure random generation is unavailable in this environment.');
  }

  return base32Encode(globalThis.crypto.getRandomValues(new Uint8Array(byteLength)));
}

function counterToBytes(counter: number): Uint8Array {
  const bytes = new Uint8Array(8);
  let remaining = BigInt(Math.floor(counter));

  for (let i = 7; i >= 0; i -= 1) {
    bytes[i] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }

  return bytes;
}

async function sign(key: Uint8Array, message: Uint8Array, algorithm: TotpAlgorithm): Promise<Uint8Array> {
  if (typeof globalThis.crypto?.subtle === 'undefined') {
    throw new Error('Web Crypto API is not available');
  }

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    key.slice().buffer as ArrayBuffer,
    { name: 'HMAC', hash: { name: SUBTLE_HASHES[algorithm] } },
    false,
    ['sign']
  );

  const signature = await globalThis.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    message.slice().buffer as ArrayBuffer
  );

  return new Uint8Array(signature);
}

export async function generateHotp(
  secret: string,
  counter: number,
  options: Partial<TotpOptions> = {}
): Promise<string> {
  const { digits, algorithm } = { ...DEFAULT_OPTIONS, ...options };
  const key = base32Decode(secret);

  if (key === null) throw new Error('The secret is not valid base32.');
  if (key.length === 0) throw new Error('The secret is empty.');
  if (digits < 6 || digits > 10) throw new Error('Digits must be between 6 and 10.');

  const digest = await sign(key, counterToBytes(counter), algorithm);

  // RFC 4226 dynamic truncation: the low nibble of the last byte picks the offset
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    (digest[offset + 1] << 16) |
    (digest[offset + 2] << 8) |
    digest[offset + 3];

  return String(binary % 10 ** digits).padStart(digits, '0');
}

export function counterForTime(timestampMs: number, period: number): number {
  return Math.floor(timestampMs / 1000 / period);
}

export async function generateTotp(
  secret: string,
  options: Partial<TotpOptions> = {},
  timestampMs: number = Date.now()
): Promise<string> {
  const { period } = { ...DEFAULT_OPTIONS, ...options };
  if (period <= 0) throw new Error('Period must be greater than zero.');

  return generateHotp(secret, counterForTime(timestampMs, period), options);
}

export function secondsRemaining(period: number, timestampMs: number = Date.now()): number {
  const seconds = timestampMs / 1000;
  return period - (seconds % period);
}

export function parseOtpAuthUri(uri: string): OtpAuthUri | null {
  let parsed: URL;

  try {
    parsed = new URL(uri.trim());
  } catch {
    return null;
  }

  if (parsed.protocol !== 'otpauth:') return null;

  const type = parsed.host.toLowerCase();
  if (type !== 'totp' && type !== 'hotp') return null;

  const label = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  const separator = label.indexOf(':');
  const labelIssuer = separator === -1 ? '' : label.slice(0, separator).trim();
  const account = separator === -1 ? label : label.slice(separator + 1).trim();

  const secret = (parsed.searchParams.get('secret') ?? '').toUpperCase();
  if (!isValidSecret(secret)) return null;

  const rawAlgorithm = parsed.searchParams.get('algorithm') ?? 'SHA1';
  const algorithm = isTotpAlgorithm(rawAlgorithm)
    ? (rawAlgorithm.toUpperCase() as TotpAlgorithm)
    : 'SHA1';

  const digits = Number(parsed.searchParams.get('digits') ?? 6);
  const period = Number(parsed.searchParams.get('period') ?? 30);
  const counter = Number(parsed.searchParams.get('counter') ?? 0);

  return {
    type,
    label,
    issuer: parsed.searchParams.get('issuer') ?? labelIssuer,
    account,
    secret,
    algorithm,
    digits: Number.isFinite(digits) && digits >= 6 && digits <= 10 ? digits : 6,
    period: Number.isFinite(period) && period > 0 ? period : 30,
    counter: Number.isFinite(counter) ? counter : 0,
  };
}

export function buildOtpAuthUri(params: {
  issuer: string;
  account: string;
  secret: string;
  algorithm?: TotpAlgorithm;
  digits?: number;
  period?: number;
}): string {
  const { issuer, account, secret } = params;
  const { algorithm, digits, period } = { ...DEFAULT_OPTIONS, ...params };

  const label = issuer ? `${issuer}:${account}` : account;
  const search = new URLSearchParams({ secret: secret.replace(/[\s-]/g, '').toUpperCase() });

  if (issuer) search.set('issuer', issuer);
  search.set('algorithm', algorithm);
  search.set('digits', String(digits));
  search.set('period', String(period));

  return `otpauth://totp/${encodeURIComponent(label)}?${search.toString()}`;
}
