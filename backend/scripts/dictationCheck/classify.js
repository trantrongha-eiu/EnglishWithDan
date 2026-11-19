// Classify each sentence from the clip re-transcription: ok / start-cut / end-cut / leak / wrong
const fs=require('fs');
const dir=process.argv[2]||'D:/tmp-dictcheck';
const jobs=new Map(JSON.parse(fs.readFileSync(dir+'/jobs.json','utf8')).map(j=>[j.id,j]));
const NUMW={zero:'0',oh:'0',one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10',okay:'ok',organise:'organize',organised:'organized',colour:'color',centre:'center'};
const toks=t=>String(t).replace(/[’‘]/g,"'").replace(/(\d),(\d)/g,'$1$2').replace(/(\w)-(\w)/g,'$1$2').toLowerCase().replace(/[^a-z0-9' ]+/g,' ').split(/\s+/).map(w=>w.replace(/^'+|'+$/g,'')).filter(Boolean).map(w=>NUMW[w]||w);
// LCS-based match of want vs heard
// near-equal words: UK/US spelling, plural -s, 1–2 letters off — but never a
// clipped word (heard "any" for "anything" stays a mismatch)
const stem=w=>w.replace(/is(e|ed|es|ing|ation)$/,'iz$1').replace(/our$/,'or').replace(/(re)$/,'er').replace(/s$/,'');
function ed(a,b){const d=[];for(let i=0;i<=a.length;i++){d[i]=[i];for(let j=1;j<=b.length;j++)d[i][j]=i?Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)):j;}return d[a.length][b.length];}
function eq(x,y){if(x===y)return true;const a=stem(x),b=stem(y);if(a===b)return true;if(Math.min(a.length,b.length)<4)return false;
 if(Math.abs(a.length-b.length)>2)return false;return ed(a,b)<=Math.max(1,Math.floor(Math.max(a.length,b.length)/5));}
function lcs(a,b){const m=a.length,n=b.length,d=Array.from({length:m+1},()=>new Int16Array(n+1));
 for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)d[i][j]=eq(a[i],b[j])?d[i+1][j+1]+1:Math.max(d[i+1][j],d[i][j+1]);
 const pa=[],pb=[];let i=0,j=0;while(i<m&&j<n){if(eq(a[i],b[j])){pa.push(i);pb.push(j);i++;j++;}else if(d[i+1][j]>=d[i][j+1])i++;else j++;}return {k:d[0][0],pa,pb};}
const FILLER=new Set(['hmm','um','uh','er','erm','ah','mm','mmm','uhm']);
const out=[];
for(const f of fs.readdirSync(dir).filter(f=>/^results_\d+\.jsonl$/.test(f)))
 for(const line of fs.readFileSync(dir+'/'+f,'utf8').split('\n').filter(Boolean)){
  const r=JSON.parse(line);if(!r.rows)continue;const j=jobs.get(r.id);
  for(const row of r.rows){const s=j.sents.find(x=>x.i===row.i);const a=toks(s.text).filter(w=>!FILLER.has(w)),b=toks(row.heard).filter(w=>!FILLER.has(w));const sqA=a.join(''),sqB=b.join('');
   const {k,pa,pb}=lcs(a,b);const recall=a.length?k/a.length:1;
   // unmatched words that still appear inside the other side's squashed text ("on board" ~ "onboard") don't count
   const cnt=(arr,from,to,sq)=>arr.slice(from,to).filter(w=>!sq.includes(w)).length;
   const missStart=pa.length?cnt(a,0,pa[0],sqB):a.length, missEnd=pa.length?cnt(a,pa[pa.length-1]+1,a.length,sqB):a.length;
   const leadExtra=pb.length?cnt(b,0,pb[0],sqA):b.length, tailExtra=pb.length?cnt(b,pb[pb.length-1]+1,b.length,sqA):0;
   let cls='ok';
   if(recall<0.5)cls='wrong';
   else if(leadExtra>=3||tailExtra>=3)cls='leak';
   else if(missStart>=2||(missStart>=1&&a.length<=6))cls='start-cut';
   else if(missEnd>=2||(missEnd>=1&&a.length<=6))cls='end-cut';
   else if(recall<0.75)cls='weak';
   out.push({id:r.id,title:j.title,i:row.i,cls,recall:+recall.toFixed(2),missStart,missEnd,leadExtra,tailExtra,text:s.text,heard:row.heard,start:s.start,end:s.end});}
 }
fs.writeFileSync(dir+'/classified.json',JSON.stringify(out));
const sk=fs.existsSync(dir+'/sample_keys.json')?new Set(JSON.parse(fs.readFileSync(dir+'/sample_keys.json','utf8'))):null;
if(sk){const smp=out.filter(o=>sk.has(o.id+'|'+o.i)),c2={};smp.forEach(o=>c2[o.cls]=(c2[o.cls]||0)+1);console.log('random sample of unflagged:',smp.length,c2);}
const c={};out.forEach(o=>c[o.cls]=(c[o.cls]||0)+1);console.log('sentences',out.length,c,'sections',new Set(out.map(o=>o.id)).size);
