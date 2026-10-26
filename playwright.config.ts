import { defineConfig, devices } from '@playwright/test';
import { E2E_DATABASE_URL } from './e2e/mechanic';

const PORT = 3100;

// The end-to-end tests run against a production build (`pnpm build` first),
// on its own port and its own database, so they never touch the dev server
// or local.db.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'el-GR',
    timezoneId: 'Europe/Athens',
    trace: 'retain-on-failure',
  },
  // The same flow on a laptop and on a phone, the two ways the app is used
  projects: [
    { name: 'laptop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `pnpm exec tsx e2e/prepare-db.ts && pnpm exec next start --port ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...(Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== undefined)) as Record<
        string,
        string
      >),
      TURSO_DATABASE_URL: E2E_DATABASE_URL,
      TURSO_AUTH_TOKEN: '',
    },
  },
});
