'use strict';

// Weakness Detection: aggregates a student's existing practice/exam history
// into "which question type / grading criterion do they struggle with most"
// signals, per skill. No new attempt data is collected — everything here is
// derived from data already saved by Reading/Listening/Writing/Speaking.
const ReadingPracticeAttempt = require('../models/ReadingPracticeAttempt');
const TestAttempt = require('../models/TestAttempt');
const Passage = require('../models/Passage');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const ListeningSection = require('../models/ListeningSection');
const ListeningTest = require('../models/ListeningTest');
const WritingAttempt = require('../models/WritingAttempt');
const SpeakingAttempt = require('../models/SpeakingAttempt');

// A question type / grading criterion needs at least this many answered
// questions (or graded attempts) before it's surfaced as a real weakness —
// mirrors vocabBookService's WEAK_WRONG_COUNT_THRESHOLD convention of not
// flagging something off a single unlucky attempt.
const MIN_SAMPLE_SIZE = 3;

function buildQuestionTypeMap(questionGroups = [], flatQuestions = []) {
  const map = new Map();
  for (const g of questionGroups) {
    for (const q of (g.questions || [])) map.set(q.questionNumber, q.type);
  }
  for (const q of flatQuestions) {
    if (!map.has(q.questionNumber)) map.set(q.questionNumber, q.type);
  }
  return map;
}

function tallyByType(typeStats, typeMap, answers = []) {
  for (const ans of answers) {
    const type = typeMap.get(ans.questionNumber);
    if (!type) continue;
    if (!typeStats[type]) typeStats[type] = { correct: 0, total: 0 };
    typeStats[type].total += 1;
    if (ans.isCorrect) typeStats[type].correct += 1;
  }
}

function summarizeTypeStats(typeStats) {
  return Object.entries(typeStats)
    .map(([type, { correct, total }]) => ({ type, correct, total, accuracy: total ? correct / total : 0 }))
    .filter(t => t.total >= MIN_SAMPLE_SIZE)
    .sort((a, b) => a.accuracy - b.accuracy);
}

// Reading: joins ReadingPracticeAttempt (single passage) + TestAttempt (full
// mock test, 3 random passages) back to Passage.questionGroups[].questions[]
// to find each answered question's type — attempt documents themselves only
// store questionNumber, not type. One $in fetch for all passages involved,
// not a query per attempt.
async function getReadingWeakness(userId) {
  const [practiceAttempts, testAttempts] = await Promise.all([
    ReadingPracticeAttempt.find({ userId }).select('passageId answers').lean(),
    TestAttempt.find({ userId, status: 'completed' }).select('passagesUsed answers').lean(),
  ]);
  if (!practiceAttempts.length && !testAttempts.length) return [];

  const passageIds = new Set();
  practiceAttempts.forEach(a => a.passageId && passageIds.add(String(a.passageId)));
  testAttempts.forEach(a => (a.passagesUsed || []).forEach(id => passageIds.add(String(id))));

  const passages = await Passage.find({ _id: { $in: [...passageIds] } })
    .select('questionGroups questions').lean();
  const typeMapByPassage = new Map();
  for (const p of passages) {
    typeMapByPassage.set(String(p._id), buildQuestionTypeMap(p.questionGroups, p.questions));
  }

  const typeStats = {};
  for (const a of practiceAttempts) {
    const typeMap = typeMapByPassage.get(String(a.passageId));
    if (typeMap) tallyByType(typeStats, typeMap, a.answers);
  }
  for (const a of testAttempts) {
    // A test spans 3 passages with non-overlapping question numbers, so a
    // single merged map is safe to look answers up against.
    const combined = new Map();
    for (const pid of (a.passagesUsed || [])) {
      const m = typeMapByPassage.get(String(pid));
      if (m) for (const [k, v] of m) combined.set(k, v);
    }
    tallyByType(typeStats, combined, a.answers);
  }

  return summarizeTypeStats(typeStats);
}

