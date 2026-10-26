import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export function browserStatus() {
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH || join(projectRoot, '.browser-cache');
  process.env.PLAYWRIGHT_BROWSERS_PATH = cache;
  const metadata = JSON.parse(readFileSync(join(dirname(require.resolve('playwright-core/package.json')), 'browsers.json'), 'utf8'));
  const ffmpeg = metadata.browsers.find(item => item.name === 'ffmpeg');
  const ffmpegDir = join(cache, `ffmpeg-${ffmpeg.revision}`);
  const ffmpegReady = existsSync(ffmpegDir) && readdirSync(ffmpegDir).some(name => name.startsWith('ffmpeg-') || name === 'ffmpeg.exe');
  const {chromium} = require('playwright-core');
  const local = chromium.executablePath();
  let executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  let source = '指定浏览器';
  if (!executablePath && existsSync(local)) { executablePath = local; source = '项目缓存浏览器'; }
  const shared = join(homedir(), 'Library', 'Caches', 'ms-playwright');
  if (!executablePath && process.platform === 'darwin' && existsSync(shared)) {
    const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
    executablePath = readdirSync(shared).filter(name => /^chromium-\d+$/.test(name))
      .sort((a,b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
      .map(name => join(shared, name, `chrome-mac-${arch}`, 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing')).find(existsSync);
    source = '只读复用已有 macOS Chromium（版本可能与 Playwright 不同）';
  }
  return {cache, executablePath, source, browserReady: !!executablePath && existsSync(executablePath), ffmpegReady};
}
