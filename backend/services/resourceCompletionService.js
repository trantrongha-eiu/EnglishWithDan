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
const GapFillAttempt = require('../models/GapFillAttempt');
const WritingAttempt = require('../models/WritingAttempt');
const Task2Attempt = require('../models/Task2Attempt');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const EssentialGrammarAttemptLog = require('../models/EssentialGrammarAttemptLog');
const VocabularyLessonAttemptLog = require('../models/VocabularyLessonAttemptLog');
const MockTestAttempt = require('../models/MockTestAttempt');
const Task2LessonWork = require('../models/Task2LessonWork');
const WT1Progress = require('../models/WT1Progress');
const AdvSentenceAttempt = require('../models/AdvSentenceAttempt');
const { COUNTABLE_ATTEMPT } = require('./attemptVisibility');
const ShadowingLesson = require('../models/ShadowingLesson');
const ListeningTip = require('../models/ListeningTip');
const ReadingTip = require('../models/ReadingTip');
const WritingTip = require('../models/WritingTip');
const SpeakingTip = require('../models/SpeakingTip');
const VocabUnit = require('../models/VocabUnit');
const Task2Template = require('../models/Task2Template');
const Task2TemplateAttempt = require('../models/Task2TemplateAttempt');
const Task2TemplateProgress = require('../models/Task2TemplateProgress');
const WPTopic = require('../models/WPTopic');
const WPExercise = require('../models/WPExercise');
const WritingPracticeAttempt = require('../models/WritingPracticeAttempt');
const ContentView = require('../models/ContentView');
const Task1Exercise = require('../models/Task1Exercise');
const Task1Attempt = require('../models/Task1Attempt');

const { escapeRegex } = require('../utils/strings');

// A homework item is "hoàn thành" only once the student clears this % — for
// resource types that HAVE a clean score/total (quiz-style: reading/listening
// tests & practice, dictation, task2, grammar, vocabulary lessons). AI/band-
// graded skills (writing_exam, mock_test — IELTS band 0–9, not a %) have no
// `scoreGate` below and keep the old "submitted = done" rule; a 70%-of-9
// cutoff would be an arbitrary, undiscussed pass mark for those. `speaking`
// uses `bandGate` instead (see speakingAttemptCounts) — submission-based,
// but it must be a real spoken answer.
const PASS_PERCENT = 70;

// Single reading passages / listening sections ("bài đọc lẻ", "bài nghe lẻ")
// are short drills, not a full test — owner lowered their bar to 50%
// (2026-10-07). Full tests, dictation and the rest keep PASS_PERCENT.
const PRACTICE_PASS_PERCENT = 50;

// Listening Gap-fill (full-transcript fill-in-the-blank, GapFillAttempt): a
// section has ~25–40 blanks, so the bar is a count of correct blanks rather
// than a % — owner's rule "đúng ít nhất 18 câu / tổng câu". A section with
// fewer blanks than that needs every blank right.
const GAPFILL_MIN_CORRECT = 18;
function gapFillPasses(d) {
  const total = Number(d.totalBlanks) || 0;
  return total > 0 && (Number(d.correctCount) || 0) >= Math.min(GAPFILL_MIN_CORRECT, total);
}

// Writing tasks have no score to gate on, but DO have a real pass/fail bar
// students already see on the page itself (writing.html's "Tối thiểu 150/250
// từ") — completion requires actually meeting it, not just clicking submit.
// Fixed site-wide minimums (not stored per-prompt on WritingTask1/2 — their
// `instructions` field is free text) matching the standard IELTS requirement.
const MIN_WORDS = { task1: 150, task2: 250 };

// Speaking homework = "the student really answered", NOT a band pass mark —
// the owner's rule for AI/band-graded skills is "submission = done". The old
// band >= 5 bar meant most of a 6.0-target class (typical AI band 4) could
// never complete a speaking item. What still does NOT count:
//   - an analyzed attempt the grader scored 0 (silence / no usable speech),
//   - a recording with almost no words in the transcript,
//   - a still-'pending' one (grading not finished yet).
// An 'error' attempt (the AI call failed — e.g. the 14–15/09 grading outage,
// 220+ failed attempts with real 20–50-word transcripts) DOES count when the
// transcript shows a real answer: the failure was ours, not the student's.
const MIN_SPEAKING_WORDS = 15;
function speakingWordCount(transcript) {
  return String(transcript || '').split(/\s+/).filter(Boolean).length;
}
function speakingAttemptCounts(d) {
  if (speakingWordCount(d.transcript) < MIN_SPEAKING_WORDS) return false;
  if (d.status === 'analyzed') return Number(d?.aiFeedback?.overallBand || 0) > 0;
  return d.status === 'error';
}

// "Mở xem là xong" types — completion is any ContentView of the resource
// since the assignment (see models/ContentView.js for who records it).
function viewAttempt(type) {
  return { model: ContentView, userField: 'userId', idField: 'resourceId', filter: { resourceType: type } };
}
const VIEW_TYPES = ['shadowing', 'listening_tip', 'reading_tip', 'writing_tip', 'speaking_tip', 'vocab_unit'];

