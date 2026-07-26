import { test, expect } from '@playwright/test';

const routes = [
  { path: '/' },
  { path: '/password/' },
  { path: '/json/' },
  { path: '/cssunits/' },
  { path: '/regex/' },
  { path: '/encodelab/' },
  { path: '/dataconverter/' },
  { path: '/dnslookup/' },
  { path: '/headers/' },
  { path: '/qrforge/' },
  { path: '/chromata/' },
  { path: '/agentscan/' },
];

test.describe('E2E Page Health Checks', () => {
  for (const route of routes) {
    test(`Page ${route.path} loads cleanly without errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);

      // Verify page element rendered
      const mainElement = page.locator('main, #main-content, h1').first();
      await expect(mainElement).toBeVisible();

      // Ensure no severe Javascript console errors were triggered during load
      expect(consoleErrors).toEqual([]);
    });
  }
});
