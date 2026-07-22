'use strict';

// Extracted from routes/reading.js, verbatim logic. gradeOne()/the pool-
// matching block here is NOT unified with listeningService's grading —
// this file has its own TFNG-exclusion rule and JSON-array-comparison
// shape that differs from listening's, and the review flagged the two as
// independently implemented; only proven-identical logic gets merged
// across files (see listeningService.js's own comment on this).
const Passage = require('../models/Passage');
const ReadingTest = require('../models/ReadingTest');
const TestAttempt = require('../models/TestAttempt');
const ReadingPracticeAttempt = require('../models/ReadingPracticeAttempt');
const { bonusForAccuracy, reserveDailyStreakBonus } = require('./streakBonusService');

function safeQ(q) {
  return {
    questionNumber: q.questionNumber,
    type: q.type,
    questionText: q.questionText,
    options: q.options,
    wordBank: q.wordBank,
    checkboxCount: q.checkboxCount,
    imageUrl: q.imageUrl
  };
}

function reviewQ(q, answerMap) {
  return {
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
  };
}

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
  const userLow = rawUser.toLowerCase();
  const alts = rawCorrect.split(/\s*\/\s*/).map(s => s.toLowerCase().trim()).filter(Boolean);
  return alts.some(alt => alt === userLow);
}

// Shared by submitTest() and savePractice() — grades every question group
// of a passage against an answersMap ({questionNumber: userAnswer}) using
// the real correctAnswer/interchangeableAnswers-pool logic. Extracted so
// savePractice() re-grades server-side instead of trusting client-supplied
// isCorrect/correctCount/wrongCount/skippedCount (security audit finding).
function gradeGroups(groups, answersMap) {
  let correctCount = 0, wrongCount = 0, skippedCount = 0;
  const gradedAnswers = [];

  for (const group of groups) {
    const qs = group.questions || [];
    const isTFNG = qs.some(q => ['true-false-ng', 'yes-no-ng'].includes(q.type));

    if (group.interchangeableAnswers && qs.length > 0 && !isTFNG) {
      const correctPool = qs.map(q => (q.correctAnswer || '').trim().toLowerCase());
      const remainingPool = [...correctPool];
      for (const q of qs) {
        const rawUser = (answersMap[q.questionNumber] || '').toString().trim();
        const userLower = rawUser.toLowerCase();
        const poolIdx = rawUser !== '' ? remainingPool.indexOf(userLower) : -1;
        const answered = rawUser !== '';
        const isCorrect = poolIdx !== -1;
        if (isCorrect) remainingPool.splice(poolIdx, 1);
        if (!answered) skippedCount++;
        else if (isCorrect) correctCount++;
        else wrongCount++;
        gradedAnswers.push({ questionNumber: q.questionNumber, userAnswer: answersMap[q.questionNumber] || '', correctAnswer: q.correctAnswer, isCorrect });
      }
    } else {
      for (const q of qs) {
        const rawUser = (answersMap[q.questionNumber] || '').toString().trim();
        const rawCorrect = (q.correctAnswer || '').trim();
        const answered = rawUser !== '';
        const isCorrect = gradeOne(rawUser, rawCorrect);
        if (!answered) skippedCount++;
        else if (isCorrect) correctCount++;
        else wrongCount++;
        gradedAnswers.push({ questionNumber: q.questionNumber, userAnswer: answersMap[q.questionNumber] || '', correctAnswer: q.correctAnswer, isCorrect });
      }
    }
  }

  return { gradedAnswers, correctCount, wrongCount, skippedCount };
}

function mapPassageGroups(groups, questionMapper) {
  return (groups || []).map(g => ({
    groupType: g.groupType,
    groupTitle: g.groupTitle,
    instruction: g.instruction,
    tableConfig: g.tableConfig,
    noteConfig: g.noteConfig,
    bulletConfig: g.bulletConfig,
    imageUrl: g.imageUrl,
    dragDropConfig: g.dragDropConfig,
    matchingOptionsTitle: g.matchingOptionsTitle,
    matchingOptions: g.matchingOptions,
    matchingReuseAllowed: g.matchingReuseAllowed,
    interchangeableAnswers: g.interchangeableAnswers,
    headingsConfig: g.headingsConfig,
    summaryConfig: g.summaryConfig,
    endingsConfig: g.endingsConfig,
    questions: (g.questions || []).map(questionMapper)
  }));
}

