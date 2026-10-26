import {existsSync} from 'node:fs';
if(existsSync('.env')) process.loadEnvFile('.env');
import express from 'express';
import { adapters, descriptors, liveConfigured, prompt, race, rules } from './race';
const app = express(); app.use(express.json({limit:'2kb'}));
let busy = false;
app.get('/api/health', (_req,res) => res.json({ok:true,project:'model-olympics'}));
app.get('/api/config',(_req,res)=>res.json({liveAvailable:liveConfigured(),prompt,rules,fixture:descriptors('fixture'),live:liveConfigured()?descriptors('live'):[]}));
app.post('/api/race',async(req,res)=>{
  if(!['fixture','live'].includes(req.body?.mode)) {res.status(400).json({error:'请选择本地样例或真实模型模式'});return;}
  if(req.body.mode==='live'&&!liveConfigured()){res.status(400).json({error:'真实模式需要 API 密钥与两个不同的模型 ID，请在 .env 中配置后重启'});return;}
  if(busy){res.status(429).json({error:'已有对决正在进行，请等待结束后重试'});return;}
  busy=true;res.setHeader('Content-Type','application/x-ndjson');res.setHeader('Cache-Control','no-store');res.flushHeaders();
  try {await race(adapters(req.body.mode),event=>{if(!res.destroyed)res.write(JSON.stringify(event)+'\n');});} finally {busy=false;res.end();}
});
app.use((error:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{res.status(400).json({error:'请求格式无效或内容过大，请刷新页面重试。'});});
app.listen(5206,'127.0.0.1',()=>console.log('[Model Olympics] 后端已启动：http://127.0.0.1:5206；请在浏览器打开 http://127.0.0.1:4206 。默认本地样例，无需密钥。')).on('error',(error:NodeJS.ErrnoException)=>{console.error(error.code==='EADDRINUSE'?'5206 端口已被占用。请停止原有应用后重启；可运行 npm run doctor 诊断。':'后端启动失败，请运行 npm run doctor 检查环境。');process.exit(1);});
