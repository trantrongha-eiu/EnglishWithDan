'use strict';

// Single source of truth for "which existing site resources can a teacher
// assign, and has this student completed one" — used by the assignments
// feature so it never copies content and never re-implements completion
// per resource type.
//
// REGISTRY maps a resourceType to:
//   catalog     : the content model + how to turn a doc into { _id, label, meta }
//   attempt     : the attempt model + the (userField, idField, filter) that
//                 means "this student did this resource"
// `mock_test` is special — it has no catalog id (each MockTestAttempt bundles
// a random set), so it's a single synthetic catalog entry and completion is
// "any completed MockTestAttempt since the assignment was created".

const mongoose = require('mongoose');

const ReadingTest = require('../models/ReadingTest');
const ListeningTest = require('../models/ListeningTest');
const Passage = require('../models/Passage');
const ListeningSection = require('../models/ListeningSection');
const WritingExam = require('../models/WritingExam');
const WritingTask1 = require('../models/WritingTask1');
const WritingTask2 = require('../models/WritingTask2');
const Task2Topic = require('../models/Task2Topic');
const SpeakingQuestion = require('../models/SpeakingQuestion');
const EssentialGrammarLesson = require('../models/EssentialGrammarLesson');
const VocabularyLesson = require('../models/VocabularyLesson');
const WT1Lesson = require('../models/WT1Lesson');
const WT1Module = require('../models/WT1Module');
const SentenceStructureGroup = require('../models/SentenceStructureGroup');

const TestAttempt = require('../models/TestAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const ReadingPracticeAttempt = require('../models/ReadingPracticeAttempt');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');
const DictationAttempt = require('../models/DictationAttempt');
const WritingAttempt = require('../models/WritingAttempt');
const Task2Attempt = require('../models/Task2Attempt');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const EssentialGrammarAttemptLog = require('../models/EssentialGrammarAttemptLog');
const VocabularyLessonAttemptLog = require('../models/VocabularyLessonAttemptLog');
const MockTestAttempt = require('../models/MockTestAttempt');
const WT1Progress = require('../models/WT1Progress');
const AdvSentenceAttempt = require('../models/AdvSentenceAttempt');

const { escapeRegex } = require('../utils/strings');

// A homework item is "hoàn thành" only once the student clears this % — for
// resource types that HAVE a clean score/total (quiz-style: reading/listening
// tests & practice, dictation, task2, grammar, vocabulary lessons). AI/band-
// graded skills (writing_exam, mock_test — IELTS band 0–9, not a %) have no
// `scoreGate` below and keep the old "submitted = done" rule; a 70%-of-9
// cutoff would be an arbitrary, undiscussed pass mark for those. `speaking`
// uses `bandGate` instead (see MIN_SPEAKING_BAND) since it has a real band.
const PASS_PERCENT = 70;

// Writing tasks have no score to gate on, but DO have a real pass/fail bar
// students already see on the page itself (writing.html's "Tối thiểu 150/250
// từ") — completion requires actually meeting it, not just clicking submit.
// Fixed site-wide minimums (not stored per-prompt on WritingTask1/2 — their
// `instructions` field is free text) matching the standard IELTS requirement.
const MIN_WORDS = { task1: 150, task2: 250 };

// Speaking is AI-graded on the real IELTS 0–9 band scale (SpeakingAttempt.
// aiFeedback.overallBand), so unlike writing_exam/mock_test it CAN gate on a
// real pass bar instead of "submitted = done": a recording that's just
// silence/gibberish still gets analyzed and shouldn't count as "hoàn thành".
const MIN_SPEAKING_BAND = 5;

