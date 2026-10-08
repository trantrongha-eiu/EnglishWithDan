// Record cover choices made on a contact sheet into ../data/vocabLessonCovers.json
// (the input of setVocabLessonThumbnail.js --batch, and the provenance record).
//   node cover_pick.js 12=a 13=c 14=- …     (row number from cover_sheet.js; "-" = keep the logo)
const fs = require('fs');
const path = require('path');
const S = __dirname;
const all = Object.entries(JSON.parse(fs.readFileSync(path.join(S, 'web', 'candidates.json'), 'utf8')));
const OUT = path.join(S, '..', 'data', 'vocabLessonCovers.json');
const picks = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : [];

for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^(\d+)=([a-j-])$/);
  if (!m) throw new Error(`bad pick "${arg}" (want <row>=<a-j|->)`);
  const [id, x] = all[+m[1]] || [];
  if (!id) throw new Error(`no row ${m[1]}`);
  const i = picks.findIndex(p => p.id === id);
  if (i >= 0) picks.splice(i, 1);
  if (m[2] === '-') { console.log(`#${m[1]} ${x.title}: no cover`); continue; }
  const c = x.cands['abcdefghij'.indexOf(m[2])];
  if (!c) throw new Error(`row ${m[1]} has no candidate ${m[2]}`);
  if (!/^(cc0|public domain|pd\b|pdm)/i.test(c.license)) throw new Error(`row ${m[1]}${m[2]} is ${c.license}, not CC0/PD`);
  picks.push({ id, title: x.title, image: c.image, file: c.file, descriptionUrl: c.descriptionUrl, license: c.license, artist: c.artist });
  console.log(`#${m[1]} ${x.title} ← ${c.file} (${c.license})`);
}
picks.sort((a, b) => a.title.localeCompare(b.title));
fs.writeFileSync(OUT, JSON.stringify(picks, null, 1) + '\n');
console.log(`${picks.length} covers in ${path.relative(process.cwd(), OUT)}`);
