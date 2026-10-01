// READ-ONLY: which DOL transcript cues are missing from our transcript (6-gram coverage < 40%)?
//   node transcript_gaps.js <dolId> section:<ourId> | test:<testName>:<partIndex0>
const fs = require('fs'), path = require('path');
const W = f => path.join(__dirname, 'web', f);
const [dolId, target] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(W(`draft/${dolId}.json`), 'utf8'));
let ours;
if (target.startsWith('section:')) ours = JSON.parse(fs.readFileSync(W('sections.json'), 'utf8')).find(s => String(s._id) === target.slice(8)).transcript;
else { const [, name, i] = target.split(':'); ours = JSON.parse(fs.readFileSync(W('tests.json'), 'utf8')).find(t => t.name === name).sections[+i].transcript; }
const words = s => String(s || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
const g6 = new Set(); { const w = words(ours); for (let i = 0; i + 6 <= w.length; i++) g6.add(w.slice(i, i + 6).join(' ')); }
let missing = 0;
for (const c of d._cues) {
  const w = words(c.text); if (w.length < 6) continue;
  let hit = 0, tot = 0; for (let i = 0; i + 6 <= w.length; i++) { tot++; if (g6.has(w.slice(i, i + 6).join(' '))) hit++; }
  if (hit / tot < 0.4) { missing++; console.log(`MISSING ${c.start.toFixed(0)}s ${c.speaker ? c.speaker + ': ' : ''}${c.text}`); }
}
console.log(`${missing} cue(s) missing of ${d._cues.length}`);