const REGISTRY = {
  reading_test: {
    label: 'Bộ đề Reading',
    catalog: { model: ReadingTest, filter: { isActive: true }, sort: { testNumber: -1 },
      shape: (d) => ({ _id: d._id, label: d.name, meta: `Test ${d.testNumber}` }) },
    attempt: { model: TestAttempt, userField: 'userId', idField: 'testId', filter: { status: 'completed' } },
    scoreGate: { fields: 'correctCount totalQuestions', percent: (d) => (d.totalQuestions ? (d.correctCount / d.totalQuestions) * 100 : 0) },
  },
  listening_test: {
    label: 'Đề Listening',
    catalog: { model: ListeningTest, filter: { isActive: true }, sort: { testNumber: -1 },
      shape: (d) => ({ _id: d._id, label: d.name, meta: `Test ${d.testNumber}` }) },
    attempt: { model: ListeningAttempt, userField: 'userId', idField: 'testId', filter: { status: 'completed' } },
    scoreGate: { fields: 'correctCount totalQuestions', percent: (d) => (d.totalQuestions ? (d.correctCount / d.totalQuestions) * 100 : 0) },
  },
  reading_practice: {
    label: 'Bài đọc lẻ (Passage)',
    catalog: { model: Passage, filter: { isActive: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: d.category }) },
    attempt: { model: ReadingPracticeAttempt, userField: 'userId', idField: 'passageId', filter: {} },
    scoreGate: { fields: 'correctCount totalQuestions', percent: (d) => (d.totalQuestions ? (d.correctCount / d.totalQuestions) * 100 : 0) },
  },
  listening_practice: {
    label: 'Bài nghe lẻ (Section)',
    catalog: { model: ListeningSection, filter: { isActive: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: d.partNumber ? `Part ${d.partNumber}` : '' }) },
    attempt: { model: ListeningPracticeAttempt, userField: 'userId', idField: 'sectionId', filter: {} },
    scoreGate: { fields: 'correctCount totalQuestions', percent: (d) => (d.totalQuestions ? (d.correctCount / d.totalQuestions) * 100 : 0) },
  },
  dictation: {
    label: 'Dictation (Section)',
    catalog: { model: ListeningSection, filter: { isActive: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: 'Dictation' }) },
    attempt: { model: DictationAttempt, userField: 'userId', idField: 'sectionId', filter: {} },
    scoreGate: { fields: 'correctCount totalSentences', percent: (d) => (d.totalSentences ? (d.correctCount / d.totalSentences) * 100 : 0) },
  },
  writing_exam: {
    label: 'Đề Writing (Full Task 1+2)',
    catalog: { model: WritingExam, filter: { isActive: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: d.name, meta: '' }) },
    attempt: { model: WritingAttempt, userField: 'userId', idField: 'examId', filter: {} },
    // No score gate (AI-graded band, not a %) — but a submission only counts
    // once BOTH tasks meet their real minimum word count, not just "clicked
    // submit" (an exam attempt always carries both wordCount1 and wordCount2).
    wordCountGate: {
      fields: 'wordCount1 wordCount2',
      ok: (d) => (d.wordCount1 || 0) >= MIN_WORDS.task1 && (d.wordCount2 || 0) >= MIN_WORDS.task2,
    },
  },
  // Standalone "Chọn đề Task 1/2" practice prompts (writing.html) — distinct
  // from writing_exam (the timed full Task1+2 exam) and task1_lesson (the
  // structured WT1 course). No score gate (AI-graded IELTS band 0–9, same as
  // speaking — see PASS_PERCENT's comment), but wordCountGate below still
  // requires actually meeting the task's real minimum, not just submitting.
  task1_practice: {
    label: 'Task 1 Writing (Đề lẻ)',
    catalog: { model: WritingTask1, filter: { isActive: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: String(d.prompt || '').replace(/\s+/g, ' ').trim().slice(0, 90), meta: '' }) },
    attempt: { model: WritingAttempt, userField: 'userId', idField: 'task1Id', filter: { submissionType: 'practice' } },
    wordCountGate: { fields: 'wordCount1', ok: (d) => (d.wordCount1 || 0) >= MIN_WORDS.task1 },
  },
  task2_practice: {
    label: 'Task 2 Writing (Đề lẻ)',
    catalog: { model: WritingTask2, filter: { isActive: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: String(d.prompt || '').replace(/\s+/g, ' ').trim().slice(0, 90), meta: '' }) },
    attempt: { model: WritingAttempt, userField: 'userId', idField: 'task2Id', filter: { submissionType: 'practice' } },
    wordCountGate: { fields: 'wordCount2', ok: (d) => (d.wordCount2 || 0) >= MIN_WORDS.task2 },
  },
  task2: {
    label: 'Task 2 Writing (Topic)',
    // task2-practice.html only jumps straight to a topic when it has BOTH
    // ?week & ?topicId (loadWeeks: `if (urlWeek && urlTopicId)`), so snapshot
    // the week into resourceCode at assign time — same pattern as
    // advanced_sentences. Without this the homework "Bắt đầu" link had no
    // params and just dumped the student on the week picker.
    catalog: { model: Task2Topic, filter: { isActive: true }, sort: { week: 1, orderIndex: 1 },
      shape: (d) => ({ _id: d._id, label: d.topicName, meta: d.week ? `Week ${d.week}` : '' }),
      deepLinkKey: (d) => String(d.week || '') },
    attempt: { model: Task2Attempt, userField: 'userId', idField: 'topicId', filter: {} },
    scoreGate: {
      fields: 'correctCount totalQuestions scorePercentage',
      percent: (d) => (d.scorePercentage != null ? d.scorePercentage : (d.totalQuestions ? (d.correctCount / d.totalQuestions) * 100 : 0)),
    },
    // A partial session (do 2 easy questions, hit "Xem kết quả") posts an
    // attempt whose scorePercentage is 2/2 = 100% — enough to clear the
    // scoreGate above even though the student never did the topic. Require
    // the passing attempt to also have covered most of the topic's
    // questions in one sitting. `arrayField` is the question bank on the
    // catalog doc; `minRatio` of it must be present in attempt.totalQuestions.
    coverage: { model: Task2Topic, arrayField: 'questions', field: 'totalQuestions', minRatio: 0.8 },
  },
  speaking: {
    label: 'Speaking (Câu hỏi)',
    catalog: { model: SpeakingQuestion, filter: { isActive: true }, sort: { part: 1, createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: `Part ${d.part}: ${String(d.question || '').slice(0, 70)}`, meta: d.topic || '' }) },
    attempt: { model: SpeakingAttempt, userField: 'userId', idField: 'questionId', filter: {} },
    // "Hoàn thành" requires the AI grading to have actually finished AND
    // scored at least MIN_SPEAKING_BAND — a 'pending'/'error' attempt (still
    // grading, or the AI call failed) or a low-band recording doesn't count.
    bandGate: {
      fields: 'status aiFeedback.overallBand',
      ok: (d) => d.status === 'analyzed' && Number(d?.aiFeedback?.overallBand || 0) >= MIN_SPEAKING_BAND,
    },
  },
  grammar: {
    label: 'Essential Grammar',
    catalog: { model: EssentialGrammarLesson, filter: { isActive: true }, sort: { orderIndex: 1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: '' }) },
    attempt: { model: EssentialGrammarAttemptLog, userField: 'userId', idField: 'lessonId', filter: {} },
    scoreGate: { fields: 'correct total', percent: (d) => (d.total ? (d.correct / d.total) * 100 : 0) },
  },
  vocabulary_lesson: {
    label: 'Vocabulary Lessons',
    catalog: { model: VocabularyLesson, filter: {}, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: [d.difficulty, d.targetClass && `Lớp ${d.targetClass}`].filter(Boolean).join(' · ') }) },
    attempt: { model: VocabularyLessonAttemptLog, userField: 'userId', idField: 'lessonId', filter: {} },
    scoreGate: { fields: 'correct total', percent: (d) => (d.total ? (d.correct / d.total) * 100 : 0) },
  },
  mock_test: {
    label: 'Thi thử 4 kỹ năng',
    catalog: null, // synthetic — a single pickable entry, no id
    attempt: { model: MockTestAttempt, userField: 'userId', idField: null, filter: { status: 'completed' } },
  },
  task1_lesson: {
    label: 'Writing Task 1 (Buổi học)',
    // WT1Lesson's real Mongo _id is used as the assignment's resourceId (so
    // it fits the same ObjectId-keyed schema every other type uses), but the
    // course itself tracks progress by `code` — a re-seeding-safe id, not
    // _id (see WT1Lesson.js/WT1Progress.js) — and that's also what the
    // student-facing deep link (writing-task1.html?lesson=<code>) needs.
    // deepLinkKey lets the controller snapshot that at assign time
    // (Assignment.resources[].resourceCode) without every other type's
    // labelFor/resourceExists plumbing having to know about it.
    // courseScope: the WT2 and Speaking courses reuse this exact stack and
    // their lessons live in the SAME WT1Lesson collection (see wt1Service
    // COURSES) — without scoping, the picker would list all three and a
    // "Buổi 1" from Speaking would deep-link into writing-task1.html.
    // WT1Lesson has no courseCode of its own; it's only reachable through
    // WT1Module.courseCode, so the scope is resolved to a moduleCode $in.
    catalog: { model: WT1Lesson, filter: { published: true }, courseScope: 'IELTS-W-T1',
      sort: { moduleCode: 1, order: 1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: d.isTest ? 'Test' : (d.moduleCode || '') }),
      deepLinkKey: (d) => d.code },
    // No score gate: a lesson mixes objective (quiz) AND AI-graded essay
    // exercises, so a single % doesn't apply the way it does to a pure quiz
    // — instead this reuses WT1Progress.completedAt, which the WT1 course's
    // own service already only sets once EVERY exercise in the lesson has
    // been attempted (wt1Service.js's _recompute/allDone).
    attempt: { model: WT1Progress, custom: true },
  },
  // The WT2 and Speaking "khóa học" pages (writing-task2-course.html /
  // speaking-course.html) are the SAME multi-tier stack as task1_lesson —
  // their lessons live in WT1Lesson, progress in WT1Progress (by lessonCode,
  // course-agnostic) — just a different courseScope and a different
  // student-facing page for the deep link. checkCompleted's `custom` branch
  // is already course-agnostic so nothing there needs to change.
  task2_course_lesson: {
    label: 'Writing Task 2 (Buổi học)',
    catalog: { model: WT1Lesson, filter: { published: true }, courseScope: 'IELTS-W-T2',
      sort: { moduleCode: 1, order: 1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: d.isTest ? 'Test' : (d.moduleCode || '') }),
      deepLinkKey: (d) => d.code },
    attempt: { model: WT1Progress, custom: true },
  },
  speaking_course_lesson: {
    label: 'Speaking (Buổi học)',
    catalog: { model: WT1Lesson, filter: { published: true }, courseScope: 'IELTS-SPEAKING',
      sort: { moduleCode: 1, order: 1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: d.isTest ? 'Test' : (d.moduleCode || '') }),
      deepLinkKey: (d) => d.code },
    attempt: { model: WT1Progress, custom: true },
  },
  // "Viết câu nâng cao" (advanced-sentences.html) — one pickable row per
  // SentenceStructureGroup (a "cấu trúc", 2 per week). AdvSentenceAttempt
  // mirrors Task2Attempt field-for-field, so the scoreGate is the same shape
  // as `task2`. The student page needs BOTH ?week & ?groupId (it won't open a
  // group without the week), so deepLinkKey snapshots the week number into
  // resourceCode and the client builds ?week=<code>&groupId=<id>.
  advanced_sentences: {
    label: 'Viết câu nâng cao',
    catalog: { model: SentenceStructureGroup, filter: { isActive: true }, sort: { week: 1, order: 1 },
      shape: (d) => ({ _id: d._id, label: d.nameVi, meta: d.week ? `Tuần ${d.week}` : '' }),
      deepLinkKey: (d) => String(d.week || '') },
    attempt: { model: AdvSentenceAttempt, userField: 'userId', idField: 'groupId', filter: {} },
    scoreGate: {
      fields: 'correctCount totalQuestions scorePercentage',
      percent: (d) => (d.scorePercentage != null ? d.scorePercentage : (d.totalQuestions ? (d.correctCount / d.totalQuestions) * 100 : 0)),
    },
    // Same subset-gaming guard as `task2` — jumping to the last sentence and
    // answering just that one posts a 1/1 = 100% attempt otherwise.
    coverage: { model: SentenceStructureGroup, arrayField: 'sentences', field: 'totalQuestions', minRatio: 0.8 },
  },
};

