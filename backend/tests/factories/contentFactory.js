// Test-data builders for content/domain models (Passage, ReadingTest,
// TestAttempt, ListeningSection, ListeningTest, WritingTask1/2, VocabUnit,
// VocabBook, Course, TuitionFee, UpgradeRequest, SpeakingQuestion) — mirrors
// tests/factories/userFactory.js's style so unit tests for the grading/CRUD
// services can build real, saved Mongoose documents instead of hand-rolling
// schema-shaped objects inline. Async, return real saved documents unless
// noted otherwise.
const mongoose = require('mongoose');
const Passage = require('../../models/Passage');
const ReadingTest = require('../../models/ReadingTest');
const TestAttempt = require('../../models/TestAttempt');
const ListeningSection = require('../../models/ListeningSection');
const ListeningTest = require('../../models/ListeningTest');
const WritingTask1 = require('../../models/WritingTask1');
const WritingTask2 = require('../../models/WritingTask2');
const WritingExam = require('../../models/WritingExam');
const WritingAttempt = require('../../models/WritingAttempt');
const ListeningAttempt = require('../../models/ListeningAttempt');
const ReadingPracticeAttempt = require('../../models/ReadingPracticeAttempt');
const SpeakingAttempt = require('../../models/SpeakingAttempt');
const VocabUnit = require('../../models/VocabUnit');
const VocabBook = require('../../models/VocabBook');
const Course = require('../../models/Course');
const TuitionFee = require('../../models/TuitionFee');
const UpgradeRequest = require('../../models/UpgradeRequest');
const SpeakingQuestion = require('../../models/SpeakingQuestion');

let counter = 0;
function unique(prefix) {
  counter += 1;
  return `${prefix}${Date.now()}${counter}`;
}

// ── Reading ────────────────────────────────────────────────────────────────
function defaultQuestion(overrides = {}) {
  return {
    questionNumber: 1,
    type: 'sentence-completion',
    questionText: 'The sky is __1__.',
    correctAnswer: 'blue',
    explanation: '',
    ...overrides,
  };
}

async function createPassage(overrides = {}) {
  const passage = await Passage.create({
    title: overrides.title || unique('Passage'),
    category: overrides.category || 'passage1',
    content: overrides.content || 'Some passage content.',
    questionGroups: overrides.questionGroups,
    questions: overrides.questions,
    questionRange: overrides.questionRange || { start: 1, end: 1 },
    isActive: overrides.isActive ?? true,
    isActualTest: overrides.isActualTest ?? false,
    ...overrides.extra,
  });
  return passage;
}

async function createReadingTest(overrides = {}) {
  return ReadingTest.create({
    name: overrides.name || unique('ReadingTest'),
    seriesName: overrides.seriesName || '',
    testNumber: overrides.testNumber ?? 1,
    isActive: overrides.isActive ?? true,
  });
}

async function createTestAttempt(overrides = {}) {
  return TestAttempt.create({
    userId: overrides.userId,
    testId: overrides.testId,
    passagesUsed: overrides.passagesUsed || [],
    status: overrides.status || 'in-progress',
    startTime: overrides.startTime || new Date(),
    ...overrides.extra,
  });
}

// ── Listening ──────────────────────────────────────────────────────────────
function defaultListeningQuestion(overrides = {}) {
  return {
    questionNumber: 1,
    type: 'fill-blank',
    questionText: 'The answer is __1__.',
    correctAnswer: 'sunny',
    ...overrides,
  };
}

async function createListeningSection(overrides = {}) {
  return ListeningSection.create({
    partNumber: overrides.partNumber ?? 1,
    title: overrides.title || unique('Section'),
    description: overrides.description || '',
    questionRange: overrides.questionRange || { start: 1, end: 1 },
    questionGroups: overrides.questionGroups || [
      { groupType: 'plain', questions: [defaultListeningQuestion()] },
    ],
    isActive: overrides.isActive ?? true,
    ...overrides.extra,
  });
}

async function createListeningTest(overrides = {}) {
  return ListeningTest.create({
    name: overrides.name || unique('ListeningTest'),
    testNumber: overrides.testNumber ?? 1,
    seriesName: overrides.seriesName || '',
    audioUrl: overrides.audioUrl || '',
    sections: overrides.sections || [
      {
        partNumber: 1,
        title: 'Part 1',
        questionRange: { start: 1, end: 1 },
        questionGroups: [{ groupType: 'plain', questions: [defaultListeningQuestion()] }],
      },
    ],
    isActive: overrides.isActive ?? true,
  });
}

// ── Writing ────────────────────────────────────────────────────────────────
async function createWritingTask1(overrides = {}) {
  return WritingTask1.create({
    imageUrl: overrides.imageUrl || '',
    instructions: overrides.instructions,
    prompt: overrides.prompt || unique('Task1 prompt'),
    isActive: overrides.isActive ?? true,
  });
}

async function createWritingTask2(overrides = {}) {
  return WritingTask2.create({
    instructions: overrides.instructions,
    prompt: overrides.prompt || unique('Task2 prompt'),
    isActive: overrides.isActive ?? true,
  });
}

async function createWritingExam(overrides = {}) {
  return WritingExam.create({
    name: overrides.name || unique('WritingExam'),
    duration: overrides.duration ?? 60,
    isActive: overrides.isActive ?? true,
  });
}

// ── Vocab ──────────────────────────────────────────────────────────────────
async function createVocabUnit(overrides = {}) {
  return VocabUnit.create({
    unitNumber: overrides.unitNumber ?? Math.floor(Math.random() * 1_000_000) + 1,
    title: overrides.title || unique('Unit'),
    description: overrides.description || '',
    level: overrides.level || 'B1',
    isActive: overrides.isActive ?? true,
    words: overrides.words || [],
  });
}

