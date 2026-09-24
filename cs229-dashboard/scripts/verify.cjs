const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const M=require('../model.js');
const P=require('../schedule.json');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
 assert.equal(P.sessions.length,93);assert.equal(P.milestones.length,7);assert.equal(P.finalQuestions.length,12);
 assert.equal(P.sessions.filter(M.isBuffer).length,39);
 assert.equal(new Set(P.sessions.map(s=>s.phase)).size,7);
 for(let i=0;i<P.sessions.length;i++)assert.equal(P.sessions[i].date,M.addDays(P.start,i));
 assert.equal(M.addDays('2026-11-01',1),'2026-11-02');assert.equal(M.monday('2026-11-01'),'2026-10-26');
 assert.deepEqual(M.sanitizeProgress({'2026-09-19':true,'2026-09-20':'true','bad':true},P.sessions),{'2026-09-19':true});
 const headings=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8').match(/const excerpts=({[\s\S]*?});/)[1];
 const excerpts=Function('return '+headings)();
 for(const s of P.sessions){if(M.isBuffer(s))continue;assert.ok([s.mode,...s.tasks,s.doneWhen].join(' ').toLowerCase().includes(excerpts[s.date.slice(5)].toLowerCase()),`Non-source topic ${s.date}`);}
 const browser=await chromium.launch({headless:true,timeout:30000,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1100},timezoneId:'America/Chicago'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-09-19T12:00:00-05:00')});
 await page.goto('http://127.0.0.1:5175');
 assert.equal(await page.locator('#day-title').textContent(),'LMS/gradient descent');
 assert.equal(await page.locator('#overall-count').textContent(),'0 completed · 93 remaining days');
 await page.screenshot({path:path.join(__dirname,'../../tmp/cs229/dashboard-desktop.png'),fullPage:true});
 if(process.argv.includes('--layout-only')){
  assert.match(await page.locator('.task-label').first().textContent(),/Lecture \/ topic/);
  assert.equal(await page.locator('.all-milestones').getAttribute('open'),null);
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>new Promise(requestAnimationFrame));
  assert.ok(await page.evaluate(()=>{const a=document.querySelector('.day.selected').getBoundingClientRect(),b=document.querySelector('#week').getBoundingClientRect();return a.left>=b.left-1&&a.right<=b.right+1;}),'Selected day must be visible on mobile');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(__dirname,'../../tmp/cs229/dashboard-mobile.png'),fullPage:true});
  await page.locator('.all-milestones summary').click();assert.equal(await page.locator('.all-milestones .milestone').count(),7);
  assert.deepEqual(errors,[]);await browser.close();console.log('PASS: final desktop/mobile layout, visible selected day, original topic label, expandable 7 milestones, no overflow or browser errors.');return;
 }
 await page.locator('#toggle-done').click();assert.equal(await page.locator('#overall-count').textContent(),'1 completed · 92 remaining days');
 await page.reload();assert.match(await page.locator('#toggle-done').textContent(),/Completed/);
 await page.locator('#toggle-done').click();
 // Every displayed row must have every original bullet in the original order.
 for(const s of P.sessions){
  await page.locator('#date-picker').fill(s.date);await page.locator('#date-picker').dispatchEvent('change');
  assert.deepEqual(await page.locator('.task-list li p').allTextContents(),s.tasks,s.date);
  assert.equal(await page.locator('.mastery p').textContent(),s.doneWhen,s.date);
  assert.equal(await page.locator('.source-page').textContent(),`Plan · p. ${s.sourcePage}`);
 }
 assert.equal(await page.locator('.final-questions li').count(),12);
 await page.locator('#date-picker').fill('2026-11-29');await page.locator('#date-picker').dispatchEvent('change');
 assert.match(await page.locator('.pill').textContent(),/Catch-up/);assert.equal(await page.locator('.due-milestone p').textContent(),P.milestones[4].text);
 await page.locator('#date-picker').fill('2026-09-21');await page.locator('#date-picker').dispatchEvent('change');
 assert.match(await page.locator('.priority-note').textContent(),/CSAPP/);
 // Browsing leaves real current phase and topic unchanged.
 assert.equal(await page.locator('#current-topic').textContent(),'LMS/gradient descent');
 await page.locator('#today').click();
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:path.join(__dirname,'../../tmp/cs229/dashboard-mobile.png'),fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Mobile page must not overflow');
 await page.locator('#next-week').click();assert.equal(await page.locator('#date-picker').inputValue(),'2026-09-26');
 await page.locator('#prev-week').click();assert.equal(await page.locator('#date-picker').inputValue(),'2026-09-19');
 // Out-of-range real dates are not mislabeled as a scheduled Today session.
 await page.clock.setFixedTime(new Date('2026-12-21T12:00:00-06:00'));await page.reload();
 assert.equal(await page.locator('#current-topic').textContent(),'No session scheduled today');
 assert.match(await page.locator('.day-card-top .eyebrow').textContent(),/SELECTED SESSION/);
 await page.clock.setFixedTime(new Date('2026-09-18T12:00:00-05:00'));await page.reload();
 assert.match(await page.locator('#current-phase').textContent(),/Plan starts/);assert.match(await page.locator('.day-card-top .eyebrow').textContent(),/UPCOMING/);
 // Corrupt storage must not break the plan or fabricate completion.
 await page.evaluate(k=>localStorage.setItem(k,'{broken'),M.STORAGE_KEY);await page.reload();
 assert.match(await page.locator('#storage-status').textContent(),/not saved/);assert.match(await page.locator('#overall-count').textContent(),/^0 completed/);
 await page.evaluate(k=>localStorage.removeItem(k),M.STORAGE_KEY);
 assert.deepEqual(errors,[]);
 await browser.close();
 console.log('PASS: 93 exact day renders; 7 phases; 7 milestones; 12 final questions; source-excerpt titles; completion, undo and reload persistence; DST dates; weekly navigation; priority/catch-up; mobile overflow; outside-plan dates; corrupt storage; no browser errors.');
})().catch(e=>{console.error(e);process.exit(1)});
