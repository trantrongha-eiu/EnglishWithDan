const express     = require('express');
const router      = express.Router();
const crypto      = require('crypto');
const Passage     = require('../models/Passage');
const ReadingTest = require('../models/ReadingTest');
const AccessKey   = require('../models/AccessKey');
const TestAttempt = require('../models/TestAttempt');
const auth        = require('../middleware/auth');

// Chỉ teacher và admin mới dùng được
const teacherOnly = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
  }
  next();
};

// ══════════════════════════════════════════════════
// PASSAGES
// ══════════════════════════════════════════════════

// GET  /api/admin/passages  – lấy danh sách bài đọc
router.get('/passages', auth, teacherOnly, async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = category ? { category } : {};
    const passages = await Passage.find(filter)
      .select('title category difficulty tags isActive questionRange createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Passage.countDocuments(filter);
    res.json({ success: true, passages, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/passages  – upload bài đọc mới
router.post('/passages', auth, teacherOnly, async (req, res) => {
  try {
    const passage = new Passage(req.body);
    await passage.save();
    res.status(201).json({ success: true, passage });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET  /api/admin/passages/:id  – lấy 1 bài đọc đầy đủ (để edit)
router.get('/passages/:id', auth, teacherOnly, async (req, res) => {
  try {
    const passage = await Passage.findById(req.params.id);
    if (!passage) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, passage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT  /api/admin/passages/:id  – chỉnh sửa bài đọc
router.put('/passages/:id', auth, teacherOnly, async (req, res) => {
  try {
    const passage = await Passage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!passage) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, passage });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/passages/:id  – xoá mềm (isActive = false)
router.delete('/passages/:id', auth, teacherOnly, async (req, res) => {
  try {
    await Passage.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn bài đọc' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// READING TESTS
// ══════════════════════════════════════════════════

// GET  /api/admin/tests
router.get('/tests', auth, teacherOnly, async (req, res) => {
  try {
    const tests = await ReadingTest.find().sort({ testNumber: -1 });
    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/tests  – tạo bộ đề mới
router.post('/tests', auth, teacherOnly, async (req, res) => {
  try {
    const test = new ReadingTest(req.body);
    await test.save();
    res.status(201).json({ success: true, test });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT  /api/admin/tests/:id
router.put('/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    const test = await ReadingTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// ACCESS KEYS
// ══════════════════════════════════════════════════

// GET  /api/admin/keys  – danh sách key đã tạo
router.get('/keys', auth, teacherOnly, async (req, res) => {
  try {
    const keys = await AccessKey.find({ createdBy: req.user._id })
      .populate('testId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, keys });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/keys/generate  – tạo key mới
// Body: { count, testId, expiryDays, maxUses }
router.post('/keys/generate', auth, teacherOnly, async (req, res) => {
  try {
    const { count = 1, testId = null, expiryDays = null, maxUses = 1 } = req.body;

    if (count < 1 || count > 100) {
      return res.status(400).json({ success: false, message: 'count phải từ 1 đến 100' });
    }

    const createdKeys = [];

    for (let i = 0; i < count; i++) {
      // Format: XXXX-XXXX (8 ký tự hex, dấu gạch giữa)
      const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
      const key = `${raw.slice(0, 4)}-${raw.slice(4)}`;

      const accessKey = new AccessKey({
        key,
        testId: testId || null,
        createdBy: req.user._id,
        expiresAt: expiryDays
          ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
          : null,
        maxUses: Number(maxUses)
      });
      await accessKey.save();
      createdKeys.push(key);
    }

    res.status(201).json({ success: true, keys: createdKeys });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/keys/:id  – vô hiệu hoá key
router.delete('/keys/:id', auth, teacherOnly, async (req, res) => {
  try {
    await AccessKey.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã vô hiệu hoá key' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// THỐNG KÊ  (admin only)
// ══════════════════════════════════════════════════

// GET /api/admin/stats
router.get('/stats', auth, teacherOnly, async (req, res) => {
  try {
    const [totalStudents, totalAttempts, avgBand] = await Promise.all([
      require('../models/User').countDocuments({ role: 'student' }),
      TestAttempt.countDocuments({ status: 'completed' }),
      TestAttempt.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, avg: { $avg: '$bandScore' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalAttempts,
        avgBandScore: avgBand[0]?.avg?.toFixed(1) || '0.0'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;