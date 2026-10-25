// scripts/migrateHomeworkThresholds.js
//
// Owner's rule change (2026-10-25): homework warning 5 → 3, fail ("rớt khóa")
// 10 → 6. New classes get it from the schema defaults; this moves existing
// classes still on the OLD defaults (5 / 10) — a class whose teacher set a
// custom number is left alone. Then refreshes every touched class so each
// enrollment's warning/failed status is recomputed against the new numbers.
//
//   node scripts/migrateHomeworkThresholds.js --dry
//   node scripts/migrateHomeworkThresholds.js
'use strict';

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[migrateHomeworkThresholds] ${dry ? 'DRY RUN' : 'LIVE'}`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const ClassGroup = require('../models/ClassGroup');
  const svc = require('../services/classAttendanceService');

  await mongoose.connect(process.env.MONGO_URI);

  const classes = await ClassGroup.find({}).select('name policy').lean();
  const touched = [];
  for (const c of classes) {
    const p = c.policy || {};
    const set = {};
    if (p.homeworkWarnThreshold == null || p.homeworkWarnThreshold === 5) set['policy.homeworkWarnThreshold'] = 3;
    if (p.homeworkFailThreshold == null || p.homeworkFailThreshold === 10) set['policy.homeworkFailThreshold'] = 6;
    if (!Object.keys(set).length) {
      console.log(`  skip  ${c.name} (custom: warn ${p.homeworkWarnThreshold}, fail ${p.homeworkFailThreshold})`);
      continue;
    }
    console.log(`  ${dry ? 'would' : 'set '}  ${c.name}: warn ${p.homeworkWarnThreshold ?? '-'}→${set['policy.homeworkWarnThreshold'] ?? p.homeworkWarnThreshold}, fail ${p.homeworkFailThreshold ?? '-'}→${set['policy.homeworkFailThreshold'] ?? p.homeworkFailThreshold}`);
    touched.push(c._id);
    if (!dry) await ClassGroup.updateOne({ _id: c._id }, { $set: set });
  }

  console.log(`\n${touched.length}/${classes.length} class(es) ${dry ? 'would be' : ''} updated.`);
  if (!dry) {
    for (const id of touched) await svc.refreshClass(id);
    console.log('Enrollment statuses refreshed.');
  }
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
