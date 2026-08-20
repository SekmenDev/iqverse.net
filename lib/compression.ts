export async function compressText(text: string, format: 'deflate' | 'gzip' = 'deflate'): Promise<string> {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(text);

  if (typeof CompressionStream !== 'undefined') {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(rawBytes);
        controller.close();
      },
    }).pipeThrough(new CompressionStream(format));
    const compressed = await new Response(stream).arrayBuffer();

    const bytes = new Uint8Array(compressed);
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  }

  // Node.js fallback if CompressionStream is absent
  try {
    const zlib = await import('zlib');
    const buffer = Buffer.from(rawBytes);
    const compressed = format === 'gzip' ? zlib.gzipSync(buffer) : zlib.deflateSync(buffer);
    return compressed.toString('base64');
  } catch {
    throw new Error('Compression is not supported in this environment');
  }
}

export async function decompressText(base64: string, format: 'deflate' | 'gzip' = 'deflate'): Promise<string> {
  const binaryStr = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const binary = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));

  if (typeof DecompressionStream !== 'undefined') {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(binary);
        controller.close();
      },
    }).pipeThrough(new DecompressionStream(format));
    const decompressed = await new Response(stream).arrayBuffer();

    return new TextDecoder().decode(decompressed);
  }

  // Node.js fallback
  try {
    const zlib = await import('zlib');
    const buffer = Buffer.from(binary);
    const decompressed = format === 'gzip' ? zlib.gunzipSync(buffer) : zlib.inflateSync(buffer);
    return decompressed.toString('utf-8');
  } catch {
    throw new Error('Decompression is not supported in this environment');
  }
}
