'use strict';

// One-off backfill: every Assignment.deadline ever written went through the
// old `new Date(naiveDatetimeLocalString)` parsing in assignment.controller.js
// (createAssignment/updateAssignment), which — since the server runs with no
// TZ env var set (defaults to UTC on Render) — interpreted the admin's
// "YYYY-MM-DDTHH:mm" input (intended as Vietnam wall-clock time) as if it
// were already UTC. That's now fixed to anchor to +07:00 explicitly (see
// parseVnDeadline in assignment.controller.js), but every deadline written
// before the fix is stored 7 hours ahead of what the teacher actually typed.
//
// Fix: reinterpret each stored timestamp's calendar/clock digits (which are
// exactly what the teacher typed, just mislabeled as UTC instead of +07:00)
// by re-parsing them with the +07:00 offset — equivalent to subtracting 7h
// from the stored instant.
//
// Usage: node scripts/backfillAssignmentDeadlineTz.js        (dry run)
//        node scripts/backfillAssignmentDeadlineTz.js --apply

require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');

const APPLY = process.argv.includes('--apply');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const docs = await Assignment.find({ deadline: { $ne: null } }).select('title deadline').lean();
  console.log(`Found ${docs.length} assignment(s) with a deadline. ${APPLY ? 'APPLYING' : 'DRY RUN — pass --apply to write'}.\n`);

  let updated = 0;
  for (const d of docs) {
    const oldIso = d.deadline.toISOString(); // e.g. "2026-09-10T23:59:00.000Z"
    const reinterpreted = new Date(oldIso.replace(/Z$/, '+07:00'));
    console.log(`${d.title}\n  old: ${oldIso}\n  new: ${reinterpreted.toISOString()}`);
    if (APPLY) {
      await Assignment.updateOne({ _id: d._id }, { $set: { deadline: reinterpreted } });
      updated++;
    }
  }
  console.log(`\n${APPLY ? `Updated ${updated} document(s).` : `Would update ${docs.length} document(s). Re-run with --apply to write.`}`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
