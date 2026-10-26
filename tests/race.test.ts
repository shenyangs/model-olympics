import {describe,it,expect} from 'vitest';
import {adapters,judge,race, type Event} from '../server/race';
describe('objective judge',()=>{
 it('scores correct and incorrect fixture mappings',async()=>{const providers=adapters('fixture');expect(judge((await providers[0].run(new AbortController().signal)).output).score).toBe(4);expect(judge((await providers[1].run(new AbortController().signal)).output).score).toBe(3)});
 it('rejects invalid JSON, extra fields, duplicate requirements and missing mappings',()=>{for(const value of ['not JSON','{}','{"mappings":[]}','{"mappings":[{"requirement":"R1","function":"normalizeEmail"},{"requirement":"R1","function":"normalizeEmail"},{"requirement":"R3","function":"formatTimestamp"}]}'])expect(judge(value).passed).toBe(false);});
});
describe('concurrent race lifecycle',()=>{
 it('starts both adapters before either is allowed to finish',async()=>{const events:Event[]=[];const releases:(()=>void)[]=[];const pending=race([0,1].map(i=>({model:`fake-${i}`,provider:'test-only',run:()=>new Promise<{output:string;tokens:null}>(resolve=>releases.push(()=>resolve({output:'{}',tokens:null})))})),event=>events.push(event));expect(events.map(e=>e.type)).toEqual(['started','started']);expect(Math.abs(Number(events[1].started)-Number(events[0].started))).toBeLessThan(50);releases.forEach(release=>release());await pending;expect(events.filter(e=>e.type==='completed')).toHaveLength(2);expect(events.at(-1)?.type).toBe('finished');});
 it('times out a stalled lane while preserving a successful lane',async()=>{const events:Event[]=[];await race([{model:'stall',provider:'test-only',run:()=>new Promise(()=>{})},{model:'ok',provider:'test-only',run:async()=>({output:'{}',tokens:7})}],event=>events.push(event),15);expect(events.find(e=>e.type==='failed')?.error).toBe('模型请求超时');expect(events.find(e=>e.type==='completed')?.tokens).toBe(7);});
 it('redacts provider exception text',async()=>{const events:Event[]=[];await race([{model:'error',provider:'test-only',run:async()=>{throw new Error('secret-value')}}],event=>events.push(event));expect(JSON.stringify(events)).not.toContain('secret-value');expect(events[1].type).toBe('failed');});
});
