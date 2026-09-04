export async function compressText(text: string, format: 'deflate' | 'gzip' = 'deflate'): Promise<string> {
  const rawBytes = new TextEncoder().encode(text);

  const stream = new ReadableStream<BufferSource>({
    start(controller) {
      controller.enqueue(rawBytes);
      controller.close();
    },
  }).pipeThrough(new CompressionStream(format));

  const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = '';
  for (const byte of compressed) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export async function decompressText(base64: string, format: 'deflate' | 'gzip' = 'deflate'): Promise<string> {
  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const stream = new ReadableStream<BufferSource>({
    start(controller) {
      controller.enqueue(binary);
      controller.close();
    },
  }).pipeThrough(new DecompressionStream(format));

  return new TextDecoder().decode(await new Response(stream).arrayBuffer());
}
