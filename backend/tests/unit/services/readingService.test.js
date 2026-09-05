// Unit tests for services/readingService.js — locks in the server-side
// re-grading logic (gradeOne/gradeGroups, exercised only indirectly through
// the exported submitTest/savePractice/getAttemptReview functions) that was
// added so the server never trusts client-supplied isCorrect/correctCount.
const mongoose = require('mongoose');
const readingService = require('../../../services/readingService');
const TestAttempt = require('../../../models/TestAttempt');
const { bandScoreTable } = require('../../../utils/bandScore');
const { createStudent } = require('../../factories/userFactory');
const { createPassage, createReadingTest, createTestAttempt, createCompletedTestAttempt } = require('../../factories/contentFactory');

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

  test('multi-answer-group ("Choose TWO/THREE letters") questions inside an interchangeableAnswers group are graded correctly, not via pool-matching', async () => {
    const student = await createStudent();
    // The frontend writes the SAME selected-letters JSON array to every
    // question number in the cluster (toggleMultiAnswer() in
    // reading-v2.js) — each question's own correctAnswer is a single
    // letter, correct if the shared selection includes it.
    const { attempt } = await makeAttempt({
      student,
      groups: [{
        groupType: 'plain',
        interchangeableAnswers: true, // admins toggle this ON for these clusters too — must not route to pool-matching
        questions: [
          { questionNumber: 1, type: 'multi-answer-group', questionText: 'Q1', correctAnswer: 'A' },
          { questionNumber: 2, type: 'multi-answer-group', questionText: 'Q2', correctAnswer: 'D' },
        ],
      }],
    });

    const selected = JSON.stringify(['A', 'D']);
    const result = await readingService.submitTest(attempt._id, {
      1: selected,
      2: selected,
    }, student);

    expect(result.correctCount).toBe(2);
    expect(result.wrongCount).toBe(0);
  });

  test('multi-answer-group gives partial credit when only some of the shared selection is correct', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      groups: [{
        groupType: 'plain',
        interchangeableAnswers: true,
        questions: [
          { questionNumber: 1, type: 'multi-answer-group', questionText: 'Q1', correctAnswer: 'A' },
          { questionNumber: 2, type: 'multi-answer-group', questionText: 'Q2', correctAnswer: 'D' },
        ],
      }],
    });

    const selected = JSON.stringify(['A', 'F']); // only "A" is actually correct
    const result = await readingService.submitTest(attempt._id, {
      1: selected,
      2: selected,
    }, student);

    expect(result.correctCount).toBe(1);
    expect(result.wrongCount).toBe(1);
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

  test('a resubmit on the same attemptId after a successful submit is rejected — atomic claim prevents a duplicate-processed submission', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      groups: [{ questions: [{ questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'x' }] }],
    });

    const first = await readingService.submitTest(attempt._id, { 1: 'x' }, student);
    expect(first).not.toBeNull();
    expect(first.correctCount).toBe(1);

    // A retry (e.g. a client-side timeout racing a slow-but-successful
    // first request) reusing the SAME attemptId must be rejected, not
    // silently re-graded and re-saved a second time.
    const retry = await readingService.submitTest(attempt._id, { 1: 'x' }, student);
    expect(retry).toBeNull();

    const TestAttempt = require('../../../models/TestAttempt');
    const saved = await TestAttempt.findById(attempt._id).lean();
    expect(saved.status).toBe('completed');
    expect(saved.correctCount).toBe(1); // unchanged by the rejected retry
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

  test('userId=null finds the attempt regardless of owner — the teacher/admin mock-test-monitor deep link', async () => {
    const owner = await createStudent();
    const { attempt } = await makeAttempt({
      student: owner,
      status: 'completed',
      groups: [{ questions: [{ questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'x' }] }],
    });

    const review = await readingService.getAttemptReview(attempt._id, null);
    expect(review).not.toBeNull();
    expect(review._id.toString()).toBe(attempt._id.toString());
  });
});

