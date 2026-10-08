// Record cover choices made on a contact sheet into ../data/writingTask2Covers.json
// (the input of setWritingTask2Thumbnail.js --batch, and the provenance record).
//   node cover_pick.js 12=acf 13=b 14=- …   (row number from cover_sheet.js; one letter per
//   prompt of that row, in its listed order — a letter may repeat; "-" = keep the logo)
const fs = require('fs');
const path = require('path');
const S = __dirname;
const L = 'abcdefghijklmn';
const all = Object.entries(JSON.parse(fs.readFileSync(path.join(S, 'web', 'candidates.json'), 'utf8')));
const OUT = path.join(S, '..', 'data', 'writingTask2Covers.json');
const picks = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : [];

for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^(\d+)=([a-n-]+)$/);
  if (!m) throw new Error(`bad pick "${arg}" (want <row>=<letters|->)`);
  const [topic, x] = all[+m[1]] || [];
  if (!topic) throw new Error(`no row ${m[1]}`);
  const letters = m[2] === '-' ? x.prompts.map(() => '-') : [...m[2]];
  if (letters.length !== x.prompts.length) throw new Error(`row ${m[1]} (${topic}) has ${x.prompts.length} prompts, got ${letters.length} letters`);
  x.prompts.forEach((p, i) => {
    const at = picks.findIndex(q => q.id === p.id);
    if (at >= 0) picks.splice(at, 1);
    if (letters[i] === '-') { console.log(`#${m[1]}.${i + 1} ${topic}: no cover`); return; }
    const c = x.cands[L.indexOf(letters[i])];
    if (!c) throw new Error(`row ${m[1]} has no candidate ${letters[i]}`);
    if (!/^(cc0|public domain|pd\b|pdm)/i.test(c.license)) throw new Error(`row ${m[1]}${letters[i]} is ${c.license}, not CC0/PD`);
    picks.push({ id: p.id, topic, title: p.prompt, image: c.image, file: c.file, descriptionUrl: c.descriptionUrl, license: c.license, artist: c.artist });
    console.log(`#${m[1]}.${i + 1} ${topic} ← ${c.file} (${c.license})`);
  });
}
picks.sort((a, b) => a.topic.localeCompare(b.topic) || a.title.localeCompare(b.title));
fs.writeFileSync(OUT, JSON.stringify(picks, null, 1) + '\n');
console.log(`${picks.length} covers in ${path.relative(process.cwd(), OUT)}`);