const TYPES = Object.keys(REGISTRY);

function isValidType(t) {
  return Object.prototype.hasOwnProperty.call(REGISTRY, t);
}

// Teacher resource picker. Returns [{ _id, label, meta }]. For mock_test,
// one synthetic row with _id null. `extraFilters` (e.g. { part, topic } for
// 'speaking') is merged straight into the Mongo query — harmless for types
// whose catalog model has no such field (no doc has a stray null-only path
// to spuriously match), so callers only ever pass it for the types they
// know support it (see getResourceCatalog).
// WT1Lesson (and the WT2/Speaking courses that share its collection) carries
// no courseCode — resolve a course to the set of its module codes so a
// `moduleCode $in [...]` clause can scope a lesson query to one course.
async function wt1ModuleCodesForCourse(courseCode) {
  const mods = await WT1Module.find({ courseCode }).select('code').lean();
  return mods.map((m) => m.code);
}

async function listCatalog(type, search = '', limit = 100, extraFilters = {}) {
  const entry = REGISTRY[type];
  if (!entry) return [];
  if (!entry.catalog) {
    return [{ _id: null, label: entry.label, meta: 'Đề ngẫu nhiên mỗi lần làm' }];
  }
  const q = { ...entry.catalog.filter, ...extraFilters };
  if (entry.catalog.courseScope) {
    q.moduleCode = { $in: await wt1ModuleCodesForCourse(entry.catalog.courseScope) };
  }
  if (search && search.trim()) {
    const re = new RegExp(escapeRegex(search.trim()), 'i');
    // every catalog model has one of these text fields — `prompt` for
    // WritingTask1/2 (task1_practice/task2_practice), which have no name/
    // title/question field at all.
    q.$or = [{ name: re }, { title: re }, { topicName: re }, { question: re }, { prompt: re },
      { nameVi: re }, { nameEn: re }]; // nameVi/En: SentenceStructureGroup (advanced_sentences)
  }
  const docs = await entry.catalog.model.find(q)
    .sort(entry.catalog.sort)
    .limit(Math.min(Number(limit) || 100, 300))
    .lean();
  return docs.map(entry.catalog.shape);
}

