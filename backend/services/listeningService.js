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
const mediaStore = require('./mediaStore');
const { NotFoundError } = require('../errors/AppError');
const ListeningTest = require('../models/ListeningTest');
const ListeningAttempt = require('../models/ListeningAttempt');
const ListeningSection = require('../models/ListeningSection');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');
const DictationAttempt = require('../models/DictationAttempt');
const GapFillAttempt = require('../models/GapFillAttempt');
const geminiService = require('./geminiService');
const logger = require('../utils/logger');
const { bonusForAccuracy, reserveDailyStreakBonus } = require('./streakBonusService');
const { bandScoreTable } = require('../utils/bandScore');
const User = require('../models/User');
const { applyStreakActivity, keepStreakAlive, MIN_STREAK_SENTENCES } = require('../utils/streak');
const reviewService = require('./reviewService');
const badgeService = require('./badgeService');
const examSimulationService = require('./examSimulationService');
const { sanitizeHighlights, tooLarge } = require('./attemptHighlightService');
const { REAL_ATTEMPT, COUNTABLE_ATTEMPT } = require('./attemptVisibility');
const { disqualifiedAnswerFilter } = require('./proctorPolicy');
const { toCardThumbnail } = require('../utils/cardThumbnail');
const { normalizeParts, partsFilter, scaledCorrect } = require('../utils/partSelection');
const warmUpUtil = require('../utils/listeningWarmUp');
const { toStudentWarmUp } = warmUpUtil;

// Mongoose `.select()` string that strips a section's answer key
// (correctAnswer + explanation per question). Single source so the
// pre-submission fetch (getPracticeSectionById) and the practice-history
// review can't drift apart — both must withhold the key. (P1
// regression-audit fix: an expired-premium user was re-pulling full answer
// keys via /practice/history/:attemptId.) `transcript` is intentionally
// NOT stripped here — it isn't the answer key and getPracticeSectionById
// already ships it to the review UI.
const PRACTICE_SECTION_SAFE_FIELDS =
  '-questionGroups.questions.correctAnswer -questionGroups.questions.explanation';

function normalizeGapFillAnswer(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Drops `correctAnswer` from each persisted practice answer row
// (PracticeAnswerSchema = { questionNumber, userAnswer, correctAnswer,
// isCorrect }). `isCorrect` stays — the right/wrong flag is fine to show,
// the answer string is what must not leak post-access.
function stripAnswerKeyFromAttempt(attempt) {
  if (attempt && Array.isArray(attempt.answers)) {
    attempt.answers = attempt.answers.map(({ correctAnswer, ...rest }) => rest); // eslint-disable-line no-unused-vars
  }
  return attempt;
}

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
        const isCorrect = matchSingleAnswer(q.type, ua, ca);
        if (!ua) skipped++;
        else if (isCorrect) correct++;
        else wrong++;
        reviewed.push({ questionNumber: num, userAnswer: ua, correctAnswer: ca, isCorrect, ...extraFields(q) });
      }
    }
  }

  return { correct, wrong, skipped, reviewed };
}

// Single-question comparator (fill-blank/multi-answer-group/checkbox/
// default `/`-delimited-variants) — extracted from gradeQuestionGroups()'s
// else-branch (mechanical, behavior-preserving refactor, no behavior
// change). Note: this expects the ORIGINAL submission's format (a JSON-
// encoded array/letter-set for multi-answer-group/checkbox) — the
// mandatory Review System's isolated "Try Again" retry (reviewService.js)
// does NOT reuse this, since a retry is always a single plain value for
// one question, not the whole cluster's original array format.
function matchSingleAnswer(type, rawUser, rawCorrect) {
  const ua = (rawUser || '').trim();
  const ca = (rawCorrect || '').trim();
  if (type === 'multi-answer-group') {
    try {
      const uaArr = JSON.parse(ua || '[]').map(x => x.toUpperCase().trim());
      return uaArr.includes(ca.toUpperCase().trim());
    } catch { return false; }
  }
  if (type === 'checkbox') {
    try {
      const uaArr = JSON.parse(ua || '[]').map(x => x.toLowerCase().trim()).sort();
      const caArr = JSON.parse(ca || '[]').map(x => x.toLowerCase().trim()).sort();
      return JSON.stringify(uaArr) === JSON.stringify(caArr);
    } catch { return false; }
  }
  const caVariants = ca.split('/').map(v => v.trim().toLowerCase()).filter(Boolean);
  return caVariants.includes(ua.toLowerCase());
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
    })),
    // Partial attempt ("Chọn phần làm"): each section plays its own audio.
    ...(s.audioUrl ? { audioUrl: s.audioUrl } : {}),
  }));
}

// A full test's sections → each part's own đề lẻ audio ({ partNumber:
// { audioUrl, audioDuration } }), matched by title + part number — the
// same pairing full tests are assembled from (assembleTest,
// scripts/volListening/rejoin_test_audio.js). Lets a student who picked
// only some sections play just those parts instead of seeking around
// the test's one joined recording.
async function findPartAudios(sections) {
  const keys = (sections || []).map(s => ({ title: s.title, partNumber: s.partNumber }));
  if (!keys.length) return {};
  const lone = await ListeningSection.find({ $or: keys, audioUrl: { $nin: ['', null] } })
    .select('title partNumber audioUrl audioDuration isActive').lean();
  const out = {};
  for (const s of sections) {
    const match = lone.filter(l => l.title === s.title && l.partNumber === s.partNumber)
      .sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0))[0];
    if (match) out[s.partNumber] = { audioUrl: match.audioUrl, audioDuration: match.audioDuration || 0 };
  }
  return out;
}

// sections (plain objects) narrowed to the picked part numbers, each
// carrying its own audio — null when some picked part has no audio.
async function pickSectionsWithAudio(sections, parts) {
  const picked = sections.filter(s => parts.includes(s.partNumber));
  if (picked.length !== parts.length) return null;
  const audios = await findPartAudios(picked);
  if (picked.some(s => !audios[s.partNumber])) return null;
  return picked.map(s => ({ ...s, ...audios[s.partNumber] }));
}

