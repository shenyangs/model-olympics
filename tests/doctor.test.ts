import {it,expect} from 'vitest';
import {spawnSync} from 'node:child_process';
it('缺依赖目录给出中文恢复命令，退出 1 且不输出调用栈',()=>{
 const result=spawnSync(process.execPath,['scripts/doctor.mjs','--dependency-dir','artifacts/不存在的依赖目录'],{encoding:'utf8'});
 expect(result.status).toBe(1);
 expect(result.stdout).toContain('依赖缺失');
 expect(result.stdout).toContain('npm run setup');
 expect(result.stdout).toContain('零密钥演示不需要 API Key');
 expect(result.stderr).not.toContain('Error:');
});
it('Node 版本边界与 Vitest 5 支持范围一致，拒绝 23/25',async()=>{
 const {supportedNode}=await import('../scripts/node-version.mjs');
 for(const version of ['20.19.0','22.11.0','23.0.0','23.99.0','25.0.0','25.9.0'])expect(supportedNode(version)).toBe(false);
 for(const version of ['22.12.0','22.99.0','24.0.0','24.9.0','26.0.0','27.0.0'])expect(supportedNode(version)).toBe(true);
});
