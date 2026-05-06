const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const WPExercise            = require('../models/WPExercise');
const WPTopic               = require('../models/WPTopic');
const WPLesson              = require('../models/WPLesson');
const WritingPracticeAttempt = require('../models/WritingPracticeAttempt');

// ══════════════════════════════════════════════════════════════
//  HELPER – AI feedback via Anthropic
// ══════════════════════════════════════════════════════════════
async function checkWithAI(exercise, userAnswer) {
  const typeLabel = {
    translation: 'Translation (Vietnamese → English)',
    rearrange:   'Word Rearranging',
    fill_blank:  'Fill in the Blank',
    expand:      'Sentence Expansion',
    combine:     'Sentence Combining'
  }[exercise.type] || exercise.type;

  const questionContext = exercise.type === 'combine'
    ? `Sentences to combine: "${(exercise.sentences || []).join('" and "')}" (connector hint: ${exercise.connector})`
    : exercise.type === 'expand'
    ? `Base sentence to expand: "${exercise.baseText}"`
    : `Vietnamese/Original: "${exercise.question}"`;

  const userPrompt =
`Exercise type: ${typeLabel}
Grammar focus: ${exercise.grammarPoint}
${questionContext}
Student's answer: "${userAnswer}"
Sample answer: "${exercise.sampleAnswer}"

Reply ONLY with valid JSON (no markdown, no extra text):
{"grammarScore":<1-10>,"naturalScore":<1-10>,"isAcceptable":<true/false>,"corrections":[{"error":"<exact error text>","fix":"<corrected text>","explainVi":"<Vietnamese explanation>"}],"feedbackVi":"<2 sentences encouragement + tip in Vietnamese>","suggestedAnswer":"<best version>","upgradeVersion":"<more natural/advanced version>"}

Rules:
- corrections: empty array [] if no significant errors
- grammarScore 10=perfect, 7=minor errors, 5=noticeable errors, 3=many errors
- naturalScore: how native-like it sounds
- upgradeVersion: always show a slightly better/more expressive version
- feedbackVi: be encouraging, mention 1 specific thing to improve`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      temperature: 0.2,
      system: 'You are an encouraging English writing teacher for Vietnamese IELTS foundation students (band 4-5.5). Give precise, brief, student-friendly feedback. Always reply with valid JSON only.',
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} – ${err}`);
  }

  const data  = await response.json();
  const text  = data.content?.[0]?.text || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI returned non-JSON: ' + text.slice(0, 200));
  return JSON.parse(match[0]);
}

// Strip answer fields before sending exercise list to client
function sanitize(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.sampleAnswer;
  delete obj.blankAnswer;
  delete obj.alternativeAnswers;
  return obj;
}

// ══════════════════════════════════════════════════════════════
//  GET /api/writing-practice/exercises
//  Query: level, topic, type, limit, skip
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

    // Strip answer fields
    const safe = exercises.map(ex => {
      const { sampleAnswer, blankAnswer, alternativeAnswers, ...rest } = ex;  // eslint-disable-line no-unused-vars
      return rest;
    });

    res.json({ success: true, exercises: safe, total });
  } catch (err) {
    console.error('[WritingPractice] GET /exercises error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/writing-practice/meta
//  Returns topics, levels, counts, lessons for sidebar filters
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

    const totalExercises = agg.reduce((s, a) => s + a.count, 0);

    res.json({ success: true, levels, topics, counts, totalExercises });
  } catch (err) {
    console.error('[WritingPractice] GET /meta error:', err);
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
//  GET /api/writing-practice/lessons
//  Query: topicKey, level
// ══════════════════════════════════════════════════════════════
router.get('/lessons', async (req, res) => {
  try {
    const { topicKey, level } = req.query;
    const query = { isActive: true };
    if (topicKey) query.topicKey = topicKey;
    if (level)    query.level    = level;
    const lessons = await WPLesson.find(query).sort({ orderIndex: 1 }).lean();
    res.json({ success: true, lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/writing-practice/check
//  Body: { exerciseId, userAnswer }
// ══════════════════════════════════════════════════════════════
router.post('/check', async (req, res) => {
  const { exerciseId, userAnswer } = req.body;
  if (!exerciseId || !userAnswer?.trim())
    return res.status(400).json({ success: false, message: 'Thiếu exerciseId hoặc câu trả lời' });

  try {
    const exercise = await WPExercise.findById(exerciseId).lean();
    if (!exercise)
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });

    const feedback = await checkWithAI(exercise, userAnswer.trim());

    const avg = ((feedback.grammarScore || 5) + (feedback.naturalScore || 5)) / 2;
    const xp  = avg >= 8 ? 20 : avg >= 6 ? 15 : avg >= 4 ? 10 : 5;

    res.json({
      success: true,
      feedback,
      sampleAnswer: exercise.sampleAnswer,
      grammarPoint: exercise.grammarPoint,
      xpEarned: xp
    });
  } catch (err) {
    console.error('[WritingPractice] AI check error:', err.message);
    res.status(500).json({ success: false, message: 'AI tạm thời không khả dụng. Vui lòng thử lại.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  POST /api/writing-practice/save  (auth required)
// ══════════════════════════════════════════════════════════════
router.post('/save', auth, async (req, res) => {
  try {
    const { exerciseId, userAnswer, aiFeedback, xpEarned } = req.body;
    const exercise = await WPExercise.findById(exerciseId).lean();
    if (!exercise)
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });

    const attempt = new WritingPracticeAttempt({
      studentId:  req.user._id,
      exerciseId: exerciseId.toString(),
      level:      exercise.level,
      type:       exercise.type,
      topic:      exercise.topicKey,
      userAnswer,
      aiFeedback,
      xpEarned: xpEarned || 0
    });
    await attempt.save();

    res.json({ success: true, message: 'Đã lưu kết quả' });
  } catch (err) {
    console.error('[WritingPractice] Save error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GET /api/writing-practice/my-stats  (auth required)
// ══════════════════════════════════════════════════════════════
router.get('/my-stats', auth, async (req, res) => {
  try {
    const attempts = await WritingPracticeAttempt.find({ studentId: req.user._id }).lean();
    const totalXP    = attempts.reduce((s, a) => s + (a.xpEarned || 0), 0);
    const totalDone  = attempts.length;
    const byLevel    = {};
    attempts.forEach(a => { byLevel[a.level] = (byLevel[a.level] || 0) + 1; });
    const avgGrammar = attempts.length
      ? Math.round(attempts.reduce((s, a) => s + (a.aiFeedback?.grammarScore || 0), 0) / attempts.length * 10) / 10
      : 0;
    res.json({ success: true, totalXP, totalDone, byLevel, avgGrammar });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  ADMIN – POST /api/writing-practice/admin/exercises
//  Add exercises in bulk (admin auth handled via admin route)
//  Body: { exercises: [...] }
// ══════════════════════════════════════════════════════════════
router.post('/admin/exercises', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin)
      return res.status(403).json({ success: false, message: 'Không có quyền' });

    const { exercises } = req.body;
    if (!Array.isArray(exercises) || exercises.length === 0)
      return res.status(400).json({ success: false, message: 'Danh sách bài tập trống' });

    // For each exercise, find/create the lesson first
    const lessonCache = {};
    const created = [];
    for (const ex of exercises) {
      const lKey = `${ex.topicKey}:${ex.level}`;
      if (!lessonCache[lKey]) {
        let lesson = await WPLesson.findOne({ topicKey: ex.topicKey, level: ex.level });
        if (!lesson) {
          lesson = await WPLesson.create({
            topicKey: ex.topicKey, level: ex.level,
            title: `${ex.topicKey} – ${ex.level}`,
            lessonType: ex.level === 'intermediate' ? 'paragraph' : 'sentence'
          });
        }
        lessonCache[lKey] = lesson._id;
      }
      const doc = await WPExercise.create({ ...ex, lessonId: lessonCache[lKey] });
      created.push(doc._id);
    }

    res.json({ success: true, created: created.length, ids: created });
  } catch (err) {
    console.error('[WritingPractice] Admin create error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════════════
//  ADMIN – DELETE /api/writing-practice/admin/exercises/:id
// ══════════════════════════════════════════════════════════════
router.delete('/admin/exercises/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin)
      return res.status(403).json({ success: false, message: 'Không có quyền' });
    await WPExercise.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