// ── Admin – CRUD Tests ──────────────────────────────────────────────────
async function listAdminTests() {
  const tests = await ListeningTest.find()
    .select('name testNumber seriesName audioUrl audioDuration isActive sections createdAt')
    .sort({ testNumber: -1 })
    .lean();
  // Return the question/part counts, not the whole `sections` tree — the
  // admin list doesn't render it and it's the bulk of the payload.
  return tests.map(({ sections = [], ...rest }) => ({
    ...rest,
    totalQuestions: flattenQuestions(sections).length,
    totalParts: sections.length,
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

// One request for admin "ẩn/hiện tất cả" instead of N parallel PUTs. Filter
// is always scoped by an explicit id list — never call this with an empty
// `ids` (the route guards that).
async function bulkSetTestsActive(ids, isActive) {
  return ListeningTest.updateMany({ _id: { $in: ids } }, { isActive });
}

async function deleteAdminTestPermanent(id) {
  const test = await ListeningTest.findByIdAndDelete(id);
  if (!test) throw new NotFoundError('Không tìm thấy đề nghe');
}

// ── Admin – Uploads ──────────────────────────────────────────────────────
// Audio goes to Cloudflare R2 (services/mediaStore). Returns { url, duration }
// (duration in whole seconds).
const uploadAudio = (file, folder, name) => mediaStore.uploadListeningAudio(file, folder, name);

async function uploadTestAudio(id, file) {
  const { url, duration } = await uploadAudio(file, 'listening', `listening_${id}_${Date.now()}`);
  const test = await ListeningTest.findByIdAndUpdate(id, {
    audioUrl: url,
    audioFileName: file.originalname,
    audioDuration: duration
  }, { new: true });
  return { audioUrl: test.audioUrl, audioDuration: test.audioDuration };
}

async function uploadStandaloneAudio(file) {
  const { url, duration } = await uploadAudio(file, 'listening', `listening_tmp_${Date.now()}`);
  return {
    audioUrl: url,
    audioDuration: duration,
    originalName: file.originalname,
  };
}

// Validation (missing / not-a-data-URI) is left to the controller, which
// needs to return two distinct 400 messages for those two cases — this
// only performs the upload itself.
async function uploadMapImage(imageBase64) {
  return (await mediaStore.uploadImage(imageBase64, 'listening-maps')).url;
}

async function uploadSectionAudio(id, file) {
  const base = String(file.originalname || 'audio').replace(/\.[^.]*$/, '').replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 60);
  const { url, duration } = await uploadAudio(file, 'listening-sections', `${base}_${id}_${Date.now()}`);
  const s = await ListeningSection.findByIdAndUpdate(id, {
    audioUrl: url,
    audioFileName: file.originalname,
    audioDuration: duration
  }, { new: true });
  return { audioUrl: url, duration, section: s };
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
      .limit(Number(limit))
      .select('-sectionsSnapshot -highlights'),
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
    .select('_id partNumber title description audioDuration isActualTest questionRange questionGroups gapFillPublished thumbnailUrl')
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
    })),
    hasGapFill: s.gapFillPublished === true,
    thumbnail: toCardThumbnail(s.thumbnailUrl),
  }));
  const sectionIds = sections.map(s => s._id);
  const attemptStats = await ListeningPracticeAttempt.aggregate([
    { $match: { userId, sectionId: { $in: sectionIds }, ...COUNTABLE_ATTEMPT } },
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
  // warmUp is select:false (its answers are a teacher-only key) — pulled in
  // explicitly here and swapped for the answer-free student copy, and only
  // once an admin has published it (warmUpPublished, like gap-fill).
  const section = await ListeningSection.findOne({ _id: id, isActive: true })
    .select(`${PRACTICE_SECTION_SAFE_FIELDS} +warmUp`)
    .lean();
  if (section) {
    section.warmUp = section.warmUpPublished === true ? toStudentWarmUp(section.warmUp) : null;
    delete section.warmUpPublished;
  }
  return section;
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

// Vietnamese meaning of each dictation sentence, aligned to
// dictationSentences ('' where none could be made). Missing ones are
// translated in ONE Gemini call for the section and stored in dictationVi,
// so every later student gets them straight from the DB. Same in-flight
// dedupe as getGapFillGlossary below: two students opening a fresh section
// together share one call.
const _dictationViInFlight = new Map();
async function getDictationTranslations(id) {
  const section = await ListeningSection.findOne({ _id: id, isActive: true })
    .select('_id dictationSentences dictationVi')
    .lean();
  if (!section || !(section.dictationSentences || []).length) return null;
  const texts = section.dictationSentences.map(s => s.text);
  const known = new Map((section.dictationVi || []).filter(d => d.vi).map(d => [d.text, d.vi]));
  const missing = [...new Set(texts.filter(t => !known.has(t)))];

  if (missing.length) {
    const key = String(section._id);
    if (!_dictationViInFlight.has(key)) {
      _dictationViInFlight.set(key, (async () => {
        const vi = await geminiService.translateDictationSentences(missing);
        const fresh = missing.map((text, i) => ({ text, vi: vi[i] })).filter(d => d.vi);
        if (fresh.length) {
          // Drop any older entry for the same text (e.g. an earlier empty
          // one) and prune meanings for sentences no longer in the section.
          const keep = (section.dictationVi || []).filter(d => d.vi && texts.includes(d.text) && !fresh.some(f => f.text === d.text));
          await ListeningSection.updateOne({ _id: section._id }, { $set: { dictationVi: [...keep, ...fresh] } });
        }
        return fresh;
      })().finally(() => _dictationViInFlight.delete(key)));
    }
    try {
      for (const d of await _dictationViInFlight.get(key)) known.set(d.text, d.vi);
    } catch (err) {
      // AI down/over quota: the drill still works, just without meanings.
      logger.ai('getDictationTranslations: translation failed', { sectionId: key, errorMessage: err.message });
    }
  }
  return texts.map(t => known.get(t) || '');
}

// dictation.html previously never saved anything server-side at all —
// dictCheck() only ever updated local page state, so a student's practice
// never showed up in admin's "Lịch sử làm bài" (student-reported bug). No
// reviewService.createReviewIfNeeded() call here unlike savePractice()
// below — dictation is deliberately exempt from the mandatory-review gate
// (it has its own gate-free content route, GET /listening/dictation/
// section/:id — see routes/listening.js), so it must never create a
// pending review.
async function saveDictationAttempt({ sectionId, sectionTitle, partNumber, answers }, userId) {
  const section = await ListeningSection.findById(sectionId).select('_id title partNumber').lean();
  if (!section) return null;

  const safeAnswers = (answers || []).map(a => ({
    sentenceIndex: Number(a.sentenceIndex),
    isCorrect: a.isCorrect === true,
    matchedWords: Number(a.matchedWords) || 0,
    totalWords: Number(a.totalWords) || 0
  })).filter(a => Number.isInteger(a.sentenceIndex));
  if (!safeAnswers.length) return null;

  const correctCount = safeAnswers.filter(a => a.isCorrect).length;
  const attempt = await DictationAttempt.create({
    userId,
    sectionId,
    sectionTitle: sectionTitle || section.title || '',
    partNumber: partNumber || section.partNumber || 1,
    answers: safeAnswers,
    totalSentences: safeAnswers.length,
    correctCount,
    submittedAt: new Date()
  });
  if (safeAnswers.length >= MIN_STREAK_SENTENCES) await keepStreakAlive(userId);

  return { attemptId: attempt._id, correctCount, totalSentences: safeAnswers.length };
}

// ── Gap-fill practice (full transcript, blanks while listening) ─────────
// Same review-exempt drill shape as Dictation above: its own gate-free
// content route (GET /listening/gapfill/section/:id, no
// requireReviewComplete), its own save route, its own attempt collection —
// never creates a pending review. Only sections an admin has explicitly
// reviewed and published (gapFillPublished) are ever listed/fetched here.
async function listGapFillSections() {
  const sections = await ListeningSection.find({
    isActive: true,
    gapFillPublished: true,
  })
    .select('_id title partNumber audioDuration isActualTest gapFillAnswers')
    .sort({ partNumber: 1, title: 1 })
    .lean();
  return sections.map(s => ({
    _id: s._id,
    title: s.title,
    partNumber: s.partNumber,
    audioDuration: s.audioDuration,
    isActualTest: s.isActualTest,
    blankCount: (s.gapFillAnswers || []).length,
  }));
}

async function getGapFillSectionById(id) {
  const section = await ListeningSection.findOne({ _id: id, isActive: true, gapFillPublished: true })
    .select('_id title partNumber audioUrl audioDuration gapFillTemplate gapFillAnswers gapFillGlossary')
    .lean();
  if (!section) return null;
  const { gapFillAnswers, gapFillGlossary, ...rest } = section;
  return { ...rest, wordBank: buildGapFillWordBank(gapFillAnswers, gapFillGlossary) };
}

// Word bank shown beside the drill: every answer once (with a count when it
// fills several blanks), sorted A→Z so the list never gives away which blank
// a word belongs to — the blank→answer mapping itself stays server-side.
function buildGapFillWordBank(answers, glossary) {
  const gloss = new Map((glossary || []).map(g => [g.word.toLowerCase().trim(), g]));
  const byKey = new Map();
  (answers || []).forEach(a => {
    const word = String(a || '').trim();
    if (!word) return;
    const key = word.toLowerCase();
    const cur = byKey.get(key);
    if (cur) { cur.count++; return; }
    const g = gloss.get(key);
    byKey.set(key, {
      word,
      count: 1,
      meaning: g ? g.meaning : '',
      partOfSpeech: g ? g.partOfSpeech : '',
      skip: g ? g.skip : /\d/.test(word),
      hasGloss: !!g,
    });
  });
  return [...byKey.values()].sort((x, y) => x.word.localeCompare(y.word, 'en', { sensitivity: 'base' }));
}

// Fills gapFillGlossary for any answer that has no entry yet (one Gemini
// call per section, ever — later students get the cached copy). Concurrent
// first opens of the same section share one in-flight call.
const _glossaryInFlight = new Map();
async function getGapFillGlossary(id) {
  const section = await ListeningSection.findOne({ _id: id, isActive: true, gapFillPublished: true })
    .select('_id transcript gapFillAnswers gapFillGlossary')
    .lean();
  if (!section) return null;
  let bank = buildGapFillWordBank(section.gapFillAnswers, section.gapFillGlossary);
  const missing = bank.filter(w => !w.hasGloss).map(w => w.word);
  if (!missing.length) return bank;

  const key = String(section._id);
  if (!_glossaryInFlight.has(key)) {
    _glossaryInFlight.set(key, (async () => {
      const items = await geminiService.generateGapFillGlossary(section.transcript, missing);
      const wanted = new Set(missing.map(w => w.toLowerCase()));
      const fresh = items.filter(it => wanted.has(it.word.toLowerCase()));
      if (fresh.length) {
        await ListeningSection.updateOne({ _id: section._id }, { $push: { gapFillGlossary: { $each: fresh } } });
      }
      return fresh;
    })().finally(() => _glossaryInFlight.delete(key)));
  }
  const fresh = await _glossaryInFlight.get(key);
  return buildGapFillWordBank(section.gapFillAnswers, [...(section.gapFillGlossary || []), ...fresh]);
}

async function saveGapFillAttempt({ sectionId, sectionTitle, partNumber, answers }, userId) {
  const section = await ListeningSection.findOne({ _id: sectionId, gapFillPublished: true })
    .select('_id title partNumber gapFillAnswers')
    .lean();
  if (!section) return null;

  const correctAnswers = section.gapFillAnswers || [];
  const safeAnswers = (answers || [])
    .map(a => ({ blankIndex: Number(a.blankIndex), userAnswer: String(a.userAnswer || '') }))
    .filter(a => Number.isInteger(a.blankIndex) && a.blankIndex >= 0 && a.blankIndex < correctAnswers.length);
  if (!safeAnswers.length) return null;

  const gradedAnswers = safeAnswers.map(a => {
    const correctAnswer = correctAnswers[a.blankIndex];
    const isCorrect = normalizeGapFillAnswer(a.userAnswer) === normalizeGapFillAnswer(correctAnswer);
    return { blankIndex: a.blankIndex, userAnswer: a.userAnswer, isCorrect, correctAnswer };
  });
  const correctCount = gradedAnswers.filter(a => a.isCorrect).length;

  const attempt = await GapFillAttempt.create({
    userId,
    sectionId,
    sectionTitle: sectionTitle || section.title || '',
    partNumber: partNumber || section.partNumber || 1,
    answers: gradedAnswers.map(({ blankIndex, userAnswer, isCorrect }) => ({ blankIndex, userAnswer, isCorrect })),
    totalBlanks: correctAnswers.length,
    correctCount,
    submittedAt: new Date()
  });
  await keepStreakAlive(userId);

  return {
    attemptId: attempt._id,
    correctCount,
    totalBlanks: correctAnswers.length,
    answers: gradedAnswers.map(({ blankIndex, isCorrect, correctAnswer }) => ({ blankIndex, isCorrect, correctAnswer })),
  };
}

// ── Admin – Gap-fill generation & review ─────────────────────────────────
async function generateSectionGapFill(id) {
  const section = await ListeningSection.findById(id).select('_id transcript');
  if (!section) throw new NotFoundError('Không tìm thấy section');
  if (!section.transcript || !section.transcript.trim()) {
    const err = new Error('Section chưa có transcript');
    err.status = 400;
    throw err;
  }

  const { template, answers } = await geminiService.generateGapFillBlanks(section.transcript);

  section.gapFillTemplate = template;
  section.gapFillAnswers = answers;
  section.gapFillGlossary = [];
  section.gapFillGeneratedAt = new Date();
  // Regenerating always resets publish state — an admin must re-review
  // before students see the new content.
  section.gapFillPublished = false;
  section.gapFillSkippedAt = null;
  section.gapFillSkipReason = '';
  await section.save();

  return { gapFillTemplate: template, gapFillAnswers: answers, gapFillGeneratedAt: section.gapFillGeneratedAt, gapFillPublished: false };
}

async function updateSectionGapFill(id, { gapFillTemplate, gapFillAnswers, gapFillPublished }) {
  const section = await ListeningSection.findByIdAndUpdate(
    id,
    { gapFillTemplate, gapFillAnswers, gapFillPublished: gapFillPublished === true },
    { new: true, runValidators: true }
  ).select('gapFillTemplate gapFillAnswers gapFillPublished gapFillGeneratedAt');
  if (!section) throw new NotFoundError('Không tìm thấy section');
  return section;
}

// ── Admin – Listening warm-up (pre-listening synonyms / paraphrases) ──
// One AI pass, plus a second one when either activity came back short —
// the second is told which keywords/questions it already has so it looks
// elsewhere. Only verbatim-grounded items survive (validateWarmUp).
const WARMUP_FULL = 8;
const WARMUP_MIN = 3;

async function buildSectionWarmUp(section, { quality = false } = {}) {
  const transcript = String(section.transcript || '').trim();
  if (!transcript) { const err = new Error('Section chưa có transcript'); err.status = 400; throw err; }
  const questionMaterial = warmUpUtil.buildQuestionMaterial(section);
  if (!questionMaterial.trim()) { const err = new Error('Section chưa có câu hỏi'); err.status = 400; throw err; }
  const explanationHints = warmUpUtil.buildExplanationHints(section);
  const ctx = { transcript, questionMaterial, testAnswers: warmUpUtil.buildTestAnswers(section) };

  const parts = [];
  const dropped = [];
  for (let pass = 0; pass < 2; pass++) {
    const have = warmUpUtil.mergeWarmUps(parts, ctx);
    if (pass > 0 && have.synonyms.length >= WARMUP_FULL && have.paraphrases.length >= WARMUP_FULL) break;
    const retryNote = pass === 0 ? null
      : `You already produced these — give DIFFERENT items this time. Keywords: ${have.synonyms.map(x => `"${x.keyword}"`).join(', ') || 'none'}. Questions: ${have.paraphrases.map(x => `"${x.question}"`).join(', ') || 'none'}. Copy every phrase EXACTLY from its source.`;
    const raw = await geminiService.generateListeningWarmUp({ ...ctx, explanationHints, retryNote, quality });
    const v = warmUpUtil.validateWarmUp(raw, ctx);
    parts.push(v);
    dropped.push(...v.dropped);
  }
  let merged = warmUpUtil.mergeWarmUps(parts, ctx);
  // Meaning check (see geminiService.judgeListeningWarmUp). A judge failure
  // keeps the grounded items rather than losing the whole section.
  try {
    const verdict = await geminiService.judgeListeningWarmUp({ transcript, ...merged });
    merged.synonyms.forEach((x, i) => { if (!verdict.synonyms[i]) dropped.push(`syn:judge "${x.keyword}" ≈ "${x.answer}"`); });
    merged.paraphrases.forEach((x, i) => { if (!verdict.paraphrases[i]) dropped.push(`para:judge "${x.question}" ~ "${x.answer}"`); });
    merged = {
      synonyms: merged.synonyms.filter((_, i) => verdict.synonyms[i]),
      paraphrases: merged.paraphrases.filter((_, i) => verdict.paraphrases[i]),
    };
  } catch (err) {
    if (err.isOverloaded) throw err;
    logger.ai('buildSectionWarmUp: judge failed, keeping grounded items', { errorMessage: err.message });
  }
  if (merged.synonyms.length < WARMUP_MIN && merged.paraphrases.length < WARMUP_MIN) {
    const err = new Error(`AI không tạo được đủ cặp từ khớp nguyên văn transcript (${merged.synonyms.length} synonym, ${merged.paraphrases.length} paraphrase) — thử lại hoặc nhập tay.`);
    err.status = 422;
    err.dropped = dropped;
    throw err;
  }
  return { ...merged, dropped };
}

async function generateSectionWarmUp(id, opts = {}) {
  const section = await ListeningSection.findById(id).select('_id transcript questionGroups').lean();
  if (!section) throw new NotFoundError('Không tìm thấy section');
  const { synonyms, paraphrases, dropped } = await buildSectionWarmUp(section, opts);
  const warmUp = { synonyms, paraphrases, generatedAt: new Date(), editedAt: null };
  // Regenerating always resets publish state — an admin must re-review.
  await ListeningSection.updateOne({ _id: id }, { $set: { warmUp, warmUpPublished: false, warmUpSkippedAt: null, warmUpSkipReason: '' } });
  return { warmUp: { ...warmUp, published: false }, dropped };
}

const EMPTY_WARMUP = { synonyms: [], paraphrases: [], generatedAt: null, editedAt: null };

// Teacher view: the key plus its publish state as `published`.
async function getSectionWarmUp(id) {
  const section = await ListeningSection.findById(id).select('warmUp warmUpPublished').lean();
  if (!section) throw new NotFoundError('Không tìm thấy section');
  return { ...(section.warmUp || EMPTY_WARMUP), published: section.warmUpPublished === true };
}

async function updateSectionWarmUp(id, body) {
  const { synonyms, paraphrases } = warmUpUtil.sanitizeWarmUpInput(body);
  const prev = await ListeningSection.findById(id).select('warmUp').lean();
  if (!prev) throw new NotFoundError('Không tìm thấy section');
  const published = body?.published === true && (synonyms.length > 0 || paraphrases.length > 0);
  const warmUp = { synonyms, paraphrases, generatedAt: prev.warmUp?.generatedAt || null, editedAt: new Date() };
  await ListeningSection.updateOne({ _id: id }, { $set: { warmUp, warmUpPublished: published } });
  return { ...warmUp, published };
}

// Admin list: the warm-up key itself stays out (select:false) — only its
// size, for the list's status badge.
async function listAdminSections() {
  const sections = await ListeningSection.find().select('+warmUp').sort({ partNumber: 1, createdAt: -1 }).lean();
  return sections.map(({ warmUp, ...s }) => ({
    ...s,
    warmUpCount: (warmUp?.synonyms?.length || 0) + (warmUp?.paraphrases?.length || 0),
  }));
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

async function bulkSetSectionsActive(ids, isActive) {
  return ListeningSection.updateMany({ _id: { $in: ids } }, { isActive });
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
      { $project: { name: 1, testNumber: 1, seriesName: 1, audioDuration: 1, totalParts: 1, totalQuestions: 1, 'sections.title': 1, 'sections.partNumber': 1 } }
    ]).collation({ locale: 'en', numericOrdering: true }),
    // Only whole-test attempts mark a card done — a Part-1-only run isn't the test.
    ListeningAttempt.find({ userId, status: 'completed', parts: { $exists: false } })
      .select('testId bandScore correctCount wrongCount skippedCount submittedAt timeTaken').lean()
  ]);

  const attemptMap = {};
  attempts.forEach(a => {
    const key = a.testId.toString();
    if (!attemptMap[key] || attemptMap[key].submittedAt < a.submittedAt) attemptMap[key] = a;
  });
  // partsPickable: every part has its own đề lẻ audio (findPartAudios), so
  // the student may pick just some sections. One query for all tests.
  const withAudio = new Set((await ListeningSection.find({ audioUrl: { $nin: ['', null] } }).select('title partNumber').lean())
    .map(l => `${l.partNumber}|${l.title}`));
  // Per-test review-status badge — see readingService.listTestsForUser's
  // identical use of this same shared helper.
  const reviewMap = await reviewService.getReviewStatusMap(userId, 'listening', Object.values(attemptMap).map(a => a._id));
  Object.values(attemptMap).forEach(a => {
    const rv = reviewMap[a._id.toString()];
    a.reviewStatus = rv ? rv.status : 'none';
    a.reviewMistakeCount = rv ? rv.mistakeCount : 0;
  });

  return tests.map(t => ({
    _id: t._id, name: t.name, testNumber: t.testNumber, seriesName: t.seriesName,
    audioDuration: t.audioDuration, totalParts: t.totalParts, totalQuestions: t.totalQuestions,
    partsPickable: (t.sections || []).length === 4 && t.sections.every(s => withAudio.has(`${s.partNumber}|${s.title}`)),
    lastAttempt: attemptMap[t._id.toString()] || null
  }));
}

