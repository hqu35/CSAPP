(() => {
'use strict';
const P=window.CS229_PLAN, M=window.PlanModel, $=id=>document.getElementById(id);
const byDate=new Map(P.sessions.map(s=>[s.date,s]));
const phaseNames=[...new Set(P.sessions.map(s=>s.phase))];
// Display headings are short excerpts from that same day's PDF row.
const excerpts={
'09-19':'LMS/gradient descent','09-20':'linear regression','09-22':'normal equations','09-24':'linear regression',
'09-26':'logistic-regression','09-27':'likelihood','09-29':'Newton','10-01':'exponential-family and GLM',
'10-03':'PSet 1','10-04':'logistic regression','10-06':'bias-variance, regularization, and model selection',
'10-08':'covariance','10-10':'Gaussian Discriminant Analysis and Naive Bayes','10-11':'Naive Bayes',
'10-13':'SVM','10-15':'kernel','10-17':'empirical risk minimization and uniform convergence','10-18':'PSet 2',
'10-20':'K-means, mixture of Gaussians, and EM','10-22':'EM','10-24':'K-means','10-25':'GMM EM',
'10-27':'trees','10-29':'boosting','10-31':'evaluation-metrics','11-01':'PSet 3','11-03':'neural network',
'11-05':'Jacobian','11-07':'backprop','11-08':'tiny NN','11-10':'learning-theory','11-12':'error analysis',
'11-14':'ConvNet','11-15':'supervised ML map','11-17':'Bellman','11-19':'value iteration vs policy iteration',
'11-21':'finite MDP','11-22':'PSet 4','11-24':'PCA','11-26':'Light Math / Holiday','11-28':'PCA',
'11-29':'PSet 4','12-01':'transformer','12-03':'next-token prediction','12-05':'LLM workflow',
'12-06':'privacy/fairness','12-08':'linear/logistic/GLM/GDA/NB','12-10':'classical supervised methods',
'12-12':'unsupervised','12-13':'two-layer backpropagation','12-15':'Bellman','12-17':'prerequisite',
'12-19':'Capstone','12-20':'Final Mastery'};
function topic(s) { return M.isBuffer(s)?'CSAPP priority':(excerpts[s.date.slice(5)]||s.mode); }
function escape(s) { return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fmt(d,opts={month:'short',day:'numeric'}) { return M.parseDate(d).toLocaleDateString('en-US',opts); }
function clamp(d){return d<P.start?P.start:d>P.end?P.end:d;}
let today=M.dateKey(),selected=clamp(today),weekStart=M.monday(selected),progress={},storageOk=true;
try { progress=M.sanitizeProgress(JSON.parse(localStorage.getItem(M.STORAGE_KEY)||'{}'),P.sessions); }
catch { storageOk=false; }
function storageStatus(){ $('storage-status').textContent=storageOk?'Progress saved on this browser':'Progress is not saved · browser storage unavailable or unreadable'; }
function save(){try{localStorage.setItem(M.STORAGE_KEY,JSON.stringify(progress));storageOk=true;}catch{storageOk=false;} storageStatus();}
function category(s,t,i){
 if(M.isBuffer(s)) return /repair|review|recall|cleanup|unfinished|behind/i.test(t)?'Recall / catch-up':'CSAPP priority';
 if(/^(Keep|Do not|No sklearn|No large|No implementation|Stop before|Leave any|Cap this|If PSet|Set Dec)/i.test(t))return 'Stop / scope';
 if(/^Math patch|^Patch only|^Review (spectral|projection)|^Audit:|^Repair only/.test(t))return 'Math patch';
 if(/oral|without notes|without looking|from memory/i.test(t))return 'Mastery check';
 if(/PSet/.test(t))return 'Practice / PSet';
 if(/^Implement|^Run |^Train |^Gradient-check|^Track |^Center a dataset|^Visualize|^Compare your result|^Verify the analytic|^Measure the K-means|^No sklearn/.test(t))return 'Practice / lab';
 if((i===0 && s.mode==='Math + Core') || /^No new lecture/.test(t))return 'Lecture / topic';
 if(i===0 && /Math/.test(s.mode))return 'Math patch';
 if(/^(Derive|Re-derive|Write |Compute|Calculate|Trace|Work |Do \d|Solve|Redo|Reconstruct|Blank-page|Hand-compute|Create|Make |Prepare|Formalize)/.test(t))return 'Practice';
 return 'Lecture / topic';
}
function renderOverview(){
 $('clock').textContent=fmt(today,{weekday:'long',month:'long',day:'numeric',year:'numeric'});$('clock').dateTime=today;
 const current=byDate.get(today);
 $('current-phase-number').textContent=current?`${phaseNames.indexOf(current.phase)+1} / 7`:'';
 $('current-phase').textContent=current?current.phase:today<P.start?'Plan starts September 19':'Schedule ended December 20';
 $('current-topic').textContent=current?topic(current):'No session scheduled today';
 const st=M.stats(P.sessions,progress);$('overall-percent').textContent=st.percent+'%';$('overall-bar').value=st.completed;
 $('overall-count').textContent=`${st.completed} completed · ${st.remaining} remaining days`;
 const overdue=P.sessions.filter(s=>s.date<today&&!progress[s.date]&&!M.isBuffer(s));
 $('backlog').innerHTML=overdue.length?`<button class="backlog-btn" id="open-backlog">${overdue.length} unfinished past ML sessions ↗</button>`:'<span>No past ML sessions pending</span>';
 if(overdue.length)$('open-backlog').onclick=()=>select(overdue[0].date);
}
function select(date){selected=clamp(date);weekStart=M.monday(selected);render();}
function renderWeek(){
 $('week-range').textContent=`${fmt(weekStart)} — ${fmt(M.addDays(weekStart,6))}`;
 $('date-picker').value=selected;
 $('prev-week').disabled=M.addDays(weekStart,-1)<P.start;
 $('next-week').disabled=M.addDays(weekStart,7)>P.end;
 $('week').innerHTML=Array.from({length:7},(_,i)=>{
   const date=M.addDays(weekStart,i),s=byDate.get(date),isToday=date===today;
   const type=s?(M.isBuffer(s)?'buffer':s.mode.includes('Catch-up')?'catchup':'core'):'outside';
   return `<button class="day ${type} ${date===selected?'selected':''} ${progress[date]?'completed':''}" data-date="${date}" ${s?'':'disabled'} aria-pressed="${date===selected}" ${isToday?'aria-current="date"':''} aria-label="${escape(fmt(date,{weekday:'long',month:'long',day:'numeric'}))}${s?', '+escape(s.mode)+', '+escape(topic(s)): ', outside plan'}${progress[date]?', completed':''}"><span class="day-top"><span>${fmt(date,{weekday:'short'})}</span><span class="day-status">${progress[date]?'✓':isToday?'TODAY':''}</span></span><strong class="day-number">${M.parseDate(date).getDate()}</strong><span class="day-topic">${s?escape(topic(s)):'—'}</span><span class="day-type">${s?(type==='buffer'?'CSAPP · buffer':type==='catchup'?'Catch-up':escape(s.mode)):'Outside plan'}</span></button>`;
 }).join('');
 $('week').querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>select(b.dataset.date));
 scrollWeekSelection();
}
function scrollWeekSelection(){
 const week=$('week'),active=week.querySelector('.selected');
 if(active && week.scrollWidth>week.clientWidth){
  week.scrollLeft+=active.getBoundingClientRect().left-week.getBoundingClientRect().left-(week.clientWidth-active.offsetWidth)/2;
 }
}
window.addEventListener('resize',scrollWeekSelection);
function renderDay(){
 const s=byDate.get(selected),isToday=selected===today,done=!!progress[selected],buffer=M.isBuffer(s);
 const labels=s.tasks.map((t,i)=>category(s,t,i));
 const ms=P.milestones.find(m=>m.date===selected);
 $('day-content').innerHTML=`<div class="day-card-top"><p class="eyebrow">${isToday?'TODAY':selected>today?'UPCOMING SESSION':'SELECTED SESSION'} <span class="day-count">DAY ${P.sessions.indexOf(s)+1} / 93</span></p><span class="small muted">${fmt(selected,{weekday:'short',month:'short',day:'numeric'})}</span></div>
 <h2 id="day-title">${escape(topic(s))}</h2>
 <div class="day-meta"><span class="pill ${buffer?'amber':s.mode.includes('Catch-up')?'violet':''}">${escape(s.mode)}</span><span>${escape(s.duration)}</span>${done?'<span class="done-label">✓ Completed</span>':''}</div>
 <p class="phase-context">${escape(s.phase)}</p>
 ${buffer?'<div class="priority-note">CSAPP takes priority. No new ML lecture.</div>':''}
 ${s.mode.includes('Catch-up')?'<div class="priority-note catchup-note">Catch-up day · Keep the original schedule fixed.</div>':''}
 <ol class="task-list">${s.tasks.map((t,i)=>`<li><div class="task-label"><span class="task-number">${String(i+1).padStart(2,'0')}</span><span>${labels[i]}</span></div><p>${escape(t)}</p></li>`).join('')}</ol>
 ${labels.includes('Math patch')?'':'<p class="unspecified">Math patch: no separate patch specified for this day.</p>'}
 <section class="mastery"><div class="mastery-icon" aria-hidden="true">◎</div><div><h3>Mastery check <span> / Done & stop condition</span></h3><p>${escape(s.doneWhen)}</p></div></section>
 ${ms?`<div class="due-milestone"><span class="eyebrow">MILESTONE DUE TODAY</span><p>${escape(ms.text)}</p></div>`:''}
 ${selected===P.end?`<details class="final-questions"><summary>12 final mastery questions</summary><ol>${P.finalQuestions.map(q=>`<li>${escape(q)}</li>`).join('')}</ol></details>`:''}
 <div class="card-bottom"><div><button id="toggle-done" class="primary-btn ${done?'is-done':''}" aria-pressed="${done}">${done?'✓ Completed · Undo':'Mark session complete'}</button><p class="completion-hint">${buffer?'Mark after respecting the day’s workload limit.':'Mark when the work and stop condition are met.'}</p></div><span class="source-page">Plan · p. ${s.sourcePage}</span></div>`;
 $('toggle-done').onclick=()=>{if(progress[selected])delete progress[selected];else progress[selected]=true;save();render();$('toggle-done').focus();$('announcement').textContent=`${fmt(selected)} ${progress[selected]?'completed':'reopened'}.`;};
}
function renderPhases(){
 const current=byDate.get(today);
 $('phases').innerHTML=phaseNames.map((name,i)=>{
  const sessions=P.sessions.filter(s=>s.phase===name),st=M.stats(sessions,progress),active=current?.phase===name;
  return `<button class="phase-row ${active?'active':''}" data-phase="${i}" aria-label="${escape(name)}, ${st.completed} of ${st.total} days complete. View phase."><span class="phase-index">${String(i+1).padStart(2,'0')}</span><span class="phase-body"><span class="phase-heading">${escape(name)}${active?'<i class="status-dot" aria-label="Current phase"></i>':''}</span><span class="phase-sub">${fmt(sessions[0].date)} – ${fmt(sessions.at(-1).date)}<span>${st.completed}/${st.total}</span></span><progress max="${st.total}" value="${st.completed}" aria-label="${escape(name)} progress"></progress></span></button>`;
 }).join('');
 $('phases').querySelectorAll('[data-phase]').forEach(b=>b.onclick=()=>select(P.sessions.find(s=>s.phase===phaseNames[Number(b.dataset.phase)]).date));
 const ml=M.stats(P.sessions.filter(s=>!M.isBuffer(s)),progress),buffer=M.stats(P.sessions.filter(M.isBuffer),progress);
 $('session-totals').innerHTML=`<div><span>ML sessions</span><strong>${ml.completed} / ${ml.total}</strong></div><p>${ml.remaining} remaining</p><div><span>CSAPP / buffer days</span><strong>${buffer.completed} / ${buffer.total}</strong></div><p>${buffer.remaining} remaining</p>`;
}
function renderMilestones(){
 const next=P.milestones.find(m=>m.date>=today);
 const item=m=>`<button class="milestone ${next===m?'next':''}" data-date="${m.date}" aria-label="View milestone on ${fmt(m.date)}: ${escape(m.text)}"><span class="milestone-date">${fmt(m.date)}${next===m?'<span class="next-tag">NEXT</span>':''}</span><span>${escape(m.text)}</span></button>`;
 $('milestones').innerHTML=(next?item(next):'<p class="small muted">All milestone dates have passed.</p>')+`<details class="all-milestones"><summary>All 7 milestone dates</summary><div>${P.milestones.map(item).join('')}</div></details>`;
 $('milestones').querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>select(b.dataset.date));
}
function render(){renderOverview();renderWeek();renderDay();renderPhases();renderMilestones();storageStatus();}
$('prev-week').onclick=()=>select(clamp(M.addDays(selected,-7)));
$('next-week').onclick=()=>select(clamp(M.addDays(selected,7)));
$('today').onclick=()=>select(today);
$('date-picker').onchange=e=>{if(byDate.has(e.target.value))select(e.target.value);else e.target.value=selected;};
window.addEventListener('storage',e=>{if(e.key===M.STORAGE_KEY || e.key===null){try{progress=M.sanitizeProgress(JSON.parse(localStorage.getItem(M.STORAGE_KEY)||'{}'),P.sessions);storageOk=true;render();}catch{storageOk=false;storageStatus();}}});
// Refresh the real current date after midnight or after returning to the tab.
function refreshDate(){const now=M.dateKey();if(now!==today){const wasToday=selected===today;today=now;if(wasToday){selected=clamp(today);weekStart=M.monday(selected);}render();}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDate();});setInterval(refreshDate,30000);
render();
})();