describe('readingService — passage snapshot immutability', () => {
  const Passage = require('../../../models/Passage');

  test('review shows the passage as-submitted even after the live Passage doc is edited', async () => {
    const student = await createStudent();
    const { attempt, passage } = await makeAttempt({
      student,
      groups: [{
        groupType: 'plain', interchangeableAnswers: false,
        questions: [{ questionNumber: 1, type: 'fill-blank', questionText: 'ORIGINAL question 1', correctAnswer: 'nutmeg' }],
      }],
    });
    await Passage.findByIdAndUpdate(passage._id, { content: 'ORIGINAL nutmeg passage.' });

    await readingService.submitTest(attempt._id, { 1: 'nutmeg' }, student);

    // Admin later rewrites the same passage doc in place.
    await Passage.findByIdAndUpdate(passage._id, {
      content: 'REPLACED henry moore passage.',
      questionGroups: [{
        groupType: 'plain', interchangeableAnswers: false,
        questions: [{ questionNumber: 1, type: 'fill-blank', questionText: 'REPLACED question 1', correctAnswer: 'sculptor' }],
      }],
    });

    const review = await readingService.getAttemptReview(attempt._id, student._id);
    expect(review.passages[0].content).toBe('ORIGINAL nutmeg passage.');
    const q = review.passages[0].questionGroups[0].questions[0];
    expect(q.questionText).toBe('ORIGINAL question 1');
    expect(q.correctAnswer).toBe('nutmeg');
    expect(q.isCorrect).toBe(true);
  });

  test('falls back to the live passage for an attempt that has no snapshot (pre-migration)', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      status: 'completed',
      groups: [{ questions: [{ questionNumber: 1, type: 'fill-blank', questionText: 'Live Q1', correctAnswer: 'x' }] }],
    });
    // createCompletedTestAttempt-style row: completed, answers present, but no passagesSnapshot.
    await TestAttempt.findByIdAndUpdate(attempt._id, {
      answers: [{ questionNumber: 1, userAnswer: 'x', correctAnswer: 'x', isCorrect: true }],
      $unset: { passagesSnapshot: 1 },
    });

    const review = await readingService.getAttemptReview(attempt._id, student._id);
    expect(review.passages[0].questionGroups[0].questions[0].questionText).toBe('Live Q1');
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

// Same accuracy→streak-bonus tiering as vocabBookService.completePractice
// (<80%=0, 80-90%=+1, >=90%=+2), sharing that service's +5/day cap.
function makeQuestions(n) {
  return Array.from({ length: n }, (_, i) => ({
    questionNumber: i + 1, type: 'fill-blank', questionText: `Q${i + 1}`, correctAnswer: `ans${i + 1}`,
  }));
}
function makeAnswers(n, correctN) {
  const answers = {};
  for (let i = 1; i <= n; i++) answers[i] = i <= correctN ? `ans${i}` : 'wrong';
  return answers;
}

describe('readingService.submitTest — streak bonus', () => {
  test('>=90% accuracy adds +2 to the streak', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      groups: [{ groupType: 'plain', interchangeableAnswers: false, questions: makeQuestions(10) }],
    });

    const result = await readingService.submitTest(attempt._id, makeAnswers(10, 9), student);

    expect(result.bonusApplied).toBe(2);
    expect(result.streak).toBe(2);
  });

  test('80-90% accuracy adds +1 to the streak', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      groups: [{ groupType: 'plain', interchangeableAnswers: false, questions: makeQuestions(10) }],
    });

    const result = await readingService.submitTest(attempt._id, makeAnswers(10, 8), student);

    expect(result.bonusApplied).toBe(1);
    expect(result.streak).toBe(1);
  });

  test('below 80% accuracy adds no streak bonus (but still counts as today\'s activity)', async () => {
    const student = await createStudent();
    const { attempt } = await makeAttempt({
      student,
      groups: [{ groupType: 'plain', interchangeableAnswers: false, questions: makeQuestions(10) }],
    });

    const result = await readingService.submitTest(attempt._id, makeAnswers(10, 5), student);

    expect(result.bonusApplied).toBe(0);
    expect(result.streak).toBe(0);
  });

  test('shares the +5/day streak-bonus cap with vocab practice', async () => {
    const student = await createStudent();
    // Simulate the student already having earned 4/5 of today's shared streak
    // bonus from vocab practice (VocabActivity is the same per-day counter
    // reserveDailyStreakBonus uses for reading/listening/vocab alike).
    const VocabActivity = require('../../../models/VocabActivity');
    const { todayVNDate } = require('../../../services/streakBonusService');
    await VocabActivity.create({ userId: student._id, date: todayVNDate(), streakBonusEarned: 4 });

    const { attempt } = await makeAttempt({
      student,
      groups: [{ groupType: 'plain', interchangeableAnswers: false, questions: makeQuestions(10) }],
    });
    // Wants +2 (100% accuracy), but only 1 is left in today's shared cap.
    const result = await readingService.submitTest(attempt._id, makeAnswers(10, 10), student);

    expect(result.bonusApplied).toBe(1);
    expect(result.streak).toBe(1);
  });
});

