/**
 * backend/routes/listening.js
 * Admin quản lý đề nghe + Student làm bài
 */
const express       = require('express');
const router        = express.Router();
const multer        = require('multer');
const cloudinary    = require('cloudinary').v2;
const streamifier   = require('streamifier');
const ListeningTest = require('../models/ListeningTest');
const auth          = require('../middleware/auth');

// ── Middleware ──────────────────────────────────────
const teacherOnly = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
  }
  next();
};

// Multer: lưu trong memory (rồi stream lên Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file audio'));
    }
  }
});

// ══════════════════════════════════════════════════
// ADMIN – CRUD Tests
// ══════════════════════════════════════════════════

// GET /api/listening/admin/tests
router.get('/admin/tests', auth, teacherOnly, async (req, res) => {
  try {
    const tests = await ListeningTest.find()
      .select('name testNumber seriesName audioUrl audioDuration isActive sections createdAt')
      .sort({ testNumber: -1 });

    const list = tests.map(t => ({
      ...t.toObject(),
      totalQuestions: t.sections.reduce((sum, s) => sum + s.questions.length, 0),
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

// POST /api/listening/admin/tests  – tạo đề mới (không có audio)
router.post('/admin/tests', auth, teacherOnly, async (req, res) => {
  try {
    const test = new ListeningTest(req.body);
    await test.save();
    res.status(201).json({ success: true, test });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/listening/admin/tests/:id  – cập nhật metadata / sections / transcript
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

// DELETE /api/listening/admin/tests/:id  – ẩn
router.delete('/admin/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    await ListeningTest.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn đề nghe' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// ADMIN – Upload Audio (Cloudinary)
// POST /api/listening/admin/tests/:id/audio
// ══════════════════════════════════════════════════
router.post('/admin/tests/:id/audio', auth, teacherOnly, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Không có file audio' });

    // Stream lên Cloudinary folder listening/
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Cloudinary dùng 'video' cho audio
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

// ══════════════════════════════════════════════════
// ADMIN – Cập nhật Transcript & Word Timestamps
// PUT /api/listening/admin/tests/:id/transcript
// Body: { transcript, wordTimestamps }
// ══════════════════════════════════════════════════
router.put('/admin/tests/:id/transcript', auth, teacherOnly, async (req, res) => {
  try {
    const { transcript, wordTimestamps } = req.body;
    const update = {};
    if (transcript !== undefined) update.transcript = transcript;
    if (wordTimestamps !== undefined) update.wordTimestamps = wordTimestamps;

    const test = await ListeningTest.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    res.json({ success: true, message: 'Đã cập nhật transcript' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// STUDENT – Lấy danh sách đề
// GET /api/listening/tests
// ══════════════════════════════════════════════════
router.get('/tests', auth, async (req, res) => {
  try {
    const tests = await ListeningTest.find({ isActive: true })
      .select('name testNumber seriesName audioDuration sections')
      .sort({ testNumber: -1 });

    const list = tests.map(t => ({
      _id: t._id,
      name: t.name,
      testNumber: t.testNumber,
      seriesName: t.seriesName,
      audioDuration: t.audioDuration,
      totalParts: t.sections.length,
      totalQuestions: t.sections.reduce((sum, s) => sum + s.questions.length, 0)
    }));

    res.json({ success: true, tests: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// STUDENT – Lấy full đề để làm bài
// GET /api/listening/tests/:id/start
// ══════════════════════════════════════════════════
router.get('/tests/:id/start', auth, async (req, res) => {
  try {
    const test = await ListeningTest.findOne({ _id: req.params.id, isActive: true });
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy đề' });

    // Không trả correctAnswer khi đang thi
    const sections = test.sections.map(s => ({
      partNumber: s.partNumber,
      title: s.title,
      description: s.description,
      questionRange: s.questionRange,
      questions: s.questions.map(q => ({
        _id: q._id,
        questionNumber: q.questionNumber,
        type: q.type,
        questionText: q.questionText,
        options: q.options,
        checkboxCount: q.checkboxCount,
        wordBank: q.wordBank
        // correctAnswer intentionally omitted
      }))
    }));

    res.json({
      success: true,
      test: {
        _id: test._id,
        name: test.name,
        audioUrl: test.audioUrl,
        audioDuration: test.audioDuration,
        wordTimestamps: test.wordTimestamps,
        transcript: test.transcript,
        sections
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// STUDENT – Nộp bài & chấm điểm
// POST /api/listening/tests/:id/submit
// Body: { answers: { questionNumber: value, ... } }
// ══════════════════════════════════════════════════
router.post('/tests/:id/submit', auth, async (req, res) => {
  try {
    const test = await ListeningTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy đề' });

    const userAnswers = req.body.answers || {};
    let correct = 0, wrong = 0, skipped = 0;

    const allQuestions = test.sections.flatMap(s => s.questions);
    const total = allQuestions.length;

    const reviewed = allQuestions.map(q => {
      const num = q.questionNumber;
      const ua = userAnswers[num] !== undefined ? String(userAnswers[num]).trim() : '';
      const ca = q.correctAnswer.trim();

      let isCorrect = false;

      if (q.type === 'checkbox') {
        // So sánh array
        try {
          const uaArr = JSON.parse(ua || '[]').map(x => x.toLowerCase().trim()).sort();
          const caArr = JSON.parse(ca).map(x => x.toLowerCase().trim()).sort();
          isCorrect = JSON.stringify(uaArr) === JSON.stringify(caArr);
        } catch { isCorrect = false; }
      } else {
        isCorrect = ua.toLowerCase() === ca.toLowerCase();
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

    // Band score (IELTS Listening: 40 câu)
    const bandMap = [
      [39, 9.0],[37, 8.5],[35, 8.0],[32, 7.5],[30, 7.0],
      [26, 6.5],[23, 6.0],[18, 5.5],[16, 5.0],[13, 4.5],
      [10, 4.0],[8, 3.5],[6, 3.0],[4, 2.5]
    ];
    let bandScore = 2.0;
    for (const [threshold, band] of bandMap) {
      if (correct >= threshold) { bandScore = band; break; }
    }

    res.json({
      success: true,
      result: {
        testName: test.name,
        totalQuestions: total,
        correctCount: correct,
        wrongCount: wrong,
        skippedCount: skipped,
        bandScore,
        questions: reviewed,
        audioUrl: test.audioUrl,
        transcript: test.transcript,
        wordTimestamps: test.wordTimestamps,
        sections: test.sections.map(s => ({
          partNumber: s.partNumber,
          title: s.title,
          description: s.description,
          questionRange: s.questionRange
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;