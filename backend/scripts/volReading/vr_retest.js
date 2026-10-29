'use strict';
// Re-point an existing fixed test "Vol V - Test T" to a new set of 3 passages and (re)activate it — for tests rebuilt from an
// updated source (e.g. Vol 1 - Test 7 from the "đề update" PDF). Same checks as vr_tests.js (all active, passage1/2/3 order,
// Q1–40 without gap or overlap). Backs the old test document up to web/vol<V>/backup/test<T>_<time>.json; the update is
// conditional on updatedAt. Prints how many full-test attempts already used the test.
//   node vr_retest.js <vol> <T> <id1> <id2> <id3> [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const args = process.argv.slice(2), apply = args.includes('--apply');
const [vol, T, ...ids] = args.filter(a => !a.startsWith('--'));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  try {
    const name = `Vol ${vol} - Test ${T}`;
    const test = await db.collection('readingtests').findOne({ name });
    if (!test) throw new Error(`no test "${name}"`);
    if (ids.length !== 3) throw new Error('need 3 passage ids');
    const oids = ids.map(x => new mongoose.Types.ObjectId(x));
    const ps = await db.collection('passages').find({ _id: { $in: oids } }).project({ title: 1, category: 1, isActive: 1, questionGroups: 1 }).toArray();
    const byId = new Map(ps.map(p => [String(p._id), p]));
    const problems = []; const nums = [];
    ids.forEach((id, i) => {
      const p = byId.get(id);
      if (!p) return problems.push(`missing ${id}`);
      if (!p.isActive) problems.push(`inactive: ${p.title}`);
      if (p.category !== `passage${i + 1}`) problems.push(`${p.title} is ${p.category}, slot ${i + 1}`);
      nums.push(...p.questionGroups.flatMap(g => g.questions.map(q => q.questionNumber)));
    });
    const sorted = [...nums].sort((a, b) => a - b);
    if (sorted.join() !== Array.from({ length: 40 }, (_, i) => i + 1).join()) problems.push(`questions ${sorted.join(',')}`);
    const attempts = await db.collection('testattempts').countDocuments({ testId: test._id });
    console.log(`${name} [${test._id}] active=${test.isActive} attempts=${attempts}`);
    console.log(`  old: ${(test.passageIds || []).join(', ')}`);
    console.log(`  new: ${ids.map(id => `"${byId.get(id)?.title}"`).join(' / ')} (${nums.length} q)`);
    if (problems.length) { console.log('  ✗ ' + problems.join('; ')); process.exitCode = 1; return; }
    if (!apply) return console.log('dry run — re-run with --apply');
    const bdir = path.join(__dirname, 'web', `vol${vol}`, 'backup'); fs.mkdirSync(bdir, { recursive: true });
    fs.writeFileSync(path.join(bdir, `test${T}_${Date.now()}.json`), JSON.stringify(test, null, 1));
    const r = await db.collection('readingtests').updateOne({ _id: test._id, updatedAt: test.updatedAt },
      { $set: { passageIds: oids, isActive: true, updatedAt: new Date() } });
    console.log(r.modifiedCount ? '  ✓ updated + active' : '  ✗ not updated (changed meanwhile?)');
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error(e); process.exit(1); });