// Tips lessons are unique by (category, lessonKey) — the student pages take
// ?tip=<lessonKey>&tcat=<category>, so both go in the deep-link key.
function tipCatalog(model) {
  return { model, filter: { isActive: true }, sort: { orderIndex: 1, category: 1 },
    shape: (d) => ({ _id: d._id, label: d.title, meta: d.category || '' }),
    deepLinkKey: (d) => `${d.lessonKey}||${d.category}` };
}

// Task 2 Templates (task2-template.html), one essay type at one level.
// Done when BOTH hold:
//   1. the student finished all 5 steps of that type's practice path
//      (Task2TemplateProgress.steps — durable, may predate the assignment);
//   2. since the assignment, one whole-template recall run — step ④ "Ghép cả
//      bài" or the mock test, both saved with mode 'path' — got >= PASS_PERCENT
//      of ALL the template's sentences memorised.
// Attempts are keyed by (templateType, level), not the template's _id. A
// run's totalItems may be smaller than the template (a mock test submitted
// early), so the denominator is the larger of the two.
// Runs saved by the old separate modes (cloze/translation/…, before the
// 2026-10-28 practice-path redesign) keep the old rule — one run >= 70% —
// so homework already ticked that way stays ticked.
const T2_PATH_STEPS = ['warmup', 'read', 'drill', 'assemble', 'apply'];
const T2_RECALL_MODES = new Set(['path']);
const T2_LEGACY_MODES = new Set(['cloze', 'translation', 'chunks', 'build', 'dictation']);
async function checkTask2Templates(studentId, ids, since) {
  const out = new Map();
  const tpls = await Task2Template.find({ _id: { $in: ids } }).select('_id typeId level sections').lean();
  if (!tpls.length) return out;
  const typeIds = [...new Set(tpls.map((t) => t.typeId))];
  const q = { userId: studentId, templateType: { $in: typeIds } };
  if (since) q.createdAt = { $gte: since };
  const [rows, progress] = await Promise.all([
    Task2TemplateAttempt.find(q).sort({ createdAt: -1 })
      .select('_id templateType level mode totalItems correctItems createdAt').lean().catch(() => []),
    Task2TemplateProgress.find({ userId: studentId, typeId: { $in: typeIds } }).select('typeId level steps').lean().catch(() => []),
  ]);
  for (const t of tpls) {
    const level = t.level || 'band7';
    const itemCount = (t.sections || []).reduce((n, sec) => n + ((sec.items || []).length), 0);
    const prog = progress.find((p) => p.typeId === t.typeId && p.level === level);
    const steps = (prog && prog.steps) || {};
    const stepsDone = T2_PATH_STEPS.filter((k) => steps[k]).length;
    const pathDone = stepsDone === T2_PATH_STEPS.length;
    const pathDoneAt = pathDone ? new Date(Math.max(...T2_PATH_STEPS.map((k) => new Date(steps[k]).getTime()))) : null;

    let best = null;
    for (const r of rows) {
      if (r.templateType !== t.typeId || (r.level || 'band7') !== level) continue;
      const legacy = !r.mode || T2_LEGACY_MODES.has(r.mode);
      if (!legacy && !T2_RECALL_MODES.has(r.mode)) continue; // e.g. 'review' — only a few sentences
      const denom = Math.max(Number(r.totalItems) || 0, itemCount, 1);
      const pct = ((Number(r.correctItems) || 0) / denom) * 100;
      const passes = pct >= PASS_PERCENT && (legacy || pathDone);
      if (!best || (passes && !best.passes) || (passes === best.passes && pct > best.pct)) best = { r, pct, passes, legacy };
      if (passes) break; // newest passing run — rows are newest-first
    }
    if (!best && !prog) continue;
    // The tick lands when the LATER of the two conditions was met.
    let completedAt = best ? best.r.createdAt : pathDoneAt;
    if (best && best.passes && !best.legacy && pathDoneAt && pathDoneAt > new Date(completedAt)) completedAt = pathDoneAt;
    out.set(String(t._id), {
      completed: !!(best && best.passes), completedAt, attemptId: best ? String(best.r._id) : undefined,
      scorePercent: best ? Math.round(best.pct) : 0, stepsDone, stepsTotal: T2_PATH_STEPS.length,
    });
  }
  return out;
}

// Writing practice ("Luyện viết câu giao tiếp", writing-practice.html), one
// topic. Answers are saved one by one or in batches as WritingPracticeAttempt
// rows keyed by topic key, so they're summed since the assignment: done once
// the student answered at least WP_MIN_ANSWERS of the topic's exercises (all
// of them if it has fewer) with >= PASS_PERCENT correct.
const WP_MIN_ANSWERS = 10;
async function checkWritingPractice(studentId, ids, since) {
  const out = new Map();
  const topics = await WPTopic.find({ _id: { $in: ids } }).select('_id key').lean();
  if (!topics.length) return out;
  const keys = topics.map((t) => t.key);
  const q = { studentId, topic: { $in: keys } };
  if (since) q.createdAt = { $gte: since };
  const [rows, counts] = await Promise.all([
    WritingPracticeAttempt.find(q).select('topic totalItems correctItems createdAt').lean().catch(() => []),
    WPExercise.aggregate([{ $match: { isActive: true, topicKey: { $in: keys } } }, { $group: { _id: '$topicKey', n: { $sum: 1 } } }]).catch(() => []),
  ]);
  const countOf = new Map(counts.map((c) => [c._id, c.n]));
  for (const t of topics) {
    const mine = rows.filter((r) => r.topic === t.key);
    if (!mine.length) continue;
    const answered = mine.reduce((n, r) => n + (Number(r.totalItems) || 0), 0);
    const correct = mine.reduce((n, r) => n + (Number(r.correctItems) || 0), 0);
    const need = Math.max(1, Math.min(WP_MIN_ANSWERS, countOf.get(t.key) || WP_MIN_ANSWERS));
    const pct = answered ? (correct / answered) * 100 : 0;
    const last = mine.reduce((a, r) => (!a || r.createdAt > a ? r.createdAt : a), null);
    out.set(String(t._id), { completed: answered >= need && pct >= PASS_PERCENT, completedAt: last, scorePercent: Math.round(pct) });
  }
  return out;
}

