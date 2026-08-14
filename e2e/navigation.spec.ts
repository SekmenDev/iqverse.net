import { test, expect } from '@playwright/test';

test.describe('E2E Navigation & Layout Integration', () => {
  test('Homepage search filters tools catalog dynamically', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByLabel('Search tools');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Password');
    const toolCard = page.getByText(/password generator/i).first();
    await expect(toolCard).toBeVisible();
  });

  test('Custom 404 page loads and renders error layout', async ({ page }) => {
    const response = await page.goto('/404.html');
    expect(response?.status()).toBe(200);
    const bodyText = await page.textContent('body');
    expect(bodyText).toMatch(/404|Page not found|Lost in the matrix/i);
  });
});
