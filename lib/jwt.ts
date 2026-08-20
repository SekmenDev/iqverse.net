export interface JwtHeader {
  alg?: string;
  typ?: string;
  [key: string]: unknown;
}

export interface JwtPayload {
  sub?: string;
  name?: string;
  iat?: number;
  exp?: number;
  nbf?: number;
  iss?: string;
  aud?: string | string[];
  [key: string]: unknown;
}

export interface JwtDecodedResult {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  isExpired: boolean;
  expiryDate?: Date;
  rawParts: [string, string, string];
}

export function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  if (typeof atob === 'function') {
    return atob(base64);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('binary');
  }
  throw new Error('No base64 decoding function available in current environment');
}

export function decodeJwt(token: string): JwtDecodedResult {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format. Must contain 3 dot-separated segments.');
  }

  const header: JwtHeader = JSON.parse(base64UrlDecode(parts[0]));
  const payload: JwtPayload = JSON.parse(base64UrlDecode(parts[1]));

  const nowSec = Math.floor(Date.now() / 1000);
  let isExpired = false;
  let expiryDate: Date | undefined;

  if (payload.exp) {
    expiryDate = new Date(payload.exp * 1000);
    isExpired = payload.exp <= nowSec;
  }

  return {
    header,
    payload,
    signature: parts[2],
    isExpired,
    expiryDate,
    rawParts: [parts[0], parts[1], parts[2]],
  };
}

export function decodeJwtToken(token: string): {
  isValid: boolean;
  valid: boolean;
  header?: JwtHeader;
  payload?: JwtPayload;
  signature?: string;
  isExpired?: boolean;
  expStatus?: string;
  error?: string;
  errorMessage?: string;
} {
  try {
    const res = decodeJwt(token);
    const expStatus = res.payload.exp
      ? res.isExpired
        ? `Expired (${res.expiryDate?.toUTCString()})`
        : `Active (Expires ${res.expiryDate?.toUTCString()})`
      : 'No Expiration Set';

    return {
      isValid: true,
      valid: true,
      header: res.header,
      payload: res.payload,
      signature: res.signature,
      isExpired: res.isExpired,
      expStatus,
    };
  } catch (err: any) {
    const msg = err.message || 'Invalid JWT token.';
    return {
      isValid: false,
      valid: false,
      error: msg,
      errorMessage: msg,
      expStatus: 'Invalid Token',
    };
  }
}

export async function verifyJwtSignatureHmac(
  token: string,
  secret: string
): Promise<boolean> {
  const parts = token.trim().split('.');
  if (parts.length !== 3) return false;

  if (typeof globalThis.crypto?.subtle === 'undefined') {
    throw new Error('Web Crypto API is not available');
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const dataToSign = encoder.encode(`${parts[0]}.${parts[1]}`);
  const computedBuffer = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, dataToSign);

  let binary = '';
  const bytes = new Uint8Array(computedBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const computedBase64Url = (typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64'))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return computedBase64Url === parts[2];
}

export const verifyJwtHmacSignature = verifyJwtSignatureHmac;
