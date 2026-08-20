import { describe, it, expect } from 'vitest';
import { FAVICON_SIZES, generateFaviconHtmlSnippet, generateWebManifest } from '@/lib/favicon';

describe('Favicon Engine (lib/favicon)', () => {
  it('defines standard favicon size configurations', () => {
    expect(FAVICON_SIZES).toHaveLength(6);
    expect(FAVICON_SIZES.map((s) => s.size)).toEqual([16, 32, 48, 180, 192, 512]);
  });

  it('generates complete favicon HTML head snippet', () => {
    const snippet = generateFaviconHtmlSnippet();
    expect(snippet).toContain('<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />');
    expect(snippet).toContain('<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />');
    expect(snippet).toContain('<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />');
    expect(snippet).toContain('<link rel="manifest" href="/site.webmanifest" />');
  });

  it('generates valid web manifest JSON string', () => {
    const manifestStr = generateWebManifest('Custom App', 'App');
    const parsed = JSON.parse(manifestStr);

    expect(parsed.name).toBe('Custom App');
    expect(parsed.short_name).toBe('App');
    expect(parsed.icons).toHaveLength(2);
    expect(parsed.display).toBe('standalone');
  });
});
