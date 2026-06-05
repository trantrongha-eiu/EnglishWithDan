const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Passage = require('../models/Passage');
const ReadingTest = require('../models/ReadingTest');
const TestAttempt = require('../models/TestAttempt');
const AccessKey = require('../models/AccessKey');
const auth = require('../middleware/auth');

// Chặn brute-force key: tối đa 10 lần start / 15 phút / user
const startLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, thử lại sau 15 phút.' }),
  skip: req => req.user?.role === 'admin'
});

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
    }).select('testId bandScore correctCount wrongCount skippedCount totalQuestions endTime duration');

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
router.post('/start', auth, startLimiter, async (req, res) => {
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
    const safeQ = q => ({
      questionNumber: q.questionNumber,
      type: q.type,
      questionText: q.questionText,
      options: q.options,
      wordBank: q.wordBank,
      paragraphLabels: q.paragraphLabels,
      imageUrl: q.imageUrl          // cần cho map-labelling per-question image
      // correctAnswer & explanation bị ẩn
    });
    const safePassages = passages.map(p => ({
      _id: p._id,
      title: p.title,
      category: p.category,
      content: p.content,
      questionRange: p.questionRange,
      questionGroups: (p.questionGroups || []).map(g => ({
        groupType: g.groupType,
        groupTitle: g.groupTitle,
        instruction: g.instruction,
        tableConfig: g.tableConfig,
        noteConfig: g.noteConfig,
        bulletConfig: g.bulletConfig,
        imageUrl: g.imageUrl,
        matchingOptions: g.matchingOptions,
        matchingReuseAllowed: g.matchingReuseAllowed,
        interchangeableAnswers: g.interchangeableAnswers,
        headingsConfig: g.headingsConfig,
        summaryConfig: g.summaryConfig,
        endingsConfig: g.endingsConfig,
        questions: (g.questions || []).map(safeQ)
      })),
      questions: p.questions.map(safeQ)
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
    const passagesRaw = await Passage.find({ _id: { $in: attempt.passagesUsed } });
    // Giữ đúng thứ tự passage1 → passage2 → passage3 như khi thi
    const idOrder = attempt.passagesUsed.map(id => id.toString());
    const passages = idOrder
      .map(id => passagesRaw.find(p => p._id.toString() === id))
      .filter(Boolean);

    // Chấm điểm
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    const gradedAnswers = [];

    // Helper: grade một câu riêng lẻ (trả về isCorrect)
    function gradeOne(rawUser, rawCorrect) {
      if (!rawUser) return false;
      try {
        const userArr = JSON.parse(rawUser);
        const correctArr = JSON.parse(rawCorrect);
        if (Array.isArray(userArr) && Array.isArray(correctArr)) {
          const su = [...userArr].map(s => s.toLowerCase()).sort().join(',');
          const sc = [...correctArr].map(s => s.toLowerCase()).sort().join(',');
          return su === sc;
        }
      } catch { /* fall through */ }
      // Hỗ trợ đáp án thay thế dạng "word1 / word2" (admin nhập nhiều đáp án chấp nhận)
      const userLow = rawUser.toLowerCase();
      const alts = rawCorrect.split(/\s*\/\s*/).map(s => s.toLowerCase().trim()).filter(Boolean);
      return alts.some(alt => alt === userLow);
    }

    for (const passage of passages) {
      // Dùng questionGroups nếu có, fallback sang questions[] phẳng
      const groups = passage.questionGroups?.length
        ? passage.questionGroups
        : [{ interchangeableAnswers: false, questions: passage.questions || [] }];

      for (const group of groups) {
        const qs = group.questions || [];

        if (group.interchangeableAnswers && qs.length > 0) {
          // ── Interchangeable: pool matching – từng câu được kiểm tra riêng trong pool đáp án ──
          const correctPool = qs.map(q => (q.correctAnswer || '').trim().toLowerCase());
          const remainingPool = [...correctPool];

          for (const q of qs) {
            const rawUser = (answers[q.questionNumber] || '').toString().trim();
            const userLower = rawUser.toLowerCase();
            const poolIdx = rawUser !== '' ? remainingPool.indexOf(userLower) : -1;
            const answered = rawUser !== '';
            const isCorrect = poolIdx !== -1;
            if (isCorrect) remainingPool.splice(poolIdx, 1);

            if (!answered) skippedCount++;
            else if (isCorrect) correctCount++;
            else wrongCount++;
            gradedAnswers.push({
              questionNumber: q.questionNumber,
              userAnswer: answers[q.questionNumber] || '',
              correctAnswer: q.correctAnswer,
              isCorrect
            });
          }
        } else {
          // ── Chấm bình thường từng câu ──
          for (const q of qs) {
            const rawUser  = (answers[q.questionNumber] || '').toString().trim();
            const rawCorrect = (q.correctAnswer || '').trim();
            const answered = rawUser !== '';
            const isCorrect = gradeOne(rawUser, rawCorrect);

            if (!answered) skippedCount++;
            else if (isCorrect) correctCount++;
            else wrongCount++;

            gradedAnswers.push({
              questionNumber: q.questionNumber,
              userAnswer: answers[q.questionNumber] || '',
              correctAnswer: q.correctAnswer,
              isCorrect
            });
          }
        }
      }
    }

    const endTime = new Date();
    const duration = Math.max(0, Math.floor((endTime - attempt.startTime) / 1000));

    attempt.answers = gradedAnswers;
    attempt.correctCount = correctCount;
    attempt.wrongCount = wrongCount;
    attempt.skippedCount = skippedCount;
    attempt.totalQuestions = gradedAnswers.length;
    attempt.bandScore = attempt.calculateBandScore();
    attempt.endTime = endTime;
    attempt.duration = duration;
    attempt.status = 'completed';

    await attempt.save();

    // Cập nhật streak khi hoàn thành bài thi
    if (req.user.role === 'student') {
      req.user.updateStreak();
      req.user.save().catch(() => {});
    }

    res.json({
      success: true,
      result: {
        attemptId: attempt._id,
        bandScore: attempt.bandScore,
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
    const passagesRaw = await Passage.find({ _id: { $in: attempt.passagesUsed } });
    // Giữ đúng thứ tự passage1 → passage2 → passage3 như khi thi
    const idOrder = attempt.passagesUsed.map(id => id.toString());
    const passages = idOrder
      .map(id => passagesRaw.find(p => p._id.toString() === id))
      .filter(Boolean);

    // Gắn kết quả từng câu vào passage
    const answerMap = {};
    attempt.answers.forEach(a => { answerMap[a.questionNumber] = a; });

    const reviewQ = q => ({
      questionNumber: q.questionNumber,
      type: q.type,
      questionText: q.questionText,
      options: q.options,
      wordBank: q.wordBank,
      paragraphLabels: q.paragraphLabels,
      imageUrl: q.imageUrl,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      userAnswer: answerMap[q.questionNumber]?.userAnswer || '',
      isCorrect: answerMap[q.questionNumber]?.isCorrect || false
    });
    const passagesWithResult = passages.map(p => ({
      _id: p._id,
      title: p.title,
      category: p.category,
      content: p.content,
      questionRange: p.questionRange,
      questionGroups: (p.questionGroups || []).map(g => ({
        groupType: g.groupType,
        groupTitle: g.groupTitle,
        instruction: g.instruction,
        tableConfig: g.tableConfig,
        noteConfig: g.noteConfig,
        bulletConfig: g.bulletConfig,
        imageUrl: g.imageUrl,
        matchingOptions: g.matchingOptions,
        matchingReuseAllowed: g.matchingReuseAllowed,
        interchangeableAnswers: g.interchangeableAnswers,
        headingsConfig: g.headingsConfig,
        summaryConfig: g.summaryConfig,
        endingsConfig: g.endingsConfig,
        questions: (g.questions || []).map(reviewQ)
      })),
      questions: p.questions.map(reviewQ)
    }));

    res.json({
      success: true,
      attempt: {
        _id: attempt._id,
        testName: attempt.testId?.name || '',
        bandScore: attempt.bandScore,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        skippedCount: attempt.skippedCount,
        totalQuestions: attempt.totalQuestions,
        duration: attempt.duration,
        endTime: attempt.endTime,
        passages: passagesWithResult
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
// GET /api/reading/practice/list?category=passage1
// Danh sách tất cả passage theo category (không có đáp án, để học sinh chọn)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/practice/list', auth, async (req, res) => {
  const { category } = req.query;
  if (!['passage1', 'passage2', 'passage3'].includes(category)) {
    return res.status(400).json({ success: false, message: 'Category không hợp lệ' });
  }
  try {
    const passages = await Passage.find({ category, isActive: true })
      .select('_id title category questionRange questionGroups questions')
      .lean();
    const safePassages = passages.map(p => ({
      _id: p._id,
      title: p.title,
      category: p.category,
      questionRange: p.questionRange,
      questionCount: (p.questionGroups || []).reduce((s, g) => s + (g.questions?.length || 0), 0)
        || (p.questions?.length || 0),
      questionGroups: (p.questionGroups || []).map(g => ({
        groupType: g.groupType,
        questions: (g.questions || []).map(q => ({
          questionNumber: q.questionNumber,
          type: q.type,
        }))
      }))
    }));
    res.json({ success: true, passages: safePassages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reading/practice/by-id/:id
// Lấy 1 passage cụ thể theo ID (đầy đủ đáp án, để grade client-side)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/practice/by-id/:id', auth, async (req, res) => {
  try {
    const passage = await Passage.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!passage) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài đọc' });
    }
    res.json({ success: true, passage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reading/practice/:category
// Lấy 1 passage ngẫu nhiên để luyện riêng lẻ (không cần key, grade client-side)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/practice/:category', auth, async (req, res) => {
  const { category } = req.params;
  if (!['passage1', 'passage2', 'passage3'].includes(category)) {
    return res.status(400).json({ success: false, message: 'Category không hợp lệ' });
  }
  try {
    const arr = await Passage.aggregate([
      { $match: { category, isActive: true } },
      { $sample: { size: 1 } }
    ]);
    if (!arr[0]) {
      return res.status(404).json({ success: false, message: 'Chưa có bài đọc cho loại này' });
    }
    res.json({ success: true, passage: arr[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;