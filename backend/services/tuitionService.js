'use strict';

// Extracted from routes/tuition.js, verbatim logic — including the two
// reminder message templates below, which look like duplication but are
// actually different wording for the single-reminder vs bulk-reminder
// case; they are intentionally NOT unified into one builder.
const cloudinaryService = require('./cloudinaryService');
const TuitionFee = require('../models/TuitionFee');
const TuitionSettings = require('../models/TuitionSettings');
const Message = require('../models/Message');
const User = require('../models/User');

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

async function listFees(query) {
  const { studentId, month, year, feeType, isPaid, studentNotified, page = 1, limit = 50 } = query;
  const filter = {};
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
      .populate('studentId', 'username email firstName lastName')
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

async function updateFee(id, body) {
  const { amount, isPaid, note, courseName, month, year } = body;
  const fee = await TuitionFee.findById(id);
  if (!fee) return null;

  const amountChanged = amount !== undefined && Number(amount) !== fee.amount;
  const monthChanged  = month  !== undefined && Number(month)  !== fee.month;
  const yearChanged   = year   !== undefined && Number(year)   !== fee.year;

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

  // Fee details changed after the student already confirmed payment under the
  // old figures — clear that confirmation so admin doesn't mistake it for
  // confirmation of the new amount/period.
  if (!fee.isPaid && fee.studentNotified && (amountChanged || monthChanged || yearChanged)) {
    fee.studentNotified = false;
    fee.studentNotifiedAt = null;
  }

  await fee.save();
  return fee.populate('studentId', 'username email firstName lastName');
}

async function deleteFee(id) {
  await TuitionFee.findByIdAndDelete(id);
}

async function sendReminder(feeId, customMessage, sender) {
  const fee = await TuitionFee.findById(feeId).populate('studentId', 'username email').lean();
  if (!fee) return null;
  const monthLabel = fee.feeType === 'monthly' ? `tháng ${fee.month}/${fee.year}` : `khóa "${fee.courseName}"`;
  const amount = fee.amount.toLocaleString('vi-VN');
  const body = customMessage ||
    `📢 Nhắc nhở học phí\n\nBạn còn khoản học phí chưa thanh toán:\n• Loại: ${fee.feeType === 'monthly' ? 'Học phí tháng' : 'Học phí khóa học'}\n• Kỳ: ${monthLabel}\n• Số tiền: ${amount} VND\n\nVui lòng vào trang Hồ sơ → Học phí để xem thông tin chuyển khoản và xác nhận thanh toán.\n\nCảm ơn bạn! 🙏`;
  await Message.create({
    fromId: sender._id,
    fromName: sender.username,
    toId: fee.studentId._id,
    subject: `Nhắc nhở học phí ${monthLabel}`,
    body,
  });
  return true;
}

async function sendBulkReminders({ month, year, customMessage }, sender) {
  const fees = await TuitionFee.find({ month: Number(month), year: Number(year), isPaid: false })
    .populate('studentId', 'username _id').lean();
  if (!fees.length) return 0;
  const monthLabel = `tháng ${month}/${year}`;
  const msgs = fees.map(fee => {
    const amount = fee.amount.toLocaleString('vi-VN');
    const body = customMessage ||
      `📢 Nhắc nhở học phí\n\nBạn còn khoản học phí ${monthLabel} chưa thanh toán: ${amount} VND.\n\nVui lòng vào trang Hồ sơ → Học phí để xem thông tin và xác nhận.`;
    return {
      fromId: sender._id, fromName: sender.username,
      toId: fee.studentId._id,
      subject: `Nhắc nhở học phí ${monthLabel}`,
      body,
    };
  });
  await Message.insertMany(msgs);
  return msgs.length;
}

async function getMySummary(studentId) {
  const fees = await TuitionFee.find({ studentId, isPaid: false }).lean();
  const totalUnpaid = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  return { unpaidCount: fees.length, totalUnpaid };
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
    })));
  }
  return { status: 'ok' };
}

module.exports = {
  getSettings, updateSettings, uploadQr, deleteQr,
  listFees, getSummary, getAdminSummary, listStudents,
  createFee, updateFee, deleteFee,
  sendReminder, sendBulkReminders,
  getMySummary, getMyFees, notifyPayment,
};
