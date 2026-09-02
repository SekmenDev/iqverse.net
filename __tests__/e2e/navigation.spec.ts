import { test, expect } from '@playwright/test';

test.describe('E2E Navigation & Layout Integration', () => {
  test('Homepage search filters the catalog in place and syncs the URL', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByLabel('Search tools');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Password');

    // Filter mode replaces the grouped view with a flat ranked grid
    await expect(page.locator('#flat-view')).toBeVisible();
    await expect(page.locator('#category-groups-container')).toBeHidden();
    await expect(page.locator('#tool-search-dropdown')).toBeHidden();

    const firstCard = page.locator('#flat-grid .tool-card-item').first();
    await expect(firstCard).toHaveAttribute('data-name', 'Password Generator');
    await expect(firstCard.locator('mark').first()).toBeVisible();

    await expect(page).toHaveURL(/\?q=Password/);
  });

  test('Homepage restores search and filters from the URL', async ({ page }) => {
    await page.goto('/?q=hash&cat=Security');

    await expect(page.getByLabel('Search tools')).toHaveValue('hash');
    await expect(page.locator('#cat-filters button[data-cat="Security"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    const cards = page.locator('#flat-grid .tool-card-item');
    expect(await cards.count()).toBeGreaterThan(0);

    for (const card of await cards.all()) {
      expect(await card.getAttribute('data-cats')).toContain('Security');
    }
  });

  test('Homepage finds a tool through an alias', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Search tools').fill('epoch');

    const names = await page.locator('#flat-grid .tool-card-item').evaluateAll(cards =>
      cards.map(card => card.getAttribute('data-name'))
    );
    expect(names).toContain('Timestamp Converter');
  });

  test('Homepage tag chips drive search and category chips drive filtering', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-filter-cat="Design"]').first().click();
    await expect(page.locator('#cat-filters button[data-cat="Design"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page).toHaveURL(/cat=Design/);

    await page.locator('#flat-grid [data-filter-tag]').first().click();
    await expect(page.getByLabel('Search tools')).not.toHaveValue('');
    await expect(page).toHaveURL(/\?q=/);
  });

  test('Homepage suggests near misses when nothing matches', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Search tools').fill('favicn zzz');

    await expect(page.locator('#catalog-empty-state')).toBeVisible();
    await expect(page.locator('#empty-suggestions a').first()).toBeVisible();
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

  test('Tool page search bar renders, filters tools and navigates', async ({ page }) => {
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
    const defaultBtn = page.locator('#sort-filters button[data-sort="default"]');
    const azBtn = page.locator('#sort-filters button[data-sort="az"]');

    await expect(defaultBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(azBtn).toHaveAttribute('aria-pressed', 'false');

    await azBtn.click();
    await expect(azBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(defaultBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(page).toHaveURL(/sort=az/);

    // A-Z mode renders one flat grid sorted alphabetically
    const azCards = page.locator('#flat-grid .tool-card-item');
    expect(await azCards.count()).toBeGreaterThan(5);
    await expect(azCards.first()).toHaveAttribute('data-name', 'AI Agents Scanner');

    await defaultBtn.click();
    await expect(defaultBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(azBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#flat-view')).toBeHidden();
    await expect(page.locator('#category-groups-container')).toBeVisible();
  });

  test('Homepage category filter matches secondary categories too', async ({ page }) => {
    await page.goto('/');
    const secBtn = page.locator('#cat-filters button[data-cat="Security"]');
    await expect(secBtn).toBeVisible();

    await secBtn.click();
    await expect(secBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#cat-filters button[data-cat="all"]')).toHaveAttribute(
      'aria-pressed',
      'false'
    );

    const cards = page.locator('#flat-grid .tool-card-item');
    const names = await cards.evaluateAll(items => items.map(i => i.getAttribute('data-name')));

    // Primary Security tool and a tool that only lists Security as a secondary category
    expect(names).toContain('HeaderScan');
    expect(names).toContain('Cookie Inspector');

    for (const card of await cards.all()) {
      expect(await card.getAttribute('data-cats')).toContain('Security');
    }
  });

  test('Homepage status filter narrows the catalog to SaaS products', async ({ page }) => {
    await page.goto('/');
    await page.locator('#status-filters button[data-status="saas"]').click();

    await expect(page).toHaveURL(/status=saas/);
    const cards = page.locator('#flat-grid .tool-card-item');
    expect(await cards.count()).toBeGreaterThan(0);

    for (const card of await cards.all()) {
      expect(await card.getAttribute('data-type')).toBe('saas');
    }
  });
});
