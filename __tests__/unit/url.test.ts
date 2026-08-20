import { describe, it, expect } from 'vitest';
import { parseUrlString, buildUrlString, encodeUrl, decodeUrl } from '@/lib/url';

describe('URL Parser Engine (lib/url)', () => {
  it('parses URL components and query parameters accurately', () => {
    const raw = 'https://user:pass@iqverse.net:8080/tools/dnslookup?q=test&mode=fast#results';
    const parsed = parseUrlString(raw);

    expect(parsed.protocol).toBe('https:');
    expect(parsed.host).toBe('iqverse.net');
    expect(parsed.port).toBe('8080');
    expect(parsed.pathname).toBe('/tools/dnslookup');
    expect(parsed.hash).toBe('#results');
    expect(parsed.searchParams).toEqual([
      ['q', 'test'],
      ['mode', 'fast'],
    ]);
  });

  it('builds URL string with updated query parameters', () => {
    const built = buildUrlString({
      host: 'iqverse.net',
      pathname: '/search',
      queryParams: [
        ['term', 'tools'],
        ['page', '2'],
      ],
    });

    expect(built).toBe('https://iqverse.net/search?term=tools&page=2');
  });

  it('encodes and decodes URL strings', () => {
    const raw = 'https://iqverse.net/query?param=hello world';
    const enc = encodeUrl(raw);
    expect(enc).not.toContain(' ');
    expect(decodeUrl(enc)).toBe(raw);
  });
});
