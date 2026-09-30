const fs=require('fs');const ps=require('./passages.json');
const norm=s=>String(s).replace(/<[^>]+>/g,' ').toLowerCase().replace(/[‘’]/g,"'").replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/);
const N=8,grams=w=>{const o=new Set();for(let i=0;i+N<=w.length;i++)o.add(w.slice(i,i+N).join(' '));return o};
const db=ps.map(p=>({t:p.title,g:grams(norm(p.content))}));
const order=fs.readFileSync(process.env.ORDER||'web/mini/order.txt','utf8').trim().split('\n').map(l=>l.split('/')[1]);
for(const id of order){const f=`web/mini/x_${id}.json`;if(!fs.existsSync(f)){console.log(id,'no extract');continue}const x=JSON.parse(fs.readFileSync(f,'utf8'));
 const g=grams(norm(x.paras.join(' ')));let best={c:0,t:''};for(const d of db){let h=0;for(const k of g)if(d.g.has(k))h++;const c=h/(g.size||1);if(c>best.c)best={c,t:d.t}}
 const ans=Object.keys(x.answers).length;console.log(id.padEnd(5),(best.c*100).toFixed(0).padStart(3)+'%',String(x.paras.join(' ').split(' ').length).padStart(5)+'w','ans='+ans,x.title.slice(0,50).padEnd(50),best.c>0.15?'DUP of '+best.t:'')}