async function listTestsForUser(userId) {
  const [tests, attempts] = await Promise.all([
    // Sort by name with numeric collation (not testNumber, which is only
    // meaningful within a fixed-size series like "Cam 20" and is otherwise
    // an arbitrary/default value) so "Test 2" sorts before "Test 10" instead
    // of lexicographically, matching what students expect to see.
    ReadingTest.find({ isActive: true }).collation({ locale: 'en', numericOrdering: true }).sort({ name: 1 }).lean(),
    TestAttempt.find({ userId, status: 'completed' })
      .select('testId bandScore correctCount wrongCount skippedCount totalQuestions endTime duration').lean()
  ]);
  const attemptMap = {};
  attempts.forEach(a => {
    const key = a.testId.toString();
    if (!attemptMap[key] || attemptMap[key].endTime < a.endTime) attemptMap[key] = a;
  });
  return tests.map(t => ({ ...t, lastAttempt: attemptMap[t._id.toString()] || null }));
}

async function startTest(testId, userId) {
  const test = await ReadingTest.findById(testId);
  if (!test) return { status: 'not_found' };

  const safeProject = { $project: {
    'questionGroups.questions.correctAnswer': 0,
    'questionGroups.questions.explanation': 0,
    'questions.correctAnswer': 0,
    'questions.explanation': 0,
  } };
  const [p1arr, p2arr, p3arr] = await Promise.all([
    Passage.aggregate([{ $match: { category: 'passage1', isActive: true } }, { $sample: { size: 1 } }, safeProject]),
    Passage.aggregate([{ $match: { category: 'passage2', isActive: true } }, { $sample: { size: 1 } }, safeProject]),
    Passage.aggregate([{ $match: { category: 'passage3', isActive: true } }, { $sample: { size: 1 } }, safeProject])
  ]);

  if (!p1arr[0] || !p2arr[0] || !p3arr[0]) return { status: 'insufficient_data' };

  const passages = [p1arr[0], p2arr[0], p3arr[0]];

  const attempt = new TestAttempt({ userId, testId, passagesUsed: passages.map(p => p._id), startTime: new Date() });
  await attempt.save();

  const safePassages = passages.map(p => ({
    _id: p._id, title: p.title, category: p.category, content: p.content, questionRange: p.questionRange,
    questionGroups: mapPassageGroups(p.questionGroups, safeQ),
    questions: (p.questions || []).map(safeQ)
  }));

  return { status: 'ok', attemptId: attempt._id, testName: test.name, passages: safePassages, duration: 3600 };
}

