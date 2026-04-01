const express        = require('express');
const router         = express.Router();
const auth           = require('../middleware/auth');
const AccessKey      = require('../models/AccessKey');
const WritingExam    = require('../models/WritingExam');
const WritingAttempt = require('../models/WritingAttempt');

// ══════════════════════════════════════════════════
// POST /api/writing/verify-key
// Body: { key }
// Returns exam data (task1, task2) and marks key used
// ══════════════════════════════════════════════════
router.post('/verify-key', auth, async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ success: false, message: 'Thiếu mã truy cập' });

    const accessKey = await AccessKey.findOne({ key: key.toUpperCase().trim() });
    if (!accessKey) return res.status(404).json({ success: false, message: 'Mã không tồn tại' });
    if (!accessKey.isActive)  return res.status(403).json({ success: false, message: 'Mã đã bị vô hiệu hoá' });
    if (accessKey.expiresAt && new Date() > accessKey.expiresAt)
      return res.status(403).json({ success: false, message: 'Mã đã hết hạn' });
    if (accessKey.currentUses >= accessKey.maxUses)
      return res.status(403).json({ success: false, message: 'Mã đã được sử dụng hết lượt' });
    if (accessKey.testType && accessKey.testType !== 'writing')
      return res.status(403).json({ success: false, message: 'Mã này không dùng cho Writing' });

    // Lấy đề thi
    let exam = null;
    if (accessKey.testId) {
      exam = await WritingExam.findById(accessKey.testId);
    } else {
      // Key không gắn đề cụ thể → lấy đề active đầu tiên
      exam = await WritingExam.findOne({ isActive: true }).sort({ createdAt: -1 });
    }
    if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy đề thi' });

    // Tăng lượt dùng
    await AccessKey.findByIdAndUpdate(accessKey._id, { $inc: { currentUses: 1 } });

    res.json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// GET /api/writing/tests  – danh sách đề (không cần key, để học sinh chọn)
// ══════════════════════════════════════════════════
router.get('/tests', auth, async (req, res) => {
  try {
    const exams = await WritingExam.find({ isActive: true })
      .select('name duration createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// POST /api/writing/submit
// Body: { examId, task1Answer, task2Answer, wordCount1, wordCount2, timeTaken, status }
// ══════════════════════════════════════════════════
router.post('/submit', auth, async (req, res) => {
  try {
    const {
      examId,
      task1Answer = '',
      task2Answer = '',
      wordCount1  = 0,
      wordCount2  = 0,
      timeTaken   = 0,
      status      = 'completed'
    } = req.body;

    if (!examId) return res.status(400).json({ success: false, message: 'Thiếu examId' });

    const exam = await WritingExam.findById(examId).select('name');
    if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy đề' });

    const attempt = new WritingAttempt({
      userId:       req.user._id,
      examId,
      examName:     exam.name,
      task1Answer,
      task2Answer,
      wordCount1:   Number(wordCount1),
      wordCount2:   Number(wordCount2),
      timeTaken:    Number(timeTaken),
      submittedAt:  new Date(),
      status
    });
    await attempt.save();

    res.status(201).json({ success: true, attemptId: attempt._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// GET /api/writing/my-history  – lịch sử của học sinh đang đăng nhập
// ══════════════════════════════════════════════════
router.get('/my-history', auth, async (req, res) => {
  try {
    const attempts = await WritingAttempt.find({ userId: req.user._id })
      .sort({ submittedAt: -1 })
      .select('-task1Answer -task2Answer');
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// GET /api/writing/attempt/:id  – xem chi tiết bài làm (chính chủ hoặc admin)
// ══════════════════════════════════════════════════
router.get('/attempt/:id', auth, async (req, res) => {
  try {
    const attempt = await WritingAttempt.findById(req.params.id)
      .populate('examId', 'name task1 task2');

    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    const isOwner = attempt.userId.toString() === req.user._id.toString();
    const isAdmin = ['teacher', 'admin'].includes(req.user.role);
    if (!isOwner && !isAdmin)
      return res.status(403).json({ success: false, message: 'Không có quyền' });

    res.json({ success: true, attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
