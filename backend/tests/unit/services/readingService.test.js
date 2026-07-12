// Unit tests for services/readingService.js — locks in the server-side
// re-grading logic (gradeOne/gradeGroups, exercised only indirectly through
// the exported submitTest/savePractice/getAttemptReview functions) that was
// added so the server never trusts client-supplied isCorrect/correctCount.
const mongoose = require('mongoose');
const readingService = require('../../../services/readingService');
const { bandScoreTable } = require('../../../utils/bandScore');
const { createStudent } = require('../../factories/userFactory');
const { createPassage, createReadingTest, createTestAttempt } = require('../../factories/contentFactory');

async function makeAttempt({ student, groups, status = 'in-progress' }) {
  const test = await createReadingTest();
  const passage = await createPassage({ questionGroups: groups });
  const attempt = await createTestAttempt({
    userId: student._id,
    testId: test._id,
    passagesUsed: [passage._id],
    status,
  });
  return { test, passage, attempt };
}

describe('readingService.submitTest — plain grading', () => {
  test('grades fill-blank/sentence-completion questions, including "/"-separated alternates', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      groups: [{
        groupType: 'plain',
        interchangeableAnswers: false,
        questions: [
          { questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'blue' },
          { questionNumber: 2, type: 'sentence-completion', questionText: 'Q2', correctAnswer: 'big/large' },
        ],
      }],
    });

    const result = await readingService.submitTest(attempt._id, {
      1: 'Blue',   // case-insensitive exact match
      2: 'LARGE',  // matches the second alternate, case-insensitive
    }, student);

    expect(result).not.toBeNull();
    expect(result.correctCount).toBe(2);
    expect(result.wrongCount).toBe(0);
    expect(result.skippedCount).toBe(0);
    expect(result.totalQuestions).toBe(2);
  });

  test('grades JSON-array answers order-independently and case-insensitively', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      groups: [{
        groupType: 'plain',
        interchangeableAnswers: false,
        questions: [
          { questionNumber: 1, type: 'checkbox', questionText: 'Q1', correctAnswer: JSON.stringify(['Apple', 'Banana']) },
        ],
      }],
    });

    const result = await readingService.submitTest(attempt._id, {
      1: JSON.stringify(['banana', 'APPLE']), // reversed order + different case
    }, student);

    expect(result.correctCount).toBe(1);
    expect(result.wrongCount).toBe(0);
  });

  test('unanswered questions count as skipped, not wrong', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      groups: [{
        groupType: 'plain',
        interchangeableAnswers: false,
        questions: [
          { questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'blue' },
          { questionNumber: 2, type: 'fill-blank', questionText: 'Q2', correctAnswer: 'green' },
        ],
      }],
    });

    const result = await readingService.submitTest(attempt._id, { 1: 'blue' }, student);

    expect(result.correctCount).toBe(1);
    expect(result.wrongCount).toBe(0);
    expect(result.skippedCount).toBe(1);
  });
});

describe('readingService.submitTest — interchangeableAnswers pooling', () => {
  test('a shuffled submission still grades all-correct by consuming the shared pool without double-counting', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      groups: [{
        groupType: 'plain',
        interchangeableAnswers: true,
        questions: [
          { questionNumber: 1, type: 'sentence-completion', questionText: 'Q1', correctAnswer: 'paris' },
          { questionNumber: 2, type: 'sentence-completion', questionText: 'Q2', correctAnswer: 'london' },
          { questionNumber: 3, type: 'sentence-completion', questionText: 'Q3', correctAnswer: 'tokyo' },
        ],
      }],
    });

    // Answers deliberately shuffled relative to which question they "belong" to.
    const result = await readingService.submitTest(attempt._id, {
      1: 'london',
      2: 'tokyo',
      3: 'paris',
    }, student);

    expect(result.correctCount).toBe(3);
    expect(result.wrongCount).toBe(0);
  });

  test('a duplicate answer beyond what the pool has left is marked wrong (pool is consumed, not reused)', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      groups: [{
        groupType: 'plain',
        interchangeableAnswers: true,
        questions: [
          { questionNumber: 1, type: 'sentence-completion', questionText: 'Q1', correctAnswer: 'paris' },
          { questionNumber: 2, type: 'sentence-completion', questionText: 'Q2', correctAnswer: 'london' },
        ],
      }],
    });

    const result = await readingService.submitTest(attempt._id, {
      1: 'paris',
      2: 'paris', // pool only has one 'paris' — already consumed by Q1
    }, student);

    expect(result.correctCount).toBe(1);
    expect(result.wrongCount).toBe(1);
  });

  test('TFNG questions inside an interchangeableAnswers group are excluded from pooling and graded individually', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      groups: [{
        groupType: 'plain',
        interchangeableAnswers: true, // flag is true, but isTFNG should override it
        questions: [
          { questionNumber: 1, type: 'true-false-ng', questionText: 'Q1', correctAnswer: 'true' },
          { questionNumber: 2, type: 'true-false-ng', questionText: 'Q2', correctAnswer: 'false' },
        ],
      }],
    });

    // Swap the answers the way pool-matching would happily accept if it were
    // (wrongly) applied here — exact per-question grading must reject both.
    const result = await readingService.submitTest(attempt._id, {
      1: 'false',
      2: 'true',
    }, student);

    expect(result.correctCount).toBe(0);
    expect(result.wrongCount).toBe(2);
  });
});

