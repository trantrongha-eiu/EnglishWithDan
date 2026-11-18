'use strict';

// 🎤 Đăng kí thi Speaking (models/SpeakingExamSlot.js).
//
// Teacher side (class page tab "🎤 Thi Speaking", staffOnly + loadOwnedClass):
// enters free windows (ngày + từ giờ → đến giờ); each window is cut into
// back-to-back 25-minute slots = 15' thi + 10' feedback. Slots can be opened
// to several of the teacher's classes at once.
//
// A week's schedule can be copied to the following week (copyWeek — the free
// time only, never the bookings/results), and a week's still-open future slots
// removed in one go (clearWeek).
//
// Student side (classroom.html + "Lớp học của tôi" on the dashboard): ticks ONE
// open slot per class and picks online (Google Meet) / offline (tại nhà giáo
// viên); can swap to another open slot in one step (book + replaceBooking). The
// Meet link and the address are only ever sent to the student who booked.

const mongoose = require('mongoose');
const SpeakingExamSlot = require('../models/SpeakingExamSlot');
const ClassGroup = require('../models/ClassGroup');
const ClassEnrollment = require('../models/ClassEnrollment');
const Message = require('../models/Message');
const User = require('../models/User');
const { displayName } = require('../middleware/classAccess');
const logger = require('../utils/logger');

const EXAM_MIN = 15;
const FEEDBACK_MIN = 10;
const SLOT_MIN = EXAM_MIN + FEEDBACK_MIN;
// Booking / cancelling closes this long before the slot starts — after that
// the student has to contact the teacher (the teacher can still cancel).
const LOCK_HOURS = 2;
const LOCK_MS = LOCK_HOURS * 3600e3;
const MAX_SLOTS_PER_REQUEST = 200;
const MODES = ['online', 'offline'];
const MODE_LABEL = { online: 'Online qua Google Meet', offline: 'Offline tại nhà giáo viên' };

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const fromMin = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const vnInstant = (dayKey, time) => new Date(`${dayKey}T${time}:00+07:00`);
const addDays = (dayKey, n) => new Date(Date.parse(`${dayKey}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
// A real calendar day ("2026-02-31" is rejected, not rolled over).
function isDayKey(v) {
  if (!DAY_RE.test(v)) return false;
  const t = Date.parse(`${v}T00:00:00Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === v;
}
// Monday of the week containing dayKey (weeks run Monday → Sunday).
function weekStartOf(dayKey) {
  return addDays(dayKey, -((new Date(`${dayKey}T00:00:00Z`).getUTCDay() + 6) % 7));
}

function fmtDay(dayKey) {
  const d = new Date(`${dayKey}T00:00:00Z`);
  const wd = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getUTCDay()];
  return `${wd}, ${dayKey.slice(8, 10)}/${dayKey.slice(5, 7)}/${dayKey.slice(0, 4)}`;
}
const slotLabel = (s) => `${fmtDay(s.dayKey)} · ${s.startTime}–${s.endTime}`;

function cleanModes(v) {
  const list = [...new Set((Array.isArray(v) ? v : [v]).map(String))].filter((m) => MODES.includes(m));
  return list;
}
const cleanText = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

