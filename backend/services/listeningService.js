'use strict';

// Extracted from routes/listening.js. The grading logic used by
// /tests/:id/submit and /practice/save was independently implemented
// twice with different control-flow shape but was verified (via a
// fixture-based equivalence test across fill-blank/multi-answer-group/
// checkbox/interchangeable-pool cases) to produce identical output for
// identical input, so it was safe to unify into gradeQuestionGroups()
// below — unlike task1/task2/writingPractice's normalize(), which
// genuinely differs and was left un-merged.
const mongoose = require('mongoose');
const cloudinaryService = require('./cloudinaryService');
const { NotFoundError } = require('../errors/AppError');
const ListeningTest = require('../models/ListeningTest');
const ListeningAttempt = require('../models/ListeningAttempt');
const ListeningSection = require('../models/ListeningSection');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');
const { bonusForAccuracy, reserveDailyStreakBonus } = require('./streakBonusService');
const { bandScoreTable } = require('../utils/bandScore');

function flattenQuestions(sections) {
  return sections.flatMap(s => s.questionGroups.flatMap(g => g.questions));
}

// Kept as a thin wrapper (rather than calling bandScoreTable directly at the
// call site) so existing callers/tests referencing listeningService.calcBandScore
// keep working — this used to carry its own copy-pasted conversion ladder,
// which had drifted out of sync with utils/bandScore.js's table (the one
// ListeningAttempt's own calculateBandScore() method uses). Delegating here
// removes that second, divergence-prone copy.
function calcBandScore(correct) {
  return bandScoreTable('listening', correct);
}

// getUserAnswer(questionNumber) -> trimmed string ('' if unanswered).
// Returns { correct, wrong, skipped, reviewed } where reviewed items carry
// { questionNumber, userAnswer, correctAnswer, isCorrect } plus whatever
// extra fields the caller merges in via extraFields(q).
function gradeQuestionGroups(questionGroups, getUserAnswer, extraFields = () => ({})) {
  let correct = 0, wrong = 0, skipped = 0;
  const reviewed = [];

  for (const group of questionGroups) {
    const qs = group.questions || [];
    // TFNG/yes-no-ng never uses pool matching — each question has its own
    // fixed answer (this guard existed once already, in the pre-refactor
    // routes/listening.js, and was dropped when this shared function was
    // extracted — a real regression, not a fresh bug). Same for
    // multi-answer-group ("Choose TWO/THREE letters"): admins toggle
    // interchangeableAnswers ON for these clusters too (that's what the
    // admin UI's "Hoán đổi thứ tự" checkbox label means), but pool-matching
    // compares a whole JSON-array userAnswer against single-letter pool
    // entries via indexOf — never matches. Both route to the dedicated
    // per-type checks in the else branch below instead.
    const isTFNG = qs.some(q => ['true-false-ng', 'yes-no-ng'].includes(q.type));
    const isMultiAnswerGroup = qs.some(q => q.type === 'multi-answer-group');

    if (group.interchangeableAnswers && qs.length > 0 && !isTFNG && !isMultiAnswerGroup) {
      const remainingPool = qs.map(q => (q.correctAnswer || '').trim().toLowerCase());
      for (const q of qs) {
        const num = q.questionNumber;
        const ua = getUserAnswer(num);
        const poolIdx = ua ? remainingPool.indexOf(ua.toLowerCase()) : -1;
        const isCorrect = poolIdx !== -1;
        if (isCorrect) remainingPool.splice(poolIdx, 1);
        if (!ua) skipped++;
        else if (isCorrect) correct++;
        else wrong++;
        reviewed.push({ questionNumber: num, userAnswer: ua, correctAnswer: (q.correctAnswer || '').trim(), isCorrect, ...extraFields(q) });
      }
    } else {
      for (const q of qs) {
        const num = q.questionNumber;
        const ua = getUserAnswer(num);
        const ca = (q.correctAnswer || '').trim();
        let isCorrect = false;
        if (q.type === 'multi-answer-group') {
          try {
            const uaArr = JSON.parse(ua || '[]').map(x => x.toUpperCase().trim());
            isCorrect = uaArr.includes(ca.toUpperCase().trim());
          } catch { isCorrect = false; }
        } else if (q.type === 'checkbox') {
          try {
            const uaArr = JSON.parse(ua || '[]').map(x => x.toLowerCase().trim()).sort();
            const caArr = JSON.parse(ca || '[]').map(x => x.toLowerCase().trim()).sort();
            isCorrect = JSON.stringify(uaArr) === JSON.stringify(caArr);
          } catch { isCorrect = false; }
        } else {
          const caVariants = ca.split('/').map(v => v.trim().toLowerCase()).filter(Boolean);
          isCorrect = caVariants.includes(ua.toLowerCase());
        }
        if (!ua) skipped++;
        else if (isCorrect) correct++;
        else wrong++;
        reviewed.push({ questionNumber: num, userAnswer: ua, correctAnswer: ca, isCorrect, ...extraFields(q) });
      }
    }
  }

  return { correct, wrong, skipped, reviewed };
}

