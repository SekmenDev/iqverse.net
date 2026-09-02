import { describe, it, expect } from 'vitest';
import { highlight, literalRanges, searchTools, suggestTools, tokenize } from '@/lib/tool-search';
import { tools } from '@/lib/tools';

const names = (query: string, options = {}) =>
  searchTools(query, options).map(result => result.tool.name);

describe('lib/tool-search.ts - tokenize', () => {
  it('lowercases and splits on whitespace and commas', () => {
    expect(tokenize('  JSON,  CSV ')).toEqual(['json', 'csv']);
  });

  it('returns nothing for an empty query', () => {
    expect(tokenize('   ')).toEqual([]);
  });
});

describe('lib/tool-search.ts - searchTools', () => {
  it('returns every tool in registry order for an empty query', () => {
    const results = searchTools('');
    expect(results).toHaveLength(tools.length);
    expect(results[0].tool.name).toBe(tools[0].name);
  });

  it('ranks an exact name match first', () => {
    expect(names('json formatter')[0]).toBe('JSON Formatter');
    expect(names('qr forge')[0]).toBe('QR Forge');
  });

  it('ranks a name prefix above a description-only mention', () => {
    const ranked = names('cron');
    expect(ranked[0]).toBe('Cron Expression Builder');
  });

  it('finds a tool through its aliases', () => {
    expect(names('epoch')).toContain('Timestamp Converter');
    expect(names('guid')).toContain('UUID / ULID Generator');
    expect(names('beautify')).toContain('JSON Formatter');
  });

  it('finds a tool through its tags', () => {
    expect(names('svgo')).toContain('SVG Optimizer');
  });

  it('requires every token to match', () => {
    expect(names('json csv')).toContain('Data Converter');
    expect(names('json xylophone')).toEqual([]);
  });

  it('tolerates a typo', () => {
    expect(names('favicn')).toContain('Favicon Generator');
  });

  it('returns nothing for a query that matches no tool', () => {
    expect(names('xyz999nonexistentquery')).toEqual([]);
  });

  it('respects the limit', () => {
    expect(searchTools('', { limit: 3 })).toHaveLength(3);
    expect(searchTools('generator', { limit: 2 }).length).toBeLessThanOrEqual(2);
  });

  it('filters by any declared category, not just the primary', () => {
    const securityUrls = searchTools('', { category: 'Security' }).map(r => r.tool.url);
    const passwordGenerator = tools.find(t => t.name === 'Password Generator');
    const csrfSecondary = tools.find(t => t.name === 'Cookie Inspector');

    expect(passwordGenerator && securityUrls).toContain(passwordGenerator?.url);
    expect(csrfSecondary && securityUrls).toContain(csrfSecondary?.url);
  });

  it('filters by status', () => {
    const saas = searchTools('', { status: 'saas' });
    expect(saas.length).toBeGreaterThan(0);
    saas.forEach(result => expect(result.tool.type).toBe('saas'));
  });

  it('combines a query with category and status filters', () => {
    const results = searchTools('hash', { category: 'Security', status: 'open' });
    expect(results.length).toBeGreaterThan(0);
    results.forEach(result => {
      expect(result.tool.cats).toContain('Security');
      expect(result.tool.type).toBe('open');
    });
  });

  it('sorts alphabetically when az overrides relevance', () => {
    const sorted = names('generator', { sort: 'az' });
    expect([...sorted].sort((a, b) => a.localeCompare(b))).toEqual(sorted);
  });

  it('reports literal match ranges for highlighting', () => {
    const [top] = searchTools('json');
    expect(top.nameRanges.length).toBeGreaterThan(0);
  });
});

describe('lib/tool-search.ts - literalRanges', () => {
  it('finds every case-insensitive occurrence', () => {
    expect(literalRanges('JSON to json', ['json'])).toEqual([
      [0, 4],
      [8, 12],
    ]);
  });

  it('merges overlapping ranges from different tokens', () => {
    expect(literalRanges('format', ['for', 'orma'])).toEqual([[0, 5]]);
  });

  it('returns nothing when no token matches', () => {
    expect(literalRanges('hello', ['world'])).toEqual([]);
  });
});

describe('lib/tool-search.ts - highlight', () => {
  it('wraps matched ranges in mark elements', () => {
    expect(highlight('JSON Formatter', [[0, 4]])).toBe('<mark>JSON</mark> Formatter');
  });

  it('escapes text outside the matches', () => {
    expect(highlight('<b>hi</b>', [])).toBe('&lt;b&gt;hi&lt;/b&gt;');
  });

  it('escapes text inside the matches', () => {
    expect(highlight('a<b', [[1, 2]])).toBe('a<mark>&lt;</mark>b');
  });
});

describe('lib/tool-search.ts - suggestTools', () => {
  it('suggests near misses for a failed query', () => {
    expect(suggestTools('favicn').length).toBeGreaterThan(0);
  });

  it('suggests nothing for an empty query', () => {
    expect(suggestTools('')).toEqual([]);
  });

  it('respects the limit', () => {
    expect(suggestTools('generator', 2).length).toBeLessThanOrEqual(2);
  });
});