// Task 1 Practice (task1-practice.html) is organised by skill, and a skill
// has no document of its own — so the picker lists this fixed set, each with
// a stable made-up ObjectId (resourceId must be one). Never renumber: the id
// is what assignments store.
const T1_SKILLS = [
  ['noun_phrase', 'Noun Phrase'], ['data_description', 'Mô tả Data'], ['comparison', 'So sánh'],
  ['trend_language', 'Xu hướng'], ['paraphrase', 'Paraphrase'], ['overview', 'Overview'], ['introduction', 'Introduction'],
];
const T1_SKILL_ROWS = T1_SKILLS.map(([code, name], i) => ({
  _id: new mongoose.Types.ObjectId(`7731${String(i + 1).padStart(20, '0')}`), code, name,
}));

// Same rule as writing_practice: since the assignment, at least
// WP_MIN_ANSWERS answers in that skill (all of them if it has fewer), with
// >= PASS_PERCENT correct. Task1Attempt is one row per answered exercise.
async function checkTask1Skills(studentId, ids, since) {
  const out = new Map();
  const want = T1_SKILL_ROWS.filter((s) => ids.some((id) => String(id) === String(s._id)));
  if (!want.length) return out;
  const codes = want.map((s) => s.code);
  const q = { userId: studentId, skillType: { $in: codes } };
  if (since) q.createdAt = { $gte: since };
  const [rows, counts] = await Promise.all([
    Task1Attempt.find(q).select('skillType isCorrect createdAt').lean().catch(() => []),
    Task1Exercise.aggregate([{ $match: { isActive: true, skillType: { $in: codes } } }, { $group: { _id: '$skillType', n: { $sum: 1 } } }]).catch(() => []),
  ]);
  const countOf = new Map(counts.map((c) => [c._id, c.n]));
  for (const s of want) {
    const mine = rows.filter((r) => r.skillType === s.code);
    if (!mine.length) continue;
    const correct = mine.filter((r) => r.isCorrect).length;
    const need = Math.max(1, Math.min(WP_MIN_ANSWERS, countOf.get(s.code) || WP_MIN_ANSWERS));
    const pct = (correct / mine.length) * 100;
    const last = mine.reduce((a, r) => (!a || r.createdAt > a ? r.createdAt : a), null);
    out.set(String(s._id), { completed: mine.length >= need && pct >= PASS_PERCENT, completedAt: last, scorePercent: Math.round(pct) });
  }
  return out;
}

