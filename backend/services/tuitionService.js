'use strict';

// Extracted from routes/tuition.js, verbatim logic.
const cloudinaryService = require('./cloudinaryService');
const TuitionFee = require('../models/TuitionFee');
const TuitionSettings = require('../models/TuitionSettings');
const Message = require('../models/Message');
const User = require('../models/User');
const emailService = require('./emailService');
const { escapeHtml } = require('../utils/escapeHtml');
const ClassGroup = require('../models/ClassGroup');
const ClassEnrollment = require('../models/ClassEnrollment');
const { vnTodayKey } = require('../utils/classProgress');
const { escapeRegex } = require('../utils/strings');

// Shared by every tuition-reminder sender — sendReminder, sendBulkReminders
// below, and cron/tuitionReminder.js's daily auto-remind — so there's one
// wording to update instead of three drifted copies. buildReminderBody picks
// the single-fee wording when there's exactly one fee (the common case for
// a per-fee or per-month-bulk reminder) and an itemized multi-fee wording
// otherwise (the cron's "everything this student owes" case).
function feeLabel(fee) {
  return fee.feeType === 'monthly' ? `tháng ${fee.month}/${fee.year}` : `khóa "${fee.courseName}"`;
}
function fmtVNDAmount(amount) {
  return Number(amount || 0).toLocaleString('vi-VN');
}
function buildReminderBody(fees) {
  if (fees.length === 1) {
    const fee = fees[0];
    return `📢 Nhắc nhở học phí\n\nBạn còn khoản học phí chưa thanh toán:\n• Kỳ: ${feeLabel(fee)}\n• Số tiền: ${fmtVNDAmount(fee.amount)} VND\n\nVui lòng vào trang Hồ sơ → Học phí để xem thông tin chuyển khoản và xác nhận thanh toán.\n\nCảm ơn bạn! 🙏`;
  }
  const lines = fees.map(f => `• ${feeLabel(f)}: ${fmtVNDAmount(f.amount)} VND`).join('\n');
  const total = fees.reduce((s, f) => s + (f.amount || 0), 0);
  return `📢 Nhắc nhở học phí\n\nBạn đang có ${fees.length} khoản học phí chưa thanh toán:\n${lines}\n\nTổng cộng: ${fmtVNDAmount(total)} VND\n\nVui lòng vào trang Hồ sơ → Học phí để xem thông tin chuyển khoản và xác nhận thanh toán.\n\nCảm ơn bạn! 🙏`;
}

