// Re-time flagged sentences from the section's local ASR words (s_<id>.json):
// find the sentence's words near its old window, cut from the first to the
// last word, padded into the surrounding silence only. Writes retime.json
// {id: [{i,start,end}]} for a second clip check; nothing is saved to the DB here.
const fs=require('fs');const dir='D:/tmp-dictcheck';
const ASR='D:/Projects/EnglishWithDan/backend/scripts/data/transcriptAsr';
const NUMW={zero:'0',oh:'0',one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10',okay:'ok'};
const toks=t=>String(t).replace(/[’‘]/g,"'").replace(/(\d),(\d)/g,'$1$2').toLowerCase().replace(/[^a-z0-9' ]+/g,' ').split(/\s+/).map(w=>w.replace(/^'+|'+$/g,'')).filter(Boolean).map(w=>NUMW[w]||w);
function lcs(a,b){const m=a.length,n=b.length,d=Array.from({length:m+1},()=>new Int16Array(n+1));
 for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)d[i][j]=a[i]===b[j]?d[i+1][j+1]+1:Math.max(d[i+1][j],d[i][j+1]);
 const pa=[],pb=[];let i=0,j=0;while(i<m&&j<n){if(a[i]===b[j]){pa.push(i);pb.push(j);i++;j++;}else if(d[i+1][j]>=d[i][j+1])i++;else j++;}return {k:d[0][0],pa,pb};}
const cl=JSON.parse(fs.readFileSync(dir+'/all_classified.json','utf8')).filter(o=>o.cls!=='ok'&&o.cls!=='weak'&&!(process.argv[2]&&fs.existsSync(process.argv[2])&&JSON.parse(fs.readFileSync(process.argv[2],'utf8')).includes(o.id+'|'+o.i)));
const by={};cl.forEach(o=>(by[o.id]=by[o.id]||[]).push(o));
const out={};let found=0,miss=0;
for(const [id,list] of Object.entries(by)){
 const W=JSON.parse(fs.readFileSync(`${ASR}/s_${id}.json`,'utf8')).words;
 const flat=[];W.forEach((w,wi)=>toks(w.w).forEach(t=>flat.push({t,wi})));
 for(const o of list){const a=toks(o.text);
  // candidate ASR range around the old window
  const lo=flat.findIndex(x=>W[x.wi].e>=o.start-8), hiIdx=flat.map(x=>W[x.wi].s<=o.end+8).lastIndexOf(true);
  if(lo<0||hiIdx<lo){miss++;continue;}
  const seg=flat.slice(lo,hiIdx+1);
  // best contiguous-ish placement: LCS over the range, then keep the densest run
  const {k,pa,pb}=lcs(a,seg.map(x=>x.t));
  if(k/a.length<0.6){miss++;continue;}
  // reject placements spread too far (matched span much longer than the sentence)
  const span=pb[pb.length-1]-pb[0]+1;if(span>a.length*1.6+3){miss++;continue;}
  const fw=Math.max(0,seg[pb[0]].wi-pa[0]), lw=Math.min(W.length-1,seg[pb[pb.length-1]].wi+(a.length-1-pa[pa.length-1]));
  const prevEnd=fw>0?W[fw-1].e:0, nextStart=lw<W.length-1?W[lw+1].s:W[lw].e+1;
  const start=Math.round(Math.max(W[fw].s-0.15,prevEnd,0)*100)/100;
  const end=Math.round(Math.max(W[lw].e,Math.min(W[lw].e+0.4,nextStart-0.03))*100)/100;
  (out[id]=out[id]||[]).push({i:o.i,start,end,old:[o.start,o.end],cls:o.cls});found++;}
}
fs.writeFileSync(dir+'/retime.json',JSON.stringify(out));
// jobs for the second check, same shape as jobs.json
const jobs=new Map(JSON.parse(fs.readFileSync(dir+'/jobs.json','utf8')).map(j=>[j.id,j]));
fs.mkdirSync(dir+'/pass2',{recursive:true});
fs.writeFileSync(dir+'/pass2/jobs.json',JSON.stringify(Object.entries(out).map(([id,l])=>({id,title:jobs.get(id).title,audioUrl:jobs.get(id).audioUrl,sents:l.map(x=>({i:x.i,text:jobs.get(id).sents[x.i].text,start:x.start,end:x.end}))}))));
console.log({flagged:cl.length,retimed:found,noPlacement:miss});
