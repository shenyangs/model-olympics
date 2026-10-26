import {supportedNode,nodeRange} from './node-version.mjs';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../',import.meta.url));
process.env.PLAYWRIGHT_BROWSERS_PATH = join(root,'.browser-cache');
function run(args, env=process.env) {const result=spawnSync(process.execPath,args,{cwd:root,env,stdio:'inherit'});if(result.error||result.status!==0){console.error('安装未完成。请检查网络、Node.js 版本及项目写入权限，然后重试 npm run setup。');process.exit(result.status||1);}}
if(!supportedNode(process.versions.node)){console.error(`需要 Node.js ${nodeRange}（不支持 23/25），请切换版本后重试。`);process.exit(1);}
if(!process.env.npm_execpath){console.error('请使用 npm run setup 运行此安装脚本。');process.exit(1);}
console.log('第 1 步：按锁文件安装项目依赖，缓存仅写入 .npm-cache。');
run([process.env.npm_execpath,'ci','--cache','.npm-cache']);
const require=createRequire(import.meta.url);
const {browserStatus}=await import('./browser.mjs');
const status=browserStatus();
if(status.browserReady && status.ffmpegReady)console.log(`第 2 步：浏览器与录像组件可用，无需下载。${status.source}`);
else { console.log('第 2 步：仅下载缺失的浏览器或录像组件到项目缓存，不安装系统组件。');run([join(dirname(require.resolve('playwright/package.json')),'cli.js'), 'install',status.browserReady?'ffmpeg':'chromium']); }
console.log('安装完成。可运行 npm run doctor 检查端口，再运行 npm run dev。访问 http://127.0.0.1:4206 。');
