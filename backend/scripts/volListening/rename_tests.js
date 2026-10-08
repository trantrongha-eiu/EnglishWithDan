// Rename full tests that ARE a vol test (thầy 2026-10-07: Vol 1 Test 1–4 = existing "Actual Test 1–4" → rename,
// don't duplicate; same rule for later vols). Backs up each test doc to web/vol<V>/backup/. The attempts of a renamed
// test keep a testName snapshot (shown in history/review) → re-synced to the new name, scoped by testId, backed up.
//   node rename_tests.js <vol> [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const RENAMES = {
  1: [
    { from: 'Actual Test 1', to: 'Vol 1 - Test 1', seriesName: 'Vol 1', testNumber: 1 },
    { from: 'Actual Test 2', to: 'Vol 1 - Test 2', seriesName: 'Vol 1', testNumber: 2 },
    { from: 'Actual Test 3', to: 'Vol 1 - Test 3', seriesName: 'Vol 1', testNumber: 3 },
    { from: 'Actual Test 4', to: 'Vol 1 - Test 4', seriesName: 'Vol 1', testNumber: 4 },
  ],
  // Vol 2 Test 7 = "Actual Test 10" (all 4 parts, same recording and keys)
  2: [{ from: 'Actual Test 10', to: 'Vol 2 - Test 7', seriesName: 'Vol 2', testNumber: 7 }],
  // Vol 3 Test 3 = "Actual Test 8", Test 4 = "Actual Test 9" (all 4 parts, same keys and recordings); then
  // renumber_actual_tests.js closes the gap (Actual Test 10–11 → 8–9)
  3: [
    { from: 'Actual Test 8', to: 'Vol 3 - Test 3', seriesName: 'Vol 3', testNumber: 3 },
    { from: 'Actual Test 9', to: 'Vol 3 - Test 4', seriesName: 'Vol 3', testNumber: 4 },
  ],
  // Vol 4 Test 7 = "Actual Test 1" (all 4 parts, same recordings and keys 40/40); thầy 2026-10-08: rename, then
  // renumber_actual_tests.js (Actual Test 2–11 → 1–10)
  4: [{ from: 'Actual Test 1', to: 'Vol 4 - Test 7', seriesName: 'Vol 4', testNumber: 7 }],
};
(async () => {
  const vol = +process.argv[2];
  const apply = process.argv.includes('--apply');
  if (!RENAMES[vol]) throw new Error(`no renames for vol ${vol}`);
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const c = db.collection('listeningtests'), attempts = db.collection('listeningattempts');
  const dir = path.join(__dirname, 'web', `vol${vol}`, 'backup'); fs.mkdirSync(dir, { recursive: true });
  try {
    for (const r of RENAMES[vol]) {
      const t = await c.findOne({ name: r.from });
      if (!t) { console.log(`- ${r.from}: not found`); continue; }
      if (await c.findOne({ name: r.to })) { console.log(`✗ ${r.to} already exists`); continue; }
      const stale = await attempts.find({ testId: t._id, testName: { $ne: r.to } }).project({ testName: 1 }).toArray();
      console.log(`${apply ? '→' : 'dry'} ${r.from} (${t._id}, series "${t.seriesName}" #${t.testNumber}) → ${r.to}; ${stale.length} attempt label(s)`);
      if (!apply) continue;
      fs.writeFileSync(path.join(dir, `test_${t._id}.json`), JSON.stringify({ test: t, attempts: stale }));
      await c.updateOne({ _id: t._id }, { $set: { name: r.to, seriesName: r.seriesName, testNumber: r.testNumber, updatedAt: new Date() } });
      if (stale.length) await attempts.updateMany({ testId: t._id, _id: { $in: stale.map(a => a._id) } }, { $set: { testName: r.to } });
    }
  } finally { await mongoose.disconnect(); }
})().catch(e => { console.error('✗', e.message); process.exit(1); });
