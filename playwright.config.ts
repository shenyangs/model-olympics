import {existsSync,readdirSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= fileURLToPath(new URL('./.browser-cache', import.meta.url));
const localCache = process.env.PLAYWRIGHT_BROWSERS_PATH;
const sharedCache = join(homedir(),'Library','Caches','ms-playwright');
const hasLocalBrowser = existsSync(localCache) && readdirSync(localCache).some(name=>name.startsWith('chromium_headless_shell-'));
const existingChromium = process.platform==='darwin' && !hasLocalBrowser && existsSync(sharedCache) ? readdirSync(sharedCache).filter(name=>/^chromium-\d+$/.test(name)).sort((a,b)=>Number(b.split('-')[1])-Number(a.split('-')[1])).map(name=>join(sharedCache,name,'chrome-mac-arm64','Google Chrome for Testing.app','Contents','MacOS','Google Chrome for Testing')).find(existsSync) : undefined;
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH || existingChromium;
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests', testMatch: ['*.spec.ts'], timeout: 45_000, retries: 0, workers: 1,
  use: { ...devices['Desktop Chrome'], launchOptions: executablePath ? {executablePath} : {}, baseURL: 'http://127.0.0.1:4206', viewport: {width: 1440, height: 810}, video: 'on', screenshot: 'on' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:4206', reuseExistingServer: false, timeout: 90_000 },
  outputDir: process.env.DEMO_RUN ? 'artifacts/playwright/demo' : 'artifacts/playwright/e2e', reporter: [['list']],
});
