'use strict';

// "Tới giờ học mà giáo viên chưa điểm danh → tự điểm danh học viên có mặt
// đầy đủ; giáo viên vẫn có quyền chỉnh sửa." (owner, 2026-10-09)
//
// A session is DUE once its start time (session.startTime, else the class's
// startTime, else 23:59 — end of that school day) has passed on the Vietnam
// clock and attendance still hasn't been taken (attendanceTakenAt null).
// Every active student then gets a 'present' AttendanceRecord flagged
// autoMarked, the session flips to 'held', and pending self-check-ins are
// confirmed. Records are ordinary AttendanceRecords, so the teacher edits
// them on Điểm danh exactly like hand-made marks (editHistory included).
//
// Runs from cron/classAttendanceSweep.js every 5 minutes AND lazily on the
// class read endpoints (Render's instance may be asleep at class time), so
// the claim on the session is atomic — two concurrent runs can't both mark.
//
// Only looks back LOOKBACK_DAYS: older sessions that were never marked
// (e.g. from before this feature) are left for the teacher instead of being
// silently filled in as "everyone was there".

const ClassGroup = require('../models/ClassGroup');
const ClassSession = require('../models/ClassSession');
const ClassEnrollment = require('../models/ClassEnrollment');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceCheckIn = require('../models/AttendanceCheckIn');
const { refreshClass } = require('./classAttendanceService');
const logger = require('../utils/logger');

const LOOKBACK_DAYS = 2;
const END_OF_DAY = '23:59';
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// The instant a session starts, Vietnam time. session.date is UTC midnight of
// the school day (see utils/classProgress.js), so its day key is that day.
function sessionStartAt(session, cls) {
  const key = new Date(session.date).toISOString().slice(0, 10);
  const time = [session.startTime, cls && cls.startTime].find((t) => TIME_RE.test(t || '')) || END_OF_DAY;
  return new Date(`${key}T${time}:00+07:00`);
}

async function markSession(session, cls, now) {
  // Claim first — whoever flips attendanceTakenAt owns this run.
  const claimed = await ClassSession.findOneAndUpdate(
    { _id: session._id, attendanceTakenAt: null, status: { $ne: 'cancelled' } },
    { $set: { attendanceTakenAt: now, attendanceTakenBy: null, autoMarkedAt: now, status: 'held' } },
    { new: true },
  );
  if (!claimed) return 0;

  // Students enrolled by the end of that school day — someone added to the
  // class later doesn't get a mark for a session before they joined.
  const dayEnd = new Date(`${new Date(session.date).toISOString().slice(0, 10)}T23:59:59+07:00`);
  const enrollments = await ClassEnrollment.find({ classId: cls._id, removedAt: null, enrolledAt: { $lte: dayEnd } })
    .select('_id studentId').lean();
  const existing = await AttendanceRecord.find({ sessionId: session._id }).select('studentId').lean();
  const already = new Set(existing.map((r) => String(r.studentId)));
  const toCreate = enrollments
    .filter((e) => !already.has(String(e.studentId)))
    .map((e) => ({
      sessionId: session._id, classId: cls._id, enrollmentId: e._id, studentId: e.studentId,
      status: 'present', autoMarked: true, markedBy: null, markedAt: now,
    }));
  if (toCreate.length) {
    try {
      await AttendanceRecord.insertMany(toCreate, { ordered: false });
    } catch (err) {
      if (err.code !== 11000 && !(err.writeErrors || []).every((w) => w.code === 11000)) throw err;
    }
  }
  await AttendanceCheckIn.updateMany(
    { sessionId: session._id, status: 'pending' },
    { $set: { status: 'confirmed', reviewedBy: null, reviewedAt: now } },
  );
  return toCreate.length;
}

/**
 * Auto-mark every due, unmarked session.
 * @param {object} [opts]
 * @param {Array}  [opts.classIds]  limit to these classes (lazy calls); omit = all active classes
 * @param {Date}   [opts.now]
 * @returns {Promise<{sessions:number, records:number}>}
 */
async function autoMarkDueSessions({ classIds, now = new Date() } = {}) {
  const from = new Date(now.getTime() - (LOOKBACK_DAYS + 1) * 864e5);
  const filter = {
    attendanceTakenAt: null,
    status: { $ne: 'cancelled' },
    date: { $gte: from, $lte: now },
  };
  if (classIds) {
    if (!classIds.length) return { sessions: 0, records: 0 };
    filter.classId = { $in: classIds };
  }
  const candidates = await ClassSession.find(filter).select('classId date startTime status').lean();
  if (!candidates.length) return { sessions: 0, records: 0 };

  const classes = await ClassGroup.find({ _id: { $in: [...new Set(candidates.map((s) => String(s.classId)))] }, status: 'active' })
    .select('_id startTime').lean();
  const clsMap = new Map(classes.map((c) => [String(c._id), c]));

  let sessions = 0;
  let records = 0;
  const touched = new Set();
  for (const s of candidates) {
    const cls = clsMap.get(String(s.classId));
    if (!cls) continue;
    const startAt = sessionStartAt(s, cls);
    if (startAt > now || now - startAt > LOOKBACK_DAYS * 864e5) continue;
    try {
      const n = await markSession(s, cls, now);
      sessions += 1;
      records += n;
      touched.add(String(cls._id));
    } catch (err) {
      logger.error('cron', 'AutoAttendance: session failed', { sessionId: String(s._id), errorMessage: err.message });
    }
  }
  for (const id of touched) await refreshClass(id).catch(() => {});
  if (sessions) logger.info('cron', 'AutoAttendance: marked', { sessions, records });
  return { sessions, records };
}

module.exports = { autoMarkDueSessions, sessionStartAt, LOOKBACK_DAYS };
