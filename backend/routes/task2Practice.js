const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/auth');
const Task2Topic   = require('../models/Task2Topic');
const Task2Attempt = require('../models/Task2Attempt');

// ── Helpers ────────────────────────────────────────────────────────────
function normalize(str) {
  return (str || '').toLowerCase().trim()
    .replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ');
}

function keywordMatch(userAnswer, fallbackKeywords, modelAnswer) {
  const lower = normalize(userAnswer);
  const keywords = fallbackKeywords && fallbackKeywords.length
    ? fallbackKeywords
    : modelAnswer ? normalize(modelAnswer).split(' ').filter(w => w.length > 4) : [];

  if (!keywords.length) return { isCorrect: false, score: 0, feedbackVi: '❌ Câu trả lời chưa đạt yêu cầu. Xem đáp án mẫu để tham khảo.' };

  const matched = keywords.filter(kw => lower.includes(kw.toLowerCase()));
  const ratio   = matched.length / keywords.length;
  const score   = Math.round(ratio * 100);
  if (ratio >= 0.7) return { isCorrect: true,  score, feedbackVi: `✅ Tốt lắm! Câu trả lời có các từ khóa quan trọng.` };
  if (ratio >= 0.4) return { isCorrect: false, score, feedbackVi: `📝 Gần đúng. Thiếu một số từ khóa: ${keywords.filter(k => !lower.includes(k.toLowerCase())).slice(0, 3).join(', ')}.` };
  return { isCorrect: false, score: 0, feedbackVi: `❌ Chưa đạt. Từ khóa cần có: ${keywords.slice(0, 4).join(', ')}.` };
}

function autoGrade(q, userAnswer) {
  const norm = normalize(userAnswer);
  const correct = normalize(q.correctAnswer || '');

  if (['essay_type_recognition', 'topic_sentence'].includes(q.type)) {
    if (q.options && q.options.length) {
      const idx = parseInt(userAnswer, 10);
      const byIndex  = !isNaN(idx) && q.options[idx] && normalize(q.options[idx]) === correct;
      const byText   = norm === correct;
      const isCorrect = byIndex || byText;
      return {
        isCorrect,
        score: isCorrect ? 100 : 0,
        feedbackVi: isCorrect ? `✅ Chính xác! ${q.explanationVi || ''}` : `❌ Chưa đúng. ${q.explanationVi || ''}`
      };
    }
    const isCorrect = norm === correct;
    return { isCorrect, score: isCorrect ? 100 : 0, feedbackVi: isCorrect ? `✅ Chính xác!` : `❌ Chưa đúng.` };
  }

  if (q.type === 'fill_blank') {
    const isCorrect = norm === correct || norm.includes(correct);
    return {
      isCorrect, score: isCorrect ? 100 : 0,
      feedbackVi: isCorrect ? `✅ Chính xác! ${q.explanationVi || ''}` : `❌ Chưa đúng. Đáp án: "${q.correctAnswer}". ${q.explanationVi || ''}`
    };
  }

  if (q.type === 'rearrange') {
    const isCorrect = norm === correct;
    return {
      isCorrect, score: isCorrect ? 100 : 0,
      feedbackVi: isCorrect ? `✅ Đúng rồi!` : `❌ Thứ tự chưa đúng. Đáp án: "${q.correctAnswer}".`
    };
  }

  // translation, error_correction, short_writing, paraphrase
  return keywordMatch(userAnswer, q.fallbackKeywords, q.modelAnswer);
}

