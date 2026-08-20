import { describe, it, expect } from 'vitest';
import { computeDigest, arrayBufferToHex, arrayBufferToBase64 } from '@/lib/hashing';

describe('Hashing Engine (lib/hashing)', () => {
  it('converts ArrayBuffer to hex and base64 strings', () => {
    const buffer = new Uint8Array([0xde, 0xad, 0xbe, 0xef]).buffer;
    expect(arrayBufferToHex(buffer)).toBe('deadbeef');
    expect(arrayBufferToBase64(buffer)).toBe('3q2+7w==');
  });

  it('computes SHA-256 digest accurately', async () => {
    const buffer = await computeDigest('SHA-256', 'hello world');
    const hex = arrayBufferToHex(buffer);
    // sha256 of "hello world": b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
    expect(hex).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  });

  it('computes SHA-1 digest accurately', async () => {
    const buffer = await computeDigest('SHA-1', 'hello world');
    const hex = arrayBufferToHex(buffer);
    // sha1 of "hello world": 2aae6c35c94fcfb415dbe95f408b9ce91ee846ed
    expect(hex).toBe('2aae6c35c94fcfb415dbe95f408b9ce91ee846ed');
  });
});
