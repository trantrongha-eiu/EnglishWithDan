'use strict';

// WT1 course service — the mini-LMS over WT1Course/Module/Lesson/Exercise.
// Reads: overview (modules → lessons with done/unlocked/score), one lesson
// (+ sanitized exercises), submission recording + per-lesson progress, and
// one saved attempt for review. Gate is now HARD: assertLessonUnlocked()
// is called from getLesson and every submit path (check/submitWriting/
// submitSpeaking in wt1.controller.js), so a locked lesson can't be
// entered or graded even by calling the API directly — the `unlocked` flag
// in getOverview isn't just decorative anymore. A lesson flagged `isTest`
// has an ADDITIONAL gate on top of the normal sequential one: even once
// the previous lesson's score threshold is met, the test stays locked
// until the student redeems an admin-issued code (ReviewBypassCode,
// kind:'wt1-test-unlock', targetLessonCode = this lesson) — see
// reviewService.redeemBypassCode.
const mongoose = require('mongoose');
const WT1Course = require('../models/WT1Course');
const WT1Module = require('../models/WT1Module');
const WT1Lesson = require('../models/WT1Lesson');
const WT1Exercise = require('../models/WT1Exercise');
const WT1Submission = require('../models/WT1Submission');
const WT1Progress = require('../models/WT1Progress');
const ReviewBypassCode = require('../models/ReviewBypassCode');
const { NotFoundError, AuthorizationError } = require('../errors/AppError');
const grading = require('./wt1GradingService');

const COURSE_CODE = 'IELTS-W-T1';
// The WT1 stack is course-agnostic — the same models / routes / grading /
// page shell serve every course built on it (Task 1 Writing, Task 2 Writing,
// and the Speaking course, which adds the speaking_response exercise type —
// see wt1.controller.submitSpeaking). Add a code here to spin up a new one.
// Anything not in this set falls back to Task 1.
const COURSES = new Set(['IELTS-W-T1', 'IELTS-W-T2', 'IELTS-SPEAKING', 'NOUN-PHRASE-WRITING']);
function resolveCourse(code) { return COURSES.has(code) ? code : COURSE_CODE; }

