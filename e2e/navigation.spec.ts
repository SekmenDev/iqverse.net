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

  test('Custom 404 page loads and renders error layout with standard header', async ({ page }) => {
    const response = await page.goto('/404.html');
    expect([200, 404]).toContain(response?.status());
    const bodyText = await page.textContent('body');
    expect(bodyText).toMatch(/404|Page not found|Lost in the matrix/i);

    // Verify header elements match general layout
    const navLogo = page.locator('nav a[href="/"]');
    await expect(navLogo).toBeVisible();
    await expect(navLogo.locator('#theme-toggle-btn')).toBeVisible();

    const toolSearchInput = page.locator('#tool-nav-search');
    await expect(toolSearchInput).toBeVisible();

    const githubLink = page.locator('nav a[aria-label="GitHub"]');
    await expect(githubLink).toBeVisible();
  });

  test('Tool page search bar renders, filters tools, and navigates', async ({ page }) => {
    await page.goto('/agentscan/');
    const toolSearchInput = page.locator('#tool-nav-search');
    await expect(toolSearchInput).toBeVisible();

    // Type query in tool search
    await toolSearchInput.fill('QR Forge');
    const dropdown = page.locator('#tool-search-dropdown');
    await expect(dropdown).toBeVisible();

    // Verify search results contain QR Forge
    const qrResult = page.locator('#tool-search-results .tool-search-item', { hasText: 'QR Forge' });
    await expect(qrResult).toBeVisible();

    // Click result to navigate
    await qrResult.click();
    await expect(page).toHaveURL(/.*\/qrforge\/?/);

    // Verify search bar exists on the new tool page as well
    const newToolSearch = page.locator('#tool-nav-search');
    await expect(newToolSearch).toBeVisible();
  });

  test('Tool page search closes on Escape key', async ({ page }) => {
    await page.goto('/json/');
    const toolSearchInput = page.locator('#tool-nav-search');
    await expect(toolSearchInput).toBeVisible();

    await toolSearchInput.fill('Diff');
    const dropdown = page.locator('#tool-search-dropdown');
    await expect(dropdown).toBeVisible();

    await toolSearchInput.press('Escape');
    await expect(dropdown).toBeHidden();
  });
});
