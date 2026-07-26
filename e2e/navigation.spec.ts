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

  test('Custom 404 page loads for non-existent routes', async ({ page }) => {
    const response = await page.goto('/non-existent-page-route');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1, h2, main').first()).toBeVisible();
  });
});
