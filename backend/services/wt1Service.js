'use strict';

// WT1 course service — the mini-LMS over WT1Course/Module/Lesson/Exercise.
// Reads: overview (modules → lessons with done/unlocked/score), one lesson
// (+ sanitized exercises), submission recording + per-lesson progress, and
// one saved attempt for review. Gate is SOFT: `unlocked` is computed and
// returned but getLesson never blocks on it.
const mongoose = require('mongoose');
const WT1Course = require('../models/WT1Course');
const WT1Module = require('../models/WT1Module');
const WT1Lesson = require('../models/WT1Lesson');
const WT1Exercise = require('../models/WT1Exercise');
const WT1Submission = require('../models/WT1Submission');
const WT1Progress = require('../models/WT1Progress');
const grading = require('./wt1GradingService');

const COURSE_CODE = 'IELTS-W-T1';
// The WT1 stack is course-agnostic — the same models / routes / grading /
// page shell serve every "writing course". Add a code here to spin up a new
// one (currently: Task 1 Writing + Task 2 Writing). Anything not in this set
// falls back to Task 1.
const COURSES = new Set(['IELTS-W-T1', 'IELTS-W-T2']);
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
function sanitizeExercise(ex) {
  const rubric = ex.rubric
    ? {
      minWords: ex.rubric.minWords, maxWords: ex.rubric.maxWords,
      mustUse: ex.rubric.mustUse, targetStructures: ex.rubric.targetStructures || [],
      targetVocab: ex.rubric.targetVocab || [], checklist: ex.rubric.checklist || [],
      scoring: ex.rubric.scoring || [], bandFocus: ex.rubric.bandFocus || [],
    }
    : undefined;

  const items = (ex.items || []).map((it) => {
    const base = { id: it.id, prompt: it.prompt };
    if (ex.type === 'mcq') base.options = it.options || [];
    if (ex.type === 'gap_fill') base.blankCount = (String(it.prompt || '').match(/____/g) || []).length;
    if (ex.type === 'sentence_transform') { base.cue = it.cue || ''; base.starter = it.starter || ''; }
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
    stimulus: ex.stimulus || null, wordBank: ex.wordBank || [],
    categories: ex.categories || [], responseSlots: ex.responseSlots || 0,
    items, rubric,
  };
  if (ex.type === 'matching') {
    out.rightOptions = shuffle((ex.items || []).map((it) => it.right).filter(Boolean));
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

  const subs = await WT1Submission.find({ userId }).select('exerciseCode score maxScore aiFeedback status').lean();
  const perLesson = summariseSubmissions(
    subs.map((s) => ({ ...s, lessonCode: lessonCodesByExercise[s.exerciseCode] })),
    lessonCodesByExercise, { typeByCode },
  );

  const lessonsByModule = {};
  for (const l of lessons) {
    (lessonsByModule[l.moduleCode] = lessonsByModule[l.moduleCode] || []).push(l);
  }

  const outModules = modules.map((m) => {
    const mlessons = (lessonsByModule[m.code] || []).sort((a, b) => a.order - b.order);
    let prevMetGate = true; // first lesson of a module is always unlocked
    const outLessons = mlessons.map((l) => {
      const cnt = counts[l.code] || { count: 0 };
      const sum = perLesson[l.code] || { doneCodes: new Set(), objScores: [], writingCount: 0 };
      const doneCount = sum.doneCodes.size;
      const done = cnt.count > 0 && doneCount >= cnt.count;
      const objAvg = sum.objScores.length
        ? Math.round(sum.objScores.reduce((x, y) => x + y, 0) / sum.objScores.length) : 0;
      const g = gateDefaults(l.gate);
      const metGate = objAvg >= g.minObjectiveScorePercent && sum.writingCount >= g.minWritingSubmissions;
      const unlocked = prevMetGate;          // this lesson is unlocked if the previous one met its gate
      prevMetGate = metGate;                 // …and it, in turn, unlocks the next one when its own gate is met
      return {
        code: l.code, title: l.title, titleEn: l.titleEn, order: l.order,
        isTest: !!l.isTest, exerciseCount: cnt.count, doneCount,
        objectives: l.objectives || [], durationMinutes: l.durationMinutes,
        done, scorePercent: objAvg, unlocked,
      };
    });
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

async function getLesson(code, userId) {
  const lesson = await WT1Lesson.findOne({ code, published: true }).lean();
  if (!lesson) return null;
  const exercises = await WT1Exercise.find({ lessonCode: code, published: true }).sort({ order: 1 }).lean();
  const subs = await WT1Submission.find({ userId, exerciseCode: { $in: exercises.map((e) => e.code) } })
    .select('exerciseCode score maxScore aiFeedback status createdAt').sort({ createdAt: -1 }).lean();
  const lastByCode = {};
  for (const s of subs) if (!lastByCode[s.exerciseCode]) lastByCode[s.exerciseCode] = s;

  return {
    lesson: {
      code: lesson.code, moduleCode: lesson.moduleCode, title: lesson.title, titleEn: lesson.titleEn,
      order: lesson.order, isTest: !!lesson.isTest, durationMinutes: lesson.durationMinutes,
      objectives: lesson.objectives || [], keyLanguage: lesson.keyLanguage || [],
      totalPoints: lesson.totalPoints,
    },
    exercises: exercises.map((ex) => {
      const s = sanitizeExercise(ex);
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
  const subs = await WT1Submission.find({ userId, exerciseCode: { $in: exs.map((e) => e.code) } })
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
  getOverview, getLesson, recordSubmission, getAttemptDetail, getProgress,
};
