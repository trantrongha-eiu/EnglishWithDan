'use strict';
// Create the fixed full Reading tests "Vol V - Test T" (seriesName "Vol V", testNumber T) from specs/vol<V>/tests.js.
//   node vr_tests.js <vol> [T …] [--apply]
// Checks before inserting: 3 passages, all active, categories passage1/2/3 in order, question numbers increasing without
// overlap, no test with the same name / same series+number, no existing test with exactly the same 3 passages.
// Tests are created active (every passage was already checked and published). Inserts only.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const [vol, ...rest] = process.argv.slice(2);
const apply = rest.includes('--apply');
const only = rest.filter(a => !a.startsWith('--')).map(Number);
const plan = require(`./specs/vol${vol}/tests.js`);
const impFile = path.join(__dirname, 'web', `vol${vol}`, 'imported.json');
const imported = fs.existsSync(impFile) ? JSON.parse(fs.readFileSync(impFile, 'utf8')) : {};

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  try {
    const tests = await db.collection('readingtests').find({}).toArray();
    const todo = [];
    for (const [T, refs] of Object.entries(plan)) {
      if (only.length && !only.includes(+T)) continue;
      const name = `Vol ${vol} - Test ${T}`;
      const ids = refs.map(r => /^t\d+p\d$/.test(r) ? imported[r] : r);
      const problems = [];
      if (ids.some(x => !x)) problems.push(`not imported: ${refs.filter((r, i) => !ids[i]).join(',')}`);
      const ps = await db.collection('passages').find({ _id: { $in: ids.filter(Boolean).map(x => new mongoose.Types.ObjectId(x)) } })
        .project({ title: 1, category: 1, isActive: 1, questionRange: 1, questionGroups: 1 }).toArray();
      const ordered = ids.map(x => ps.find(p => String(p._id) === x));
      ordered.forEach((p, i) => {
        if (!p) return problems.push(`P${i + 1} missing`);
        if (!p.isActive) problems.push(`P${i + 1} "${p.title}" inactive`);
        if (p.category !== `passage${i + 1}`) problems.push(`P${i + 1} "${p.title}" is ${p.category}`);
        const nums = p.questionGroups.flatMap(g => g.questions.map(q => q.questionNumber));
        if (i && ordered[i - 1] && Math.min(...nums) <= Math.max(...ordered[i - 1].questionGroups.flatMap(g => g.questions.map(q => q.questionNumber)))) problems.push(`P${i + 1} numbers overlap P${i}`);
      });
      if (tests.some(t => t.name === name || (t.seriesName === `Vol ${vol}` && t.testNumber === +T))) problems.push('test exists');
      const same = tests.find(t => (t.passageIds || []).map(String).join() === ids.join());
      if (same) problems.push(`same passages as "${same.name}"`);
      const total = ordered.reduce((a, p) => a + (p ? p.questionGroups.reduce((s, g) => s + g.questions.length, 0) : 0), 0);
      console.log(`${problems.length ? '✗' : '✓'} ${name}: ${ordered.map(p => p ? `"${p.title}"` : '?').join(' / ')} (${total} q)${problems.length ? ' — ' + problems.join('; ') : ''}`);
      if (!problems.length) todo.push({ name, seriesName: `Vol ${vol}`, testNumber: +T, isActive: true, passageIds: ids.map(x => new mongoose.Types.ObjectId(x)) });
    }
    if (!apply || !todo.length) { console.log(`${todo.length} to create${todo.length ? ' — dry run, re-run with --apply' : ''}`); return; }
    const now = new Date();
    for (const t of todo) {
      const r = await db.collection('readingtests').insertOne({ ...t, createdAt: now, updatedAt: now, __v: 0 });
      console.log(`  ✓ ${t.name} ${r.insertedId}`);
    }
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error(e); process.exit(1); });