// Catalog rows for a `static` catalog (no model) — see T1_SKILL_ROWS.
function staticDoc(catalog, id) {
  return (catalog.static || []).find((d) => String(d._id) === String(id)) || null;
}

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
    attempt: { model: ReadingPracticeAttempt, userField: 'userId', idField: 'passageId', filter: COUNTABLE_ATTEMPT },
    scoreGate: { fields: 'correctCount totalQuestions', passPercent: PRACTICE_PASS_PERCENT, percent: (d) => (d.totalQuestions ? (d.correctCount / d.totalQuestions) * 100 : 0) },
  },
  listening_practice: {
    label: 'Bài nghe lẻ (Section)',
    catalog: { model: ListeningSection, filter: { isActive: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: d.partNumber ? `Part ${d.partNumber}` : '' }) },
    attempt: { model: ListeningPracticeAttempt, userField: 'userId', idField: 'sectionId', filter: COUNTABLE_ATTEMPT },
    scoreGate: { fields: 'correctCount totalQuestions', passPercent: PRACTICE_PASS_PERCENT, percent: (d) => (d.totalQuestions ? (d.correctCount / d.totalQuestions) * 100 : 0) },
  },
  // Gap-fill on a listening section (listening.html "Gap-fill" screen). Only
  // sections whose gap-fill an admin reviewed and published are pickable —
  // the same set students see (listeningService.listGapFillSections).
  listening_gapfill: {
    label: 'Bài nghe lẻ (Gap-fill)',
    catalog: { model: ListeningSection, filter: { isActive: true, gapFillPublished: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: d.title,
        meta: [d.partNumber ? `Part ${d.partNumber}` : '', `${(d.gapFillAnswers || []).length} chỗ trống`].filter(Boolean).join(' · ') }) },
    attempt: { model: GapFillAttempt, userField: 'userId', idField: 'sectionId', filter: {} },
    scoreGate: {
      fields: 'correctCount totalBlanks',
      percent: (d) => (d.totalBlanks ? (d.correctCount / d.totalBlanks) * 100 : 0),
      pass: gapFillPasses,
    },
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
    attempt: { model: WritingAttempt, userField: 'userId', idField: 'examId', filter: COUNTABLE_ATTEMPT },
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
    attempt: { model: WritingAttempt, userField: 'userId', idField: 'task1Id', filter: { submissionType: 'practice', ...COUNTABLE_ATTEMPT } },
    wordCountGate: { fields: 'wordCount1', ok: (d) => (d.wordCount1 || 0) >= MIN_WORDS.task1 },
    equivalence: { model: WritingTask1 },
  },
  task2_practice: {
    label: 'Task 2 Writing (Đề lẻ)',
    catalog: { model: WritingTask2, filter: { isActive: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: String(d.prompt || '').replace(/\s+/g, ' ').trim().slice(0, 90), meta: '' }) },
    attempt: { model: WritingAttempt, userField: 'userId', idField: 'task2Id', filter: { submissionType: 'practice', ...COUNTABLE_ATTEMPT } },
    wordCountGate: { fields: 'wordCount2', ok: (d) => (d.wordCount2 || 0) >= MIN_WORDS.task2 },
    equivalence: { model: WritingTask2 },
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
    // The weekly lesson's last step is the full essay ("Nộp bài chấm AI" /
    // "Viết bài ngay" → writing.html, saved as a WritingAttempt on the topic's
    // WritingTask2). Submitting it — at the real 250-word minimum — also
    // completes the item; the quiz rule above alone never did for the lesson
    // flow, whose "Dịch câu" step only runs the sentence-building questions in
    // chunks, so no single sitting reaches the coverage bar (prod 2026-10-21:
    // 8 students had submitted the essay and the homework stayed unticked).
    essay: true,
  },
  speaking: {
    label: 'Speaking (Câu hỏi)',
    catalog: { model: SpeakingQuestion, filter: { isActive: true }, sort: { part: 1, createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: `Part ${d.part}: ${String(d.question || '').slice(0, 70)}`, meta: d.topic || '' }) },
    attempt: { model: SpeakingAttempt, userField: 'userId', idField: 'questionId', filter: {} },
    // See speakingAttemptCounts — a real spoken answer counts, whatever band.
    bandGate: {
      fields: 'status aiFeedback.overallBand transcript',
      ok: speakingAttemptCounts,
    },
  },
  grammar: {
    label: 'Essential Grammar',
    // essential-grammar.html picks which lesson to open from ?lesson=<lessonKey>
    // (falling back to localStorage's last-viewed lesson, then the very first
    // lesson by orderIndex, if no key is given) — without deepLinkKey here,
    // resourceCode was never populated and the student's "Bắt đầu" link opened
    // whatever lesson that fallback chain landed on instead of the one assigned.
    catalog: { model: EssentialGrammarLesson, filter: { isActive: true }, sort: { orderIndex: 1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: '' }),
      deepLinkKey: (d) => d.lessonKey },
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
  // speaking.html's "Thi thử Speaking đầy đủ" (Part 1 + 2 + 3). Its questions
  // are drawn at random per run in the browser (composeFullMockQueue), so
  // like mock_test there's no id to pick — any full-mock run since the
  // assignment counts. The finished run is saved as ONE SpeakingAttempt with
  // topic 'Full Mock Test' (finishSequentialSession), held to the same
  // "really answered" bar as a single speaking question.
  speaking_full_mock: {
    label: 'Speaking thi thử full (Part 1+2+3)',
    catalog: null,
    syntheticMeta: 'Đề ngẫu nhiên Part 1 + 2 + 3',
    attempt: { model: SpeakingAttempt, userField: 'userId', idField: null, filter: { topic: 'Full Mock Test' } },
    bandGate: { fields: 'status aiFeedback.overallBand transcript', ok: speakingAttemptCounts },
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
  // ── "Mở xem là xong" — opened = done (VIEW_TYPES) ──
  shadowing: {
    label: 'Shadowing (Video)',
    catalog: { model: ShadowingLesson, filter: { isPublished: true }, sort: { order: 1, createdAt: 1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: [d.category, d.level].filter(Boolean).join(' · ') }),
      deepLinkKey: (d) => d.slug },
    attempt: viewAttempt('shadowing'),
  },
  listening_tip: { label: 'Listening Tips (Bài giảng)', catalog: tipCatalog(ListeningTip), attempt: viewAttempt('listening_tip') },
  reading_tip:   { label: 'Reading Tips (Bài giảng)',   catalog: tipCatalog(ReadingTip),   attempt: viewAttempt('reading_tip') },
  writing_tip:   { label: 'Writing Tips (Bài giảng)',   catalog: tipCatalog(WritingTip),   attempt: viewAttempt('writing_tip') },
  speaking_tip:  { label: 'Speaking Tips (Bài giảng)',  catalog: tipCatalog(SpeakingTip),  attempt: viewAttempt('speaking_tip') },
  // Vocab Topics / Paraphrase units (dashboard.html?view=unit&unit=N).
  vocab_unit: {
    label: 'Vocab Topics / Paraphrase (Unit)',
    catalog: { model: VocabUnit, filter: { isActive: true }, sort: { sortOrder: 1, unitNumber: 1 },
      shape: (d) => ({ _id: d._id, label: `Unit ${d.unitNumber}: ${d.title}`, meta: d.type === 'paraphrase' ? 'Paraphrase' : 'Vocab' }),
      deepLinkKey: (d) => String(d.unitNumber) },
    attempt: viewAttempt('vocab_unit'),
  },
  // ── score-based, attempts not keyed by an ObjectId — custom `check` ──
  task2_template: {
    label: 'Task 2 Templates',
    catalog: { model: Task2Template, filter: { isActive: true }, sort: { level: 1, orderIndex: 1 },
      // The level is part of the label: Band 6+ and Band 7+ are separate
      // homework items with the same type name, and the label is what the
      // student's homework list shows.
      shape: (d) => {
        const lvl = d.level === 'band6' ? 'Band 6+' : 'Band 7+';
        return { _id: d._id, label: `${[d.label, d.name].filter(Boolean).join(' – ')} (${lvl})`, meta: '' };
      },
      deepLinkKey: (d) => `${d.typeId}||${d.level || 'band7'}` },
    attempt: { check: checkTask2Templates },
  },
  writing_practice: {
    label: 'Luyện viết câu giao tiếp (Chủ đề)',
    catalog: { model: WPTopic, filter: { isActive: true }, sort: { orderIndex: 1 },
      shape: (d) => ({ _id: d._id, label: d.titleVi ? `${d.titleVi} (${d.title})` : d.title, meta: '' }),
      deepLinkKey: (d) => d.key },
    attempt: { check: checkWritingPractice },
  },
  task1_skill: {
    label: 'Task 1 Practice (Kỹ năng)',
    catalog: { static: T1_SKILL_ROWS,
      shape: (d) => ({ _id: d._id, label: `Task 1 Practice: ${d.name}`, meta: '' }),
      deepLinkKey: (d) => d.code },
    attempt: { check: checkTask1Skills },
  },
};

