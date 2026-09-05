import { test, expect } from '@playwright/test';

test.describe('Cookie Inspector', () => {
  test('parses pasted Set-Cookie headers', async ({ page }) => {
    await page.goto('/cookie-inspector/');

    await expect(page.locator('#cookie-total-count')).toHaveText('2');
    await expect(page.locator('#cookies-list')).toContainText('session_id');
    await expect(page.locator('#cookies-list')).toContainText('tracking_id');
    await expect(page.locator('#cookie-count-warn')).toHaveText('1');
  });

  test('lists the cookies the browser exposes on this site', async ({ context, page, baseURL }) => {
    await context.addCookies([
      { name: 'theme', value: 'dark', url: baseURL as string },
      { name: 'session_token', value: 'abc123', url: baseURL as string },
    ]);

    await page.goto('/cookie-inspector/');
    await page.locator('.cookie-mode-btn[data-mode="browser"]').click();

    await expect(page.locator('#cookie-header-panel')).toBeHidden();
    await expect(page.locator('#cookie-browser-panel')).toBeVisible();
    await expect(page.locator('#cookie-host')).toHaveText('localhost');
    await expect(page.locator('#cookie-browser-total')).toHaveText('2');
    await expect(page.locator('#cookie-total-count')).toHaveText('2');

    const list = page.locator('#cookies-list');
    await expect(list).toContainText('theme');
    await expect(list).toContainText('session_token');
    await expect(list).toContainText('Readable by JavaScript');

    // Secure and HttpOnly are unknowable from document.cookie, so their filters are hidden
    await expect(page.locator('#cookie-pill-secure')).toBeHidden();
    await expect(page.locator('#cookie-pill-httponly')).toBeHidden();

    // Only the sensitively named cookie is flagged
    await expect(page.locator('#cookie-count-warn')).toHaveText('1');
    await page.locator('.cookie-filter-btn[data-filter="warnings"]').click();
    await expect(page.locator('#cookie-visible-count')).toHaveText('1');
    await expect(list).toContainText('not protected by HttpOnly');
  });

  test('refreshes the browser cookie list and reports an empty site', async ({ context, page }) => {
    await page.goto('/cookie-inspector/');
    await page.locator('.cookie-mode-btn[data-mode="browser"]').click();
    await expect(page.locator('#cookie-empty-state')).toBeVisible();
    await expect(page.locator('#cookie-empty-title')).toContainText('No readable cookies');

    await page.evaluate(() => {
      document.cookie = 'added_later=1; path=/';
    });
    await page.locator('#btn-refresh-cookies').click();

    await expect(page.locator('#cookie-browser-total')).toHaveText('1');
    await expect(page.locator('#cookies-list')).toContainText('added_later');

    await context.clearCookies();
  });

  test('escapes cookie content instead of rendering it as HTML', async ({ context, page, baseURL }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await context.addCookies([
      { name: 'xss_probe', value: '<img src=x onerror=window.__pwned=1>', url: baseURL as string },
    ]);

    await page.goto('/cookie-inspector/');
    await page.locator('.cookie-mode-btn[data-mode="browser"]').click();

    await expect(page.locator('#cookies-list')).toContainText('<img src=x onerror=window.__pwned=1>');
    expect(await page.locator('#cookies-list img').count()).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
    expect(pageErrors).toEqual([]);
  });
});
