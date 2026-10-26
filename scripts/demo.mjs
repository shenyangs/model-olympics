import {join,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const result=spawnSync(process.execPath,[join(dirname(require.resolve('playwright/package.json')),'cli.js'),'test','tests/demo.spec.ts'],{env:{...process.env,DEMO_RUN:'1'},stdio:'inherit'});
if(result.error) console.error('演示未启动，请运行 npm run doctor 检查依赖。');
process.exitCode=result.status??1;