const TYPES = Object.keys(REGISTRY);

function isValidType(t) {
  return Object.prototype.hasOwnProperty.call(REGISTRY, t);
}

// Course lessons (the WT1-stack `custom` types) count a completion from
// before the assignment existed — see the `custom` branch of checkCompleted.
function countsPriorCompletion(t) {
  return !!(REGISTRY[t] && REGISTRY[t].attempt && REGISTRY[t].attempt.custom);
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

// Hard ceiling for one picker page — above every type's full catalog today
// (largest: ~800 speaking questions), so the admin picker can list a whole
// category instead of silently stopping at the first 100.
const CATALOG_MAX = 2000;

async function listCatalog(type, search = '', limit = 100, extraFilters = {}) {
  const entry = REGISTRY[type];
  if (!entry) return [];
  if (!entry.catalog) {
    return [{ _id: null, label: entry.label, meta: entry.syntheticMeta || 'Cả lớp làm chung 1 bộ đề' }];
  }
  if (entry.catalog.static) {
    const { shape, deepLinkKey } = entry.catalog;
    const re = search && search.trim() ? new RegExp(escapeRegex(search.trim()), 'i') : null;
    return entry.catalog.static
      .map((d) => ({ ...shape(d), resourceCode: deepLinkKey ? deepLinkKey(d) : '' }))
      .filter((row) => !re || re.test(row.label));
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
      { nameVi: re }, { nameEn: re }, // nameVi/En: SentenceStructureGroup (advanced_sentences)
      { label: re }, { titleVi: re }, { category: re }]; // Task2Template / WPTopic / Tips
  }
  const docs = await entry.catalog.model.find(q)
    .sort(entry.catalog.sort)
    .limit(Math.min(Number(limit) || 100, CATALOG_MAX))
    .lean();
  // resourceCode lets the admin picker preview-link a row whose student page
  // isn't keyed by _id (lesson code / week) — same value buildResources stores.
  const { shape, deepLinkKey } = entry.catalog;
  return docs.map((d) => (deepLinkKey ? { ...shape(d), resourceCode: deepLinkKey(d) || '' } : shape(d)));
}

// Verify an internal resource id really exists for its type — called before
// an assignment is saved so a client can't attach a bogus/foreign id.
async function resourceExists(type, resourceId) {
  const entry = REGISTRY[type];
  if (!entry) return false;
  if (!entry.catalog) return resourceId == null; // mock_test: only the null id is valid
  if (!mongoose.isValidObjectId(resourceId)) return false;
  if (entry.catalog.static) return !!staticDoc(entry.catalog, resourceId);
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
  const doc = entry.catalog.static ? staticDoc(entry.catalog, resourceId) : await entry.catalog.model.findById(resourceId).lean();
  return doc ? entry.catalog.shape(doc).label : '';
}

// For the few types whose student-facing deep link isn't keyed by resourceId
// (task1_lesson links by WT1Lesson.code) — snapshotted onto
// Assignment.resources[].resourceCode at assign time, same pattern as label.
// '' for every other type.
async function deepLinkKeyFor(type, resourceId) {
  const entry = REGISTRY[type];
  if (!entry || !entry.catalog || !entry.catalog.deepLinkKey) return '';
  const doc = entry.catalog.static ? staticDoc(entry.catalog, resourceId) : await entry.catalog.model.findById(resourceId).lean();
  return doc ? entry.catalog.deepLinkKey(doc) : '';
}

