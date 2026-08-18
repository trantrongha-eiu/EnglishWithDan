'use strict';

// Extracted from routes/reading.js, verbatim logic. gradeOne()/the pool-
// matching block here is NOT unified with listeningService's grading —
// this file has its own TFNG-exclusion rule and JSON-array-comparison
// shape that differs from listening's, and the review flagged the two as
// independently implemented; only proven-identical logic gets merged
// across files (see listeningService.js's own comment on this).
const mongoose = require('mongoose');
const Passage = require('../models/Passage');
const ReadingTest = require('../models/ReadingTest');
const TestAttempt = require('../models/TestAttempt');
const ReadingPracticeAttempt = require('../models/ReadingPracticeAttempt');
const { bonusForAccuracy, reserveDailyStreakBonus } = require('./streakBonusService');
const { bandScoreTable } = require('../utils/bandScore');

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

// "Choose TWO/THREE letters A-G" clusters: the frontend writes the SAME
// selected-letters JSON array (e.g. '["A","D"]') to every question number
// in the cluster (toggleMultiAnswer() in reading-v2.js), while each
// individual question's own correctAnswer is a single letter — a question
// is correct if the student's one shared selection includes THAT
// question's letter (naturally gives partial credit per question, matching
// how IELTS scores these).
function gradeMultiAnswerGroup(rawUser, rawCorrect) {
  try {
    const userArr = JSON.parse(rawUser || '[]').map(s => String(s).toUpperCase().trim());
    return userArr.includes((rawCorrect || '').toUpperCase().trim());
  } catch { return false; }
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
    // Admins toggle interchangeableAnswers ("Hoán đổi thứ tự") ON for
    // multi-answer-group clusters too (that's literally what the admin
    // UI's checkbox label means), but the pool-matching branch below
    // compares a whole JSON-array userAnswer against single-letter pool
    // entries via indexOf — never matches. Route these to
    // gradeMultiAnswerGroup() instead, same as the TFNG exclusion just
    // above (a real question type needing its own dedicated match logic,
    // not shared-pool matching).
    const isMultiAnswerGroup = qs.some(q => q.type === 'multi-answer-group');

    if (group.interchangeableAnswers && qs.length > 0 && !isTFNG && !isMultiAnswerGroup) {
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
        const isCorrect = q.type === 'multi-answer-group'
          ? gradeMultiAnswerGroup(rawUser, rawCorrect)
          : gradeOne(rawUser, rawCorrect);
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
  // isFixed tells the frontend whether to show the "câu hỏi ngẫu nhiên mỗi
  // lần" disclaimer — only true for the random-sample test(s); a fixed
  // test always serves the same 3 passages (see startTest()).
  return tests.map(t => ({ ...t, isFixed: (t.passageIds || []).length === 3, lastAttempt: attemptMap[t._id.toString()] || null }));
}

async function startTest(testId, userId) {
  const test = await ReadingTest.findById(testId);
  if (!test) return { status: 'not_found' };

  const safeFields = '-questionGroups.questions.correctAnswer -questionGroups.questions.explanation -questions.correctAnswer -questions.explanation';
  const safeProject = { $project: {
    'questionGroups.questions.correctAnswer': 0,
    'questionGroups.questions.explanation': 0,
    'questions.correctAnswer': 0,
    'questions.explanation': 0,
  } };

  let passages;
  if (test.passageIds && test.passageIds.length === 3) {
    // Fixed test: always the same 3 passages, in the passage1/2/3 order
    // they were assigned at creation time — not $sample.
    const raw = await Passage.find({ _id: { $in: test.passageIds }, isActive: true }).select(safeFields).lean();
    const byId = new Map(raw.map(p => [p._id.toString(), p]));
    passages = test.passageIds.map(id => byId.get(id.toString())).filter(Boolean);
    if (passages.length !== 3) return { status: 'insufficient_data' };
  } else {
    const [p1arr, p2arr, p3arr] = await Promise.all([
      Passage.aggregate([{ $match: { category: 'passage1', isActive: true } }, { $sample: { size: 1 } }, safeProject]),
      Passage.aggregate([{ $match: { category: 'passage2', isActive: true } }, { $sample: { size: 1 } }, safeProject]),
      Passage.aggregate([{ $match: { category: 'passage3', isActive: true } }, { $sample: { size: 1 } }, safeProject])
    ]);
    if (!p1arr[0] || !p2arr[0] || !p3arr[0]) return { status: 'insufficient_data' };
    passages = [p1arr[0], p2arr[0], p3arr[0]];
  }

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
  // Atomically claim this attempt (status: 'in-progress' -> 'completed')
  // before doing any grading work, instead of a plain findOne() followed
  // later by attempt.save() — the read-then-write gap let two concurrent
  // submit calls (a double-click, or a client-side timeout retry racing a
  // slow-but-successful first request) both pass the read, both grade
  // independently, and both save with last-write-wins, with no protection
  // against a duplicate-processed submission. {new: false} returns the
  // PRE-claim snapshot (passagesUsed/startTime, needed below) while the
  // status flip itself has already atomically happened — a racing second
  // call's own claim attempt will find status no longer 'in-progress' and
  // get null back. Mirrors listeningService.js's equivalent fix.
  const attempt = await TestAttempt.findOneAndUpdate(
    { _id: attemptId, userId: user._id, status: 'in-progress' },
    { status: 'completed' },
    { new: false }
  );
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
  const totalQuestions = gradedAnswers.length;
  const bandScore = bandScoreTable('reading', correctCount);

  // A plain findByIdAndUpdate rather than mutating+saving the `attempt`
  // instance above — that instance is the PRE-claim snapshot returned by
  // {new: false} (status still reads 'in-progress' in memory even though
  // the DB row was already atomically flipped to 'completed'); writing
  // through it directly risks Mongoose version-check friction against the
  // update that already happened. This second write only fills in the
  // grading fields, which is safe unconditionally now — the atomic claim
  // above already guarantees only one caller ever reaches this point.
  await TestAttempt.findByIdAndUpdate(attempt._id, {
    answers: gradedAnswers, correctCount, wrongCount, skippedCount,
    totalQuestions, bandScore, endTime, duration,
  });

  let bonusApplied = 0;
  if (user.role === 'student') {
    // Accuracy → streak bonus, same tiering as vocab practice: <80% = 0,
    // 80-90% = +1, >=90% = +2, capped at +5/day shared across all activities.
    const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;
    const rawBonus = bonusForAccuracy(accuracy);
    bonusApplied = await reserveDailyStreakBonus(user._id, rawBonus);
    user.updateStreak(bonusApplied, { allowSameDayStack: true });
    user.save().catch(() => {});
  }

  return {
    attemptId: attempt._id, bandScore, correctCount, wrongCount, skippedCount,
    totalQuestions, duration, bonusApplied, streak: user.learningStreak,
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
  // Same field-stripping as startTest()'s safeFields — this is the
  // pre-submission fetch (starting or resuming an in-progress practice
  // attempt, see reading-v2.js's startPractice()/resumePractice()), never
  // the post-submission review. Without this, the raw document (every
  // question's correctAnswer + explanation, both `required` fields) was
  // sent straight to the client before the student had answered anything
  // — visible in a DevTools Network tab or by just replaying the request.
  const safeFields = '-questionGroups.questions.correctAnswer -questionGroups.questions.explanation -questions.correctAnswer -questions.explanation';
  return Passage.findOne({ _id: id, isActive: true }).select(safeFields).lean();
}

// Reveals a practice passage's answer key (correctAnswer + explanation per
// questionNumber) — called only at the moment the student submits their
// practice attempt (reading-v2.js's _doSubmitRetry()), never on opening the
// passage. getPracticePassageById() above deliberately withholds these same
// fields; the frontend's own instant local grading (no server round-trip
// needed to show a score/explanation) still works exactly as before, it
// just fetches the key at submit-time instead of already having it in hand
// from the moment practice started — closing the "read the Network tab
// before answering" gap without changing the review UX at all.
async function getPassageAnswerKey(id) {
  const passage = await Passage.findOne({ _id: id, isActive: true })
    .select('questionGroups.questions.questionNumber questionGroups.questions.correctAnswer questionGroups.questions.explanation questions.questionNumber questions.correctAnswer questions.explanation')
    .lean();
  if (!passage) return null;
  const answerKey = {};
  (passage.questionGroups || []).forEach(g => (g.questions || []).forEach(q => {
    answerKey[q.questionNumber] = { correctAnswer: q.correctAnswer, explanation: q.explanation || '' };
  }));
  (passage.questions || []).forEach(q => {
    answerKey[q.questionNumber] = { correctAnswer: q.correctAnswer, explanation: q.explanation || '' };
  });
  return answerKey;
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

// ── Admin – Attempts history / stats ─────────────────────────────────────
// Mirrors listeningService's listAdminAttempts/getAdminAttemptsStats — the
// generic /admin/history and /admin/recent-attempts (routes/admin/stats.js)
// already surface individual Reading attempts, but neither does per-test
// aggregation (attempt count/avg band per bộ đề) or a top-students
// leaderboard, which is what a dedicated Reading analytics page needs.
async function listAdminAttempts({ testId, userId, page = 1, limit = 50 }) {
  const filter = { status: 'completed' };
  if (testId) filter.testId = testId;
  if (userId) filter.userId = userId;
  const [attempts, total] = await Promise.all([
    TestAttempt.find(filter)
      .populate('userId', 'firstName lastName username email')
      .populate('testId', 'name testNumber')
      .sort({ endTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-answers -passagesUsed'),
    TestAttempt.countDocuments(filter)
  ]);
  return { attempts, total };
}

async function getAdminAttemptsStats(testId) {
  const match = { status: 'completed', ...(testId ? { testId: new mongoose.Types.ObjectId(testId) } : {}) };
  const [overview, byTest, topStudents] = await Promise.all([
    TestAttempt.aggregate([
      { $match: match },
      { $group: { _id: null, totalAttempts: { $sum: 1 }, avgBand: { $avg: '$bandScore' }, avgCorrect: { $avg: '$correctCount' }, maxBand: { $max: '$bandScore' }, minBand: { $min: '$bandScore' } } }
    ]),
    TestAttempt.aggregate([
      { $match: match },
      { $group: { _id: '$testId', totalAttempts: { $sum: 1 }, avgBand: { $avg: '$bandScore' }, avgCorrect: { $avg: '$correctCount' } } },
      { $sort: { totalAttempts: -1 } },
      { $limit: 20 },
      { $lookup: { from: 'readingtests', localField: '_id', foreignField: '_id', as: 'test' } },
      { $unwind: { path: '$test', preserveNullAndEmptyArrays: true } },
      { $project: { totalAttempts: 1, avgBand: 1, avgCorrect: 1, testName: { $ifNull: ['$test.name', 'Đã xóa'] } } }
    ]),
    TestAttempt.aggregate([
      { $match: match },
      { $group: { _id: '$userId', bestBand: { $max: '$bandScore' }, avgBand: { $avg: '$bandScore' }, attempts: { $sum: 1 } } },
      { $sort: { bestBand: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { bestBand: 1, avgBand: 1, attempts: 1, 'user.firstName': 1, 'user.lastName': 1, 'user.username': 1, 'user.email': 1 } }
    ])
  ]);
  return {
    overview: overview[0] || { totalAttempts: 0, avgBand: 0, avgCorrect: 0, maxBand: 0, minBand: 0 },
    byTest,
    topStudents
  };
}

module.exports = {
  listTestsForUser, startTest, submitTest, getAttemptReview, getHistory,
  listPracticePassages, getPracticePassageById, getPassageAnswerKey, savePractice,
  getPracticeHistory, getPracticeHistoryDetail, getRandomPracticePassage,
  listAdminAttempts, getAdminAttemptsStats,
};
