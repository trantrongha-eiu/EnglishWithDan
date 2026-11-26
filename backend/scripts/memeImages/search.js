// READ-ONLY: list CC0/PD Wikimedia Commons photos for result-screen memes.
//   node search.js <out.json> [queries.json]   (round 2 queries: queries-r2.json)
const fs=require('fs'),path=require('path');
const OUT=process.argv[2];
const UA='EWD-meme-research/1.0';
const FREE=/^(cc0|public domain|pd\b|pdm)/i;
const strip=s=>String(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const Q=process.argv[3]?JSON.parse(fs.readFileSync(process.argv[3],'utf8')):["surprised cat","shocked cat face","cat yawning","cat screaming","dog tongue out funny","dog head tilt","funny dog face","laughing seal","smiling quokka","macaque grin","monkey funny face","owl staring","goat tongue","llama funny face","hamster cheeks","sleeping cat funny","cat lying on back","dog sleeping funny","frog face close","sloth smiling","dog sunglasses","cat glasses","shiba inu","cat side eye","puppy confused","squirrel funny","raccoon face","capybara funny","panda rolling","penguin falling"];
async function search(q){const u=new URL('https://commons.wikimedia.org/w/api.php');Object.entries({action:'query',format:'json',generator:'search',gsrnamespace:'6',gsrlimit:'40',gsrsearch:q+' filetype:bitmap',prop:'imageinfo',iiprop:'url|size|mime|extmetadata',iiurlwidth:'800',iiextmetadatafilter:'LicenseShortName|Artist|Restrictions'}).forEach(([k,v])=>u.searchParams.set(k,v));
for(let i=0;i<3;i++){const r=await fetch(u,{headers:{'User-Agent':UA}});if(r.status===429){await sleep(5000);continue}const j=await r.json();return Object.values(j.query?.pages||{}).sort((a,b)=>a.index-b.index)}return[]}
(async()=>{const all=[];for(const q of Q){let n=0;for(const pg of await search(q)){const ii=pg.imageinfo?.[0];const m=ii?.extmetadata||{};const lic=strip(m.LicenseShortName?.value);const ratio=ii?ii.width/ii.height:0;
if(!ii||!FREE.test(lic)||!/jpeg|png/.test(ii.mime)||ii.width<500||ratio<0.7||ratio>1.9)continue;if(/trademark/i.test(strip(m.Restrictions?.value)))continue;if(all.some(c=>c.file===pg.title))continue;
all.push({q,file:pg.title,image:ii.thumburl||ii.url,page:ii.descriptionurl,license:lic,artist:strip(m.Artist?.value).slice(0,80)});if(++n>=6)break}await sleep(300)}
fs.writeFileSync(OUT,JSON.stringify(all,null,1));console.log(all.length)})();
