const express      = require('express');
const router       = express.Router();
const crypto       = require('crypto');
const cloudinary   = require('cloudinary').v2;
const Passage      = require('../models/Passage');
const ReadingTest  = require('../models/ReadingTest');
const ListeningTest = require('../models/ListeningTest');
const WritingExam    = require('../models/WritingExam');
const WritingTask1   = require('../models/WritingTask1');
const WritingTask2   = require('../models/WritingTask2');
const WritingAttempt = require('../models/WritingAttempt');
const SpeakingQuestion = require('../models/SpeakingQuestion');
const SpeakingMaterial = require('../models/SpeakingMaterial');
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
    const passage = await Passage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!passage) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, passage });
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
      .limit(100)
      .select('-answers -passagesUsed');

    const normalized = history.map(h => {
      const obj = h.toObject({ virtuals: false });
      if (obj.userId && typeof obj.userId === 'object') {
        const u = obj.userId;
        const first = (u.firstName || '').trim();
        const last  = (u.lastName  || '').trim();
        const full  = first ? (last ? `${first} ${last}` : first) : '';
        obj.userId = { ...u, displayName: full || u.username || '–' };
      }
      return obj;
    });

    res.json({ success: true, history: normalized });
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
// Body: { pdfBase64 }
router.post('/speaking/materials/upload-pdf', auth, teacherOnly, async (req, res) => {
  try {
    const { pdfBase64 } = req.body;
    if (!pdfBase64) return res.status(400).json({ success: false, message: 'Thiếu file PDF' });
    // Đảm bảo có data URI prefix để Cloudinary nhận dạng đúng file PDF
    const fullBase64 = pdfBase64.startsWith('data:')
      ? pdfBase64
      : `data:application/pdf;base64,${pdfBase64}`;
    const result = await cloudinary.uploader.upload(fullBase64, {
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
// USER MANAGEMENT
// ══════════════════════════════════════════════════

const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

module.exports = router;