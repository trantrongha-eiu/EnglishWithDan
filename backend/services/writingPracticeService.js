'use strict';

// Extracted from routes/writingPractice.js, verbatim logic. The
// manual Fisher-Yates-style shuffle in getTestQuestions (sort by random
// comparator) is known to be statistically biased compared to Mongo's
// $sample used elsewhere in the codebase — left as-is here since fixing
// it would change which questions get selected (a behavior change), not
// just where the code lives; flagged in the migration report instead.
const WPExercise = require('../models/WPExercise');
const WPTopic = require('../models/WPTopic');
const WritingPracticeAttempt = require('../models/WritingPracticeAttempt');
const { levenshtein, NUM_WORDS, buildAnswerHint } = require('../utils/textMatch');

// Practice-mode types that show a "word count + first-letter" hint under the
// question — free-text single-sentence answer types only, same design as
// task1PracticeService.js/task2PracticeService.js's identical HINT_TYPES.
// Not rearrange (the word bank is already fully visible — a letter hint
// would be redundant), not fill_blank (a single blank word/short phrase —
// a letter-blanked pattern would give away almost the entire answer).
const HINT_TYPES = new Set(['translation', 'expand', 'combine']);

// sampleAnswer/blankAnswer/alternativeAnswers were previously stripped with
// a bare destructure at each call site below and nothing put back — the
// client had no way to show the word-count/letter-pattern scaffold that
// task1-practice.html/task2-practice.html already show for their own
// translation-type exercises. Computing the hint from the about-to-be-
// stripped answer text keeps the answer itself never sent to the client.
function sanitizeExerciseForClient(ex) {
  const { sampleAnswer, blankAnswer, alternativeAnswers, ...rest } = ex;
  if (sampleAnswer && HINT_TYPES.has(ex.type)) {
    const hint = buildAnswerHint(sampleAnswer);
    rest.answerWordCount  = hint.wordCount;
    rest.answerLetterHint = hint.pattern;
  }
  return rest;
}

