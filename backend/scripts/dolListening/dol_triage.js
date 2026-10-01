// Triage converted drafts: duplicate of our bank (đề lẻ or đề full, by transcript / question 8-grams
// or title+part), duplicate inside DOL, convert warnings, and a clean/needs-work verdict.
// Writes web/triage.json and prints a summary.   node dol_triage.js
const fs = require('fs'), path = require('path');
const { convert } = require('./dol_convert');
const W = f => path.join(__dirname, 'web', f);
const sections = JSON.parse(fs.readFileSync(W('sections.json'), 'utf8'));
const tests = JSON.parse(fs.readFileSync(W('tests.json'), 'utf8'));
const strip = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
const words = s => strip(s).toLowerCase().replace(/[’']/g, '').match(/[a-z0-9]+/g) || [];
const grams = (s, n = 8) => { const w = words(s), g = new Set(); for (let i = 0; i + n <= w.length; i++) g.add(w.slice(i, i + n).join(' ')); return g; };
const ov = (a, b) => { if (!a.size || !b.size) return 0; let n = 0; for (const x of a) if (b.has(x)) n++; return n / Math.min(a.size, b.size); };
const nt = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const qtext = gs => gs.map(g => JSON.stringify([g.noteConfig, g.tableConfig, g.matchingOptions, g.dragDropConfig, g.questions.map(q => [q.questionText, q.options])])).join(' ');

const ours = [];
for (const s of sections) ours.push({ label: `lẻ ${s._id} ${s.title}`, part: s.partNumber, title: nt(s.title), g: grams(s.transcript), q: grams(qtext(s.questionGroups || []), 6) });
for (const t of tests) (t.sections || []).forEach((s, i) => ours.push({ label: `full ${t.name || t.title} P${s.partNumber || i + 1} ${s.title || ''}`, part: s.partNumber || i + 1, title: nt(s.title), g: grams(s.transcript), q: grams(qtext(s.questionGroups || []), 6) }));

const files = fs.readdirSync(W('dol')).filter(f => f.endsWith('.json'));
const rows = [];
for (const f of files) {
  let r;
  try { r = convert(f); } catch (e) { rows.push({ id: f.replace('.json', ''), fail: e.message }); continue; }
  const d = JSON.parse(fs.readFileSync(W(`draft/${r.id}.json`), 'utf8'));
  const g = grams(d._cues.map(c => c.text).join(' ')), q = grams(qtext(d.questionGroups), 6);
  let best = { s: 0 };
  for (const o of ours) {
    const s = Math.max(ov(g, o.g), ov(q, o.q) * 0.9, (o.title === nt(d.title) && o.part === d.partNumber) ? 1 : 0);
    if (s > best.s) best = { s, label: o.label };
  }
  rows.push({ id: r.id, dolSection: d._dolSectionId, source: d._source, part: d.partNumber, title: d.title, dup: +best.s.toFixed(2), dupWith: best.label, warns: r.warns, g, q, nq: d.questionGroups.reduce((n, g) => n + g.questions.length, 0) });
}
// duplicates inside DOL (same recording published twice)
for (let i = 0; i < rows.length; i++) for (let j = 0; j < i; j++) {
  if (!rows[i].g || !rows[j].g || rows[j].dolDupOf) continue;
  if (ov(rows[i].g, rows[j].g) > 0.5 || ov(rows[i].q, rows[j].q) > 0.4) {
    // keep the better copy: PTP/Cambridge/Trainer/Guide originals over the re-written "Actual Test" ones
    const rank = r => (r.source === 'ACTUAL_TEST' ? 1 : 0) + (r.warns.length ? 2 : 0);
    const [keep, drop] = rank(rows[i]) < rank(rows[j]) ? [rows[i], rows[j]] : [rows[j], rows[i]];
    if (!drop.dolDupOf && !keep.dolDupOf) drop.dolDupOf = keep.id;
  }
}
rows.forEach(r => {
  r.verdict = r.fail ? 'fail' : r.dup >= 0.3 ? 'dup-bank' : r.dolDupOf ? 'dup-dol' : r.warns.length ? 'needs-work' : 'clean';
  delete r.g; delete r.q;
});
fs.writeFileSync(W('triage.json'), JSON.stringify(rows, null, 1));
const by = {};
rows.forEach(r => { by[r.verdict] = (by[r.verdict] || 0) + 1; });
console.log('total', rows.length, by);
const src = {};
rows.filter(r => r.verdict === 'clean').forEach(r => { src[r.source] = (src[r.source] || 0) + 1; });
console.log('clean by source', src);
for (const r of rows.filter(r => r.verdict === 'needs-work')) console.log(`NW ${r.id} P${r.part} ${r.title}: ${r.warns.join(' | ').slice(0, 200)}`);
