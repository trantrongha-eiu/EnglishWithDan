// READ-ONLY: dump every ListeningSection (đề lẻ) + ListeningTest (đề full) to ./web/ for dedupe.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const ss = await db.collection('listeningsections').find({}).toArray();
  const ts = await db.collection('listeningtests').find({}).toArray();
  const fs = require('fs'), p = require('path');
  fs.writeFileSync(p.join(__dirname, 'web', 'sections.json'), JSON.stringify(ss));
  fs.writeFileSync(p.join(__dirname, 'web', 'tests.json'), JSON.stringify(ts));
  console.log(`dumped ${ss.length} sections, ${ts.length} tests`);
  await mongoose.disconnect();
})();
