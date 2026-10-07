// Rename full tests that ARE a vol test (thầy 2026-10-07: Vol 1 Test 1–4 = existing "Actual Test 1–4" → rename,
// don't duplicate). Backs up each test doc to web/vol<V>/backup/. Attempts keep their own testName snapshot.
//   node rename_tests.js [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const RENAMES = [
  { from: 'Actual Test 1', to: 'Vol 1 - Test 1', seriesName: 'Vol 1', testNumber: 1 },
  { from: 'Actual Test 2', to: 'Vol 1 - Test 2', seriesName: 'Vol 1', testNumber: 2 },
  { from: 'Actual Test 3', to: 'Vol 1 - Test 3', seriesName: 'Vol 1', testNumber: 3 },
  { from: 'Actual Test 4', to: 'Vol 1 - Test 4', seriesName: 'Vol 1', testNumber: 4 },
];
(async () => {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(process.env.MONGO_URI);
  const c = mongoose.connection.db.collection('listeningtests');
  const dir = path.join(__dirname, 'web', 'vol1', 'backup'); fs.mkdirSync(dir, { recursive: true });
  try {
    for (const r of RENAMES) {
      const t = await c.findOne({ name: r.from });
      if (!t) { console.log(`- ${r.from}: not found`); continue; }
      if (await c.findOne({ name: r.to })) { console.log(`✗ ${r.to} already exists`); continue; }
      console.log(`${apply ? '→' : 'dry'} ${r.from} (${t._id}, series "${t.seriesName}" #${t.testNumber}) → ${r.to}`);
      if (!apply) continue;
      fs.writeFileSync(path.join(dir, `test_${t._id}.json`), JSON.stringify(t));
      await c.updateOne({ _id: t._id }, { $set: { name: r.to, seriesName: r.seriesName, testNumber: r.testNumber, updatedAt: new Date() } });
    }
  } finally { await mongoose.disconnect(); }
})();
