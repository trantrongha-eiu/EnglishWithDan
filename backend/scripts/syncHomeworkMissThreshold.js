// scripts/syncHomeworkMissThreshold.js
//
// One-off (2026-11-12): the admin class form only edits "Ngưỡng cảnh báo"
// (policy.homeworkWarnThreshold), but the student dashboard's warning banner
// and reminder message read policy.homeworkMissThreshold. Saving a class now
// keeps the two in step (sanitizePolicy in classAttendance.controller.js);
// this brings classes edited BEFORE that fix into line: reminder = warning.
// Only the banner reads homeworkMissThreshold (computed live in
// assignmentService), so no enrollment refresh is needed.
//
//   node scripts/syncHomeworkMissThreshold.js --dry
//   node scripts/syncHomeworkMissThreshold.js
'use strict';

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[syncHomeworkMissThreshold] ${dry ? 'DRY RUN' : 'LIVE'}`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const ClassGroup = require('../models/ClassGroup');

  await mongoose.connect(process.env.MONGO_URI);

  const classes = await ClassGroup.find({}).select('name status policy.homeworkWarnThreshold policy.homeworkMissThreshold').lean();
  let changed = 0;
  for (const c of classes) {
    const warn = c.policy?.homeworkWarnThreshold;
    const miss = c.policy?.homeworkMissThreshold;
    if (warn == null || warn === miss) continue;
    console.log(`  ${dry ? 'would' : 'set  '}  ${c.name} [${c.status || '-'}]: reminder ${miss ?? '-'} → ${warn} (warning ${warn})`);
    changed++;
    if (!dry) await ClassGroup.updateOne({ _id: c._id }, { $set: { 'policy.homeworkMissThreshold': warn } });
  }

  console.log(`\n${changed}/${classes.length} class(es) ${dry ? 'would be ' : ''}updated.`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