// label/resourceCode on an Assignment are snapshots taken at assign time. A
// lesson renumbered later ("Buổi 10" → "Buổi 17") or a Task 2 topic moved to
// another week would otherwise keep showing the old name, and its deep link
// (?week=<old>&topicId=…) would open the wrong week. Overwrites both IN PLACE
// on lean resource objects with the resource's current values — one query
// per type; a deleted resource keeps its snapshot.
async function refreshResourceSnapshots(resources) {
  const idsByType = new Map();
  for (const r of resources) {
    if (r.kind !== 'internal' || !r.resourceId || !REGISTRY[r.resourceType] || !REGISTRY[r.resourceType].catalog
      || REGISTRY[r.resourceType].catalog.static) continue; // static rows never change
    if (!idsByType.has(r.resourceType)) idsByType.set(r.resourceType, new Set());
    idsByType.get(r.resourceType).add(String(r.resourceId));
  }
  const docByKey = new Map();
  await Promise.all([...idsByType].map(async ([type, ids]) => {
    const docs = await REGISTRY[type].catalog.model.find({ _id: { $in: [...ids] } }).lean();
    for (const d of docs) docByKey.set(resourceKey(type, d._id), d);
  }));
  for (const r of resources) {
    const doc = r.kind === 'internal' && docByKey.get(resourceKey(r.resourceType, r.resourceId));
    if (!doc) continue;
    const { catalog } = REGISTRY[r.resourceType];
    const label = catalog.shape(doc).label;
    if (label) r.label = label;
    if (catalog.deepLinkKey) r.resourceCode = catalog.deepLinkKey(doc) || r.resourceCode || '';
  }
  return resources;
}

// key used to match an assignment resource against a completion result
function resourceKey(type, resourceId) {
  return `${type}:${resourceId || '*'}`;
}

// A mock_test homework item with a fixed class bundle (Assignment
// resources[].mockBundle) is completed by a run started FROM that item —
// matched on the item's own _id, not "any mock". Legacy bundle-less items
// keep the "any completed run" rule.
function isFixedMock(r) {
  return r.resourceType === 'mock_test' && !!(r.mockBundle && r.mockBundle.listeningTestId);
}

// Assignment resource -> the item checkCompleted() takes. Callers build their
// internal-item lists through this and look results up with completionKey().
function completionItem(r) {
  return { resourceType: r.resourceType, resourceId: r.resourceId, mockItemId: isFixedMock(r) ? r._id : null };
}

function completionKey(r) {
  return isFixedMock(r) ? `mock_test:item:${r._id}` : resourceKey(r.resourceType, r.resourceId);
}

// An assigned full mock counts as done once sitting 1 (Listening → Reading →
// Writing — the part every student sits on the same bundle) is submitted, on
// a run that wasn't voided. Speaking is its own later sitting (often run live
// by the teacher), so it isn't required for the homework tick; its band still
// shows in the teacher's table once there. Not 'completed' status either: that
// waits on Writing being graded, which is the teacher's job, not the student's.
// A run discarded ('abandoned') AFTER sitting 1 still counts — the student
// may drop the pending Speaking step to start another mock; one discarded
// before finishing sitting 1 is ignored entirely.
async function checkFixedMocks(studentId, itemIds, out) {
  const runs = await MockTestAttempt.find({
    userId: studentId,
    assignmentItemId: { $in: itemIds.map((x) => new mongoose.Types.ObjectId(String(x))) },
    status: { $ne: 'deleted' },
  }).sort({ createdAt: -1 })
    .select('assignmentItemId status progress sitting1CompletedAt overallBand steps.listening.band steps.reading.band steps.writing.band steps.speaking.band createdAt')
    .lean().catch(() => []);
  for (const run of runs) {
    const k = `mock_test:item:${run.assignmentItemId}`;
    const done = !!run.sitting1CompletedAt && run.status !== 'disqualified';
    if (run.status === 'abandoned' && !done) continue;
    const prev = out.get(k);
    // newest-first: a finished run beats an unfinished one; otherwise the newest wins
    if (prev && (prev.completed || !done)) continue;
    const band = (s) => (run.steps && run.steps[s] && run.steps[s].band > 0 ? run.steps[s].band : null);
    out.set(k, {
      completed: done,
      completedAt: done ? run.sitting1CompletedAt : run.createdAt,
      attemptId: String(run._id),
      mock: {
        runId: String(run._id), status: run.status, progress: run.progress,
        overallBand: run.overallBand > 0 ? run.overallBand : null,
        bands: { listening: band('listening'), reading: band('reading'), writing: band('writing'), speaking: band('speaking') },
      },
    });
  }
}

// Writing prompts (WritingTask1/2) were sometimes entered twice — same chart
// or essay question, two docs. A student who opens the prompt from the
// Writing list instead of the homework link can land on the other copy, and
// an id-only match then never ticks the homework (prod 2026-10-01: 4 of a
// class's Task 1 submissions went to the twin of the assigned prompt). Two
// prompts are treated as the same exercise when their text matches once
// case/punctuation/spacing are ignored, or when one is marked `duplicateOf`
// the other (for twins worded differently). Both collections are small
// (~150 docs), so the whole set is grouped in memory and cached briefly.
const EQUIV_TTL_MS = 60 * 1000;
const _equivCache = new Map(); // modelName -> { at, groupOf: Map<id, groupKey>, members: Map<groupKey, id[]> }