describe('readingService.startTest — fixed vs. random passage selection', () => {
  test('a test with 3 passageIds always serves those exact passages, in order', async () => {
    const student = await createStudent();
    const p1 = await createPassage({ category: 'passage1', title: 'Fixed P1', isActualTest: true });
    const p2 = await createPassage({ category: 'passage2', title: 'Fixed P2', isActualTest: true });
    const p3 = await createPassage({ category: 'passage3', title: 'Fixed P3', isActualTest: true });
    const test = await createReadingTest({ name: 'Actual Mocktest 1', passageIds: [p1._id, p2._id, p3._id] });

    const result = await readingService.startTest(test._id, student._id);

    expect(result.status).toBe('ok');
    expect(result.passages.map(p => p.title)).toEqual(['Fixed P1', 'Fixed P2', 'Fixed P3']);

    // Repeating startTest for the same fixed test yields the same passages
    // again — no $sample randomness involved.
    const result2 = await readingService.startTest(test._id, student._id);
    expect(result2.passages.map(p => p.title)).toEqual(['Fixed P1', 'Fixed P2', 'Fixed P3']);
  });

  test('a test with no passageIds falls back to random sampling from isActualTest passages', async () => {
    const student = await createStudent();
    await createPassage({ category: 'passage1', isActualTest: true });
    await createPassage({ category: 'passage2', isActualTest: true });
    await createPassage({ category: 'passage3', isActualTest: true });
    const test = await createReadingTest({ name: 'MockTest Đề Random' });

    const result = await readingService.startTest(test._id, student._id);

    expect(result.status).toBe('ok');
    expect(result.passages).toHaveLength(3);
    expect(result.passages.map(p => p.category)).toEqual(['passage1', 'passage2', 'passage3']);
  });

  test('a fixed test whose passage was deactivated in the meantime fails gracefully', async () => {
    const student = await createStudent();
    const p1 = await createPassage({ category: 'passage1', isActualTest: true, isActive: false });
    const p2 = await createPassage({ category: 'passage2', isActualTest: true });
    const p3 = await createPassage({ category: 'passage3', isActualTest: true });
    const test = await createReadingTest({ passageIds: [p1._id, p2._id, p3._id] });

    const result = await readingService.startTest(test._id, student._id);
    expect(result.status).toBe('insufficient_data');
  });

  // BUG-010: calling /start twice without submitting (a refreshed tab, a
  // second tab) previously inserted a second in-progress TestAttempt row
  // every time. Also verifies the resumed attempt shows the SAME
  // passages, not a freshly re-randomized set — this test uses the random
  // (no passageIds) branch specifically since that's where a re-roll
  // would be observable.
  test('startTest() called twice reuses the same attempt AND the same randomly-selected passages', async () => {
    const student = await createStudent();
    await createPassage({ category: 'passage1', isActualTest: true });
    await createPassage({ category: 'passage2', isActualTest: true });
    await createPassage({ category: 'passage3', isActualTest: true });
    const test = await createReadingTest({ name: 'MockTest Đề Random' });

    const first = await readingService.startTest(test._id, student._id);
    const second = await readingService.startTest(test._id, student._id);

    expect(second.attemptId.toString()).toBe(first.attemptId.toString());
    expect(second.passages.map(p => p._id.toString())).toEqual(first.passages.map(p => p._id.toString()));
    const count = await TestAttempt.countDocuments({ userId: student._id, testId: test._id });
    expect(count).toBe(1);
  });

  // The reused row must never be invalidated — submitTest()'s own
  // findOneAndUpdate requires status:'in-progress' in its filter, so
  // changing it away from that on a second /start call would silently
  // reject a legitimate late submission from the original session.
  test('after a second startTest() call, the ORIGINAL attemptId can still be submitted successfully', async () => {
    const student = await createStudent();
    const p1 = await createPassage({ category: 'passage1', isActualTest: true });
    const p2 = await createPassage({ category: 'passage2', isActualTest: true });
    const p3 = await createPassage({ category: 'passage3', isActualTest: true });
    const test = await createReadingTest({ passageIds: [p1._id, p2._id, p3._id] });

    const first = await readingService.startTest(test._id, student._id);
    await readingService.startTest(test._id, student._id); // second tab/refresh

    const result = await readingService.submitTest(first.attemptId, {}, { _id: student._id });
    expect(result).not.toBeNull();
  });
});

