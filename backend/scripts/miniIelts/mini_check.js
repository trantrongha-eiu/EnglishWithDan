const fs=require('fs');
const norm=s=>' '+String(s).replace(/<[^>]+>/g,' ').toLowerCase().replace(/[‘’`]/g,"'").replace(/[–—-]/g,' ').replace(/[^a-z0-9'%.]+/g,' ').replace(/\.(?!\d)/g,' ').replace(/\s+/g,' ')+' ';
for(const id of process.argv.slice(2)){const d=JSON.parse(fs.readFileSync(`web/mini/draft_${id}.json`,'utf8'));const c=norm(d.content);const P=[];
 const labels=new Set([...d.content.matchAll(/<p><strong>([A-J])<\/strong>/g)].map(m=>m[1]));
 for(const g of d.questionGroups){for(const q of g.questions){const k=q.correctAnswer;
  if(q.type==='fill-blank'&&!k.split(/\s*\/\s*/).some(a=>c.includes(norm(a))))P.push(`Q${q.questionNumber} "${k}" not in passage`);
  if(q.type==='true-false-ng'&&!/^(TRUE|FALSE|NOT GIVEN)$/.test(k))P.push(`Q${q.questionNumber} TFNG key ${k}`);
  if(q.type==='yes-no-ng'&&!/^(YES|NO|NOT GIVEN)$/.test(k))P.push(`Q${q.questionNumber} YNNG key ${k}`);
  if(q.type==='multiple-choice'&&(q.options.length!==4||!/^[A-D]$/.test(k)))P.push(`Q${q.questionNumber} MC opts=${q.options.length} key=${k}`);
  if(g.groupType==='matching-options'&&/paragraph|section/i.test(g.instruction)&&!labels.has(k))P.push(`Q${q.questionNumber} para ${k} not labelled in content`);
  if(g.groupType==='matching-options'&&!/paragraph|section/i.test(g.instruction)&&k.charCodeAt(0)-65>=g.matchingOptions.length)P.push(`Q${q.questionNumber} key ${k} beyond options`);
  if(g.groupType==='sentence-endings'&&!g.endingsConfig.endings.some(e=>e.letter===k))P.push(`Q${q.questionNumber} ending ${k} missing`);
  if(g.groupType==='matching-headings'&&!g.headingsConfig.headings.some(h=>h.numeral===k))P.push(`Q${q.questionNumber} heading ${k} missing`);}
  if(g.groupType==='matching-headings'){const need=g.questions.map(q=>(q.questionText.match(/Paragraph ([A-J])/)||[])[1]);need.forEach(L=>{if(!labels.has(L))P.push(`paragraph ${L} not labelled`)})}}
 const odd=(d.content.replace(/<[^>]+>/g,' ').match(/\b[a-z]+[A-Z]\w*|\s[,.]\w|\w{25,}/g)||[]);
 console.log(id,d.title.slice(0,40).padEnd(40),d.category,'labels='+[...labels].join(''),P.length?'\n   '+P.join('\n   '):'OK',odd.length?'\n   odd tokens: '+odd.slice(0,8).join(' | '):'')}
