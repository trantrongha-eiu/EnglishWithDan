const express        = require('express');
const router         = express.Router();
const auth           = require('../middleware/auth');
const AccessKey      = require('../models/AccessKey');
const WritingExam    = require('../models/WritingExam');
const WritingTask1   = require('../models/WritingTask1');
const WritingTask2   = require('../models/WritingTask2');
const WritingAttempt = require('../models/WritingAttempt');
const WritingSample  = require('../models/WritingSample');

// helper – random document from a collection
async function randomDoc(Model) {
  const count = await Model.countDocuments({ isActive: true });
  if (!count) return null;
  return Model.findOne({ isActive: true }).skip(Math.floor(Math.random() * count));
}

// ══════════════════════════════════════════════════
// POST /api/writing/verify-key
// Body: { key }
// Returns exam + random task1 + random task2
// ══════════════════════════════════════════════════
router.post('/verify-key', auth, async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ success: false, message: 'Thiếu mã truy cập' });

    const accessKey = await AccessKey.findOne({ key: key.toUpperCase().trim() });
    if (!accessKey)
      return res.status(404).json({ success: false, message: 'Mã không tồn tại' });
    if (!accessKey.isActive)
      return res.status(403).json({ success: false, message: 'Mã đã bị vô hiệu hoá' });
    if (accessKey.expiresAt && new Date() > accessKey.expiresAt)
      return res.status(403).json({ success: false, message: 'Mã đã hết hạn' });
    if (accessKey.currentUses >= accessKey.maxUses)
      return res.status(403).json({ success: false, message: 'Mã đã được sử dụng hết lượt' });
    if (accessKey.testType && accessKey.testType !== 'writing')
      return res.status(403).json({ success: false, message: 'Mã này không dùng cho Writing' });

    // Lấy đề thi (chỉ cần name + duration)
    // Ưu tiên: exam gắn với key → exam active mới nhất → bất kỳ exam nào → tự tạo default
    let exam = null;
    if (accessKey.testId) {
      exam = await WritingExam.findById(accessKey.testId);
    }
    if (!exam) {
      exam = await WritingExam.findOne({ isActive: true }).sort({ createdAt: -1 });
    }
    if (!exam) {
      exam = await WritingExam.findOne().sort({ createdAt: -1 });
    }
    if (!exam) {
      exam = await WritingExam.create({ name: 'Writing Practice', duration: 60, isActive: true });
    }

    // Random task1 + task2 từ pool
    const task1 = await randomDoc(WritingTask1);
    const task2 = await randomDoc(WritingTask2);
    if (!task1)
      return res.status(404).json({ success: false, message: 'Chưa có câu hỏi Task 1 nào. Vui lòng liên hệ giáo viên.' });
    if (!task2)
      return res.status(404).json({ success: false, message: 'Chưa có câu hỏi Task 2 nào. Vui lòng liên hệ giáo viên.' });

    // Tăng lượt dùng
    await AccessKey.findByIdAndUpdate(accessKey._id, { $inc: { currentUses: 1 } });

    // Trả về exam kèm task1 + task2 – giữ cấu trúc giống cũ để writing.js frontend không đổi
    res.json({
      success: true,
      exam: {
        _id:      exam._id,
        name:     exam.name,
        duration: exam.duration,
        task1,
        task2
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// POST /api/writing/submit
// Body: { examId, task1Id, task2Id, task1Answer, task2Answer,
//         wordCount1, wordCount2, timeTaken, status }
// ══════════════════════════════════════════════════
router.post('/submit', auth, async (req, res) => {
  try {
    const {
      examId,
      task1Id,
      task2Id,
      task1Answer = '',
      task2Answer = '',
      wordCount1  = 0,
      wordCount2  = 0,
      timeTaken   = 0,
      status      = 'completed'
    } = req.body;

    if (!examId) return res.status(400).json({ success: false, message: 'Thiếu examId' });

    const exam  = await WritingExam.findById(examId).select('name');
    if (!exam)  return res.status(404).json({ success: false, message: 'Không tìm thấy đề' });

    // Fetch snapshots at submit time
    const t1 = task1Id ? await WritingTask1.findById(task1Id).lean() : null;
    const t2 = task2Id ? await WritingTask2.findById(task2Id).lean() : null;

    const attempt = new WritingAttempt({
      userId:   req.user._id,
      examId,
      examName: exam.name,
      task1Id:  task1Id || undefined,
      task2Id:  task2Id || undefined,
      task1Snapshot: t1
        ? { imageUrl: t1.imageUrl || '', instructions: t1.instructions || '', prompt: t1.prompt || '' }
        : {},
      task2Snapshot: t2
        ? { instructions: t2.instructions || '', prompt: t2.prompt || '' }
        : {},
      task1Answer,
      task2Answer,
      wordCount1: Number(wordCount1),
      wordCount2: Number(wordCount2),
      timeTaken:  Number(timeTaken),
      submittedAt: new Date(),
      status
    });
    await attempt.save();

    res.status(201).json({ success: true, attemptId: attempt._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// GET /api/writing/my-history
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
// GET /api/writing/attempt/:id
// ══════════════════════════════════════════════════
router.get('/attempt/:id', auth, async (req, res) => {
  try {
    const attempt = await WritingAttempt.findById(req.params.id).lean();
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

// ══════════════════════════════════════════════════
// GET /api/writing/samples
// Students: lấy danh sách tài liệu mẫu (isActive=true)
// ══════════════════════════════════════════════════
router.get('/samples', auth, async (req, res) => {
  try {
    const { quarter, topic, taskType } = req.query;
    const filter = { isActive: true };
    if (quarter  && quarter  !== 'all') filter.quarter  = quarter;
    if (topic    && topic    !== 'all') filter.topic    = topic;
    if (taskType && taskType !== 'all') filter.taskType = taskType;

    const samples = await WritingSample.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, samples });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// GET /api/writing/sample-filters
// Trả về distinct quarters, topics, taskTypes để render filter chips
// ══════════════════════════════════════════════════
router.get('/sample-filters', auth, async (req, res) => {
  try {
    const [quarters, topics] = await Promise.all([
      WritingSample.distinct('quarter',  { isActive: true }),
      WritingSample.distinct('topic',    { isActive: true })
    ]);
    res.json({
      success: true,
      quarters: quarters.sort().reverse(),
      topics:   topics.sort()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