function gateDefaults(g = {}) {
  return {
    requireObjectiveCompletion: g.requireObjectiveCompletion ?? true,
    minObjectiveScorePercent: g.minObjectiveScorePercent ?? 70,
    minWritingSubmissions: g.minWritingSubmissions ?? 1,
  };
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Strip everything that would leak the answer key before submission.
// `courseCode` only matters for gap_fill: the Speaking course renders it as
// drag-and-drop from a word bank instead of free typing (typing the correct
// spelling is an unrelated barrier for a drill about picking the right
// linking word/filler), which needs the exercise's correct answers sent up
// front the same way `matching`'s rightOptions already are below. Every
// other course keeps free typing.
function sanitizeExercise(ex, courseCode) {
  const rubric = ex.rubric
    ? {
      minWords: ex.rubric.minWords, maxWords: ex.rubric.maxWords,
      mustUse: ex.rubric.mustUse, targetStructures: ex.rubric.targetStructures || [],
      targetVocab: ex.rubric.targetVocab || [], checklist: ex.rubric.checklist || [],
      scoring: ex.rubric.scoring || [], bandFocus: ex.rubric.bandFocus || [],
    }
    : undefined;

  // speaking_response has no auto-graded answer key to protect — the
  // student records a spoken answer and Gemini bands it — so the Band 7
  // model answer and the common-errors list stay visible as learning aids
  // (same call the frontend's "Xem bài mẫu Band 7" panel reads).
  if (rubric && ex.type === 'speaking_response') {
    rubric.sampleAnswer = ex.rubric.sampleAnswer || '';
    rubric.commonErrors = ex.rubric.commonErrors || [];
  }

  const items = (ex.items || []).map((it) => {
    const base = { id: it.id, prompt: it.prompt };
    if (ex.type === 'mcq') base.options = it.options || [];
    if (ex.type === 'gap_fill') base.blankCount = (String(it.prompt || '').match(/____/g) || []).length;
    if (ex.type === 'sentence_transform') {
      base.cue = it.cue || ''; base.starter = it.starter || '';
      // Optional Vietnamese target sentence, shown above the keyword prompt
      // for the "gợi ý từ khóa → viết câu" style items (e.g. T1-L13-E02) so
      // the student knows exactly what sentence to produce. Display-only —
      // grading still re-checks against the DB copy on submit.
      base.promptVi = it.promptVi || '';
      // Deliberately relaxes "never expose the answer before submission" —
      // the frontend's word-by-word typing drill (WbwDrill, same one Task 2
      // weekly Dịch câu and "Viết câu nâng cao" use) validates per keystroke
      // client-side, which needs the target string in the browser. Same
      // exception, same field name, as translationAnswer everywhere else
      // in the app (task2PracticeService/task1PracticeService/
      // writingPracticeService) — see docs/EXERCISE_SYSTEMS.md and
      // [[task2_practice_dich_cau_wbw]]. Grading always re-checks against
      // the DB copy on submit, so this doesn't weaken grading integrity —
      // there's no separate "exam, no hints" mode in this course to leak
      // into either.
      // Falls back to answer/accept for items authored in the
      // error_correction shape (no sampleAnswers) so the typing drill still
      // has a target string — grading (wt1GradingService) accepts the same
      // union on submit.
      base.translationAnswer = (it.sampleAnswers || [])[0] || it.answer || (it.accept || [])[0] || '';
    }
    if (ex.type === 'categorize') base.text = it.text || '';
    if (ex.type === 'matching') base.left = it.left || '';
    if (ex.type === 'ordering') base.tokens = shuffle(it.tokens || []);
    if (ex.type === 'word_form') { /* prompt is enough */ }
    return base;
  });

  const out = {
    code: ex.code, lessonCode: ex.lessonCode, order: ex.order, type: ex.type,
    title: ex.title, titleEn: ex.titleEn, instruction: ex.instruction,
    difficulty: ex.difficulty, estimatedMinutes: ex.estimatedMinutes, points: ex.points,
    autoGrade: ex.autoGrade, timerMinutes: ex.timerMinutes,
    speakingPart: ex.speakingPart || null, speakingPrepSeconds: ex.speakingPrepSeconds || 0,
    stimulus: ex.stimulus || null, wordBank: ex.wordBank || [],
    categories: ex.categories || [], responseSlots: ex.responseSlots || 0,
    items, rubric,
  };
  if (ex.type === 'matching') {
    out.rightOptions = shuffle((ex.items || []).map((it) => it.right).filter(Boolean));
  }
  // One chip per blank across the whole exercise (not deduped — two blanks
  // that both want "and" need two chips or the drag-drop is unsolvable).
  if (ex.type === 'gap_fill' && courseCode === 'IELTS-SPEAKING') {
    out.gapBank = shuffle((ex.items || []).flatMap((it) => (it.blanks || []).map((b) => (b.accept || [])[0] || '')).filter(Boolean));
  }
  return out;
}

async function lessonExerciseCounts() {
  const rows = await WT1Exercise.aggregate([
    { $match: { published: true } },
    { $group: { _id: '$lessonCode', n: { $sum: 1 }, codes: { $push: '$code' }, types: { $push: '$type' } } },
  ]);
  const map = {};
  for (const r of rows) map[r._id] = { count: r.n, codes: r.codes, types: r.types };
  return map;
}

// per-lesson done / score from the student's submissions
function summariseSubmissions(subs, lessonCodesByExercise, exMeta) {
  // subs: [{exerciseCode, lessonCode, score, maxScore, aiFeedback, status}]
  const byLesson = {};
  const bestByExercise = {};
  for (const s of subs) {
    const cur = bestByExercise[s.exerciseCode];
    if (!cur || (s.score || 0) >= (cur.score || 0)) bestByExercise[s.exerciseCode] = s;
  }
  for (const [code, s] of Object.entries(bestByExercise)) {
    const lc = lessonCodesByExercise[code];
    if (!lc) continue;
    byLesson[lc] = byLesson[lc] || { doneCodes: new Set(), objScores: [], writingCount: 0 };
    byLesson[lc].doneCodes.add(code);
    const t = (exMeta.typeByCode || {})[code];
    if (grading.OBJECTIVE_TYPES.has(t)) byLesson[lc].objScores.push(s.score || 0);
    else byLesson[lc].writingCount += 1;
  }
  return byLesson;
}

// Which of these (isTest-only) lesson codes has this student already
// redeemed an admin-issued unlock code for. Codes are scoped to one
// specific test lesson (targetLessonCode) and, like review-bypass codes,
// redeemable once per student regardless of maxUses — see
// ReviewBypassCode.redemptions.
async function getUnlockedTestLessonCodes(userId, testLessonCodes) {
  if (!testLessonCodes.length) return new Set();
  const rows = await ReviewBypassCode.find({
    kind: 'wt1-test-unlock',
    targetLessonCode: { $in: testLessonCodes },
    'redemptions.userId': userId,
  }).select('targetLessonCode').lean();
  return new Set(rows.map((r) => r.targetLessonCode));
}

// The sequential-gate chain for ONE module's lessons (already sorted by
// order) — shared by getOverview (display) and assertLessonUnlocked
// (enforcement), so the two can never drift apart (a lesson the overview
// shows as unlocked must be exactly the same lesson the submit endpoints
// will accept). `unlockedTestLessons` = getUnlockedTestLessonCodes()'s
// result for this module's isTest lessons.
function computeLessonStatuses(mlessons, counts, perLesson, unlockedTestLessons) {
  let prevMetGate = true; // first lesson of a module is always unlocked
  return mlessons.map((l) => {
    const cnt = counts[l.code] || { count: 0 };
    const sum = perLesson[l.code] || { doneCodes: new Set(), objScores: [], writingCount: 0 };
    const doneCount = sum.doneCodes.size;
    const done = cnt.count > 0 && doneCount >= cnt.count;
    const objAvg = sum.objScores.length
      ? Math.round(sum.objScores.reduce((x, y) => x + y, 0) / sum.objScores.length) : 0;
    const g = gateDefaults(l.gate);
    const metGate = objAvg >= g.minObjectiveScorePercent && sum.writingCount >= g.minWritingSubmissions;
    const sequenceUnlocked = prevMetGate;  // this lesson is reachable if the previous one met its gate
    const needsTestCode = !!l.isTest && !unlockedTestLessons.has(l.code);
    const unlocked = sequenceUnlocked && !needsTestCode;
    prevMetGate = metGate;                 // …and THIS lesson, in turn, unlocks the next one when ITS gate is met
    return {
      code: l.code, title: l.title, titleEn: l.titleEn, order: l.order,
      isTest: !!l.isTest, exerciseCount: cnt.count, doneCount,
      objectives: l.objectives || [], durationMinutes: l.durationMinutes,
      done, scorePercent: objAvg, unlocked, needsTestCode,
    };
  });
}

async function getOverview(userId, courseCode) {
  const cc = resolveCourse(courseCode);
  const [course, modules, lessons, counts] = await Promise.all([
    WT1Course.findOne({ code: cc }).lean(),
    WT1Module.find({ courseCode: cc }).sort({ order: 1 }).lean(),
    WT1Lesson.find({ published: true }).sort({ order: 1 }).lean(),
    lessonExerciseCounts(),
  ]);
  // lessons is every course's published lessons; outModules only ever reads
  // lessonsByModule[m.code] for THIS course's modules, so other courses'
  // lessons are inert here (their moduleCode never matches).

  const lessonCodesByExercise = {};
  const typeByCode = {};
  for (const [lc, meta] of Object.entries(counts)) {
    meta.codes.forEach((c, i) => { lessonCodesByExercise[c] = lc; typeByCode[c] = meta.types[i]; });
  }

  // 'draft' = a multi-item speaking_response attempt still mid-recording
  // (see recordSpeakingItem) — must never count toward a lesson's done/
  // score state until every item has actually been graded.
  const subs = await WT1Submission.find({ userId, status: { $ne: 'draft' } }).select('exerciseCode score maxScore aiFeedback status').lean();
  const perLesson = summariseSubmissions(
    subs.map((s) => ({ ...s, lessonCode: lessonCodesByExercise[s.exerciseCode] })),
    lessonCodesByExercise, { typeByCode },
  );

  const lessonsByModule = {};
  for (const l of lessons) {
    (lessonsByModule[l.moduleCode] = lessonsByModule[l.moduleCode] || []).push(l);
  }

  const unlockedTestLessons = await getUnlockedTestLessonCodes(
    userId, lessons.filter((l) => l.isTest).map((l) => l.code),
  );

  const outModules = modules.map((m) => {
    const mlessons = (lessonsByModule[m.code] || []).sort((a, b) => a.order - b.order);
    const outLessons = computeLessonStatuses(mlessons, counts, perLesson, unlockedTestLessons);
    return {
      code: m.code, title: m.title, titleEn: m.titleEn, order: m.order,
      outcomes: m.outcomes || [], lessons: outLessons,
    };
  });

  return {
    course: course ? { code: course.code, title: course.title, targetBand: course.targetBand, description: course.description } : null,
    modules: outModules,
  };
}

// Throws AuthorizationError (403) if `lessonCode` isn't currently open for
// this student — called from getLesson and (via the lesson code on each
// exercise) from wt1.controller's check/submitWriting/submitSpeaking, so a
// locked lesson can neither be viewed nor graded, not just hidden behind a
// dimmed card in the UI. `err.code` lets the frontend tell "finish the
// previous lesson" apart from "needs an admin code" without string-matching
// the Vietnamese message.
async function assertLessonUnlocked(userId, lessonCode) {
  const lesson = await WT1Lesson.findOne({ code: lessonCode, published: true }).lean();
  if (!lesson) throw new NotFoundError('Không tìm thấy buổi học');

  const mlessons = await WT1Lesson.find({ moduleCode: lesson.moduleCode, published: true }).sort({ order: 1 }).lean();
  const counts = await lessonExerciseCounts();
  const lessonCodesByExercise = {};
  const typeByCode = {};
  for (const [lc, meta] of Object.entries(counts)) {
    meta.codes.forEach((c, i) => { lessonCodesByExercise[c] = lc; typeByCode[c] = meta.types[i]; });
  }
  const subs = await WT1Submission.find({ userId, status: { $ne: 'draft' } }).select('exerciseCode score maxScore aiFeedback status').lean();
  const perLesson = summariseSubmissions(
    subs.map((s) => ({ ...s, lessonCode: lessonCodesByExercise[s.exerciseCode] })),
    lessonCodesByExercise, { typeByCode },
  );
  const unlockedTestLessons = await getUnlockedTestLessonCodes(
    userId, mlessons.filter((l) => l.isTest).map((l) => l.code),
  );
  const statuses = computeLessonStatuses(mlessons, counts, perLesson, unlockedTestLessons);
  const st = statuses.find((s) => s.code === lessonCode);
  if (!st || st.unlocked) return;

  const err = new AuthorizationError(
    st.needsTestCode
      ? 'Buổi kiểm tra này cần mã mở khoá từ giáo viên.'
      : 'Bạn cần hoàn thành buổi học trước đó (đạt yêu cầu điểm) trước khi mở buổi này.',
  );
  err.code = st.needsTestCode ? 'TEST_CODE_REQUIRED' : 'LESSON_LOCKED';
  throw err;
}

async function getLesson(code, userId) {
  const lesson = await WT1Lesson.findOne({ code, published: true }).lean();
  if (!lesson) return null;
  await assertLessonUnlocked(userId, code);
  const exercises = await WT1Exercise.find({ lessonCode: code, published: true }).sort({ order: 1 }).lean();
  const subs = await WT1Submission.find({ userId, exerciseCode: { $in: exercises.map((e) => e.code) }, status: { $ne: 'draft' } })
    .select('exerciseCode score maxScore aiFeedback status createdAt').sort({ createdAt: -1 }).lean();
  const lastByCode = {};
  for (const s of subs) if (!lastByCode[s.exerciseCode]) lastByCode[s.exerciseCode] = s;
  // Needed only to gate gap_fill's drag-drop word bank (Speaking course) vs
  // free typing (every other course) in sanitizeExercise — see COURSES above.
  const mod = await WT1Module.findOne({ code: lesson.moduleCode }).select('courseCode').lean();
  const courseCode = (mod && mod.courseCode) || COURSE_CODE;

  return {
    lesson: {
      code: lesson.code, moduleCode: lesson.moduleCode, title: lesson.title, titleEn: lesson.titleEn,
      order: lesson.order, isTest: !!lesson.isTest, durationMinutes: lesson.durationMinutes,
      objectives: lesson.objectives || [], keyLanguage: lesson.keyLanguage || [],
      totalPoints: lesson.totalPoints,
    },
    exercises: exercises.map((ex) => {
      const s = sanitizeExercise(ex, courseCode);
      const last = lastByCode[ex.code];
      s.lastAttempt = last ? { score: last.score ?? null, hasAi: !!last.aiFeedback, at: last.createdAt } : null;
      return s;
    }),
  };
}

// ── submission ───────────────────────────────────────────────────────
async function _recompute(userId, lessonCode) {
  const exs = await WT1Exercise.find({ lessonCode, published: true }).select('code type').lean();
  const codeType = Object.fromEntries(exs.map((e) => [e.code, e.type]));
  const subs = await WT1Submission.find({ userId, exerciseCode: { $in: exs.map((e) => e.code) }, status: { $ne: 'draft' } })
    .select('exerciseCode score status').lean();
  const best = {};
  for (const s of subs) if (!best[s.exerciseCode] || (s.score || 0) > (best[s.exerciseCode].score || 0)) best[s.exerciseCode] = s;

  const doneCodes = Object.keys(best);
  const objScores = doneCodes.filter((c) => grading.OBJECTIVE_TYPES.has(codeType[c])).map((c) => best[c].score || 0);
  const writingSubmissions = doneCodes.filter((c) => !grading.OBJECTIVE_TYPES.has(codeType[c])).length;
  const objectiveScorePercent = objScores.length ? Math.round(objScores.reduce((a, b) => a + b, 0) / objScores.length) : 0;
  const allDone = exs.length > 0 && doneCodes.length >= exs.length;

  const lesson = await WT1Lesson.findOne({ code: lessonCode }).select('gate moduleCode').lean();
  const g = gateDefaults(lesson && lesson.gate);
  const met = objectiveScorePercent >= g.minObjectiveScorePercent && writingSubmissions >= g.minWritingSubmissions;
  const mod = lesson && await WT1Module.findOne({ code: lesson.moduleCode }).select('courseCode').lean();
  const courseCode = (mod && mod.courseCode) || COURSE_CODE;

  await WT1Progress.findOneAndUpdate(
    { userId, lessonCode },
    {
      $set: {
        courseCode, completedExercises: doneCodes,
        objectiveScorePercent, writingSubmissions, unlocked: met,
        completedAt: allDone ? new Date() : null,
      },
    },
    { upsert: true },
  );
}

async function recordSubmission(userId, exercise, payload) {
  const last = await WT1Submission.findOne({ userId, exerciseCode: exercise.code })
    .sort({ attempt: -1 }).select('attempt').lean();
  const attempt = (last?.attempt || 0) + 1;

  const doc = {
    userId, exerciseCode: exercise.code, lessonCode: exercise.lessonCode, attempt,
    status: 'graded',
    ...payload, // { answers, score, maxScore } | { responses, score } | { responses, aiFeedback }
  };
  const saved = await WT1Submission.create(doc);
  await _recompute(userId, exercise.lessonCode);
  return saved;
}

// One item (sub-question) of a multi-item speaking_response exercise has
// just been recorded and AI-graded (by the caller, via speakingService —
// this function only persists the already-graded result, it never calls
// Gemini itself). Accumulates into an in-progress ('draft') WT1Submission
// for this exercise; once every item has a result, computes the aggregate
// (averaged 4-criteria scores, merged corrections) FROM THE SERVER'S OWN
// STORED itemResults — never from client-supplied numbers, so a tampered
// client can't fake a band score by editing a "finalize" payload — marks
// the submission 'graded', and runs the normal gate recompute exactly like
// recordSubmission does.
//
// itemIndex === 0 always starts a FRESH draft (a new attempt number, same
// as recordSubmission) rather than resuming any stale one — resuming a
// half-finished recording across a lost session/reload is out of scope;
// the student just starts that exercise over from item 1. Any other index
// pushes into the current draft, falling back to starting fresh if none
// exists (e.g. the client reloaded mid-sequence and skipped item 0).
//
// Returns the aggregate feedback object (same shape speakingService.
// gradeSpeaking returns, so the frontend can reuse showSpeakingFeedback
// unchanged for the finished-exercise summary screen) once `itemPayload`
// completes the set, or null while items are still outstanding.
async function recordSpeakingItem(userId, exercise, itemIndex, itemPayload, totalItems) {
  async function startFreshDraft() {
    const last = await WT1Submission.findOne({ userId, exerciseCode: exercise.code })
      .sort({ attempt: -1 }).select('attempt').lean();
    return WT1Submission.create({
      userId, exerciseCode: exercise.code, lessonCode: exercise.lessonCode,
      attempt: (last?.attempt || 0) + 1, status: 'draft', itemResults: [itemPayload],
    });
  }

  let doc;
  if (itemIndex === 0) {
    doc = await startFreshDraft();
  } else {
    doc = await WT1Submission.findOneAndUpdate(
      { userId, exerciseCode: exercise.code, status: 'draft' },
      { $push: { itemResults: itemPayload } },
      { sort: { attempt: -1 }, new: true },
    );
    if (!doc) doc = await startFreshDraft();
  }

  if (doc.itemResults.length < totalItems) return null;

  const KEYS = ['fluency', 'vocabulary', 'grammar', 'pronunciation'];
  const results = doc.itemResults;
  const scores = {};
  for (const k of KEYS) scores[k] = results.reduce((s, r) => s + (Number(r.feedback?.scores?.[k]) || 0), 0) / results.length;
  const bandEstimate = Math.round(((scores.fluency + scores.vocabulary + scores.grammar + scores.pronunciation) / 4) * 2) / 2;
  const corrections = results.flatMap((r) => r.feedback?.corrections || []);
  const feedbackVi = results
    .map((r, i) => (r.feedback?.feedbackVi ? `Câu ${i + 1}: ${r.feedback.feedbackVi}` : ''))
    .filter(Boolean).join(' ');
  const strengths = results.flatMap((r) => r.feedback?.strengths || []);
  const improvements = results.flatMap((r) => r.feedback?.improvements || []);

  doc.status = 'graded';
  doc.responses = results.map((r) => r.transcript || '');
  doc.aiFeedback = { model: 'gemini', scores, bandEstimate, feedbackVi, corrections };
  await doc.save();
  await _recompute(userId, exercise.lessonCode);

  return {
    fluency: scores.fluency, vocabulary: scores.vocabulary, grammar: scores.grammar, pronunciation: scores.pronunciation,
    overallBand: bandEstimate, overallFeedback: feedbackVi, strengths, improvements,
    mistakes: corrections.map((c) => ({ original: c.original, corrected: c.corrected, reason: c.note })),
  };
}

// List of past attempts for ONE exercise (newest first) — powers the
// "Lịch sử" button on the exercise runner. Summary fields only (score,
// band if AI-graded, date); a row's full detail (answers/responses/full
// aiFeedback) is fetched on demand via the existing getAttemptDetail/
// GET /wt1/attempt/:id, same as clicking into one attempt already works.
async function getExerciseHistory(userId, exerciseCode, limit = 50) {
  const subs = await WT1Submission.find({ userId, exerciseCode, status: { $ne: 'draft' } })
    .select('attempt score maxScore status aiFeedback.bandEstimate createdAt')
    .sort({ attempt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 50, 1), 200))
    .lean();
  return subs.map((s) => ({
    id: s._id, attempt: s.attempt, score: s.score ?? null, maxScore: s.maxScore ?? null,
    band: s.aiFeedback?.bandEstimate ?? null, status: s.status, createdAt: s.createdAt,
  }));
}

async function getAttemptDetail(userId, id) {
  if (!mongoose.isValidObjectId(id)) return null;
  const sub = await WT1Submission.findOne({ _id: id, userId }).lean();
  if (!sub) return null;
  const ex = await WT1Exercise.findOne({ code: sub.exerciseCode }).lean();
  return { submission: sub, exercise: ex ? sanitizeExercise(ex) : null };
}

async function getProgress(userId) {
  const rows = await WT1Progress.find({ userId }).lean();
  return rows.map((r) => ({
    lessonCode: r.lessonCode, completed: (r.completedExercises || []).length,
    objectiveScorePercent: r.objectiveScorePercent || 0, writingSubmissions: r.writingSubmissions || 0,
    unlocked: !!r.unlocked, completedAt: r.completedAt || null,
  }));
}

module.exports = {
  COURSE_CODE, sanitizeExercise, gateDefaults,
  getOverview, getLesson, recordSubmission, recordSpeakingItem, getAttemptDetail, getExerciseHistory, getProgress,
  assertLessonUnlocked,
};
