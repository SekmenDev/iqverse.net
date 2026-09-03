import { test, expect } from '@playwright/test';

test.describe('Mandatory CAPTCHA Challenge Enforcement E2E', () => {
  test('AgentScan blocks direct submission and example buttons when CAPTCHA is unsolved', async ({ page }) => {
    await page.goto('/agentscan/');

    const form = page.locator('#agent-scan-form');
    const submitBtn = page.locator('#btn-run-scan');
    const loadingBox = page.locator('#scan-loading-box');
    const errorNotice = form.locator('.cap-captcha-error');

    // 1. Direct Submit attempt without CAPTCHA
    await submitBtn.click();
    await expect(loadingBox).toBeHidden();
    await expect(errorNotice).toBeVisible();
    await expect(errorNotice).toContainText(/complete the CAPTCHA challenge/i);

    // 2. Example button click without CAPTCHA
    const exampleBtn = page.locator('.example-btn').first();
    if (await exampleBtn.isVisible()) {
      await exampleBtn.click();
      await expect(loadingBox).toBeHidden();
      await expect(errorNotice).toBeVisible();
    }
  });

  test('HeaderScan blocks direct submission and sample buttons when CAPTCHA is unsolved', async ({ page }) => {
    await page.goto('/headers/');

    const form = page.locator('#header-scan-form');
    const submitBtn = page.locator('#scan-submit-btn');
    const loadingBox = page.locator('#scan-loading');
    const errorNotice = form.locator('.cap-captcha-error');

    // 1. Direct Submit attempt without CAPTCHA
    await submitBtn.click();
    await expect(loadingBox).toBeHidden();
    await expect(errorNotice).toBeVisible();
    await expect(errorNotice).toContainText(/complete the CAPTCHA challenge/i);

    // 2. Sample button click without CAPTCHA
    const sampleBtn = page.locator('.sample-btn').first();
    if (await sampleBtn.isVisible()) {
      await sampleBtn.click();
      await expect(loadingBox).toBeHidden();
      await expect(errorNotice).toBeVisible();
    }
  });

  test('LinkRadar blocks crawler start when CAPTCHA is unsolved', async ({ page }) => {
    await page.goto('/linkradar/');

    const form = page.locator('#linkradar-form');
    const submitBtn = page.locator('#btn-start-scan');
    const stopBtn = page.locator('#btn-stop-scan');
    const statsCard = page.locator('#scan-stats-card');
    const errorNotice = form.locator('.cap-captcha-error');

    // Direct Submit attempt without CAPTCHA
    await submitBtn.click();
    await expect(stopBtn).toBeHidden();
    await expect(statsCard).toBeHidden();
    await expect(errorNotice).toBeVisible();
    await expect(errorNotice).toContainText(/complete the CAPTCHA challenge/i);
  });

  test('Sitemap Generator blocks crawler start when CAPTCHA is unsolved and toggles text formats', async ({ page }) => {
    await page.goto('/sitemap-generator/');

    const form = page.locator('#sitemap-crawler-form');
    const submitBtn = page.locator('#btn-start-crawl');
    const stopBtn = page.locator('#btn-stop-crawl');
    const statusBox = page.locator('#crawl-status-box');
    const errorNotice = form.locator('.cap-captcha-error');

    // Direct submit attempt without CAPTCHA
    await submitBtn.click();
    await expect(stopBtn).toBeHidden();
    await expect(statusBox).toBeHidden();
    await expect(errorNotice).toBeVisible();
    await expect(errorNotice).toContainText(/complete the CAPTCHA challenge/i);

    // Verify format switcher between XML and Plain text
    const outputArea = page.locator('#sitemapOutput');
    const btnFormatXml = page.locator('#btn-format-xml');
    const btnFormatTxt = page.locator('#btn-format-txt');
    const btnDownload = page.locator('#btn-download-sitemap');

    await expect(outputArea).toHaveValue(/<\?xml/);
    await expect(btnDownload).toHaveText('Download sitemap.xml');

    await btnFormatTxt.click();
    await expect(outputArea).not.toHaveValue(/<\?xml/);
    await expect(outputArea).toHaveValue(/https:\/\/iqverse\.net/);
    await expect(btnDownload).toHaveText('Download sitemap.txt');

    await btnFormatXml.click();
    await expect(outputArea).toHaveValue(/<\?xml/);
    await expect(btnDownload).toHaveText('Download sitemap.xml');
  });

  test('GTR waitlist blocks submission when CAPTCHA is unsolved', async ({ page }) => {
    await page.goto('/gtr/');

    const form = page.locator('#waitlist-form');
    const emailInput = page.locator('#waitlist-email');
    const submitBtn = page.locator('#waitlist-submit');
    const errorNotice = form.locator('.cap-captcha-error');
    const statusEl = page.locator('#waitlist-status');

    await emailInput.fill('waitlist-test@example.com');
    await submitBtn.click();

    await expect(errorNotice).toBeVisible();
    await expect(errorNotice).toContainText(/complete the CAPTCHA challenge/i);
    await expect(statusEl).toHaveText('');
  });
});
