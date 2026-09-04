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

  test('runs the private browsing and Tor checks without any network request', async ({ page }) => {
    let edgeRequests = 0;
    await page.route('**/api/v1/network', (route) => {
      edgeRequests += 1;
      void route.abort();
    });

    await page.goto('/browser-fingerprint/');

    await expect(page.locator('#card-private')).toContainText(/browsing window|browsing indicators|incognito/i);
    await expect(page.locator('#card-tor')).toContainText(/Tor|anti-fingerprinting/i);
    await expect(page.locator('#card-vpn')).toContainText('Check my IP & VPN status');

    expect(edgeRequests).toBe(0);
  });

  test('reports IP, VPN and Tor once the opt-in check runs', async ({ page }) => {
    await page.route('**/api/v1/network', (route) =>
      route.fulfill({
        json: {
          ip: '203.0.113.42',
          ipVersion: 'IPv4',
          asn: 9009,
          organization: 'M247 Europe SRL',
          city: 'Amsterdam',
          region: 'North Holland',
          country: 'NL',
          continent: 'EU',
          postalCode: '1012',
          latitude: '52.37',
          longitude: '4.89',
          timezone: 'Europe/Amsterdam',
          colo: 'AMS',
          httpProtocol: 'HTTP/3',
          tlsVersion: 'TLSv1.3',
          tlsCipher: 'AEAD-AES128-GCM-SHA256',
          clientTcpRtt: 21,
          torExit: true,
          forwardedHops: 1,
          proxyHeaders: [],
        },
      })
    );

    await page.goto('/browser-fingerprint/');
    await expect(page.locator('#fp-id')).toHaveText(/^[0-9a-f]{32}$/, { timeout: 15000 });

    await page.locator('#btn-check-network').click();

    const vpnCard = page.locator('#card-vpn');
    await expect(vpnCard).toContainText('commercial VPN', { timeout: 10000 });
    await expect(vpnCard).toContainText('M247 Europe SRL');

    const details = page.locator('#net-details');
    await expect(details).toContainText('203.0.113.42');
    await expect(details).toContainText('Amsterdam, North Holland, NL');
    await expect(details).toContainText('AS9009');

    // The exit node tag upgrades the Tor verdict from heuristic to certain
    await expect(page.locator('#card-tor')).toContainText('You are using Tor');
  });

  test('degrades gracefully when the edge lookup is unreachable', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.route('**/api/v1/network', (route) => route.fulfill({ status: 500, body: 'nope' }));

    await page.goto('/browser-fingerprint/');
    await page.locator('#btn-check-network').click();

    await expect(page.locator('#card-vpn')).toContainText('did not reach the edge');
    await expect(page.locator('#btn-check-network')).toBeEnabled();
    await expect(page.locator('#btn-check-network')).toHaveText('Retry IP & VPN check');
    expect(pageErrors).toEqual([]);
  });

  test('labels which signals feed the fingerprint ID', async ({ page }) => {
    await page.goto('/browser-fingerprint/');
    await expect(page.locator('#fp-id')).toHaveText(/^[0-9a-f]{32}$/, { timeout: 15000 });

    const results = page.locator('#fp-results');
    await expect(results).toContainText('in fingerprint ID');
    await expect(results).toContainText('varies per session');

    // Viewport size is deliberately excluded so a resize does not change the ID
    const viewportRow = page.locator('#fp-results > div').filter({ hasText: 'Viewport size' });
    await expect(viewportRow).toContainText('varies per session');
  });

  test('recognises the browser on a return visit and forgets on request', async ({ page }) => {
    await page.goto('/browser-fingerprint/');
    const visitsCard = page.locator('#card-visits');
    await expect(visitsCard).toContainText('First visit recorded', { timeout: 15000 });

    await page.reload();
    await expect(visitsCard).toContainText('Recognised 2 times', { timeout: 15000 });
    await expect(visitsCard).toContainText('has not changed');

    await page.reload();
    await expect(visitsCard).toContainText('Recognised 3 times', { timeout: 15000 });

    await page.locator('#btn-forget-visits').click();
    await expect(visitsCard).toContainText('No local record');

    await page.reload();
    await expect(visitsCard).toContainText('First visit recorded', { timeout: 15000 });
  });

  test('reports signal consistency and upgrades it with request headers', async ({ page }) => {
    await page.route('**/api/v1/network', (route) =>
      route.fulfill({
        json: {
          ip: '198.51.100.9',
          ipVersion: 'IPv4',
          asn: 3320,
          organization: 'Deutsche Telekom AG',
          city: 'Berlin',
          region: 'Berlin',
          country: 'DE',
          timezone: 'Europe/Berlin',
          colo: 'FRA',
          httpProtocol: 'HTTP/3',
          tlsVersion: 'TLSv1.3',
          tlsCipher: 'AEAD-AES128-GCM-SHA256',
          clientTcpRtt: 11,
          torExit: false,
          forwardedHops: 1,
          proxyHeaders: [],
          receivedHeaders: [
            { name: 'accept-language', value: 'de-DE,de;q=0.9' },
            { name: 'sec-ch-ua-platform', value: '"macOS"' },
            { name: 'accept-encoding', value: 'gzip, br' },
          ],
        },
      })
    );

    await page.goto('/browser-fingerprint/');
    const card = page.locator('#card-consistency');
    await expect(card).toContainText('run the IP check to compare request headers', { timeout: 15000 });

    await page.locator('#btn-check-network').click();
    await expect(card).toContainText('request headers compared');

    // The mocked headers contradict a Chromium-on-Linux test browser
    await expect(card).toContainText('Client hint platform disagrees with the user agent');
    await expect(card).toContainText('Header and JavaScript languages disagree');

    const headers = page.locator('#net-headers');
    await expect(headers).toContainText('accept-encoding');
    await expect(headers).toContainText('gzip, br');
  });

  test('collects the newer graphics, emoji and keyboard probes', async ({ page }) => {
    await page.goto('/browser-fingerprint/');
    await expect(page.locator('#fp-id')).toHaveText(/^[0-9a-f]{32}$/, { timeout: 15000 });

    const results = page.locator('#fp-results');
    await expect(results).toContainText('WebGPU adapter');
    await expect(results).toContainText('Emoji font version');
    await expect(results).toContainText('Keyboard layout');
    await expect(results).toContainText('Extended display');

    // The voice signal reports a hash of the whole list, not just a count
    await expect(results).toContainText('Speech synthesis voices');

    const emojiRow = page.locator('#fp-results > div').filter({ hasText: 'Emoji font version' });
    await expect(emojiRow).toContainText(/Renders up to Unicode|Not available/);
  });

  test('flags the automation running the test suite', async ({ page }) => {
    await page.goto('/browser-fingerprint/');

    const card = page.locator('#card-automation');
    await expect(card).toContainText('under automation', { timeout: 15000 });
    await expect(card).toContainText('navigator.webdriver is true');
    await expect(card).toContainText('confirmed');
  });

  test('shows a defence line on the signals that have one', async ({ page }) => {
    await page.goto('/browser-fingerprint/');
    await expect(page.locator('#fp-id')).toHaveText(/^[0-9a-f]{32}$/, { timeout: 15000 });

    const canvasRow = page.locator('#fp-results > div').filter({ hasText: 'Canvas rendering hash' });
    await expect(canvasRow).toContainText('Defence: Tor Browser blocks canvas reads');

    await expect(page.locator('main')).toContainText('Reducing your fingerprint');
    await expect(page.locator('main')).toContainText('privacy.resistFingerprinting');
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