// Shared by /tests/:id/submit and /history/:attemptId — both built the
// exact same section→group→question review shape from a reviewMap keyed
// by questionNumber.
function buildReviewSections(sections, reviewMap) {
  return sections.map(s => ({
    partNumber: s.partNumber,
    title: s.title,
    description: s.description,
    questionRange: s.questionRange,
    transcript: s.transcript || '',
    questionGroups: s.questionGroups.map(g => ({
      groupType: g.groupType,
      groupTitle: g.groupTitle,
      instruction: g.instruction,
      tableConfig: g.tableConfig,
      noteConfig: g.noteConfig,
      bulletConfig: g.bulletConfig,
      summaryConfig: g.summaryConfig,
      matchingOptions: g.matchingOptions,
      matchingOptionsTitle: g.matchingOptionsTitle,
      matchingReuseAllowed: g.matchingReuseAllowed,
      interchangeableAnswers: g.interchangeableAnswers,
      endingsConfig: g.endingsConfig,
      imageUrl: g.imageUrl,
      dragDropConfig: g.dragDropConfig,
      questions: g.questions.map(q => reviewMap[q.questionNumber] || { questionNumber: q.questionNumber })
    }))
  }));
}

// ── Admin – CRUD Tests ──────────────────────────────────────────────────
async function listAdminTests() {
  const tests = await ListeningTest.find()
    .select('name testNumber seriesName audioUrl audioDuration isActive sections createdAt')
    .sort({ testNumber: -1 });
  return tests.map(t => ({
    ...t.toObject(),
    totalQuestions: flattenQuestions(t.sections).length,
    totalParts: t.sections.length
  }));
}

// Illustrative AppError adoption: throws instead of returning null, caught
// by catchAsync in the controller (which already honors err.statusCode) —
// produces the exact same 404 + message the manual null-check used to.
async function getAdminTest(id) {
  const test = await ListeningTest.findById(id);
  if (!test) throw new NotFoundError('Không tìm thấy');
  return test;
}

async function createAdminTest(body) {
  const test = new ListeningTest(body);
  await test.save();
  return test;
}

async function updateAdminTest(id, body) {
  return ListeningTest.findByIdAndUpdate(id, body, { new: true, runValidators: true });
}

async function hideAdminTest(id) {
  await ListeningTest.findByIdAndUpdate(id, { isActive: false });
}

async function deleteAdminTestPermanent(id) {
  const test = await ListeningTest.findByIdAndDelete(id);
  if (!test) throw new NotFoundError('Không tìm thấy đề nghe');
}

// ── Admin – Uploads ──────────────────────────────────────────────────────
async function uploadTestAudio(id, file) {
  const uploadResult = await cloudinaryService.uploadBufferStream(file.buffer, {
    resource_type: 'video',
    folder: 'listening',
    public_id: `listening_${id}_${Date.now()}`,
    overwrite: true
  });
  const test = await ListeningTest.findByIdAndUpdate(id, {
    audioUrl: uploadResult.secure_url,
    audioFileName: file.originalname,
    audioDuration: Math.round(uploadResult.duration || 0)
  }, { new: true });
  return { audioUrl: test.audioUrl, audioDuration: test.audioDuration };
}

