import { z } from 'zod';
import OpenAI from 'openai';
import { readFile } from 'node:fs/promises';
export const prompt = '只返回一个包含 mappings 数组的 JSON 对象。每个条目仅包含 requirement 和 function 两个字符串字段。将 R1（规范化电子邮箱）映射到 normalizeEmail，将 R2（检查密码强度）映射到 validatePassword，将 R3（格式化 UTC 时间戳）映射到 formatTimestamp。每个需求恰好出现一次，不添加其他字段或说明。';
export const rules = { maxTokens: 400, timeoutMs: 20000, temperature: 0 };
const expected: Record<string,string> = { R1:'normalizeEmail', R2:'validatePassword', R3:'formatTimestamp' };
const schema = z.object({ mappings:z.array(z.object({requirement:z.string(),function:z.string()}).strict()).length(3) }).strict();
export function judge(output:string) {
  let parsed; try { parsed = schema.safeParse(JSON.parse(output)); } catch { return {score:0,total:4,checks:[{name:'严格 JSON 结构',passed:false}],passed:false}; }
  const valid = parsed.success && new Set(parsed.data.mappings.map(x=>x.requirement)).size===3 && parsed.data.mappings.every(x=>Object.hasOwn(expected,x.requirement));
  const checks = [{name:'严格 JSON 结构',passed:!!valid}, ...Object.entries(expected).map(([key,value])=>({name:`${key} → ${value}`,passed:!!(parsed.success && parsed.data.mappings.filter(x=>x.requirement===key && x.function===value).length===1)}))];
  return { score:checks.filter(x=>x.passed).length,total:4,checks,passed:checks.every(x=>x.passed) };
}
export type Adapter = {model:string;provider:string;run:(signal:AbortSignal)=>Promise<{output:string;tokens:number|null}>};
export type Event = {type:string;lane?:number;[key:string]:unknown};
export async function race(adapters:Adapter[],emit:(event:Event)=>void,timeoutMs=rules.timeoutMs) {
  await Promise.all(adapters.map(async (adapter,lane)=>{
    const started = performance.now(); emit({type:'started',lane,model:adapter.model,provider:adapter.provider,started});
    const controller = new AbortController(); let timer:ReturnType<typeof setTimeout>;
    try {
      const result = await Promise.race([adapter.run(controller.signal),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('模型请求超时'));},timeoutMs);})]);
      emit({type:'completed',lane,elapsedMs:Math.round(performance.now()-started),...result,judgment:judge(result.output)});
    } catch(error) { emit({type:'failed',lane,elapsedMs:Math.round(performance.now()-started),error:error instanceof Error && error.message==='模型请求超时'?'模型请求超时':'请求失败，请检查服务配置和模型可用性后重试。'}); }
    finally { clearTimeout(timer!); }
  })); emit({type:'finished'});
}
export function liveConfigured() { return !!(process.env.OPENAI_API_KEY && process.env.MODEL_A && process.env.MODEL_B && process.env.MODEL_A!==process.env.MODEL_B); }
export function descriptors(mode:string) { return mode==='live'?[{model:process.env.MODEL_A!,provider:'OpenAI 兼容接口'},{model:process.env.MODEL_B!,provider:'OpenAI 兼容接口'}]:[{model:'样例 A / 正确映射',provider:'本地固定样例（无 AI 推理）'},{model:'样例 B / R2 映射错误',provider:'本地固定样例（无 AI 推理）'}]; }
export function adapters(mode:string):Adapter[] {
  return descriptors(mode).map((descriptor,i)=>({...descriptor,run:async(signal)=>{
    if(mode!=='live') { const output = await readFile(new URL(`../fixtures/lane-${i}.json`,import.meta.url),'utf8'); return {output,tokens:null}; }
    const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY,baseURL:process.env.OPENAI_BASE_URL,maxRetries:0});
    const result = await client.chat.completions.create({model:descriptor.model,messages:[{role:'user',content:prompt}],temperature:rules.temperature,max_tokens:rules.maxTokens},{signal});
    return {output:result.choices[0]?.message.content??'',tokens:result.usage?.total_tokens??null};
  }}));
}
