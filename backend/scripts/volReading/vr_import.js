'use strict';
// Insert the drafted Vol Reading passages (web/vol<V>/draft/t<T>p<P>.json) as HIDDEN passages (isActive:false).
//   node vr_import.js <vol> [t5p1 …] [--apply]
// Guards: skips a draft already imported (web/vol<V>/imported.json) or whose title exists; refuses a draft whose text shares
// ≥15% of its 8-grams with a bank passage unless the draft's source line says it is a deliberate copy ("renumbered copy",
// or spec notes "SAME TEXT AS <id>" — the Vol question set differs). Inserts only; nothing existing is modified.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const Passage = require('../../models/Passage');
const [vol, ...rest] = process.argv.slice(2);
const apply = rest.includes('--apply');
const only = rest.filter(a => !a.startsWith('--'));
const dir = path.join(__dirname, 'web', `vol${vol}`);
const impFile = path.join(dir, 'imported.json');
const imported = fs.existsSync(impFile) ? JSON.parse(fs.readFileSync(impFile, 'utf8')) : {};
const words = s => String(s).replace(/<[^>]+>/g, ' ').toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/);
const grams = (w, n = 8) => { const o = new Set(); for (let i = 0; i + n <= w.length; i++) o.add(w.slice(i, i + n).join(' ')); return o; };
// deliberate same-text copies (different question set or renumbered slot) — per vol, key = draft name → bank id
const SAME_TEXT_OK = ({
  1: { t8p2: '6abcde40ee81e7573b2fe8d6', t6p2: '6abd01ae1b50c9b87212e581' },
  2: { t1p1: '6abdacfa3bcd15105e99fb60' }, // The Iceman (Vol 2) = renumbered copy of The Iceman (bank P2)
  // Vol 5: shorter versions of a bank article with a different question set
  5: { t7p2: '6abd01aa1b50c9b87212e55e', t9p3: '6abd01a41b50c9b87212e52a' }, // Art in Iron and Steel / The Power of Nothing
  // Vol 6: "Mungo Lady and Mungo Man" (P1, 13 q) shares ~21% text with the bank's "Mungo Man" (P3, Mocktest 48) — other article
  6: { t1p1: '6abcd39d4bdca60c3b137d5b' },
})[vol] || {};

// --activate: publish (isActive:true) exactly the passages listed in imported.json, refusing any without a cover
// (thumbnailUrl or an <img> in content) or with a question lacking a key / an explanation.
async function activate() {
  const ids = Object.entries(imported).filter(([n]) => !only.length || only.includes(n));
  const docs = await Passage.find({ _id: { $in: ids.map(([, id]) => id) } }).lean();
  const ok = [];
  for (const [n, id] of ids) {
    const p = docs.find(d => String(d._id) === id);
    if (!p) { console.log(`✗ ${n} ${id} not found`); continue; }
    const qs = p.questionGroups.flatMap(g => g.questions);
    const bad = [!p.thumbnailUrl && !/<img\s/.test(p.content) && 'no cover', qs.some(q => !q.correctAnswer) && 'empty key', qs.some(q => !q.explanation) && 'missing explanation'].filter(Boolean);
    console.log(`${bad.length ? '✗' : p.isActive ? '=' : '✓'} ${n} ${p.title}${bad.length ? ' — ' + bad.join(', ') : p.isActive ? ' (already active)' : ''}`);
    if (!bad.length && !p.isActive) ok.push(p._id);
  }
  if (!apply || !ok.length) { console.log(`${ok.length} to activate${ok.length ? ' — dry run, re-run with --apply' : ''}`); return; }
  const r = await Passage.updateMany({ _id: { $in: ok }, isActive: false }, { $set: { isActive: true } });
  console.log(`activated ${r.modifiedCount}/${ok.length}`);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    if (rest.includes('--activate')) return await activate();
    const bank = await Passage.find({}).select('title content').lean();
    const pool = bank.map(p => ({ id: String(p._id), title: p.title, g: grams(words(p.content)) }));
    const drafts = fs.readdirSync(path.join(dir, 'draft')).filter(f => /^t\d+p\d\.json$/.test(f)).map(f => f.slice(0, -5))
      .filter(n => !only.length || only.includes(n)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)) || a.localeCompare(b));
    const plan = [];
    for (const n of drafts) {
      const { doc, source } = JSON.parse(fs.readFileSync(path.join(dir, 'draft', `${n}.json`), 'utf8'));
      if (imported[n]) { console.log(`SKIP ${n} "${doc.title}" — already imported ${imported[n]}`); continue; }
      if (bank.some(p => p.title.trim().toLowerCase() === doc.title.trim().toLowerCase())) { console.log(`SKIP ${n} "${doc.title}" — title exists`); continue; }
      const g = grams(words(doc.content));
      const hits = pool.map(p => { let h = 0; for (const k of g) if (p.g.has(k)) h++; return { ...p, r: h / (g.size || 1) }; }).filter(p => p.r >= 0.15);
      const bad = hits.filter(h => h.id !== SAME_TEXT_OK[n]);
      if (bad.length) { console.log(`STOP ${n} "${doc.title}" — same text as ${bad.map(h => `"${h.title}" ${(h.r * 100).toFixed(0)}%`).join(', ')}`); continue; }
      const nq = doc.questionGroups.reduce((a, x) => a + x.questions.length, 0);
      console.log(`NEW  ${n} "${doc.title}" ${doc.category} Q${doc.questionRange.start}-${doc.questionRange.end} (${nq} q)${hits.length ? ` [deliberate copy of "${hits[0].title}"]` : ''}`);
      plan.push({ n, doc });
    }
    console.log(`\n${plan.length} to insert (hidden).`);
    if (!apply || !plan.length) { if (plan.length) console.log('dry run — re-run with --apply.'); return; }
    for (const { n, doc } of plan) {
      const created = await Passage.create({ ...doc, isActive: false });
      imported[n] = String(created._id);
      fs.writeFileSync(impFile, JSON.stringify(imported, null, 1));
      console.log(`  ✓ ${n} ${created._id} ${doc.title}`);
    }
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error(e); process.exit(1); });
