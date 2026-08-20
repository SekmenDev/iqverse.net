export function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(binary, 'binary').toString('base64');
  }
  return '';
}

export async function computeDigest(
  algorithm: string,
  text: string,
  key: string | null = null
): Promise<ArrayBuffer> {
  if (typeof globalThis.crypto?.subtle === 'undefined') {
    throw new Error('Web Crypto API is not available');
  }

  const data = new TextEncoder().encode(text);

  if (algorithm.startsWith('HMAC-')) {
    const hashAlgo = algorithm.slice(5);
    if (!key) {
      throw new TypeError('A key is required for HMAC algorithms.');
    }

    const cryptoKey = await globalThis.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      { name: 'HMAC', hash: { name: hashAlgo } },
      false,
      ['sign']
    );
    return globalThis.crypto.subtle.sign('HMAC', cryptoKey, data);
  }

  return globalThis.crypto.subtle.digest(algorithm, data);
}

export async function computeHashString(
  algorithm: string,
  text: string,
  format: 'hex' | 'base64' = 'hex',
  key: string | null = null
): Promise<string> {
  const buffer = await computeDigest(algorithm, text, key);
  return format === 'base64' ? arrayBufferToBase64(buffer) : arrayBufferToHex(buffer);
}