describe('readingService.listTestsForUser — isFixed flag', () => {
  test('marks a 3-passageIds test as fixed and a passageIds-less test as not fixed', async () => {
    const student = await createStudent();
    const p1 = await createPassage({ category: 'passage1' });
    const p2 = await createPassage({ category: 'passage2' });
    const p3 = await createPassage({ category: 'passage3' });
    await createReadingTest({ name: 'Actual Mocktest 1', passageIds: [p1._id, p2._id, p3._id] });
    await createReadingTest({ name: 'MockTest Đề Random' });

    const tests = await readingService.listTestsForUser(student._id);
    const fixed = tests.find(t => t.name === 'Actual Mocktest 1');
    const random = tests.find(t => t.name === 'MockTest Đề Random');

    expect(fixed.isFixed).toBe(true);
    expect(random.isFixed).toBe(false);
  });
});

describe('readingService.listAdminAttempts / getAdminAttemptsStats', () => {
  test('listAdminAttempts only returns completed attempts, populated with user/test, newest first', async () => {
    const student = await createStudent();
    const test = await createReadingTest({ name: 'Cambridge 18 Test 1' });
    await createTestAttempt({ userId: student._id, testId: test._id, status: 'in-progress' }); // excluded
    const older = await createCompletedTestAttempt({ userId: student._id, testId: test._id, bandScore: 6, endTime: new Date(Date.now() - 60000) });
    const newer = await createCompletedTestAttempt({ userId: student._id, testId: test._id, bandScore: 7, endTime: new Date() });

    const { attempts, total } = await readingService.listAdminAttempts({ page: 1, limit: 50 });

    expect(total).toBe(2);
    expect(attempts.map(a => a._id.toString())).toEqual([newer._id.toString(), older._id.toString()]);
    expect(attempts[0].userId.username).toBe(student.username);
    expect(attempts[0].testId.name).toBe('Cambridge 18 Test 1');
  });

  test('listAdminAttempts filters by testId and userId', async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    const testA = await createReadingTest();
    const testB = await createReadingTest();
    await createCompletedTestAttempt({ userId: studentA._id, testId: testA._id });
    await createCompletedTestAttempt({ userId: studentB._id, testId: testB._id });

    const byTest = await readingService.listAdminAttempts({ testId: testA._id, page: 1, limit: 50 });
    expect(byTest.total).toBe(1);
    expect(byTest.attempts[0].testId._id.toString()).toBe(testA._id.toString());

    const byUser = await readingService.listAdminAttempts({ userId: studentB._id, page: 1, limit: 50 });
    expect(byUser.total).toBe(1);
    expect(byUser.attempts[0].userId._id.toString()).toBe(studentB._id.toString());
  });

  test('getAdminAttemptsStats computes overview/byTest/topStudents from completed attempts only', async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    const test = await createReadingTest({ name: 'Stats Test' });
    await createTestAttempt({ userId: studentA._id, testId: test._id, status: 'in-progress' }); // excluded
    await createCompletedTestAttempt({ userId: studentA._id, testId: test._id, bandScore: 6, correctCount: 24 });
    await createCompletedTestAttempt({ userId: studentB._id, testId: test._id, bandScore: 8, correctCount: 36 });

    const stats = await readingService.getAdminAttemptsStats();

    expect(stats.overview.totalAttempts).toBe(2);
    expect(stats.overview.avgBand).toBeCloseTo(7, 5);
    expect(stats.overview.maxBand).toBe(8);
    expect(stats.overview.minBand).toBe(6);

    expect(stats.byTest).toHaveLength(1);
    expect(stats.byTest[0].testName).toBe('Stats Test');
    expect(stats.byTest[0].totalAttempts).toBe(2);

    expect(stats.topStudents).toHaveLength(2);
    expect(stats.topStudents[0].bestBand).toBe(8);
    expect(stats.topStudents[0].user.username).toBe(studentB.username);
  });

  test('getAdminAttemptsStats scoped to one testId excludes attempts on other tests', async () => {
    const student = await createStudent();
    const testA = await createReadingTest();
    const testB = await createReadingTest();
    await createCompletedTestAttempt({ userId: student._id, testId: testA._id, bandScore: 5 });
    await createCompletedTestAttempt({ userId: student._id, testId: testB._id, bandScore: 9 });

    const stats = await readingService.getAdminAttemptsStats(testA._id);

    expect(stats.overview.totalAttempts).toBe(1);
    expect(stats.overview.avgBand).toBe(5);
  });
});
