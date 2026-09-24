/* Date-only arithmetic deliberately avoids UTC parsing and DST-sized days. */
(function (root) {
  const STORAGE_KEY = 'cs229.daily-plan.2026.progress.v1';
  function dateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function parseDate(key) { const [y,m,d] = key.split('-').map(Number); return new Date(y,m-1,d,12); }
  function addDays(key,n) { const d=parseDate(key); d.setDate(d.getDate()+n); return dateKey(d); }
  function monday(key) { const d=parseDate(key); return addDays(key,-((d.getDay()+6)%7)); }
  function isBuffer(s) { return s.mode === 'CSAPP Priority / Buffer'; }
  function sanitizeProgress(value, sessions) {
    const valid = new Set(sessions.map(s=>s.date)); const result = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
    for (const [date,done] of Object.entries(value)) if (valid.has(date) && done === true) result[date]=true;
    return result;
  }
  function stats(sessions, progress) {
    const completed=sessions.filter(s=>progress[s.date]===true).length;
    return {total:sessions.length,completed,remaining:sessions.length-completed,percent:sessions.length?Math.round(completed/sessions.length*100):0};
  }
  const api={STORAGE_KEY,dateKey,parseDate,addDays,monday,isBuffer,sanitizeProgress,stats};
  if(typeof module!=='undefined') module.exports=api;
  else root.PlanModel=api;
})(typeof window!=='undefined'?window:globalThis);
