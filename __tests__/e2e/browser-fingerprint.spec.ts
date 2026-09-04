import { test, expect } from '@playwright/test';

test.describe('Browser Fingerprint collection & filtering', () => {
  test('collects live browser signals and derives a stable fingerprint ID', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/browser-fingerprint/');

    const fingerprintId = page.locator('#fp-id');
    await expect(fingerprintId).toHaveText(/^[0-9a-f]{32}$/, { timeout: 15000 });
    const firstId = await fingerprintId.textContent();

    // Entropy summary reflects the collected signals
    await expect(page.locator('#fp-bits')).toHaveText(/^\d+(\.\d+)?$/);
    await expect(page.locator('#fp-verdict')).toContainText('identifiability');

    // Critical signals are present and rendered at the top
    const rows = page.locator('#fp-results > div');
    expect(await rows.count()).toBeGreaterThan(20);
    await expect(rows.first()).toContainText('Critical');
    await expect(page.locator('#fp-results')).toContainText('User agent string');
    await expect(page.locator('#fp-results')).toContainText('Canvas rendering hash');

    // Re-scanning the same browser yields the same ID
    await page.locator('#btn-rescan').click();
    await expect(fingerprintId).toHaveText(/^[0-9a-f]{32}$/, { timeout: 15000 });
    expect(await fingerprintId.textContent()).toBe(firstId);

    expect(pageErrors).toEqual([]);
  });

  test('filters signals by importance, query and grouping', async ({ page }) => {
    await page.goto('/browser-fingerprint/');
    await expect(page.locator('#fp-id')).toHaveText(/^[0-9a-f]{32}$/, { timeout: 15000 });

    const rows = page.locator('#fp-results > div');
    const total = await rows.count();

    await page.locator('#fp-importance button[data-importance="critical"]').click();
    const criticalCount = await rows.count();
    expect(criticalCount).toBeGreaterThan(0);
    expect(criticalCount).toBeLessThan(total);
    await expect(page.locator('#fp-results')).not.toContainText('Cookies enabled');

    await page.locator('#fp-importance button[data-importance="all"]').click();
    await page.locator('#fp-search').fill('time zone');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Time zone');

    await page.locator('#fp-search').fill('zzzz-no-match');
    await expect(page.locator('#fp-empty')).toBeVisible();

    await page.locator('#fp-search').fill('');
    await page.locator('#fp-view button[data-view="group"]').click();
    await expect(page.locator('#fp-results')).toContainText('Fingerprint Hashes');
  });

  test('is reachable from the featured row on the homepage', async ({ page }) => {
    await page.goto('/');

    const featuredGroup = page.locator('[data-group-cat="featured"]');
    await expect(featuredGroup).toBeVisible();
    await expect(featuredGroup).toContainText('Featured');

    await featuredGroup.getByRole('link', { name: /Browser Fingerprint/i }).click();
    await expect(page).toHaveURL(/\/browser-fingerprint\/$/);
  });
});
