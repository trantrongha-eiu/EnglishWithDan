'use strict';

// Teacher class-management + attendance. See the approved plan and
// services/classAttendanceService.js for the attendance math. Authorization
// model: staffOnly (teacher|admin) on every route, then loadOwnedClass —
// a teacher may only touch a class whose teacherId is their own id; an
// admin bypasses that check. Students only reach the /my/* read routes.

const mongoose = require('mongoose');
const ClassGroup = require('../models/ClassGroup');
const ClassEnrollment = require('../models/ClassEnrollment');
const ClassSession = require('../models/ClassSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const User = require('../models/User');
const svc = require('../services/classAttendanceService');
const { staffOnly, loadOwnedClass, displayName: studentName } = require('../middleware/classAccess');
const logger = require('../utils/logger');

const ATT_STATUSES = ['present', 'absent', 'excused', 'late'];
const MANUAL_ENROLLMENT_STATUSES = ['active', 'completed', 'dropped'];

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

// ── middleware ──────────────────────────────────────────────────────────
// staffOnly + loadOwnedClass now live in middleware/classAccess.js (shared
// with the assignments feature); re-exported below so routes/classAttendance.js
// keeps referencing them as c.staffOnly / c.loadOwnedClass.

async function loadSession(req, res, next) {
  try {
    const s = await ClassSession.findOne({ _id: req.params.sessionId, classId: req.classGroup._id });
    if (!s) return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học' });
    req.classSession = s;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

// ── validation helpers ─────────────────────────────────────────────────

function sanitizePolicy(input = {}, base = {}) {
  const out = { ...base };
  const num = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
  if (num(input.maxAbsencesAllowed) !== undefined) out.maxAbsencesAllowed = Math.max(0, num(input.maxAbsencesAllowed));
  if (num(input.warnThreshold) !== undefined) out.warnThreshold = Math.max(0, num(input.warnThreshold));
  if (input.excusedCountsAsAbsence !== undefined) out.excusedCountsAsAbsence = !!input.excusedCountsAsAbsence;
  if (num(input.lateToAbsenceRatio) !== undefined) out.lateToAbsenceRatio = Math.max(1, num(input.lateToAbsenceRatio));
  if (num(input.lateThresholdMinutes) !== undefined) out.lateThresholdMinutes = Math.max(0, num(input.lateThresholdMinutes));
  if (input.failOnExceed !== undefined) out.failOnExceed = !!input.failOnExceed;
  if (num(input.homeworkMissThreshold) !== undefined) out.homeworkMissThreshold = Math.max(1, num(input.homeworkMissThreshold));
  if (num(input.homeworkWarnThreshold) !== undefined) out.homeworkWarnThreshold = Math.max(1, num(input.homeworkWarnThreshold));
  if (num(input.homeworkFailThreshold) !== undefined) out.homeworkFailThreshold = Math.max(1, num(input.homeworkFailThreshold));
  return out;
}

function validateClassBody(body, { partial = false } = {}) {
  const errs = [];
  if (!partial || body.name !== undefined) {
    if (!body.name || !String(body.name).trim()) errs.push('Tên lớp là bắt buộc');
  }
  if (body.totalSessions !== undefined && body.totalSessions !== null && body.totalSessions !== '') {
    if (!(Number(body.totalSessions) >= 1)) errs.push('Tổng số buổi phải >= 1');
  }
  if (body.startDate && body.endDate && new Date(body.endDate) < new Date(body.startDate)) {
    errs.push('Ngày kết thúc phải sau ngày bắt đầu');
  }
  return errs;
}

// ── class CRUD ─────────────────────────────────────────────────────────

exports.staffOnly = staffOnly;
exports.loadOwnedClass = loadOwnedClass;
exports.loadSession = loadSession;

exports.listClasses = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { teacherId: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const classes = await ClassGroup.find(filter).sort({ status: 1, createdAt: -1 }).lean();
    const ids = classes.map((c) => c._id);

    const grouped = await ClassEnrollment.aggregate([
      { $match: { classId: { $in: ids }, removedAt: null } },
      { $group: { _id: { classId: '$classId', status: '$status' }, n: { $sum: 1 } } },
    ]);
    const countMap = {};
    for (const g of grouped) {
      const k = String(g._id.classId);
      countMap[k] = countMap[k] || { total: 0, active: 0, warning: 0, failed: 0, completed: 0, dropped: 0 };
      countMap[k][g._id.status] = g.n;
      countMap[k].total += g.n;
    }

    let teacherMap = {};
    if (req.user.role === 'admin') {
      const tids = [...new Set(classes.map((c) => String(c.teacherId)))];
      const teachers = await User.find({ _id: { $in: tids } }).select('username firstName lastName').lean();
      teachers.forEach((t) => { teacherMap[String(t._id)] = { _id: t._id, name: studentName(t), username: t.username }; });
    }

    res.json({
      success: true,
      classes: classes.map((c) => ({
        ...c,
        enrollmentCounts: countMap[String(c._id)] || { total: 0, active: 0, warning: 0, failed: 0, completed: 0, dropped: 0 },
        teacher: teacherMap[String(c.teacherId)] || null,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.createClass = async (req, res) => {
  try {
    const errs = validateClassBody(req.body);
    if (errs.length) return res.status(400).json({ success: false, message: errs.join('. ') });

    let teacherId = req.user._id;
    if (req.user.role === 'admin' && req.body.teacherId) {
      if (!mongoose.isValidObjectId(req.body.teacherId)) {
        return res.status(400).json({ success: false, message: 'teacherId không hợp lệ' });
      }
      const t = await User.findById(req.body.teacherId).select('role');
      if (!t || !['teacher', 'admin'].includes(t.role)) {
        return res.status(400).json({ success: false, message: 'teacherId phải là một giáo viên' });
      }
      teacherId = t._id;
    }

    const cls = await ClassGroup.create({
      name: String(req.body.name).trim(),
      courseId: mongoose.isValidObjectId(req.body.courseId) ? req.body.courseId : null,
      courseName: (req.body.courseName || '').trim(),
      teacherId,
      createdBy: req.user._id,
      startDate: req.body.startDate || undefined,
      endDate: req.body.endDate || undefined,
      durationMonths: req.body.durationMonths || undefined,
      totalSessions: req.body.totalSessions || undefined,
      sessionsPerWeek: req.body.sessionsPerWeek || undefined,
      sessionsPerMonth: req.body.sessionsPerMonth || undefined,
      policy: sanitizePolicy(req.body.policy || {}),
    });
    logger.security('Class created', { actorId: String(req.user._id), classId: String(cls._id), teacherId: String(teacherId) });
    res.status(201).json({ success: true, class: cls });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getClass = async (req, res) => {
  try {
    const cls = req.classGroup;
    const enrollments = await ClassEnrollment.find({ classId: cls._id })
      .sort({ removedAt: 1, createdAt: 1 })
      .lean();
    const studentIds = enrollments.map((e) => e.studentId);
    const students = await User.find({ _id: { $in: studentIds } })
      .select('username firstName lastName email avatar')
      .lean();
    const sMap = {};
    students.forEach((s) => { sMap[String(s._id)] = s; });

    const shape = (e) => ({
      ...e,
      student: sMap[String(e.studentId)]
        ? { _id: e.studentId, name: studentName(sMap[String(e.studentId)]), username: sMap[String(e.studentId)].username, email: sMap[String(e.studentId)].email, avatar: sMap[String(e.studentId)].avatar }
        : { _id: e.studentId, name: '(đã xoá tài khoản)', username: '', email: '' },
    });

    res.json({
      success: true,
      class: cls.toObject(),
      roster: enrollments.filter((e) => !e.removedAt).map(shape),
      formerStudents: enrollments.filter((e) => e.removedAt).map(shape),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const cls = req.classGroup;
    const errs = validateClassBody(req.body, { partial: true });
    if (errs.length) return res.status(400).json({ success: false, message: errs.join('. ') });

    const fields = ['name', 'courseName', 'startDate', 'endDate', 'durationMonths', 'totalSessions', 'sessionsPerWeek', 'sessionsPerMonth'];
    for (const f of fields) if (req.body[f] !== undefined) cls[f] = req.body[f] === '' ? undefined : req.body[f];
    if (req.body.courseId !== undefined) cls.courseId = mongoose.isValidObjectId(req.body.courseId) ? req.body.courseId : null;
    if (req.body.name !== undefined) cls.name = String(req.body.name).trim();

    let policyChanged = false;
    if (req.body.policy && typeof req.body.policy === 'object') {
      cls.policy = sanitizePolicy(req.body.policy, cls.policy.toObject ? cls.policy.toObject() : cls.policy);
      policyChanged = true;
    }
    await cls.save();
    if (policyChanged) await svc.refreshClass(cls._id);
    res.json({ success: true, class: cls });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.setClassStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status phải là active hoặc archived' });
    }
    req.classGroup.status = status;
    await req.classGroup.save();
    res.json({ success: true, class: req.classGroup });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── roster ────────────────────────────────────────────────────────────

exports.addStudents = async (req, res) => {
  try {
    const cls = req.classGroup;
    let users = [];
    if (req.body.email) {
      const u = await User.findOne({ email: String(req.body.email).trim().toLowerCase() }).select('role username firstName lastName email');
      if (!u) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với email này' });
      users = [u];
    } else {
      const ids = Array.isArray(req.body.studentIds) ? req.body.studentIds : (req.body.userId ? [req.body.userId] : []);
      const valid = ids.filter((id) => mongoose.isValidObjectId(id));
      if (!valid.length) return res.status(400).json({ success: false, message: 'Cần email hoặc studentIds' });
      users = await User.find({ _id: { $in: valid } }).select('role username firstName lastName email');
    }

    const added = [];
    const skipped = [];
    for (const u of users) {
      if (u.role !== 'student') { skipped.push({ id: u._id, reason: 'không phải học viên' }); continue; }
      const active = await ClassEnrollment.findOne({ classId: cls._id, studentId: u._id, removedAt: null });
      if (active) { skipped.push({ id: u._id, reason: 'đã ở trong lớp' }); continue; }
      const enrollment = await ClassEnrollment.create({
        classId: cls._id, studentId: u._id, enrolledBy: req.user._id,
      });
      await svc.refreshEnrollment(enrollment._id);
      added.push({ enrollmentId: enrollment._id, studentId: u._id, name: studentName(u) });
    }

    if (!added.length && skipped.length) {
      return res.status(409).json({ success: false, message: skipped.map((s) => s.reason).join(', '), skipped });
    }
    res.json({ success: true, added, skipped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeStudent = async (req, res) => {
  try {
    const e = await ClassEnrollment.findOne({ _id: req.params.enrollmentId, classId: req.classGroup._id, removedAt: null });
    if (!e) return res.status(404).json({ success: false, message: 'Không tìm thấy học viên trong lớp' });
    e.removedAt = new Date();
    e.removedBy = req.user._id;
    await e.save();
    // Attendance history for this (classId, studentId) is intentionally left in place.
    res.json({ success: true, message: 'Đã xoá khỏi lớp (lịch sử điểm danh vẫn được giữ)' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.setEnrollmentStatus = async (req, res) => {
  try {
    const { status, reason = '' } = req.body;
    if (!MANUAL_ENROLLMENT_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `status phải là một trong: ${MANUAL_ENROLLMENT_STATUSES.join(', ')}` });
    }
    const e = await ClassEnrollment.findOne({ _id: req.params.enrollmentId, classId: req.classGroup._id });
    if (!e) return res.status(404).json({ success: false, message: 'Không tìm thấy học viên trong lớp' });
    e.status = status;
    e.statusReason = reason;
    e.statusAuto = false;
    e.statusUpdatedAt = new Date();
    await e.save();
    // Setting back to "active" hands control back to the auto-math, which may
    // immediately re-derive warning/failed from the attendance already logged.
    if (status === 'active') await svc.refreshEnrollment(e._id);
    const fresh = await ClassEnrollment.findById(e._id).lean();
    res.json({ success: true, enrollment: fresh });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── sessions ──────────────────────────────────────────────────────────

exports.listSessions = async (req, res) => {
  try {
    const sessions = await ClassSession.find({ classId: req.classGroup._id }).sort({ sessionNumber: 1 }).lean();
    const ids = sessions.map((s) => s._id);
    const marked = await AttendanceRecord.aggregate([
      { $match: { sessionId: { $in: ids } } },
      { $group: { _id: '$sessionId', n: { $sum: 1 } } },
    ]);
    const mMap = {};
    marked.forEach((m) => { mMap[String(m._id)] = m.n; });
    res.json({ success: true, sessions: sessions.map((s) => ({ ...s, markedCount: mMap[String(s._id)] || 0 })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.createSession = async (req, res) => {
  try {
    const cls = req.classGroup;
    if (!req.body.date) return res.status(400).json({ success: false, message: 'Ngày buổi học là bắt buộc' });
    const type = req.body.type === 'makeup' ? 'makeup' : 'regular';
    let makeupForSessionId = null;
    if (type === 'makeup') {
      if (!mongoose.isValidObjectId(req.body.makeupForSessionId)) {
        return res.status(400).json({ success: false, message: 'Buổi học bù phải chọn buổi gốc' });
      }
      const orig = await ClassSession.findOne({ _id: req.body.makeupForSessionId, classId: cls._id });
      if (!orig) return res.status(400).json({ success: false, message: 'Buổi gốc không thuộc lớp này' });
      makeupForSessionId = orig._id;
    }

    let sessionNumber = Number(req.body.sessionNumber);
    if (!Number.isInteger(sessionNumber) || sessionNumber < 1) {
      const last = await ClassSession.findOne({ classId: cls._id }).sort({ sessionNumber: -1 }).select('sessionNumber').lean();
      sessionNumber = (last?.sessionNumber || 0) + 1;
    }

    const session = await ClassSession.create({
      classId: cls._id,
      sessionNumber,
      date: req.body.date,
      topic: (req.body.topic || '').trim(),
      note: (req.body.note || '').trim(),
      type,
      makeupForSessionId,
      status: ['scheduled', 'held', 'cancelled'].includes(req.body.status) ? req.body.status : 'scheduled',
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, session });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Buổi học số này đã tồn tại' });
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /:classId/sessions/generate — bulk-create every 'regular' session
// between two dates that falls on one of the given weekdays (teacher just
// ticks the class's fixed meeting days, e.g. Tue/Thu/Sat), so a whole term
// doesn't have to be added one session at a time. Sessions land as
// 'scheduled' (not 'held') since they haven't happened yet — the teacher
// marks each 'Đã học' from the Buổi học tab as the term progresses, same as
// a manually-created future session already works. Idempotent-ish: a date
// that already has a 'regular' session (from a prior run, or a manual add)
// is skipped rather than duplicated, so re-running after adding a weekday
// mid-term is safe.
const MAX_GENERATE_DAYS = 730; // ~2 years — sanity cap against a bad date range
exports.generateSessions = async (req, res) => {
  try {
    const cls = req.classGroup;
    const weekdays = Array.isArray(req.body.weekdays)
      ? [...new Set(req.body.weekdays.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6))]
      : [];
    if (!weekdays.length) return res.status(400).json({ success: false, message: 'Chọn ít nhất một ngày trong tuần' });

    const startRaw = req.body.startDate || cls.startDate;
    const endRaw = req.body.endDate || cls.endDate;
    if (!startRaw || !endRaw) return res.status(400).json({ success: false, message: 'Cần ngày bắt đầu và kết thúc' });
    const start = new Date(startRaw);
    const end = new Date(endRaw);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return res.status(400).json({ success: false, message: 'Ngày không hợp lệ' });
    if (start > end) return res.status(400).json({ success: false, message: 'Ngày bắt đầu phải trước ngày kết thúc' });
    if ((end - start) / 864e5 > MAX_GENERATE_DAYS) return res.status(400).json({ success: false, message: 'Khoảng thời gian quá dài (tối đa 2 năm)' });

    const weekdaySet = new Set(weekdays);
    const existing = await ClassSession.find({ classId: cls._id, type: 'regular' }).select('date sessionNumber').lean();
    const existingDateKeys = new Set(existing.map((s) => new Date(s.date).toISOString().slice(0, 10)));
    let nextNumber = existing.reduce((max, s) => Math.max(max, s.sessionNumber), 0) + 1;

    const topic = (req.body.topic || '').trim();
    const toCreate = [];
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      if (!weekdaySet.has(d.getUTCDay())) continue;
      const key = d.toISOString().slice(0, 10);
      if (existingDateKeys.has(key)) continue;
      toCreate.push({
        classId: cls._id, sessionNumber: nextNumber++, date: new Date(d),
        topic, type: 'regular', status: 'scheduled', createdBy: req.user._id,
      });
    }
    if (!toCreate.length) return res.json({ success: true, created: 0, sessions: [] });
    const sessions = await ClassSession.insertMany(toCreate);
    res.status(201).json({ success: true, created: sessions.length, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const s = req.classSession;
    const before = { status: s.status, date: +new Date(s.date), type: s.type };
    for (const f of ['topic', 'note']) if (req.body[f] !== undefined) s[f] = String(req.body[f]).trim();
    if (req.body.date) s.date = req.body.date;
    if (['scheduled', 'held', 'cancelled'].includes(req.body.status)) s.status = req.body.status;
    if (req.body.type && ['regular', 'makeup'].includes(req.body.type)) s.type = req.body.type;
    if (req.body.makeupForSessionId !== undefined) {
      if (s.type === 'makeup') {
        if (!mongoose.isValidObjectId(req.body.makeupForSessionId)) {
          return res.status(400).json({ success: false, message: 'Buổi học bù phải chọn buổi gốc' });
        }
        const orig = await ClassSession.findOne({ _id: req.body.makeupForSessionId, classId: s.classId });
        if (!orig) return res.status(400).json({ success: false, message: 'Buổi gốc không thuộc lớp này' });
        s.makeupForSessionId = orig._id;
      } else {
        s.makeupForSessionId = null;
      }
    }
    await s.save();
    const changed = before.status !== s.status || before.date !== +new Date(s.date) || before.type !== s.type;
    if (changed) await svc.refreshClass(s.classId);
    res.json({ success: true, session: s });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── attendance ────────────────────────────────────────────────────────

async function buildRoster(classId, sessionId) {
  const [enrollments, records] = await Promise.all([
    ClassEnrollment.find({ classId }).lean(),
    AttendanceRecord.find({ sessionId }).lean(),
  ]);
  const recMap = {};
  records.forEach((r) => { recMap[String(r.enrollmentId)] = r; });
  const students = await User.find({ _id: { $in: enrollments.map((e) => e.studentId) } })
    .select('username firstName lastName avatar').lean();
  const sMap = {};
  students.forEach((s) => { sMap[String(s._id)] = s; });

  // Active roster + anyone already marked for this session (even if since removed).
  return enrollments
    .filter((e) => !e.removedAt || recMap[String(e._id)])
    .map((e) => {
      const r = recMap[String(e._id)];
      return {
        enrollmentId: e._id,
        studentId: e.studentId,
        student: { _id: e.studentId, name: studentName(sMap[String(e.studentId)]), username: sMap[String(e.studentId)]?.username || '' },
        enrollmentStatus: e.status,
        removed: !!e.removedAt,
        status: r?.status || null,
        lateMinutes: r?.lateMinutes ?? null,
        note: r?.note || '',
        edited: !!(r?.editHistory && r.editHistory.length),
      };
    });
}

exports.getSessionAttendance = async (req, res) => {
  try {
    const roster = await buildRoster(req.classGroup._id, req.classSession._id);
    res.json({ success: true, session: req.classSession.toObject(), roster });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.saveSessionAttendance = async (req, res) => {
  try {
    const cls = req.classGroup;
    const session = req.classSession;
    if (session.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Buổi học đã huỷ — không thể điểm danh' });
    }
    if (new Date(session.date) > endOfToday()) {
      return res.status(400).json({ success: false, message: 'Chưa thể điểm danh cho buổi học trong tương lai' });
    }
    const marks = Array.isArray(req.body.marks) ? req.body.marks : [];
    if (!marks.length) return res.status(400).json({ success: false, message: 'Không có dữ liệu điểm danh' });

    const enrollments = await ClassEnrollment.find({ classId: cls._id }).lean();
    const eMap = {};
    enrollments.forEach((e) => { eMap[String(e._id)] = e; });

    for (const m of marks) {
      if (!ATT_STATUSES.includes(m.status)) {
        return res.status(400).json({ success: false, message: `Trạng thái điểm danh không hợp lệ: ${m.status}` });
      }
      const e = eMap[String(m.enrollmentId)];
      if (!e) return res.status(400).json({ success: false, message: 'Học viên không thuộc lớp này' });

      const existing = await AttendanceRecord.findOne({ sessionId: session._id, studentId: e.studentId });
      const lateMinutes = m.status === 'late' && Number.isFinite(Number(m.lateMinutes)) ? Math.max(0, Number(m.lateMinutes)) : undefined;
      const note = (m.note || '').trim();

      if (existing) {
        if (existing.status !== m.status || (existing.note || '') !== note) {
          existing.editHistory.push({ from: existing.status, to: m.status, byId: req.user._id, at: new Date() });
          existing.lastEditedBy = req.user._id;
          existing.lastEditedAt = new Date();
        }
        existing.status = m.status;
        existing.lateMinutes = lateMinutes;
        existing.note = note;
        await existing.save();
      } else {
        await AttendanceRecord.create({
          sessionId: session._id,
          classId: cls._id,
          enrollmentId: e._id,
          studentId: e.studentId,
          status: m.status,
          lateMinutes,
          note,
          markedBy: req.user._id,
          markedAt: new Date(),
        });
      }
    }

    if (session.status !== 'held') session.status = 'held';
    session.attendanceTakenAt = new Date();
    session.attendanceTakenBy = req.user._id;
    await session.save();

    await svc.refreshClass(cls._id);
    const roster = await buildRoster(cls._id, session._id);
    res.json({ success: true, session: session.toObject(), roster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── dashboard ─────────────────────────────────────────────────────────

exports.getDashboard = async (req, res) => {
  try {
    const cls = req.classGroup;
    const { status, studentId, from, to, includeRemoved } = req.query;

    const eFilter = { classId: cls._id };
    if (!includeRemoved) eFilter.removedAt = null;
    if (studentId && mongoose.isValidObjectId(studentId)) eFilter.studentId = studentId;
    let enrollments = await ClassEnrollment.find(eFilter).lean();

    // Optional date-range recompute: filter sessions to [from, to] and run the
    // pure stats fn in memory. Without from/to, use the cached enrollment.stats.
    let rangeSessions = null;
    let recMapByStudent = null;
    if (from || to) {
      const dFilter = { classId: cls._id };
      if (from) dFilter.date = { ...(dFilter.date || {}), $gte: new Date(from) };
      if (to) dFilter.date = { ...(dFilter.date || {}), $lte: new Date(to) };
      rangeSessions = await ClassSession.find(dFilter).lean();
      const sessIds = rangeSessions.map((s) => s._id);
      const recs = await AttendanceRecord.find({ sessionId: { $in: sessIds } }).lean();
      recMapByStudent = new Map();
      for (const r of recs) {
        const k = String(r.studentId);
        if (!recMapByStudent.has(k)) recMapByStudent.set(k, []);
        recMapByStudent.get(k).push(r);
      }
    }

    const students = await User.find({ _id: { $in: enrollments.map((e) => e.studentId) } })
      .select('username firstName lastName avatar').lean();
    const sMap = {};
    students.forEach((s) => { sMap[String(s._id)] = s; });

    let rows = enrollments.map((e) => {
      let st = e.stats || {};
      let effStatus = e.status;
      if (rangeSessions) {
        const computed = svc.computeEnrollmentStats({
          enrollment: e, policy: cls.policy, sessions: rangeSessions,
          records: recMapByStudent.get(String(e.studentId)) || [],
        });
        st = computed;
        effStatus = computed.derivedStatus;
      }
      return {
        enrollmentId: e._id,
        studentId: e.studentId,
        student: { _id: e.studentId, name: studentName(sMap[String(e.studentId)]), username: sMap[String(e.studentId)]?.username || '', avatar: sMap[String(e.studentId)]?.avatar || '' },
        heldSessions: st.heldSessions || 0,
        attendedCount: st.attendedCount || 0,
        absentTotal: (st.absentUnexcused || 0) + (st.absentExcused || 0),
        absentUnexcused: st.absentUnexcused || 0,
        absentExcused: st.absentExcused || 0,
        lateCount: st.lateCount || 0,
        absenceEquivalent: st.absenceEquivalent || 0,
        attendanceRate: st.attendanceRate || 0,
        remainingAllowed: st.remainingAllowed ?? Math.max(0, (cls.policy.maxAbsencesAllowed || 0) - (st.absenceEquivalent || 0)),
        status: effStatus,
        removed: !!e.removedAt,
      };
    });
    if (status) rows = rows.filter((r) => r.status === status);
    rows.sort((a, b) => b.absenceEquivalent - a.absenceEquivalent);

    res.json({
      success: true,
      class: { _id: cls._id, name: cls.name, policy: cls.policy, totalSessions: cls.totalSessions },
      rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── student self-view ─────────────────────────────────────────────────

exports.myAttendanceStatus = async (req, res) => {
  try {
    const enrollments = await ClassEnrollment.find({ studentId: req.user._id, removedAt: null }).lean();
    if (!enrollments.length) return res.json({ success: true, classes: [] });
    const clsMap = {};
    const classes = await ClassGroup.find({ _id: { $in: enrollments.map((e) => e.classId) } })
      .select('name status policy').lean();
    classes.forEach((c) => { clsMap[String(c._id)] = c; });

    const out = enrollments
      .map((e) => {
        const c = clsMap[String(e.classId)];
        if (!c || c.status !== 'active') return null;
        const st = e.stats || {};
        const p = svc.withPolicyDefaults(c.policy);
        return {
          classId: e.classId,
          className: c.name,
          status: e.status,
          statusReason: e.statusReason || '',
          absenceEquivalent: st.absenceEquivalent || 0,
          absentTotal: (st.absentUnexcused || 0) + (st.absentExcused || 0),
          heldSessions: st.heldSessions || 0,
          attendanceRate: st.attendanceRate || 0,
          maxAbsencesAllowed: p.maxAbsencesAllowed,
          warnThreshold: p.warnThreshold,
          remaining: st.remainingAllowed ?? Math.max(0, p.maxAbsencesAllowed - (st.absenceEquivalent || 0)),
        };
      })
      .filter(Boolean);
    res.json({ success: true, classes: out });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.myEnrollments = async (req, res) => {
  try {
    const enrollments = await ClassEnrollment.find({ studentId: req.user._id }).sort({ createdAt: -1 }).lean();
    if (!enrollments.length) return res.json({ success: true, enrollments: [] });
    const classes = await ClassGroup.find({ _id: { $in: enrollments.map((e) => e.classId) } })
      .select('name courseName status policy totalSessions').lean();
    const clsMap = {};
    classes.forEach((c) => { clsMap[String(c._id)] = c; });

    const sessions = await ClassSession.find({ classId: { $in: enrollments.map((e) => e.classId) } })
      .sort({ sessionNumber: 1 }).lean();
    const records = await AttendanceRecord.find({ studentId: req.user._id }).lean();
    const recMap = {};
    records.forEach((r) => { recMap[`${r.classId}:${r.sessionId}`] = r; });

    const out = enrollments.map((e) => {
      const c = clsMap[String(e.classId)];
      const clsSessions = sessions
        .filter((s) => String(s.classId) === String(e.classId) && s.type === 'regular')
        .map((s) => {
          const r = recMap[`${e.classId}:${s._id}`];
          return { sessionNumber: s.sessionNumber, date: s.date, sessionStatus: s.status, mark: r?.status || null };
        });
      return {
        enrollmentId: e._id,
        class: c ? { _id: c._id, name: c.name, courseName: c.courseName, status: c.status, totalSessions: c.totalSessions, policy: svc.withPolicyDefaults(c.policy) } : null,
        status: e.status,
        statusReason: e.statusReason || '',
        stats: e.stats || {},
        sessions: clsSessions,
      };
    });
    res.json({ success: true, enrollments: out });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Richer per-class summary for the student dashboard homepage (sĩ số lớp,
// tổng buổi học, số buổi nghỉ, số lần thiếu bài tập, ...) — deliberately its
// own endpoint rather than folded into myAttendanceStatus, which nav.js polls
// on EVERY page for EVERY logged-in student and should stay cheap; this one
// is only fetched once by dashboard.html.
exports.myOverview = async (req, res) => {
  try {
    const enrollments = await ClassEnrollment.find({ studentId: req.user._id, removedAt: null }).lean();
    if (!enrollments.length) return res.json({ success: true, hasClasses: false, classes: [] });

    const classIds = enrollments.map((e) => e.classId);
    const [classes, sizeAgg] = await Promise.all([
      ClassGroup.find({ _id: { $in: classIds } })
        .select('name courseName status policy totalSessions startDate endDate teacherId').lean(),
      ClassEnrollment.aggregate([
        { $match: { classId: { $in: classIds }, removedAt: null } },
        { $group: { _id: '$classId', count: { $sum: 1 } } },
      ]),
    ]);
    const activeClasses = classes.filter((c) => c.status === 'active');
    if (!activeClasses.length) return res.json({ success: true, hasClasses: false, classes: [] });

    const sizeMap = new Map(sizeAgg.map((r) => [String(r._id), r.count]));
    const teachers = await User.find({ _id: { $in: activeClasses.map((c) => c.teacherId) } })
      .select('username firstName lastName').lean();
    const teacherMap = new Map(teachers.map((t) => [String(t._id), t]));
    const clsMap = new Map(activeClasses.map((c) => [String(c._id), c]));

    const out = enrollments
      .map((e) => {
        const c = clsMap.get(String(e.classId));
        if (!c) return null;
        const p = svc.withPolicyDefaults(c.policy);
        const st = e.stats || {};
        return {
          classId: e.classId,
          className: c.name,
          courseName: c.courseName || '',
          teacherName: studentName(teacherMap.get(String(c.teacherId))) || '',
          startDate: c.startDate || null,
          endDate: c.endDate || null,
          totalSessions: c.totalSessions || 0,
          classSize: sizeMap.get(String(e.classId)) || 0,
          status: e.status,
          statusReason: e.statusReason || '',
          heldSessions: st.heldSessions || 0,
          absentTotal: (st.absentUnexcused || 0) + (st.absentExcused || 0),
          absenceEquivalent: st.absenceEquivalent || 0,
          attendanceRate: st.attendanceRate || 0,
          maxAbsencesAllowed: p.maxAbsencesAllowed,
          homeworkMissedCount: st.homeworkMissedCount || 0,
          homeworkWarnThreshold: p.homeworkWarnThreshold,
          homeworkFailThreshold: p.homeworkFailThreshold,
        };
      })
      .filter(Boolean);
    res.json({ success: true, hasClasses: out.length > 0, classes: out });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
