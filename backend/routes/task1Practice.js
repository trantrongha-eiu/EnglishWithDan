const express       = require('express');
const router        = express.Router();
const auth          = require('../middleware/auth');
const Task1Exercise = require('../models/Task1Exercise');
const Task1Attempt  = require('../models/Task1Attempt');

// ── Helpers ───────────────────────────────────────────────────────────
const NUM_WORDS = { '1':'one','2':'two','3':'three','4':'four','5':'five',
  '6':'six','7':'seven','8':'eight','9':'nine','10':'ten' };

function normalize(str) {
  return (str || '')
    .toLowerCase().trim()
    .replace(/\bi'm\b/g, 'i am').replace(/\bdon't\b/g, 'do not')
    .replace(/\bdoesn't\b/g, 'does not').replace(/\bcan't\b/g, 'cannot')
    .replace(/\bwon't\b/g, 'will not').replace(/\bit's\b/g, 'it is')
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\b(\d+)\b/g, n => NUM_WORDS[n] || n)
    .replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function localCheck(exercise, userAnswer) {
  const normUser = normalize(userAnswer);

  if (exercise.type === 'multiple_choice' || exercise.type === 'paraphrase_choose') {
    const idx = parseInt(userAnswer, 10);
    const isCorrect = idx === exercise.correctOptionIndex;
    return {
      isCorrect, score: isCorrect ? 100 : 0,
      feedbackVi: isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng — xem đáp án mẫu bên dưới.'
    };
  }

  if (exercise.type === 'fill_blank') {
    const accepted = exercise.sampleAnswers.map(normalize);
    const isCorrect = accepted.some(a => {
      if (a === normUser) return true;
      const dist = levenshtein(a, normUser);
      return dist <= 1 && dist / Math.max(a.length, normUser.length, 1) < 0.2;
    });
    return {
      isCorrect, score: isCorrect ? 100 : 0,
      feedbackVi: isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng — xem đáp án mẫu bên dưới.'
    };
  }

  // rearrange: check word order
  if (exercise.type === 'rearrange') {
    const accepted = exercise.sampleAnswers.map(normalize);
    const isCorrect = accepted.some(a => a === normUser);
    return {
      isCorrect, score: isCorrect ? 100 : 0,
      feedbackVi: isCorrect ? '✅ Chính xác!' : '❌ Thứ tự chưa đúng — xem đáp án mẫu bên dưới.'
    };
  }

  // translation / error_correction / data_transform: keyword-based fallback
  const allAnswers = exercise.sampleAnswers || [];
  const isExact = allAnswers.some(a => normalize(a) === normUser);
  if (isExact) return { isCorrect: true, score: 100, feedbackVi: '✅ Chính xác!' };

  // fuzzy check: most key words present
  const bestMatch = allAnswers.some(a => {
    const words = normalize(a).split(' ').filter(w => w.length > 3);
    const matchCount = words.filter(w => normUser.includes(w)).length;
    return matchCount / (words.length || 1) >= 0.75;
  });

  if (bestMatch) {
    return { isCorrect: true, score: 80, feedbackVi: '✅ Gần đúng! Kiểm tra lại chính tả nhé.' };
  }

  return { isCorrect: false, score: 0, feedbackVi: '❌ Chưa đúng — xem đáp án mẫu bên dưới.' };
}


