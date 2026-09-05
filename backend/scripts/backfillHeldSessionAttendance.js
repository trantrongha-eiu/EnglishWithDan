// scripts/backfillHeldSessionAttendance.js
//
// Repairs sessions that were marked "Đã học" via the Buổi học tab's
// "Đánh dấu đã học" shortcut (controllers/classAttendance.controller.js's
// updateSession, status -> 'held') BEFORE that action was fixed to also
// seed attendance. Until that fix, flipping a session to held there created
// ZERO AttendanceRecords — and classAttendanceService.computeEnrollmentStats
// only counts a held session toward "Buổi đã học" once a record exists for
// that student — so the session showed "Đã học" in admin while every
// enrolled student's stats (heldSessions, attendance rate, ...) silently
// kept ignoring it (reported as "1 buổi đã học nhưng hiện 0/31").
//
// This is a one-time repair for data written before the fix; the fix itself
// (updateSession now seeds 'present' records on that same transition) means
// no NEW session should ever end up in this state going forward. Safe to
// re-run: only inserts a record where none exists yet for that
// (sessionId, studentId) pair (unique index on AttendanceRecord already
// enforces this too), and matches the same 'present' default the fix uses.
//
//   node scripts/backfillHeldSessionAttendance.js --dry
//   node scripts/backfillHeldSessionAttendance.js
'use strict';

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[backfillHeldSessionAttendance] ${dry ? 'DRY RUN' : 'LIVE'}`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const ClassSession = require('../models/ClassSession');
  const ClassEnrollment = require('../models/ClassEnrollment');
  const AttendanceRecord = require('../models/AttendanceRecord');
  const svc = require('../services/classAttendanceService');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Đã kết nối MongoDB\n');

  const sessions = await ClassSession.find({ type: 'regular', status: 'held', date: { $lte: new Date() } }).lean();
  console.log(`${sessions.length} held session(s) dated up to now.`);

  let createdTotal = 0;
  const affectedClassIds = new Set();

  for (const s of sessions) {
    const enrollments = await ClassEnrollment.find({ classId: s.classId, removedAt: null }).select('_id studentId').lean();
    if (!enrollments.length) continue;
    const existing = await AttendanceRecord.find({ sessionId: s._id }).select('studentId').lean();
    const already = new Set(existing.map((r) => String(r.studentId)));
    const missing = enrollments.filter((e) => !already.has(String(e.studentId)));
    if (!missing.length) continue;

    console.log(`Session ${s._id} (buổi ${s.sessionNumber}, ${new Date(s.date).toLocaleDateString('vi-VN')}, class ${s.classId}): ${missing.length} học viên chưa có bản ghi điểm danh.`);
    affectedClassIds.add(String(s.classId));
    createdTotal += missing.length;
    if (dry) continue;

    await AttendanceRecord.insertMany(missing.map((e) => ({
      sessionId: s._id, classId: s.classId, enrollmentId: e._id, studentId: e.studentId,
      status: 'present', markedAt: new Date(),
      note: 'Tự động ghi nhận có mặt (buổi đã đánh dấu "Đã học" trước khi tính năng điểm danh mặc định được thêm) — backfill.',
    })));
  }

  console.log(`\n${dry ? 'Would create' : 'Created'} ${createdTotal} attendance record(s) across ${affectedClassIds.size} class(es).`);

  if (!dry && affectedClassIds.size) {
    console.log('Refreshing stats for affected classes...');
    for (const classId of affectedClassIds) await svc.refreshClass(classId);
    console.log('Done.');
  }

  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
