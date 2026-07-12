import { defineConfig, devices } from '@playwright/test';

// UI base URL is the Market Mock SPA. API tests target http://localhost:5000 —
// wire that through a fixture / request context when you get there (a fixtures rep).
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // add firefox / webkit when you want cross-browser coverage
  ],
});
