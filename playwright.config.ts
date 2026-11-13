import { defineConfig, devices } from '@playwright/test';
const port = process.env.CORE_E2E_PORT ?? '3000';
if (!/^[1-9]\d{0,4}$/.test(port) || String(Number(port)) !== port || Number(port) > 65535) throw new Error('CORE_E2E_PORT must be a valid TCP port');
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: './tests/browser', timeout: 60_000, expect: { timeout: 15_000 }, workers: 2,
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: { command: `python3 -m http.server ${port} --bind 127.0.0.1 --directory out`, url: baseURL, reuseExistingServer: !process.env.CI },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } }, { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } }],
});
