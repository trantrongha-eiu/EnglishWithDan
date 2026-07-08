const express   = require('express');
const router    = express.Router();
const multer    = require('multer');
const cloudinary = require('cloudinary').v2;
const auth      = require('../middleware/auth');
const TuitionFee      = require('../models/TuitionFee');
const TuitionSettings = require('../models/TuitionSettings');
const Message   = require('../models/Message');
const User      = require('../models/User');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Chỉ admin' });
  next();
};

// ────────────────────────────────────────────────
// SETTINGS (bank info, QR)
// ────────────────────────────────────────────────

// GET /api/tuition/settings  — any authenticated user
router.get('/settings', auth, async (req, res) => {
  try {
    const s = await TuitionSettings.getSingleton();
    res.json({ success: true, settings: s });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PUT /api/tuition/settings  — admin only
router.put('/settings', auth, adminOnly, async (req, res) => {
  try {
    const { bankName, bankAccount, accountName, defaultMonthlyFee, paymentNote,
            autoRemindEnabled, autoRemindDay, autoRemindEndMonth, autoRemindEndYear } = req.body;
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
    res.json({ success: true, settings: s });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/tuition/settings/qr  — admin uploads QR image
router.post('/settings/qr', auth, adminOnly, upload.single('qr'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Chưa có file' });
    const s = await TuitionSettings.getSingleton();
    // Delete old QR from Cloudinary if exists
    if (s.qrImagePublicId) {
      await cloudinary.uploader.destroy(s.qrImagePublicId).catch(() => {});
    }
    // Upload new QR
    const b64 = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'tuition-qr',
      public_id: `qr_${Date.now()}`,
    });
    s.qrImageUrl      = result.secure_url;
    s.qrImagePublicId = result.public_id;
    await s.save();
    res.json({ success: true, qrImageUrl: s.qrImageUrl });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE /api/tuition/settings/qr — admin removes QR
router.delete('/settings/qr', auth, adminOnly, async (req, res) => {
  try {
    const s = await TuitionSettings.getSingleton();
    if (s.qrImagePublicId) {
      await cloudinary.uploader.destroy(s.qrImagePublicId).catch(() => {});
    }
    s.qrImageUrl = ''; s.qrImagePublicId = '';
    await s.save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ────────────────────────────────────────────────
// ADMIN — manage fees
// ────────────────────────────────────────────────

// GET /api/tuition  — list all fees (admin)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { studentId, month, year, feeType, isPaid, studentNotified, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (month)     filter.month     = Number(month);
    if (year)      filter.year      = Number(year);
    if (feeType)   filter.feeType   = feeType;
    if (isPaid     !== undefined && isPaid     !== '') filter.isPaid            = isPaid === 'true';
    if (studentNotified !== undefined && studentNotified !== '') filter.studentNotified = studentNotified === 'true';

    const skip  = (Number(page) - 1) * Number(limit);
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
          totalAmount:    { $sum: '$amount' },
          paidAmount:     { $sum: { $cond: ['$isPaid', '$amount', 0] } },
          pendingNotify:  { $sum: { $cond: [{ $and: [{ $eq: ['$studentNotified', true] }, { $eq: ['$isPaid', false] }] }, 1, 0] } }
        }}
      ])
    ]);
    const stats = aggStats[0] || { totalAmount: 0, paidAmount: 0, pendingNotify: 0 };

    res.json({ success: true, fees, total, stats });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/tuition/summary — monthly totals (admin)
router.get('/summary', auth, adminOnly, async (req, res) => {
  try {
    const { year } = req.query;
    const matchYear = year ? { year: Number(year), feeType: 'monthly' } : { feeType: 'monthly' };
    const summary = await TuitionFee.aggregate([
      { $match: matchYear },
      { $group: {
        _id: { year: '$year', month: '$month' },
        totalAmount:  { $sum: '$amount' },
        paidAmount:   { $sum: { $cond: ['$isPaid', '$amount', 0] } },
        unpaidAmount: { $sum: { $cond: ['$isPaid', 0, '$amount'] } },
        totalCount:   { $sum: 1 },
        paidCount:    { $sum: { $cond: ['$isPaid', 1, 0] } },
        unpaidCount:  { $sum: { $cond: ['$isPaid', 0, 1] } },
        pendingNotify:{ $sum: { $cond: [{ $and: ['$studentNotified', { $not: '$isPaid' }] }, 1, 0] } },
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 24 }
    ]);
    // Also aggregate course fees
    const courseSummary = await TuitionFee.aggregate([
      { $match: { feeType: 'course' } },
      { $group: {
        _id: '$courseName',
        totalAmount:  { $sum: '$amount' },
        paidAmount:   { $sum: { $cond: ['$isPaid', '$amount', 0] } },
        totalCount:   { $sum: 1 },
        paidCount:    { $sum: { $cond: ['$isPaid', 1, 0] } },
      }}
    ]);
    res.json({ success: true, summary, courseSummary });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/tuition/admin-summary — badge count for sidebar (students still owing)
router.get('/admin-summary', auth, adminOnly, async (req, res) => {
  try {
    const unpaidStudents = await TuitionFee.distinct('studentId', { isPaid: false });
    res.json({ success: true, unpaidStudentCount: unpaidStudents.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/tuition/students-list — list all students for dropdown (admin)
router.get('/students-list', auth, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: { $in: ['student', 'teacher'] } }, 'username email firstName lastName').sort('username').lean();
    res.json({ success: true, students });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/tuition — create fee record (admin)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { studentId, feeType, month, year, courseName, amount, note } = req.body;
    if (!studentId || !feeType || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }
    const fee = await TuitionFee.create({
      studentId, feeType,
      month: feeType === 'monthly' ? Number(month) : undefined,
      year:  feeType === 'monthly' ? Number(year)  : undefined,
      courseName: feeType === 'course' ? courseName : '',
      amount: Number(amount),
      note: note || '',
      createdBy: req.user._id,
    });
    const populated = await fee.populate('studentId', 'username email firstName lastName');
    res.status(201).json({ success: true, fee: populated });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'Học phí tháng này đã tồn tại cho học viên này' });
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT /api/tuition/:id — update fee record (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { amount, isPaid, note, courseName, month, year } = req.body;
    const fee = await TuitionFee.findById(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    if (amount     !== undefined) fee.amount     = Number(amount);
    if (isPaid     !== undefined) {
      fee.isPaid   = isPaid;
      if (isPaid && !fee.paidDate) fee.paidDate = new Date();
      if (!isPaid) fee.paidDate = undefined;
    }
    if (note       !== undefined) fee.note       = note;
    if (courseName !== undefined) fee.courseName = courseName;
    if (month      !== undefined) fee.month      = Number(month);
    if (year       !== undefined) fee.year       = Number(year);
    await fee.save();
    const populated = await fee.populate('studentId', 'username email firstName lastName');
    res.json({ success: true, fee: populated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE /api/tuition/:id (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await TuitionFee.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/tuition/:id/remind — admin sends reminder message to student inbox
router.post('/:id/remind', auth, adminOnly, async (req, res) => {
  try {
    const fee = await TuitionFee.findById(req.params.id).populate('studentId', 'username email').lean();
    if (!fee) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    const monthLabel = fee.feeType === 'monthly' ? `tháng ${fee.month}/${fee.year}` : `khóa "${fee.courseName}"`;
    const amount = fee.amount.toLocaleString('vi-VN');
    const body = req.body.customMessage ||
      `📢 Nhắc nhở học phí\n\nBạn còn khoản học phí chưa thanh toán:\n• Loại: ${fee.feeType === 'monthly' ? 'Học phí tháng' : 'Học phí khóa học'}\n• Kỳ: ${monthLabel}\n• Số tiền: ${amount} VND\n\nVui lòng vào trang Hồ sơ → Học phí để xem thông tin chuyển khoản và xác nhận thanh toán.\n\nCảm ơn bạn! 🙏`;
    await Message.create({
      fromId:   req.user._id,
      fromName: req.user.username,
      toId:     fee.studentId._id,
      subject:  `Nhắc nhở học phí ${monthLabel}`,
      body,
    });
    res.json({ success: true, message: 'Đã gửi nhắc nhở' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/tuition/remind-bulk — send reminders to all unpaid in a month (admin)
router.post('/remind-bulk', auth, adminOnly, async (req, res) => {
  try {
    const { month, year, customMessage } = req.body;
    if (!month || !year || isNaN(Number(month)) || isNaN(Number(year))) {
      return res.status(400).json({ success: false, message: 'Thiếu hoặc sai tháng/năm' });
    }
    const fees = await TuitionFee.find({ month: Number(month), year: Number(year), isPaid: false })
      .populate('studentId', 'username _id').lean();
    if (!fees.length) return res.json({ success: true, sent: 0 });
    const monthLabel = `tháng ${month}/${year}`;
    const msgs = fees.map(fee => {
      const amount = fee.amount.toLocaleString('vi-VN');
      const body = customMessage ||
        `📢 Nhắc nhở học phí\n\nBạn còn khoản học phí ${monthLabel} chưa thanh toán: ${amount} VND.\n\nVui lòng vào trang Hồ sơ → Học phí để xem thông tin và xác nhận.`;
      return {
        fromId: req.user._id, fromName: req.user.username,
        toId: fee.studentId._id,
        subject: `Nhắc nhở học phí ${monthLabel}`,
        body,
      };
    });
    await Message.insertMany(msgs);
    res.json({ success: true, sent: msgs.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ────────────────────────────────────────────────
// STUDENT — view own fees + notify payment
// ────────────────────────────────────────────────

// GET /api/tuition/my/summary — lightweight badge count (unpaid fees)
router.get('/my/summary', auth, async (req, res) => {
  try {
    const fees = await TuitionFee.find({ studentId: req.user._id, isPaid: false }).lean();
    const totalUnpaid = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
    res.json({ success: true, unpaidCount: fees.length, totalUnpaid });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/tuition/my — student's own fees
router.get('/my', auth, async (req, res) => {
  try {
    const fees = await TuitionFee.find({ studentId: req.user._id })
      .sort({ year: -1, month: -1, createdAt: -1 }).lean();
    const settings = await TuitionSettings.getSingleton();
    res.json({ success: true, fees, settings });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/tuition/:id/notify — student says "Tôi đã chuyển khoản"
router.post('/:id/notify', auth, async (req, res) => {
  try {
    const fee = await TuitionFee.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!fee) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    if (fee.isPaid) return res.json({ success: true, message: 'Học phí đã được xác nhận' });
    fee.studentNotified   = true;
    fee.studentNotifiedAt = new Date();
    await fee.save();
    // Notify admin via message
    const admins = await User.find({ role: 'admin' }, '_id username').lean();
    const monthLabel = fee.feeType === 'monthly' ? `tháng ${fee.month}/${fee.year}` : `khóa "${fee.courseName}"`;
    const amount = fee.amount.toLocaleString('vi-VN');
    if (admins.length) {
      await Message.insertMany(admins.map(admin => ({
        fromId:   req.user._id,
        fromName: req.user.username,
        toId:     admin._id,
        subject:  `[Học phí] ${req.user.username} đã thanh toán ${monthLabel}`,
        body:     `Học viên ${req.user.username} (${req.user.email}) vừa xác nhận đã chuyển khoản học phí ${monthLabel}.\n\nSố tiền: ${amount} VND\n\nVui lòng kiểm tra và đánh dấu đã thu trong trang Quản lý học phí.`,
      })));
    }
    res.json({ success: true, message: 'Đã gửi thông báo đến admin' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