describe('readingService.submitTest — server-side re-grading integrity', () => {
  test('score is computed purely from server-side passage data, ignoring any extraneous keys in the answers payload', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      groups: [{
        groupType: 'plain',
        interchangeableAnswers: false,
        questions: [
          { questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'canberra' },
        ],
      }],
    });

    // A malicious/careless client throws in extra keys that look like they
    // might influence scoring — they must be silently ignored since grading
    // only ever looks up answers by real questionNumber.
    const result = await readingService.submitTest(attempt._id, {
      1: 'not-canberra', // deliberately wrong
      correctCount: 999,
      bandScore: 9.0,
      isCorrect: true,
    }, student);

    expect(result.correctCount).toBe(0);
    expect(result.wrongCount).toBe(1);
    expect(result.bandScore).toBe(bandScoreTable('reading', 0));
  });

  test('returns null when the attempt does not exist', async () => {
    const student = await createStudent();
    const result = await readingService.submitTest(new mongoose.Types.ObjectId(), {}, student);
    expect(result).toBeNull();
  });

  test('returns null when the attempt belongs to a different user', async () => {
    const owner = await createStudent();
    const intruder = await createStudent();
    const { attempt } = await makeAttempt({
      student: owner,
      groups: [{ questions: [{ questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'x' }] }],
    });

    const result = await readingService.submitTest(attempt._id, { 1: 'x' }, intruder);
    expect(result).toBeNull();
  });

  test('returns null when the attempt is not in-progress (already completed)', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      status: 'completed',
      groups: [{ questions: [{ questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'x' }] }],
    });

    const result = await readingService.submitTest(attempt._id, { 1: 'x' }, student);
    expect(result).toBeNull();
  });
});

describe('readingService.getAttemptReview — ownership scoping', () => {
  test('returns the review for the owning user', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      status: 'completed',
      groups: [{ questions: [{ questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'x' }] }],
    });

    const review = await readingService.getAttemptReview(attempt._id, student._id);
    expect(review).not.toBeNull();
    expect(review._id.toString()).toBe(attempt._id.toString());
  });

  test('returns null for another user\'s attemptId', async () => {
    const owner = await createStudent();
    const intruder = await createStudent();
    const { attempt } = await makeAttempt({
      student: owner,
      status: 'completed',
      groups: [{ questions: [{ questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'x' }] }],
    });

    const review = await readingService.getAttemptReview(attempt._id, intruder._id);
    expect(review).toBeNull();
  });
});

describe('readingService.savePractice — server-side re-grading', () => {
  test('re-grades against the real passage instead of trusting client-supplied counts', async () => {
    const student = await createStudent();
    const passage = await createPassage({
      questionGroups: [{
        groupType: 'plain',
        interchangeableAnswers: false,
        questions: [
          { questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'blue' },
          { questionNumber: 2, type: 'fill-blank', questionText: 'Q2', correctAnswer: 'green' },
        ],
      }],
    });

    const attemptId = await readingService.savePractice({
      passageId: passage._id,
      passageTitle: 'Test Passage',
      category: 'passage1',
      answers: [
        { questionNumber: 1, userAnswer: 'blue' },
        { questionNumber: 2, userAnswer: 'wrong' },
      ],
      timeTaken: 30,
      // Client claims a perfect score — must be ignored since passageId resolves.
      correctCount: 999, wrongCount: 0, skippedCount: 0,
    }, student._id);

    const ReadingPracticeAttempt = require('../../../models/ReadingPracticeAttempt');
    const saved = await ReadingPracticeAttempt.findById(attemptId).lean();
    expect(saved.correctCount).toBe(1);
    expect(saved.wrongCount).toBe(1);
  });
});