function cleanMeetLink(v) {
  const s = cleanText(v, 500);
  if (!s) return '';
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

// Personal message to the student (popup until read) — used when the teacher
// cancels or removes a slot the student had booked. Never blocks the action.
async function notifyStudent(sender, studentId, subject, body) {
  try {
    await Message.create({
      fromId: sender._id, fromName: sender.username, toId: studentId,
      subject, body, type: 'personal', mustRead: true,
    });
  } catch (e) {
    logger.error('speakingExam', 'notify student failed', { errorMessage: e.message });
  }
}

function staffSlotView(s, classNames) {
  const st = s.studentId && typeof s.studentId === 'object' && s.studentId._id ? s.studentId : null;
  return {
    _id: s._id,
    dayKey: s.dayKey,
    startTime: s.startTime,
    endTime: s.endTime,
    startsAt: s.startsAt,
    endsAt: s.endsAt,
    modes: s.modes,
    meetLink: s.meetLink,
    address: s.address,
    note: s.note,
    classIds: s.classIds,
    classNames: (s.classIds || []).map((id) => classNames.get(String(id))).filter(Boolean),
    booked: !!s.studentId,
    student: st ? { _id: st._id, name: displayName(st), username: st.username, email: st.email, phone: st.phone || '' } : null,
    bookedClassName: s.classId ? classNames.get(String(s.classId)) || '' : '',
    mode: s.mode,
    bookedAt: s.bookedAt,
    result: s.result,
    band: s.band,
    feedbackNote: s.feedbackNote,
  };
}

// Inserts the candidates that don't overlap this teacher's existing slots (any
// class) or an earlier candidate of the same batch.
async function insertFreeSlots(teacherId, createdBy, candidates) {
  const days = [...new Set(candidates.map((c) => c.dayKey))];
  const existing = days.length
    ? await SpeakingExamSlot.find({ teacherId, dayKey: { $in: days } }).select('startsAt endsAt').lean()
    : [];
  const taken = existing.map((s) => [s.startsAt.getTime(), s.endsAt.getTime()]);
  const docs = [];
  let skippedOverlap = 0;
  for (const c of candidates) {
    const s = c.startsAt.getTime();
    const e = c.endsAt.getTime();
    if (taken.some(([ts, te]) => s < te && ts < e)) { skippedOverlap += 1; continue; }
    taken.push([s, e]);
    docs.push({ ...c, teacherId, createdBy });
  }
  const created = docs.length ? await SpeakingExamSlot.insertMany(docs) : [];
  return { created: created.length, skippedOverlap };
}

// ── Staff ─────────────────────────────────────────────────────────────

// GET /api/classes/:classId/speaking-exam
exports.listSlots = async (req, res) => {
  try {
    const cls = req.classGroup;
    const [slots, teacherClasses] = await Promise.all([
      SpeakingExamSlot.find({ classIds: cls._id }).sort({ startsAt: 1 })
        .populate('studentId', 'username firstName lastName email phone').lean(),
      ClassGroup.find({ teacherId: cls.teacherId, status: 'active' }).select('name').sort({ name: 1 }).lean(),
    ]);
    const extraIds = new Set();
    slots.forEach((s) => [...(s.classIds || []), s.classId].filter(Boolean).forEach((id) => extraIds.add(String(id))));
    const known = new Map(teacherClasses.map((c) => [String(c._id), c.name]));
    known.set(String(cls._id), cls.name);
    const missing = [...extraIds].filter((id) => !known.has(id));
    if (missing.length) {
      (await ClassGroup.find({ _id: { $in: missing } }).select('name').lean()).forEach((c) => known.set(String(c._id), c.name));
    }
    // Pre-fill the form with what this teacher used last time.
    const last = await SpeakingExamSlot.findOne({ teacherId: cls.teacherId }).sort({ createdAt: -1 })
      .select('meetLink address modes').lean();
    res.json({
      success: true,
      slotMinutes: SLOT_MIN, examMinutes: EXAM_MIN, feedbackMinutes: FEEDBACK_MIN, lockHours: LOCK_HOURS,
      slots: slots.map((s) => staffSlotView(s, known)),
      teacherClasses: teacherClasses.map((c) => ({ _id: c._id, name: c.name })),
      defaults: { meetLink: last?.meetLink || '', address: last?.address || '', modes: last?.modes?.length ? last.modes : MODES },
    });
  } catch (err) {
    logger.error('speakingExam', 'listSlots failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/classes/:classId/speaking-exam
// { ranges: [{ date: 'YYYY-MM-DD', from: 'HH:mm', to: 'HH:mm' }], modes,
//   meetLink, address, note, classIds? }
exports.createSlots = async (req, res) => {
  try {
    const cls = req.classGroup;
    const b = req.body || {};
    const modes = cleanModes(b.modes);
    if (!modes.length) return res.status(400).json({ success: false, message: 'Chọn ít nhất 1 hình thức thi (online / offline)' });
    const meetLink = cleanMeetLink(b.meetLink);
    const address = cleanText(b.address, 500);
    const note = cleanText(b.note, 500);
    if (modes.includes('offline') && !address) {
      return res.status(400).json({ success: false, message: 'Thi offline cần địa chỉ nhà giáo viên' });
    }

    // Classes to open the slots to: always this class, plus any other ACTIVE
    // class of the same teacher (ids from the client are re-checked here).
    const wanted = [...new Set([String(cls._id), ...(Array.isArray(b.classIds) ? b.classIds.map(String) : [])])]
      .filter((id) => mongoose.isValidObjectId(id));
    const okClasses = await ClassGroup.find({ _id: { $in: wanted }, teacherId: cls.teacherId, status: 'active' }).select('_id').lean();
    const classIds = [cls._id, ...okClasses.map((c) => c._id).filter((id) => !id.equals(cls._id))];

    const ranges = Array.isArray(b.ranges) ? b.ranges : [];
    if (!ranges.length) return res.status(400).json({ success: false, message: 'Chưa có khung giờ nào' });

    const now = Date.now();
    const candidates = [];
    let skippedPast = 0;
    for (const r of ranges) {
      const date = String(r?.date || '');
      const from = String(r?.from || '');
      const to = String(r?.to || '');
      if (!isDayKey(date)) {
        return res.status(400).json({ success: false, message: `Ngày không hợp lệ: ${date || '(trống)'}` });
      }
      if (!TIME_RE.test(from) || !TIME_RE.test(to)) {
        return res.status(400).json({ success: false, message: `Giờ không hợp lệ (${date})` });
      }
      const a = toMin(from);
      const z = toMin(to);
      if (z - a < SLOT_MIN) {
        return res.status(400).json({ success: false, message: `Khung ${from}–${to} ngày ${date} ngắn hơn ${SLOT_MIN} phút (${EXAM_MIN}' thi + ${FEEDBACK_MIN}' feedback)` });
      }
      for (let t = a; t + SLOT_MIN <= z; t += SLOT_MIN) {
        const startTime = fromMin(t);
        const endTime = fromMin(t + SLOT_MIN);
        const startsAt = vnInstant(date, startTime);
        if (startsAt.getTime() <= now) { skippedPast += 1; continue; }
        candidates.push({ dayKey: date, startTime, endTime, startsAt, endsAt: vnInstant(date, endTime), classIds, modes, meetLink, address, note });
      }
    }
    if (candidates.length > MAX_SLOTS_PER_REQUEST) {
      return res.status(400).json({ success: false, message: `Tối đa ${MAX_SLOTS_PER_REQUEST} buổi mỗi lần tạo` });
    }

    const { created, skippedOverlap } = await insertFreeSlots(cls.teacherId, req.user._id, candidates);
    res.status(201).json({ success: true, created, skippedOverlap, skippedPast });
  } catch (err) {
    logger.error('speakingExam', 'createSlots failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/classes/:classId/speaking-exam/copy-week  { fromWeek: 'YYYY-MM-DD' }
// fromWeek = any day of the source week. Every slot of that week (open or
// booked — both are the teacher's free time) is re-created 7 days later with
// the same hours, formats, Meet link, address, note and classes. Bookings and
// results are NOT copied. Re-running is safe: what already exists is skipped.
exports.copyWeek = async (req, res) => {
  try {
    const cls = req.classGroup;
    const from = String(req.body?.fromWeek || '');
    if (!isDayKey(from)) return res.status(400).json({ success: false, message: 'Tuần cần copy không hợp lệ' });
    const fromWeek = weekStartOf(from);
    const toWeek = addDays(fromWeek, 7);
    const [source, active] = await Promise.all([
      SpeakingExamSlot.find({ classIds: cls._id, dayKey: { $gte: fromWeek, $lte: addDays(fromWeek, 6) } }).sort({ startsAt: 1 }).lean(),
      ClassGroup.find({ teacherId: cls.teacherId, status: 'active' }).select('_id').lean(),
    ]);
    if (!source.length) return res.status(400).json({ success: false, message: 'Tuần này chưa có buổi thi nào để copy' });

    const activeIds = new Set(active.map((c) => String(c._id)));
    const now = Date.now();
    const candidates = [];
    let skippedPast = 0;
    for (const s of source) {
      const dayKey = addDays(s.dayKey, 7);
      const startsAt = vnInstant(dayKey, s.startTime);
      if (startsAt.getTime() <= now) { skippedPast += 1; continue; }
      candidates.push({
        dayKey, startTime: s.startTime, endTime: s.endTime, startsAt, endsAt: vnInstant(dayKey, s.endTime),
        // this class + whichever other classes are still running
        classIds: [cls._id, ...(s.classIds || []).filter((id) => !id.equals(cls._id) && activeIds.has(String(id)))],
        modes: s.modes, meetLink: s.meetLink, address: s.address, note: s.note,
      });
    }
    const { created, skippedOverlap } = await insertFreeSlots(cls.teacherId, req.user._id, candidates);
    res.status(201).json({ success: true, fromWeek, toWeek, sourceCount: source.length, created, skippedOverlap, skippedPast });
  } catch (err) {
    logger.error('speakingExam', 'copyWeek failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/classes/:classId/speaking-exam/clear-week  { week: 'YYYY-MM-DD' }
// Removes the week's future slots nobody has booked (e.g. a copy made by
// mistake). Booked and past slots always stay.
exports.clearWeek = async (req, res) => {
  try {
    const cls = req.classGroup;
    const day = String(req.body?.week || '');
    if (!isDayKey(day)) return res.status(400).json({ success: false, message: 'Tuần không hợp lệ' });
    const week = weekStartOf(day);
    const out = await SpeakingExamSlot.deleteMany({
      classIds: cls._id, dayKey: { $gte: week, $lte: addDays(week, 6) }, studentId: null, startsAt: { $gt: new Date() },
    });
    res.json({ success: true, week, deleted: out.deletedCount || 0 });
  } catch (err) {
    logger.error('speakingExam', 'clearWeek failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

async function loadClassSlot(req, res) {
  const slot = await SpeakingExamSlot.findOne({ _id: req.params.slotId, classIds: req.classGroup._id });
  if (!slot) {
    res.status(404).json({ success: false, message: 'Không tìm thấy buổi thi' });
    return null;
  }
  return slot;
}

// PUT /api/classes/:classId/speaking-exam/:slotId
// { meetLink?, address?, note?, modes?, result?, band?, feedbackNote?, cancelBooking? }
exports.updateSlot = async (req, res) => {
  try {
    const slot = await loadClassSlot(req, res);
    if (!slot) return;
    const b = req.body || {};

    if (b.cancelBooking) {
      if (!slot.studentId) return res.status(400).json({ success: false, message: 'Buổi này chưa có ai đăng kí' });
      const studentId = slot.studentId;
      const reason = cleanText(b.reason, 500);
      slot.studentId = null; slot.classId = null; slot.mode = null; slot.bookedAt = null;
      slot.result = ''; slot.band = null; slot.feedbackNote = '';
      await slot.save();
      if (slot.startsAt.getTime() > Date.now()) {
        await notifyStudent(req.user, studentId, '🎤 Buổi thi Speaking đã bị hủy',
          `Giáo viên đã hủy buổi thi Speaking bạn đăng kí (${slotLabel(slot)}).${reason ? `\nLý do: ${reason}` : ''}\nBạn hãy vào mục "Lớp học" → "Thi Speaking" để chọn buổi khác.`);
      }
      return res.json({ success: true });
    }

    if (b.meetLink !== undefined) slot.meetLink = cleanMeetLink(b.meetLink);
    if (b.address !== undefined) slot.address = cleanText(b.address, 500);
    if (b.note !== undefined) slot.note = cleanText(b.note, 500);
    if (b.modes !== undefined) {
      const modes = cleanModes(b.modes);
      if (!modes.length) return res.status(400).json({ success: false, message: 'Chọn ít nhất 1 hình thức thi' });
      if (slot.mode && !modes.includes(slot.mode)) {
        return res.status(400).json({ success: false, message: 'Học viên đã đăng kí hình thức này — không bỏ được' });
      }
      slot.modes = modes;
    }
    if (slot.modes.includes('offline') && !slot.address) {
      return res.status(400).json({ success: false, message: 'Thi offline cần địa chỉ nhà giáo viên' });
    }
    if (b.result !== undefined || b.band !== undefined || b.feedbackNote !== undefined) {
      if (!slot.studentId) return res.status(400).json({ success: false, message: 'Buổi này chưa có học viên đăng kí' });
      if (b.result !== undefined) {
        if (!['', 'done', 'no_show'].includes(b.result)) return res.status(400).json({ success: false, message: 'Kết quả không hợp lệ' });
        slot.result = b.result;
      }
      if (b.band !== undefined) {
        if (b.band === null || b.band === '') slot.band = null;
        else {
          const band = Number(b.band);
          if (!Number.isFinite(band) || band < 0 || band > 9 || Math.round(band * 2) !== band * 2) {
            return res.status(400).json({ success: false, message: 'Band phải từ 0 đến 9, bước 0.5' });
          }
          slot.band = band;
        }
      }
      if (b.feedbackNote !== undefined) slot.feedbackNote = cleanText(b.feedbackNote, 3000);
    }
    await slot.save();
    res.json({ success: true });
  } catch (err) {
    logger.error('speakingExam', 'updateSlot failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// DELETE /api/classes/:classId/speaking-exam/:slotId
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await loadClassSlot(req, res);
    if (!slot) return;
    const { studentId } = slot;
    const future = slot.startsAt.getTime() > Date.now();
    await SpeakingExamSlot.deleteOne({ _id: slot._id });
    if (studentId && future) {
      await notifyStudent(req.user, studentId, '🎤 Buổi thi Speaking đã bị hủy',
        `Giáo viên đã hủy buổi thi Speaking bạn đăng kí (${slotLabel(slot)}).\nBạn hãy vào mục "Lớp học" → "Thi Speaking" để chọn buổi khác.`);
    }
    res.json({ success: true });
  } catch (err) {
    logger.error('speakingExam', 'deleteSlot failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── Student ───────────────────────────────────────────────────────────

// The student's live enrollments in ACTIVE classes → [{ classId, name, teacherId }].
async function studentClasses(studentId) {
  const enr = await ClassEnrollment.find({ studentId, removedAt: null, status: { $nin: ['dropped'] } }).select('classId').lean();
  if (!enr.length) return [];
  return ClassGroup.find({ _id: { $in: enr.map((e) => e.classId) }, status: 'active' }).select('name teacherId').lean();
}

function openSlotView(s) {
  return { _id: s._id, dayKey: s.dayKey, startTime: s.startTime, endTime: s.endTime, startsAt: s.startsAt, modes: s.modes, note: s.note };
}

function bookingView(s) {
  const canCancel = !s.result && s.startsAt.getTime() - Date.now() > LOCK_MS;
  return {
    _id: s._id, dayKey: s.dayKey, startTime: s.startTime, endTime: s.endTime, startsAt: s.startsAt, endsAt: s.endsAt,
    mode: s.mode, modeLabel: MODE_LABEL[s.mode] || '',
    meetLink: s.mode === 'online' ? s.meetLink : '',
    address: s.mode === 'offline' ? s.address : '',
    note: s.note,
    upcoming: s.endsAt.getTime() > Date.now() && !s.result,
    canCancel,
    result: s.result, band: s.band, feedbackNote: s.feedbackNote,
  };
}

// GET /api/classes/my/speaking-exam
exports.myOverview = async (req, res) => {
  try {
    const classes = await studentClasses(req.user._id);
    if (!classes.length) return res.json({ success: true, classes: [] });
    const classIds = classes.map((c) => c._id);
    const lockEdge = new Date(Date.now() + LOCK_MS);
    const [open, mine, teachers] = await Promise.all([
      SpeakingExamSlot.find({ classIds: { $in: classIds }, studentId: null, startsAt: { $gt: lockEdge } })
        .sort({ startsAt: 1 }).limit(500).lean(),
      SpeakingExamSlot.find({ studentId: req.user._id, classId: { $in: classIds } }).sort({ startsAt: -1 }).limit(50).lean(),
      User.find({ _id: { $in: classes.map((c) => c.teacherId) } }).select('username firstName lastName').lean(),
    ]);
    const teacherMap = new Map(teachers.map((t) => [String(t._id), displayName(t)]));
    const out = classes.map((c) => {
      const id = String(c._id);
      const bookings = mine.filter((s) => String(s.classId) === id).map(bookingView);
      return {
        classId: c._id,
        className: c.name,
        teacherName: teacherMap.get(String(c.teacherId)) || '',
        openSlots: open.filter((s) => s.classIds.some((x) => String(x) === id)).map(openSlotView),
        booking: bookings.find((b) => b.upcoming) || null,
        history: bookings.filter((b) => !b.upcoming).slice(0, 5),
      };
    });
    res.json({
      success: true, slotMinutes: SLOT_MIN, examMinutes: EXAM_MIN, feedbackMinutes: FEEDBACK_MIN, lockHours: LOCK_HOURS,
      classes: out,
    });
  } catch (err) {
    logger.error('speakingExam', 'myOverview failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/classes/my/speaking-exam/:slotId/book
// { mode: 'online'|'offline', replaceBooking?: true }
// replaceBooking = "đổi buổi": the new slot is claimed FIRST and the old one
// released only after that, so a slot lost to a classmate never costs the
// student the booking they already had.
exports.book = async (req, res) => {
  try {
    const slot = await SpeakingExamSlot.findById(req.params.slotId).lean();
    if (!slot) return res.status(404).json({ success: false, message: 'Không tìm thấy buổi thi' });
    const mode = String(req.body?.mode || '');
    if (!MODES.includes(mode) || !slot.modes.includes(mode)) {
      return res.status(400).json({ success: false, message: 'Hãy chọn hình thức thi giáo viên cho phép' });
    }
    const classes = await studentClasses(req.user._id);
    const cls = classes.find((c) => slot.classIds.some((x) => String(x) === String(c._id)));
    if (!cls) return res.status(403).json({ success: false, message: 'Buổi thi này không thuộc lớp của bạn' });
    if (slot.startsAt.getTime() - Date.now() <= LOCK_MS) {
      return res.status(400).json({ success: false, message: `Chỉ đăng kí được trước giờ thi ít nhất ${LOCK_HOURS} tiếng` });
    }
    if (slot.studentId) {
      return res.status(409).json({ success: false, message: String(slot.studentId) === String(req.user._id) ? 'Bạn đã đăng kí buổi này rồi' : 'Buổi này đã có bạn khác đăng kí — chọn buổi khác nhé' });
    }
    const existing = await SpeakingExamSlot.findOne({
      studentId: req.user._id, classId: cls._id, result: '', endsAt: { $gt: new Date() },
    }).lean();
    if (existing && !req.body?.replaceBooking) {
      return res.status(409).json({ success: false, message: `Bạn đã đăng kí buổi ${slotLabel(existing)} — hủy buổi đó trước khi chọn buổi khác` });
    }
    if (existing && existing.startsAt.getTime() - Date.now() <= LOCK_MS) {
      return res.status(400).json({ success: false, message: `Chỉ đổi được trước giờ thi ít nhất ${LOCK_HOURS} tiếng — hãy nhắn giáo viên` });
    }
    const updated = await SpeakingExamSlot.findOneAndUpdate(
      { _id: slot._id, studentId: null },
      { $set: { studentId: req.user._id, classId: cls._id, mode, bookedAt: new Date(), result: '', band: null, feedbackNote: '' } },
      { returnDocument: 'after' },
    ).lean();
    if (!updated) return res.status(409).json({ success: false, message: 'Buổi này vừa có bạn khác đăng kí — chọn buổi khác nhé' });
    if (existing) {
      await SpeakingExamSlot.updateOne(
        { _id: existing._id, studentId: req.user._id, result: '' },
        { $set: { studentId: null, classId: null, mode: null, bookedAt: null } },
      );
    }
    res.json({ success: true, booking: bookingView(updated) });
  } catch (err) {
    logger.error('speakingExam', 'book failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/classes/my/speaking-exam/:slotId/cancel
exports.cancel = async (req, res) => {
  try {
    const slot = await SpeakingExamSlot.findOne({ _id: req.params.slotId, studentId: req.user._id });
    if (!slot) return res.status(404).json({ success: false, message: 'Bạn chưa đăng kí buổi này' });
    if (slot.result) return res.status(400).json({ success: false, message: 'Buổi thi đã kết thúc' });
    if (slot.startsAt.getTime() - Date.now() <= LOCK_MS) {
      return res.status(400).json({ success: false, message: `Chỉ hủy được trước giờ thi ít nhất ${LOCK_HOURS} tiếng — hãy nhắn giáo viên` });
    }
    const ok = await SpeakingExamSlot.updateOne(
      { _id: slot._id, studentId: req.user._id, result: '' },
      { $set: { studentId: null, classId: null, mode: null, bookedAt: null } },
    );
    if (!ok.modifiedCount) return res.status(409).json({ success: false, message: 'Không hủy được — tải lại trang và thử lại' });
    res.json({ success: true });
  } catch (err) {
    logger.error('speakingExam', 'cancel failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports._internals = { SLOT_MIN, EXAM_MIN, FEEDBACK_MIN, LOCK_HOURS };
