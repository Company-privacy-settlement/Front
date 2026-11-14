import {test,expect} from '@playwright/test';
test.skip(process.env.NEXT_PUBLIC_MONEY_STATION_DEMO_KYB!=='1','Requires the explicitly enabled hackathon build.');

test('hackathon KYB approves immediately with no provider submission or real credential',async({page})=>{
  const errors:string[]=[],writes:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(['POST','PUT','PATCH'].includes(r.method()))writes.push(r.url());});
  await page.goto('/kyb/status/');
  await expect(page.getByLabel('Demo KYB approval')).toContainText('Approved for hackathon demo');
  await expect(page.getByText('Not performed',{exact:true})).toBeVisible();await expect(page.getByText('Not issued',{exact:true})).toBeVisible();
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export demo approval'}).click();
  const stream=await (await download).createReadStream(),parts:Buffer[]=[];for await(const chunk of stream!)parts.push(Buffer.from(chunk));
  const packet=JSON.parse(Buffer.concat(parts).toString());expect(packet.demoApproval.state).toBe('approved');expect(packet.verified).toBe(false);expect(packet.credentialIssued).toBe(false);expect(packet.providerSubmission).toBe('not_sent');
  await page.getByRole('link',{name:'Continue to payments'}).click();await expect(page).toHaveURL(/\/invoices\/$/);
  expect(writes).toEqual([]);expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('editing a demo business clears approval until review; reloading restores only the sample',async({page})=>{
  await page.goto('/kyb/');await expect(page.getByText('Approved for hackathon demo',{exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Review sample details'}).click();await page.getByLabel('Legal business name').fill('Changed demo business');
  const steps=page.getByRole('navigation',{name:'KYB steps'});
  await steps.getByRole('link',{name:/Verification status/}).click();await expect(page.getByLabel('Demo KYB approval')).toHaveCount(0);
  await steps.getByRole('link',{name:/Review & prepare/}).click();await page.getByLabel('Confirm review and authority').check();await page.getByRole('button',{name:'Approve for demo'}).click();
  await expect(page.getByLabel('Demo KYB approval')).toContainText('Changed demo business');
  await page.reload();await expect(page.getByLabel('Demo KYB approval')).toContainText('Meridian Studio Example Ltd');await expect(page.getByLabel('Demo KYB approval')).not.toContainText('Changed demo business');
});
