import { describe, it, expect } from 'vitest';
import { generateRobotsTxt, testRobotsPathAccess, ROBOTS_BOT_PRESETS } from '@/lib/robots';

describe('Robots.txt Engine (lib/robots)', () => {
  it('generates valid robots.txt with groups and sitemaps', () => {
    const txt = generateRobotsTxt({
      groups: [
        {
          userAgent: '*',
          disallow: ['/admin', '/private/'],
          allow: ['/public'],
          crawlDelay: 2,
        },
        {
          userAgent: 'GPTBot',
          disallow: ['/'],
        },
      ],
      sitemaps: ['https://iqverse.net/sitemap.xml'],
      host: 'iqverse.net',
    });

    expect(txt).toContain('User-agent: *');
    expect(txt).toContain('Disallow: /admin');
    expect(txt).toContain('Allow: /public');
    expect(txt).toContain('Crawl-delay: 2');
    expect(txt).toContain('User-agent: GPTBot');
    expect(txt).toContain('Disallow: /');
    expect(txt).toContain('Sitemap: https://iqverse.net/sitemap.xml');
    expect(txt).toContain('Host: iqverse.net');
  });

  it('tests path access rules accurately', () => {
    const groups = [
      {
        userAgent: '*',
        disallow: ['/admin', '/api/secret'],
        allow: ['/api/public'],
      },
    ];

    expect(testRobotsPathAccess('/admin/dashboard', groups, '*').allowed).toBe(false);
    expect(testRobotsPathAccess('/api/secret/keys', groups, '*').allowed).toBe(false);
    expect(testRobotsPathAccess('/api/public/posts', groups, '*').allowed).toBe(true);
    expect(testRobotsPathAccess('/home', groups, '*').allowed).toBe(true);
  });

  it('provides bot presets', () => {
    expect(ROBOTS_BOT_PRESETS.length).toBeGreaterThan(5);
    const gpt = ROBOTS_BOT_PRESETS.find((b) => b.name === 'GPTBot');
    expect(gpt).toBeDefined();
    expect(gpt?.vendor).toBe('OpenAI');
  });
});
