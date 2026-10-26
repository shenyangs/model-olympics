import {test,expect} from '@playwright/test';
test('fixture UI executes backend race and exposes objective results',async({page,request})=>{
 await page.goto('/');await expect(page.getByText('LOCAL FIXTURE · NO INFERENCE')).toBeVisible();
 await page.getByRole('button',{name:'Inspect shared prompt'}).click();await expect(page.locator('.prompt')).toContainText('R2 (check password strength)');
 await page.getByRole('button',{name:'RACE ↗',exact:true}).click();await expect(page.getByText('Race complete',{exact:true})).toBeVisible();
 await expect(page.locator('.lane-0 .metrics')).toContainText('4/4');await expect(page.locator('.lane-1 .metrics')).toContainText('3/4');await expect(page.locator('.lane-1 .fail')).toContainText('validatePassword');await expect(page.locator('.lane-1 pre')).toContainText('hashPassword');
 await expect(page.locator('.lane-0 .state')).toHaveText('✓ ALL CHECKS PASS');await expect(page.locator('.lane-1 .state')).toHaveText('CHECK FAILED');
 await page.getByRole('button',{name:'RACE AGAIN'}).click();await expect(page.getByText('Race complete',{exact:true})).toBeVisible();
 const invalid=await request.post('/api/race',{data:{mode:'arbitrary'}});expect(invalid.status()).toBe(400);
 await page.screenshot({path:'artifacts/fixture-results.png',fullPage:true});
});