// ══════════════════════════════════════════════════════════════════════
//  GET /api/task1/meta  – số câu theo level + skillType (không cần auth)
// ══════════════════════════════════════════════════════════════════════
router.get('/meta', async (_req, res) => {
  try {
    const agg = await Task1Exercise.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: { level: '$level', skillType: '$skillType' }, count: { $sum: 1 } } }
    ]);

    const levels = ['beginner', 'elementary', 'intermediate'];
    const skills = ['noun_phrase', 'data_description', 'comparison', 'trend_language', 'paraphrase', 'overview'];

    const counts = {};
    levels.forEach(l => {
      counts[l] = { _total: 0 };
      skills.forEach(s => { counts[l][s] = 0; });
    });

    agg.forEach(({ _id, count }) => {
      if (counts[_id.level]) {
        counts[_id.level][_id.skillType] = (counts[_id.level][_id.skillType] || 0) + count;
        counts[_id.level]._total += count;
      }
    });

    // Tổng "Tất cả" = cộng tất cả levels
    counts.all = { _total: 0 };
    skills.forEach(s => {
      counts.all[s] = levels.reduce((sum, l) => sum + (counts[l][s] || 0), 0);
    });
    counts.all._total = levels.reduce((sum, l) => sum + counts[l]._total, 0);

    res.json({ success: true, counts, totalExercises: counts.all._total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  GET /api/task1/exercises
// ══════════════════════════════════════════════════════════════════════
router.get('/exercises', async (req, res) => {
  try {
    const { level = 'all', skillType = 'all', module: mod = 'all' } = req.query;
    const query = { isActive: true };
    if (level !== 'all') query.level = level;
    if (skillType !== 'all') query.skillType = skillType;
    if (mod !== 'all') query.module = parseInt(mod);

    const exercises = await Task1Exercise.find(query)
      .select('-sampleAnswers -correctOptionIndex')
      .sort({ orderIndex: 1 })
      .lean();

    res.json({ success: true, exercises, total: exercises.length });
  } catch (err) {
    console.error('[Task1] GET /exercises:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  POST /api/task1/check
// ══════════════════════════════════════════════════════════════════════
router.post('/check', async (req, res) => {
  const { exerciseId, userAnswer } = req.body;
  if (!exerciseId || userAnswer === undefined)
    return res.status(400).json({ success: false, message: 'Thiếu exerciseId hoặc câu trả lời' });

  try {
    const exercise = await Task1Exercise.findById(exerciseId).lean();
    if (!exercise)
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });

    const result = localCheck(exercise, userAnswer.trim());

    const xpEarned = result.isCorrect
      ? (exercise.xpReward || 5)
      : Math.max(1, Math.floor((exercise.xpReward || 5) * 0.1));

    const mcTypes = ['multiple_choice', 'paraphrase_choose'];
    const sampleAnswer = exercise.primaryAnswer ||
      (mcTypes.includes(exercise.type) ? (exercise.options?.[exercise.correctOptionIndex] || '') : '');

    if (!result.feedbackVi && result.isCorrect === false) {
      result.feedbackVi = `❌ Chưa đúng. Đáp án mẫu: "${sampleAnswer}"`;
    }

    res.json({
      success: true,
      isCorrect: result.isCorrect,
      score: result.score,
      xpEarned,
      feedbackVi: result.feedbackVi,
      sampleAnswer,
      correctOptionIndex: mcTypes.includes(exercise.type) ? exercise.correctOptionIndex : undefined,
      grammarPoint: exercise.grammarPoint,
      explanation: exercise.explanation,
      hints: exercise.hints || []
    });
  } catch (err) {
    console.error('[Task1] check error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi khi chấm bài' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  GET /api/task1/test-questions
// ══════════════════════════════════════════════════════════════════════
router.get('/test-questions', async (req, res) => {
  try {
    const { level = 'all', count = 10 } = req.query;
    const query = { isActive: true };
    if (level !== 'all') query.level = level;

    const exercises = await Task1Exercise.aggregate([
      { $match: query },
      { $sample: { size: parseInt(count) } }
    ]);

    const safe = exercises.map(({ sampleAnswers, correctOptionIndex, ...rest }) => rest); // eslint-disable-line no-unused-vars
    res.json({ success: true, exercises: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  POST /api/task1/check-test
// ══════════════════════════════════════════════════════════════════════
router.post('/check-test', async (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers) || !answers.length)
    return res.status(400).json({ success: false, message: 'Không có câu trả lời' });

  try {
    const results = [];
    let correct = 0;

    // Batch-load all exercises in one query instead of N sequential findById calls
    const ids = answers.map(a => a.exerciseId).filter(Boolean);
    const exerciseList = await Task1Exercise.find({ _id: { $in: ids } }).lean();
    const exMap = Object.fromEntries(exerciseList.map(e => [e._id.toString(), e]));

    for (const { exerciseId, userAnswer } of answers) {
      const exercise = exMap[String(exerciseId)];
      if (!exercise) { results.push({ exerciseId, error: 'not found' }); continue; }

      const check = localCheck(exercise, (userAnswer || '').trim());
      if (check.isCorrect) correct++;

      results.push({
        exerciseId,
        type: exercise.type,
        skillType: exercise.skillType,
        instruction: exercise.instruction,
        questionVi: exercise.questionVi,
        questionEn: exercise.questionEn,
        sentenceWithBlanks: exercise.sentenceWithBlanks,
        userAnswer: userAnswer || '',
        sampleAnswer: exercise.primaryAnswer,
        isCorrect: check.isCorrect,
        score: check.score,
        grammarPoint: exercise.grammarPoint,
        explanation: exercise.explanation,
        feedbackVi: check.feedbackVi
      });
    }

    const countable = results.filter(r => !r.error).length;
    res.json({
      success: true,
      results,
      correct,
      total: countable,
      score: countable > 0 ? Math.round((correct / countable) * 100) : 0
    });
  } catch (err) {
    console.error('[Task1] check-test error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  POST /api/task1/save-batch  (auth optional — saves if logged in)
// ══════════════════════════════════════════════════════════════════════
router.post('/save-batch', auth, async (req, res) => {
  try {
    const { attempts, sessionId } = req.body;
    if (!Array.isArray(attempts) || !attempts.length)
      return res.json({ success: true, saved: 0 });

    const docs = attempts.map(a => ({
      userId:     req.user._id,
      exerciseId: a.exerciseId,
      userAnswer: a.userAnswer || '',
      isCorrect:  a.isCorrect,
      score:      a.score || 0,
      xpEarned:  a.xpEarned || 0,
      skillType:  a.skillType,
      module:     a.module,
      sessionId:  sessionId || null
    }));

    await Task1Attempt.insertMany(docs);
    res.json({ success: true, saved: docs.length });
  } catch (err) {
    console.error('[Task1] save-batch error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  GET /api/task1/progress  (auth required)
// ══════════════════════════════════════════════════════════════════════
router.get('/progress', auth, async (req, res) => {
  try {
    const stats = await Task1Attempt.aggregate([
      { $match: { userId: req.user._id } },
      { $group: {
        _id: '$skillType',
        total:   { $sum: 1 },
        correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        totalXP: { $sum: '$xpEarned' }
      }}
    ]);
    const totalXP = await Task1Attempt.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, xp: { $sum: '$xpEarned' } } }
    ]);
    res.json({ success: true, stats, totalXP: totalXP[0]?.xp || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  GET /api/task1/history  (auth required)
// ══════════════════════════════════════════════════════════════════════
router.get('/history', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
    const attempts = await Task1Attempt.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('isCorrect score skillType module sessionId createdAt xpEarned')
      .lean();
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
