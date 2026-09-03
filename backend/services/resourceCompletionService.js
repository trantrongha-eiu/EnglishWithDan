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
const Task2Topic = require('../models/Task2Topic');
const SpeakingQuestion = require('../models/SpeakingQuestion');
const EssentialGrammarLesson = require('../models/EssentialGrammarLesson');
const VocabularyLesson = require('../models/VocabularyLesson');

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

const { escapeRegex } = require('../utils/strings');

const REGISTRY = {
  reading_test: {
    label: 'Bộ đề Reading',
    catalog: { model: ReadingTest, filter: { isActive: true }, sort: { testNumber: -1 },
      shape: (d) => ({ _id: d._id, label: d.name, meta: `Test ${d.testNumber}` }) },
    attempt: { model: TestAttempt, userField: 'userId', idField: 'testId', filter: { status: 'completed' } },
  },
  listening_test: {
    label: 'Đề Listening',
    catalog: { model: ListeningTest, filter: { isActive: true }, sort: { testNumber: -1 },
      shape: (d) => ({ _id: d._id, label: d.name, meta: `Test ${d.testNumber}` }) },
    attempt: { model: ListeningAttempt, userField: 'userId', idField: 'testId', filter: { status: 'completed' } },
  },
  reading_practice: {
    label: 'Bài đọc lẻ (Passage)',
    catalog: { model: Passage, filter: { isActive: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: d.category }) },
    attempt: { model: ReadingPracticeAttempt, userField: 'userId', idField: 'passageId', filter: {} },
  },
  listening_practice: {
    label: 'Bài nghe lẻ (Section)',
    catalog: { model: ListeningSection, filter: { isActive: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: d.partNumber ? `Part ${d.partNumber}` : '' }) },
    attempt: { model: ListeningPracticeAttempt, userField: 'userId', idField: 'sectionId', filter: {} },
  },
  dictation: {
    label: 'Dictation (Section)',
    catalog: { model: ListeningSection, filter: { isActive: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: 'Dictation' }) },
    attempt: { model: DictationAttempt, userField: 'userId', idField: 'sectionId', filter: {} },
  },
  writing_exam: {
    label: 'Đề Writing',
    catalog: { model: WritingExam, filter: { isActive: true }, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: d.name, meta: '' }) },
    attempt: { model: WritingAttempt, userField: 'userId', idField: 'examId', filter: {} },
  },
  task2: {
    label: 'Task 2 Writing (Topic)',
    catalog: { model: Task2Topic, filter: { isActive: true }, sort: { week: 1, orderIndex: 1 },
      shape: (d) => ({ _id: d._id, label: d.topicName, meta: d.week ? `Week ${d.week}` : '' }) },
    attempt: { model: Task2Attempt, userField: 'userId', idField: 'topicId', filter: {} },
  },
  speaking: {
    label: 'Speaking (Câu hỏi)',
    catalog: { model: SpeakingQuestion, filter: { isActive: true }, sort: { part: 1, createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: `Part ${d.part}: ${String(d.question || '').slice(0, 70)}`, meta: d.topic || '' }) },
    attempt: { model: SpeakingAttempt, userField: 'userId', idField: 'questionId', filter: {} },
  },
  grammar: {
    label: 'Essential Grammar',
    catalog: { model: EssentialGrammarLesson, filter: { isActive: true }, sort: { orderIndex: 1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: '' }) },
    attempt: { model: EssentialGrammarAttemptLog, userField: 'userId', idField: 'lessonId', filter: {} },
  },
  vocabulary_lesson: {
    label: 'Vocabulary Lessons',
    catalog: { model: VocabularyLesson, filter: {}, sort: { createdAt: -1 },
      shape: (d) => ({ _id: d._id, label: d.title, meta: [d.difficulty, d.targetClass && `Lớp ${d.targetClass}`].filter(Boolean).join(' · ') }) },
    attempt: { model: VocabularyLessonAttemptLog, userField: 'userId', idField: 'lessonId', filter: {} },
  },
  mock_test: {
    label: 'Thi thử 4 kỹ năng',
    catalog: null, // synthetic — a single pickable entry, no id
    attempt: { model: MockTestAttempt, userField: 'userId', idField: null, filter: { status: 'completed' } },
  },
};

const TYPES = Object.keys(REGISTRY);

function isValidType(t) {
  return Object.prototype.hasOwnProperty.call(REGISTRY, t);
}

// Teacher resource picker. Returns [{ _id, label, meta }]. For mock_test,
// one synthetic row with _id null.
async function listCatalog(type, search = '', limit = 100) {
  const entry = REGISTRY[type];
  if (!entry) return [];
  if (!entry.catalog) {
    return [{ _id: null, label: entry.label, meta: 'Đề ngẫu nhiên mỗi lần làm' }];
  }
  const q = { ...entry.catalog.filter };
  if (search && search.trim()) {
    const re = new RegExp(escapeRegex(search.trim()), 'i');
    // every catalog model has one of these text fields
    q.$or = [{ name: re }, { title: re }, { topicName: re }, { question: re }];
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
  return !!(await entry.catalog.model.exists({ _id: resourceId, ...entry.catalog.filter }));
}

async function labelFor(type, resourceId) {
  const entry = REGISTRY[type];
  if (!entry) return '';
  if (!entry.catalog) return entry.label;
  const doc = await entry.catalog.model.findById(resourceId).lean();
  return doc ? entry.catalog.shape(doc).label : '';
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
    // newest first + keep the first seen per resource id → latest attempt wins
    const rows = await A.model.find({ ...base, [A.idField]: { $in: ids } })
      .sort({ createdAt: -1 })
      .select(`_id createdAt ${A.idField}`)
      .lean()
      .catch(() => []);
    for (const r of rows) {
      const k = resourceKey(type, r[A.idField]);
      if (!out.has(k)) out.set(k, { completed: true, completedAt: r.createdAt, attemptId: String(r._id) });
    }
  }));

  return out;
}

module.exports = {
  REGISTRY, TYPES, isValidType,
  listCatalog, resourceExists, labelFor, resourceKey, checkCompleted,
};
