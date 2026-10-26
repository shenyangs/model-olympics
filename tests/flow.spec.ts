import {test,expect} from '@playwright/test';
test('fixture UI executes backend race and exposes objective results',async({page,request})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await expect(page.getByText('本地样例 FIXTURE · 无 AI 推理')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);await page.screenshot({path:'docs/images/overview.png',fullPage:true});
 await page.getByRole('button',{name:'查看共同提示词'}).click();await expect(page.locator('.prompt')).toContainText('R2（检查密码强度）');
 await page.getByRole('button',{name:'开始对决 ↗',exact:true}).click();await expect(page.getByText('本轮已结束',{exact:true})).toBeVisible();
 await expect(page.locator('.lane-0 .metrics')).toContainText('4/4');await expect(page.locator('.lane-1 .metrics')).toContainText('3/4');await expect(page.locator('.lane-1 .fail')).toContainText('validatePassword');await page.getByRole('button',{name:'展开原始输出'}).click();await expect(page.locator('.outputs pre').nth(1)).toContainText('hashPassword');
 await expect(page.locator('.lane-0 .state')).toHaveText('✓ 全部检查通过');await expect(page.locator('.lane-1 .state')).toHaveText('存在未通过项');
 await page.getByRole('button',{name:'再来一轮'}).click();await expect(page.getByText('本轮已结束',{exact:true})).toBeVisible();
 const invalid=await request.post('/api/race',{data:{mode:'arbitrary'}});expect(invalid.status()).toBe(400);
 await page.screenshot({path:'artifacts/zh-fixture-results.png',fullPage:true});await page.screenshot({path:'docs/images/result.png',fullPage:true});
});

test('中文小屏、键盘操作与连接失败提示',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
 await expect(page.getByText('准备就绪，点击开始对决',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.getByRole('button',{name:'查看共同提示词'}).focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('.prompt')).toBeVisible();
 await page.getByRole('button',{name:'收起共同提示词'}).click();
 await page.getByRole('button',{name:'开始对决 ↗',exact:true}).click();
 await expect(page.getByText('本轮已结束',{exact:true})).toBeVisible();
 await expect(page.locator('.lane-1 .fail')).toContainText('validatePassword');
 await page.screenshot({path:'artifacts/zh-mobile.png',fullPage:true});
 await page.route('**/api/race',route=>route.abort());
 await page.getByRole('button',{name:'再来一轮'}).click();
 await expect(page.getByRole('alert')).toContainText('网络请求中断');
 await expect(page.getByRole('button',{name:'开始对决 ↗',exact:true})).toBeEnabled();
 await page.route('**/api/config',route=>route.abort());
 await page.reload();
 await expect(page.getByRole('alert')).toContainText('无法连接后端');
});
