import {browserStatus} from './scripts/browser.mjs';
const {executablePath} = browserStatus();
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests', testMatch: ['*.spec.ts'], timeout: 45_000, retries: 0, workers: 1,
  use: { ...devices['Desktop Chrome'], launchOptions: executablePath ? {executablePath} : {}, baseURL: 'http://127.0.0.1:4206', viewport: {width: 1440, height: 810}, video: 'on', screenshot: 'on' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:4206', reuseExistingServer: false, timeout: 90_000 },
  outputDir: process.env.DEMO_RUN ? 'artifacts/playwright/demo' : 'artifacts/playwright/e2e', reporter: [['list']],
});
