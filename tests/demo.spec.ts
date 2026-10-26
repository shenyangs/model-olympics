import {test,expect} from '@playwright/test';
test('record a real fixture showdown',async({page})=>{
 await page.goto('/');await expect(page.getByText('LOCAL FIXTURE · NO INFERENCE')).toBeVisible();await page.waitForTimeout(1500);
 await page.getByRole('button',{name:'Inspect shared prompt'}).click();await expect(page.locator('.prompt')).toBeVisible();await page.waitForTimeout(1800);
 await page.getByRole('button',{name:'Hide shared prompt'}).click();await page.getByRole('button',{name:'RACE ↗',exact:true}).click();
 await expect(page.getByText('Race complete',{exact:true})).toBeVisible();await expect(page.locator('.lane-0 .metrics')).toContainText('4/4');await expect(page.locator('.lane-1 .metrics')).toContainText('3/4');
 expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBeLessThanOrEqual(810);
 await page.screenshot({path:'artifacts/demo-results.png',fullPage:true});await page.waitForTimeout(2500);
});