// rawParts: section numbers (1–4) to do — "Chọn phần làm". Absent/all =
// the whole test on its one recording; a subset plays each picked part's
// own audio (sections[i].audioUrl). { partsUnavailable: true } when some
// picked part has no audio of its own.
async function startTest(id, userId, mode = 'practice', rawParts = null) {
  if (mode === 'simulation') await examSimulationService.assertNotOnCooldown(userId);

  const test = await ListeningTest.findOne({ _id: id, isActive: true });
  if (!test) return null;

  const parts = normalizeParts(rawParts, 4);
  let picked = test.sections;
  if (parts) {
    picked = await pickSectionsWithAudio((typeof test.toObject === 'function' ? test.toObject() : test).sections || [], parts);
    if (!picked) return { partsUnavailable: true };
  }

  // Persisted immediately (status: 'in-progress') so an abandoned mock test
  // leaves a record instead of vanishing entirely — previously nothing was
  // saved until submitTest() ran, so a student who started and never
  // finished left zero trace anywhere (audit finding). Mirrors Reading's
  // TestAttempt, which has done this from the start.
  //
  // BUG-010: reuse an already-open in-progress attempt instead of creating
  // a new one every time /start is called (a refreshed tab, or a second
  // tab, previously left behind an unbounded trail of duplicate
  // 'in-progress' rows that never resolved). Deliberately REUSE, never
  // invalidate/supersede the old row: submitTest()'s findOneAndUpdate
  // below requires status:'in-progress' in its own filter, so marking a
  // stale row anything else would silently reject a legitimate late
  // submission from that same session — a real student-data-loss risk
  // this fix must not introduce. The reused row's own already-persisted
  // fields (startTime included) are left untouched — a resumed session
  // keeps its real elapsed time, not a reset clock.
  // Scoped to `mode` too — a still-open Practice attempt must never be
  // silently resumed as a Simulation one (or vice versa). See Reading's
  // startTest() for the identical reasoning.
  let attempt = await ListeningAttempt.findOne({ userId, testId: test._id, status: 'in-progress', mode, ...partsFilter(parts) });
  if (!attempt) {
    const totalQuestions = picked.reduce((sum, s) =>
      sum + s.questionGroups.reduce((gs, g) => gs + g.questions.length, 0), 0);
    attempt = await ListeningAttempt.create({
      userId, testId: test._id, testName: test.name, totalQuestions, startTime: new Date(), mode,
      ...(parts ? { parts } : {}),
    });
  }

  const sections = picked.map(s => ({
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
    })),
    ...(parts ? { audioUrl: s.audioUrl, audioDuration: s.audioDuration } : {}),
  }));
  return {
    _id: test._id, attemptId: attempt._id, name: test.name,
    audioUrl: parts ? '' : test.audioUrl, audioDuration: test.audioDuration, sections, mode, parts,
  };
}

