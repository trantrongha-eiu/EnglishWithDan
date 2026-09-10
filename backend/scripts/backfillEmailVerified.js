// One-time, idempotent backfill for the email-verification feature.
//
// The `emailVerified` schema default is `true`, so accounts that predate
// this feature already read as verified in memory even without a stored
// value — correctness does NOT depend on this script. It just makes the
// state explicit on disk (so an admin looking at raw docs isn't confused,
// and so a future default change can't retroactively strip trials from
// old accounts).
//
// Run once against prod after deploying:
//   node scripts/backfillEmailVerified.js
'use strict';

async function runMigration() {
  const User = require('../models/User');

  // Every account that existed before this deploy is grandfathered as
  // verified. New unverified local registrations are written with an
  // explicit `emailVerified:false` by authService.registerUser AFTER this
  // script would have run, so `{ $exists: false }` cannot catch them.
  const res = await User.updateMany(
    { emailVerified: { $exists: false } },
    { $set: { emailVerified: true } }
  );
  console.log(`[backfillEmailVerified] matched ${res.matchedCount}, modified ${res.modifiedCount}`);
}

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runMigration();
    } finally {
      await mongoose.disconnect();
    }
  })().catch((e) => { console.error('[backfillEmailVerified] FAILED', e); process.exit(1); });
}

module.exports = { runMigration };