// Additive notification channel for tuition reminders — the in-app Message
// (above/below call sites) is still created unconditionally either way; this
// is best-effort only, so a student who never checks the inbox still hears
// about an unpaid fee. Does NOT touch the payment/confirmation flow itself,
// which stays fully manual (see docs/PRODUCT_FEATURE_AUDIT.md).
async function sendTuitionReminderEmail(student, fees, customMessage) {
  if (!student?.email) return;
  const bodyText = customMessage || buildReminderBody(fees);
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8f9fb;padding:32px 24px;border-radius:12px">
      <div style="text-align:center;margin-bottom:20px;font-size:20px;font-weight:800">
        <span style="color:#3d8bff">Daniel</span><span style="color:#e53935">Hà</span>
      </div>
      <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e5e7eb;white-space:pre-line;color:#111;font-size:14px;line-height:1.7">
        ${escapeHtml(bodyText)}
      </div>
    </div>`;
  await emailService.sendEmail(student.email, 'Nhắc nhở học phí — EnglishWithDan', html);
}

// Shared by sendReminder/sendBulkReminders/cron's runReminders — the one
// tracked counter for "this student got nudged about unpaid tuition",
// mirroring routes/admin/users.js's studyReminderCount pattern (see
// User.js's tuitionReminderCount field comment).
async function bumpTuitionReminderCount(studentId) {
  await User.findByIdAndUpdate(studentId, { $inc: { tuitionReminderCount: 1 } });
}

// Called after a fee is marked paid or deleted — if the student has no
// unpaid fees left, the nag is resolved, so clear the counter automatically
// (unlike studyReminderCount, "caught up" has no ambiguity here, so this
// doesn't need a manual admin reset button).
async function resetTuitionReminderCountIfCaughtUp(studentId) {
  const remaining = await TuitionFee.countDocuments({ studentId, isPaid: false });
  if (remaining === 0) await User.findByIdAndUpdate(studentId, { tuitionReminderCount: 0 });
}

async function getSettings() {
  return TuitionSettings.getSingleton();
}

async function updateSettings(body) {
  const { bankName, bankAccount, accountName, defaultMonthlyFee, paymentNote,
          autoRemindEnabled, autoRemindDay, autoRemindEndMonth, autoRemindEndYear } = body;
  const s = await TuitionSettings.getSingleton();
  if (bankName    !== undefined) s.bankName    = bankName;
  if (bankAccount !== undefined) s.bankAccount = bankAccount;
  if (accountName !== undefined) s.accountName = accountName;
  if (defaultMonthlyFee !== undefined) s.defaultMonthlyFee = Number(defaultMonthlyFee);
  if (paymentNote !== undefined) s.paymentNote = paymentNote;
  if (autoRemindEnabled  !== undefined) s.autoRemindEnabled  = Boolean(autoRemindEnabled);
  if (autoRemindDay      !== undefined) s.autoRemindDay      = Number(autoRemindDay) || 10;
  if (autoRemindEndMonth !== undefined) s.autoRemindEndMonth = autoRemindEndMonth ? Number(autoRemindEndMonth) : null;
  if (autoRemindEndYear  !== undefined) s.autoRemindEndYear  = autoRemindEndYear  ? Number(autoRemindEndYear)  : null;
  await s.save();
  return s;
}

async function uploadQr(file) {
  const s = await TuitionSettings.getSingleton();
  if (s.qrImagePublicId) {
    await cloudinaryService.destroyAsset(s.qrImagePublicId);
  }
  const result = await cloudinaryService.uploadBufferAsDataUri(file.buffer, file.mimetype, {
    folder: 'tuition-qr',
    public_id: `qr_${Date.now()}`,
  });
  s.qrImageUrl      = result.secure_url;
  s.qrImagePublicId = result.public_id;
  await s.save();
  return s.qrImageUrl;
}

async function deleteQr() {
  const s = await TuitionSettings.getSingleton();
  if (s.qrImagePublicId) {
    await cloudinaryService.destroyAsset(s.qrImagePublicId);
  }
  s.qrImageUrl = ''; s.qrImagePublicId = '';
  await s.save();
}

// Free-text search for the fee list: every word must hit the student's
// username/email/first/last name (so "Bùi Tuấn" finds firstName "Bùi" +
// lastName "Tuấn"), or the whole text hits the fee's course name / note.
async function feeSearchFilter(q) {
  const text = String(q).trim().slice(0, 100);
  const words = text.split(/\s+/);
  const users = await User.find({
    $and: words.map(w => {
      const rx = new RegExp(escapeRegex(w), 'i');
      return { $or: [{ username: rx }, { email: rx }, { firstName: rx }, { lastName: rx }] };
    }),
  }).select('_id').limit(500).lean();
  const rx = new RegExp(escapeRegex(text), 'i');
  return { $or: [{ studentId: { $in: users.map(u => u._id) } }, { courseName: rx }, { note: rx }] };
}

async function listFees(query) {
  const { studentId, month, year, feeType, isPaid, studentNotified, q, page = 1, limit = 50 } = query;
  const filter = {};
  if (q && String(q).trim()) Object.assign(filter, await feeSearchFilter(q));
  if (studentId) filter.studentId = studentId;
  if (month)     filter.month     = Number(month);
  if (year)      filter.year      = Number(year);
  if (feeType)   filter.feeType   = feeType;
  if (isPaid !== undefined && isPaid !== '') filter.isPaid = isPaid === 'true';
  if (studentNotified !== undefined && studentNotified !== '') filter.studentNotified = studentNotified === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const [total, fees, aggStats] = await Promise.all([
    TuitionFee.countDocuments(filter),
    TuitionFee.find(filter)
      .populate('studentId', 'username email firstName lastName tuitionReminderCount')
      .sort({ year: -1, month: -1, createdAt: -1 })
      .skip(skip).limit(Number(limit)).lean(),
    TuitionFee.aggregate([
      { $match: filter },
      { $group: {
        _id: null,
        totalAmount:   { $sum: '$amount' },
        paidAmount:    { $sum: { $cond: ['$isPaid', '$amount', 0] } },
        pendingNotify: { $sum: { $cond: [{ $and: [{ $eq: ['$studentNotified', true] }, { $eq: ['$isPaid', false] }] }, 1, 0] } }
      }}
    ])
  ]);
  const stats = aggStats[0] || { totalAmount: 0, paidAmount: 0, pendingNotify: 0 };
  return { fees, total, stats };
}

async function getSummary(year) {
  const matchYear = year ? { year: Number(year), feeType: 'monthly' } : { feeType: 'monthly' };
  // Independent aggregations over the same collection — safe to run in parallel.
  const [summary, courseSummary] = await Promise.all([
    TuitionFee.aggregate([
      { $match: matchYear },
      { $group: {
        _id: { year: '$year', month: '$month' },
        totalAmount:   { $sum: '$amount' },
        paidAmount:    { $sum: { $cond: ['$isPaid', '$amount', 0] } },
        unpaidAmount:  { $sum: { $cond: ['$isPaid', 0, '$amount'] } },
        totalCount:    { $sum: 1 },
        paidCount:     { $sum: { $cond: ['$isPaid', 1, 0] } },
        unpaidCount:   { $sum: { $cond: ['$isPaid', 0, 1] } },
        pendingNotify: { $sum: { $cond: [{ $and: ['$studentNotified', { $not: '$isPaid' }] }, 1, 0] } },
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 24 }
    ]),
    TuitionFee.aggregate([
      { $match: { feeType: 'course' } },
      { $group: {
        _id: '$courseName',
        totalAmount: { $sum: '$amount' },
        paidAmount:  { $sum: { $cond: ['$isPaid', '$amount', 0] } },
        totalCount:  { $sum: 1 },
        paidCount:   { $sum: { $cond: ['$isPaid', 1, 0] } },
      }}
    ])
  ]);
  return { summary, courseSummary };
}

async function getAdminSummary() {
  const unpaidStudents = await TuitionFee.distinct('studentId', { isPaid: false });
  return unpaidStudents.length;
}

// Cross-period unpaid total per student — Tuition.jsx's "⚠️ Tổng nợ" badge
// used to derive this by summing only whatever `fees` page/filter (usually
// a single month) happened to already be loaded, understating real arrears
// for any student owing across multiple months/courses. Scoped to isPaid:
// false only, no month/year filter, so it always reflects true total debt.
async function getUnpaidByStudent() {
  const rows = await TuitionFee.aggregate([
    { $match: { isPaid: false } },
    { $group: { _id: '$studentId', total: { $sum: '$amount' } } },
  ]);
  const map = {};
  for (const r of rows) map[String(r._id)] = r.total;
  return map;
}

async function listStudents() {
  return User.find({ role: { $in: ['student', 'teacher'] } }, 'username email firstName lastName').sort('username').lean();
}

async function createFee({ studentId, feeType, month, year, courseName, amount, note, createdBy }) {
  const fee = await TuitionFee.create({
    studentId, feeType,
    month: feeType === 'monthly' ? Number(month) : undefined,
    year:  feeType === 'monthly' ? Number(year)  : undefined,
    courseName: feeType === 'course' ? courseName : '',
    amount: Number(amount),
    note: note || '',
    createdBy,
  });
  return fee.populate('studentId', 'username email firstName lastName');
}

// "Nhập N tháng" from the admin forms: one monthly record per month, starting
// at month/year and rolling over December — NOT one record of amount×N, so
// per-month summary, reminders and "đã thu" stay per month as before. Months
// that already have a fee for this student are skipped (the unique index
// would reject them) and reported back rather than failing the whole batch.
const MAX_MONTH_COUNT = 24;
async function createMonthlyFees({ studentId, month, year, monthCount, amount, note, createdBy }) {
  const count = Math.min(MAX_MONTH_COUNT, Math.max(1, Math.floor(Number(monthCount) || 1)));
  const periods = [];
  let m = Number(month), y = Number(year);
  for (let i = 0; i < count; i++) {
    periods.push({ month: m, year: y });
    if (++m > 12) { m = 1; y += 1; }
  }
  const existing = await TuitionFee.find({
    studentId, feeType: 'monthly', $or: periods,
  }).select('month year').lean();
  const taken = new Set(existing.map(f => `${f.month}/${f.year}`));
  const toCreate = periods.filter(p => !taken.has(`${p.month}/${p.year}`));
  const fees = toCreate.length
    ? await TuitionFee.insertMany(toCreate.map(p => ({
      studentId, feeType: 'monthly', month: p.month, year: p.year,
      amount: Number(amount), note: note || '', createdBy,
    })))
    : [];
  return { fees, skipped: periods.filter(p => taken.has(`${p.month}/${p.year}`)) };
}

// Admin popup "học sinh đang học trong lớp mà chưa nhập học phí". A student
// counts when they have a live enrollment (not removed, status active/warning)
// in an active class that hasn't ended, and NEITHER
//   - a monthly fee for the billing month — this month (VN time), or the
//     class's start month if the class hasn't started yet; NOR
//   - a course fee created since they enrolled (60 days of slack before
//     enrolledAt: course fees are often entered before the student is
//     added to the class roster).
// One row per student, listing every class that put them on the list.
const COURSE_FEE_SLACK_MS = 60 * 864e5;
const LIVE_ENROLLMENT = ['active', 'warning'];

function classBillingPeriod(cls, todayKey) {
  const startKey = cls.startDate ? vnTodayKey(new Date(cls.startDate)) : null;
  const key = startKey && startKey > todayKey ? startKey : todayKey;
  return { month: Number(key.slice(5, 7)), year: Number(key.slice(0, 4)) };
}

// The fees (of one student) that cover an enrollment for a billing month.
function coveringFees(fees, enrolledAt, { month, year }) {
  const since = new Date(enrolledAt || 0).getTime() - COURSE_FEE_SLACK_MS;
  return fees.filter(f => (f.feeType === 'monthly'
    ? f.month === month && f.year === year
    : new Date(f.createdAt).getTime() >= since));
}

function groupFeesByStudent(fees) {
  const map = new Map();
  for (const f of fees) {
    const sid = String(f.studentId);
    if (!map.has(sid)) map.set(sid, []);
    map.get(sid).push(f);
  }
  return map;
}

async function getClassStudentsMissingTuition(now = new Date()) {
  const todayKey = vnTodayKey(now);
  const classes = await ClassGroup.find({
    status: 'active',
    $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: new Date(`${todayKey}T00:00:00Z`) } }],
  }).select('name startDate').lean();
  if (!classes.length) return [];
  const classById = new Map(classes.map(c => [String(c._id), c]));

  const enrollments = await ClassEnrollment.find({
    classId: { $in: classes.map(c => c._id) },
    removedAt: null,
    status: { $in: LIVE_ENROLLMENT },
  }).select('classId studentId enrolledAt').lean();
  if (!enrollments.length) return [];

  const studentIds = [...new Set(enrollments.map(e => String(e.studentId)))];
  const feesByStudent = groupFeesByStudent(await TuitionFee.find({ studentId: { $in: studentIds } })
    .select('studentId feeType month year createdAt').lean());

  const byStudent = new Map();
  for (const e of enrollments) {
    const cls = classById.get(String(e.classId));
    const { month, year } = classBillingPeriod(cls, todayKey);
    const sid = String(e.studentId);
    if (coveringFees(feesByStudent.get(sid) || [], e.enrolledAt, { month, year }).length) continue;
    if (!byStudent.has(sid)) byStudent.set(sid, { studentId: sid, month, year, classes: [] });
    byStudent.get(sid).classes.push({ classId: String(cls._id), name: cls.name });
  }
  if (!byStudent.size) return [];

  const users = await User.find({ _id: { $in: [...byStudent.keys()] }, role: 'student' })
    .select('username email firstName lastName').lean();
  return users
    .map(u => ({ ...byStudent.get(String(u._id)), username: u.username, email: u.email, firstName: u.firstName, lastName: u.lastName }))
    .sort((a, b) => (a.username || '').localeCompare(b.username || ''));
}

// Class page "Học phí" tab (the class's teacher, or admin): every live
// student in the class with their tuition status for a billing month —
// 'missing' (no fee entered that covers it, same rule as above), 'unpaid'
// (a covering fee isn't paid yet) or 'paid' — plus their total unpaid debt
// across all fees. Defaults to the class's billing month.
const CLASS_TUITION_ORDER = { missing: 0, unpaid: 1, paid: 2 };
async function getClassTuition(cls, { month, year } = {}, now = new Date()) {
  const period = Number(month) >= 1 && Number(month) <= 12 && Number(year)
    ? { month: Number(month), year: Number(year) }
    : classBillingPeriod(cls, vnTodayKey(now));
  const enrollments = await ClassEnrollment.find({ classId: cls._id, removedAt: null, status: { $in: LIVE_ENROLLMENT } })
    .populate('studentId', 'username email firstName lastName role')
    .select('studentId status enrolledAt').lean();
  const live = enrollments.filter(e => e.studentId?.role === 'student');
  const feesByStudent = groupFeesByStudent(await TuitionFee.find({ studentId: { $in: live.map(e => e.studentId._id) } })
    .select('studentId feeType month year courseName amount isPaid paidDate studentNotified createdAt').lean());

  const students = live.map(e => {
    const u = e.studentId;
    const mine = feesByStudent.get(String(u._id)) || [];
    const fees = coveringFees(mine, e.enrolledAt, period);
    const unpaid = mine.filter(f => !f.isPaid);
    return {
      studentId: String(u._id), username: u.username, email: u.email, firstName: u.firstName, lastName: u.lastName,
      enrollmentStatus: e.status, enrolledAt: e.enrolledAt,
      status: !fees.length ? 'missing' : fees.some(f => !f.isPaid) ? 'unpaid' : 'paid',
      fees,
      unpaidTotal: unpaid.reduce((s, f) => s + (f.amount || 0), 0),
      unpaidCount: unpaid.length,
    };
  }).sort((a, b) => CLASS_TUITION_ORDER[a.status] - CLASS_TUITION_ORDER[b.status]
    || (a.username || '').localeCompare(b.username || ''));
  return { period, students };
}

async function updateFee(id, body, sender) {
  const { amount, isPaid, note, courseName, month, year, feeType } = body;
  const fee = await TuitionFee.findById(id);
  if (!fee) return null;

  const amountChanged = amount !== undefined && Number(amount) !== fee.amount;
  const monthChanged  = month  !== undefined && Number(month)  !== fee.month;
  const yearChanged   = year   !== undefined && Number(year)   !== fee.year;
  const justMarkedPaid = isPaid === true && !fee.isPaid; // false→true transition only

  if (amount     !== undefined) fee.amount     = Number(amount);
  if (isPaid     !== undefined) {
    fee.isPaid = isPaid;
    if (isPaid && !fee.paidDate) fee.paidDate = new Date();
    if (!isPaid) fee.paidDate = undefined;
  }
  if (note       !== undefined) fee.note       = note;
  if (courseName !== undefined) fee.courseName = courseName;
  if (month      !== undefined) fee.month      = Number(month);
  if (year       !== undefined) fee.year       = Number(year);
  // Was never read here — the "Loại học phí" select in Tuition.jsx's edit
  // form let the admin change it, save, and get a success toast, while the
  // record silently kept its old feeType (and, if switching monthly→course,
  // kept showing/filtering under its old month/year with the newly-typed
  // courseName orphaned on the record with nothing referencing it).
  if (feeType    !== undefined) fee.feeType    = feeType;

  // Fee details changed after the student already confirmed payment under the
  // old figures — clear that confirmation so admin doesn't mistake it for
  // confirmation of the new amount/period.
  if (!fee.isPaid && fee.studentNotified && (amountChanged || monthChanged || yearChanged)) {
    fee.studentNotified = false;
    fee.studentNotifiedAt = null;
  }

  await fee.save();

  // Previously the student only found out payment was confirmed by
  // revisiting the page and seeing the badge change — no message either
  // direction, unlike notifyPayment() below (student→admin). Mirrors that
  // with an admin→student confirmation, firing only on the actual
  // false→true transition so routine later edits don't re-notify (student
  // UI audit, Nhóm 3, 2026-07-25).
  if (justMarkedPaid && sender) {
    await Message.create({
      fromId: sender._id,
      fromName: sender.username,
      toId: fee.studentId,
      subject: `Đã xác nhận thanh toán học phí ${feeLabel(fee)}`,
      body: `✅ Học phí của bạn đã được xác nhận thanh toán:\n• Kỳ: ${feeLabel(fee)}\n• Số tiền: ${fmtVNDAmount(fee.amount)} VND\n\nCảm ơn bạn! 🙏`,
      type: 'personal',
    });
  }
  if (justMarkedPaid) await resetTuitionReminderCountIfCaughtUp(fee.studentId);

  return fee.populate('studentId', 'username email firstName lastName');
}

async function deleteFee(id) {
  const fee = await TuitionFee.findByIdAndDelete(id);
  // Deleting an unpaid fee (e.g. it was created by mistake) can itself
  // resolve the "still owes money" nag, same as marking it paid.
  if (fee && !fee.isPaid) await resetTuitionReminderCountIfCaughtUp(fee.studentId);
}

async function sendReminder(feeId, customMessage, sender) {
  const fee = await TuitionFee.findById(feeId).populate('studentId', 'username email').lean();
  if (!fee) return null;
  await Message.create({
    fromId: sender._id,
    fromName: sender.username,
    toId: fee.studentId._id,
    subject: `Nhắc nhở học phí ${feeLabel(fee)}`,
    body: customMessage || buildReminderBody([fee]),
    type: 'reminder',
  });
  // Fire-and-forget: a fresh SMTP connection per send (see emailService.js)
  // can genuinely take a few seconds, and awaiting it here was making the
  // admin's "Đang gửi..." button hang the whole time for a channel that's
  // already documented as best-effort/fail-open — the in-app Message above
  // is the guaranteed notification, this is purely additive.
  sendTuitionReminderEmail(fee.studentId, [fee], customMessage)
    .catch(err => console.error('[Tuition] reminder email failed:', err.message));
  await bumpTuitionReminderCount(fee.studentId._id);
  return true;
}

async function sendBulkReminders({ month, year, customMessage }, sender) {
  const fees = await TuitionFee.find({ month: Number(month), year: Number(year), isPaid: false })
    .populate('studentId', 'username email _id').lean();
  if (!fees.length) return 0;
  const monthLabel = `tháng ${month}/${year}`;
  const msgs = fees.map(fee => ({
    fromId: sender._id, fromName: sender.username,
    toId: fee.studentId._id,
    subject: `Nhắc nhở học phí ${monthLabel}`,
    body: customMessage || buildReminderBody([fee]),
    type: 'reminder',
  }));
  await Message.insertMany(msgs);
  // Fire-and-forget, in parallel — one slow/failed mailbox (or the per-send
  // SMTP-connect cost, see emailService.js) must not delay the others NOR
  // the admin's response; the in-app Messages above are the guaranteed
  // channel, email is purely additive (sendTuitionReminderEmail fails open
  // per-call regardless).
  Promise.all(fees.map(fee => sendTuitionReminderEmail(fee.studentId, [fee], customMessage)))
    .catch(err => console.error('[Tuition] bulk reminder email failed:', err.message));
  // Dedupe by student first — one nudge per student this batch, even on the
  // rare student with 2+ unpaid fees the same month/year.
  const studentIds = [...new Set(fees.map(fee => String(fee.studentId._id)))];
  await Promise.all(studentIds.map(bumpTuitionReminderCount));
  return msgs.length;
}

// Payment-due popup (nav.js): an unpaid fee is "due" from day 8 of its
// billing month (VN time) — the monthly fee's own month, or the month a
// course fee was entered — and stays due, through later months too, until
// an admin marks it paid (the student's own "Tôi đã chuyển khoản" only
// changes the popup wording). Past day 10 it's also "overdue".
const PAYMENT_DUE_DAY = 8;
const PAYMENT_DEADLINE_DAY = 10;
function feeBillingMonthKey(f) {
  if (f.feeType === 'monthly') return `${f.year}-${String(f.month).padStart(2, '0')}`;
  return vnTodayKey(new Date(f.createdAt || Date.now())).slice(0, 7);
}

async function getMySummary(studentId, now = new Date()) {
  const fees = await TuitionFee.find({ studentId, isPaid: false }).lean();
  const totalUnpaid = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  // Unpaid fees the student already self-reported as transferred — nav.js's
  // tuition popup switches to "waiting for admin confirmation" wording when
  // this covers every unpaid fee.
  const awaitingConfirmCount = fees.filter(f => f.studentNotified).length;
  const todayKey = vnTodayKey(now);
  const dayKey = d => String(d).padStart(2, '0');
  const due = fees.filter(f => todayKey >= `${feeBillingMonthKey(f)}-${dayKey(PAYMENT_DUE_DAY)}`);
  return {
    unpaidCount: fees.length, totalUnpaid, awaitingConfirmCount,
    dueCount: due.length,
    dueTotal: due.reduce((sum, f) => sum + (f.amount || 0), 0),
    dueAwaitingCount: due.filter(f => f.studentNotified).length,
    overdue: due.some(f => todayKey > `${feeBillingMonthKey(f)}-${dayKey(PAYMENT_DEADLINE_DAY)}`),
  };
}

async function getMyFees(studentId) {
  const [fees, settings] = await Promise.all([
    TuitionFee.find({ studentId }).sort({ year: -1, month: -1, createdAt: -1 }).lean(),
    TuitionSettings.getSingleton()
  ]);
  return { fees, settings };
}

async function notifyPayment(feeId, student) {
  const fee = await TuitionFee.findOne({ _id: feeId, studentId: student._id });
  if (!fee) return { status: 'not_found' };
  if (fee.isPaid) return { status: 'already_paid' };
  fee.studentNotified   = true;
  fee.studentNotifiedAt = new Date();
  await fee.save();
  const admins = await User.find({ role: 'admin' }, '_id username').lean();
  const monthLabel = fee.feeType === 'monthly' ? `tháng ${fee.month}/${fee.year}` : `khóa "${fee.courseName}"`;
  const amount = fee.amount.toLocaleString('vi-VN');
  if (admins.length) {
    await Message.insertMany(admins.map(admin => ({
      fromId: student._id,
      fromName: student.username,
      toId: admin._id,
      subject: `[Học phí] ${student.username} đã thanh toán ${monthLabel}`,
      body: `Học viên ${student.username} (${student.email}) vừa xác nhận đã chuyển khoản học phí ${monthLabel}.\n\nSố tiền: ${amount} VND\n\nVui lòng kiểm tra và đánh dấu đã thu trong trang Quản lý học phí.`,
      type: 'personal',
    })));
  }
  return { status: 'ok' };
}

module.exports = {
  getSettings, updateSettings, uploadQr, deleteQr,
  listFees, getSummary, getAdminSummary, getUnpaidByStudent, listStudents,
  createFee, createMonthlyFees, updateFee, deleteFee, getClassStudentsMissingTuition, getClassTuition,
  sendReminder, sendBulkReminders,
  getMySummary, getMyFees, notifyPayment,
  buildReminderBody, sendTuitionReminderEmail, bumpTuitionReminderCount,
};
