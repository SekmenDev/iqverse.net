import { test, expect } from '@playwright/test';

test.describe('QRForge Step Navigation & Style Interactions', () => {
  test('Step navigation switches tabs and retains proper active styles', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/qrforge/');
    expect(pageErrors).toEqual([]);

    const step1Btn = page.locator('button[data-step="content"]');
    const step2Btn = page.locator('button[data-step="style"]');
    const step3Btn = page.locator('button[data-step="logo"]');
    const step4Btn = page.locator('button[data-step="export"]');

    const pane1 = page.locator('#tab-pane-content');
    const pane2 = page.locator('#tab-pane-style');
    const pane3 = page.locator('#tab-pane-logo');
    const pane4 = page.locator('#tab-pane-export');

    // Initial state: Step 1 is active
    await expect(step1Btn).toHaveAttribute('data-active', 'true');
    await expect(step2Btn).toHaveAttribute('data-active', 'false');
    await expect(pane1).toBeVisible();
    await expect(pane2).toBeHidden();

    // Click Step 2 (Style)
    await step2Btn.click();
    await expect(step2Btn).toHaveAttribute('data-active', 'true');
    await expect(step1Btn).toHaveAttribute('data-active', 'false');
    await expect(step1Btn).toHaveAttribute('data-done', 'true');
    await expect(pane2).toBeVisible();
    await expect(pane1).toBeHidden();

    // Click Dot Style buttons
    const roundedDotBtn = page.locator('button.btn-dot-style[data-dot="rounded"]');
    await roundedDotBtn.click();
    await expect(roundedDotBtn).toHaveAttribute('data-active', 'true');

    const squareDotBtn = page.locator('button.btn-dot-style[data-dot="square"]');
    await expect(squareDotBtn).toHaveAttribute('data-active', 'false');

    // Click Step 3 (Logo)
    await step3Btn.click();
    await expect(step3Btn).toHaveAttribute('data-active', 'true');
    await expect(step2Btn).toHaveAttribute('data-active', 'false');
    await expect(step2Btn).toHaveAttribute('data-done', 'true');
    await expect(pane3).toBeVisible();

    // Click Step 4 (Export)
    await step4Btn.click();
    await expect(step4Btn).toHaveAttribute('data-active', 'true');
    await expect(pane4).toBeVisible();

    // Click SVG export format
    const svgFmtBtn = page.locator('button.btn-export-fmt[data-fmt="svg"]');
    await svgFmtBtn.click();
    await expect(svgFmtBtn).toHaveAttribute('data-active', 'true');
    await expect(page.locator('#export-ext-label')).toHaveText('.svg');

    // Click back to Step 1
    await step1Btn.click();
    await expect(step1Btn).toHaveAttribute('data-active', 'true');
    await expect(step4Btn).toHaveAttribute('data-active', 'false');
    await expect(pane1).toBeVisible();

    // Test Type Switching
    const wifiTypeBtn = page.locator('button.qr-type-btn[data-type="wifi"]');
    await wifiTypeBtn.click();
    await expect(wifiTypeBtn).toHaveAttribute('data-active', 'true');
    await expect(page.locator('#field-type-wifi')).toBeVisible();
    await expect(page.locator('#field-type-url')).toBeHidden();

    expect(pageErrors).toEqual([]);
  });
});