async function submitTest(attemptId, answers, user) {
  const attempt = await TestAttempt.findOne({ _id: attemptId, userId: user._id, status: 'in-progress' });
  if (!attempt) return null;

  const passagesRaw = await Passage.find({ _id: { $in: attempt.passagesUsed } }).lean();
  const idOrder = attempt.passagesUsed.map(id => id.toString());
  const passages = idOrder.map(id => passagesRaw.find(p => p._id.toString() === id)).filter(Boolean);

  let correctCount = 0, wrongCount = 0, skippedCount = 0;
  const gradedAnswers = [];

  for (const passage of passages) {
    const groups = passage.questionGroups?.length
      ? passage.questionGroups
      : [{ interchangeableAnswers: false, questions: passage.questions || [] }];

    const g = gradeGroups(groups, answers);
    gradedAnswers.push(...g.gradedAnswers);
    correctCount += g.correctCount;
    wrongCount += g.wrongCount;
    skippedCount += g.skippedCount;
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

  let bonusApplied = 0;
  if (user.role === 'student') {
    // Accuracy → streak bonus, same tiering as vocab practice: <80% = 0,
    // 80-90% = +1, >=90% = +2, capped at +5/day shared across all activities.
    const accuracy = attempt.totalQuestions > 0 ? correctCount / attempt.totalQuestions : 0;
    const rawBonus = bonusForAccuracy(accuracy);
    bonusApplied = await reserveDailyStreakBonus(user._id, rawBonus);
    user.updateStreak(bonusApplied, { allowSameDayStack: true });
    user.save().catch(() => {});
  }

  return {
    attemptId: attempt._id, bandScore: attempt.bandScore, correctCount, wrongCount, skippedCount,
    totalQuestions: attempt.totalQuestions, duration, bonusApplied, streak: user.learningStreak,
  };
}

async function getAttemptReview(attemptId, userId) {
  const attempt = await TestAttempt.findOne({ _id: attemptId, userId, status: 'completed' }).populate('testId', 'name testNumber');
  if (!attempt) return null;

  const passagesRaw = await Passage.find({ _id: { $in: attempt.passagesUsed } }).lean();
  const idOrder = attempt.passagesUsed.map(id => id.toString());
  const passages = idOrder.map(id => passagesRaw.find(p => p._id.toString() === id)).filter(Boolean);

  const answerMap = {};
  attempt.answers.forEach(a => { answerMap[a.questionNumber] = a; });

  const passagesWithResult = passages.map(p => ({
    _id: p._id, title: p.title, category: p.category, content: p.content, questionRange: p.questionRange,
    questionGroups: mapPassageGroups(p.questionGroups, q => reviewQ(q, answerMap)),
    questions: (p.questions || []).map(q => reviewQ(q, answerMap))
  }));

  return {
    _id: attempt._id, testName: attempt.testId?.name || '', bandScore: attempt.bandScore,
    correctCount: attempt.correctCount, wrongCount: attempt.wrongCount, skippedCount: attempt.skippedCount,
    totalQuestions: attempt.totalQuestions, duration: attempt.duration, endTime: attempt.endTime,
    passages: passagesWithResult
  };
}

async function getHistory(userId) {
  return TestAttempt.find({ userId, status: 'completed' })
    .populate('testId', 'name testNumber')
    .sort({ endTime: -1 })
    .limit(50)
    .select('-answers -passagesUsed');
}

async function listPracticePassages(category, userId) {
  const filter = category === 'actual-test' ? { isActualTest: true, isActive: true } : { category, isActive: true };
  const passages = await Passage.find(filter)
    .select('_id title category isActualTest questionRange questionGroups questions')
    .lean();
  const safePassages = passages.map(p => ({
    _id: p._id, title: p.title, category: p.category, questionRange: p.questionRange,
    questionCount: (p.questionGroups || []).reduce((s, g) => s + (g.questions?.length || 0), 0) || (p.questions?.length || 0),
    questionGroups: (p.questionGroups || []).map(g => ({
      groupType: g.groupType,
      questions: (g.questions || []).map(q => ({ questionNumber: q.questionNumber, type: q.type }))
    }))
  }));

  const passageIds = safePassages.map(p => p._id);
  const attemptStats = await ReadingPracticeAttempt.aggregate([
    { $match: { userId, passageId: { $in: passageIds } } },
    { $sort: { submittedAt: 1 } },
    { $group: { _id: '$passageId', count: { $sum: 1 }, lastScore: { $last: '$correctCount' }, lastTotal: { $last: '$totalQuestions' } } }
  ]);
  const doneMap = {};
  attemptStats.forEach(a => { doneMap[a._id.toString()] = { count: a.count, lastScore: a.lastScore, lastTotal: a.lastTotal }; });

  return { passages: safePassages, doneMap };
}

async function getPracticePassageById(id) {
  return Passage.findOne({ _id: id, isActive: true }).lean();
}

async function savePractice(body, userId) {
  const { passageId, passageTitle, category, answers, timeTaken } = body;

  // Re-grade server-side against the real passage instead of trusting
  // client-supplied isCorrect/correctCount/wrongCount/skippedCount
  // (security audit finding — these feed practice-history stats a
  // teacher may review). This is the "retry practice" flow, where the
  // student already sees correct answers/explanations mid-session, so
  // re-grading here reveals nothing new — it only stops inflated
  // self-reported results. Falls back to trusting the client only if the
  // passage can't be found (shouldn't happen with a real passageId).
  const passage = passageId ? await Passage.findById(passageId).lean() : null;
  let finalAnswers = answers, correctCount = body.correctCount || 0,
      wrongCount = body.wrongCount || 0, skippedCount = body.skippedCount || 0;

  if (passage) {
    const groups = passage.questionGroups?.length
      ? passage.questionGroups
      : [{ interchangeableAnswers: false, questions: passage.questions || [] }];
    const answersMap = {};
    (answers || []).forEach(a => { answersMap[a.questionNumber] = a.userAnswer || ''; });
    const g = gradeGroups(groups, answersMap);
    finalAnswers = g.gradedAnswers;
    correctCount = g.correctCount;
    wrongCount = g.wrongCount;
    skippedCount = g.skippedCount;
  }

  const attempt = await ReadingPracticeAttempt.create({
    userId, passageId, passageTitle: passageTitle || '', category: category || '',
    answers: finalAnswers, totalQuestions: finalAnswers.length, correctCount,
    wrongCount, skippedCount, timeTaken: timeTaken || 0,
    submittedAt: new Date()
  });
  return attempt._id;
}

async function getPracticeHistory(userId) {
  return ReadingPracticeAttempt.find({ userId }).select('-answers').sort({ submittedAt: -1 }).limit(50).lean();
}

async function getPracticeHistoryDetail(attemptId, userId) {
  const attempt = await ReadingPracticeAttempt.findOne({ _id: attemptId, userId }).lean();
  if (!attempt) return null;
  const passage = await Passage.findById(attempt.passageId).lean();
  return { attempt, passage };
}

async function getRandomPracticePassage(category) {
  const arr = await Passage.aggregate([{ $match: { category, isActive: true } }, { $sample: { size: 1 } }]);
  return arr[0] || null;
}

module.exports = {
  listTestsForUser, startTest, submitTest, getAttemptReview, getHistory,
  listPracticePassages, getPracticePassageById, savePractice,
  getPracticeHistory, getPracticeHistoryDetail, getRandomPracticePassage,
};
