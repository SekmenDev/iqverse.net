import { describe, it, expect } from 'vitest';
import { extractLinksFromHtml, aggregateLinkStats } from '@/lib/linkradar';

describe('LinkRadar Engine (lib/linkradar)', () => {
  it('extracts unique valid absolute URLs from HTML content', () => {
    const html = `
      <a href="/tools/dnslookup">DNS</a>
      <a href="https://external.com/docs">Docs</a>
      <a href="#section">Hash</a>
      <a href="mailto:info@iqverse.net">Email</a>
      <a href="javascript:void(0)">JS</a>
      <img src="/logo.png" />
    `;

    const links = extractLinksFromHtml(html, 'https://iqverse.net/home');
    const urls = links.map((l) => l.url);
    expect(urls).toContain('https://iqverse.net/tools/dnslookup');
    expect(urls).toContain('https://external.com/docs');
    expect(urls).not.toContain('#section');
    expect(urls).not.toContain('mailto:info@iqverse.net');
  });

  it('aggregates link crawl status statistics', () => {
    const items = [
      { url: 'https://iqverse.net/1', status: 200 },
      { url: 'https://iqverse.net/2', status: 204 },
      { url: 'https://iqverse.net/3', status: 301 },
      { url: 'https://iqverse.net/4', status: 404 },
      { url: 'https://iqverse.net/5', status: 500 },
    ];

    const stats = aggregateLinkStats(items);
    expect(stats.total).toBe(5);
    expect(stats.success2xx).toBe(2);
    expect(stats.redirect3xx).toBe(1);
    expect(stats.broken).toBe(2);
  });
});
