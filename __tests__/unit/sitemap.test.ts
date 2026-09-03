import { describe, it, expect } from 'vitest';
import {
  generateSitemapXml,
  generateSitemapTxt,
  normalizeSitemapUrl,
  parseBulkSitemapPaths,
} from '@/lib/sitemap';

describe('Sitemap Generator Engine (lib/sitemap)', () => {
  it('parses bulk paths and builds full URLs', () => {
    const raw = '/\n/about\n/tools/dnslookup\nhttps://iqverse.net/blog';
    const entries = parseBulkSitemapPaths('https://iqverse.net', raw, '0.8', 'weekly');

    expect(entries).toHaveLength(4);
    expect(entries[0].loc).toBe('https://iqverse.net/');
    expect(entries[1].loc).toBe('https://iqverse.net/about');
    expect(entries[2].loc).toBe('https://iqverse.net/tools/dnslookup');
    expect(entries[3].loc).toBe('https://iqverse.net/blog');
  });

  it('generates standard XML sitemap output', () => {
    const entries = [
      {
        loc: 'https://iqverse.net/',
        lastmod: '2026-08-20',
        changefreq: 'daily',
        priority: '1.0',
      },
    ];

    const xml = generateSitemapXml(entries);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://iqverse.net/</loc>');
    expect(xml).toContain('<lastmod>2026-08-20</lastmod>');
    expect(xml).toContain('<changefreq>daily</changefreq>');
    expect(xml).toContain('<priority>1.0</priority>');
    expect(xml).toContain('</urlset>');
  });

  it('generates plain text sitemap output', () => {
    const entries = [
      { loc: 'https://example.com/' },
      { loc: 'https://example.com/about' },
      { loc: 'https://example.com/contact' },
      { loc: 'https://example.com/about' },
    ];

    const txt = generateSitemapTxt(entries);
    expect(txt).toBe('https://example.com/\nhttps://example.com/about\nhttps://example.com/contact');
  });

  it('normalizes internal URLs and filters out non-html assets or external domains', () => {
    const base = 'https://example.com';
    expect(normalizeSitemapUrl('/page#section', base)).toBe('https://example.com/page');
    expect(normalizeSitemapUrl('https://example.com/blog?page=2', base)).toBe('https://example.com/blog?page=2');
    expect(normalizeSitemapUrl('https://otherdomain.com/path', base)).toBeNull();
    expect(normalizeSitemapUrl('/image.png', base)).toBeNull();
    expect(normalizeSitemapUrl('/styles.css', base)).toBeNull();
    expect(normalizeSitemapUrl('/doc.pdf', base)).toBeNull();
    expect(normalizeSitemapUrl('javascript:void(0)', base)).toBeNull();
  });
});
