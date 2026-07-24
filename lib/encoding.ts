export function b64Encode(input: string, urlSafe = false): string {
  try {
    const encoded = typeof btoa !== 'undefined' ? btoa(unescape(encodeURIComponent(input))) : Buffer.from(input, 'utf-8').toString('base64');
    return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded;
  } catch {
    return 'Encoding error';
  }
}

export function b64Decode(input: string, urlSafe = false): string {
  try {
    let data = input;
    if (urlSafe) {
      data = data.replace(/-/g, '+').replace(/_/g, '/');
      while (data.length % 4) data += '=';
    }
    const decoded = typeof atob !== 'undefined' ? decodeURIComponent(escape(atob(data))) : Buffer.from(data, 'base64').toString('utf-8');
    return decoded;
  } catch {
    return 'Decoding error';
  }
}

export function hexEncode(input: string): string {
  try {
    const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
    const bytes = encoder ? encoder.encode(input) : Buffer.from(input, 'utf-8');
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return 'Encoding error';
  }
}

export function hexDecode(input: string): string {
  try {
    const cleaned = input.replace(/\s+/g, '');
    if (cleaned.length % 2 !== 0) {
      throw new TypeError('Hex input must have an even length.');
    }
    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < bytes.length; i += 1) {
      const byte = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
      if (Number.isNaN(byte)) {
        throw new TypeError('Invalid hex input.');
      }
      bytes[i] = byte;
    }
    const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;
    return decoder ? decoder.decode(bytes) : Buffer.from(bytes).toString('utf-8');
  } catch {
    return 'Decoding error';
  }
}
