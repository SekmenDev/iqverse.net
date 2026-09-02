import { describe, it, expect } from 'vitest';
import {
  SRI_ALGORITHMS,
  buildTag,
  computeAllIntegrity,
  computeIntegrity,
  detectResourceKind,
  isCrossOrigin,
  isSriAlgorithm,
  isValidIntegrity,
  parseIntegrity,
} from '@/lib/sri';

// sha256 of "hello world" is b94d27b9...cde9, which is uU0nuZNNPgil...6dnk= in base64
const HELLO_SHA256 = 'sha256-uU0nuZNNPgilLlLX2n2r+sSE7+N6U4DukIj3rOLvzek=';

describe('SRI Generator (lib/sri) - computeIntegrity', () => {
  it('produces the algorithm-prefixed base64 digest', async () => {
    expect(await computeIntegrity('hello world', 'sha256')).toBe(HELLO_SHA256);
  });

  it('defaults to sha384, the algorithm the SRI spec recommends', async () => {
    const integrity = await computeIntegrity('hello world');
    expect(integrity.startsWith('sha384-')).toBe(true);
  });

  it('produces a digest of the right length for each algorithm', async () => {
    const lengths: Record<string, number> = { sha256: 44, sha384: 64, sha512: 88 };

    for (const algorithm of SRI_ALGORITHMS) {
      const integrity = await computeIntegrity('hello world', algorithm);
      expect(integrity.split('-')[1]).toHaveLength(lengths[algorithm]);
    }
  });

  it('hashes strings and byte arrays identically', async () => {
    const bytes = new TextEncoder().encode('hello world');
    expect(await computeIntegrity(bytes, 'sha256')).toBe(HELLO_SHA256);
    expect(await computeIntegrity(bytes.buffer as ArrayBuffer, 'sha256')).toBe(HELLO_SHA256);
  });

  it('produces different digests for different content', async () => {
    const a = await computeIntegrity('hello world');
    const b = await computeIntegrity('hello world!');
    expect(a).not.toBe(b);
  });

  it('computes every algorithm at once', async () => {
    const all = await computeAllIntegrity('hello world');
    expect(Object.keys(all).sort()).toEqual(['sha256', 'sha384', 'sha512']);
    expect(all.sha256).toBe(HELLO_SHA256);
  });
});

describe('SRI Generator (lib/sri) - parseIntegrity', () => {
  it('parses a single hash', () => {
    expect(parseIntegrity(HELLO_SHA256)).toEqual([
      { algorithm: 'sha256', base64: HELLO_SHA256.split('-')[1] },
    ]);
  });

  it('parses several space-separated hashes', async () => {
    const all = await computeAllIntegrity('hello world');
    const combined = `${all.sha256} ${all.sha512}`;

    const parsed = parseIntegrity(combined);
    expect(parsed.map(entry => entry.algorithm)).toEqual(['sha256', 'sha512']);
  });

  it('drops unknown algorithms and wrong-length digests', () => {
    expect(parseIntegrity('md5-abcdef')).toEqual([]);
    expect(parseIntegrity('sha256-tooshort')).toEqual([]);
    expect(parseIntegrity('sha384-' + 'A'.repeat(44))).toEqual([]);
  });

  it('drops digests that are not base64', () => {
    expect(parseIntegrity('sha256-' + '!'.repeat(44))).toEqual([]);
  });

  it('returns nothing for empty input', () => {
    expect(parseIntegrity('')).toEqual([]);
    expect(parseIntegrity('   ')).toEqual([]);
  });

  it('validates only when every token parses', () => {
    expect(isValidIntegrity(HELLO_SHA256)).toBe(true);
    expect(isValidIntegrity(`${HELLO_SHA256} md5-nope`)).toBe(false);
    expect(isValidIntegrity('')).toBe(false);
  });

  it('recognises supported algorithm names', () => {
    expect(isSriAlgorithm('sha384')).toBe(true);
    expect(isSriAlgorithm('sha1')).toBe(false);
  });
});

describe('SRI Generator (lib/sri) - tag building', () => {
  it('detects the resource kind from the extension', () => {
    expect(detectResourceKind('https://cdn.example.com/app.js')).toBe('script');
    expect(detectResourceKind('https://cdn.example.com/app.mjs')).toBe('script');
    expect(detectResourceKind('https://cdn.example.com/app.css')).toBe('style');
    expect(detectResourceKind('https://cdn.example.com/thing')).toBe('unknown');
  });

  it('ignores query strings and fragments when detecting the kind', () => {
    expect(detectResourceKind('https://cdn.example.com/app.css?v=2')).toBe('style');
    expect(detectResourceKind('https://cdn.example.com/app.js#main')).toBe('script');
  });

  it('builds a script tag by default', () => {
    expect(buildTag('https://cdn.example.com/app.js', HELLO_SHA256)).toBe(
      `<script src="https://cdn.example.com/app.js" integrity="${HELLO_SHA256}" crossorigin="anonymous"></script>`
    );
  });

  it('builds a stylesheet link for CSS', () => {
    const tag = buildTag('https://cdn.example.com/app.css', HELLO_SHA256);
    expect(tag.startsWith('<link rel="stylesheet"')).toBe(true);
    expect(tag).toContain('href="https://cdn.example.com/app.css"');
  });

  it('escapes quotes in the URL so the attribute cannot be broken out of', () => {
    const tag = buildTag('https://cdn.example.com/a"onload="alert(1)', HELLO_SHA256, 'script');
    expect(tag).not.toContain('"onload="alert(1)');
    expect(tag).toContain('&quot;onload=&quot;');
  });

  it('detects cross-origin resources', () => {
    expect(isCrossOrigin('https://cdn.example.com/app.js', 'https://example.com')).toBe(true);
    expect(isCrossOrigin('/local/app.js', 'https://example.com')).toBe(false);
    expect(isCrossOrigin('https://example.com/app.js', 'https://example.com')).toBe(false);
    expect(isCrossOrigin('not a url', 'https://example.com')).toBe(false);
  });
});
