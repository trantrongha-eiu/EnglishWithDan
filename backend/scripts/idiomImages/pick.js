// Record illustration choices made on a contact sheet into ../data/idiomImages.json
// (the input of apply.js, and the provenance record of every image).
//   node pick.js 12=a 13=c 14=- …     (row number from sheet.js; "-" = no image)
const fs = require('fs');
const path = require('path');
const S = __dirname;
const all = Object.values(JSON.parse(fs.readFileSync(path.join(S, 'web', 'candidates.json'), 'utf8')));
const OUT = path.join(S, '..', 'data', 'idiomImages.json');
const picks = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : [];

for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^(\d+)=([a-h-])$/);
  if (!m) throw new Error(`bad pick "${arg}" (want <row>=<a-h|->)`);
  const x = all[+m[1]];
  if (!x) throw new Error(`no row ${m[1]}`);
  const i = picks.findIndex(p => p.word === x.word);
  if (i >= 0) picks.splice(i, 1);
  if (m[2] === '-') { console.log(`#${m[1]} ${x.word}: no image`); continue; }
  const c = x.cands['abcdefgh'.indexOf(m[2])];
  if (!c) throw new Error(`row ${m[1]} has no candidate ${m[2]}`);
  if (!/^(cc0|public domain|pd\b|pdm)/i.test(c.license)) throw new Error(`row ${m[1]}${m[2]} is ${c.license}, not CC0/PD`);
  picks.push({ word: x.word, image: c.image, file: c.file, descriptionUrl: c.descriptionUrl, license: c.license, artist: c.artist });
  console.log(`#${m[1]} ${x.word} ← ${c.file} (${c.license})`);
}
picks.sort((a, b) => a.word.localeCompare(b.word));
fs.writeFileSync(OUT, JSON.stringify(picks, null, 1) + '\n');
console.log(`${picks.length} images in ${path.relative(process.cwd(), OUT)}`);