function normalize(str) {
  return str
    .toLowerCase().trim()
    .replace(/\bi'm\b/g,        'i am')
    .replace(/\bi've\b/g,       'i have')
    .replace(/\bi'll\b/g,       'i will')
    .replace(/\bi'd\b/g,        'i would')
    .replace(/\byou're\b/g,     'you are')
    .replace(/\byou've\b/g,     'you have')
    .replace(/\byou'll\b/g,     'you will')
    .replace(/\byou'd\b/g,      'you would')
    .replace(/\bhe's\b/g,       'he is')
    .replace(/\bhe'll\b/g,      'he will')
    .replace(/\bhe'd\b/g,       'he would')
    .replace(/\bshe's\b/g,      'she is')
    .replace(/\bshe'll\b/g,     'she will')
    .replace(/\bshe'd\b/g,      'she would')
    .replace(/\bthey're\b/g,    'they are')
    .replace(/\bthey've\b/g,    'they have')
    .replace(/\bthey'll\b/g,    'they will')
    .replace(/\bthey'd\b/g,     'they would')
    .replace(/\bwe're\b/g,      'we are')
    .replace(/\bwe've\b/g,      'we have')
    .replace(/\bwe'll\b/g,      'we will')
    .replace(/\bwe'd\b/g,       'we would')
    .replace(/\bit's\b/g,       'it is')
    .replace(/\bthat's\b/g,     'that is')
    .replace(/\bthere's\b/g,    'there is')
    .replace(/\bthere're\b/g,   'there are')
    .replace(/\bwhat's\b/g,     'what is')
    .replace(/\bwho's\b/g,      'who is')
    .replace(/\bdon't\b/g,      'do not')
    .replace(/\bdoesn't\b/g,    'does not')
    .replace(/\bdidn't\b/g,     'did not')
    .replace(/\bcan't\b/g,      'cannot')
    .replace(/\bcouldn't\b/g,   'could not')
    .replace(/\bwon't\b/g,      'will not')
    .replace(/\bwouldn't\b/g,   'would not')
    .replace(/\bshouldn't\b/g,  'should not')
    .replace(/\bmustn't\b/g,    'must not')
    .replace(/\bmightn't\b/g,   'might not')
    .replace(/\bisn't\b/g,      'is not')
    .replace(/\baren't\b/g,     'are not')
    .replace(/\bwasn't\b/g,     'was not')
    .replace(/\bweren't\b/g,    'were not')
    .replace(/\bhasn't\b/g,     'has not')
    .replace(/\bhaven't\b/g,    'have not')
    .replace(/\bhadn't\b/g,     'had not')
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\b(\d+)\b/g, n => NUM_WORDS[n] || n)
    .replace(/\s+/g, ' ');
}

function localCheck(exercise, userAnswer) {
  if (exercise.type === 'expand') {
    return {
      checkedBy: 'local', isCorrect: null, isAcceptable: true,
      feedbackVi: 'Xem câu mẫu bên dưới để so sánh và học thêm nhé!',
      corrections: [], suggestedAnswer: exercise.sampleAnswer, upgradeVersion: ''
    };
  }

  const normUser = normalize(userAnswer);

  if (exercise.type === 'fill_blank') {
    const isCorrect = normalize(exercise.blankAnswer || '') === normUser;
    return {
      checkedBy: 'local', isCorrect, isAcceptable: isCorrect,
      grammarScore: isCorrect ? 10 : null, naturalScore: isCorrect ? 10 : null,
      feedbackVi: isCorrect
        ? 'Xuất sắc! Câu trả lời của bạn chính xác. Tiếp tục phát huy nhé! 🎉'
        : 'Câu của bạn khác với đáp án gợi ý. Hãy đọc kỹ câu mẫu và ghi nhớ cấu trúc!',
      corrections: [], suggestedAnswer: exercise.sampleAnswer, upgradeVersion: ''
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

async function listExercises({ level, topic, type, limit = 100, skip = 0 }) {
  const query = { isActive: true };
  if (level && level !== 'all') query.level = level;
  if (topic && topic !== 'all') query.topicKey = topic;
  if (type && type !== 'all') query.type = type;

  const [exercises, total] = await Promise.all([
    WPExercise.find(query).sort({ orderIndex: 1, createdAt: 1 }).skip(Number(skip)).limit(Number(limit)).lean(),
    WPExercise.countDocuments(query)
  ]);
  const safe = exercises.map(sanitizeExerciseForClient);
  return { exercises: safe, total };
}

async function getTestQuestions({ level, count = 10 }) {
  const query = { isActive: true };
  if (level && level !== 'all') query.level = level;
  const all = await WPExercise.find(query).lean();
  const shuffled = all.sort(() => Math.random() - 0.5).slice(0, Number(count));
  const safe = shuffled.map(sanitizeExerciseForClient);
  return { exercises: safe, total: safe.length };
}

async function getMeta() {
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
  return { levels, topics, counts, totalExercises: agg.reduce((s, a) => s + a.count, 0) };
}

async function listTopics() {
  return WPTopic.find({ isActive: true }).sort({ orderIndex: 1 }).lean();
}

async function checkAnswer(exerciseId, userAnswer) {
  const exercise = await WPExercise.findById(exerciseId).lean();
  if (!exercise) return null;
  const feedback = localCheck(exercise, userAnswer);
  const xp = feedback.isCorrect === true ? 15 : feedback.isCorrect === null ? 8 : 5;
  return { feedback, sampleAnswer: exercise.sampleAnswer, grammarPoint: exercise.grammarPoint, xpEarned: xp };
}

async function checkTest(answers) {
  const results = [];
  let correct = 0;

  // Batch-load all exercises in one query instead of one findById per answer
  // (same $in-batching pattern as saveBatch() below).
  const ids = [...new Set(answers.map(a => a.exerciseId).filter(Boolean))];
  const exercises = await WPExercise.find({ _id: { $in: ids } }).lean();
  const exMap = Object.fromEntries(exercises.map(e => [e._id.toString(), e]));

  for (const { exerciseId, userAnswer } of answers) {
    const exercise = exMap[String(exerciseId)];
    if (!exercise) { results.push({ exerciseId, error: 'not found' }); continue; }

    const check = localCheck(exercise, (userAnswer || '').trim());
    const isRight = check.isCorrect === true;
    if (isRight) correct++;

    results.push({
      exerciseId,
      question: exercise.question,
      baseText: exercise.baseText,
      sentences: exercise.sentences,
      type: exercise.type,
      level: exercise.level,
      topicKey: exercise.topicKey,
      grammarPoint: exercise.grammarPoint,
      explanation: exercise.explanation || '',
      userAnswer: userAnswer || '',
      sampleAnswer: exercise.sampleAnswer,
      alternativeAnswers: exercise.alternativeAnswers || [],
      isCorrect: isRight,
      isExpand: exercise.type === 'expand'
    });
  }

  const countable = results.filter(r => r.type !== 'expand').length;
  return { total: results.length, correct, score: countable > 0 ? Math.round((correct / countable) * 100) : 0, countable, results };
}

// Same xpEarned formula as checkAnswer() — never trust a client-supplied
// xpEarned (security audit finding: fed teacher-facing stats/XP totals).
function xpFor(exercise, userAnswer) {
  const feedback = localCheck(exercise, userAnswer || '');
  return feedback.isCorrect === true ? 15 : feedback.isCorrect === null ? 8 : 5;
}

// Groups the batch into one aggregate row per (topic, level) present in it
// — a batch normally covers a single topic+level, but the "Tất cả" topic
// filter lets a student mix topics/levels in one sitting, so each distinct
// combination present still gets its own row rather than being averaged
// together. This is the "wait until the student finishes, then send
// correct/total for the topic" behavior (audit finding, 2026-08-02) — was
// previously one raw per-sentence row per attempt.
async function saveBatch(studentId, attempts) {
  const ids = [...new Set(attempts.map(a => a.exerciseId).filter(Boolean))];
  const exercises = await WPExercise.find({ _id: { $in: ids } }).lean();
  const exMap = Object.fromEntries(exercises.map(e => [e._id.toString(), e]));

  const groups = {};
  for (const a of attempts) {
    const ex = exMap[String(a.exerciseId)];
    if (!ex) continue;
    const key = `${ex.topicKey}::${ex.level}`;
    const xp = xpFor(ex, a.userAnswer);
    if (!groups[key]) groups[key] = { studentId, topic: ex.topicKey, level: ex.level, types: [], totalItems: 0, correctItems: 0, xpEarned: 0 };
    const g = groups[key];
    g.totalItems++;
    if (xp === 15) g.correctItems++;
    g.xpEarned += xp;
    if (!g.types.includes(ex.type)) g.types.push(ex.type);
  }

  const docs = Object.values(groups);
  if (docs.length) await WritingPracticeAttempt.insertMany(docs);
  return docs.reduce((s, d) => s + d.totalItems, 0);
}

async function saveSingle(studentId, { exerciseId, userAnswer }) {
  const exercise = await WPExercise.findById(exerciseId).lean();
  if (!exercise) return null;

  const xp = xpFor(exercise, userAnswer);
  await new WritingPracticeAttempt({
    studentId, topic: exercise.topicKey, level: exercise.level, types: [exercise.type],
    totalItems: 1, correctItems: xp === 15 ? 1 : 0, xpEarned: xp
  }).save();
  return true;
}

async function getHistory(studentId, limit) {
  return WritingPracticeAttempt.find({ studentId })
    .sort({ createdAt: -1 }).limit(limit)
    .select('level types topic totalItems correctItems xpEarned createdAt').lean();
}

async function getMyStats(studentId) {
  const [totals, byLevelAgg] = await Promise.all([
    WritingPracticeAttempt.aggregate([
      { $match: { studentId } },
      { $group: { _id: null, totalXP: { $sum: '$xpEarned' }, totalDone: { $sum: '$totalItems' } } }
    ]),
    WritingPracticeAttempt.aggregate([
      { $match: { studentId } },
      { $group: { _id: '$level', count: { $sum: '$totalItems' } } }
    ])
  ]);
  const byLevel = {};
  byLevelAgg.forEach(({ _id, count }) => { byLevel[_id] = count; });
  return { totalXP: totals[0]?.totalXP || 0, totalDone: totals[0]?.totalDone || 0, byLevel };
}

module.exports = {
  listExercises, getTestQuestions, getMeta, listTopics, checkAnswer, checkTest,
  saveBatch, saveSingle, getHistory, getMyStats,
};
