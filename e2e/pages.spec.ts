import { test, expect } from '@playwright/test';
import { tools } from '../lib/tools';

// Derive all internal routes dynamically from tools definition + root homepage
const internalRoutes = Array.from(
  new Set([
    '/',
    ...tools.filter((t) => t.url.startsWith('/')).map((t) => t.url),
  ])
);

test.describe('E2E Page Health, Metadata & SEO Validation', () => {
  for (const route of internalRoutes) {
    test(`Page ${route} verifies status, title, metadata, canonical, H1, and JSON-LD`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (exception) => {
        pageErrors.push(exception.message);
      });

      // 1. Load page and verify HTTP 200 response
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);

      // 2. Ensure no unhandled Javascript runtime errors occurred on load
      expect(pageErrors).toEqual([]);

      // 3. Verify Page Title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      expect(title).toMatch(/IQVerse/i);

      // 4. Verify Meta Description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveCount(1);
      const metaDescContent = await metaDescription.getAttribute('content');
      expect(metaDescContent).toBeTruthy();
      expect(metaDescContent!.trim().length).toBeGreaterThan(10);

      // 5. Verify Canonical URL (ends with slash)
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);
      const canonicalHref = await canonical.getAttribute('href');
      expect(canonicalHref).toBeTruthy();
      expect(canonicalHref).toMatch(/^https?:\/\/.*\/$/);

      // 6. Verify OpenGraph Meta Tags
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveCount(1);
      const ogTitleContent = await ogTitle.getAttribute('content');
      expect(ogTitleContent).toBeTruthy();

      const ogDesc = page.locator('meta[property="og:description"]');
      await expect(ogDesc).toHaveCount(1);
      const ogDescContent = await ogDesc.getAttribute('content');
      expect(ogDescContent).toBeTruthy();

      // 7. Verify H1 Heading
      const h1 = page.locator('h1').first();
      await expect(h1).toHaveCount(1);
      const h1Text = (await h1.textContent()) || '';
      expect(h1Text.trim().length).toBeGreaterThan(0);

      // 8. Verify JSON-LD Structured Data
      const jsonLdScript = page.locator('script[type="application/ld+json"]').first();
      await expect(jsonLdScript).toHaveCount(1);
      const jsonLdContent = await jsonLdScript.textContent();
      expect(jsonLdContent).toBeTruthy();

      const parsedJsonLd = JSON.parse(jsonLdContent!);
      const jsonLdItems = Array.isArray(parsedJsonLd) ? parsedJsonLd : [parsedJsonLd];
      expect(jsonLdItems.length).toBeGreaterThan(0);
      for (const item of jsonLdItems) {
        expect(item['@context']).toBe('https://schema.org');
        expect(item['@type']).toBeTruthy();
      }
    });
  }
});


