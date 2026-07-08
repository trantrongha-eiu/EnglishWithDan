'use strict';
/**
 * Migrates the TuitionFee unique index from a `sparse` index (which never
 * actually excluded course-type fees, since studentId/feeType are always set
 * even when month/year are undefined — blocking a student from ever having a
 * second course fee) to a `partialFilterExpression` scoped to feeType:'monthly'.
 *
 * Safe to run multiple times (syncIndexes is idempotent). Run once after
 * deploying the updated TuitionFee model:
 *   node backend/scripts/fixTuitionFeeIndex.js
 */

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      await run();
      console.log('Done.');
      await mongoose.disconnect();
    })
    .catch(err => { console.error(err); process.exit(1); });
}

async function run() {
  const TuitionFee = require('../models/TuitionFee');
  const before = await TuitionFee.collection.indexes();
  console.log('Indexes before:', before.map(i => i.name));
  await TuitionFee.syncIndexes();
  const after = await TuitionFee.collection.indexes();
  console.log('Indexes after:', after.map(i => i.name));
}

module.exports = { run };