// Verify an internal resource id really exists for its type — called before
// an assignment is saved so a client can't attach a bogus/foreign id.
async function resourceExists(type, resourceId) {
  const entry = REGISTRY[type];
  if (!entry) return false;
  if (!entry.catalog) return resourceId == null; // mock_test: only the null id is valid
  if (!mongoose.isValidObjectId(resourceId)) return false;
  const scope = {};
  if (entry.catalog.courseScope) {
    scope.moduleCode = { $in: await wt1ModuleCodesForCourse(entry.catalog.courseScope) };
  }
  return !!(await entry.catalog.model.exists({ _id: resourceId, ...entry.catalog.filter, ...scope }));
}

async function labelFor(type, resourceId) {
  const entry = REGISTRY[type];
  if (!entry) return '';
  if (!entry.catalog) return entry.label;
  const doc = await entry.catalog.model.findById(resourceId).lean();
  return doc ? entry.catalog.shape(doc).label : '';
}

// For the few types whose student-facing deep link isn't keyed by resourceId
// (task1_lesson links by WT1Lesson.code) — snapshotted onto
// Assignment.resources[].resourceCode at assign time, same pattern as label.
// '' for every other type.
async function deepLinkKeyFor(type, resourceId) {
  const entry = REGISTRY[type];
  if (!entry || !entry.catalog || !entry.catalog.deepLinkKey) return '';
  const doc = await entry.catalog.model.findById(resourceId).lean();
  return doc ? entry.catalog.deepLinkKey(doc) : '';
}