async function createVocabBook(overrides = {}) {
  return VocabBook.create({
    userId: overrides.userId,
    name: overrides.name || unique('Book'),
    color: overrides.color || '#3d8bff',
    emoji: overrides.emoji || '📘',
    words: overrides.words || [],
    isDefault: overrides.isDefault ?? false,
    sortOrder: overrides.sortOrder ?? 0,
  });
}

// ── Completed attempts (for ownership/IDOR/history tests) ──────────────────
// Unlike createTestAttempt() above (used by unit tests to build the
// in-progress attempt a submit-flow operates on), these build already-
// completed attempt documents directly — for integration/security tests
// that only need a real, owned row to query for scoping, not to drive the
// grading flow itself.
async function createCompletedTestAttempt(overrides = {}) {
  return TestAttempt.create({
    userId: overrides.userId,
    testId: overrides.testId || new mongoose.Types.ObjectId(),
    passagesUsed: overrides.passagesUsed || [],
    status: overrides.status || 'completed',
    correctCount: overrides.correctCount ?? 10,
    wrongCount: overrides.wrongCount ?? 5,
    skippedCount: overrides.skippedCount ?? 0,
    totalQuestions: overrides.totalQuestions ?? 15,
    bandScore: overrides.bandScore ?? 6.5,
    startTime: overrides.startTime || new Date(),
    endTime: overrides.endTime || new Date(),
    duration: overrides.duration ?? 1000,
    ...overrides.extra,
  });
}

async function createReadingPracticeAttempt(overrides = {}) {
  return ReadingPracticeAttempt.create({
    userId: overrides.userId,
    passageId: overrides.passageId || new mongoose.Types.ObjectId(),
    passageTitle: overrides.passageTitle || 'Sample passage',
    category: overrides.category || 'passage1',
    answers: overrides.answers || [],
    totalQuestions: overrides.totalQuestions ?? 10,
    correctCount: overrides.correctCount ?? 5,
    wrongCount: overrides.wrongCount ?? 5,
    skippedCount: overrides.skippedCount ?? 0,
    submittedAt: overrides.submittedAt || new Date(),
  });
}

async function createListeningAttempt(overrides = {}) {
  return ListeningAttempt.create({
    userId: overrides.userId,
    testId: overrides.testId || new mongoose.Types.ObjectId(),
    testName: overrides.testName || 'Listening Test 1',
    answers: overrides.answers || [],
    correctCount: overrides.correctCount ?? 20,
    wrongCount: overrides.wrongCount ?? 10,
    skippedCount: overrides.skippedCount ?? 10,
    totalQuestions: overrides.totalQuestions ?? 40,
    bandScore: overrides.bandScore ?? 6.5,
    submittedAt: overrides.submittedAt || new Date(),
    status: overrides.status || 'completed',
  });
}

async function createWritingAttempt(overrides = {}) {
  return WritingAttempt.create({
    userId: overrides.userId,
    submissionType: overrides.submissionType || 'exam',
    examId: overrides.examId,
    examName: overrides.examName || 'Writing Practice',
    status: overrides.status || 'completed',
    submittedAt: overrides.submittedAt || new Date(),
    ...overrides.extra,
  });
}

async function createSpeakingAttempt(overrides = {}) {
  return SpeakingAttempt.create({
    userId: overrides.userId,
    topic: overrides.topic || 'Hobbies',
    part: overrides.part ?? 1,
    question: overrides.question || 'Do you have a hobby?',
    transcript: overrides.transcript || 'Yes, I enjoy reading books.',
    status: overrides.status || 'analyzed',
    ...overrides.extra,
  });
}

// ── Misc ───────────────────────────────────────────────────────────────────
async function createCourse(overrides = {}) {
  return Course.create({
    title: overrides.title || unique('Course'),
    isActive: overrides.isActive ?? true,
    order: overrides.order ?? 0,
    ...overrides.extra,
  });
}

async function createTuitionFee(overrides = {}) {
  return TuitionFee.create({
    studentId: overrides.studentId,
    feeType: overrides.feeType || 'monthly',
    month: overrides.month,
    year: overrides.year,
    courseName: overrides.courseName || '',
    amount: overrides.amount ?? 500000,
    isPaid: overrides.isPaid ?? false,
    studentNotified: overrides.studentNotified ?? false,
    note: overrides.note || '',
    createdBy: overrides.createdBy,
    ...overrides.extra,
  });
}

async function createUpgradeRequest(overrides = {}) {
  return UpgradeRequest.create({
    userId: overrides.userId,
    months: overrides.months ?? 1,
    amount: overrides.amount ?? 90000,
    status: overrides.status || 'pending',
    note: overrides.note || '',
    ...overrides.extra,
  });
}

async function createSpeakingQuestion(overrides = {}) {
  return SpeakingQuestion.create({
    topic: overrides.topic || unique('Topic'),
    part: overrides.part ?? 1,
    question: overrides.question || 'Describe your hometown.',
    cueCard: overrides.cueCard || '',
    isActive: overrides.isActive ?? true,
  });
}

module.exports = {
  unique,
  defaultQuestion, defaultListeningQuestion,
  createPassage, createReadingTest, createTestAttempt,
  createListeningSection, createListeningTest,
  createWritingTask1, createWritingTask2, createWritingExam,
  createVocabUnit, createVocabBook,
  createCourse, createTuitionFee, createUpgradeRequest, createSpeakingQuestion,
  createCompletedTestAttempt, createReadingPracticeAttempt,
  createListeningAttempt, createWritingAttempt, createSpeakingAttempt,
};
