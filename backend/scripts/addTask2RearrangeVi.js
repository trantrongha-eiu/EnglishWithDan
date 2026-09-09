// scripts/addTask2RearrangeVi.js
//
// Adds `promptVi` (Vietnamese translation of the target sentence) to every
// "Sắp xếp từ" (rearrange) question already in the DB, WITHOUT the
// destructive full re-seed (seedTask2Exercises.js does replaceOne, which
// would wipe any admin-added questions on a seeded topic).
//
// Matches by the exact English `questions.correctAnswer` against the map in
// data/task2RearrangeVi.js. Idempotent. Reports any rearrange question with
// no mapping (e.g. admin-added ones) so they can be filled in by hand.
//
//   node scripts/addTask2RearrangeVi.js --dry   # report only
//   node scripts/addTask2RearrangeVi.js         # apply
'use strict';

const VI = require('./data/task2RearrangeVi');

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[addTask2RearrangeVi] ${dry ? 'DRY RUN' : 'LIVE'} — ${Object.keys(VI).length} translations in the map\n`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const Task2Topic = require('../models/Task2Topic');
  await mongoose.connect(process.env.MONGO_URI);

  const topics = await Task2Topic.find({ 'questions.type': 'rearrange' }).lean();
  let matched = 0, alreadyOk = 0;
  const unmapped = [];
  const bulk = [];

  for (const t of topics) {
    for (const q of t.questions) {
      if (q.type !== 'rearrange') continue;
      const vi = VI[q.correctAnswer];
      if (!vi) { unmapped.push(`W${t.week} "${t.topicName}": ${q.correctAnswer}`); continue; }
      if (q.promptVi === vi) { alreadyOk++; continue; }
      matched++;
      bulk.push({
        updateOne: {
          filter: { _id: t._id, 'questions._id': q._id },
          update: { $set: { 'questions.$.promptVi': vi } },
        },
      });
    }
  }

  console.log(`  ${matched} question(s) to update · ${alreadyOk} already correct · ${unmapped.length} without a mapping`);
  if (unmapped.length) {
    console.log('\n  ⚠️  Rearrange questions with NO Vietnamese mapping (add to data/task2RearrangeVi.js):');
    unmapped.forEach((u) => console.log('     - ' + u));
  }

  if (!dry && bulk.length) {
    const res = await Task2Topic.bulkWrite(bulk);
    console.log(`\n  ✏️  Updated ${res.modifiedCount} topic docs.`);
  } else if (dry) {
    console.log('\n  (DRY RUN — re-run without --dry to apply)');
  }

  await mongoose.disconnect();
  console.log('\nXong.');
}

main().catch((e) => { console.error(e); process.exit(1); });