// key used to match an assignment resource against a completion result
function resourceKey(type, resourceId) {
  return `${type}:${resourceId || '*'}`;
}

/**
 * Batch completion check.
 * @param {ObjectId} studentId
 * @param {{resourceType, resourceId}[]} internalItems
 * @param {Date} [since] only count completions at/after this time
 * @returns {Promise<Map<string, {completed, completedAt, attemptId}>>} keyed by
 *   resourceKey(); `completedAt` is the student's LATEST attempt at that
 *   resource — so a caller comparing it against an assignment's createdAt
 *   correctly detects a completion done after the assignment even when the
 *   student had also done the same resource earlier.
 */
async function checkCompleted(studentId, internalItems, since = null) {
  const out = new Map();
  if (!internalItems || !internalItems.length) return out;

  // group ids by type
  const byType = new Map();
  for (const it of internalItems) {
    if (!isValidType(it.resourceType)) continue;
    if (!byType.has(it.resourceType)) byType.set(it.resourceType, new Set());
    if (it.resourceId) byType.get(it.resourceType).add(String(it.resourceId));
    else byType.get(it.resourceType).add('*'); // mock_test
  }

  await Promise.all([...byType.entries()].map(async ([type, idSet]) => {
    const entry = REGISTRY[type];
    const A = entry.attempt;

    if (A.custom) {
      // task1_lesson: resourceId is WT1Lesson._id, but WT1Progress (the
      // completion record) is keyed by lessonCode, not an ObjectId ref — the
      // WT1 course intentionally never refs content by _id (re-seeding
      // safety, see WT1Lesson.js). Resolve _id -> code first, then query.
      const ids = [...idSet].filter((x) => x !== '*').map((x) => new mongoose.Types.ObjectId(x));
      if (!ids.length) return;
      const lessons = await WT1Lesson.find({ _id: { $in: ids } }).select('_id code').lean();
      const codeToId = new Map(lessons.map((l) => [l.code, String(l._id)]));
      const codes = [...codeToId.keys()];
      if (!codes.length) return;
      const filter = { userId: studentId, lessonCode: { $in: codes }, completedAt: since ? { $gte: since } : { $ne: null } };
      const rows = await A.model.find(filter).select('lessonCode completedAt').lean().catch(() => []);
      for (const r of rows) {
        const lid = codeToId.get(r.lessonCode);
        if (lid) out.set(resourceKey(type, lid), { completed: true, completedAt: r.completedAt });
      }
      return;
    }

    const base = { [A.userField]: studentId, ...A.filter };
    if (since) base.createdAt = { $gte: since };

    if (!A.idField) {
      // mock_test — the most recent completed run
      const doc = await A.model.findOne(base).sort({ createdAt: -1 }).select('_id createdAt').lean().catch(() => null);
      if (doc) out.set(resourceKey(type, null), { completed: true, completedAt: doc.createdAt, attemptId: String(doc._id) });
      return;
    }

    const ids = [...idSet].filter((x) => x !== '*').map((x) => new mongoose.Types.ObjectId(x));
    if (!ids.length) return;
    const gate = entry.scoreGate;
    const wcGate = entry.wordCountGate;
    const bandGate = entry.bandGate;
    const boolGate = wcGate || bandGate; // same "ok(r) -> pass/fail" shape as wordCountGate
    const cov = entry.coverage;
    const extraFields = gate ? gate.fields : (boolGate ? boolGate.fields : '');
    const select = `_id createdAt ${A.idField}`
      + (extraFields ? ` ${extraFields}` : '')
      + (cov && !(extraFields || '').includes(cov.field) ? ` ${cov.field}` : '');
    const rows = await A.model.find({ ...base, [A.idField]: { $in: ids } })
      .sort({ createdAt: -1 })
      .select(select)
      .lean()
      .catch(() => []);

    if (boolGate) {
      // Writing tasks (wordCountGate) / speaking (bandGate): "hoàn thành"
      // means at least one submission since `since` actually cleared the
      // real bar — not just any submission. rows is newest-first, so absent
      // a passing one, the most recent still-failing attempt is kept
      // (completed: false) purely for completedAt/attemptId display.
      const bestByKey = new Map();
      for (const r of rows) {
        const k = resourceKey(type, r[A.idField]);
        const passes = boolGate.ok(r);
        const prev = bestByKey.get(k);
        if (!prev || (passes && !prev.passes)) bestByKey.set(k, { passes, r });
      }
      for (const [k, { passes, r }] of bestByKey) {
        out.set(k, { completed: passes, completedAt: r.createdAt, attemptId: String(r._id) });
      }
      return;
    }

    if (!gate) {
      // No score threshold for this type (AI/band-graded — see PASS_PERCENT's
      // comment) — newest first + keep the first seen per resource id →
      // latest attempt wins, any submission counts as done.
      for (const r of rows) {
        const k = resourceKey(type, r[A.idField]);
        if (!out.has(k)) out.set(k, { completed: true, completedAt: r.createdAt, attemptId: String(r._id) });
      }
      return;
    }

    // Coverage gate (task2 / advanced_sentences): a passing attempt must also
    // have spanned most of the resource's question bank in one sitting, so a
    // cherry-picked 2-of-8 subset at 100% doesn't read as "hoàn thành".
    // covNeed maps resourceId -> minimum questions required.
    let covNeed = null;
    if (cov) {
      const covDocs = await cov.model.find({ _id: { $in: ids } }).select(cov.arrayField).lean().catch(() => []);
      covNeed = new Map(covDocs.map((d) => {
        const total = Array.isArray(d[cov.arrayField]) ? d[cov.arrayField].length : 0;
        return [String(d._id), total > 0 ? Math.max(1, Math.ceil(total * cov.minRatio)) : 0];
      }));
    }
    const coverageOk = (r) => {
      if (!covNeed) return true;
      const need = covNeed.get(String(r[A.idField]));
      if (!need) return true; // resource has no question bank / unknown — don't block
      return (Number(r[cov.field]) || 0) >= need;
    };

    // Score-gated: "hoàn thành" means the student cleared PASS_PERCENT on AT
    // LEAST ONE try since `since` — so a strong early attempt still counts
    // even if a later, unrelated retry scored lower (`completed`/
    // `scorePercent` below track the single best-scoring attempt per
    // resource id for that reason). `completedAt` is tracked SEPARATELY as
    // the latest passing attempt (rows is newest-first, so that's just the
    // first passing row seen per key) rather than the best-scoring one's
    // date — assignmentService.getStudentAssignments batches this call
    // across every one of a student's assignments with one shared `since`,
    // then re-checks the SAME map entry against each assignment's own
    // createdAt; if completedAt pointed at an early high-scoring attempt,
    // a later assignment (created after that attempt but before a second,
    // lower-but-still-passing retry) would wrongly read as incomplete even
    // though the student passed again after being assigned it.
    const bestByKey = new Map();
    const latestPassAtByKey = new Map();
    for (const r of rows) {
      const k = resourceKey(type, r[A.idField]);
      const pct = gate.percent(r);
      const passes = pct >= PASS_PERCENT && coverageOk(r);
      const prev = bestByKey.get(k);
      // A qualifying attempt always beats a non-qualifying one; between two of
      // the same kind, the higher score wins (keeps the old best-scoring pick).
      if (!prev || (passes && !prev.passes) || (passes === prev.passes && pct > prev.pct)) {
        bestByKey.set(k, { pct, r, passes });
      }
      if (passes && !latestPassAtByKey.has(k)) latestPassAtByKey.set(k, r.createdAt);
    }
    for (const [k, { pct, r, passes }] of bestByKey) {
      out.set(k, {
        completed: passes,
        completedAt: passes ? latestPassAtByKey.get(k) : r.createdAt,
        attemptId: String(r._id),
        scorePercent: Math.round(pct),
      });
    }
  }));

  return out;
}

module.exports = {
  REGISTRY, TYPES, isValidType, PASS_PERCENT,
  listCatalog, resourceExists, labelFor, deepLinkKeyFor, resourceKey, checkCompleted,
};
