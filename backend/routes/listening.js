/**
 * backend/routes/listening.js
 * Admin quản lý đề nghe + Student làm bài
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const ListeningTest = require('../models/ListeningTest');
const ListeningAttempt = require('../models/ListeningAttempt');
const AccessKey = require('../models/AccessKey');
const auth = require('../middleware/auth');

// ── Middleware ──────────────────────────────────────────────────────────────
const teacherOnly = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
  }
  next();
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/mp4') cb(null, true);
    else cb(new Error('Chỉ chấp nhận file audio'));
  }
});

// ── Helper: flatten tất cả questions từ sections → groups → questions ────────
function flattenQuestions(sections) {
  return sections.flatMap(s =>
    s.questionGroups.flatMap(g => g.questions)
  );
}

// ── Helper: tính band score Listening ───────────────────────────────────────
function calcBandScore(correct) {
  const bandMap = [
    [39, 9.0], [37, 8.5], [35, 8.0], [32, 7.5], [30, 7.0],
    [26, 6.5], [23, 6.0], [18, 5.5], [16, 5.0], [13, 4.5],
    [10, 4.0], [8, 3.5], [6, 3.0], [4, 2.5]
  ];
  for (const [threshold, band] of bandMap) {
    if (correct >= threshold) return band;
  }
  return 2.0;
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – CRUD Tests
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/listening/admin/tests
router.get('/admin/tests', auth, teacherOnly, async (req, res) => {
  try {
    const tests = await ListeningTest.find()
      .select('name testNumber seriesName audioUrl audioDuration isActive sections createdAt')
      .sort({ testNumber: -1 });

    const list = tests.map(t => ({
      ...t.toObject(),
      totalQuestions: flattenQuestions(t.sections).length,
      totalParts: t.sections.length
    }));

    res.json({ success: true, tests: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/listening/admin/tests/:id
router.get('/admin/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    const test = await ListeningTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/listening/admin/tests
router.post('/admin/tests', auth, teacherOnly, async (req, res) => {
  try {
    const test = new ListeningTest(req.body);
    await test.save();
    res.status(201).json({ success: true, test });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/listening/admin/tests/:id
router.put('/admin/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    const test = await ListeningTest.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/listening/admin/tests/:id
router.delete('/admin/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    await ListeningTest.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn đề nghe' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – Upload Audio
// ══════════════════════════════════════════════════════════════════════════════
router.post('/admin/tests/:id/audio', auth, teacherOnly, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Không có file audio' });

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'listening',
          public_id: `listening_${req.params.id}_${Date.now()}`,
          overwrite: true
        },
        (err, result) => err ? reject(err) : resolve(result)
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const test = await ListeningTest.findByIdAndUpdate(
      req.params.id,
      {
        audioUrl: uploadResult.secure_url,
        audioFileName: req.file.originalname,
        audioDuration: Math.round(uploadResult.duration || 0)
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Upload audio thành công',
      audioUrl: test.audioUrl,
      audioDuration: test.audioDuration
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload thất bại: ' + err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – Upload Map/Diagram Image
// ══════════════════════════════════════════════════════════════════════════════
router.post('/admin/upload-map-image', auth, teacherOnly, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu imageBase64' });

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'listening-maps',
      resource_type: 'image'
    });

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload thất bại: ' + err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – Transcript (per section)
// ══════════════════════════════════════════════════════════════════════════════
router.put('/admin/tests/:id/transcript', auth, teacherOnly, async (req, res) => {
  try {
    const { sectionTranscripts } = req.body;
    if (!Array.isArray(sectionTranscripts)) {
      return res.status(400).json({ success: false, message: 'sectionTranscripts phải là array' });
    }

    const test = await ListeningTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    sectionTranscripts.forEach(({ partNumber, transcript }) => {
      const section = test.sections.find(s => s.partNumber === partNumber);
      if (section) section.transcript = transcript || '';
    });

    await test.save();
    res.json({ success: true, message: 'Đã cập nhật transcript' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – Lịch sử tất cả học viên (cho trang admin)
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/listening/admin/attempts
router.get('/admin/attempts', auth, teacherOnly, async (req, res) => {
  try {
    const { testId, userId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (testId) filter.testId = testId;
    if (userId) filter.userId = userId;

    const [attempts, total] = await Promise.all([
      ListeningAttempt.find(filter)
        .populate('userId', 'firstName lastName username email')
        .populate('testId', 'name testNumber')
        .sort({ submittedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      ListeningAttempt.countDocuments(filter)
    ]);

    res.json({ success: true, attempts, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/listening/admin/attempts/stats
router.get('/admin/attempts/stats', auth, teacherOnly, async (req, res) => {
  try {
    const { testId } = req.query;
    const match = testId ? { testId: new (require('mongoose').Types.ObjectId)(testId) } : {};

    const [overview, byTest, topStudents] = await Promise.all([
      ListeningAttempt.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            avgBand: { $avg: '$bandScore' },
            avgCorrect: { $avg: '$correctCount' },
            maxBand: { $max: '$bandScore' },
            minBand: { $min: '$bandScore' }
          }
        }
      ]),
      ListeningAttempt.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$testId',
            testName: { $first: '$testName' },
            totalAttempts: { $sum: 1 },
            avgBand: { $avg: '$bandScore' },
            avgCorrect: { $avg: '$correctCount' }
          }
        },
        { $sort: { totalAttempts: -1 } },
        { $limit: 20 }
      ]),
      ListeningAttempt.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$userId',
            bestBand: { $max: '$bandScore' },
            avgBand: { $avg: '$bandScore' },
            attempts: { $sum: 1 }
          }
        },
        { $sort: { bestBand: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            bestBand: 1, avgBand: 1, attempts: 1,
            'user.firstName': 1, 'user.lastName': 1,
            'user.username': 1, 'user.email': 1
          }
        }
      ])
    ]);

    res.json({
      success: true,
      overview: overview[0] || { totalAttempts: 0, avgBand: 0, avgCorrect: 0, maxBand: 0, minBand: 0 },
      byTest,
      topStudents
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Danh sách đề (kèm lịch sử làm bài của user)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/tests', auth, async (req, res) => {
  try {
    const tests = await ListeningTest.find({ isActive: true })
      .select('name testNumber seriesName audioDuration sections')
      .sort({ testNumber: -1 });

    // Lấy attempt gần nhất của user cho mỗi test
    const attempts = await ListeningAttempt.find({
      userId: req.user._id || req.user.id,
      status: 'completed'
    }).select('testId bandScore correctCount wrongCount skippedCount submittedAt timeTaken');

    // Map: testId → attempt mới nhất
    const attemptMap = {};
    attempts.forEach(a => {
      const key = a.testId.toString();
      if (!attemptMap[key] || attemptMap[key].submittedAt < a.submittedAt) {
        attemptMap[key] = a;
      }
    });

    const list = tests.map(t => ({
      _id: t._id,
      name: t.name,
      testNumber: t.testNumber,
      seriesName: t.seriesName,
      audioDuration: t.audioDuration,
      totalParts: t.sections.length,
      totalQuestions: flattenQuestions(t.sections).length,
      lastAttempt: attemptMap[t._id.toString()] || null
    }));

    res.json({ success: true, tests: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Xác thực Access Key (trước khi vào làm bài)
// POST /api/listening/verify-key
// Body: { key, testId }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/verify-key', auth, async (req, res) => {
  try {
    const { key, testId } = req.body;
    if (!key) return res.json({ success: false, message: 'Vui lòng nhập key' });

    const accessKey = await AccessKey.findOne({
      key: key.toUpperCase().trim(),
      isActive: true,
      $or: [{ testId }, { testId: null }]
    });

    if (!accessKey) {
      return res.json({ success: false, message: 'Key không hợp lệ' });
    }
    if (accessKey.currentUses >= accessKey.maxUses) {
      return res.json({ success: false, message: 'Key đã được sử dụng hết lượt' });
    }
    if (accessKey.expiresAt && new Date() > accessKey.expiresAt) {
      return res.json({ success: false, message: 'Key đã hết hạn' });
    }

    res.json({ success: true, message: 'Key hợp lệ ✓' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Lấy full đề để làm bài (yêu cầu access key)
// POST /api/listening/tests/:id/start
// Body: { key }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/tests/:id/start', auth, async (req, res) => {
  try {
    const { key } = req.body;

    // Xác thực key (double-check)
    const accessKey = await AccessKey.findOne({
      key: (key || '').toUpperCase().trim(),
      isActive: true,
      $or: [{ testId: req.params.id }, { testId: null }]
    });

    if (!accessKey || accessKey.currentUses >= accessKey.maxUses) {
      return res.status(403).json({ success: false, message: 'Key không hợp lệ hoặc đã hết lượt' });
    }
    if (accessKey.expiresAt && new Date() > accessKey.expiresAt) {
      return res.status(403).json({ success: false, message: 'Key đã hết hạn' });
    }

    const test = await ListeningTest.findOne({ _id: req.params.id, isActive: true });
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy đề' });

    // Tăng lượt dùng key
    await AccessKey.findByIdAndUpdate(accessKey._id, { $inc: { currentUses: 1 } });

    const sections = test.sections.map(s => ({
      partNumber: s.partNumber,
      title: s.title,
      description: s.description,
      questionRange: s.questionRange,
      questionGroups: s.questionGroups.map(g => ({
        _id: g._id,
        groupType: g.groupType,
        instruction: g.instruction,
        tableConfig: g.tableConfig,
        noteConfig: g.noteConfig,
        bulletConfig: g.bulletConfig,
        summaryConfig: g.summaryConfig,        // ← THÊM
        matchingOptions: g.matchingOptions,    // ← THÊM
        matchingReuseAllowed: g.matchingReuseAllowed, // ← THÊM
        endingsConfig: g.endingsConfig,        // ← THÊM
        imageUrl: g.imageUrl,
        questions: g.questions.map(q => ({
          _id: q._id,
          questionNumber: q.questionNumber,
          type: q.type,
          questionText: q.questionText,
          options: q.options,
          checkboxCount: q.checkboxCount,
          wordBank: q.wordBank,
          imageUrl: q.imageUrl
          // correctAnswer intentionally omitted
        }))
      }))
    }));

    res.json({
      success: true,
      test: {
        _id: test._id,
        name: test.name,
        audioUrl: test.audioUrl,
        audioDuration: test.audioDuration,
        sections
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Nộp bài, chấm điểm & lưu attempt
// ══════════════════════════════════════════════════════════════════════════════
router.post('/tests/:id/submit', auth, async (req, res) => {
  try {
    const test = await ListeningTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy đề' });

    const userAnswers = req.body.answers || {};
    const startTime = req.body.startTime ? new Date(req.body.startTime) : null;
    const now = new Date();
    const timeTaken = startTime ? Math.round((now - startTime) / 1000) : 0;

    let correct = 0, wrong = 0, skipped = 0;
    const allQuestions = flattenQuestions(test.sections);
    const total = allQuestions.length;

    const reviewed = allQuestions.map(q => {
      const num = q.questionNumber;
      const ua = userAnswers[num] !== undefined ? String(userAnswers[num]).trim() : '';
      const ca = q.correctAnswer.trim();

      let isCorrect = false;
      if (q.type === 'multi-answer-group') {
        // Mỗi câu có 1 đáp án đúng riêng (VD: Q18="A", Q19="C", Q20="F")
        // Học sinh chọn chung 1 mảng cho cả cluster: ["A","C","F"] theo thứ tự bất kỳ
        // Câu này đúng khi chữ cái đáp án của câu nằm trong mảng học sinh chọn
        try {
          const uaArr = JSON.parse(ua || '[]').map(x => x.toUpperCase().trim());
          isCorrect = uaArr.includes(ca.toUpperCase().trim());
        } catch { isCorrect = false; }
      } else if (q.type === 'checkbox') {
        // Legacy checkbox: cả set phải khớp hoàn toàn mới tính 1 điểm (behavior cũ giữ nguyên)
        try {
          const uaArr = JSON.parse(ua || '[]').map(x => x.toLowerCase().trim()).sort();
          const caArr = JSON.parse(ca).map(x => x.toLowerCase().trim()).sort();
          isCorrect = JSON.stringify(uaArr) === JSON.stringify(caArr);
        } catch { isCorrect = false; }
      } else {
        // Hỗ trợ nhiều đáp án đúng phân cách bằng "/" (VD: "answer1 / answer2")
        const caVariants = ca.split('/').map(v => v.trim().toLowerCase()).filter(Boolean);
        isCorrect = caVariants.includes(ua.toLowerCase());
      }

      if (!ua) skipped++;
      else if (isCorrect) correct++;
      else wrong++;

      return {
        questionNumber: num,
        userAnswer: ua,
        correctAnswer: ca,
        isCorrect,
        explanation: q.explanation,
        type: q.type,
        questionText: q.questionText,
        options: q.options,
        wordBank: q.wordBank,
        audioTimestamp: q.audioTimestamp
      };
    });

    const bandScore = calcBandScore(correct);

    const attempt = new ListeningAttempt({
      userId: req.user._id || req.user.id,
      testId: test._id,
      testName: test.name,
      answers: reviewed.map(r => ({
        questionNumber: r.questionNumber,
        userAnswer: r.userAnswer,
        correctAnswer: r.correctAnswer,
        isCorrect: r.isCorrect
      })),
      totalQuestions: total,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      bandScore,
      startTime: startTime || now,
      submittedAt: now,
      timeTaken,
      status: 'completed'
    });
    await attempt.save();

    const reviewMap = {};
    reviewed.forEach(r => { reviewMap[r.questionNumber] = r; });

    const reviewSections = test.sections.map(s => ({
      partNumber: s.partNumber,
      title: s.title,
      description: s.description,
      questionRange: s.questionRange,
      transcript: s.transcript || '',
      questionGroups: s.questionGroups.map(g => ({
        groupType: g.groupType,
        instruction: g.instruction,
        tableConfig: g.tableConfig,
        noteConfig: g.noteConfig,
        bulletConfig: g.bulletConfig,
        summaryConfig: g.summaryConfig,              // ← THÊM
        matchingOptions: g.matchingOptions,          // ← THÊM
        matchingReuseAllowed: g.matchingReuseAllowed, // ← THÊM
        endingsConfig: g.endingsConfig,              // ← THÊM
        imageUrl: g.imageUrl,
        questions: g.questions.map(q =>
          reviewMap[q.questionNumber] || { questionNumber: q.questionNumber }
        )
      }))
    }));

    res.json({
      success: true,
      result: {
        attemptId: attempt._id,
        testName: test.name,
        totalQuestions: total,
        correctCount: correct,
        wrongCount: wrong,
        skippedCount: skipped,
        bandScore,
        timeTaken,
        questions: reviewed,
        sections: reviewSections,
        audioUrl: test.audioUrl
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Lịch sử làm bài của bản thân
// ══════════════════════════════════════════════════════════════════════════════
router.get('/history', auth, async (req, res) => {
  try {
    const attempts = await ListeningAttempt.find({ userId: req.user._id || req.user.id })
      .select('testName bandScore correctCount wrongCount skippedCount totalQuestions timeTaken submittedAt status testId')
      .populate('testId', 'name testNumber')
      .sort({ submittedAt: -1 })
      .limit(50);

    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Chi tiết 1 attempt (xem lại bài cũ)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/history/:attemptId', auth, async (req, res) => {
  try {
    const attempt = await ListeningAttempt.findOne({
      _id: req.params.attemptId,
      userId: req.user._id || req.user.id
    });
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    const test = await ListeningTest.findById(attempt.testId);
    if (!test) return res.status(404).json({ success: false, message: 'Đề thi không tồn tại' });

    const reviewMap = {};
    attempt.answers.forEach(a => { reviewMap[a.questionNumber] = a; });

    const allQuestions = flattenQuestions(test.sections);
    const reviewed = allQuestions.map(q => {
      const saved = reviewMap[q.questionNumber] || {};
      return {
        questionNumber: q.questionNumber,
        type: q.type,
        questionText: q.questionText,
        options: q.options,
        wordBank: q.wordBank,
        audioTimestamp: q.audioTimestamp,
        explanation: q.explanation,
        userAnswer: saved.userAnswer || '',
        correctAnswer: saved.correctAnswer || q.correctAnswer,
        isCorrect: saved.isCorrect || false
      };
    });

    const reviewMap2 = {};
    reviewed.forEach(r => { reviewMap2[r.questionNumber] = r; });

    const reviewSections = test.sections.map(s => ({
      partNumber: s.partNumber,
      title: s.title,
      description: s.description,
      questionRange: s.questionRange,
      transcript: s.transcript || '',
      questionGroups: s.questionGroups.map(g => ({
        groupType: g.groupType,
        instruction: g.instruction,
        tableConfig: g.tableConfig,
        noteConfig: g.noteConfig,
        bulletConfig: g.bulletConfig,
        summaryConfig: g.summaryConfig,        // ← THÊM
        matchingOptions: g.matchingOptions,      // ← THÊM
        matchingReuseAllowed: g.matchingReuseAllowed, // ← THÊM
        endingsConfig: g.endingsConfig,        // ← THÊM
        imageUrl: g.imageUrl,
        questions: g.questions.map(q =>
          reviewMap2[q.questionNumber] || { questionNumber: q.questionNumber }
        )
      }))
    }));

    res.json({
      success: true,
      result: {
        attemptId: attempt._id,
        testName: attempt.testName,
        bandScore: attempt.bandScore,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        skippedCount: attempt.skippedCount,
        totalQuestions: attempt.totalQuestions,
        timeTaken: attempt.timeTaken,
        submittedAt: attempt.submittedAt,
        questions: reviewed,
        sections: reviewSections,
        audioUrl: test.audioUrl
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;