function normalizePrompt(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

// Pure: docs [{ _id, prompt, duplicateOf }] -> { groupOf, members }.
function groupEquivalentDocs(docs) {
  const parent = new Map();
  const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
  const byText = new Map();
  for (const d of docs) parent.set(String(d._id), String(d._id));
  for (const d of docs) {
    const id = String(d._id);
    const norm = normalizePrompt(d.prompt);
    if (norm) {
      if (byText.has(norm)) union(id, byText.get(norm)); else byText.set(norm, id);
    }
    if (d.duplicateOf && parent.has(String(d.duplicateOf))) union(id, String(d.duplicateOf));
  }
  const groupOf = new Map();
  const members = new Map();
  for (const id of parent.keys()) {
    const g = find(id);
    groupOf.set(id, g);
    if (!members.has(g)) members.set(g, []);
    members.get(g).push(id);
  }
  // byText: normalized prompt -> one id with that text (task2 topic -> essay)
  return { groupOf, members, byText };
}

async function loadEquivalence(model, needIds = [], needTexts = []) {
  const hit = _equivCache.get(model.modelName);
  // A prompt added since the last load isn't in the cache — reload then too.
  if (hit && Date.now() - hit.at < EQUIV_TTL_MS && needIds.every((id) => hit.groupOf.has(id))
    && needTexts.every((t) => hit.byText.has(t))) return hit;
  const docs = await model.find({}).select('_id prompt duplicateOf').lean();
  const val = { at: Date.now(), ...groupEquivalentDocs(docs) };
  _equivCache.set(model.modelName, val);
  return val;
}

// assigned ids -> Map<anyEquivalentId, assignedId[]> (every id maps to itself).
async function expandEquivalentIds(model, assignedIds) {
  const out = new Map();
  const add = (k, v) => { if (!out.has(k)) out.set(k, []); if (!out.get(k).includes(v)) out.get(k).push(v); };
  let eq = null;
  try { eq = await loadEquivalence(model, assignedIds); } catch (_) { /* fall back to exact ids */ }
  for (const id of assignedIds) {
    add(id, id);
    const g = eq && eq.groupOf.get(id);
    for (const other of (g && eq.members.get(g)) || []) add(other, id);
  }
  return out;
}

// task2 topic ids -> Map<topicId, latest essay submission that meets
// MIN_WORDS.task2>. A topic's essay is its linked WritingTask2
// (Task2Topic.writingTask2Id) or any WritingTask2 with the same prompt —
// seedTask2Exercises.js's replaceOne wipes writingTask2Id, and the link is
// only rebuilt the next time the week is opened (ensureTopicEssayLinks).
async function task2EssayCompletions(studentId, topicIds, since) {
  const res = new Map();
  const topics = await Task2Topic.find({ _id: { $in: topicIds } }).select('_id prompt writingTask2Id').lean();
  if (!topics.length) return res;
  // The lesson's own hand-in ("Nộp bài chấm AI" stamps submittedAt, then
  // opens writing.html) counts as submitted — a student who then leaves
  // writing.html without pressing submit again has still handed the essay in.
  const lq = { userId: studentId, topicId: { $in: topics.map((t) => t._id) }, submittedAt: { $ne: null } };
  if (since) lq.submittedAt = { $gte: since };
  const works = await Task2LessonWork.find(lq).select('_id topicId submittedAt sections').lean().catch(() => []);
  for (const w of works) {
    const words = Object.values(w.sections || {}).join(' ').split(/\s+/).filter(Boolean).length;
    if (words >= MIN_WORDS.task2) res.set(String(w.topicId), { completedAt: w.submittedAt, attemptId: String(w._id) });
  }
  let eq = null;
  try {
    eq = await loadEquivalence(WritingTask2,
      topics.filter((t) => t.writingTask2Id).map((t) => String(t.writingTask2Id)),
      topics.map((t) => normalizePrompt(t.prompt)).filter(Boolean));
  } catch (_) { /* linked id only */ }
  const topicsOfEssay = new Map(); // WritingTask2 id -> topic ids
  const link = (essayId, topicId) => {
    const g = eq && eq.groupOf.get(essayId);
    for (const id of (g && eq.members.get(g)) || [essayId]) {
      if (!topicsOfEssay.has(id)) topicsOfEssay.set(id, new Set());
      topicsOfEssay.get(id).add(topicId);
    }
  };
  for (const t of topics) {
    if (t.writingTask2Id) link(String(t.writingTask2Id), String(t._id));
    const byPrompt = eq && eq.byText.get(normalizePrompt(t.prompt));
    if (byPrompt) link(byPrompt, String(t._id));
  }
  if (!topicsOfEssay.size) return res;
  const q = {
    userId: studentId, ...COUNTABLE_ATTEMPT,
    task2Id: { $in: [...topicsOfEssay.keys()].map((x) => new mongoose.Types.ObjectId(x)) },
    wordCount2: { $gte: MIN_WORDS.task2 },
  };
  if (since) q.createdAt = { $gte: since };
  const rows = await WritingAttempt.find(q).sort({ createdAt: -1 }).select('_id createdAt task2Id').lean().catch(() => []);
  for (const r of rows) { // newest first — keep the first per topic
    for (const topicId of topicsOfEssay.get(String(r.task2Id)) || []) {
      const prev = res.get(topicId);
      if (!prev || prev.completedAt < r.createdAt) res.set(topicId, { completedAt: r.createdAt, attemptId: String(r._id) });
    }
  }
  return res;
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

  // fixed-bundle mock homework items are matched by item id (see checkFixedMocks)
  const fixedMockIds = internalItems.filter((it) => it.mockItemId).map((it) => it.mockItemId);
  if (fixedMockIds.length) await checkFixedMocks(studentId, fixedMockIds, out);

  // group ids by type
  const byType = new Map();
  for (const it of internalItems) {
    if (it.mockItemId) continue;
    if (!isValidType(it.resourceType)) continue;
    if (!byType.has(it.resourceType)) byType.set(it.resourceType, new Set());
    if (it.resourceId) byType.get(it.resourceType).add(String(it.resourceId));
    else byType.get(it.resourceType).add('*'); // mock_test
  }

  await Promise.all([...byType.entries()].map(async ([type, idSet]) => {
    const entry = REGISTRY[type];
    const A = entry.attempt;

    if (A.check) {
      const ids = [...idSet].filter((x) => x !== '*' && mongoose.isValidObjectId(x)).map((x) => new mongoose.Types.ObjectId(x));
      if (!ids.length) return;
      const res = await A.check(studentId, ids, since).catch(() => new Map());
      for (const [id, v] of res) out.set(resourceKey(type, id), v);
      return;
    }

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
      // No `since` here on purpose: WT1Progress.completedAt is stamped ONCE,
      // when the lesson's last exercise is first done — redoing it later never
      // moves it. A student who finished the lesson before the teacher
      // assigned it could otherwise never satisfy the homework.
      const filter = { userId: studentId, lessonCode: { $in: codes }, completedAt: { $ne: null } };
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
      if (entry.bandGate) {
        // speaking_full_mock — the newest run that passes the gate, else the
        // newest one (completed: false), same as the boolGate branch below.
        const rows = await A.model.find(base).sort({ createdAt: -1 }).limit(20)
          .select(`_id createdAt ${entry.bandGate.fields}`).lean().catch(() => []);
        const doc = rows.find((r) => entry.bandGate.ok(r)) || rows[0];
        if (doc) out.set(resourceKey(type, null), { completed: entry.bandGate.ok(doc), completedAt: doc.createdAt, attemptId: String(doc._id) });
        return;
      }
      // mock_test — the most recent completed run
      const doc = await A.model.findOne(base).sort({ createdAt: -1 }).select('_id createdAt').lean().catch(() => null);
      if (doc) out.set(resourceKey(type, null), { completed: true, completedAt: doc.createdAt, attemptId: String(doc._id) });
      return;
    }

    const assignedIds = [...idSet].filter((x) => x !== '*');
    if (!assignedIds.length) return;
    // attemptId -> the assigned id(s) it counts for (just itself, unless the
    // type has equivalent twin prompts — see expandEquivalentIds).
    const idMap = entry.equivalence
      ? await expandEquivalentIds(entry.equivalence.model, assignedIds)
      : new Map(assignedIds.map((x) => [x, [x]]));
    const ids = [...idMap.keys()].map((x) => new mongoose.Types.ObjectId(x));
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
        const passes = boolGate.ok(r);
        for (const target of idMap.get(String(r[A.idField])) || []) {
          const k = resourceKey(type, target);
          const prev = bestByKey.get(k);
          if (!prev || (passes && !prev.passes)) bestByKey.set(k, { passes, r });
        }
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
      // gate.pass (gap-fill's absolute count) > gate.passPercent (bài lẻ 50%) > PASS_PERCENT
      const cleared = gate.pass ? gate.pass(r) : pct >= (gate.passPercent ?? PASS_PERCENT);
      const passes = cleared && coverageOk(r);
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

    if (entry.essay) {
      // task2: a submitted essay completes the topic too. completedAt is the
      // later of the two passing dates (same "latest pass" rule as above).
      const essays = await task2EssayCompletions(studentId, assignedIds, since);
      for (const [topicId, e] of essays) {
        const k = resourceKey(type, topicId);
        const prev = out.get(k);
        if (prev && prev.completed && new Date(prev.completedAt) >= new Date(e.completedAt)) continue;
        out.set(k, { ...(prev || {}), completed: true, completedAt: e.completedAt, attemptId: e.attemptId });
      }
    }
  }));

  return out;
}

module.exports = {
  REGISTRY, TYPES, VIEW_TYPES, isValidType, countsPriorCompletion, PASS_PERCENT, PRACTICE_PASS_PERCENT,
  GAPFILL_MIN_CORRECT, MIN_SPEAKING_WORDS,
  groupEquivalentDocs, normalizePrompt,
  listCatalog, resourceExists, labelFor, deepLinkKeyFor, refreshResourceSnapshots, resourceKey, checkCompleted,
  isFixedMock, completionItem, completionKey,
};
