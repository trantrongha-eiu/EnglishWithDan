'use strict';
// READ-ONLY: dump the whole Reading bank (passages + tests) → web/passages.json, web/tests.json
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const fs = require('fs'), path = require('path');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const ps = await db.collection('passages').find({}).toArray();
  const ts = await db.collection('readingtests').find({}).toArray();
  fs.writeFileSync(path.join(__dirname, 'web', 'passages.json'), JSON.stringify(ps, null, 1));
  fs.writeFileSync(path.join(__dirname, 'web', 'tests.json'), JSON.stringify(ts, null, 1));
  console.log(ps.length, 'passages,', ts.length, 'tests');
  await mongoose.disconnect();
})();
