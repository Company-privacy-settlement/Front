import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { execFileSync } from 'node:child_process';

const front=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const core=resolve(process.env.CORE_CHECKOUT??resolve(front,'../Core'));
const output=resolve(process.env.DEMO_OUTPUT_DIR??'/tmp/core-hackathon-demo');
const baseURL=process.env.DEMO_BASE_URL??'http://127.0.0.1:33539';
process.env.CORE_PROVER_ARTIFACTS_DIR??=resolve(core,'artifacts');
const require=createRequire(resolve(front,'package.json'));
const {chromium,expect}=require('@playwright/test');
const {build}=createRequire(resolve(core,'package.json'))('esbuild');
await mkdir(output,{recursive:true});
const scenes=JSON.parse(await readFile(resolve(front,'scripts/demo/storyboard.en.json'),'utf8'));
for(const s of scenes)s.speechDuration=Number(execFileSync('ffprobe',['-v','quiet','-show_entries','format=duration','-of','csv=p=0',resolve(output,'audio',s.id+'.mp3')],{encoding:'utf8'}).trim());
const plugin={name:'external-playwright',setup(b){b.onResolve({filter:/^@playwright\/test$/},()=>({path:pathToFileURL(resolve(front,'node_modules/@playwright/test/index.mjs')).href,external:true}));}};
let source=await readFile(resolve(front,'tests/browser/invoice-note-payment.spec.ts'),'utf8');
source=source.slice(0,source.indexOf('test.beforeEach'))+'\nexport {setup};';
await build({stdin:{contents:source,resolveDir:resolve(front,'tests/browser'),sourcefile:'demo-invoice.ts',loader:'ts'},outfile:resolve(output,'invoice-setup.mjs'),bundle:true,platform:'node',format:'esm',packages:'external',plugins:[plugin]});
await build({entryPoints:[resolve(front,'tests/browser/tax-drafts-fixture.ts')],outfile:resolve(output,'tax-setup.mjs'),bundle:true,platform:'node',format:'esm',packages:'external',plugins:[plugin]});
const {setup}=await import(pathToFileURL(resolve(output,'invoice-setup.mjs')).href);
const {taxDraftFixture}=await import(pathToFileURL(resolve(output,'tax-setup.mjs')).href);
const browser=await chromium.launch({headless:true});
const chapters=process.env.DEMO_RESUME==='1'?JSON.parse(await readFile(resolve(output,'recording.json'),'utf8')).chapters:[],errors=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function chapter(id,action){
 if(chapters.some(ch=>ch.id===id)){console.log('Reusing completed chapter '+id);return;}
 const context=await browser.newContext({baseURL,viewport:{width:1600,height:760},deviceScaleFactor:1,recordVideo:{dir:resolve(output,'raw'),size:{width:1600,height:760}},acceptDownloads:true});
 await context.addInitScript(()=>{document.addEventListener('DOMContentLoaded',()=>{const cursor=document.createElement('div');cursor.id='recording-pointer';cursor.style.cssText='position:fixed;z-index:2147483600;left:-50px;top:-50px;width:22px;height:22px;border:2px solid #d2ff5a;border-radius:50%;background:#d2ff5a33;pointer-events:none';document.body.append(cursor);document.addEventListener('mousemove',e=>{cursor.style.left=(e.clientX-11)+'px';cursor.style.top=(e.clientY-11)+'px';});},{once:true});});
 const started=performance.now(),page=await context.newPage(),cues=[];
 page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push({chapter:id,message:e.message}));
 const scene=async(name,run)=>{const s=scenes.find(x=>x.id===name);if(!s)throw Error(name);const start=(performance.now()-started)/1000;if(cues.length)cues.at(-1).end=start;const cue={...s,start};cues.push(cue);console.log('Scene '+name);await run();await sleep(Math.max(700,(s.speechDuration+0.9)*1000-(performance.now()-started-start*1000)));};
 const click=async locator=>{await locator.scrollIntoViewIfNeeded();const b=await locator.boundingBox();if(b)await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:14});await sleep(150);await locator.click();await sleep(250);};
 const shot=async name=>page.screenshot({path:resolve(output,name+'.png')});
 try { await action({page,scene,click,shot}); } catch(error) { await shot('failure-'+id); await writeFile(resolve(output,'failure-'+id+'.txt'),await page.locator('body').innerText()); await context.close(); throw error; }
 cues.at(-1).end=(performance.now()-started)/1000;
 const video=page.video();await context.close();const path=await video.path();
 chapters.push({id,path,cues});await writeFile(resolve(output,'recording.json'),JSON.stringify({chapters,errors},null,2));
}
const cardStyle=`*{box-sizing:border-box}body{margin:0;background:#090b0a;color:#f6f6ef;font-family:Arial,sans-serif}main{width:1600px;height:760px;padding:60px 110px;position:relative;background:radial-gradient(ellipse at 100% 0%,#28371b,transparent 60%)}.brand{font-size:27px;font-weight:700;letter-spacing:-1px;color:#d2ff5a;margin-bottom:36px}h1{font-size:62px;line-height:1.04;letter-spacing:-3px;max-width:1300px;font-weight:500;margin:0 0 28px}p{font-size:25px;line-height:1.5;color:#b8bfb8;max-width:1250px;margin:18px 0}.row{display:flex;gap:22px;margin-top:36px}.tile{border:1px solid #3a4233;border-radius:20px;padding:24px 28px;flex:1;background:#111710}.num{font-size:52px;letter-spacing:-2px;color:#d2ff5a;display:block;margin-bottom:10px}.tile span{font-size:21px;color:#d8dfd4}.detail{position:absolute;left:110px;bottom:35px;font-size:15px;color:#929d8f;letter-spacing:1px}.tag{color:#d2ff5a;font-size:18px;text-transform:uppercase;letter-spacing:2px;margin-bottom:22px}code{font-size:17px;color:#d2ff5a}`;
async function card(page,html){await page.setContent('<!doctype html><html lang="en"><meta charset="utf-8"><style>'+cardStyle+'</style><main><div class="brand">core.</div>'+html+'</main></html>');}
try{
 await chapter('product',async({page,scene,click,shot})=>{
  await page.goto('/');await page.locator('h1').waitFor();
  await scene('intro',async()=>{await shot('01-landing');await sleep(1800);await click(page.locator('.hero-actions').getByRole('link',{name:'Read the docs'}));});
  await page.goto('/docs/architecture/');await page.locator('h1').waitFor();
  await scene('architecture',async()=>{await page.locator('.network').scrollIntoViewIfNeeded();await shot('02-architecture');});
 });
 await chapter('payment',async({page,scene,click,shot})=>{
  const f=await setup(page,{delayed:true,prerequisite:true});
  await f.form.getByText('Trusted proving files',{exact:true}).click();
  await page.getByRole('heading',{name:'Design milestone',exact:true}).scrollIntoViewIfNeeded();
  await scene('invoice',async()=>{await sleep(1500);await f.open(f.notes[0]);await f.form.getByRole('button',{name:'Generate invoice proof',exact:true}).scrollIntoViewIfNeeded();await shot('03-note-selected');});
  await scene('proof',async()=>{await click(f.form.getByRole('button',{name:'Generate invoice proof',exact:true}));await expect(f.form.getByRole('heading',{name:'Invoice proof ready',exact:true})).toBeVisible({timeout:90000});await f.form.locator('.invoice-note-quote').scrollIntoViewIfNeeded();await shot('04-proof-ready');});
  await scene('review',async()=>{await sleep(2500);await click(f.form.getByRole('button',{name:'Review amount & fees',exact:true}));await click(page.getByRole('button',{name:'Approve prerequisite in wallet',exact:true}));await expect(page.getByRole('button',{name:'Approve payment in wallet',exact:true})).toBeEnabled();await shot('05-fee-review');});
  await scene('confirmation',async()=>{await click(page.getByRole('button',{name:'Approve payment in wallet',exact:true}));await expect(page.locator('.live-review')).toContainText('processing');await sleep(1700);f.confirmPending();await expect(page.locator('.invoice-payment-confirmed')).toBeVisible();await page.locator('.invoice-payment-confirmed').scrollIntoViewIfNeeded();await shot('06-confirmation');expect(await f.calls()).toHaveLength(2);});
 });
 await chapter('preparation',async({page,scene,click,shot})=>{
  const f=await taxDraftFixture();f.state.ai=false;await f.install(page);await f.fill(page);
  await scene('draft',async()=>{await click(page.getByRole('button',{name:'Save grounded outline',exact:true}));await expect(page.getByLabel('Tax draft detail',{exact:true})).toContainText('Deterministic outline');await page.getByLabel('Tax draft detail',{exact:true}).scrollIntoViewIfNeeded();await shot('07-cited-draft');});
  await scene('review-state',async()=>{await writeFile(resolve(output,'draft-before-review.txt'),await page.locator('body').innerText());await click(page.getByRole('button',{name:'Request independent review',exact:true}));await expect(page.getByLabel('Tax draft detail',{exact:true})).toContainText('in review');await shot('08-independent-review');});
 });
 await chapter('evidence',async({page,scene,shot})=>{
  const evidence=JSON.parse(await readFile(resolve(core,'docs/evidence/testnet-wallet-2026-11-14.json'),'utf8'));if(!JSON.stringify(evidence).includes('c14f-c1b494d1.testnet'))throw Error('Evidence mismatch');
  await card(page,'<div class="tag">Public NEAR testnet · recorded CLI evidence</div><h1>Fourteen transactions.<br>Real receipts.</h1><div class="row"><div class="tile"><b class="num">14</b><span>signed FINAL transactions</span></div><div class="tile"><b class="num">2 × 0.1</b><span>NEAR deposits and full payouts</span></div><div class="tile"><b class="num">0</b><span>registry and vault access keys</span></div></div><p>c14f-c1b494d1.testnet · 14 November 2026</p><div class="detail">PUBLIC EVIDENCE JSON + INDEPENDENT READ-ONLY REVERIFIER IN CORE</div>');
  await scene('native-evidence',async()=>{await shot('09-native-evidence');});
  await card(page,'<div class="tag">A missing recipient · an actual failed transfer</div><h1>Retryable → Complete</h1><p>The original nullifier, vault, amount and recipient stay bound.</p><div class="row"><div class="tile"><b class="num">0.1 NEAR</b><span>full principal recovered</span></div><div class="tile"><b class="num">0</b><span>extra protocol fee on retry</span></div><div class="tile"><b class="num">0</b><span>outstanding notes at the end</span></div></div><p><code>late.core14-0574c4-ebed76bb2c.testnet</code></p><div class="detail">RECORDED NATIVE CLI RUN · NOT A BROWSER WALLET TRANSACTION</div>');
  await scene('recovery',async()=>{await shot('10-recovery');});
  await card(page,'<div class="tag">Inspect the evidence. Understand the boundaries.</div><h1>Verifiable execution.<br>Privacy needs participation.</h1><p>Read-only checks: receipts · signatures · code · access keys · historical balances</p><div class="row"><div class="tile"><span>Public metadata can correlate deposits and payouts.</span></div><div class="tile"><span>Browser wallet / USDC public qualification is still open.</span></div><div class="tile"><span>Hosting and production security review remain separate.</span></div></div><div class="detail">DEVELOPMENT SRS · SINGLE-PAYER RUN · NO EFFECTIVE ANONYMITY CLAIM</div>');
  await scene('boundaries',async()=>{await shot('11-boundaries');});
  await card(page,'<div class="tag">Private settlement. Shared confidence.</div><h1>Inspect. Run. Verify.</h1><p>Core · Contract · Front</p><div class="row"><div class="tile"><span>English-first READMEs<br>한국어 · 简体中文</span></div><div class="tile"><span>Local browser proofs<br>Signed invoice checkout</span></div><div class="tile"><span>Public testnet evidence<br>Failure and recovery</span></div></div><p>github.com/Company-privacy-settlement</p><div class="detail">CORE · NEAR HACKATHON PROTOTYPE</div>');
  await scene('closing',async()=>{await shot('12-closing');});
 });
 const context=await browser.newContext({viewport:{width:1600,height:900}}),page=await context.newPage();
 await card(page,'<div class="tag">NEAR hackathon · English demo</div><h1 style="font-size:84px">Private settlement.<br>Shared confidence.</h1><p>Distributed principal · Shared ZK notes · Selective evidence</p><div class="row"><div class="tile"><b class="num">▶ Watch</b><span>Proof → review → signature → confirmation</span></div><div class="tile"><b class="num">14 FINAL</b><span>public native testnet transactions</span></div></div><div class="detail">BROWSER FIXTURES AND REAL NATIVE CLI EVIDENCE ARE IDENTIFIED IN THE VIDEO</div>');
 await page.evaluate(()=>document.querySelector('main').style.height='900px');await page.screenshot({path:resolve(output,'poster.png')});await context.close();
 if(errors.length)throw Error('Browser errors: '+JSON.stringify(errors));
 console.log('Recording complete: '+chapters.length+' chapters.');
}finally{await browser.close();}