// opts.disqualified: the proctor just voided this attempt — save the answers
// given so far (graded, so the teacher sees the score), but leave it
// 'disqualified' with no streak/badge/review side effects. One time only —
// see proctorPolicy.disqualifiedAnswerFilter.
async function submitTest(id, { answers = {}, startTime: startTimeRaw, attemptId }, user, { disqualified = false } = {}) {
  if (disqualified && !attemptId) return null;
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
  let parts = null;
  if (attemptId) {
    const existing = await ListeningAttempt.findOne({ _id: attemptId, userId: user._id || user.id }).select('startTime parts').lean();
    if (existing) serverStartTime = existing.startTime;
    if (existing && Array.isArray(existing.parts) && existing.parts.length) parts = existing.parts;
  }
  const startTime = serverStartTime || (startTimeRaw ? new Date(startTimeRaw) : null);
  const maxSecs = (test.audioDuration || 40) * 60;
  const timeTaken = startTime ? Math.min(Math.max(0, Math.round((now - startTime) / 1000)), maxSecs) : 0;

  // Snapshot the sections as-submitted so a later admin edit to the live
  // ListeningTest / ListeningSection can't retro-change this student's review.
  // A partial attempt grades (and snapshots) only its picked sections, each
  // with its own audio for the review.
  const testObj = typeof test.toObject === 'function' ? test.toObject() : test;
  const sectionsUsed = parts
    ? (await pickSectionsWithAudio(testObj.sections || [], parts)) || (testObj.sections || []).filter(s => parts.includes(s.partNumber))
    : (testObj.sections || []);

  const allGroups = sectionsUsed.flatMap(s => s.questionGroups);
  const getUserAnswer = num => answers[num] !== undefined ? String(answers[num]).trim() : '';
  const extraFields = q => ({ explanation: q.explanation, type: q.type, questionText: q.questionText, options: q.options, wordBank: q.wordBank, audioTimestamp: q.audioTimestamp });
  const { correct, wrong, skipped, reviewed } = gradeQuestionGroups(allGroups, getUserAnswer, extraFields);
  const total = flattenQuestions(sectionsUsed).length;
  // Partial attempt: band estimated from the score scaled to 40 questions.
  const bandScore = calcBandScore(parts ? scaledCorrect(correct, total) : correct);

  const fields = {
    userId: user._id || user.id,
    testId: test._id,
    testName: test.name,
    sectionsSnapshot: sectionsUsed.length ? sectionsUsed : undefined,
    audioUrlSnapshot: parts ? '' : (test.audioUrl || ''),
    answers: reviewed.map(r => ({ questionNumber: r.questionNumber, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer, isCorrect: r.isCorrect })),
    totalQuestions: total,
    correctCount: correct,
    wrongCount: wrong,
    skippedCount: skipped,
    bandScore,
    startTime: startTime || now,
    submittedAt: now,
    timeTaken,
    status: disqualified ? 'disqualified' : 'completed',
    ...(disqualified ? { 'proctor.answersSavedAt': now } : {}),
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
  let attempt;
  if (attemptId) {
    attempt = await ListeningAttempt.findOneAndUpdate(
      disqualified
        ? { _id: attemptId, userId: fields.userId, ...disqualifiedAnswerFilter() }
        : { _id: attemptId, userId: fields.userId, status: 'in-progress' },
      fields,
      { new: true }
    );
    if (!attempt) return null;
  } else {
    attempt = await ListeningAttempt.create(fields);
  }

  if (disqualified) {
    return { attemptId: attempt._id, totalQuestions: total, correctCount: correct, wrongCount: wrong, skippedCount: skipped, bandScore, timeTaken, disqualified: true, ...(parts ? { parts } : {}) };
  }

  let bonusApplied = 0;
  let newlyUnlocked = [];
  let streak = user.learningStreak;
  if (user.role === 'student') {
    // Accuracy → streak bonus, same tiering as vocab practice: <80% = 0,
    // 80-90% = +1, >=90% = +2, capped at +5/day shared across all activities.
    const accuracy = total > 0 ? correct / total : 0;
    const rawBonus = bonusForAccuracy(accuracy);
    bonusApplied = await reserveDailyStreakBonus(user._id, rawBonus);
    // Atomic (see applyStreakActivity's comment) — a plain updateStreak()+
    // save() here used to race a concurrent activity's own save and lose
    // lastActivityDate's advance, causing a spurious "missed a day" reset
    // days later even though the student studied every day.
    const streakDoc = await applyStreakActivity(User, user._id, bonusApplied, { allowSameDayStack: true }).catch(() => null);
    if (streakDoc) streak = streakDoc.learningStreak;
    newlyUnlocked = (await badgeService.checkAndAwardNewBadges(user._id)).newlyUnlocked;
  }

  const reviewMap = {};
  reviewed.forEach(r => { reviewMap[r.questionNumber] = r; });
  const reviewSections = buildReviewSections(sectionsUsed, reviewMap);

  // Mandatory Review System — must be awaited, not fire-and-forget: the
  // gate must be active the instant the score is returned. `reviewed`
  // already carries `type` per question (via extraFields above), so no
  // extra query is needed to build the type map.
  const questionTypeMap = {};
  reviewed.forEach(r => { questionTypeMap[r.questionNumber] = r.type; });
  await reviewService.createReviewIfNeeded({
    userId: fields.userId, attemptType: 'listening', attemptId: attempt._id,
    gradedAnswers: fields.answers, questionTypeMap,
  });

  return {
    attemptId: attempt._id, testName: test.name, totalQuestions: total,
    correctCount: correct, wrongCount: wrong, skippedCount: skipped, bandScore, timeTaken,
    questions: reviewed, sections: reviewSections, audioUrl: parts ? '' : test.audioUrl,
    bonusApplied, streak, newlyUnlocked, ...(parts ? { parts } : {}),
  };
}

// ── Student – history ─────────────────────────────────────────────────────
// Audit finding BUG-013: same fix as readingService.getHistory — total is a
// real countDocuments() over the SAME filter, so hasMore is accurate even
// past the returned page. Return shape changed (was a bare array) — the
// one caller (listening.controller.js) is updated alongside this.
async function getHistory(userId, limit = 50) {
  // Excludes 'in-progress' rows now that startTest() persists one before
  // the student has answered anything — matches Reading's getHistory(),
  // which has always filtered to status: 'completed' for the same reason.
  const filter = { userId, status: { $ne: 'in-progress' } };
  const [attempts, total] = await Promise.all([
    ListeningAttempt.find(filter)
      .select('testName bandScore correctCount wrongCount skippedCount totalQuestions timeTaken submittedAt status testId')
      .populate('testId', 'name testNumber')
      .sort({ submittedAt: -1 })
      .limit(limit),
    ListeningAttempt.countDocuments(filter),
  ]);
  return { attempts, total };
}

// userId === null means "don't scope by owner" — the teacher/admin
// mock-test-monitor review deep link (see the controller's comment).
async function getHistoryDetail(attemptId, userId) {
  const attempt = await ListeningAttempt.findOne({ _id: attemptId, ...(userId ? { userId } : {}) }).lean();
  if (!attempt) return { status: 'attempt_not_found' };

  // Prefer the as-submitted snapshot; fall back to the live test for attempts
  // finished before sectionsSnapshot existed (or where it couldn't be taken).
  let sections, audioUrl;
  if (Array.isArray(attempt.sectionsSnapshot) && attempt.sectionsSnapshot.length) {
    sections = attempt.sectionsSnapshot;
    audioUrl = attempt.audioUrlSnapshot || '';
  } else {
    const test = await ListeningTest.findById(attempt.testId).lean();
    if (!test) return { status: 'test_not_found' };
    sections = test.sections || [];
    audioUrl = test.audioUrl || '';
  }

  const reviewMap = {};
  attempt.answers.forEach(a => { reviewMap[a.questionNumber] = a; });

  const allQuestions = flattenQuestions(sections);
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
  const reviewSections = buildReviewSections(sections, reviewMap2);

  return {
    status: 'ok',
    result: {
      attemptId: attempt._id, testName: attempt.testName, bandScore: attempt.bandScore,
      correctCount: attempt.correctCount, wrongCount: attempt.wrongCount, skippedCount: attempt.skippedCount,
      totalQuestions: attempt.totalQuestions, timeTaken: attempt.timeTaken, submittedAt: attempt.submittedAt,
      questions: reviewed, sections: reviewSections, audioUrl,
      highlights: attempt.highlights || null,
      parts: attempt.parts || null,
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

// Test Simulation mode only — see readingService.startPracticeSimulation
// for the full rationale. No artificial timer here (unlike Reading's ~20min
// passage convention): a single-play, no-pause/no-rewind audio section
// already has its own natural time limit, so this only exists to give a
// strike (examSimulationService.recordViolation) an in-progress row to
// attach to. Practice mode never calls this.
async function startPracticeSimulation(sectionId, sectionTitle, partNumber, userId) {
  await examSimulationService.assertNotOnCooldown(userId);
  const section = await ListeningSection.findById(sectionId).select('_id title partNumber').lean();
  if (!section) return { status: 'not_found' };

  const attempt = await ListeningPracticeAttempt.create({
    userId, sectionId,
    sectionTitle: sectionTitle || section.title || '',
    partNumber: partNumber || section.partNumber || 1,
    status: 'in-progress', mode: 'simulation',
  });
  return { status: 'ok', attemptId: attempt._id };
}

// ── Practice attempts (single-section, no premium gate) ─────────────────
async function savePractice({ sectionId, sectionTitle, partNumber, answers, timeTaken, clientKey, attemptId: simulationAttemptId, highlights: rawHighlights, disqualified: dqFlag }, userId) {
  // The proctor just voided this attempt — see submitTest()'s opts.disqualified.
  const disqualified = dqFlag === true && !!simulationAttemptId;
  const section = await ListeningSection.findById(sectionId).lean();
  if (!section) return null;
  // Highlights made while practising (no attempt id to PUT them to until
  // this call) — see attemptHighlightService.
  const cleanHl = rawHighlights ? sanitizeHighlights(rawHighlights) : null;
  const highlights = cleanHl && !tooLarge(cleanHl) ? cleanHl : undefined;

  // BUG-A07: idempotency — a double fire of this fire-and-forget save used
  // to duplicate the row + the AttemptReview it spawns. See
  // ReadingPracticeAttempt.js / readingService.savePractice for the pattern.
  const key = typeof clientKey === 'string' && clientKey ? clientKey : null;
  if (key && !disqualified) {
    const existing = await ListeningPracticeAttempt.findOne({ userId, clientKey: key }).select('_id correctCount totalQuestions').lean();
    if (existing) {
      return { attemptId: existing._id, correctCount: existing.correctCount, totalQuestions: existing.totalQuestions, deduped: true };
    }
  }

  const uaMap = {};
  for (const a of answers) uaMap[a.questionNumber] = (a.userAnswer || '').trim();
  const getUserAnswer = num => uaMap[num] || '';
  const { correct, skipped: _skipped, wrong: _wrong, reviewed } = gradeQuestionGroups(section.questionGroups || [], getUserAnswer);
  const gradedAnswers = reviewed.map(r => ({ questionNumber: r.questionNumber, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer, isCorrect: r.isCorrect }));

  let attempt;
  if (simulationAttemptId) {
    // Atomic claim, same pattern as Reading's startPracticeSimulation update
    // path — a late strike report flipping status to 'disqualified' right
    // before this lands makes the update match nothing.
    attempt = await ListeningPracticeAttempt.findOneAndUpdate(
      disqualified
        ? { _id: simulationAttemptId, userId, ...disqualifiedAnswerFilter() }
        : { _id: simulationAttemptId, userId, status: 'in-progress', mode: 'simulation' },
      {
        sectionTitle: sectionTitle || section.title || '',
        partNumber: partNumber || section.partNumber || 1,
        answers: gradedAnswers, totalQuestions: gradedAnswers.length,
        correctCount: correct, wrongCount: _wrong, skippedCount: _skipped,
        timeTaken: timeTaken || 0, submittedAt: new Date(),
        ...(disqualified
          ? { status: 'disqualified', 'proctor.answersSavedAt': new Date() }
          : { status: 'completed' }),
        ...(highlights ? { highlights } : {}),
      },
      { new: true }
    );
    if (!attempt) return null; // disqualified (or a duplicate submit) — nothing to save
    if (disqualified) return { attemptId: attempt._id, correctCount: correct, totalQuestions: gradedAnswers.length, disqualified: true };
  } else {
    try {
      attempt = await ListeningPracticeAttempt.create({
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
        submittedAt: new Date(),
        ...(key ? { clientKey: key } : {}),
        ...(highlights ? { highlights } : {}),
      });
    } catch (err) {
      if (err.code === 11000 && key) {
        const winner = await ListeningPracticeAttempt.findOne({ userId, clientKey: key }).select('_id correctCount totalQuestions').lean();
        if (winner) return { attemptId: winner._id, correctCount: winner.correctCount, totalQuestions: winner.totalQuestions, deduped: true };
      }
      throw err;
    }
  }

  const questionTypeMap = {};
  (section.questionGroups || []).forEach(g => (g.questions || []).forEach(q => { questionTypeMap[q.questionNumber] = q.type; }));
  await reviewService.createReviewIfNeeded({
    userId, attemptType: 'listening-practice', attemptId: attempt._id,
    gradedAnswers, questionTypeMap,
  });
  await keepStreakAlive(userId);

  return { attemptId: attempt._id, correctCount: correct, totalQuestions: gradedAnswers.length };
}

async function getPracticeHistory(userId) {
  return ListeningPracticeAttempt.find({ userId, ...REAL_ATTEMPT }).select('-answers -highlights').sort({ submittedAt: -1 }).limit(50).lean();
}

// Ownership-scoped ({ _id, userId }). Withholds the answer key: the raw
// `section` doc (correctAnswer + explanation per question) and the
// `correctAnswer` frozen onto each `attempt.answers` row — so it can't be
// used to harvest answer keys after premium/trial access lapses (P1
// regression finding). The review UI re-fetches the key from GET
// /practice/answer-key/:id, which is itself requirePremium-gated.
// (audioUrl is still proxied via protectListeningAudio in the controller.)
async function getPracticeHistoryDetail(attemptId, userId) {
  const attempt = await ListeningPracticeAttempt.findOne({ _id: attemptId, userId }).lean();
  if (!attempt) return null;
  const section = await ListeningSection.findById(attempt.sectionId).select(PRACTICE_SECTION_SAFE_FIELDS).lean();
  // No content snapshot for Bài lẻ practice attempts (unlike ListeningAttempt's
  // sectionsSnapshot) — if the section was permanently deleted since this
  // attempt, the review can never render again. Auto-resolve any pending
  // mandatory review pointing at it so a student doesn't stay stuck behind
  // an unloadable "Tiếp tục Review" forever (see reviewService.resolveOrphanedReview).
  if (!section) await reviewService.resolveOrphanedReview('listening-practice', attemptId);
  return { attempt: stripAnswerKeyFromAttempt(attempt), section };
}

module.exports = {
  flattenQuestions, calcBandScore,
  listAdminTests, getAdminTest, createAdminTest, updateAdminTest, hideAdminTest, deleteAdminTestPermanent, bulkSetTestsActive,
  uploadTestAudio, uploadStandaloneAudio, uploadMapImage, uploadSectionAudio,
  updateTranscript,
  listAdminAttempts, getAdminAttemptsStats,
  listPracticeSections, getPracticeSectionById, getSectionAnswerKey, listDictationSections, getDictationTranslations, saveDictationAttempt,
  listGapFillSections, getGapFillSectionById, getGapFillGlossary, saveGapFillAttempt, generateSectionGapFill, updateSectionGapFill,
  buildSectionWarmUp, generateSectionWarmUp, getSectionWarmUp, updateSectionWarmUp,
  listAdminSections, getAdminSection, createAdminSection, updateAdminSection, hideAdminSection, deleteAdminSectionPermanent, bulkSetSectionsActive,
  assembleTest,
  listStudentTests, startTest, submitTest,
  getHistory, getHistoryDetail,
  savePractice, startPracticeSimulation, getPracticeHistory, getPracticeHistoryDetail,
  // Exported for entranceTestService.js, which grades a single
  // ListeningSection's questionGroups the exact same way a normal Listening
  // attempt does — no reason to re-implement this logic a third time.
  gradeQuestionGroups,
};
