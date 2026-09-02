import { defineConfig, devices } from '@playwright/test';

// Not 4321: that is the Astro dev default, so any Astro dev server running
// locally would be reused and the suite would silently test the wrong site.
const port = Number(process.env.PREVIEW_PORT ?? 4327);

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `yarn vite preview --port ${port} --outDir dist`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
