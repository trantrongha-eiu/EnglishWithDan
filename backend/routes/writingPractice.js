const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const WPExercise            = require('../models/WPExercise');
const WPTopic               = require('../models/WPTopic');
const WPLesson              = require('../models/WPLesson');
const WritingPracticeAttempt = require('../models/WritingPracticeAttempt');

// ══════════════════════════════════════════════════════════════
//  LOCAL CHECK – no AI, compare against sample + alternative answers
// ══════════════════════════════════════════════════════════════
const NUM_WORDS = { '1':'one','2':'two','3':'three','4':'four','5':'five',
  '6':'six','7':'seven','8':'eight','9':'nine','10':'ten' };

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

function normalize(str) {
  return str
    .toLowerCase().trim()
    // expand contractions before stripping apostrophes
    .replace(/\bi'm\b/g,     'i am')
    .replace(/\bdon't\b/g,   'do not')
    .replace(/\bdoesn't\b/g, 'does not')
    .replace(/\bcan't\b/g,   'cannot')
    .replace(/\bwon't\b/g,   'will not')
    .replace(/\bthey're\b/g, 'they are')
    .replace(/\bwe're\b/g,   'we are')
    .replace(/\bit's\b/g,    'it is')
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\b(\d+)\b/g, n => NUM_WORDS[n] || n)
    .replace(/\s+/g, ' ');
}

function localCheck(exercise, userAnswer) {
  // For expand type: can't check locally — just show sample
  if (exercise.type === 'expand') {
    return {
      checkedBy: 'local',
      isCorrect: null,  // null = "can't tell, just practice"
      isAcceptable: true,
      feedbackVi: 'Xem câu mẫu bên dưới để so sánh và học thêm nhé!',
      corrections: [],
      suggestedAnswer: exercise.sampleAnswer,
      upgradeVersion: ''
    };
  }

  const normUser = normalize(userAnswer);

  // For fill_blank: user submits only the blank word — compare against blankAnswer
  if (exercise.type === 'fill_blank') {
    const isCorrect = normalize(exercise.blankAnswer || '') === normUser;
    return {
      checkedBy: 'local',
      isCorrect,
      isAcceptable: isCorrect,
      grammarScore: isCorrect ? 10 : null,
      naturalScore: isCorrect ? 10 : null,
      feedbackVi: isCorrect
        ? 'Xuất sắc! Câu trả lời của bạn chính xác. Tiếp tục phát huy nhé! 🎉'
        : 'Câu của bạn khác với đáp án gợi ý. Hãy đọc kỹ câu mẫu và ghi nhớ cấu trúc!',
      corrections: [],
      suggestedAnswer: exercise.sampleAnswer,
      upgradeVersion: ''
    };
  }

  const allAnswers = [exercise.sampleAnswer, ...(exercise.alternativeAnswers || [])];
  const isExact = allAnswers.some(a => normalize(a) === normUser);

  if (isExact) {
    return {
      checkedBy: 'local', isCorrect: true, isAcceptable: true,
      grammarScore: 10, naturalScore: 10,
      feedbackVi: 'Xuất sắc! Câu trả lời của bạn chính xác. Tiếp tục phát huy nhé! 🎉',
      corrections: [], suggestedAnswer: exercise.sampleAnswer,
      upgradeVersion: exercise.alternativeAnswers?.[0] || ''
    };
  }

  // Intermediate: accept answers with ≤ 4 character edits (≈ 1-2 typos/missing words)
  if (exercise.level === 'intermediate') {
    const isFuzzy = allAnswers.some(a => {
      const normA = normalize(a);
      const dist = levenshtein(normA, normUser);
      const ratio = dist / Math.max(normA.length, normUser.length, 1);
      return dist <= 4 && ratio < 0.12;
    });
    if (isFuzzy) {
      return {
        checkedBy: 'local', isCorrect: true, isAcceptable: true,
        grammarScore: 9, naturalScore: 9,
        feedbackVi: 'Gần đúng! Có 1-2 lỗi nhỏ nhưng cấu trúc câu rất tốt. Kiểm tra chính tả nhé! 👍',
        corrections: [], suggestedAnswer: exercise.sampleAnswer,
        upgradeVersion: exercise.alternativeAnswers?.[0] || ''
      };
    }
  }

  return {
    checkedBy: 'local', isCorrect: false, isAcceptable: false,
    grammarScore: null, naturalScore: null,
    feedbackVi: 'Câu của bạn khác với đáp án gợi ý. Hãy đọc kỹ câu mẫu và ghi nhớ cấu trúc!',
    corrections: [], suggestedAnswer: exercise.sampleAnswer,
    upgradeVersion: exercise.alternativeAnswers?.[0] || ''
  };
}

// ══════════════════════════════════════════════════════════════
//  GET /api/writing-practice/exercises
// ══════════════════════════════════════════════════════════════
router.get('/exercises', async (req, res) => {
  try {
    const { level, topic, type, limit = 100, skip = 0 } = req.query;
    const query = { isActive: true };
    if (level && level !== 'all') query.level    = level;
    if (topic && topic !== 'all') query.topicKey = topic;
    if (type  && type  !== 'all') query.type     = type;

    const [exercises, total] = await Promise.all([
      WPExercise.find(query)
        .sort({ orderIndex: 1, createdAt: 1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      WPExercise.countDocuments(query)
    ]);

    const safe = exercises.map(({ sampleAnswer, blankAnswer, alternativeAnswers, ...rest }) => rest); // eslint-disable-line no-unused-vars
    res.json({ success: true, exercises: safe, total });
  } catch (err) {
    console.error('[WP] GET /exercises:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/writing-practice/test-questions
//  Returns N random exercises for test mode (no answers)
//  Query: level, count (default 10)
// ══════════════════════════════════════════════════════════════
router.get('/test-questions', async (req, res) => {
  try {
    const { level, count = 10 } = req.query;
    const query = { isActive: true };
    if (level && level !== 'all') query.level = level;

    // Get all matching, then pick random N
    const all = await WPExercise.find(query).lean();
    const shuffled = all.sort(() => Math.random() - 0.5).slice(0, Number(count));
    const safe = shuffled.map(({ sampleAnswer, blankAnswer, alternativeAnswers, ...rest }) => rest); // eslint-disable-line no-unused-vars
    res.json({ success: true, exercises: safe, total: safe.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/writing-practice/meta
// ══════════════════════════════════════════════════════════════
router.get('/meta', async (_req, res) => {
  try {
    const [topics, agg] = await Promise.all([
      WPTopic.find({ isActive: true }).sort({ orderIndex: 1 }).lean(),
      WPExercise.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: { level: '$level', topicKey: '$topicKey' }, count: { $sum: 1 } } }
      ])
    ]);
    const levels = ['beginner', 'elementary', 'intermediate'];
    const counts = {};
    levels.forEach(l => {
      counts[l] = { _total: 0 };
      topics.forEach(t => { counts[l][t.key] = 0; });
    });
    agg.forEach(({ _id, count }) => {
      if (counts[_id.level]) {
        counts[_id.level][_id.topicKey] = count;
        counts[_id.level]._total += count;
      }
    });
    res.json({ success: true, levels, topics, counts,
      totalExercises: agg.reduce((s, a) => s + a.count, 0) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/writing-practice/topics
// ══════════════════════════════════════════════════════════════
router.get('/topics', async (_req, res) => {
  try {
    const topics = await WPTopic.find({ isActive: true }).sort({ orderIndex: 1 }).lean();
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/writing-practice/check
//  Uses local check for all exercise types
// ══════════════════════════════════════════════════════════════
router.post('/check', async (req, res) => {
  const { exerciseId, userAnswer } = req.body;
  if (!exerciseId || !userAnswer?.trim())
    return res.status(400).json({ success: false, message: 'Thiếu exerciseId hoặc câu trả lời' });

  try {
    const exercise = await WPExercise.findById(exerciseId).lean();
    if (!exercise)
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });

    const feedback = localCheck(exercise, userAnswer.trim());
    const xp = feedback.isCorrect === true ? 15 : feedback.isCorrect === null ? 8 : 5;

    res.json({
      success: true,
      feedback,
      sampleAnswer: exercise.sampleAnswer,
      grammarPoint: exercise.grammarPoint,
      xpEarned: xp
    });
  } catch (err) {
    console.error('[WP] check error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi khi chấm bài. Vui lòng thử lại.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/writing-practice/check-test
//  Grades a full test submission: array of { exerciseId, userAnswer }
//  Returns results with correct answers revealed
// ══════════════════════════════════════════════════════════════
router.post('/check-test', async (req, res) => {
  const { answers } = req.body; // [{ exerciseId, userAnswer }]
  if (!Array.isArray(answers) || !answers.length)
    return res.status(400).json({ success: false, message: 'Không có câu trả lời' });

  try {
    const results = [];
    let correct = 0;

    for (const { exerciseId, userAnswer } of answers) {
      const exercise = await WPExercise.findById(exerciseId).lean();
      if (!exercise) { results.push({ exerciseId, error: 'not found' }); continue; }

      const check   = localCheck(exercise, (userAnswer || '').trim());
      const isRight = check.isCorrect === true;
      if (isRight) correct++;

      results.push({
        exerciseId,
        question:     exercise.question,
        baseText:     exercise.baseText,
        sentences:    exercise.sentences,
        type:         exercise.type,
        level:        exercise.level,
        topicKey:     exercise.topicKey,
        grammarPoint: exercise.grammarPoint,
        explanation:  exercise.explanation || '',
        userAnswer:   userAnswer || '',
        sampleAnswer: exercise.sampleAnswer,
        alternativeAnswers: exercise.alternativeAnswers || [],
        isCorrect:    isRight,
        isExpand:     exercise.type === 'expand'
      });
    }

    const countable = results.filter(r => r.type !== 'expand').length;
    res.json({
      success: true,
      total:   results.length,
      correct,
      score:   countable > 0 ? Math.round((correct / countable) * 100) : 0,
      countable,
      results
    });
  } catch (err) {
    console.error('[WP] check-test error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/writing-practice/save-batch  (auth required)
//  Lưu toàn bộ kết quả của 1 buổi luyện tập khi hoàn thành hết bài
//  Body: { attempts: [{ exerciseId, userAnswer, xpEarned }] }
// ══════════════════════════════════════════════════════════════
router.post('/save-batch', auth, async (req, res) => {
  try {
    const { attempts } = req.body;
    if (!Array.isArray(attempts) || !attempts.length)
      return res.status(400).json({ success: false, message: 'Không có dữ liệu' });

    const ids       = [...new Set(attempts.map(a => a.exerciseId).filter(Boolean))];
    const exercises = await WPExercise.find({ _id: { $in: ids } }).lean();
    const exMap     = Object.fromEntries(exercises.map(e => [e._id.toString(), e]));

    const docs = attempts
      .map(a => {
        const ex = exMap[String(a.exerciseId)];
        if (!ex) return null;
        return {
          studentId:  req.user._id,
          exerciseId: a.exerciseId,
          level:      ex.level,
          type:       ex.type,
          topic:      ex.topicKey,
          userAnswer: a.userAnswer || '',
          xpEarned:   a.xpEarned  || 0
        };
      })
      .filter(Boolean);

    if (docs.length) await WritingPracticeAttempt.insertMany(docs);
    res.json({ success: true, saved: docs.length });
  } catch (err) {
    console.error('[WP] save-batch error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/writing-practice/save  (auth required)
// ══════════════════════════════════════════════════════════════
router.post('/save', auth, async (req, res) => {
  try {
    const { exerciseId, userAnswer, xpEarned } = req.body;
    const exercise = await WPExercise.findById(exerciseId).lean();
    if (!exercise)
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });

    await new WritingPracticeAttempt({
      studentId:  req.user._id,
      exerciseId: exerciseId.toString(),
      level:      exercise.level,
      type:       exercise.type,
      topic:      exercise.topicKey,
      userAnswer,
      xpEarned: xpEarned || 0
    }).save();

    res.json({ success: true });
  } catch (err) {
    console.error('[WP] save error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/writing-practice/my-stats  (auth required)
// ══════════════════════════════════════════════════════════════
router.get('/my-stats', auth, async (req, res) => {
  try {
    const attempts = await WritingPracticeAttempt.find({ studentId: req.user._id }).lean();
    const totalXP   = attempts.reduce((s, a) => s + (a.xpEarned || 0), 0);
    const byLevel   = {};
    attempts.forEach(a => { byLevel[a.level] = (byLevel[a.level] || 0) + 1; });
    res.json({ success: true, totalXP, totalDone: attempts.length, byLevel });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  ADMIN – bulk add / soft delete
// ══════════════════════════════════════════════════════════════
router.post('/admin/exercises', auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ success: false });
    const { exercises } = req.body;
    if (!Array.isArray(exercises) || !exercises.length)
      return res.status(400).json({ success: false });
    const lessonCache = {};
    const created = [];
    for (const ex of exercises) {
      const lKey = `${ex.topicKey}:${ex.level}`;
      if (!lessonCache[lKey]) {
        let lesson = await WPLesson.findOne({ topicKey: ex.topicKey, level: ex.level });
        if (!lesson) lesson = await WPLesson.create({ topicKey: ex.topicKey, level: ex.level,
          title: `${ex.topicKey} – ${ex.level}`, lessonType: ex.level === 'intermediate' ? 'paragraph' : 'sentence' });
        lessonCache[lKey] = lesson._id;
      }
      const doc = await WPExercise.create({ ...ex, lessonId: lessonCache[lKey] });
      created.push(doc._id);
    }
    res.json({ success: true, created: created.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

router.delete('/admin/exercises/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    await WPExercise.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
