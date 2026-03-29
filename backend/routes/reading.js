const express    = require('express');
const router     = express.Router();
const Passage     = require('../models/Passage');
const ReadingTest = require('../models/ReadingTest');
const TestAttempt = require('../models/TestAttempt');
const AccessKey   = require('../models/AccessKey');
const auth        = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reading/tests
// Lấy danh sách tất cả bộ đề (kèm lịch sử làm bài gần nhất của user)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/tests', auth, async (req, res) => {
  try {
    const tests = await ReadingTest.find({ isActive: true }).sort({ testNumber: -1 });

    // Lấy lần làm bài hoàn thành gần nhất cho mỗi test
    const attempts = await TestAttempt.find({
      userId: req.user._id,
      status: 'completed'
    }).select('testId bandScore correctCount wrongCount skippedCount endTime duration');

    // Map: testId → attempt mới nhất
    const attemptMap = {};
    attempts.forEach(a => {
      const key = a.testId.toString();
      if (!attemptMap[key] || attemptMap[key].endTime < a.endTime) {
        attemptMap[key] = a;
      }
    });

    const result = tests.map(t => ({
      ...t.toObject(),
      lastAttempt: attemptMap[t._id.toString()] || null
    }));

    res.json({ success: true, tests: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reading/verify-key
// Xác thực key trước khi hiện nút "Bắt đầu làm bài"
// Body: { key, testId }
// ─────────────────────────────────────────────────────────────────────────────
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
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reading/start
// Bắt đầu thi: random 3 passages + tạo TestAttempt + tăng lượt dùng key
// Body: { key, testId }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/start', auth, async (req, res) => {
  try {
    const { key, testId } = req.body;

    // Xác thực key lần nữa (double-check)
    const accessKey = await AccessKey.findOne({
      key: key.toUpperCase().trim(),
      isActive: true,
      $or: [{ testId }, { testId: null }]
    });

    if (!accessKey || accessKey.currentUses >= accessKey.maxUses) {
      return res.status(403).json({ success: false, message: 'Key không hợp lệ hoặc đã hết lượt' });
    }
    if (accessKey.expiresAt && new Date() > accessKey.expiresAt) {
      return res.status(403).json({ success: false, message: 'Key đã hết hạn' });
    }

    // Kiểm tra test tồn tại
    const test = await ReadingTest.findById(testId);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy bộ đề' });

    // Random 1 passage từ mỗi category
    const [p1arr, p2arr, p3arr] = await Promise.all([
      Passage.aggregate([{ $match: { category: 'passage1', isActive: true } }, { $sample: { size: 1 } }]),
      Passage.aggregate([{ $match: { category: 'passage2', isActive: true } }, { $sample: { size: 1 } }]),
      Passage.aggregate([{ $match: { category: 'passage3', isActive: true } }, { $sample: { size: 1 } }])
    ]);

    if (!p1arr[0] || !p2arr[0] || !p3arr[0]) {
      return res.status(400).json({
        success: false,
        message: 'Database chưa đủ bài đọc (cần ít nhất 1 bài ở mỗi category)'
      });
    }

    const passages = [p1arr[0], p2arr[0], p3arr[0]];

    // Tạo attempt
    const attempt = new TestAttempt({
      userId: req.user._id,
      testId,
      passagesUsed: passages.map(p => p._id),
      startTime: new Date()
    });
    await attempt.save();

    // Tăng lượt dùng key
    await AccessKey.findByIdAndUpdate(accessKey._id, { $inc: { currentUses: 1 } });

    // Trả về passages – ẨN correctAnswer và explanation khi đang thi
    const safePassages = passages.map(p => ({
      _id:          p._id,
      title:        p.title,
      category:     p.category,
      content:      p.content,
      questionRange: p.questionRange,
      questions: p.questions.map(q => ({
        questionNumber: q.questionNumber,
        type:           q.type,
        questionText:   q.questionText,
        options:        q.options,
        wordBank:       q.wordBank,
        paragraphLabels: q.paragraphLabels
        // correctAnswer & explanation bị ẩn
      }))
    }));

    res.json({
      success: true,
      attemptId: attempt._id,
      testName: test.name,
      passages: safePassages,
      duration: 3600 // 60 phút
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reading/submit
// Nộp bài: chấm điểm + lưu kết quả
// Body: { attemptId, answers: { "1": "TRUE", "2": "FALSE", … } }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/submit', auth, async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: req.user._id,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi đang làm' });
    }

    // Lấy lại passages với đáp án
    const passages = await Passage.find({ _id: { $in: attempt.passagesUsed } });

    // Chấm điểm
    let correctCount = 0;
    let wrongCount   = 0;
    let skippedCount = 0;
    const gradedAnswers = [];

    for (const passage of passages) {
      for (const q of passage.questions) {
        const userAns    = (answers[q.questionNumber] || '').toString().toLowerCase().trim();
        const correctAns = (q.correctAnswer || '').toLowerCase().trim();
        const answered   = userAns !== '';
        const isCorrect  = answered && userAns === correctAns;

        if (!answered) skippedCount++;
        else if (isCorrect) correctCount++;
        else wrongCount++;

        gradedAnswers.push({
          questionNumber: q.questionNumber,
          userAnswer:    answers[q.questionNumber] || '',
          correctAnswer: q.correctAnswer,
          isCorrect
        });
      }
    }

    const endTime  = new Date();
    const duration = Math.floor((endTime - attempt.startTime) / 1000);

    attempt.answers       = gradedAnswers;
    attempt.correctCount  = correctCount;
    attempt.wrongCount    = wrongCount;
    attempt.skippedCount  = skippedCount;
    attempt.totalQuestions = gradedAnswers.length;
    attempt.bandScore     = attempt.calculateBandScore();
    attempt.endTime       = endTime;
    attempt.duration      = duration;
    attempt.status        = 'completed';

    await attempt.save();

    res.json({
      success: true,
      result: {
        attemptId:     attempt._id,
        bandScore:     attempt.bandScore,
        correctCount,
        wrongCount,
        skippedCount,
        totalQuestions: attempt.totalQuestions,
        duration
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reading/attempt/:id/review
// Xem lại bài thi đã nộp (đầy đủ đáp án + giải thích)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/attempt/:id/review', auth, async (req, res) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'completed'
    }).populate('testId', 'name testNumber');

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi' });
    }

    // Lấy passages đầy đủ (có correctAnswer + explanation)
    const passages = await Passage.find({ _id: { $in: attempt.passagesUsed } });

    // Gắn kết quả từng câu vào passage
    const answerMap = {};
    attempt.answers.forEach(a => { answerMap[a.questionNumber] = a; });

    const passagesWithResult = passages.map(p => ({
      _id:           p._id,
      title:         p.title,
      category:      p.category,
      content:       p.content,
      questionRange: p.questionRange,
      questions: p.questions.map(q => ({
        questionNumber: q.questionNumber,
        type:           q.type,
        questionText:   q.questionText,
        options:        q.options,
        wordBank:       q.wordBank,
        paragraphLabels: q.paragraphLabels,
        correctAnswer:  q.correctAnswer,
        explanation:    q.explanation,
        userAnswer:     answerMap[q.questionNumber]?.userAnswer || '',
        isCorrect:      answerMap[q.questionNumber]?.isCorrect || false
      }))
    }));

    res.json({
      success: true,
      attempt: {
        _id:           attempt._id,
        testName:      attempt.testId?.name || '',
        bandScore:     attempt.bandScore,
        correctCount:  attempt.correctCount,
        wrongCount:    attempt.wrongCount,
        skippedCount:  attempt.skippedCount,
        totalQuestions: attempt.totalQuestions,
        duration:      attempt.duration,
        endTime:       attempt.endTime,
        passages:      passagesWithResult
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reading/history
// Lịch sử làm bài của user hiện tại
// ─────────────────────────────────────────────────────────────────────────────
router.get('/history', auth, async (req, res) => {
  try {
    const history = await TestAttempt.find({
      userId: req.user._id,
      status: 'completed'
    })
      .populate('testId', 'name testNumber')
      .sort({ endTime: -1 })
      .limit(50)
      .select('-answers -passagesUsed'); // giảm payload

    res.json({ success: true, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reading/vocab/save  – lưu từ vựng (chỉ dùng khi review)
// Body: { word, meaning, example }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/vocab/save', auth, async (req, res) => {
  try {
    const { word, meaning, example } = req.body;
    if (!word) return res.status(400).json({ success: false, message: 'Thiếu từ cần lưu' });

    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        savedVocab: { word, meaning: meaning || '', example: example || '' }
      }
    });

    res.json({ success: true, message: `Đã lưu từ "${word}"` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;