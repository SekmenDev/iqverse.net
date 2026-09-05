import { test, expect } from '@playwright/test';

test.describe('Password Analyzer Rating & Pattern Feedback', () => {
  test('rates common passwords as very weak and explains why', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/password-analyzer/');

    const input = page.locator('#pwdInput');
    const badge = page.locator('#rating-badge');
    const patterns = page.locator('#patterns-list > div');

    await input.fill('password');
    await expect(badge).toHaveText('Very Weak');
    await expect(patterns.first()).toContainText('Breached password');
    await expect(page.locator('#feedback-warning')).toBeVisible();

    await input.fill('111111');
    await expect(badge).toHaveText('Very Weak');

    await input.fill('Kx9#m$P2vL!8qZb7@wRt');
    await expect(badge).toHaveText('Very Strong');
    await expect(page.locator('#patterns-box')).toBeHidden();
    await expect(page.locator('#offline-fast-time')).toHaveText('centuries');

    expect(pageErrors).toEqual([]);
  });
});
