import { z } from 'zod';
import OpenAI from 'openai';
import { readFile } from 'node:fs/promises';
export const prompt = 'Return only a JSON object with a mappings array. Each entry has exactly requirement and function string keys. Map R1 (normalize an email address) to normalizeEmail, R2 (check password strength) to validatePassword, and R3 (format a UTC timestamp) to formatTimestamp. Include every requirement once and no extras.';
export const rules = { maxTokens: 400, timeoutMs: 20000, temperature: 0 };
const expected: Record<string,string> = { R1:'normalizeEmail', R2:'validatePassword', R3:'formatTimestamp' };
const schema = z.object({ mappings:z.array(z.object({requirement:z.string(),function:z.string()}).strict()).length(3) }).strict();
export function judge(output:string) {
  let parsed; try { parsed = schema.safeParse(JSON.parse(output)); } catch { return {score:0,total:4,checks:[{name:'Strict JSON schema',passed:false}],passed:false}; }
  const valid = parsed.success && new Set(parsed.data.mappings.map(x=>x.requirement)).size===3 && parsed.data.mappings.every(x=>x.requirement in expected);
  const checks = [{name:'Strict JSON schema',passed:!!valid}, ...Object.entries(expected).map(([key,value])=>({name:`${key} → ${value}`,passed:!!(parsed.success && parsed.data.mappings.filter(x=>x.requirement===key && x.function===value).length===1)}))];
  return { score:checks.filter(x=>x.passed).length,total:4,checks,passed:checks.every(x=>x.passed) };
}
export type Adapter = {model:string;provider:string;run:(signal:AbortSignal)=>Promise<{output:string;tokens:number|null}>};
export type Event = {type:string;lane?:number;[key:string]:unknown};
export async function race(adapters:Adapter[],emit:(event:Event)=>void,timeoutMs=rules.timeoutMs) {
  await Promise.all(adapters.map(async (adapter,lane)=>{
    const started = performance.now(); emit({type:'started',lane,model:adapter.model,provider:adapter.provider,started});
    const controller = new AbortController(); let timer:ReturnType<typeof setTimeout>;
    try {
      const result = await Promise.race([adapter.run(controller.signal),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Provider timed out'));},timeoutMs);})]);
      emit({type:'completed',lane,elapsedMs:Math.round(performance.now()-started),...result,judgment:judge(result.output)});
    } catch(error) { emit({type:'failed',lane,elapsedMs:Math.round(performance.now()-started),error:error instanceof Error && error.message==='Provider timed out'?'Provider timed out':'Provider request failed. Check server configuration and provider availability.'}); }
    finally { clearTimeout(timer!); }
  })); emit({type:'finished'});
}
export function liveConfigured() { return !!(process.env.OPENAI_API_KEY && process.env.MODEL_A && process.env.MODEL_B && process.env.MODEL_A!==process.env.MODEL_B); }
export function descriptors(mode:string) { return mode==='live'?[{model:process.env.MODEL_A!,provider:'OpenAI-compatible'},{model:process.env.MODEL_B!,provider:'OpenAI-compatible'}]:[{model:'Fixture / correct mapping',provider:'Local fixture'},{model:'Fixture / incorrect R2',provider:'Local fixture'}]; }
export function adapters(mode:string):Adapter[] {
  return descriptors(mode).map((descriptor,i)=>({...descriptor,run:async(signal)=>{
    if(mode!=='live') { const output = await readFile(new URL(`../fixtures/lane-${i}.json`,import.meta.url),'utf8'); return {output,tokens:null}; }
    const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY,baseURL:process.env.OPENAI_BASE_URL,maxRetries:0});
    const result = await client.chat.completions.create({model:descriptor.model,messages:[{role:'user',content:prompt}],temperature:rules.temperature,max_tokens:rules.maxTokens},{signal});
    return {output:result.choices[0]?.message.content??'',tokens:result.usage?.total_tokens??null};
  }}));
}
