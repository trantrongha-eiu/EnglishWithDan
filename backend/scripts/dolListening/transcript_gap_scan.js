// READ-ONLY: for every đề lẻ section and every full-test part that has a DOL copy (same answer keys), count DOL
// transcript cues of real content (exam framing excluded) that are missing from our transcript.
// Writes web/gaps.json  [{ kind, id, part, title, dolId, missing: [cue text…] }]
const fs = require('fs'), path = require('path');
const W = f => path.join(__dirname, 'web', f);
const ss = JSON.parse(fs.readFileSync(W('sections.json'), 'utf8'));
const ts = JSON.parse(fs.readFileSync(W('tests.json'), 'utf8'));
const tri = JSON.parse(fs.readFileSync(W('triage.json'), 'utf8'));
const FRAMING = /^(that is the end|you now have|now (listen|turn)|before you hear|you will hear|first,? you have|in the ielts test|part (one|two|three|four|\d)\b|questions? \d+ (to|and) \d+|this is the end|listen carefully)/i;
const norm = a => String(a).toLowerCase().split('/')[0].replace(/[^a-z0-9]/g, '');
const sig = gs => (gs || []).flatMap(g => g.questions || []).map(q => norm(q.correctAnswer)).join('|');
const words = s => String(s || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
const dols = tri.map(r => { try { const d = JSON.parse(fs.readFileSync(W(`draft/${r.id}.json`), 'utf8')); return { id: r.id, d, sig: sig(d.questionGroups) }; } catch { return null; } }).filter(Boolean);

function gaps(ours, d) {
  const g6 = new Set(); const w = words(ours); for (let i = 0; i + 6 <= w.length; i++) g6.add(w.slice(i, i + 6).join(' '));
  const out = [];
  for (const c of d._cues) {
    if (FRAMING.test(c.text.trim())) continue;
    const cw = words(c.text); if (cw.length < 6) continue;
    let hit = 0, tot = 0; for (let i = 0; i + 6 <= cw.length; i++) { tot++; if (g6.has(cw.slice(i, i + 6).join(' '))) hit++; }
    if (hit / tot < 0.4) out.push(c.text);
  }
  return out;
}
const rows = [];
for (const s of ss) { const m = dols.find(x => x.sig === sig(s.questionGroups)); if (m) rows.push({ kind: 'lẻ', id: String(s._id), part: null, title: s.title, dolId: m.id, missing: gaps(s.transcript, m.d) }); }
for (const t of ts) (t.sections || []).forEach((s, i) => { const m = dols.find(x => x.sig === sig(s.questionGroups)); if (m) rows.push({ kind: 'full', id: String(t._id), part: i, title: `${t.name} P${i + 1}`, dolId: m.id, missing: gaps(s.transcript, m.d) }); });
fs.writeFileSync(W('gaps.json'), JSON.stringify(rows, null, 1));
for (const r of rows.filter(r => r.missing.length)) console.log(`${String(r.missing.length).padStart(3)}  ${r.kind} ${r.title}  | ${r.missing.slice(0, 2).join(' / ').slice(0, 150)}`);
console.log(`${rows.length} matched, ${rows.filter(r => r.missing.length).length} with real gaps`);
