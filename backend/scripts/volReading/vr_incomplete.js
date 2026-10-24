'use strict';
// List (and with --apply hide, isActive:false) the Reading content that is missing questions:
//  - full tests whose 3 passages hold fewer than 40 questions or whose numbering 1–40 has gaps;
//  - passages with fewer than 13 questions (missing questions; a full 13-question set numbered 28–40 is fine on its own).
// Tests without fixed passages (the random mock test) are skipped.
// Thầy 2026-10-24: "đề nào thiếu câu thì tạm thời không publish cho học sinh". Reversible: re-activate by hand / vr_import.
//   node vr_incomplete.js [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const apply = process.argv.includes('--apply');
const nums = p => (p.questionGroups || []).flatMap(g => (g.questions || []).map(q => q.questionNumber)).sort((a, b) => a - b);
const gaps = (ns, from, to) => { const s = new Set(ns), out = []; for (let n = from; n <= to; n++) if (!s.has(n)) out.push(n); return out; };

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  try {
    const ps = await db.collection('passages').find({}).project({ title: 1, category: 1, isActive: 1, questionGroups: 1 }).toArray();
    const byId = new Map(ps.map(p => [String(p._id), p]));
    const badP = [];
    for (const p of ps) {
      if (p.isActive === false) continue;
      const ns = nums(p); if (!ns.length) continue;
      const first = { passage1: 1, passage2: 14, passage3: 27 }[p.category];
      const miss = first ? gaps(ns, first, ns[ns.length - 1]) : gaps(ns, ns[0], ns[ns.length - 1]);
      if (miss.length && ns.length < 13) badP.push({ p, miss });
    }
    const ts = await db.collection('readingtests').find({ isActive: { $ne: false } }).toArray();
    const badT = [];
    for (const t of ts) {
      if (!(t.passageIds || []).length) continue;
      const all = (t.passageIds || []).flatMap(id => nums(byId.get(String(id)) || {}));
      const miss = gaps(all, 1, 40);
      if (miss.length || all.length < 40) badT.push({ t, miss, n: all.length });
    }
    for (const { t, miss, n } of badT) console.log(`TEST    "${t.name}" ${n} questions, missing ${miss.join(',')}`);
    for (const { p, miss } of badP) console.log(`PASSAGE "${p.title}" [${p._id}] ${p.category}, missing ${miss.join(',')}`);
    if (!apply) { console.log(`${badT.length} test(s), ${badP.length} passage(s) — dry run, re-run with --apply to hide them`); return; }
    if (badT.length) console.log('tests hidden:', (await db.collection('readingtests').updateMany({ _id: { $in: badT.map(x => x.t._id) } }, { $set: { isActive: false, updatedAt: new Date() } })).modifiedCount);
    if (badP.length) console.log('passages hidden:', (await db.collection('passages').updateMany({ _id: { $in: badP.map(x => x.p._id) } }, { $set: { isActive: false, updatedAt: new Date() } })).modifiedCount);
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error(e); process.exit(1); });
