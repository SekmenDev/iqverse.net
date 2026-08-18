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

  test('Homepage sort buttons switch between Default and A-Z sorting', async ({ page }) => {
    await page.goto('/');
    const defaultBtn = page.locator('#sort-default-btn');
    const azBtn = page.locator('#sort-az-btn');

    await expect(defaultBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(azBtn).toHaveAttribute('aria-pressed', 'false');

    // Click A-Z
    await azBtn.click();
    await expect(azBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(defaultBtn).toHaveAttribute('aria-pressed', 'false');

    // In A-Z mode, the az-grid contains cards sorted alphabetically
    const azCards = page.locator('#az-grid .tool-card-item');
    const count = await azCards.count();
    expect(count).toBeGreaterThan(5);

    const firstCardName = await azCards.first().getAttribute('data-name');
    expect(firstCardName).toBe('AI Agents Scanner');

    // Click back to Default
    await defaultBtn.click();
    await expect(defaultBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(azBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#az-grid')).toBeHidden();
    await expect(page.locator('#category-groups-container')).toBeVisible();
  });

  test('Homepage category and status filters update active states', async ({ page }) => {
    await page.goto('/');
    const secBtn = page.locator('#cat-filters button[data-cat="Security"]');
    await expect(secBtn).toBeVisible();

    await secBtn.click();
    await expect(secBtn).toHaveAttribute('aria-pressed', 'true');
    const allCatBtn = page.locator('#cat-filters button[data-cat="all"]');
    await expect(allCatBtn).toHaveAttribute('aria-pressed', 'false');

    // Verify only security category group is visible
    const secGroup = page.locator('.category-group[data-group-cat="Security"]');
    await expect(secGroup).toBeVisible();
    const browserGroup = page.locator('.category-group[data-group-cat="Browser Tools"]');
    await expect(browserGroup).toBeHidden();
  });
});