async function uploadStandaloneAudio(file) {
  const uploadResult = await cloudinaryService.uploadBufferStream(file.buffer, {
    resource_type: 'video', folder: 'listening', public_id: `listening_tmp_${Date.now()}`
  });
  return {
    audioUrl: uploadResult.secure_url,
    audioDuration: Math.round(uploadResult.duration || 0),
    originalName: file.originalname,
  };
}

// Validation (missing / not-a-data-URI) is left to the controller, which
// needs to return two distinct 400 messages for those two cases — this
// only performs the upload itself.
async function uploadMapImage(imageBase64) {
  const result = await cloudinaryService.uploadImage(imageBase64, { folder: 'listening-maps' });
  return result.secure_url;
}

async function uploadSectionAudio(id, file) {
  const result = await cloudinaryService.uploadBufferStream(file.buffer, { resource_type: 'video', folder: 'listening-sections', use_filename: true });
  const s = await ListeningSection.findByIdAndUpdate(id, {
    audioUrl: result.secure_url,
    audioFileName: file.originalname,
    audioDuration: Math.round(result.duration || 0)
  }, { new: true });
  return { audioUrl: result.secure_url, duration: Math.round(result.duration || 0), section: s };
}

// ── Admin – Transcript ───────────────────────────────────────────────────
async function updateTranscript(id, sectionTranscripts) {
  const test = await ListeningTest.findById(id);
  if (!test) return null;
  sectionTranscripts.forEach(({ partNumber, transcript }) => {
    const section = test.sections.find(s => s.partNumber === partNumber);
    if (section) section.transcript = transcript || '';
  });
  await test.save();
  return test;
}

// ── Admin – Attempts history / stats ─────────────────────────────────────
// status: 'completed' matches readingService.js's equivalent filters —
// startTest() persists an 'in-progress' row the moment a student opens a
// test (so an abandoned session leaves a record instead of vanishing, see
// the test above this one), but every abandoned/never-submitted session
// (bandScore 0, correctCount 0) was being counted here too, dragging down
// avgBand/avgCorrect and inflating totalAttempts/the admin attempts list
// with sessions nobody ever actually finished.
async function listAdminAttempts({ testId, userId, page = 1, limit = 50 }) {
  const filter = { status: 'completed' };
  if (testId) filter.testId = testId;
  if (userId) filter.userId = userId;
  const [attempts, total] = await Promise.all([
    ListeningAttempt.find(filter)
      .populate('userId', 'firstName lastName username email')
      .populate('testId', 'name testNumber')
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    ListeningAttempt.countDocuments(filter)
  ]);
  return { attempts, total };
}

