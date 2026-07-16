'use strict';

// Extracted from routes/task1Practice.js, verbatim logic.
const Task1Exercise = require('../models/Task1Exercise');
const Task1Attempt = require('../models/Task1Attempt');
const { levenshtein, NUM_WORDS } = require('../utils/textMatch');

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
    const candidates = [...(exercise.sampleAnswers || [])];
    if (exercise.primaryAnswer) candidates.push(exercise.primaryAnswer);

    if (exercise.blanksCount > 1) {
      // Multi-blank sentences ask the student to type each missing word in
      // order, comma-separated (see showFillBlankView's placeholder in
      // task1-practice.html). Compare position-by-position instead of
      // normalizing the whole string first — normalize() strips commas
      // without adding a separator, so "from,to,of" silently became
      // "fromtoof" and could never match either a comma-list or a
      // full-sentence answer key.
      const userParts = userAnswer.split(',').map(s => normalize(s)).filter(Boolean);
      const isCorrect = candidates.some(c => {
        const parts = c.includes(',')
          ? c.split(',').map(s => normalize(s)).filter(Boolean)
          : [normalize(c)];
        if (parts.length > 1) return parts.length === userParts.length && parts.every((p, i) => p === userParts[i]);
        // Also accept the whole reconstructed sentence typed out directly.
        return parts[0] === normUser;
      });
      return {
        isCorrect, score: isCorrect ? 100 : 0,
        feedbackVi: isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng — xem đáp án mẫu bên dưới.'
      };
    }

    const accepted = [...new Set(candidates)].map(normalize);
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

  if (exercise.type === 'rearrange') {
    const accepted = exercise.sampleAnswers.map(normalize);
    const isCorrect = accepted.some(a => a === normUser);
    return {
      isCorrect, score: isCorrect ? 100 : 0,
      feedbackVi: isCorrect ? '✅ Chính xác!' : '❌ Thứ tự chưa đúng — xem đáp án mẫu bên dưới.'
    };
  }

  const allAnswers = exercise.sampleAnswers || [];
  const isExact = allAnswers.some(a => normalize(a) === normUser);
  if (isExact) return { isCorrect: true, score: 100, feedbackVi: '✅ Chính xác!' };

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

async function getMeta() {
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

  counts.all = { _total: 0 };
  skills.forEach(s => {
    counts.all[s] = levels.reduce((sum, l) => sum + (counts[l][s] || 0), 0);
  });
  counts.all._total = levels.reduce((sum, l) => sum + counts[l]._total, 0);

  return { counts, totalExercises: counts.all._total };
}

async function listExercises({ level = 'all', skillType = 'all', module: mod = 'all' }) {
  const query = { isActive: true };
  if (level !== 'all') query.level = level;
  if (skillType !== 'all') query.skillType = skillType;
  if (mod !== 'all') query.module = parseInt(mod);

  const exercises = await Task1Exercise.find(query)
    .select('-sampleAnswers -correctOptionIndex')
    .sort({ orderIndex: 1 })
    .lean();
  return { exercises, total: exercises.length };
}

async function checkAnswer(exerciseId, userAnswer) {
  const exercise = await Task1Exercise.findById(exerciseId).lean();
  if (!exercise) return null;

  const result = localCheck(exercise, userAnswer);

  const xpEarned = result.isCorrect
    ? (exercise.xpReward || 5)
    : Math.max(1, Math.floor((exercise.xpReward || 5) * 0.1));

  const mcTypes = ['multiple_choice', 'paraphrase_choose'];
  const sampleAnswer = exercise.primaryAnswer ||
    (mcTypes.includes(exercise.type) ? (exercise.options?.[exercise.correctOptionIndex] || '') : '');

  if (!result.feedbackVi && result.isCorrect === false) {
    result.feedbackVi = `❌ Chưa đúng. Đáp án mẫu: "${sampleAnswer}"`;
  }

  return {
    isCorrect: result.isCorrect,
    score: result.score,
    xpEarned,
    feedbackVi: result.feedbackVi,
    sampleAnswer,
    correctOptionIndex: mcTypes.includes(exercise.type) ? exercise.correctOptionIndex : undefined,
    grammarPoint: exercise.grammarPoint,
    explanation: exercise.explanation,
    hints: exercise.hints || []
  };
}

async function getTestQuestions({ level = 'all', count = 10 }) {
  const query = { isActive: true };
  if (level !== 'all') query.level = level;

  const exercises = await Task1Exercise.aggregate([
    { $match: query },
    { $sample: { size: parseInt(count) } }
  ]);

  return exercises.map(({ sampleAnswers, correctOptionIndex, ...rest }) => rest); // eslint-disable-line no-unused-vars
}

async function checkTest(answers) {
  const results = [];
  let correct = 0;

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
  return {
    results, correct, total: countable,
    score: countable > 0 ? Math.round((correct / countable) * 100) : 0
  };
}

async function saveBatch(userId, attempts, sessionId) {
  // Re-grade server-side against the real answer key instead of trusting
  // client-supplied isCorrect/score/xpEarned — these numbers feed the
  // teacher-facing progress/attempt-history views and per-user XP totals,
  // so a fabricated batch would misrepresent a student's actual work
  // (security audit finding; mirrors checkAnswer()'s own xpEarned formula).
  const ids = attempts.map(a => a.exerciseId).filter(Boolean);
  const exerciseList = await Task1Exercise.find({ _id: { $in: ids } }).lean();
  const exMap = Object.fromEntries(exerciseList.map(e => [e._id.toString(), e]));

  const docs = attempts.map(a => {
    const exercise = exMap[String(a.exerciseId)];
    const userAnswer = a.userAnswer || '';
    let isCorrect = false, score = 0, xpEarned = 0;
    if (exercise) {
      const check = localCheck(exercise, userAnswer);
      isCorrect = check.isCorrect;
      score = check.score;
      xpEarned = isCorrect
        ? (exercise.xpReward || 5)
        : Math.max(1, Math.floor((exercise.xpReward || 5) * 0.1));
    }
    return {
      userId,
      exerciseId: a.exerciseId,
      userAnswer,
      isCorrect,
      score,
      xpEarned,
      skillType: exercise ? exercise.skillType : a.skillType,
      module: exercise ? exercise.module : a.module,
      sessionId: sessionId || null
    };
  });
  await Task1Attempt.insertMany(docs);
  return docs.length;
}

async function getProgress(userId) {
  const [stats, totalXP] = await Promise.all([
    Task1Attempt.aggregate([
      { $match: { userId } },
      { $group: {
        _id: '$skillType',
        total: { $sum: 1 },
        correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        totalXP: { $sum: '$xpEarned' }
      } }
    ]),
    Task1Attempt.aggregate([
      { $match: { userId } },
      { $group: { _id: null, xp: { $sum: '$xpEarned' } } }
    ])
  ]);
  return { stats, totalXP: totalXP[0]?.xp || 0 };
}

async function getHistory(userId, limit) {
  return Task1Attempt.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('isCorrect score skillType module sessionId createdAt xpEarned')
    .lean();
}

module.exports = {
  getMeta, listExercises, checkAnswer, getTestQuestions, checkTest,
  saveBatch, getProgress, getHistory,
};
