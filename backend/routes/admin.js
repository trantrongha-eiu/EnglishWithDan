const express      = require('express');
const router       = express.Router();
const crypto       = require('crypto');
const multer       = require('multer');
const cloudinary   = require('cloudinary').v2;

// Multer: store file in memory for Cloudinary upload
const uploadPdfMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Chỉ chấp nhận file PDF'));
  }
});
const Passage      = require('../models/Passage');
const ReadingTest  = require('../models/ReadingTest');
const ListeningTest = require('../models/ListeningTest');
const WritingExam    = require('../models/WritingExam');
const WritingTask1   = require('../models/WritingTask1');
const WritingTask2   = require('../models/WritingTask2');
const WritingAttempt = require('../models/WritingAttempt');
const SpeakingQuestion = require('../models/SpeakingQuestion');
const SpeakingMaterial = require('../models/SpeakingMaterial');
const WritingSample    = require('../models/WritingSample');
const Course           = require('../models/Course');
const AccessKey    = require('../models/AccessKey');
const TestAttempt  = require('../models/TestAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const auth         = require('../middleware/auth');

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

// POST /api/admin/passages/upload-map-image
// Body: { imageBase64 }  → upload lên Cloudinary → trả về URL
router.post('/passages/upload-map-image', auth, teacherOnly, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu ảnh' });

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'reading-maps',
      resource_type: 'image'
    });
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/passages', auth, teacherOnly, async (req, res) => {
  try {
    const passage = new Passage(req.body);
    await passage.save();
    res.status(201).json({ success: true, passage });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/passages/:id', auth, teacherOnly, async (req, res) => {
  try {
    const passage = await Passage.findById(req.params.id);
    if (!passage) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, passage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/passages/:id', auth, teacherOnly, async (req, res) => {
  try {
    const passage = await Passage.findById(req.params.id);
    if (!passage) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    // Gán từng field rõ ràng để Mongoose thay hẳn arrays subdocument
    const { title, category, content, questionRange, difficulty, tags, questionGroups, questions, isActive } = req.body;
    if (title        !== undefined) passage.title        = title;
    if (category     !== undefined) passage.category     = category;
    if (content      !== undefined) passage.content      = content;
    if (questionRange!== undefined) passage.questionRange= questionRange;
    if (difficulty   !== undefined) passage.difficulty   = difficulty;
    if (tags         !== undefined) passage.tags         = tags;
    if (isActive     !== undefined) passage.isActive     = isActive;
    if (questionGroups !== undefined) passage.questionGroups = questionGroups;
    if (questions    !== undefined) passage.questions    = questions;

    const updated = await passage.save();
    res.json({ success: true, passage: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/passages/:id', auth, teacherOnly, async (req, res) => {
  try {
    await Passage.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn bài đọc' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/passages/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    const passage = await Passage.findByIdAndDelete(req.params.id);
    if (!passage) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đọc' });
    res.json({ success: true, message: 'Đã xóa vĩnh viễn bài đọc' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// READING TESTS
// ══════════════════════════════════════════════════

router.get('/tests', auth, teacherOnly, async (req, res) => {
  try {
    const tests = await ReadingTest.find().sort({ testNumber: -1 });
    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/tests', auth, teacherOnly, async (req, res) => {
  try {
    const test = new ReadingTest(req.body);
    await test.save();
    res.status(201).json({ success: true, test });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    const test = await ReadingTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    await ReadingTest.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn bộ đề' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/tests/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    const test = await ReadingTest.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy bộ đề' });
    res.json({ success: true, message: 'Đã xóa vĩnh viễn bộ đề' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// LISTENING TESTS (cho dropdown key)
// ══════════════════════════════════════════════════

// GET /api/admin/listening-tests  – dropdown tạo key
router.get('/listening-tests', auth, teacherOnly, async (req, res) => {
  try {
    const tests = await ListeningTest.find({ isActive: true })
      .select('name testNumber seriesName')
      .sort({ testNumber: -1 });
    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// ACCESS KEYS
// ══════════════════════════════════════════════════

// GET  /api/admin/keys
router.get('/keys', auth, teacherOnly, async (req, res) => {
  try {
    const keys = await AccessKey.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    // Populate thủ công vì refPath cần virtual (mongoose không tự resolve virtual refPath)
    const populated = await Promise.all(keys.map(async (k) => {
      const obj = k.toObject({ virtuals: true });
      if (k.testId) {
        try {
          const Model = k.testType === 'listening' ? ListeningTest : ReadingTest;
          const test  = await Model.findById(k.testId).select('name');
          obj.testId = test ? { _id: test._id, name: test.name } : null;
        } catch {
          obj.testId = null;
        }
      }
      return obj;
    }));

    res.json({ success: true, keys: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/keys/generate
// Body: { count, testId, testType, expiryDays, maxUses }
router.post('/keys/generate', auth, teacherOnly, async (req, res) => {
  try {
    const {
      count     = 1,
      testId    = null,
      testType  = null,   // 'reading' | 'listening' | null
      expiryDays = null,
      maxUses   = 1
    } = req.body;

    if (count < 1 || count > 100) {
      return res.status(400).json({ success: false, message: 'count phải từ 1 đến 100' });
    }

    // Validate testType
    const validTypes = ['reading', 'listening', 'writing', null];
    if (!validTypes.includes(testType)) {
      return res.status(400).json({ success: false, message: 'testType không hợp lệ' });
    }

    const createdKeys = [];

    for (let i = 0; i < count; i++) {
      const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
      const key = `${raw.slice(0, 4)}-${raw.slice(4)}`;

      const accessKey = new AccessKey({
        key,
        testId:   testId   || null,
        testType: testType  || null,
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

// DELETE /api/admin/keys/:id
router.delete('/keys/:id', auth, teacherOnly, async (req, res) => {
  try {
    await AccessKey.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã vô hiệu hoá key' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// THỐNG KÊ
// ══════════════════════════════════════════════════

router.get('/stats', auth, teacherOnly, async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      bannedUsers,
      totalReadingAttempts,
      totalListeningAttempts,
      totalWritingAttempts,
      avgBandReading,
      avgBandListening,
      newUsersThisWeek,
      passageCount,
      vocabUnitCount
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: { $in: ['teacher', 'admin'] } }),
      User.countDocuments({ isBanned: true }),
      TestAttempt.countDocuments({ status: 'completed' }),
      ListeningAttempt.countDocuments({ status: 'completed' }),
      require('../models/WritingAttempt').countDocuments(),
      TestAttempt.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, avg: { $avg: '$bandScore' } } }
      ]),
      ListeningAttempt.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, avg: { $avg: '$bandScore' } } }
      ]),
      User.countDocuments({ role: 'student', createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } }),
      require('../models/Passage').countDocuments({ isActive: true }),
      require('../models/VocabUnit').countDocuments({ isActive: true })
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        bannedUsers,
        newUsersThisWeek,
        totalReadingAttempts,
        totalListeningAttempts,
        totalWritingAttempts,
        avgReadingBand:   avgBandReading[0]?.avg?.toFixed(1)  || '0.0',
        avgListeningBand: avgBandListening[0]?.avg?.toFixed(1) || '0.0',
        passageCount,
        vocabUnitCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/history – lịch sử Reading
router.get('/history', auth, teacherOnly, async (req, res) => {
  try {
    const history = await TestAttempt.find({ status: 'completed' })
      .populate('userId', 'username firstName lastName')
      .populate('testId', 'name testNumber')
      .sort({ endTime: -1 })
      .limit(50)
      .select('-answers -passagesUsed')
      .lean();

    const normalized = history.map(h => {
      if (h.userId && typeof h.userId === 'object') {
        const u = h.userId;
        const first = (u.firstName || '').trim();
        const last  = (u.lastName  || '').trim();
        h.userId = { ...u, displayName: (first ? (last ? `${first} ${last}` : first) : '') || u.username || '–' };
      }
      return h;
    });

    res.json({ success: true, history: normalized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/recent-attempts – tất cả bài nộp gần nhất (Reading + Listening + Writing)
router.get('/recent-attempts', auth, teacherOnly, async (req, res) => {
  try {
    const LIMIT = 40;
    function normUser(u) {
      if (!u || typeof u !== 'object') return { displayName: '–' };
      const first = (u.firstName || '').trim();
      const last  = (u.lastName  || '').trim();
      return { ...u, displayName: (first ? (last ? `${first} ${last}` : first) : '') || u.username || '–' };
    }

    const [reading, listening, writing] = await Promise.all([
      TestAttempt.find({ status: 'completed' })
        .populate('userId', 'username firstName lastName')
        .populate('testId', 'name testNumber')
        .sort({ endTime: -1 }).limit(LIMIT)
        .select('-answers -passagesUsed').lean(),
      ListeningAttempt.find({ status: 'completed' })
        .populate('userId', 'username firstName lastName')
        .sort({ submittedAt: -1 }).limit(LIMIT)
        .select('-answers').lean()
        .catch(() => []),
      require('../models/WritingAttempt').find()
        .populate('userId', 'username firstName lastName')
        .sort({ submittedAt: -1 }).limit(LIMIT)
        .select('-task1Answer -task2Answer -task1Snapshot -task2Snapshot').lean()
        .catch(() => [])
    ]);

    const rows = [
      ...reading.map(h => ({
        _id: h._id, skill: 'reading',
        testName: h.testId?.name || `Test #${h.testId?.testNumber || ''}`,
        userId: normUser(h.userId),
        date: h.endTime || h.createdAt,
        bandScore: h.bandScore,
        correctCount: h.correctCount,
        totalQuestions: h.totalQuestions,
        duration: h.duration
      })),
      ...listening.map(h => ({
        _id: h._id, skill: 'listening',
        testName: h.testName || '–',
        userId: normUser(h.userId),
        date: h.submittedAt || h.createdAt,
        bandScore: h.bandScore,
        correctCount: h.correctCount,
        totalQuestions: h.totalQuestions,
        duration: h.timeTaken
      })),
      ...writing.map(h => ({
        _id: h._id, skill: 'writing',
        testName: h.examName || h.testName || '–',
        userId: normUser(h.userId),
        date: h.submittedAt || h.createdAt,
        bandScore: h.bandScore || null,
        correctCount: null,
        totalQuestions: null,
        duration: null
      }))
    ];

    rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, attempts: rows.slice(0, 60) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/listening-history – lịch sử Listening
router.get('/listening-history', auth, teacherOnly, async (req, res) => {
  try {
    // ListeningAttempt có thể chưa có model — wrap try/catch riêng
    let history = [];
    try {
      history = await ListeningAttempt.find({ status: 'completed' })
        .populate('userId', 'username firstName lastName')
        .sort({ submittedAt: -1 })
        .limit(100)
        .select('-answers');
    } catch {
      // Model chưa tồn tại hoặc chưa có data
    }
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// WRITING TESTS (dropdown key)
// ══════════════════════════════════════════════════

// GET /api/admin/writing-tests  – dropdown tạo key
router.get('/writing-tests', auth, teacherOnly, async (req, res) => {
  try {
    const exams = await WritingExam.find({ isActive: true })
      .select('name')
      .sort({ createdAt: -1 });
    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/writing-exams  – quản lý đề
router.get('/writing-exams', auth, teacherOnly, async (req, res) => {
  try {
    const exams = await WritingExam.find().sort({ createdAt: -1 });
    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing-exams/upload-image
// Body: { imageBase64 }  → upload lên Cloudinary → trả về URL
router.post('/writing-exams/upload-image', auth, teacherOnly, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu ảnh' });

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'writing-tasks',
      resource_type: 'image'
    });
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing-exams  – tạo đề
router.post('/writing-exams', auth, teacherOnly, async (req, res) => {
  try {
    const exam = new WritingExam(req.body);
    await exam.save();
    res.status(201).json({ success: true, exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/writing-exams/:id
router.put('/writing-exams/:id', auth, teacherOnly, async (req, res) => {
  try {
    const exam = await WritingExam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-exams/:id  (soft delete)
router.delete('/writing-exams/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WritingExam.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn đề writing' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// WRITING HISTORY (bài nộp của học sinh)
// ══════════════════════════════════════════════════

// GET /api/admin/writing-history  – danh sách tất cả bài nộp (không kèm text)
router.get('/writing-history', auth, teacherOnly, async (req, res) => {
  try {
    const attempts = await WritingAttempt.find()
      .populate('userId', 'username firstName lastName')
      .sort({ submittedAt: -1 })
      .limit(200)
      .select('-task1Answer -task2Answer');
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/writing-attempt/:id  – chi tiết bài nộp (có text đầy đủ)
router.get('/writing-attempt/:id', auth, teacherOnly, async (req, res) => {
  try {
    const attempt = await WritingAttempt.findById(req.params.id)
      .populate('userId', 'username firstName lastName')
      .populate('examId', 'name');
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// WRITING TASK 1 POOL
// ══════════════════════════════════════════════════

// GET /api/admin/writing-task1
router.get('/writing-task1', auth, teacherOnly, async (req, res) => {
  try {
    const tasks = await WritingTask1.find().sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/writing-task1/:id
router.get('/writing-task1/:id', auth, teacherOnly, async (req, res) => {
  try {
    const task = await WritingTask1.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing-task1/upload-image
router.post('/writing-task1/upload-image', auth, teacherOnly, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu ảnh' });
    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'writing-tasks',
      resource_type: 'image'
    });
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing-task1
router.post('/writing-task1', auth, teacherOnly, async (req, res) => {
  try {
    const task = new WritingTask1(req.body);
    await task.save();
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/writing-task1/:id
router.put('/writing-task1/:id', auth, teacherOnly, async (req, res) => {
  try {
    const task = await WritingTask1.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-task1/:id  (soft delete)
router.delete('/writing-task1/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WritingTask1.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn câu hỏi Task 1' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-task1/:id/permanent  (hard delete)
router.delete('/writing-task1/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    await WritingTask1.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn Task 1' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// WRITING TASK 2 POOL
// ══════════════════════════════════════════════════

// GET /api/admin/writing-task2
router.get('/writing-task2', auth, teacherOnly, async (req, res) => {
  try {
    const tasks = await WritingTask2.find().sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/writing-task2/:id
router.get('/writing-task2/:id', auth, teacherOnly, async (req, res) => {
  try {
    const task = await WritingTask2.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing-task2
router.post('/writing-task2', auth, teacherOnly, async (req, res) => {
  try {
    const task = new WritingTask2(req.body);
    await task.save();
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/writing-task2/:id
router.put('/writing-task2/:id', auth, teacherOnly, async (req, res) => {
  try {
    const task = await WritingTask2.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-task2/:id  (soft delete)
router.delete('/writing-task2/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WritingTask2.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn câu hỏi Task 2' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-task2/:id/permanent  (hard delete)
router.delete('/writing-task2/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    await WritingTask2.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn Task 2' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// SPEAKING – QUESTIONS
// ══════════════════════════════════════════════════

// GET /api/admin/speaking/questions
router.get('/speaking/questions', auth, teacherOnly, async (req, res) => {
  try {
    const questions = await SpeakingQuestion.find().sort({ topic: 1, part: 1, createdAt: -1 });
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/speaking/questions
router.post('/speaking/questions', auth, teacherOnly, async (req, res) => {
  try {
    const q = new SpeakingQuestion(req.body);
    await q.save();
    res.status(201).json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/speaking/questions/:id
router.put('/speaking/questions/:id', auth, teacherOnly, async (req, res) => {
  try {
    const q = await SpeakingQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!q) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/speaking/questions/:id  (soft delete)
router.delete('/speaking/questions/:id', auth, teacherOnly, async (req, res) => {
  try {
    await SpeakingQuestion.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn câu hỏi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/speaking/questions/:id/permanent  (hard delete)
router.delete('/speaking/questions/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    await SpeakingQuestion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn câu hỏi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// SPEAKING – MATERIALS (PDF)
// ══════════════════════════════════════════════════

// GET /api/admin/speaking/materials
router.get('/speaking/materials', auth, teacherOnly, async (req, res) => {
  try {
    const materials = await SpeakingMaterial.find().sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/speaking/materials/upload-pdf
// Body: multipart/form-data with field "pdf"
router.post('/speaking/materials/upload-pdf', auth, teacherOnly, uploadPdfMemory.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Thiếu file PDF' });
    const dataUri = `data:application/pdf;base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'speaking-materials',
      resource_type: 'raw'
    });
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/speaking/materials
router.post('/speaking/materials', auth, teacherOnly, async (req, res) => {
  try {
    const m = new SpeakingMaterial(req.body);
    await m.save();
    res.status(201).json({ success: true, material: m });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/speaking/materials/:id
router.put('/speaking/materials/:id', auth, teacherOnly, async (req, res) => {
  try {
    const m = await SpeakingMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!m) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, material: m });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/speaking/materials/:id  (soft delete)
router.delete('/speaking/materials/:id', auth, teacherOnly, async (req, res) => {
  try {
    await SpeakingMaterial.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn tài liệu' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/speaking/materials/:id/permanent  (hard delete)
router.delete('/speaking/materials/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    await SpeakingMaterial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn tài liệu' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// WRITING SAMPLES (PDF)
// ══════════════════════════════════════════════════

// GET /api/admin/writing/samples
router.get('/writing/samples', auth, teacherOnly, async (req, res) => {
  try {
    const samples = await WritingSample.find().sort({ createdAt: -1 });
    res.json({ success: true, samples });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing/samples/upload-pdf
router.post('/writing/samples/upload-pdf', auth, teacherOnly, uploadPdfMemory.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Thiếu file PDF' });
    const dataUri = `data:application/pdf;base64,${req.file.buffer.toString('base64')}`;
    const result  = await cloudinary.uploader.upload(dataUri, {
      folder:        'writing-samples',
      resource_type: 'raw'
    });
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing/samples
router.post('/writing/samples', auth, teacherOnly, async (req, res) => {
  try {
    const s = new WritingSample(req.body);
    await s.save();
    res.status(201).json({ success: true, sample: s });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/writing/samples/:id
router.put('/writing/samples/:id', auth, teacherOnly, async (req, res) => {
  try {
    const s = await WritingSample.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!s) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, sample: s });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing/samples/:id  (soft delete)
router.delete('/writing/samples/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WritingSample.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn tài liệu' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing/samples/:id/permanent  (hard delete)
router.delete('/writing/samples/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    await WritingSample.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// USER MANAGEMENT
// ══════════════════════════════════════════════════

const User           = require('../models/User');
const VocabBook      = require('../models/VocabBook');
const VocabActivity  = require('../models/VocabActivity');
const bcrypt         = require('bcryptjs');

// GET /api/admin/users – danh sách user (có search, phân trang)
router.get('/users', auth, teacherOnly, async (req, res) => {
  try {
    const { search, role, isBanned, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { username:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } }
      ];
    }
    if (role)     filter.role = role;
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -savedVocab -resetOTP -resetOTPExpires')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ]);
    res.json({ success: true, users, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id – sửa thông tin user
router.put('/users/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { username, email, firstName, lastName, role, password } = req.body;
    const update = { username, email, firstName, lastName, role };
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .select('-password -savedVocab');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/ban – cấm / bỏ cấm user (có lý do)
router.put('/users/:id/ban', auth, teacherOnly, async (req, res) => {
  try {
    const { isBanned, banReason = '' } = req.body;
    const update = { isBanned };
    if (isBanned) update.banReason = banReason;
    else          update.banReason = '';

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
      .select('-password -savedVocab');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    res.json({ success: true, user, message: isBanned ? 'Đã cấm tài khoản' : 'Đã mở khóa tài khoản' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:id – xóa vĩnh viễn user
router.delete('/users/:id', auth, teacherOnly, async (req, res) => {
  try {
    // Không cho phép tự xóa chính mình
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản của chính mình' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa tài khoản' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// COURSES (Quản lý khóa học)
// ══════════════════════════════════════════════════

// GET /api/admin/courses
router.get('/courses', auth, teacherOnly, async (req, res) => {
  try {
    const courses = await Course.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/courses
router.post('/courses', auth, teacherOnly, async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/courses/:id
router.put('/courses/:id', auth, teacherOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/courses/:id  (soft delete – ẩn khỏi trang public)
router.delete('/courses/:id', auth, teacherOnly, async (req, res) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn khóa học' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/courses/:id/permanent  (hard delete)
router.delete('/courses/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn khóa học' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// DELETE EXAM ATTEMPTS (Admin xóa bài thi)
// ══════════════════════════════════════════════════

// DELETE /api/admin/attempts/:id  – xóa bài Reading
router.delete('/attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await TestAttempt.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi' });
    res.json({ success: true, message: 'Đã xóa bài thi Reading' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/listening-attempts/:id  – xóa bài Listening
router.delete('/listening-attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await ListeningAttempt.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi' });
    res.json({ success: true, message: 'Đã xóa bài thi Listening' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-attempts/:id  – xóa bài Writing
router.delete('/writing-attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await WritingAttempt.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi' });
    res.json({ success: true, message: 'Đã xóa bài nộp Writing' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// VOCAB STUDENT ANALYTICS
// ══════════════════════════════════════════════════

/**
 * GET /api/admin/vocab-books/:userId
 * Trả về chi tiết từng sổ từ vựng của 1 học sinh (dùng trong modal).
 */
router.get('/vocab-books/:userId', auth, teacherOnly, async (req, res) => {
  try {
    const books = await VocabBook.find({ userId: req.params.userId })
      .select('name emoji color isDefault words')
      .sort({ createdAt: 1 })
      .lean();

    const result = books.map(b => ({
      _id:           b._id,
      name:          b.name,
      emoji:         b.emoji,
      color:         b.color,
      isDefault:     b.isDefault,
      totalWords:    b.words.length,
      daThucCount:   b.words.filter(w => w.status === 'da-thuoc').length,
      nhoSoSoCount:  b.words.filter(w => w.status === 'nho-so-so').length,
      chuaThuocCount:b.words.filter(w => w.status === 'chua-thuoc').length,
    }));

    res.json({ success: true, books: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/vocab-students
 * Trả về danh sách học sinh kèm tổng thống kê từ vựng.
 * Query: search (string), sort (words-desc|views-desc|recent|name)
 */
router.get('/vocab-students', auth, teacherOnly, async (req, res) => {
  try {
    const { search = '', sort = 'words-desc' } = req.query;

    // 1. Lấy tất cả user (không lọc role để admin/teacher cũng thấy – nhưng ưu tiên student)
    const searchFilter = search
      ? {
          $or: [
            { username:  { $regex: search, $options: 'i' } },
            { email:     { $regex: search, $options: 'i' } },
            { firstName: { $regex: search, $options: 'i' } },
            { lastName:  { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find({ role: 'student', ...searchFilter })
      .select('username email firstName lastName createdAt learningStreak lastActivityDate isBanned')
      .lean();

    const userIds = users.map(u => u._id);

    // 2. Tổng hợp VocabBook: số sổ + số từ + phân loại trạng thái
    const bookStats = await VocabBook.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id:          '$userId',
          totalBooks:   { $sum: 1 },
          totalWords:   { $sum: { $size: '$words' } },
          daThuoc:   { $sum: { $size: { $filter: { input: '$words', as: 'w', cond: { $eq: ['$$w.status', 'da-thuoc']   } } } } },
          nhoSoSo:   { $sum: { $size: { $filter: { input: '$words', as: 'w', cond: { $eq: ['$$w.status', 'nho-so-so'] } } } } },
          chuaThuoc: { $sum: { $size: { $filter: { input: '$words', as: 'w', cond: { $eq: ['$$w.status', 'chua-thuoc']} } } } },
        },
      },
    ]);

    // 3. Tổng hợp VocabActivity: tổng view, từ thêm, từ ôn, ngày hoạt động cuối
    const actStats = await VocabActivity.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id:          '$userId',
          totalViews:   { $sum: '$viewCount'    },
          totalAdded:   { $sum: '$wordsAdded'   },
          totalStudied: { $sum: '$wordsStudied' },
          lastActivity: { $max: '$date'         },
          activeDays:   { $sum: { $cond: [{ $gt: ['$viewCount', 0] }, 1, 0] } },
        },
      },
    ]);

    // 4. Map thành object theo userId
    const bookMap = {};
    bookStats.forEach(s => { bookMap[s._id.toString()] = s; });
    const actMap  = {};
    actStats.forEach(s => { actMap[s._id.toString()] = s; });

    // 5. Ghép kết quả
    let result = users.map(u => {
      const uid = u._id.toString();
      const b   = bookMap[uid]  || {};
      const a   = actMap[uid]   || {};
      return {
        _id:          u._id,
        username:     u.username,
        email:        u.email,
        firstName:    u.firstName,
        lastName:     u.lastName,
        createdAt:    u.createdAt,
        isBanned:     u.isBanned,
        learningStreak: u.learningStreak || 0,
        // Vocab book stats
        totalBooks:   b.totalBooks  || 0,
        totalWords:   b.totalWords  || 0,
        daThuoc:      b.daThuoc     || 0,
        nhoSoSo:      b.nhoSoSo     || 0,
        chuaThuoc:    b.chuaThuoc   || 0,
        // Activity stats
        totalViews:   a.totalViews  || 0,
        totalAdded:   a.totalAdded  || 0,
        totalStudied: a.totalStudied || 0,
        activeDays:   a.activeDays  || 0,
        lastVocabActivity: a.lastActivity || null,
      };
    });

    // 6. Sắp xếp
    const sortFns = {
      'words-desc': (a, b) => b.totalWords   - a.totalWords,
      'views-desc': (a, b) => b.totalViews   - a.totalViews,
      'recent':     (a, b) => {
        const da = a.lastVocabActivity ? new Date(a.lastVocabActivity) : new Date(0);
        const db = b.lastVocabActivity ? new Date(b.lastVocabActivity) : new Date(0);
        return db - da;
      },
      'name':       (a, b) => (a.username || '').localeCompare(b.username || ''),
    };
    result.sort(sortFns[sort] || sortFns['words-desc']);

    res.json({ success: true, students: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/vocab-activity/:userId
 * Chi tiết hoạt động từ vựng của 1 học sinh, phân theo ngày/tháng/năm.
 * Query: view=day|month|year, year=YYYY, month=MM (1-12)
 */
router.get('/vocab-activity/:userId', auth, teacherOnly, async (req, res) => {
  try {
    const { view = 'day', year, month } = req.query;
    const userId  = req.params.userId;
    const mongoose = require('mongoose');

    const uid = new mongoose.Types.ObjectId(userId);

    let pipeline = [];
    let labels   = [];

    if (view === 'day') {
      // Hiển thị từng ngày trong tháng được chọn
      const y = parseInt(year)  || new Date().getUTCFullYear();
      const m = parseInt(month) || (new Date().getUTCMonth() + 1); // 1-12
      const from = new Date(Date.UTC(y, m - 1, 1));
      const to   = new Date(Date.UTC(y, m, 1));

      pipeline = [
        { $match: { userId: uid, date: { $gte: from, $lt: to } } },
        {
          $group: {
            _id:          { $dayOfMonth: '$date' },
            viewCount:    { $sum: '$viewCount'    },
            wordsAdded:   { $sum: '$wordsAdded'   },
            wordsStudied: { $sum: '$wordsStudied' },
          },
        },
        { $sort: { '_id': 1 } },
      ];

      // Số ngày trong tháng
      const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
      for (let d = 1; d <= daysInMonth; d++) labels.push(String(d));

    } else if (view === 'month') {
      // Hiển thị từng tháng trong năm được chọn
      const y    = parseInt(year) || new Date().getUTCFullYear();
      const from = new Date(Date.UTC(y, 0, 1));
      const to   = new Date(Date.UTC(y + 1, 0, 1));

      pipeline = [
        { $match: { userId: uid, date: { $gte: from, $lt: to } } },
        {
          $group: {
            _id:          { $month: '$date' },
            viewCount:    { $sum: '$viewCount'    },
            wordsAdded:   { $sum: '$wordsAdded'   },
            wordsStudied: { $sum: '$wordsStudied' },
          },
        },
        { $sort: { '_id': 1 } },
      ];

      labels = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

    } else {
      // Hiển thị từng năm (tất cả dữ liệu)
      pipeline = [
        { $match: { userId: uid } },
        {
          $group: {
            _id:          { $year: '$date' },
            viewCount:    { $sum: '$viewCount'    },
            wordsAdded:   { $sum: '$wordsAdded'   },
            wordsStudied: { $sum: '$wordsStudied' },
          },
        },
        { $sort: { '_id': 1 } },
      ];
    }

    const raw = await VocabActivity.aggregate(pipeline);

    // Chuyển thành mảng đủ cho mọi slot (ngày/tháng/năm)
    let data;
    if (view === 'day') {
      const daysInMonth = labels.length;
      const map = {};
      raw.forEach(r => { map[r._id] = r; });
      data = labels.map((lbl, i) => {
        const r = map[i + 1] || {};
        return { label: lbl, viewCount: r.viewCount || 0, wordsAdded: r.wordsAdded || 0, wordsStudied: r.wordsStudied || 0 };
      });
    } else if (view === 'month') {
      const map = {};
      raw.forEach(r => { map[r._id] = r; });
      data = labels.map((lbl, i) => {
        const r = map[i + 1] || {};
        return { label: lbl, viewCount: r.viewCount || 0, wordsAdded: r.wordsAdded || 0, wordsStudied: r.wordsStudied || 0 };
      });
    } else {
      data = raw.map(r => ({
        label: String(r._id), viewCount: r.viewCount || 0, wordsAdded: r.wordsAdded || 0, wordsStudied: r.wordsStudied || 0,
      }));
    }

    res.json({ success: true, view, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;