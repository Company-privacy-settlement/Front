/** Capture actual application interactions; fixtures and proof scopes are explicit. */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
import {execFileSync} from 'node:child_process';
const front=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const core=resolve(process.env.CORE_CHECKOUT??resolve(front,'../Core'));
const output=resolve(process.env.DEMO_OUTPUT_DIR??'/tmp/money-station-demo');
const baseURL=process.env.DEMO_BASE_URL??'http://127.0.0.1:33539';
process.env.CORE_PROVER_ARTIFACTS_DIR??=resolve(core,'artifacts');
const {chromium,expect:baseExpect}=createRequire(resolve(front,'package.json'))('@playwright/test');
const expect=baseExpect.configure({timeout:15000});
const {build}=createRequire(resolve(core,'package.json'))('esbuild');
await mkdir(resolve(output,'raw'),{recursive:true});
const scenes=JSON.parse(await readFile(resolve(front,'scripts/demo/storyboard.en.json'),'utf8'));
for(const s of scenes){s.speechDuration=Number(execFileSync('ffprobe',['-v','quiet','-show_entries','format=duration','-of','csv=p=0',resolve(output,'audio',s.id+'.mp3')],{encoding:'utf8'}).trim());s.duration=Math.max(s.minimumSeconds,s.speechDuration+1.15);}
const plugin={name:'external-playwright',setup(b){b.onResolve({filter:/^@playwright\/test$/},()=>({path:pathToFileURL(resolve(front,'node_modules/@playwright/test/index.mjs')).href,external:true}));}};
async function bundle(name,entry,contents){await build({...(contents?{stdin:{contents,resolveDir:resolve(front,'tests/browser'),sourcefile:name+'.ts',loader:'ts'}}:{entryPoints:[entry]}),outfile:resolve(output,name+'.mjs'),bundle:true,platform:'node',format:'esm',packages:'external',plugins:[plugin]});return import(pathToFileURL(resolve(output,name+'.mjs')).href);}
let invoiceSource=await readFile(resolve(front,'tests/browser/invoice-note-payment.spec.ts'),'utf8');
invoiceSource=invoiceSource.slice(0,invoiceSource.indexOf('test.beforeEach'))+'\nexport {setup};';
const {setup}=await bundle('invoice-setup',null,invoiceSource);
const {fixture,policy}=await bundle('invoice-fixture',resolve(front,'tests/browser/invoice-fixture.ts'));
const {taxDraftFixture}=await bundle('tax-setup',resolve(front,'tests/browser/tax-drafts-fixture.ts'));
const {openReceiptBackup}=await import(pathToFileURL(resolve(front,'src/vendor/core-client/index.js')).href);
let previous={scenes:[],clips:[]};if(process.env.DEMO_RESUME==='1'){try{previous=JSON.parse(await readFile(resolve(output,'recording.partial.json'),'utf8'));}catch{}}
for(const old of previous.scenes)if(old.complete&&scenes.some(s=>s.id===old.id&&s.narration===old.narration))Object.assign(scenes.find(s=>s.id===old.id),old);
const browser=await chromium.launch({headless:true});const errors=[],clips=previous.clips.filter(c=>c.finished);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function capture(id,action){
 if(clips.some(c=>c.id===id&&c.finished)){console.log('Reusing capture:',id);return;}
 let finished=false;
 const context=await browser.newContext({baseURL,viewport:{width:1600,height:760},deviceScaleFactor:1,recordVideo:{dir:resolve(output,'raw'),size:{width:1600,height:760}},acceptDownloads:true});
 await context.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{const pointer=document.createElement('div');pointer.id='film-pointer';pointer.style.cssText='position:fixed;z-index:2147483600;left:-60px;top:-60px;width:18px;height:18px;border:2px solid #75ffc0;border-radius:50%;background:#32ef9e30;box-shadow:0 0 14px #32ef9e55;pointer-events:none';document.body.append(pointer);document.addEventListener('mousemove',e=>{pointer.style.left=e.clientX-9+'px';pointer.style.top=e.clientY-9+'px';});document.addEventListener('click',e=>{const ring=document.createElement('i');ring.style.cssText=`position:fixed;z-index:2147483601;left:${e.clientX-24}px;top:${e.clientY-24}px;width:48px;height:48px;border:2px solid #63ffb3;border-radius:50%;pointer-events:none`;document.body.append(ring);ring.animate([{opacity:.9,transform:'scale(.4)'},{opacity:0,transform:'scale(1.7)'}],{duration:600,easing:'ease-out'}).finished.then(()=>ring.remove());});},{once:true}));
 const started=performance.now(),page=await context.newPage();page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push({clip:id,message:e.message}));
 async function click(locator){await locator.scrollIntoViewIfNeeded();const b=await locator.boundingBox();if(b)await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:16});await sleep(180);await locator.click();await sleep(260);}
 async function scene(name,run,focus={x:50,y:50,zoom:1.04}){const s=scenes.find(v=>v.id===name);if(!s)throw Error('Unknown scene '+name);s.clip=id;s.focus=focus;s.videoStart=(performance.now()-started)/1000;console.log('Recording:',name);await run();const elapsed=(performance.now()-started)/1000-s.videoStart;s.duration=Math.max(s.duration,elapsed+.5);await sleep(Math.max(0,(s.duration-elapsed)*1000));await page.screenshot({path:resolve(output,'screen-'+name+'.png')});s.complete=true;}
 try{await action({page,scene,click});finished=true;}catch(e){await page.screenshot({path:resolve(output,'failure-'+id+'.png')});await writeFile(resolve(output,'failure-'+id+'.txt'),await page.locator('body').innerText());throw e;}finally{const video=page.video();await context.close();clips.push({id,path:await video.path(),finished});await writeFile(resolve(output,'recording.partial.json'),JSON.stringify({scenes,clips,errors},null,2));}
}
try{
 await capture('invoice',async({page,scene,click})=>{
  await fixture(page);await page.goto('/invoices/');await page.getByLabel('Payment service origin',{exact:true}).fill('https://core-api.example');
  await page.getByLabel('Trusted FT policy JSON',{exact:true}).setInputFiles({name:'policy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(policy))});
  await page.getByRole('button',{name:'Connect merchant wallet',exact:true}).click();await page.getByText('Invoice Fixture Wallet',{exact:true}).click();
  await page.getByLabel('Invoice title',{exact:true}).fill('Design milestone');await page.getByLabel('Invoice reference',{exact:true}).fill('INV-2026-007');await page.getByLabel('Payout NEAR account',{exact:true}).fill('recipient.testnet');await page.getByLabel('Number of notes',{exact:true}).fill('2');
  await page.getByRole('button',{name:'Sign & create payment link',exact:true}).scrollIntoViewIfNeeded();
  await scene('invoice',async()=>{await sleep(1400);await click(page.getByRole('button',{name:'Sign & create payment link',exact:true}));await expect(page.getByLabel('Payment link')).toBeVisible();await page.locator('.invoice-share').scrollIntoViewIfNeeded();},{x:68,y:48,zoom:1.07});
 });
 await capture('wallet',async({page,scene,click})=>{
  await page.goto('/');await page.locator('h1').waitFor();
  await scene('wallet',async()=>{await sleep(400);await click(page.getByRole('button',{name:'Connect wallet',exact:true}));await expect(page.getByText('Meteor Wallet',{exact:true})).toBeVisible({timeout:25000});},{x:50,y:50,zoom:1.09});
 });
 await capture('checkout',async({page,scene,click})=>{
  const f=await setup(page,{delayed:true,prerequisite:true});await f.form.getByText('Trusted proving files',{exact:true}).click();
  await f.form.getByLabel('Select encrypted note',{exact:true}).scrollIntoViewIfNeeded();
  await scene('note',async()=>{await sleep(600);await f.open(f.notes[0]);await f.form.getByRole('button',{name:'Generate invoice proof',exact:true}).scrollIntoViewIfNeeded();},{x:72,y:58,zoom:1.08});
  await scene('proof',async()=>{await click(f.form.getByRole('button',{name:'Generate invoice proof',exact:true}));await expect(f.form.getByRole('heading',{name:'Invoice proof ready',exact:true})).toBeVisible({timeout:90000});await f.form.locator('.invoice-note-quote').scrollIntoViewIfNeeded();},{x:72,y:55,zoom:1.12});
  await scene('review',async()=>{await sleep(1700);await click(f.form.getByRole('button',{name:'Review amount & fees',exact:true}));await page.locator('.live-review').scrollIntoViewIfNeeded();await sleep(900);await click(page.getByRole('button',{name:'Approve prerequisite in wallet',exact:true}));await expect(page.getByRole('button',{name:'Approve payment in wallet',exact:true})).toBeEnabled();},{x:71,y:55,zoom:1.12});
  await scene('confirmation',async()=>{await click(page.getByRole('button',{name:'Approve payment in wallet',exact:true}));await expect(page.locator('.live-review')).toContainText('processing');await sleep(1200);f.confirmPending();await expect(page.locator('.invoice-payment-confirmed')).toBeVisible();await page.locator('.invoice-payment-confirmed').scrollIntoViewIfNeeded();expect(await f.calls()).toHaveLength(2);},{x:71,y:54,zoom:1.12});
 });
 await capture('evidence',async({page,scene,click})=>{
  await page.goto('/evidence/');const panel=page.getByRole('region',{name:'Private receipt backup',exact:true}),selection=page.getByRole('region',{name:'Selective disclosure',exact:true});
  for(const [label,value] of Object.entries({'Sender reference':'Example Company','Recipient reference':'Partner Studio','Asset reference':'nep141:usdc.testnet','Declared amount':'1000000','Purpose':'Design milestone','Business reference':'INV-2026-007','Occurred at (UTC)':'2026-11-14T00:00:00.000Z'}))await panel.getByLabel(label,{exact:true}).fill(value);
  const pass='public video receipt sample only';await panel.getByLabel('Receipt passphrase',{exact:true}).fill(pass);await panel.getByLabel('Confirm receipt passphrase',{exact:true}).fill(pass);await panel.getByRole('button',{name:'Create encrypted receipt',exact:true}).click();await expect(panel.locator('.receipt-root')).toBeVisible();
  const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download encrypted receipt',exact:true}).click();const d=await downloaded,backupPath=resolve(output,'sample-receipt.encrypted.json');await d.saveAs(backupPath);const encrypted=await readFile(backupPath,'utf8'),opened=await openReceiptBackup(encrypted,pass);
  await panel.getByLabel('Receipt backup passphrase',{exact:true}).fill(pass);await page.getByLabel('Encrypted receipt backup',{exact:true}).setInputFiles({name:'sample-receipt.json',mimeType:'application/json',buffer:Buffer.from(encrypted)});
  await expect(selection.getByRole('checkbox',{name:'Asset reference',exact:true})).toBeEnabled();await selection.scrollIntoViewIfNeeded();
  await scene('evidence',async()=>{for(const label of ['Asset reference','Declared amount','Business reference']){await sleep(250);await selection.getByRole('checkbox',{name:label,exact:true}).check();}await click(selection.getByRole('button',{name:'Prepare selected disclosure',exact:true}));await expect(page.getByRole('button',{name:'Download selected disclosure',exact:true})).toBeEnabled();await selection.scrollIntoViewIfNeeded();},{x:70,y:48,zoom:1.10});
  await writeFile(resolve(output,'receipt-public-scope.json'),JSON.stringify({root:opened.root,selectedFields:['asset','amount','reference'],chainLookupPerformed:false}));
 });
 await capture('finance',async({page,scene,click})=>{
  const f=await taxDraftFixture();f.state.ai=false;await f.install(page);await f.fill(page);await page.getByRole('button',{name:'Save grounded outline',exact:true}).click();await expect(page.getByLabel('Tax draft detail',{exact:true})).toContainText('Deterministic outline');await page.getByLabel('Tax draft detail',{exact:true}).scrollIntoViewIfNeeded();
  await scene('finance',async()=>{await sleep(2300);await click(page.getByRole('button',{name:'Request independent review',exact:true}));await expect(page.getByLabel('Tax draft detail',{exact:true})).toContainText('in review');await page.getByLabel('Tax draft detail',{exact:true}).scrollIntoViewIfNeeded();},{x:65,y:52,zoom:1.08});
 });
 if(errors.length)throw Error('Browser errors: '+JSON.stringify(errors));
 let cursor=0;for(const s of scenes){s.start=cursor;cursor+=s.duration;s.end=cursor;}
 await writeFile(resolve(output,'recording.json'),JSON.stringify({format:'money-station-ui-capture-v2',frontSource:execFileSync('git',['-C',front,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),scenes,clips,duration:cursor,errors,scope:'Actual app UI. Sample wallet/API and chain-context fixtures; actual local Groth16 proof, encrypted receipt and source-bound outline. Real unmodified wallet selector without authentication.'},null,2));console.log('Captured',scenes.length,'scenes;',cursor.toFixed(2),'seconds.');
}finally{await browser.close();}
