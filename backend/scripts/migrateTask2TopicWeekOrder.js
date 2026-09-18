// scripts/migrateTask2TopicWeekOrder.js
// Reorders the "Luyện theo tuần" Task 2 weekly-practice grid to match the
// standard Type01→Type07 essay-type sequence (same order the WT1 Task 2
// course's Module 2 already uses) — previously Discuss Both Views/Cause &
// Effect/Agree-Disagree sat scrambled at weeks 11-12/3-4/9-10 instead of
// their type-numbered slots.
//
// seedTask2Exercises.js's own runSeed() upserts by {week, orderIndex} as
// the "unique key" — since only `week` changed here (orderIndex is
// untouched), re-running that seed naively would INSERT a new doc at each
// topic's new (week, orderIndex) pair while leaving the old doc (still at
// its old week) behind as an orphaned duplicate. This script instead moves
// each topic doc in place by topicName (unique across the collection),
// touching nothing else — idempotent: a doc already at its target week is
// simply not matched a second time.
//
//   node scripts/migrateTask2TopicWeekOrder.js --dry
//   node scripts/migrateTask2TopicWeekOrder.js
'use strict';

// topicName -> { from, to } week. `from` is asserted before writing (a
// safety check against running this twice from a stale mental model, or
// against a DB that's already been re-seeded from the updated
// seedTask2Exercises.js and so is already at `to`).
const MOVES = {
  'High Rates of University Dropout': { from: 3, to: 9 },
  'Decline in STEM Course Enrolments': { from: 3, to: 9 },
  'Online Learning and Student Motivation': { from: 4, to: 10 },
  'Dropout Rates in Higher Education': { from: 4, to: 10 },
  'Shorter Work Week': { from: 9, to: 11 },
  'Remote Work as the Future': { from: 9, to: 11 },
  'Job Satisfaction vs. Salary': { from: 10, to: 12 },
  'Unenjoyable Employment vs. Unemployment': { from: 10, to: 12 },
  'Public Health Promotion: Healthy Food Subsidies vs. Junk Food Taxes': { from: 11, to: 3 },
  'Funding Priorities: Free Public Libraries vs. Internet Infrastructure': { from: 11, to: 3 },
  'National Fitness Funding: Elite Athletes vs. Grassroots Sports': { from: 12, to: 4 },
  'Economic Support: Higher Education vs. Vocational Training': { from: 12, to: 4 },
};

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[migrateTask2TopicWeekOrder] ${dry ? 'DRY RUN' : 'LIVE'}`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const Task2Topic = require('../models/Task2Topic');
  await mongoose.connect(process.env.MONGO_URI);

  let moved = 0, alreadyAtTarget = 0, missing = 0, mismatched = 0;
  for (const [topicName, { from, to }] of Object.entries(MOVES)) {
    const doc = await Task2Topic.findOne({ topicName }).select('week').lean();
    if (!doc) { console.log(`  ✗ MISSING: "${topicName}"`); missing++; continue; }
    if (doc.week === to) { console.log(`  · already at week ${to}: "${topicName}"`); alreadyAtTarget++; continue; }
    if (doc.week !== from) {
      console.log(`  ⚠ SKIP (expected week ${from}, found ${doc.week}): "${topicName}"`);
      mismatched++;
      continue;
    }
    console.log(`  → week ${from} → ${to}: "${topicName}"`);
    if (!dry) await Task2Topic.updateOne({ topicName }, { $set: { week: to } });
    moved++;
  }

  console.log(`[migrateTask2TopicWeekOrder] moved ${moved}, already-at-target ${alreadyAtTarget}, missing ${missing}, mismatched ${mismatched}`);
  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { MOVES };
