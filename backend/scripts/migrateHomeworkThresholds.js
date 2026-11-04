// scripts/migrateHomeworkThresholds.js
//
// Owner's rule changes:
//   2026-10-25: homework warning 5 → 3, fail ("rớt khóa") 10 → 6
//   2026-11-04: homework warning (and the reminder message) 3 → 4, fail 6 → 8
// New classes get the numbers from the schema defaults; this moves existing
// classes still on an OLD default — a class whose teacher set a custom number
// is left alone. Then refreshes every touched class so each enrollment's
// warning/failed status is recomputed against the new numbers.
//
//   node scripts/migrateHomeworkThresholds.js --dry
//   node scripts/migrateHomeworkThresholds.js
'use strict';

const WARN = 4;
const FAIL = 8;
const OLD_WARN = [5, 3];
const OLD_FAIL = [10, 6];
const OLD_MISS = [3];

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[migrateHomeworkThresholds] ${dry ? 'DRY RUN' : 'LIVE'} → warn ${WARN}, fail ${FAIL}`);

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
    if (p.homeworkWarnThreshold == null || OLD_WARN.includes(p.homeworkWarnThreshold)) set['policy.homeworkWarnThreshold'] = WARN;
    if (p.homeworkFailThreshold == null || OLD_FAIL.includes(p.homeworkFailThreshold)) set['policy.homeworkFailThreshold'] = FAIL;
    if (p.homeworkMissThreshold == null || OLD_MISS.includes(p.homeworkMissThreshold)) set['policy.homeworkMissThreshold'] = WARN;
    if (!Object.keys(set).length) {
      console.log(`  skip  ${c.name} (custom: warn ${p.homeworkWarnThreshold}, fail ${p.homeworkFailThreshold})`);
      continue;
    }
    const show = (k) => `${p[k] ?? '-'}→${set[`policy.${k}`] ?? p[k]}`;
    console.log(`  ${dry ? 'would' : 'set '}  ${c.name}: warn ${show('homeworkWarnThreshold')}, fail ${show('homeworkFailThreshold')}, reminder ${show('homeworkMissThreshold')}`);
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