async function getAdminAttemptsStats(testId) {
  const match = { status: 'completed', ...(testId ? { testId: new mongoose.Types.ObjectId(testId) } : {}) };
  const [overview, byTest, topStudents] = await Promise.all([
    ListeningAttempt.aggregate([
      { $match: match },
      { $group: { _id: null, totalAttempts: { $sum: 1 }, avgBand: { $avg: '$bandScore' }, avgCorrect: { $avg: '$correctCount' }, maxBand: { $max: '$bandScore' }, minBand: { $min: '$bandScore' } } }
    ]),
    ListeningAttempt.aggregate([
      { $match: match },
      { $group: { _id: '$testId', testName: { $first: '$testName' }, totalAttempts: { $sum: 1 }, avgBand: { $avg: '$bandScore' }, avgCorrect: { $avg: '$correctCount' } } },
      { $sort: { totalAttempts: -1 } },
      { $limit: 20 }
    ]),
    ListeningAttempt.aggregate([
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

// ── Practice sections (student-facing list + admin CRUD) ────────────────
async function listPracticeSections(query, userId) {
  const isActualTest = query.actualTest === 'true';
  let filter, sortBy;
  if (isActualTest) {
    filter = { isActualTest: true, isActive: true };
    sortBy = { createdAt: -1 };
  } else {
    const part = parseInt(query.part);
    if (![1, 2, 3, 4].includes(part)) {
      const err = new Error('Part không hợp lệ (1–4)');
      err.status = 400;
      throw err;
    }
    filter = { partNumber: part, isActive: true };
    sortBy = { createdAt: -1 };
  }
  const sections = await ListeningSection.find(filter)
    .select('_id partNumber title description audioDuration isActualTest questionRange questionGroups')
    .sort(sortBy)
    .lean();
  const safe = sections.map(s => ({
    _id: s._id,
    partNumber: s.partNumber,
    title: s.title,
    description: s.description,
    audioDuration: s.audioDuration,
    questionRange: s.questionRange,
    questionCount: (s.questionGroups || []).reduce((sum, g) => sum + (g.questions?.length || 0), 0),
    questionGroups: (s.questionGroups || []).map(g => ({
      groupType: g.groupType,
      questions: (g.questions || []).map(q => ({ questionNumber: q.questionNumber, type: q.type }))
    }))
  }));
  const sectionIds = sections.map(s => s._id);
  const attemptStats = await ListeningPracticeAttempt.aggregate([
    { $match: { userId, sectionId: { $in: sectionIds } } },
    { $sort: { submittedAt: 1 } },
    { $group: { _id: '$sectionId', count: { $sum: 1 }, lastScore: { $last: '$correctCount' }, lastTotal: { $last: '$totalQuestions' } } }
  ]);
  const doneMap = {};
  attemptStats.forEach(a => { doneMap[a._id.toString()] = { count: a.count, lastScore: a.lastScore, lastTotal: a.lastTotal }; });
  return { sections: safe, doneMap };
}

async function getPracticeSectionById(id) {
  // Same intent as startTest()'s manual field mapping above ("correctAnswer
  // intentionally omitted") — this is the pre-submission fetch (starting or
  // resuming an in-progress practice attempt), never the post-submission
  // review. Without this, the raw document (every question's correctAnswer
  // + explanation, both present on LSQuestionSchema) was sent straight to
  // the client before the student had answered anything — visible in a
  // DevTools Network tab or by just replaying the request. transcript is
  // deliberately still included: the review screen (loadLTPracticeReview)
  // reads it off this same pre-fetched object post-submission rather than
  // re-fetching, so stripping it here would break that display.
  return ListeningSection.findOne({ _id: id, isActive: true })
    .select('-questionGroups.questions.correctAnswer -questionGroups.questions.explanation')
    .lean();
}

// ── Dictation practice (sentence-by-sentence chép chính tả) ─────────────
// Cuts across part/actualTest the way listPracticeSections() doesn't —
// dictation availability tracks scripts/bulkAlignListeningDictation.js's
// rollout, not the part-1..4 practice catalogue, so this is deliberately a
// separate, simpler listing. getPracticeSectionById() above already returns
// the full document (including dictationSentences + transcript), so
// fetching one section for practice reuses that existing endpoint rather
// than duplicating it here.
async function listDictationSections() {
  const sections = await ListeningSection.find({
    isActive: true,
    dictationSentences: { $exists: true, $not: { $size: 0 } },
  })
    .select('_id title partNumber audioDuration isActualTest dictationSentences')
    .sort({ partNumber: 1, title: 1 })
    .lean();
  return sections.map(s => ({
    _id: s._id,
    title: s.title,
    partNumber: s.partNumber,
    audioDuration: s.audioDuration,
    isActualTest: s.isActualTest,
    sentenceCount: s.dictationSentences.length,
  }));
}

async function listAdminSections() {
  return ListeningSection.find().sort({ partNumber: 1, createdAt: -1 });
}

async function getAdminSection(id) {
  return ListeningSection.findById(id);
}

async function createAdminSection(body) {
  const s = new ListeningSection(body);
  await s.save();
  return s;
}

async function updateAdminSection(id, body) {
  return ListeningSection.findByIdAndUpdate(id, body, { new: true, runValidators: true });
}

async function hideAdminSection(id) {
  await ListeningSection.findByIdAndUpdate(id, { isActive: false });
}

async function deleteAdminSectionPermanent(id) {
  const section = await ListeningSection.findByIdAndDelete(id);
  if (!section) throw new NotFoundError('Không tìm thấy section');
}

// ── Admin – Assemble test from 4 sections ────────────────────────────────
async function assembleTest({ name, seriesName, testNumber, sectionIds }) {
  const idMap = sectionIds || {};
  const parts = [1, 2, 3, 4];

  // Batch-fetch all requested sections in one query instead of one findById
  // per part (up to 4 sequential round-trips before).
  const requestedIds = parts.map(part => idMap[String(part)]).filter(Boolean);
  const sections = requestedIds.length
    ? await ListeningSection.find({ _id: { $in: requestedIds } }).lean()
    : [];
  const sectionMap = {};
  sections.forEach(s => { sectionMap[s._id.toString()] = s; });

  const fetched = {};
  for (const part of parts) {
    const sid = idMap[String(part)];
    if (sid) {
      const s = sectionMap[String(sid)];
      if (!s) {
        const err = new Error(`Không tìm thấy section Part ${part}`);
        err.status = 404;
        throw err;
      }
      fetched[part] = s;
    }
  }
  if (Object.keys(fetched).length === 0) {
    const err = new Error('Chọn ít nhất 1 section');
    err.status = 400;
    throw err;
  }

  const defaultRanges = { 1: { start: 1, end: 10 }, 2: { start: 11, end: 20 }, 3: { start: 21, end: 30 }, 4: { start: 31, end: 40 } };
  const builtSections = parts.map(part => {
    const src = fetched[part];
    if (!src) {
      return {
        partNumber: part, title: `Part ${part}`, description: '', transcript: '',
        questionRange: defaultRanges[part], questionGroups: [],
      };
    }
    return {
      partNumber: src.partNumber,
      title: src.title,
      description: src.description || '',
      transcript: src.transcript || '',
      questionRange: src.questionRange || defaultRanges[part],
      questionGroups: (src.questionGroups || []).map(g => {
        const { _id, ...rest } = g;
        return {
          ...rest,
          questions: (g.questions || []).map(q => {
            const { _id: _qid, ...qRest } = q;
            return qRest;
          }),
        };
      }),
    };
  });

  const test = new ListeningTest({
    name, seriesName: seriesName || '', testNumber: testNumber || 1,
    audioUrl: '', sections: builtSections, isActive: true,
  });
  await test.save();
  return test;
}

// ── Student – test list / start / submit ─────────────────────────────────
async function listStudentTests(userId) {
  const [tests, attempts] = await Promise.all([
    // Sort by name with numeric collation (not testNumber, which is only
    // meaningful within a fixed-size series like "Cam 20" and is otherwise
    // an arbitrary/default value) so "Test 2" sorts before "Test 10" instead
    // of lexicographically, matching what students expect to see.
    ListeningTest.aggregate([
      { $match: { isActive: true } },
      { $sort: { name: 1 } },
      { $addFields: {
        totalParts: { $size: { $ifNull: ['$sections', []] } },
        totalQuestions: {
          $sum: { $map: { input: { $ifNull: ['$sections', []] }, as: 'sec', in: {
            $sum: { $map: { input: { $ifNull: ['$$sec.questionGroups', []] }, as: 'grp', in: { $size: { $ifNull: ['$$grp.questions', []] } } } }
          } } }
        }
      } },
      { $project: { name: 1, testNumber: 1, seriesName: 1, audioDuration: 1, totalParts: 1, totalQuestions: 1 } }
    ]).collation({ locale: 'en', numericOrdering: true }),
    ListeningAttempt.find({ userId, status: 'completed' })
      .select('testId bandScore correctCount wrongCount skippedCount submittedAt timeTaken').lean()
  ]);

  const attemptMap = {};
  attempts.forEach(a => {
    const key = a.testId.toString();
    if (!attemptMap[key] || attemptMap[key].submittedAt < a.submittedAt) attemptMap[key] = a;
  });

  return tests.map(t => ({
    _id: t._id, name: t.name, testNumber: t.testNumber, seriesName: t.seriesName,
    audioDuration: t.audioDuration, totalParts: t.totalParts, totalQuestions: t.totalQuestions,
    lastAttempt: attemptMap[t._id.toString()] || null
  }));
}

async function startTest(id, userId) {
  const test = await ListeningTest.findOne({ _id: id, isActive: true });
  if (!test) return null;

  // Persisted immediately (status: 'in-progress') so an abandoned mock test
  // leaves a record instead of vanishing entirely — previously nothing was
  // saved until submitTest() ran, so a student who started and never
  // finished left zero trace anywhere (audit finding). Mirrors Reading's
  // TestAttempt, which has done this from the start.
  const totalQuestions = test.sections.reduce((sum, s) =>
    sum + s.questionGroups.reduce((gs, g) => gs + g.questions.length, 0), 0);
  const attempt = await ListeningAttempt.create({
    userId, testId: test._id, testName: test.name, totalQuestions, startTime: new Date()
  });

  const sections = test.sections.map(s => ({
    partNumber: s.partNumber, title: s.title, description: s.description, questionRange: s.questionRange,
    questionGroups: s.questionGroups.map(g => ({
      _id: g._id, groupType: g.groupType, instruction: g.instruction, tableConfig: g.tableConfig,
      noteConfig: g.noteConfig, bulletConfig: g.bulletConfig, summaryConfig: g.summaryConfig,
      matchingOptions: g.matchingOptions, matchingOptionsTitle: g.matchingOptionsTitle,
      matchingReuseAllowed: g.matchingReuseAllowed, interchangeableAnswers: g.interchangeableAnswers,
      endingsConfig: g.endingsConfig, imageUrl: g.imageUrl, dragDropConfig: g.dragDropConfig, groupTitle: g.groupTitle,
      questions: g.questions.map(q => ({
        _id: q._id, questionNumber: q.questionNumber, type: q.type, questionText: q.questionText,
        options: q.options, checkboxCount: q.checkboxCount, wordBank: q.wordBank, imageUrl: q.imageUrl
        // correctAnswer intentionally omitted
      }))
    }))
  }));
  return { _id: test._id, attemptId: attempt._id, name: test.name, audioUrl: test.audioUrl, audioDuration: test.audioDuration, sections };
}

async function submitTest(id, { answers = {}, startTime: startTimeRaw, attemptId }, user) {
  const test = await ListeningTest.findById(id);
  if (!test) return null;

  const now = new Date();
  // Prefer the server's OWN recorded startTime (set by startTest() when
  // this attempt row was first created) over the client-supplied value —
  // a tampered or stale startTime (e.g. restored from an old localStorage
  // payload) previously corrupted timeTaken/startTime with no server-side
  // check at all. Only falls back to the client value for the legacy path
  // (no attemptId / a genuinely unmatched one), where there's no server
  // record to trust instead.
  let serverStartTime = null;
  if (attemptId) {
    const existing = await ListeningAttempt.findOne({ _id: attemptId, userId: user._id || user.id }).select('startTime').lean();
    if (existing) serverStartTime = existing.startTime;
  }
  const startTime = serverStartTime || (startTimeRaw ? new Date(startTimeRaw) : null);
  const maxSecs = (test.audioDuration || 40) * 60;
  const timeTaken = startTime ? Math.min(Math.max(0, Math.round((now - startTime) / 1000)), maxSecs) : 0;

  const allGroups = test.sections.flatMap(s => s.questionGroups);
  const getUserAnswer = num => answers[num] !== undefined ? String(answers[num]).trim() : '';
  const extraFields = q => ({ explanation: q.explanation, type: q.type, questionText: q.questionText, options: q.options, wordBank: q.wordBank, audioTimestamp: q.audioTimestamp });
  const { correct, wrong, skipped, reviewed } = gradeQuestionGroups(allGroups, getUserAnswer, extraFields);
  const total = flattenQuestions(test.sections).length;
  const bandScore = calcBandScore(correct);

  const fields = {
    userId: user._id || user.id,
    testId: test._id,
    testName: test.name,
    answers: reviewed.map(r => ({ questionNumber: r.questionNumber, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer, isCorrect: r.isCorrect })),
    totalQuestions: total,
    correctCount: correct,
    wrongCount: wrong,
    skippedCount: skipped,
    bandScore,
    startTime: startTime || now,
    submittedAt: now,
    timeTaken,
    status: 'completed'
  };

  // Update the SAME row startTest() created (status: 'in-progress' -> 'completed')
  // instead of inserting a second row — keeps exactly one attempt per
  // session, matching Reading's TestAttempt pattern (readingService.js's
  // submitTest strictly requires an in-progress attemptId and 404s
  // otherwise — no create-fallback at all). Only falls back to a fresh
  // insert when attemptId itself is absent (a legitimately old/pre-
  // migration session with no attemptId concept — startTest() has created
  // one on every call for a while now, so this is a rare legacy path, not
  // the normal case). If attemptId WAS given but doesn't match an
  // in-progress row — already completed (a timeout-retry racing a slow
  // response, see listening.html's submitExam(), or a resubmission with
  // now-revealed answers trying to fabricate a better score) or belongs to
  // someone else — this must NOT silently mint a second completed attempt;
  // reject it instead, same as Reading.
  let attempt = null;
  if (attemptId) {
    attempt = await ListeningAttempt.findOneAndUpdate(
      { _id: attemptId, userId: fields.userId, status: 'in-progress' },
      fields,
      { new: true }
    );
    if (!attempt) return null;
  } else {
    attempt = await ListeningAttempt.create(fields);
  }

  let bonusApplied = 0;
  if (user.role === 'student') {
    // Accuracy → streak bonus, same tiering as vocab practice: <80% = 0,
    // 80-90% = +1, >=90% = +2, capped at +5/day shared across all activities.
    const accuracy = total > 0 ? correct / total : 0;
    const rawBonus = bonusForAccuracy(accuracy);
    bonusApplied = await reserveDailyStreakBonus(user._id, rawBonus);
    user.updateStreak(bonusApplied, { allowSameDayStack: true });
    user.save().catch(() => {});
  }

  const reviewMap = {};
  reviewed.forEach(r => { reviewMap[r.questionNumber] = r; });
  const reviewSections = buildReviewSections(test.sections, reviewMap);

  return {
    attemptId: attempt._id, testName: test.name, totalQuestions: total,
    correctCount: correct, wrongCount: wrong, skippedCount: skipped, bandScore, timeTaken,
    questions: reviewed, sections: reviewSections, audioUrl: test.audioUrl,
    bonusApplied, streak: user.learningStreak,
  };
}

// ── Student – history ─────────────────────────────────────────────────────
async function getHistory(userId) {
  // Excludes 'in-progress' rows now that startTest() persists one before
  // the student has answered anything — matches Reading's getHistory(),
  // which has always filtered to status: 'completed' for the same reason.
  return ListeningAttempt.find({ userId, status: { $ne: 'in-progress' } })
    .select('testName bandScore correctCount wrongCount skippedCount totalQuestions timeTaken submittedAt status testId')
    .populate('testId', 'name testNumber')
    .sort({ submittedAt: -1 })
    .limit(50);
}

async function getHistoryDetail(attemptId, userId) {
  const attempt = await ListeningAttempt.findOne({ _id: attemptId, userId });
  if (!attempt) return { status: 'attempt_not_found' };

  const test = await ListeningTest.findById(attempt.testId);
  if (!test) return { status: 'test_not_found' };

  const reviewMap = {};
  attempt.answers.forEach(a => { reviewMap[a.questionNumber] = a; });

  const allQuestions = flattenQuestions(test.sections);
  const reviewed = allQuestions.map(q => {
    const saved = reviewMap[q.questionNumber] || {};
    return {
      questionNumber: q.questionNumber, type: q.type, questionText: q.questionText, options: q.options,
      wordBank: q.wordBank, audioTimestamp: q.audioTimestamp, explanation: q.explanation,
      userAnswer: saved.userAnswer || '', correctAnswer: saved.correctAnswer || q.correctAnswer, isCorrect: saved.isCorrect || false
    };
  });

  const reviewMap2 = {};
  reviewed.forEach(r => { reviewMap2[r.questionNumber] = r; });
  const reviewSections = buildReviewSections(test.sections, reviewMap2);

  return {
    status: 'ok',
    result: {
      attemptId: attempt._id, testName: attempt.testName, bandScore: attempt.bandScore,
      correctCount: attempt.correctCount, wrongCount: attempt.wrongCount, skippedCount: attempt.skippedCount,
      totalQuestions: attempt.totalQuestions, timeTaken: attempt.timeTaken, submittedAt: attempt.submittedAt,
      questions: reviewed, sections: reviewSections, audioUrl: test.audioUrl
    }
  };
}

// Reveals a practice section's answer key (correctAnswer + explanation per
// questionNumber) — called only at the moment the student submits their
// practice attempt (listening.html's _doSubmitLTPractice()), never on
// opening the section. getPracticeSectionById() above deliberately
// withholds these same fields; the frontend's own instant local grading
// (no server round-trip needed to show a score/explanation) still works
// exactly as before, it just fetches the key at submit-time instead of
// already having it in hand from the moment practice started.
async function getSectionAnswerKey(id) {
  const section = await ListeningSection.findOne({ _id: id, isActive: true })
    .select('questionGroups.questions.questionNumber questionGroups.questions.correctAnswer questionGroups.questions.explanation')
    .lean();
  if (!section) return null;
  const answerKey = {};
  (section.questionGroups || []).forEach(g => (g.questions || []).forEach(q => {
    answerKey[q.questionNumber] = { correctAnswer: q.correctAnswer, explanation: q.explanation || '' };
  }));
  return answerKey;
}

// ── Practice attempts (single-section, no premium gate) ─────────────────
async function savePractice({ sectionId, sectionTitle, partNumber, answers, timeTaken }, userId) {
  const section = await ListeningSection.findById(sectionId).lean();
  if (!section) return null;

  const uaMap = {};
  for (const a of answers) uaMap[a.questionNumber] = (a.userAnswer || '').trim();
  const getUserAnswer = num => uaMap[num] || '';
  const { correct, skipped: _skipped, wrong: _wrong, reviewed } = gradeQuestionGroups(section.questionGroups || [], getUserAnswer);
  const gradedAnswers = reviewed.map(r => ({ questionNumber: r.questionNumber, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer, isCorrect: r.isCorrect }));

  const attempt = await ListeningPracticeAttempt.create({
    userId,
    sectionId,
    sectionTitle: sectionTitle || section.title || '',
    partNumber: partNumber || section.partNumber || 1,
    answers: gradedAnswers,
    totalQuestions: gradedAnswers.length,
    correctCount: correct,
    wrongCount: _wrong,
    skippedCount: _skipped,
    timeTaken: timeTaken || 0,
    submittedAt: new Date()
  });
  return { attemptId: attempt._id, correctCount: correct, totalQuestions: gradedAnswers.length };
}

async function getPracticeHistory(userId) {
  return ListeningPracticeAttempt.find({ userId }).select('-answers').sort({ submittedAt: -1 }).limit(50).lean();
}

async function getPracticeHistoryDetail(attemptId, userId) {
  const attempt = await ListeningPracticeAttempt.findOne({ _id: attemptId, userId }).lean();
  if (!attempt) return null;
  const section = await ListeningSection.findById(attempt.sectionId).lean();
  return { attempt, section };
}

module.exports = {
  flattenQuestions, calcBandScore,
  listAdminTests, getAdminTest, createAdminTest, updateAdminTest, hideAdminTest, deleteAdminTestPermanent,
  uploadTestAudio, uploadStandaloneAudio, uploadMapImage, uploadSectionAudio,
  updateTranscript,
  listAdminAttempts, getAdminAttemptsStats,
  listPracticeSections, getPracticeSectionById, getSectionAnswerKey, listDictationSections,
  listAdminSections, getAdminSection, createAdminSection, updateAdminSection, hideAdminSection, deleteAdminSectionPermanent,
  assembleTest,
  listStudentTests, startTest, submitTest,
  getHistory, getHistoryDetail,
  savePractice, getPracticeHistory, getPracticeHistoryDetail,
};
