const cron = require('node-cron');
const ParentLink = require('../models/ParentLink');
const TuitionFee = require('../models/TuitionFee');
const assignmentService = require('../services/assignmentService');
const parentNotifyService = require('../services/parentNotifyService');
const tuitionService = require('../services/tuitionService');
const { vnTodayKey } = require('../utils/classProgress');
const logger = require('../utils/logger');

// Daily phụ huynh alerts that no single user action triggers:
//   - bài tập quá hạn: an assignment's deadline passed and the child hasn't
//     finished it (one alert per assignment, ever);
//   - học phí tới hạn / quá hạn: from day PAYMENT_DUE_DAY (8) of the month a
//     fee is billed for, and again past PAYMENT_DEADLINE_DAY (10) — the same
//     days the student's own popup uses (tuitionService.getMySummary). Skipped
//     once the student has reported the transfer ("Đã chuyển khoản").
// Absence alerts are sent on the teacher's save instead (classAttendance
// controller), and staff tuition reminders from tuitionService.
//
// Only students with a parent linked are looked at. 08:00 ICT so the email
// lands in the morning, not at 2am. Re-running is harmless: every alert has
// a unique key (parentNotifyService).

// An assignment that went overdue long ago (or before the parent was linked)
// is old news — only alert on deadlines within this window.
const HOMEWORK_LOOKBACK_MS = 3 * 24 * 60 * 60 * 1000;

function fmtDate(d) { return parentNotifyService.fmtDate(d); }

async function homeworkItems(studentId, now) {
  const { assignments } = await assignmentService.getStudentAssignments(studentId, now, { persist: false });
  return (assignments || [])
    .filter((a) => a.status === 'overdue' && a.deadline && now - new Date(a.deadline) <= HOMEWORK_LOOKBACK_MS)
    .map((a) => ({
      kind: 'homework_overdue',
      key: `hw:${a._id}`,
      title: `Bài tập quá hạn: ${a.title}`,
      body: `Lớp ${a.className} — hạn nộp ${fmtDate(a.deadline)}.` + (a.total ? ` Con đã làm ${a.done}/${a.total} phần.` : ''),
    }));
}

async function tuitionItems(studentId, now) {
  const day = Number(vnTodayKey(now).slice(8, 10));
  if (day < tuitionService.PAYMENT_DUE_DAY) return [];
  const overdue = day > tuitionService.PAYMENT_DEADLINE_DAY;
  const fees = (await TuitionFee.find({ studentId, isPaid: false, studentNotified: { $ne: true } }).lean())
    .filter((f) => tuitionService.isBilledThisMonth(f, now));
  return fees.map((f) => ({
    kind: 'tuition_due',
    key: `${overdue ? 'fee-overdue' : 'fee-due'}:${f._id}`,
    title: `${overdue ? 'Học phí quá hạn' : 'Đến hạn đóng học phí'} ${tuitionService.feeLabel(f)}: ${tuitionService.fmtVNDAmount(f.amount)} ₫`,
    body: overdue
      ? `Hạn đóng học phí là ngày ${tuitionService.PAYMENT_DEADLINE_DAY} hằng tháng. Phụ huynh vui lòng hoàn tất sớm; thông tin chuyển khoản có ở mục Học phí.`
      : `Phụ huynh vui lòng đóng học phí trước ngày ${tuitionService.PAYMENT_DEADLINE_DAY}. Thông tin chuyển khoản có ở mục Học phí.`,
  }));
}

async function runSweep(now = new Date()) {
  let students = 0, created = 0;
  try {
    const studentIds = await ParentLink.distinct('studentId');
    for (const sid of studentIds) {
      try {
        const items = [...await homeworkItems(sid, now), ...await tuitionItems(sid, now)];
        if (items.length) created += await parentNotifyService.notify(sid, items);
        students += 1;
      } catch (e) {
        logger.error('cron', 'ParentNotifySweep: student failed', { studentId: String(sid), errorMessage: e.message });
      }
    }
    logger.info('cron', 'ParentNotifySweep: done', { students, created });
  } catch (e) {
    logger.error('cron', 'ParentNotifySweep run error', { errorMessage: e.message });
  }
  return { students, created };
}

let task = null;

function start() {
  task = cron.schedule('0 8 * * *', () => runSweep(), { timezone: 'Asia/Ho_Chi_Minh' });
  logger.startup('ParentNotifySweep cron scheduled (08:00 ICT daily)');
}

function stop() {
  if (task) task.stop();
}

module.exports = { start, stop, runSweep, HOMEWORK_LOOKBACK_MS };