// Listening: same idea as Reading. ListeningPracticeAttempt (single section)
// joins to ListeningSection; ListeningAttempt (full mock test) joins to
// ListeningTest, which embeds its own sections (not a ref to
// ListeningSection docs), so it's looked up separately.
async function getListeningWeakness(userId) {
  const [practiceAttempts, testAttempts] = await Promise.all([
    ListeningPracticeAttempt.find({ userId }).select('sectionId answers').lean(),
    ListeningAttempt.find({ userId, status: 'completed' }).select('testId answers').lean(),
  ]);
  if (!practiceAttempts.length && !testAttempts.length) return [];

  const sectionIds = new Set();
  practiceAttempts.forEach(a => a.sectionId && sectionIds.add(String(a.sectionId)));
  const testIds = new Set();
  testAttempts.forEach(a => a.testId && testIds.add(String(a.testId)));

  const [sections, tests] = await Promise.all([
    sectionIds.size
      ? ListeningSection.find({ _id: { $in: [...sectionIds] } }).select('questionGroups').lean()
      : [],
    testIds.size
      ? ListeningTest.find({ _id: { $in: [...testIds] } }).select('sections').lean()
      : [],
  ]);

  const typeMapBySection = new Map();
  for (const s of sections) {
    typeMapBySection.set(String(s._id), buildQuestionTypeMap(s.questionGroups, []));
  }
  const typeMapByTest = new Map();
  for (const t of tests) {
    const combined = new Map();
    for (const sec of (t.sections || [])) {
      for (const [k, v] of buildQuestionTypeMap(sec.questionGroups, [])) combined.set(k, v);
    }
    typeMapByTest.set(String(t._id), combined);
  }

  const typeStats = {};
  for (const a of practiceAttempts) {
    const typeMap = typeMapBySection.get(String(a.sectionId));
    if (typeMap) tallyByType(typeStats, typeMap, a.answers);
  }
  for (const a of testAttempts) {
    const typeMap = typeMapByTest.get(String(a.testId));
    if (typeMap) tallyByType(typeStats, typeMap, a.answers);
  }

  return summarizeTypeStats(typeStats);
}

const WRITING_CRITERIA = ['ta', 'cc', 'lr', 'gra'];

// Writing: no question-type join needed — every graded attempt already
// carries its own per-criterion band scores. Prefer teacher-confirmed
// `grading` over `aiGrading` for a given task, same "best available grade"
// rule userService.getStats() already uses for the overall band average.
async function getWritingWeakness(userId) {
  const attempts = await WritingAttempt.find({ userId })
    .select('grading.task1 grading.task2 aiGrading.task1 aiGrading.task2')
    .lean();

  const criterionStats = {};
  for (const a of attempts) {
    for (const taskKey of ['task1', 'task2']) {
      const graded = a.grading?.[taskKey]?.bandScore != null ? a.grading[taskKey] : null;
      const aiGraded = a.aiGrading?.[taskKey]?.bandScore != null ? a.aiGrading[taskKey] : null;
      const source = graded || aiGraded;
      if (!source) continue;
      for (const c of WRITING_CRITERIA) {
        const score = source[c]?.score;
        if (score == null) continue;
        if (!criterionStats[c]) criterionStats[c] = { sum: 0, count: 0 };
        criterionStats[c].sum += score;
        criterionStats[c].count += 1;
      }
    }
  }

  return Object.entries(criterionStats)
    .map(([criterion, { sum, count }]) => ({ criterion, avgScore: sum / count, count }))
    .filter(c => c.count >= MIN_SAMPLE_SIZE)
    .sort((a, b) => a.avgScore - b.avgScore);
}

const SPEAKING_CRITERIA = ['fluency', 'vocabulary', 'grammar', 'pronunciation'];

async function getSpeakingWeakness(userId) {
  const attempts = await SpeakingAttempt.find({ userId, status: 'analyzed' })
    .select('aiFeedback.fluency aiFeedback.vocabulary aiFeedback.grammar aiFeedback.pronunciation')
    .lean();

  const criterionStats = {};
  for (const a of attempts) {
    for (const c of SPEAKING_CRITERIA) {
      const score = a.aiFeedback?.[c];
      if (score == null) continue;
      if (!criterionStats[c]) criterionStats[c] = { sum: 0, count: 0 };
      criterionStats[c].sum += score;
      criterionStats[c].count += 1;
    }
  }

  return Object.entries(criterionStats)
    .map(([criterion, { sum, count }]) => ({ criterion, avgScore: sum / count, count }))
    .filter(c => c.count >= MIN_SAMPLE_SIZE)
    .sort((a, b) => a.avgScore - b.avgScore);
}

async function getWeaknessProfile(userId) {
  const [reading, listening, writing, speaking] = await Promise.all([
    getReadingWeakness(userId),
    getListeningWeakness(userId),
    getWritingWeakness(userId),
    getSpeakingWeakness(userId),
  ]);

  return { reading, listening, writing, speaking };
}

module.exports = {
  getWeaknessProfile,
  getReadingWeakness,
  getListeningWeakness,
  getWritingWeakness,
  getSpeakingWeakness,
  MIN_SAMPLE_SIZE,
};
