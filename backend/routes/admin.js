const express      = require('express');
const router       = express.Router();
const crypto       = require('crypto');

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Tính streak hiển thị đúng dựa trên lastActivityDate (không ghi DB)
// Dùng múi giờ VN (UTC+7), cùng logic với User.resetIfStale
function effectiveStreak(learningStreak, lastActivityDate) {
  if (!lastActivityDate) return learningStreak || 0;
  const toVNDay = d => {
    const v = new Date(d.getTime() + 7 * 3600000);
    return new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate()));
  };
  const today   = toVNDay(new Date());
  const lastDay = toVNDay(new Date(lastActivityDate));
  const diff    = Math.floor((today - lastDay) / 86400000);
  return diff >= 2 ? 0 : (learningStreak || 0);
}
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
const WPTopic      = require('../models/WPTopic');
const WPExercise   = require('../models/WPExercise');
const WritingPracticeAttempt = require('../models/WritingPracticeAttempt');
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
    const passages = await Passage.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
      { $project: {
        title: 1, category: 1, difficulty: 1, tags: 1, isActive: 1, questionRange: 1, createdAt: 1,
        questionCount: {
          $add: [
            { $size: { $ifNull: ['$questions', []] } },
            { $sum: { $map: {
              input: { $ifNull: ['$questionGroups', []] },
              as: 'g',
              in: { $size: { $ifNull: ['$$g.questions', []] } }
            }}}
          ]
        }
      }}
    ]);
    const total = await Passage.countDocuments(filter);
    res.json({ success: true, passages, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/passages/stats – số lượng passage active theo từng category
router.get('/passages/stats', auth, teacherOnly, async (req, res) => {
  try {
    const stats = await Passage.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const result = { passage1: 0, passage2: 0, passage3: 0 };
    stats.forEach(s => { if (s._id in result) result[s._id] = s.count; });
    res.json({ success: true, stats: result });
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
          const Model = k.testType === 'listening' ? ListeningTest
                      : k.testType === 'writing'   ? WritingExam
                      : ReadingTest;
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
    const LIMIT = Math.min(parseInt(req.query.limit) || 80, 300);
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
        bandScore: h.grading?.overallBand ?? null,
        correctCount: null,
        totalQuestions: null,
        duration: null
      }))
    ];

    rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, attempts: rows.slice(0, LIMIT * 3) });
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
      .select('-task1Answer -task2Answer -task1Snapshot -task2Snapshot');
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
      const re = escapeRegex(search);
      filter.$or = [
        { username:  { $regex: re, $options: 'i' } },
        { email:     { $regex: re, $options: 'i' } },
        { firstName: { $regex: re, $options: 'i' } },
        { lastName:  { $regex: re, $options: 'i' } }
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

// GET /api/admin/users/:id – lấy thông tin chi tiết 1 user
router.get('/users/:id', auth, teacherOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -savedVocab -resetOTP -resetOTPExpires');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/users – tạo tài khoản mới (chỉ admin/teacher)
router.post('/users', auth, teacherOnly, async (req, res) => {
  try {
    const { username, email, password, role = 'student', firstName = '', lastName = '' } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ username, email và mật khẩu.' });
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res.status(400).json({ success: false, message: 'Username hoặc email đã tồn tại.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role, firstName, lastName });
    const safe = user.toObject();
    delete safe.password;
    res.json({ success: true, user: safe, message: 'Đã tạo tài khoản thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id – sửa thông tin user
router.put('/users/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { username, email, firstName, lastName, role, isBanned, newPassword } = req.body;
    const update = { username, email, firstName, lastName, role };
    if (isBanned !== undefined) update.isBanned = isBanned;
    if (newPassword) {
      update.password = await bcrypt.hash(newPassword, 10);
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
// WRITING AI GRADING
// ══════════════════════════════════════════════════

async function gradeTaskWithAI(taskType, prompt, answer, wordCount) {
  const minWords = taskType === 1 ? 150 : 250;
  const isUnderLength = wordCount < minWords;
  const isIncomplete = answer.trim().length > 0 && !answer.trim().match(/[.!?]["']?\s*$/);

  const task1TA = `Task Achievement (TA) – Task 1:
3: does not address requirements; key features largely irrelevant; limited info presented.
4: few key features selected; features may be irrelevant/repetitive/inaccurate; format may be inappropriate.
5: key features NOT adequately covered; recounting mainly mechanical; may be no data to support description; limited extension.
6: key features covered and highlighted; overview attempted; some irrelevant/inaccurate detail; some details missing or excessive.
7: covers requirements with few omissions; clear overview; data categorised; main trends/differences identified.
8: all requirements covered appropriately, relevantly, sufficiently; key features skilfully selected, highlighted and illustrated.
CAPS: essay cut off/incomplete → TA ≤ 4; under 150 words → TA ≤ 5; no overview → TA ≤ 5.`;

  const task2TR = `Task Response (TR) – Task 2:
3: no part adequately addressed or misunderstood; no relevant position; few ideas, may be irrelevant.
4: prompt tackled minimally or tangentially; position discernible but hard to find; main ideas difficult to identify; large parts repetitive.
5: main parts INCOMPLETELY addressed; position expressed but development not always clear; ideas limited and not sufficiently developed.
6: main parts addressed; position relevant but conclusions may be unclear/unjustified; main ideas relevant but some insufficiently developed.
7: main parts appropriately addressed; clear developed position; ideas extended and supported (may over-generalise).
8: prompt appropriately and sufficiently addressed; clear well-developed position; ideas well extended and supported.
CAPS: essay cut off/incomplete → TR ≤ 4; under 250 words → TR ≤ 5; no identifiable position → TR ≤ 4.`;

  const sharedDescriptors = `CC: 4=ideas not arranged coherently/no progression; 5=organisation evident but not wholly logical; 6=generally coherent, clear overall progression, some faulty cohesion; 7=logically organised, clear progression, cohesive devices used flexibly; 8=logically sequenced, cohesion well managed.
LR: 4=basic vocab, repetitive, errors may impede meaning; 5=limited range, frequent lapses in word choice; 6=generally adequate, meaning clear despite restricted range; 7=sufficient flexibility/precision, some less-common items; 8=wide resource, precise meanings, skilful use of idiomatic items.
GRA: 4=very limited structures, grammatical errors frequent, may impede meaning; 5=limited repetitive structures, complex attempts tend to be faulty; 6=mix of simple/complex, limited flexibility, errors rarely impede; 7=variety of complex structures, generally well controlled; 8=wide range, majority of sentences error-free.`;

  const taLabel = taskType === 1 ? 'Task Achievement' : 'Task Response';
  const taskDescriptor = taskType === 1 ? task1TA : task2TR;

  const wordCountNote = isUnderLength
    ? `\nCẢNH BÁO: Bài viết chỉ có ${wordCount} từ (tối thiểu ${minWords} từ). Áp dụng cap điểm ${taLabel}.`
    : '';
  const incompleteNote = isIncomplete
    ? `\nCẢNH BÁO: Bài viết bị cắt đứt giữa chừng (không kết thúc bằng câu hoàn chỉnh). Áp dụng cap: ${taLabel} ≤ 4.`
    : '';

  const systemPrompt = `You are a strict IELTS examiner. Apply official IDP/BC May 2023 Band Descriptors exactly. Enforce all band caps for incomplete essays, under-length responses, missing overview (Task 1) or missing position (Task 2). Respond ONLY in valid JSON.`;

  const userPrompt = `Grade this IELTS Academic Writing Task ${taskType} (${wordCount} từ).${wordCountNote}${incompleteNote}

BAND DESCRIPTORS – ${taLabel}:
${taskDescriptor}

BAND DESCRIPTORS – CC / LR / GRA:
${sharedDescriptors}

**Đề bài:** ${prompt}

**Bài làm của học sinh:**
${answer}

STEP 1 – SCORES: Score each criterion 3–8, write 1–2 sentences Vietnamese justification per criterion (dùng ngôn ngữ của band descriptor, xưng hô "em" với học sinh).
STEP 2 – SENTENCE FEEDBACK: Go through EVERY sentence. For each sentence with errors or room for improvement: mark as "issue". For sentences with no significant problems: mark as "ok".

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{"bandScore":<avg 4 scores nearest 0.5>,"ta":{"score":<3-8>,"comment":"<Vietnamese justification 1-2 sentences>"},"cc":{"score":<3-8>,"comment":"<Vietnamese>"},"lr":{"score":<3-8>,"comment":"<Vietnamese>"},"gra":{"score":<3-8>,"comment":"<Vietnamese>"},"overallFeedback":"<1-2 câu Vietnamese: điểm mạnh + điểm yếu chính, xưng 'em'>","sentenceFeedback":[{"type":"issue","original":"<exact sentence from essay>","criterion":"<TA/CC/LR/GRA>","issue":"<Vietnamese brief explanation>","better":"<corrected English version>"},{"type":"ok","original":"<exact sentence>"}]}

Rules: bandScore = average(ta+cc+lr+gra)/4 rounded to nearest 0.5; sentenceFeedback must cover every sentence in order; all comment/feedback text in Vietnamese except "better" field which is English.`;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY chưa được cấu hình');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI không trả về JSON hợp lệ');
  return JSON.parse(jsonMatch[0]);
}

// POST /api/admin/writing-attempts/:id/ai-grade
// Body: { taskNum: 1 | 2 }  — grade only one task at a time to avoid rate limit
router.post('/writing-attempts/:id/ai-grade', auth, teacherOnly, async (req, res) => {
  try {
    const attempt = await WritingAttempt.findById(req.params.id).lean();
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp' });

    const taskNum = Number(req.body.taskNum);
    if (taskNum !== 1 && taskNum !== 2)
      return res.status(400).json({ success: false, message: 'taskNum phải là 1 hoặc 2' });

    const isTask1 = taskNum === 1;
    const taskPrompt = isTask1
      ? (attempt.task1Snapshot?.prompt || '')
      : (attempt.task2Snapshot?.prompt || '');
    const taskAnswer = isTask1 ? (attempt.task1Answer || '') : (attempt.task2Answer || '');
    const wordCount  = isTask1 ? (attempt.wordCount1 || 0) : (attempt.wordCount2 || 0);

    const gradeResult = await gradeTaskWithAI(taskNum, taskPrompt, taskAnswer, wordCount);

    const field = isTask1 ? 'aiGrading.task1' : 'aiGrading.task2';
    await WritingAttempt.findByIdAndUpdate(req.params.id, {
      $set: { [field]: gradeResult, 'aiGrading.generatedAt': new Date(), gradingStatus: 'ai_done' }
    });

    res.json({ success: true, taskNum, result: gradeResult });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/writing-attempts/:id/confirm-grade
router.put('/writing-attempts/:id/confirm-grade', auth, teacherOnly, async (req, res) => {
  try {
    const { task1, task2, overallBand, adminNote } = req.body;
    const confirmedBy = req.user.username || req.user._id.toString();
    const confirmedAt = new Date();

    const attempt = await WritingAttempt.findByIdAndUpdate(req.params.id, {
      grading: { task1, task2, overallBand, adminNote: adminNote || '', confirmedAt, confirmedBy },
      gradingStatus: 'confirmed'
    }, { new: false }); // get the original to read userId + examName

    res.json({ success: true, message: 'Đã xác nhận điểm' });

    // Send email notification (fire-and-forget, không block response)
    if (attempt && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const student = await User.findById(attempt.userId).select('email firstName username').lean();
        if (student?.email) {
          const nodemailer = require('nodemailer');
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
          });
          const displayName = student.firstName || student.username || 'bạn';
          const bandColor = overallBand >= 7 ? '#16a34a' : overallBand >= 5.5 ? '#2563eb' : '#d97706';
          await transporter.sendMail({
            from: `"EnglishWithDan" <${process.env.EMAIL_USER}>`,
            to: student.email,
            subject: `✅ Bài Writing "${attempt.examName || 'của bạn'}" đã được chấm – Band ${overallBand}`,
            html: `
<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8f9fb;padding:32px 24px;border-radius:12px">
  <div style="text-align:center;margin-bottom:24px">
    <div style="font-size:22px;font-weight:800;letter-spacing:-.5px">
      <span style="color:#3d8bff">Daniel</span><span style="color:#e53935">Hà</span>
    </div>
  </div>
  <div style="background:#fff;border-radius:12px;padding:28px 24px;border:1px solid #e5e7eb">
    <p style="font-size:16px;font-weight:700;color:#111;margin:0 0 8px">Xin chào ${displayName}! 👋</p>
    <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.6">Bài thi Writing <strong style="color:#111">"${attempt.examName || ''}"</strong> của bạn đã được giáo viên chấm xong.</p>

    <div style="text-align:center;background:linear-gradient(135deg,#eff6ff,#f0fdf4);border:2px solid #3b82f6;border-radius:12px;padding:20px;margin-bottom:20px">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px">Overall Band Score</div>
      <div style="font-size:52px;font-weight:900;color:${bandColor};line-height:1">${overallBand ?? '–'}</div>
    </div>

    ${adminNote ? `
    <div style="background:#ecfdf5;border-left:4px solid #10b981;border-radius:8px;padding:12px 16px;margin-bottom:20px">
      <div style="font-size:12px;font-weight:700;color:#059669;margin-bottom:4px">💬 Nhận xét từ giáo viên</div>
      <div style="font-size:14px;color:#065f46;line-height:1.65">${adminNote}</div>
    </div>` : ''}

    <div style="text-align:center;margin-top:8px">
      <a href="https://englishwithdan.onrender.com/writing.html"
        style="display:inline-block;background:#e53935;color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:700">
        📋 Xem bài làm & Feedback chi tiết
      </a>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px">EnglishWithDan · Đây là email tự động, vui lòng không trả lời.</p>
</div>`
          });
        }
      } catch (mailErr) {
        console.error('[Writing] Grade email error:', mailErr.message);
      }
    }
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
    const re = search ? escapeRegex(search) : null;
    const searchFilter = re
      ? {
          $or: [
            { username:  { $regex: re, $options: 'i' } },
            { email:     { $regex: re, $options: 'i' } },
            { firstName: { $regex: re, $options: 'i' } },
            { lastName:  { $regex: re, $options: 'i' } },
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
        learningStreak: effectiveStreak(u.learningStreak, u.lastActivityDate),
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

// ══════════════════════════════════════════════════
// WRITING PRACTICE (WP) – Topics
// ══════════════════════════════════════════════════
router.get('/wp-topics', auth, teacherOnly, async (req, res) => {
  try {
    const topics = await WPTopic.find({}).sort({ orderIndex: 1, createdAt: 1 }).lean();
    res.json({ success: true, topics });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/wp-topics', auth, teacherOnly, async (req, res) => {
  try {
    const topic = await WPTopic.create(req.body);
    res.json({ success: true, topic });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/wp-topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WPTopic.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/wp-topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WPTopic.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ══════════════════════════════════════════════════
// WRITING PRACTICE (WP) – Exercises
// ══════════════════════════════════════════════════
router.get('/wp-exercises', auth, teacherOnly, async (req, res) => {
  try {
    const { level, topic, type, active, limit = 50, skip = 0 } = req.query;
    const q = {};
    if (level && level !== 'all') q.level = level;
    if (topic && topic !== 'all') q.topicKey = topic;
    if (type  && type  !== 'all') q.type = type;
    if (active === 'true')  q.isActive = true;
    if (active === 'false') q.isActive = false;
    const [exercises, total] = await Promise.all([
      WPExercise.find(q).sort({ orderIndex: 1, createdAt: -1 }).skip(+skip).limit(+limit).lean(),
      WPExercise.countDocuments(q)
    ]);
    res.json({ success: true, exercises, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/wp-exercises', auth, teacherOnly, async (req, res) => {
  try {
    const ex = await WPExercise.create(req.body);
    res.json({ success: true, exercise: ex });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/wp-exercises/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WPExercise.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/wp-exercises/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WPExercise.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ══════════════════════════════════════════════════
// WRITING PRACTICE (WP) – Attempts
// ══════════════════════════════════════════════════
router.get('/wp-attempts', auth, teacherOnly, async (req, res) => {
  try {
    const { limit = 100, skip = 0 } = req.query;
    const [attempts, total] = await Promise.all([
      WritingPracticeAttempt.find({})
        .populate('studentId', 'username displayName')
        .sort({ createdAt: -1 })
        .skip(+skip).limit(+limit).lean(),
      WritingPracticeAttempt.countDocuments()
    ]);
    res.json({ success: true, attempts, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/wp-attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WritingPracticeAttempt.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ══════════════════════════════════════════════════
// ONLINE USERS
// ══════════════════════════════════════════════════

// GET /api/admin/online-users  – ai đang online (lastSeen trong 5 phút gần nhất)
router.get('/online-users', auth, teacherOnly, async (req, res) => {
  try {
    const since = new Date(Date.now() - 5 * 60 * 1000);
    const users = await User.find({ lastSeen: { $gte: since } })
      .select('username role lastSeen')
      .lean();
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// MESSAGES (Admin gửi thư cho học sinh)
// ══════════════════════════════════════════════════
const Message = require('../models/Message');

// GET /api/admin/messages  – danh sách thư đã gửi
router.get('/messages', auth, teacherOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [messages, total] = await Promise.all([
      Message.find({ fromId: req.user._id })
        .populate('toId', 'username')
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .lean(),
      Message.countDocuments({ fromId: req.user._id })
    ]);
    res.json({ success: true, messages, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/messages  – gửi thư mới
router.post('/messages', auth, teacherOnly, async (req, res) => {
  try {
    const { toId, subject, body, isBroadcast } = req.body;
    if (!body?.trim()) return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
    if (!isBroadcast && !toId) return res.status(400).json({ success: false, message: 'Vui lòng chọn người nhận' });

    const msg = new Message({
      fromId:      req.user._id,
      fromName:    req.user.username,
      toId:        isBroadcast ? null : toId,
      subject:     subject?.trim() || '',
      body:        body.trim(),
      isBroadcast: !!isBroadcast,
    });
    await msg.save();
    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/messages/:id  – xóa thư đã gửi
router.delete('/messages/:id', auth, teacherOnly, async (req, res) => {
  try {
    await Message.findOneAndDelete({ _id: req.params.id, fromId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// TASK 1 EXERCISES CRUD
// ══════════════════════════════════════════════════
const Task1Exercise = require('../models/Task1Exercise');

// GET /api/admin/task1/exercises
router.get('/task1/exercises', auth, teacherOnly, async (req, res) => {
  try {
    const { level = 'all', skillType = 'all', type = 'all', page = 1, limit = 20, search = '' } = req.query;
    const query = {};
    if (level !== 'all') query.level = level;
    if (skillType !== 'all') query.skillType = skillType;
    if (type !== 'all') query.type = type;
    if (search) query.instruction = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [exercises, total] = await Promise.all([
      Task1Exercise.find(query).sort({ skillType: 1, orderIndex: 1 }).skip(skip).limit(Number(limit)).lean(),
      Task1Exercise.countDocuments(query)
    ]);
    res.json({ success: true, exercises, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task1/exercises
router.post('/task1/exercises', auth, teacherOnly, async (req, res) => {
  try {
    const ex = new Task1Exercise(req.body);
    await ex.save();
    res.status(201).json({ success: true, exercise: ex });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/task1/exercises/:id
router.put('/task1/exercises/:id', auth, teacherOnly, async (req, res) => {
  try {
    const ex = await Task1Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    res.json({ success: true, exercise: ex });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task1/exercises/:id
router.delete('/task1/exercises/:id', auth, teacherOnly, async (req, res) => {
  try {
    const ex = await Task1Exercise.findByIdAndDelete(req.params.id);
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// TASK 2 TOPICS CRUD
// ══════════════════════════════════════════════════
const Task2Topic = require('../models/Task2Topic');

// GET /api/admin/task2/topics
router.get('/task2/topics', auth, teacherOnly, async (req, res) => {
  try {
    const { week = 'all', essayType = 'all', search = '', page = 1, limit = 20 } = req.query;
    const query = {};
    if (week !== 'all') query.week = parseInt(week);
    if (essayType !== 'all') query.essayType = essayType;
    if (search) query.topicName = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [topics, total] = await Promise.all([
      Task2Topic.find(query).sort({ week: 1, orderIndex: 1 }).skip(skip).limit(Number(limit)).lean(),
      Task2Topic.countDocuments(query)
    ]);
    res.json({ success: true, topics, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/task2/topics/:id
router.get('/task2/topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    const topic = await Task2Topic.findById(req.params.id).lean();
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    res.json({ success: true, topic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task2/topics
router.post('/task2/topics', auth, teacherOnly, async (req, res) => {
  try {
    const topic = new Task2Topic(req.body);
    await topic.save();
    res.status(201).json({ success: true, topic });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/task2/topics/:id
router.put('/task2/topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { questions, ...topicData } = req.body; // questions managed separately
    const topic = await Task2Topic.findByIdAndUpdate(req.params.id, topicData, { new: true, runValidators: true });
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    res.json({ success: true, topic });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task2/topics/:id
router.delete('/task2/topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    const topic = await Task2Topic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task2/topics/:id/questions
router.post('/task2/topics/:id/questions', auth, teacherOnly, async (req, res) => {
  try {
    const topic = await Task2Topic.findByIdAndUpdate(
      req.params.id,
      { $push: { questions: req.body } },
      { new: true, runValidators: true }
    );
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    const q = topic.questions[topic.questions.length - 1];
    res.status(201).json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/task2/topics/:topicId/questions/:qid
router.put('/task2/topics/:topicId/questions/:qid', auth, teacherOnly, async (req, res) => {
  try {
    const update = {};
    Object.keys(req.body).forEach(k => { update[`questions.$.${k}`] = req.body[k]; });
    const topic = await Task2Topic.findOneAndUpdate(
      { _id: req.params.topicId, 'questions._id': req.params.qid },
      { $set: update },
      { new: true }
    );
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    const q = topic.questions.find(q => q._id.toString() === req.params.qid);
    res.json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task2/topics/:topicId/questions/:qid
router.delete('/task2/topics/:topicId/questions/:qid', auth, teacherOnly, async (req, res) => {
  try {
    const topic = await Task2Topic.findByIdAndUpdate(
      req.params.topicId,
      { $pull: { questions: { _id: req.params.qid } } },
      { new: true }
    );
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/reseed-task2-week12 — delete duplicates + re-insert fresh week-12 topics
router.post('/reseed-task2-week12', auth, teacherOnly, async (req, res) => {
  try {
    const { reseedWeek12 } = require('../scripts/seedTask2Exercises');
    await reseedWeek12();
    res.json({ success: true, message: 'Đã re-seed 5 topics tuần 12.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/fix-task1-context — add data context to ambiguous by/to questions
router.post('/fix-task1-context', auth, teacherOnly, async (req, res) => {
  try {
    const { run } = require('../scripts/updateTask1Context');
    await run();
    res.json({ success: true, message: 'Updated task1 context for Q15 and Q16.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// TASK 2 TEMPLATES CRUD
// ══════════════════════════════════════════════════
const Task2Template = require('../models/Task2Template');

const SEED_TEMPLATES = [
  { typeId:'type01', label:'Type 01', sub:'Adv & Disadv', name:'Advantages & Disadvantages', orderIndex:0, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:'In recent years, (noun phrase) has become an increasingly ___ feature of modern life, attracting considerable public attention.', answer:'prominent', vi:'→ Trong những năm gần đây, ... đã trở thành một phần ngày càng nổi bật trong đời sống hiện đại.' },
      { en:'With the growing prevalence of (noun phrase), questions have ___ regarding its overall impact.', answer:'arisen', vi:'→ Khi ... ngày càng phổ biến, nhiều câu hỏi đã được đặt ra về tác động tổng thể của nó.' },
      { en:'As society continues to evolve, the emergence of (noun phrase) has ___ widespread debate.', answer:'sparked', vi:'→ Khi xã hội tiếp tục phát triển, sự xuất hiện của ... đã làm dấy lên nhiều cuộc tranh luận.' },
      { en:'This essay will examine both the advantages and ___ of (noun phrase).', answer:'disadvantages', vi:'→ Bài luận này sẽ phân tích cả ưu điểm và nhược điểm của ...' },
      { en:'The following discussion aims to provide a ___ analysis of the positive and negative aspects associated with (noun phrase).', answer:'balanced', vi:'→ Bài viết sau sẽ đưa ra phân tích cân bằng về các mặt tích cực và tiêu cực của ...' },
    ]},
    { title:'② Body 1 – Advantages · Ưu điểm', items:[
      { en:'One of the most significant ___ of (noun phrase) is that (clause).', answer:'advantages', vi:'→ Một trong những lợi ích quan trọng nhất của ... là ...' },
      { en:'A key benefit of (noun phrase) ___ in its ability to (verb).', answer:'lies', vi:'→ Một lợi ích chính của ... nằm ở khả năng ...' },
      { en:'To begin with, (noun phrase) ___ individuals to (verb), thereby improving (noun phrase).', answer:'enables', vi:'→ Trước hết, ... cho phép con người ..., từ đó cải thiện ...' },
      { en:'In addition, the adoption of (noun phrase) can contribute to (noun phrase), which plays a ___ role in (verb+ing).', answer:'crucial', vi:'→ Thêm vào đó, việc áp dụng ... có thể góp phần vào ..., điều này đóng vai trò quan trọng trong việc ...' },
      { en:'Furthermore, (noun phrase) often leads to greater efficiency and ___.', answer:'productivity', vi:'→ Ngoài ra, ... thường dẫn đến hiệu quả và năng suất cao hơn.' },
      { en:'For example, recent studies have shown that (fact/statistic). A clear ___ of this can be seen in (specific example), where (positive outcome) occurred.', answer:'illustration', vi:'→ Ví dụ, các nghiên cứu gần đây cho thấy rằng ... Một minh chứng rõ ràng có thể thấy ở (ví dụ cụ thể), nơi (kết quả tích cực) đã xảy ra.' },
    ]},
    { title:'③ Body 2 – Disadvantages · Hạn chế', items:[
      { en:'Despite its advantages, (noun phrase) is not without its ___.', answer:'limitations', vi:'→ Mặc dù có nhiều lợi ích, ... không phải là không có hạn chế.' },
      { en:'However, the increasing ___ on (noun phrase) may give rise to several concerns.', answer:'reliance', vi:'→ Tuy nhiên, sự phụ thuộc ngày càng nhiều vào ... có thể gây ra một số vấn đề đáng lo ngại.' },
      { en:'One major concern is that (clause), which may ___ to (negative consequence).', answer:'lead', vi:'→ Một mối lo ngại lớn là ..., điều này có thể dẫn đến (hệ quả tiêu cực).' },
      { en:'Additionally, dependence on (noun phrase) could result in (noun phrase), thereby ___ (noun phrase).', answer:'undermining', vi:'→ Thêm vào đó, sự phụ thuộc vào ... có thể dẫn đến ..., từ đó làm suy yếu ...' },
      { en:'Another potential ___ involves (noun phrase), which might contribute to (undesirable outcome).', answer:'drawback', vi:'→ Một hạn chế tiềm ẩn khác liên quan đến ..., điều này có thể góp phần gây ra kết quả không mong muốn.' },
      { en:'For instance, research has ___ that (fact/statistic).', answer:'indicated', vi:'→ Chẳng hạn, nghiên cứu đã chỉ ra rằng (sự thật/thống kê).' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, although (noun phrase) offers clear benefits such as (advantage 1) and (advantage 2), it also ___ notable disadvantages, including (disadvantage 1) and (disadvantage 2).', answer:'entails', vi:'→ Tóm lại, mặc dù ... mang lại những lợi ích rõ ràng như (lợi ích 1) và (lợi ích 2), nó cũng tồn tại những hạn chế đáng kể như (hạn chế 1) và (hạn chế 2).' },
      { en:'On ___, it can be argued that the advantages of (noun phrase) outweigh its drawbacks.', answer:'balance', vi:'→ Xét tổng thể, có thể lập luận rằng lợi ích của ... vượt trội hơn hạn chế.' },
      { en:'Nevertheless, careful management and ___ are essential to minimize its negative effects.', answer:'regulation', vi:'→ Tuy nhiên, việc quản lý và điều chỉnh cẩn thận là cần thiết để giảm thiểu tác động tiêu cực.' },
    ]},
  ]},
  { typeId:'type02', label:'Type 02', sub:'Discuss Both', name:'Discuss Both Views', orderIndex:1, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:'In recent decades, the issue of (noun phrase) has ___ increasing public attention.', answer:'attracted', vi:'→ Trong vài thập kỷ gần đây, vấn đề ... đã thu hút sự quan tâm ngày càng lớn của công chúng.' },
      { en:'There has been an ongoing ___ about whether (clause).', answer:'debate', vi:'→ Đã có một cuộc tranh luận kéo dài về việc liệu ...' },
      { en:'With the rapid development of (noun phrase), ___ opinions have emerged regarding its impact.', answer:'differing', vi:'→ Với sự phát triển nhanh chóng của ..., nhiều quan điểm trái chiều đã xuất hiện về tác động của nó.' },
      { en:'While some people argue that (clause), ___ believe that (clause).', answer:'others', vi:'→ Trong khi một số người cho rằng ..., những người khác lại tin rằng ...' },
      { en:'This essay will discuss both ___ before presenting my own viewpoint.', answer:'perspectives', vi:'→ Bài viết này sẽ thảo luận cả hai quan điểm trước khi đưa ra ý kiến cá nhân.' },
      { en:'The following discussion will examine the arguments on both sides and offer a ___ conclusion.', answer:'balanced', vi:'→ Bài viết sau sẽ xem xét lập luận của cả hai phía và đưa ra kết luận cân bằng.' },
    ]},
    { title:'② Body 1 – First View · Quan điểm 1', items:[
      { en:'There are several convincing reasons why some people ___ (noun/gerund).', answer:'support', vi:'→ Có nhiều lý do thuyết phục khiến một số người ủng hộ ...' },
      { en:'One major reason for this view is that (clause). This is largely because (reason). As a ___, (consequence).', answer:'result', vi:'→ Điều này chủ yếu là do ... Kết quả là ...' },
      { en:'Unlike in the past, when (past situation), ___ (current trend).', answer:'nowadays', vi:'→ Không giống như trước đây, khi (tình huống quá khứ), ngày nay (xu hướng hiện tại).' },
      { en:'For instance, research has shown that (fact/statistic). This ___ that (implication).', answer:'suggests', vi:'→ Ví dụ, nghiên cứu đã chỉ ra rằng ... Điều này cho thấy rằng (hàm ý).' },
      { en:'Furthermore, another important factor to ___ is (noun phrase).', answer:'consider', vi:'→ Hơn nữa, một yếu tố quan trọng khác cần xem xét là ...' },
      { en:'In addition, many experts ___ that (clause).', answer:'believe', vi:'→ Ngoài ra, nhiều chuyên gia tin rằng ...' },
    ]},
    { title:'③ Body 2 – Opposing View · Quan điểm đối lập', items:[
      { en:'On the other ___, critics argue that (clause).', answer:'hand', vi:'→ Mặt khác, những người phản đối cho rằng ...' },
      { en:'However, an ___ perspective suggests that (clause).', answer:'alternative', vi:'→ Tuy nhiên, một quan điểm khác cho rằng ...' },
      { en:'One key concern is that (clause). This may ___ to (negative consequence).', answer:'lead', vi:'→ Một mối lo ngại chính là ... Điều này có thể dẫn đến (hệ quả tiêu cực).' },
      { en:'If (condition), it could result in (outcome). Such a situation is often ___ by (factor).', answer:'driven', vi:'→ Nếu (điều kiện), nó có thể dẫn đến (kết quả). Tình huống này thường được thúc đẩy bởi (yếu tố).' },
      { en:'This highlights the potential risks ___ with (noun/gerund).', answer:'associated', vi:'→ Điều này làm nổi bật những rủi ro tiềm ẩn liên quan đến ...' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, both ___ offer valid arguments regarding (noun/gerund).', answer:'perspectives', vi:'→ Tóm lại, cả hai quan điểm đều đưa ra những lập luận hợp lý về ...' },
      { en:'Personally, I believe that (stance) because (main reason). Moving forward, ___ should consider (action) to address these concerns.', answer:'policymakers', vi:'→ Cá nhân tôi tin rằng (lập trường) vì (lý do chính). Trong tương lai, các nhà hoạch định chính sách nên xem xét (hành động) để giải quyết những vấn đề này.' },
    ]},
  ]},
  { typeId:'type03', label:'Type 03', sub:'Cause–Solution', name:'Cause – Solution', orderIndex:2, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:'In recent years, (noun phrase) has become an increasingly serious ___ in many parts of the world.', answer:'concern', vi:'→ Trong những năm gần đây, ... đã trở thành một vấn đề ngày càng nghiêm trọng ở nhiều nơi trên thế giới.' },
      { en:'One of the major ___ facing modern society today is (noun phrase).', answer:'challenges', vi:'→ Một trong những thách thức lớn mà xã hội hiện đại đang phải đối mặt là ...' },
      { en:'This essay will explore the main ___ of (noun phrase) and propose practical solutions to address this problem.', answer:'causes', vi:'→ Bài viết này sẽ phân tích các nguyên nhân chính và đề xuất những giải pháp thiết thực.' },
    ]},
    { title:'② Body 1 – Causes · Nguyên nhân', items:[
      { en:'There are several underlying factors contributing to (noun phrase). The root causes ___ from both social and economic factors.', answer:'stem', vi:'→ Có nhiều yếu tố cơ bản góp phần gây ra ... Nguyên nhân gốc rễ bắt nguồn từ cả yếu tố xã hội lẫn kinh tế.' },
      { en:'One of the ___ reasons behind this problem is (cause). This can largely be attributed to (noun phrase).', answer:'primary', vi:'→ Một trong những nguyên nhân chính của vấn đề này là ... Điều này phần lớn bắt nguồn từ ...' },
      { en:'For instance, (specific example). This ___ that (implication).', answer:'suggests', vi:'→ Ví dụ, (ví dụ cụ thể). Điều này cho thấy rằng (hàm ý).' },
      { en:'Another ___ contributor is (cause). Unlike in the past, when (past situation), today (current trend).', answer:'significant', vi:'→ Một yếu tố quan trọng khác là ... Không giống như trước đây, ngày nay ...' },
      { en:'If this trend continues, it could ___ to (negative consequence).', answer:'lead', vi:'→ Nếu xu hướng này tiếp diễn, nó có thể dẫn đến (hệ quả tiêu cực).' },
    ]},
    { title:'③ Body 2 – Solutions · Giải pháp', items:[
      { en:'Nevertheless, several practical ___ can be taken to address this issue effectively.', answer:'measures', vi:'→ Tuy nhiên, có thể thực hiện một số biện pháp thiết thực để giải quyết vấn đề này hiệu quả.' },
      { en:'One effective way to ___ this problem is to (verb).', answer:'tackle', vi:'→ Một cách hiệu quả là giải quyết vấn đề này bằng cách ...' },
      { en:'This would ensure that (mechanism/explanation), ultimately ___ to (positive outcome).', answer:'leading', vi:'→ Điều này sẽ đảm bảo rằng (giải thích cơ chế), cuối cùng dẫn đến (kết quả tích cực).' },
      { en:'Not only would this help (effect 1), but it would ___ (effect 2).', answer:'also', vi:'→ Giải pháp này không chỉ giúp ... mà còn ...' },
      { en:'Another viable approach ___ (verb+ing). If widely implemented, this could serve as a long-term solution.', answer:'involves', vi:'→ Một cách tiếp cận khả thi khác là ... Nếu được triển khai rộng rãi, biện pháp này có thể trở thành giải pháp lâu dài.' },
      { en:'Research has shown that (evidence/statistic), ___ the effectiveness of this strategy.', answer:'reinforcing', vi:'→ Nghiên cứu đã chỉ ra rằng ..., củng cố tính hiệu quả của chiến lược này.' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, (noun phrase) remains a ___ issue that requires immediate and coordinated action.', answer:'complex', vi:'→ Kết luận lại, ... vẫn là một vấn đề phức tạp cần hành động khẩn cấp và đồng bộ.' },
      { en:'Among the various measures discussed, I believe that (solution) would be the most ___ in the long term.', answer:'effective', vi:'→ Trong các giải pháp đã nêu, tôi tin rằng ... sẽ hiệu quả nhất trong dài hạn.' },
      { en:'If governments, organizations, and individuals work ___, this issue can be significantly alleviated.', answer:'collaboratively', vi:'→ Nếu chính phủ, tổ chức và cá nhân cùng hợp tác, vấn đề này có thể được giảm thiểu đáng kể.' },
    ]},
  ]},
  { typeId:'type04', label:'Type 04', sub:'Effect–Solution', name:'Effect – Solution', orderIndex:3, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:'In recent years, increasing ___ has been paid to the issue of (noun phrase).', answer:'attention', vi:'→ Trong những năm gần đây, vấn đề ... ngày càng nhận được nhiều sự quan tâm.' },
      { en:'One of the most serious ___ facing modern society is (noun phrase).', answer:'challenges', vi:'→ Một trong những thách thức nghiêm trọng nhất mà xã hội hiện đại đang đối mặt là ...' },
      { en:'This essay will examine the major ___ of (noun phrase) and suggest practical solutions to mitigate its impact.', answer:'effects', vi:'→ Bài viết này sẽ phân tích những tác động chính và đề xuất các giải pháp thực tế để giảm thiểu ảnh hưởng.' },
      { en:'This issue has resulted in a range of significant consequences. If left ___, it may lead to even more serious long-term implications.', answer:'unaddressed', vi:'→ Vấn đề này đã gây ra nhiều hậu quả đáng kể. Nếu không được giải quyết, nó có thể dẫn đến những hệ quả nghiêm trọng hơn.' },
    ]},
    { title:'② Body 1 – Effects · Hậu quả', items:[
      { en:'Two particularly ___ effects of this issue are (effect 1) and (effect 2).', answer:'alarming', vi:'→ Hai hậu quả đáng lo ngại nhất của vấn đề này là ... và ...' },
      { en:'To begin with, (effect 1) is a major concern. This is largely because (reason/explanation). If this situation continues, it may ___ to (long-term consequence).', answer:'lead', vi:'→ Trước hết, ... là một mối lo ngại lớn. Nếu tình trạng này tiếp diễn, nó có thể dẫn đến (hậu quả lâu dài).' },
      { en:'Another ___ impact is (effect 2). As a result, (consequence).', answer:'significant', vi:'→ Một tác động đáng kể khác là ... Do đó, (hệ quả).' },
      { en:'Over time, this can place considerable ___ on (group/system/society).', answer:'pressure', vi:'→ Theo thời gian, điều này có thể tạo áp lực lớn lên (nhóm/hệ thống/xã hội).' },
    ]},
    { title:'③ Body 2 – Solutions · Giải pháp', items:[
      { en:'Despite these challenges, several effective ___ can be taken to address this issue.', answer:'measures', vi:'→ Mặc dù có những thách thức này, vẫn có thể thực hiện một số biện pháp hiệu quả để giải quyết vấn đề.' },
      { en:'The most ___ solution is to (verb). This approach would not only (benefit 1) but also (benefit 2).', answer:'practical', vi:'→ Giải pháp thiết thực nhất là ... Cách tiếp cận này không chỉ giúp ... mà còn ...' },
      { en:'Another ___ strategy is to (verb). If implemented on a large scale, this measure could bring about long-term improvements.', answer:'viable', vi:'→ Một chiến lược khả thi khác là ... Nếu được triển khai trên diện rộng, biện pháp này có thể mang lại cải thiện lâu dài.' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, (noun phrase) continues to ___ serious challenges due to its significant consequences.', answer:'pose', vi:'→ Tóm lại, ... vẫn gây ra những thách thức nghiêm trọng do những hậu quả đáng kể của nó.' },
      { en:'In my opinion, tackling this problem requires both (solution 1) and (solution 2) in order to achieve sustainable ___.', answer:'results', vi:'→ Theo tôi, việc giải quyết vấn đề này đòi hỏi cả hai giải pháp để đạt được kết quả bền vững.' },
      { en:'While the effects are undeniable, they can be ___ through coordinated efforts.', answer:'addressed', vi:'→ Mặc dù tác động của vấn đề này là không thể phủ nhận, chúng có thể được giải quyết thông qua sự phối hợp đồng bộ.' },
    ]},
  ]},
  { typeId:'type05', label:'Type 05', sub:'Cause–Effect', name:'Cause – Effect', orderIndex:4, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:"In today's fast-changing world, (noun phrase) has become an increasingly ___ concern.", answer:'significant', vi:'→ Trong thế giới thay đổi nhanh chóng ngày nay, ... đang trở thành mối quan tâm ngày càng lớn.' },
      { en:'It is ___ that (noun phrase) now plays a pivotal role in shaping modern life.', answer:'undeniable', vi:'→ Không thể phủ nhận rằng ... hiện đóng vai trò quan trọng trong đời sống hiện đại.' },
      { en:'Across the globe, societies are ___ with the issue of (noun phrase).', answer:'grappling', vi:'→ Trên toàn cầu, các xã hội đang vật lộn với vấn đề ...' },
      { en:'This essay will examine the underlying ___ of (noun phrase) and analyze its significant effects on society.', answer:'causes', vi:'→ Bài luận này sẽ xem xét các nguyên nhân sâu xa và phân tích những tác động đáng kể đối với xã hội.' },
    ]},
    { title:'② Body 1 – Causes · Nguyên nhân', items:[
      { en:'The causes of (noun phrase) are both complex and ___. Several key factors can be identified as contributing to this phenomenon.', answer:'multifaceted', vi:'→ Nguyên nhân của ... vừa phức tạp vừa đa chiều. Có thể xác định một số yếu tố chính góp phần vào hiện tượng này.' },
      { en:'One primary factor is (cause), which significantly contributes to this issue. It is widely ___ that (clause), making it a central driver of this trend.', answer:'acknowledged', vi:'→ Một yếu tố chính là ..., điều này góp phần đáng kể vào vấn đề. Nhiều người thừa nhận rằng ..., khiến nó trở thành động lực chính của xu hướng này.' },
      { en:'For example, (specific example) clearly ___ how this cause leads to wider consequences.', answer:'demonstrates', vi:'→ Ví dụ, (ví dụ cụ thể) cho thấy rõ cách nguyên nhân này dẫn đến hậu quả rộng hơn.' },
      { en:'This can largely be ___ to (cause), which in turn results in (effect).', answer:'attributed', vi:'→ Điều này phần lớn là do ..., từ đó dẫn đến ...' },
      { en:'Not only does (cause) trigger (effect), but it also creates a ___ effect across society.', answer:'ripple', vi:'→ ... không chỉ gây ra ... mà còn tạo hiệu ứng lan tỏa trong xã hội.' },
    ]},
    { title:'③ Body 2 – Effects · Hậu quả', items:[
      { en:'The effects of (noun phrase) are both immediate and long-term. This issue brings about several serious ___.', answer:'consequences', vi:'→ Tác động của ... vừa mang tính tức thời vừa lâu dài. Vấn đề này kéo theo nhiều hậu quả nghiêm trọng.' },
      { en:'One significant consequence is (effect). Research has ___ shown that (clause).', answer:'consistently', vi:'→ Một hậu quả đáng kể là ... Nghiên cứu đã liên tục chỉ ra rằng ...' },
      { en:'Furthermore, this phenomenon ___ leads to (noun phrase). More alarmingly, the long-term implications may include (serious effect).', answer:'inevitably', vi:'→ Hơn nữa, hiện tượng này tất yếu dẫn đến ... Đáng lo ngại hơn, tác động lâu dài có thể bao gồm ...' },
      { en:'Over time, these effects may ___, placing substantial pressure on (group/society).', answer:'accumulate', vi:'→ Theo thời gian, những tác động này có thể tích tụ và gây áp lực lớn lên ...' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, (noun phrase) stems from a range of ___ factors and results in significant consequences.', answer:'interconnected', vi:'→ Tóm lại, ... bắt nguồn từ nhiều yếu tố liên quan lẫn nhau và gây ra hậu quả đáng kể.' },
      { en:'Addressing this problem requires ___ efforts from both individuals and policymakers.', answer:'coordinated', vi:'→ Giải quyết vấn đề này đòi hỏi sự phối hợp từ cả cá nhân và nhà hoạch định chính sách.' },
      { en:'If effective measures are taken, the negative ___ can be significantly reduced.', answer:'impacts', vi:'→ Nếu có biện pháp hiệu quả, tác động tiêu cực có thể được giảm đáng kể.' },
    ]},
  ]},
  { typeId:'type06', label:'Type 06', sub:'Agree/Disagree', name:'Agree / Disagree', orderIndex:5, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:'The issue of (topic) has become a subject of considerable ___ in recent years.', answer:'debate', vi:'→ Vấn đề về ... đã trở thành một chủ đề gây tranh luận đáng kể trong những năm gần đây.' },
      { en:'In contemporary society, the question of whether (paraphrase question) remains highly ___.', answer:'controversial', vi:'→ Trong xã hội hiện đại, câu hỏi liệu ... vẫn còn gây nhiều tranh cãi.' },
      { en:'I strongly ___ that (your position) for several compelling reasons.', answer:'agree', vi:'→ Tôi hoàn toàn đồng ý rằng ... vì một số lý do thuyết phục.' },
      { en:'While I ___ that (one side of argument), I believe that (your balanced position).', answer:'acknowledge', vi:'→ Mặc dù tôi thừa nhận rằng ..., tôi tin rằng (lập trường cân bằng của bạn).' },
      { en:'Although there are valid arguments supporting (opposing view), I ___ that (your main stance) outweighs these considerations.', answer:'contend', vi:'→ Mặc dù có những lập luận hợp lý ủng hộ (quan điểm đối lập), tôi cho rằng (lập trường chính) vượt trội hơn.' },
    ]},
    { title:'② Body 1 – Main Argument · Lập luận chính', items:[
      { en:'One ___ reason why (your position) is that (reason 1).', answer:'compelling', vi:'→ Một lý do thuyết phục khiến (lập trường của bạn) là (lý do 1).' },
      { en:'It is ___ that (key point) plays a crucial role in (related aspect).', answer:'undeniable', vi:'→ Không thể phủ nhận rằng ... đóng vai trò quan trọng trong ...' },
      { en:'This can be attributed to the fact that (explanation). For instance, (specific example), which clearly ___ that (analysis).', answer:'illustrates', vi:'→ Điều này có thể là do thực tế rằng ... Ví dụ, ..., điều này minh chứng rõ ràng rằng ...' },
      { en:'Research has consistently shown that (finding), thereby ___ the view that (argument).', answer:'reinforcing', vi:'→ Nghiên cứu đã liên tục chỉ ra rằng ..., từ đó củng cố quan điểm rằng ...' },
    ]},
    { title:'③ Body 2 – Counter-argument · Phản biện (Band 7.5+)', items:[
      { en:'While some may argue that (opposing view), this perspective fails to ___ that (counterargument).', answer:'consider', vi:'→ Mặc dù một số người có thể cho rằng ..., quan điểm này bỏ sót việc ...' },
      { en:'Admittedly, (concession); ___, the overall impact remains predominantly positive/negative.', answer:'nevertheless', vi:'→ Thừa nhận rằng ...; tuy nhiên, tác động tổng thể vẫn chủ yếu là tích cực/tiêu cực.' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, having examined the arguments presented, I ___ that (restate position).', answer:'maintain', vi:'→ Tóm lại, sau khi xem xét các lập luận đã trình bày, tôi duy trì rằng ...' },
      { en:'Ultimately, striking a ___ between (aspect 1) and (aspect 2) may represent the most pragmatic approach.', answer:'balance', vi:'→ Cuối cùng, tìm kiếm sự cân bằng giữa ... và ... có thể là cách tiếp cận thực tế nhất.' },
    ]},
  ]},
];

// GET /api/admin/task2/templates
router.get('/task2/templates', auth, teacherOnly, async (req, res) => {
  try {
    const { search = '' } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { typeId: { $regex: search, $options: 'i' } }] } : {};
    const templates = await Task2Template.find(query).sort({ orderIndex: 1 }).lean();
    res.json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task2/templates/seed  (before :id route)
router.post('/task2/templates/seed', auth, teacherOnly, async (req, res) => {
  try {
    const { force = false } = req.body;
    const existing = await Task2Template.countDocuments();
    if (existing > 0 && !force) {
      return res.json({ success: false, message: `Đã có ${existing} template. Gửi force:true để ghi đè.` });
    }
    if (force) await Task2Template.deleteMany({});
    await Task2Template.insertMany(SEED_TEMPLATES);
    res.json({ success: true, message: `Đã seed ${SEED_TEMPLATES.length} template mặc định.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/task2/templates/:id
router.get('/task2/templates/:id', auth, teacherOnly, async (req, res) => {
  try {
    const template = await Task2Template.findById(req.params.id).lean();
    if (!template) return res.status(404).json({ success: false, message: 'Không tìm thấy template' });
    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task2/templates
router.post('/task2/templates', auth, teacherOnly, async (req, res) => {
  try {
    const template = new Task2Template(req.body);
    await template.save();
    res.status(201).json({ success: true, template });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/task2/templates/:id
router.put('/task2/templates/:id', auth, teacherOnly, async (req, res) => {
  try {
    const tpl = await Task2Template.findById(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Không tìm thấy template' });
    Object.keys(req.body).forEach(k => { tpl[k] = req.body[k]; });
    await tpl.save();
    res.json({ success: true, template: tpl.toObject() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task2/templates/:id
router.delete('/task2/templates/:id', auth, teacherOnly, async (req, res) => {
  try {
    const tpl = await Task2Template.findByIdAndDelete(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Không tìm thấy template' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;