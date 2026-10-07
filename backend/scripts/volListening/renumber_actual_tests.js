// Thầy 2026-10-07: after "Actual Test 1–4" became "Vol 1 - Test 1–4", renumber the remaining Listening
// "Actual Test 5…16" → "Actual Test 1…12" (same order; testNumber = N, seriesName "Actual Tests").
// ListeningAttempt.testName is a snapshot shown in history/review → re-synced to the test's current name for
// every renamed test AND for Vol <V> - Test 1–4 (their attempts still say "Actual Test 1–4", which would now
// collide with the new names). Every update is scoped by testId. Backup → web/vol1/backup/renumber_<ts>.json.
//   node renumber_actual_tests.js [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const APPLY = process.argv.includes('--apply');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const tests = db.collection('listeningtests'), attempts = db.collection('listeningattempts');
  try {
    const list = (await tests.find({ name: /^Actual Test \d+$/ }).toArray())
      .map(t => ({ t, n: +t.name.match(/\d+$/)[0] })).sort((a, b) => a.n - b.n);
    const plan = list.map(({ t }, i) => ({ t, to: `Actual Test ${i + 1}`, num: i + 1 }));
    const backup = { tests: [], attempts: [] };
    for (const { t, to, num } of plan) {
      console.log(`${APPLY ? '→' : 'dry'} ${t.name.padEnd(15)} → ${to.padEnd(15)} (series "${t.seriesName}" #${t.testNumber} → "Actual Tests" #${num})`);
      if (t.name === to && t.testNumber === num && t.seriesName === 'Actual Tests') continue;
      // ascending order: the target name is free by the time we get to it
      const clash = await tests.findOne({ name: to, _id: { $nin: plan.slice(0, plan.findIndex(p => p.t === t) + 1).map(p => p.t._id) } });
      if (clash) throw new Error(`"${to}" still taken by ${clash._id}`);
      backup.tests.push({ _id: String(t._id), name: t.name, seriesName: t.seriesName, testNumber: t.testNumber });
      if (APPLY) await tests.updateOne({ _id: t._id }, { $set: { name: to, seriesName: 'Actual Tests', testNumber: num, updatedAt: new Date() } });
    }
    // attempt snapshots: the renamed tests + Vol 1 - Test 1–4
    const vol = await tests.find({ name: /^Vol 1 - Test [1-4]$/ }).toArray();
    const targets = [...plan.map(p => ({ id: p.t._id, name: p.to })), ...vol.map(t => ({ id: t._id, name: t.name }))];
    for (const { id, name } of targets) {
      const stale = await attempts.find({ testId: id, testName: { $ne: name } }).project({ testName: 1 }).toArray();
      if (!stale.length) continue;
      const olds = [...new Set(stale.map(a => a.testName))].join(', ');
      console.log(`   attempts of ${name}: ${stale.length} labelled "${olds}" → "${name}"`);
      backup.attempts.push(...stale.map(a => ({ _id: String(a._id), testName: a.testName })));
      if (APPLY) await attempts.updateMany({ testId: id, _id: { $in: stale.map(a => a._id) } }, { $set: { testName: name } });
    }
    if (APPLY) {
      const dir = path.join(__dirname, 'web', 'vol1', 'backup'); fs.mkdirSync(dir, { recursive: true });
      const f = path.join(dir, `renumber_${Date.now()}.json`);
      fs.writeFileSync(f, JSON.stringify(backup, null, 1));
      console.log(`✓ applied (${backup.tests.length} tests, ${backup.attempts.length} attempts); backup ${f}`);
    } else console.log('dry run — add --apply');
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error('✗', e.message); process.exit(1); });
