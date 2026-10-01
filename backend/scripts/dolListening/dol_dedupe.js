// For every DOL item: best 8-gram overlap (transcript + question text) and title match against our
// đề lẻ sections and the embedded sections of đề full. Writes web/dedupe.json.
const fs = require('fs'), path = require('path');
const W = f => path.join(__dirname, 'web', f);
const items = JSON.parse(fs.readFileSync(W('dol_items.json'), 'utf8'));
const sections = JSON.parse(fs.readFileSync(W('sections.json'), 'utf8'));
const tests = JSON.parse(fs.readFileSync(W('tests.json'), 'utf8'));

const strip = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
const words = s => strip(s).toLowerCase().replace(/[’']/g, '').match(/[a-z0-9]+/g) || [];
const grams = (s, n = 8) => { const w = words(s), g = new Set(); for (let i = 0; i + n <= w.length; i++) g.add(w.slice(i, i + n).join(' ')); return g; };
const normTitle = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const groupText = gs => JSON.stringify(gs || []);

const ours = [];
for (const s of sections) ours.push({ kind: 'section', id: String(s._id), title: s.title, active: s.isActive, g: grams(s.transcript), q: grams(groupText(s.questionGroups), 6) });
for (const t of tests) (t.sections || []).forEach((s, i) => ours.push({ kind: 'test', id: String(t._id), title: `${t.title || t.name} S${i + 1} ${s.title || ''}`, active: t.isActive, g: grams(s.transcript), q: grams(groupText(s.questionGroups), 6) }));

const ov = (a, b) => { if (!a.size || !b.size) return 0; let n = 0; for (const x of a) if (b.has(x)) n++; return n / Math.min(a.size, b.size); };
const out = [];
for (const it of items) {
  const g = grams(it.transcript), q = grams(it.question_group, 6);
  let best = { s: 0 }, bestQ = { s: 0 };
  for (const o of ours) {
    const s = ov(g, o.g); if (s > best.s) best = { s, o };
    const sq = ov(q, o.q); if (sq > bestQ.s) bestQ = { s: sq, o };
  }
  const tmatch = ours.filter(o => normTitle(o.title).includes(normTitle(it.name)) && normTitle(it.name).length > 4).map(o => o.title);
  out.push({ id: it.id, name: it.name, url: it.url, words: words(it.transcript).length, tr: +best.s.toFixed(2), trWith: best.o && best.o.title, q: +bestQ.s.toFixed(2), qWith: bestQ.o && bestQ.o.title, tmatch: tmatch.slice(0, 3) });
}
fs.writeFileSync(W('dedupe.json'), JSON.stringify(out, null, 1));
const dup = out.filter(x => x.tr >= 0.15 || x.q >= 0.3);
console.log(`items ${out.length}, dup ${dup.length}, new ${out.length - dup.length}`);
console.log('no transcript in listing:', out.filter(x => x.words < 50).length);
for (const x of out.filter(x => !(x.tr >= 0.15 || x.q >= 0.3)).slice(0, 400)) console.log(`NEW tr=${x.tr} q=${x.q} w=${x.words} | ${x.name} | ${x.tmatch.join('; ')}`);
