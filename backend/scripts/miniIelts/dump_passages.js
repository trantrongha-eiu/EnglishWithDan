// READ-ONLY: dump every Passage (+ which full test uses it) to ./passages.json for dedupe / Playwright scripts.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const ps = await db.collection('passages').find({}).toArray();
  const ts = await db.collection('readingtests').find({}).toArray();
  const t = {};
  ts.forEach(x => (x.passageIds || []).forEach((id, i) => (t[id] ||= []).push(`${x.name} P${i + 1}`)));
  ps.forEach(p => { p.tests = t[p._id] || []; });
  require('fs').writeFileSync(require('path').join(__dirname, 'passages.json'), JSON.stringify(ps));
  console.log(`dumped ${ps.length} passages`);
  await mongoose.disconnect();
})();
