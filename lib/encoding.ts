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
