const cron         = require('node-cron');
const TuitionFee      = require('../models/TuitionFee');
const TuitionSettings = require('../models/TuitionSettings');
const Message         = require('../models/Message');
const User            = require('../models/User');
const { buildReminderBody, sendTuitionReminderEmail, bumpTuitionReminderCount } = require('../services/tuitionService');
const logger = require('../utils/logger');

async function runReminders() {
  try {
    const settings = await TuitionSettings.getSingleton();
    if (!settings.autoRemindEnabled) return;

    const now          = new Date();
    const today        = now.getDate();
    const currentMonth = now.getMonth() + 1;
    const currentYear  = now.getFullYear();

    if (today !== (settings.autoRemindDay || 10)) return;

    // Stop if past end month
    if (settings.autoRemindEndYear && settings.autoRemindEndMonth) {
      const pastEnd =
        currentYear > settings.autoRemindEndYear ||
        (currentYear === settings.autoRemindEndYear && currentMonth > settings.autoRemindEndMonth);
      if (pastEnd) {
        logger.info('cron', 'TuitionCron: past end date, skipping');
        return;
      }
    }

    // Find first admin to send from
    const admin = await User.findOne({ role: 'admin' }, '_id username').lean();
    if (!admin) return;

    // All unpaid fees across all students
    const unpaidFees = await TuitionFee.find({ isPaid: false })
      .populate('studentId', '_id username email').lean();

    if (!unpaidFees.length) {
      logger.info('cron', 'TuitionCron: no unpaid fees, nothing to remind');
      return;
    }

    // Group by student
    const byStudent = {};
    unpaidFees.forEach(fee => {
      const sid = fee.studentId?._id?.toString();
      if (!sid) return;
      if (!byStudent[sid]) byStudent[sid] = { student: fee.studentId, fees: [] };
      byStudent[sid].fees.push(fee);
    });

    const groups = Object.values(byStudent);
    const msgs = groups.map(({ student, fees }) => ({
      fromId:   admin._id,
      fromName: admin.username,
      toId:     student._id,
      subject:  `📅 Nhắc nhở học phí tháng ${currentMonth}/${currentYear}`,
      body:     buildReminderBody(fees),
      type:     'reminder',
    }));

    await Message.insertMany(msgs);
    // Best-effort email alongside the in-app message — a student who hasn't
    // opened the app since the reminder cron ran would otherwise never see it.
    await Promise.all(groups.map(({ student, fees }) => sendTuitionReminderEmail(student, fees)));
    // One tracked nudge per student per run — same counter Tuition.jsx's
    // per-fee/bulk reminders bump, so nav.js's escalation banner also
    // catches students only ever reminded by this daily cron.
    await Promise.all(groups.map(({ student }) => bumpTuitionReminderCount(student._id)));
    logger.info('cron', 'TuitionCron: sent auto-reminders', { count: msgs.length, day: today, month: currentMonth, year: currentYear });
  } catch (e) {
    logger.error('cron', 'TuitionCron run error', { errorMessage: e.message });
  }
}

let task = null;

function start() {
  // Run at 08:00 every day, check inside if today == autoRemindDay
  task = cron.schedule('0 8 * * *', runReminders, { timezone: 'Asia/Ho_Chi_Minh' });
  logger.startup('TuitionCron auto-remind cron scheduled (08:00 ICT daily)');
}

// Lets graceful shutdown (Phase 11) stop the scheduled job so the process
// doesn't hold a pending cron timer open while trying to exit.
function stop() {
  if (task) task.stop();
}

module.exports = { start, stop };
