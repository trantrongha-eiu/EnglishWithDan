const cron         = require('node-cron');
const TuitionFee      = require('../models/TuitionFee');
const TuitionSettings = require('../models/TuitionSettings');
const Message         = require('../models/Message');
const User            = require('../models/User');

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
        console.log('[TuitionCron] Past end date, skipping');
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
      console.log('[TuitionCron] No unpaid fees, nothing to remind');
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

    const msgs = Object.values(byStudent).map(({ student, fees }) => {
      const total = fees.reduce((s, f) => s + (f.amount || 0), 0);
      const lines = fees.map(f => {
        const label = f.feeType === 'monthly'
          ? `Tháng ${f.month}/${f.year}`
          : `Khóa "${f.courseName}"`;
        return `• ${label}: ${Number(f.amount).toLocaleString('vi-VN')} VND`;
      }).join('\n');
      return {
        fromId:   admin._id,
        fromName: admin.username,
        toId:     student._id,
        subject:  `📅 Nhắc nhở học phí tháng ${currentMonth}/${currentYear}`,
        body: `📅 Nhắc nhở học phí định kỳ\n\nBạn đang có ${fees.length} khoản học phí chưa thanh toán:\n${lines}\n\nTổng cộng: ${Number(total).toLocaleString('vi-VN')} VND\n\nVui lòng vào trang Học phí để xem thông tin chuyển khoản và xác nhận thanh toán.\n\nCảm ơn bạn! 🙏`,
      };
    });

    await Message.insertMany(msgs);
    console.log(`[TuitionCron] Sent ${msgs.length} auto-reminders (day ${today}/${currentMonth}/${currentYear})`);
  } catch (e) {
    console.error('[TuitionCron] Error:', e.message);
  }
}

function start() {
  // Run at 08:00 every day, check inside if today == autoRemindDay
  cron.schedule('0 8 * * *', runReminders, { timezone: 'Asia/Ho_Chi_Minh' });
  console.log('[TuitionCron] Auto-remind cron scheduled (08:00 ICT daily)');
}

module.exports = { start };
