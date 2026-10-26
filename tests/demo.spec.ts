import {test,expect} from '@playwright/test';
test('record a real fixture showdown',async({page})=>{
 await page.goto('/');await expect(page.getByText('本地样例 FIXTURE · 无 AI 推理')).toBeVisible();await page.waitForTimeout(1500);
 await page.getByRole('button',{name:'查看共同提示词'}).click();await expect(page.locator('.prompt')).toBeVisible();await page.waitForTimeout(1800);
 await page.getByRole('button',{name:'收起共同提示词'}).click();await page.getByRole('button',{name:'开始对决 ↗',exact:true}).click();
 await expect(page.getByText('本轮已结束',{exact:true})).toBeVisible();await expect(page.locator('.lane-0 .metrics')).toContainText('4/4');await expect(page.locator('.lane-1 .metrics')).toContainText('3/4');
 expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBeLessThanOrEqual(810);
 await page.screenshot({path:'artifacts/zh-demo-results.png',fullPage:true});await page.waitForTimeout(2500);
});
