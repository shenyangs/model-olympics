import {supportedNode,nodeRange} from './node-version.mjs';
import {existsSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createServer} from 'node:net';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
let failures = 0;
function report(ok, text) { console.log(`${ok?'✓':'✗'} ${text}`); if(!ok) failures++; }
report(supportedNode(process.versions.node), `Node.js ${process.versions.node}；需要 ${nodeRange}（不支持 23/25）。`);
const option = process.argv.indexOf('--dependency-dir');
const dependencyDir = option < 0 ? join(root, 'node_modules') : resolve(process.argv[option+1] || './不存在的依赖目录');
const pkg = JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
const missing = Object.keys({...pkg.dependencies,...pkg.devDependencies}).filter(name=>!existsSync(join(dependencyDir,name,'package.json')));
report(missing.length === 0, missing.length ? `依赖缺失：${missing.join('、')}。请在项目目录运行 npm run setup（或 npm ci --cache .npm-cache）。` : '项目依赖完整。');
if(!missing.length) {
  try {
    const {browserStatus} = await import('./browser.mjs');
    const browser = browserStatus();
    report(browser.browserReady, browser.browserReady ? `浏览器可用：${browser.source}。` : '未找到 Chromium。运行 npm run setup 安装项目内浏览器。');
    report(browser.ffmpegReady, browser.ffmpegReady ? '录像组件 FFmpeg 可用。' : '录像组件 FFmpeg 缺失。运行 npm run setup。');
  } catch { report(false,'无法检查浏览器依赖，请运行 npm run setup 修复。'); }
} else console.log('提示：先修复依赖，再检查浏览器；零密钥演示不需要 API Key。');
for(const port of [4206,5206]) {
  const free = await new Promise(resolve=>{const server=createServer();server.once('error',()=>resolve(false));server.listen(port,'127.0.0.1',()=>server.close(()=>resolve(true)));});
  report(free, free ? `端口 ${port} 可用（仅 127.0.0.1）。` : `端口 ${port} 已占用或无法绑定。若应用正在运行，这是正常的；测试前请在对应终端按 Ctrl+C 停止。`);
}
console.log(failures ? `诊断发现 ${failures} 项需要处理；按上方中文提示恢复后重试。` : '诊断通过。运行 npm run dev，然后打开 http://127.0.0.1:4206 。默认本地样例，无需密钥、无 AI 推理。');
process.exitCode = failures ? 1 : 0;