// ══════════════════════════════════════════════════════════════════════
//  GET /api/task2/weeks
// ══════════════════════════════════════════════════════════════════════
router.get('/weeks', async (req, res) => {
  try {
    const agg = await Task2Topic.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$week', topicCount: { $sum: 1 }, block: { $first: '$block' } } },
      { $sort: { _id: 1 } }
    ]);
    const weeks = agg.map(w => ({ week: w._id, topicCount: w.topicCount, block: w.block }));
    res.json({ success: true, weeks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  GET /api/task2/topics/week/:week
// ══════════════════════════════════════════════════════════════════════
router.get('/topics/week/:week', async (req, res) => {
  try {
    const topics = await Task2Topic.find({ week: parseInt(req.params.week), isActive: true })
      .select('-questions -vocabularyList')
      .sort({ orderIndex: 1 })
      .lean();
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  GET /api/task2/questions/topic/:topicId   ?level=
// ══════════════════════════════════════════════════════════════════════
router.get('/questions/topic/:topicId', async (req, res) => {
  try {
    const { level = 'all' } = req.query;
    const topic = await Task2Topic.findById(req.params.topicId).lean();
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });

    let questions = topic.questions || [];
    if (level !== 'all') questions = questions.filter(q => q.level === level);
    questions = questions.sort((a, b) => a.orderIndex - b.orderIndex);

    // strip answers before sending
    const safe = questions.map(({ correctAnswer, fallbackKeywords, ...rest }) => rest); // eslint-disable-line no-unused-vars
    res.json({ success: true, questions: safe, topicName: topic.topicName, topicEmoji: topic.topicEmoji, prompt: topic.prompt, essayType: topic.essayType });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  GET /api/task2/vocabulary/:topicId
// ══════════════════════════════════════════════════════════════════════
router.get('/vocabulary/:topicId', async (req, res) => {
  try {
    const topic = await Task2Topic.findById(req.params.topicId).select('vocabularyList topicName').lean();
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    res.json({ success: true, vocabularyList: topic.vocabularyList || [], topicName: topic.topicName });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  POST /api/task2/check  { topicId, questionId, userAnswer }
// ══════════════════════════════════════════════════════════════════════
router.post('/check', async (req, res) => {
  const { topicId, questionId, userAnswer } = req.body;
  if (!topicId || !questionId || userAnswer === undefined)
    return res.status(400).json({ success: false, message: 'Thiếu thông tin' });

  try {
    const topic = await Task2Topic.findById(topicId).lean();
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });

    const q = (topic.questions || []).find(q => q._id.toString() === questionId || q.questionId === questionId);
    if (!q) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });

    const result = autoGrade(q, (userAnswer || '').trim());

    res.json({
      success: true,
      isCorrect:    result.isCorrect,
      score:        result.score,
      feedbackVi:   result.feedbackVi,
      modelAnswer:  q.modelAnswer || q.correctAnswer || '',
      explanationVi: q.explanationVi || '',
      explanationEn: q.explanationEn || ''
    });
  } catch (err) {
    console.error('[Task2] check error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi chấm bài' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  GET /api/task2/exam  ?week=&level=&count=10
// ══════════════════════════════════════════════════════════════════════
router.get('/exam', async (req, res) => {
  try {
    const { week = 'all', level = 'all', count = 10 } = req.query;
    const topicFilter = { isActive: true };
    if (week !== 'all') topicFilter.week = parseInt(week);

    const topics = await Task2Topic.find(topicFilter).lean();

    let allQ = [];
    topics.forEach(t => {
      let qs = (t.questions || []);
      if (level !== 'all') qs = qs.filter(q => q.level === level);
      qs.forEach(q => allQ.push({ ...q, topicId: t._id, topicName: t.topicName, prompt: t.prompt, essayType: t.essayType }));
    });

    // shuffle and take count
    for (let i = allQ.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQ[i], allQ[j]] = [allQ[j], allQ[i]];
    }
    const selected = allQ.slice(0, parseInt(count));
    const safe = selected.map(({ correctAnswer, fallbackKeywords, ...rest }) => rest); // eslint-disable-line no-unused-vars
    res.json({ success: true, questions: safe, total: safe.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  POST /api/task2/exam/submit  { answers: [{topicId, questionId, userAnswer}] }
// ══════════════════════════════════════════════════════════════════════
router.post('/exam/submit', async (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers) || !answers.length)
    return res.status(400).json({ success: false, message: 'Không có câu trả lời' });

  try {
    const results = [];
    let correct = 0;

    // batch-load unique topics
    const topicIds = [...new Set(answers.map(a => a.topicId))];
    const topics   = await Task2Topic.find({ _id: { $in: topicIds } }).lean();
    const topicMap = Object.fromEntries(topics.map(t => [t._id.toString(), t]));

    for (const { topicId, questionId, userAnswer } of answers) {
      const topic = topicMap[topicId];
      if (!topic) { results.push({ questionId, error: 'topic not found' }); continue; }
      const q = (topic.questions || []).find(q => q._id.toString() === questionId || q.questionId === questionId);
      if (!q)  { results.push({ questionId, error: 'question not found' }); continue; }

      const check = autoGrade(q, (userAnswer || '').trim());
      if (check.isCorrect) correct++;

      results.push({
        questionId,
        questionId2: q.questionId,
        topicName: topic.topicName,
        type: q.type,
        level: q.level,
        questionText: q.questionText,
        userAnswer: userAnswer || '',
        modelAnswer: q.modelAnswer || q.correctAnswer || '',
        isCorrect: check.isCorrect,
        score: check.score,
        explanationVi: q.explanationVi || '',
        feedbackVi: check.feedbackVi
      });
    }

    const total = results.filter(r => !r.error).length;
    res.json({
      success: true,
      results,
      correct,
      total,
      score: total > 0 ? Math.round((correct / total) * 100) : 0
    });
  } catch (err) {
    console.error('[Task2] exam/submit error:', err);
    res.status(500).json({ success: false, message: 'Lỗi chấm bài' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  POST /api/task2/save-attempt  (auth required)
// ══════════════════════════════════════════════════════════════════════
router.post('/save-attempt', auth, async (req, res) => {
  try {
    const { sessionType, week, topicId, topicName, level, questionsAttempted, totalQuestions, correctCount } = req.body;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const attempt = new Task2Attempt({
      userId: req.user._id, sessionType, week, topicId, topicName, level,
      questionsAttempted: questionsAttempted || [],
      totalQuestions, correctCount, scorePercentage: score
    });
    await attempt.save();
    res.json({ success: true, attempt });
  } catch (err) {
    console.error('[Task2] save-attempt error:', err);
    res.status(500).json({ success: false, message: 'Lỗi lưu kết quả' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  GET /api/task2/progress  (auth required)
// ══════════════════════════════════════════════════════════════════════
router.get('/progress', auth, async (req, res) => {
  try {
    const stats = await Task2Attempt.aggregate([
      { $match: { userId: req.user._id } },
      { $group: {
        _id: '$week',
        attempts: { $sum: 1 },
        avgScore: { $avg: '$scorePercentage' },
        lastAttempt: { $max: '$createdAt' }
      }},
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
