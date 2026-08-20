import { describe, it, expect } from 'vitest';
import { compressText, decompressText } from '@/lib/compression';

describe('Compression Engine (lib/compression)', () => {
  it('compresses and decompresses text losslessly with deflate', async () => {
    if (typeof CompressionStream === 'undefined') {
      return; // Skip if environment lacks stream compression
    }
    const sample = 'IQVerse Developer Tools: Clean code, fast utilities, modern web.';
    const compressed = await compressText(sample, 'deflate');
    expect(compressed).toBeTypeOf('string');
    expect(compressed.length).toBeGreaterThan(0);

    const decompressed = await decompressText(compressed, 'deflate');
    expect(decompressed).toBe(sample);
  });

  it('compresses and decompresses text losslessly with gzip', async () => {
    if (typeof CompressionStream === 'undefined') {
      return;
    }
    const sample = 'Gzip stream test payload for developer suite verification.';
    const compressed = await compressText(sample, 'gzip');
    expect(compressed).toBeTypeOf('string');

    const decompressed = await decompressText(compressed, 'gzip');
    expect(decompressed).toBe(sample);
  });
});
