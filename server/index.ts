import {existsSync} from 'node:fs';
if(existsSync('.env')) process.loadEnvFile('.env');
import express from 'express';
import { adapters, descriptors, liveConfigured, prompt, race, rules } from './race';
const app = express(); app.use(express.json({limit:'2kb'}));
let busy = false;
app.get('/api/health', (_req,res) => res.json({ok:true,project:'model-olympics'}));
app.get('/api/config',(_req,res)=>res.json({liveAvailable:liveConfigured(),prompt,rules,fixture:descriptors('fixture'),live:liveConfigured()?descriptors('live'):[]}));
app.post('/api/race',async(req,res)=>{
  if(!['fixture','live'].includes(req.body?.mode)) {res.status(400).json({error:'Choose fixture or live'});return;}
  if(req.body.mode==='live'&&!liveConfigured()){res.status(400).json({error:'Two distinct model IDs and an API key are required'});return;}
  if(busy){res.status(429).json({error:'A race is already running'});return;}
  busy=true;res.setHeader('Content-Type','application/x-ndjson');res.setHeader('Cache-Control','no-store');res.flushHeaders();
  try {await race(adapters(req.body.mode),event=>{if(!res.destroyed)res.write(JSON.stringify(event)+'\n');});} finally {busy=false;res.end();}
});
app.listen(5206,'127.0.0.1',()=>console.log('[model-olympics] API http://127.0.0.1:5206'));
