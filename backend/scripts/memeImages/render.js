// Renders the extra result-screen memes (frontend/img/memes/*.jpg): photo from a
// Commons candidate (cands-r1/r2.json, made by search.js; CC0/PD only) + baked-in
// Vietnamese caption under it, 540px wide. picks.json = [name, candidateSet, index, caption, bgPosition?].
//   node backend/scripts/memeImages/render.js <tmpDir> frontend/img/memes
// tmpDir/prov.json → copy into backend/scripts/data/memeImages.json.
const fs=require('fs'),path=require('path');
const SP=__dirname,TMP=process.argv[2],OUT=process.argv[3];const {chromium}=require(process.argv[4]||'playwright');
const picks=JSON.parse(fs.readFileSync(path.join(SP,'picks.json'),'utf8'));
const C={r1:JSON.parse(fs.readFileSync(path.join(SP,'cands-r1.json'))),r2:JSON.parse(fs.readFileSync(path.join(SP,'cands-r2.json')))};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{fs.mkdirSync(path.join(TMP,'full'),{recursive:true});fs.mkdirSync(OUT,{recursive:true});
const prov={};const b=await chromium.launch();const pg=await b.newPage({viewport:{width:540,height:700},deviceScaleFactor:1});
for(const [name,set,idx,cap,pos] of picks){const c=C[set][idx];const f=path.join(TMP,'full',set+'-'+idx+'.jpg');
 if(!fs.existsSync(f)){for(let t=0;t<4;t++){const r=await fetch(c.image,{headers:{'User-Agent':'EWD-meme-research/1.0'}});if(r.status===429){await sleep(5000);continue}fs.writeFileSync(f,Buffer.from(await r.arrayBuffer()));break}await sleep(500)}
 const data='data:image/jpeg;base64,'+fs.readFileSync(f).toString('base64');
 await pg.setContent(`<html><body style="margin:0;background:#fff"><div id="m" style="width:540px;background:#fff">
 <div style="width:540px;height:400px;background:url(${data}) ${pos||"center"}/cover no-repeat"></div>
 <div style="padding:14px 18px 18px;text-align:center;font:800 30px/1.25 'Times New Roman',serif;color:#111">${cap}</div></div></body></html>`);
 await pg.waitForTimeout(100);await (await pg.$('#m')).screenshot({path:path.join(OUT,name+'.jpg'),type:'jpeg',quality:82});
 prov[name]={caption:cap,file:c.file,page:c.page,license:c.license,artist:c.artist};console.log(name,c.file,c.license)}
await b.close();fs.writeFileSync(path.join(TMP,'prov.json'),JSON.stringify(prov,null,1))})();
