"""Extract dated rows from Poppler bbox XML; never synthesize daily tasks."""
import json, re, sys, hashlib
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import date, timedelta
NS = {'h':'http://www.w3.org/1999/xhtml'}
xml_path = Path(sys.argv[1])
pages = ET.parse(xml_path).findall('.//h:page', NS)
def lines(page):
    return sorted([(float(l.attrib['xMin']), float(l.attrib['yMin']), ' '.join(w.text or '' for w in l)) for l in page.findall('.//h:line', NS)], key=lambda l:(l[1], l[0]))
def join(parts):
    s=''
    for p in parts:
        if s and (re.search(r'[A-Za-z]-$',s) or s.endswith('/')): s+=p
        else: s+=(' ' if s else '')+p
    return s.replace('representation/o ptimization', 'representation/optimization').replace('algebra/probability/calculu s', 'algebra/probability/calculus')
sessions=[]; phase=''; week=''
for pn,page in enumerate(pages,1):
    if not 3<=pn<=38: continue
    ls=lines(page)
    starts=[l for l in ls if l[0]<100 and re.fullmatch('Mon|Tue|Wed|Thu|Fri|Sat|Sun',l[2])]
    events=sorted([(y,'phase',t[7:]) for x,y,t in ls if t.startswith('Phase: ')]+[(y,'week',t) for x,y,t in ls if t.startswith(('Week ','Launch Weekend'))]+[(y,'day',t) for x,y,t in starts])
    for y,kind,t in events:
        if kind=='phase': phase=t; continue
        if kind=='week': week=t; continue
        bounds=[yy for x,yy,tt in ls if yy>y and (tt.startswith(('Phase:','Week ','Launch Weekend','December 20 final mastery')) or (x<100 and re.fullmatch('Mon|Tue|Wed|Thu|Fri|Sat|Sun',tt)))]
        end=min(bounds+[735])
        row=[(x,yy,tt) for x,yy,tt in ls if y-.01<=yy<end]
        dt=next(tt for x,yy,tt in row if x<100 and re.fullmatch('(Sep|Oct|Nov|Dec) \\d{2}',tt))
        month,day=dt.split(); iso=f'2026-{["Sep","Oct","Nov","Dec"].index(month)+9:02}-{int(day):02}'
        mode=join([tt for x,yy,tt in row if 175<x<305])
        tasks=[]
        for x,yy,tt in row:
            if 310<x<435:
                if tt.startswith('• '): tasks.append([tt[2:]])
                else:
                    assert tasks,(iso,tt)
                    tasks[-1].append(tt)
        done=join([tt for x,yy,tt in row if x>435])
        sessions.append(dict(date=iso,day=t,phase=phase,week=week,mode=mode.split(' (')[0],duration=mode.split(' (')[1].rstrip(')'),tasks=[join(t) for t in tasks],doneWhen=done,sourcePage=pn))
assert len(sessions)==93
for i,s in enumerate(sessions):
    assert s['date']==(date(2026,9,19)+timedelta(days=i)).isoformat()
    assert s['day']==date.fromisoformat(s['date']).strftime('%a')
    assert s['tasks'] and s['doneWhen'] and s['phase']
# The milestone table is also extracted directly, keeping its own wording.
ls=lines(pages[1]); starts=[(y,t) for x,y,t in ls if x<100 and re.fullmatch('(Sep|Oct|Nov|Dec) \\d{1,2}',t)]
milestones=[]
for i,(y,t) in enumerate(starts):
    end=starts[i+1][0] if i+1<len(starts) else next(yy for x,yy,tt in ls if tt=='Weekly rhythm')
    month,day=t.split()
    milestones.append({'date':f'2026-{["Sep","Oct","Nov","Dec"].index(month)+9:02}-{int(day):02}', 'text':join([tt for x,yy,tt in ls if x>300 and y-.01<=yy<end])})
assert len(milestones)==7
# Preserve the final 12-question checklist as a single, expandable reference.
ls=lines(pages[37]); a=next(y for x,y,t in ls if t=='December 20 final mastery questions'); b=next(y for x,y,t in ls if t=='Course-version mapping used to build this plan')
qs=[]
for x,y,t in ls:
    if a<y<b:
        if re.match(r'^\d+\. ',t): qs.append([re.sub(r'^\d+\. ','',t)])
        else: qs[-1].append(t)
questions=[join(q) for q in qs]; assert len(questions)==12
out={'source':'CS229_ML_Fundamentals_Daily_Plan_2026.pdf','start':'2026-09-19','end':'2026-12-20','sessions':sessions,'milestones':milestones,'finalQuestions':questions}
root=Path(__file__).resolve().parents[1]
(root/'schedule.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
(root/'schedule.js').write_text('window.CS229_PLAN = '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
print(f'Extracted {len(sessions)} days, {len(milestones)} milestones, {len(questions)} final questions.')
for s in sessions:
 print(s['date'],s['mode'],s['phase'],'|',len(s['tasks']),'tasks |',s['tasks'][0])
print(json.dumps(milestones,indent=2))
