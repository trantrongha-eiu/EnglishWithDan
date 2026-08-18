// Unit tests for services/listeningService.js — locks in calcBandScore's
// threshold table, flattenQuestions, and the server-side re-grading logic
// (gradeQuestionGroups, exercised only indirectly through submitTest /
// savePractice) added so the server never trusts client-supplied results.
const mongoose = require('mongoose');
const listeningService = require('../../../services/listeningService');
const ListeningAttempt = require('../../../models/ListeningAttempt');
const { createStudent } = require('../../factories/userFactory');
const { createListeningTest, createListeningSection, createListeningAttempt } = require('../../factories/contentFactory');

describe('listeningService.calcBandScore', () => {
  test('matches the official raw-score threshold table at key boundaries', () => {
    expect(listeningService.calcBandScore(39)).toBe(9.0);
    expect(listeningService.calcBandScore(40)).toBe(9.0); // above max still tops out at 9.0
    expect(listeningService.calcBandScore(38)).toBe(8.5);
    expect(listeningService.calcBandScore(37)).toBe(8.5);
    expect(listeningService.calcBandScore(30)).toBe(7.0);
    expect(listeningService.calcBandScore(4)).toBe(2.5);
    expect(listeningService.calcBandScore(0)).toBe(2.0); // floor
    expect(listeningService.calcBandScore(1)).toBe(2.0); // floor
  });
});

describe('listeningService.flattenQuestions', () => {
  test('flattens sections -> questionGroups -> questions into one flat array', () => {
    const sections = [
      {
        questionGroups: [
          { questions: [{ questionNumber: 1 }, { questionNumber: 2 }] },
          { questions: [{ questionNumber: 3 }] },
        ],
      },
      {
        questionGroups: [
          { questions: [{ questionNumber: 4 }] },
        ],
      },
    ];
    const flat = listeningService.flattenQuestions(sections);
    expect(flat.map(q => q.questionNumber)).toEqual([1, 2, 3, 4]);
  });
});

describe('listeningService.startTest / submitTest — attempt persistence', () => {
  // Regression coverage for the audit finding "an abandoned Listening mock
  // test leaves no record at all" — startTest() previously persisted
  // nothing; submitTest() always inserted a brand-new document. Now
  // startTest() writes a status:'in-progress' row immediately, and
  // submitTest() updates that SAME row instead of inserting a second one.
  async function makeSimpleTest() {
    return createListeningTest({
      sections: [{
        partNumber: 1, title: 'Part 1', questionRange: { start: 1, end: 2 },
        questionGroups: [{
          groupType: 'plain', interchangeableAnswers: false,
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'yes' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Q2', correctAnswer: 'no' },
          ],
        }],
      }],
    });
  }

  test('startTest() persists an in-progress attempt immediately, before any answer is submitted', async () => {
    const student = await createStudent();
    const test = await makeSimpleTest();

    const started = await listeningService.startTest(test._id.toString(), student._id);
    expect(started.attemptId).toBeTruthy();

    const saved = await ListeningAttempt.findById(started.attemptId).lean();
    expect(saved).not.toBeNull();
    expect(saved.status).toBe('in-progress');
    expect(saved.userId.toString()).toBe(student._id.toString());
    expect(saved.totalQuestions).toBe(2);
  });

  test('submitTest() with the attemptId from startTest() updates that same row rather than inserting a second one', async () => {
    const student = await createStudent();
    const test = await makeSimpleTest();

    const started = await listeningService.startTest(test._id.toString(), student._id);
    const result = await listeningService.submitTest(
      test._id.toString(),
      { answers: { 1: 'yes', 2: 'no' }, attemptId: started.attemptId },
      student
    );

    expect(result.attemptId.toString()).toBe(started.attemptId.toString());
    const count = await ListeningAttempt.countDocuments({ userId: student._id, testId: test._id });
    expect(count).toBe(1); // not 2 — the in-progress row was updated, not left behind

    const saved = await ListeningAttempt.findById(started.attemptId).lean();
    expect(saved.status).toBe('completed');
    expect(saved.correctCount).toBe(2);
  });

  test('submitTest() without a matching attemptId still succeeds (back-compat for a session started before this fix)', async () => {
    const student = await createStudent();
    const test = await makeSimpleTest();

    const result = await listeningService.submitTest(
      test._id.toString(),
      { answers: { 1: 'yes', 2: 'no' } }, // no attemptId at all
      student
    );

    expect(result).not.toBeNull();
    expect(result.correctCount).toBe(2);
    const saved = await ListeningAttempt.findById(result.attemptId).lean();
    expect(saved.status).toBe('completed');
  });

  test('submitTest() rejects (returns null) a resubmit with an attemptId that is already completed — does not fabricate a duplicate attempt', async () => {
    const student = await createStudent();
    const test = await makeSimpleTest();

    const started = await listeningService.startTest(test._id.toString(), student._id);
    await listeningService.submitTest(
      test._id.toString(),
      { answers: { 1: 'yes', 2: 'no' }, attemptId: started.attemptId },
      student
    );

    // A retry (e.g. a client-side timeout racing a slow-but-successful
    // first submit — see listening.html's submitExam()) reusing the SAME
    // attemptId must be rejected, not silently create a second completed
    // attempt — especially since the resubmit could carry answers the
    // student only knows because the first submit's response revealed them.
    const retryResult = await listeningService.submitTest(
      test._id.toString(),
      { answers: { 1: 'yes', 2: 'no' }, attemptId: started.attemptId },
      student
    );

    expect(retryResult).toBeNull();
    const count = await ListeningAttempt.countDocuments({ userId: student._id, testId: test._id });
    expect(count).toBe(1); // still exactly one attempt, not two
  });

  test("getHistory() excludes in-progress rows (a student's own history shouldn't show unfinished attempts)", async () => {
    const student = await createStudent();
    const test = await makeSimpleTest();

    await listeningService.startTest(test._id.toString(), student._id); // left in-progress on purpose
    await listeningService.submitTest(test._id.toString(), { answers: { 1: 'yes', 2: 'no' } }, student);

    const history = await listeningService.getHistory(student._id);
    expect(history).toHaveLength(1);
    expect(history[0].status).toBe('completed');
  });
});

describe('listeningService.submitTest — grading through the real test document', () => {
  async function makeTest() {
    return createListeningTest({
      sections: [
        {
          partNumber: 1,
          title: 'Part 1',
          questionRange: { start: 1, end: 3 },
          questionGroups: [{
            groupType: 'plain',
            interchangeableAnswers: false,
            questions: [
              { questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'sunny/bright' },
              { questionNumber: 2, type: 'multi-answer-group', questionText: 'Q2', correctAnswer: 'B' },
              { questionNumber: 3, type: 'checkbox', questionText: 'Q3', correctAnswer: JSON.stringify(['a', 'b']) },
            ],
          }],
        },
        {
          partNumber: 2,
          title: 'Part 2',
          questionRange: { start: 4, end: 7 },
          questionGroups: [{
            groupType: 'plain',
            interchangeableAnswers: true,
            questions: [
              { questionNumber: 4, type: 'fill-blank', questionText: 'Q4', correctAnswer: 'paris' },
              { questionNumber: 5, type: 'fill-blank', questionText: 'Q5', correctAnswer: 'london' },
              { questionNumber: 6, type: 'fill-blank', questionText: 'Q6', correctAnswer: 'tokyo' },
              { questionNumber: 7, type: 'fill-blank', questionText: 'Q7', correctAnswer: 'unanswered' },
            ],
          }],
        },
      ],
    });
  }

  test('grades fill-blank alternates, multi-answer-group, checkbox, interchangeable pooling, and skips unanswered', async () => {
    const student = await createStudent();
    const test = await makeTest();

    const answers = {
      1: 'Bright',                              // "/"-alternate, case-insensitive
      2: JSON.stringify(['b']),                  // multi-answer-group: array .includes() correctAnswer
      3: JSON.stringify(['B', 'A']),              // checkbox: sorted, case-insensitive
      4: 'london',                                // pool-matched out of order
      5: 'tokyo',
      6: 'paris',
      // 7 left unanswered on purpose
    };

    const result = await listeningService.submitTest(test._id.toString(), { answers }, student);

    expect(result).not.toBeNull();
    expect(result.totalQuestions).toBe(7);
    expect(result.correctCount).toBe(6);
    expect(result.wrongCount).toBe(0);
    expect(result.skippedCount).toBe(1);
    expect(result.bandScore).toBe(listeningService.calcBandScore(6));
  });

  test('returns null for a nonexistent test id', async () => {
    const student = await createStudent();
    const result = await listeningService.submitTest(new mongoose.Types.ObjectId().toString(), { answers: {} }, student);
    expect(result).toBeNull();
  });
});

// Regression coverage for the multi-answer-group half of a fix applied to
// gradeQuestionGroups()'s interchangeableAnswers pool-matching. (A TFNG
// exclusion was fixed alongside it, matching Reading's own gradeGroups()
// and this function's pre-refactor ancestor in routes/listening.js — but
// TFNG/yes-no-ng aren't valid Listening question types at the schema level
// (ListeningTest/ListeningSection's type enum has no such value, unlike
// Passage's), so that half is defensive/unreachable, not something a real
// document can exercise; no test can construct one.)
describe('listeningService.submitTest — interchangeableAnswers must not swallow multi-answer-group', () => {
  async function makeInterchangeableTest(groupQuestions) {
    return createListeningTest({
      sections: [{
        partNumber: 1,
        title: 'Part 1',
        questionRange: { start: 1, end: groupQuestions.length },
        questionGroups: [{
          groupType: 'plain',
          interchangeableAnswers: true, // admins toggle this ON for these clusters too — must not route to pool-matching
          questions: groupQuestions,
        }],
      }],
    });
  }

  test('multi-answer-group questions inside an interchangeableAnswers group are graded via array-includes, not pool-matched', async () => {
    const student = await createStudent();
    const test = await makeInterchangeableTest([
      { questionNumber: 1, type: 'multi-answer-group', questionText: 'Q1', correctAnswer: 'A' },
      { questionNumber: 2, type: 'multi-answer-group', questionText: 'Q2', correctAnswer: 'D' },
    ]);

    const selected = JSON.stringify(['A', 'D']);
    const result = await listeningService.submitTest(test._id.toString(), {
      answers: { 1: selected, 2: selected },
    }, student);

    expect(result.correctCount).toBe(2);
    expect(result.wrongCount).toBe(0);
  });
});

describe('listeningService.savePractice', () => {
  test('re-grades server-side and returns null if the sectionId does not exist', async () => {
    const student = await createStudent();
    const result = await listeningService.savePractice({
      sectionId: new mongoose.Types.ObjectId().toString(),
      answers: [],
      timeTaken: 10,
    }, student._id);
    expect(result).toBeNull();
  });

  test('grades a real section, ignoring any client-side score claims', async () => {
    const student = await createStudent();
    const section = await createListeningSection({
      partNumber: 1,
      questionGroups: [{
        groupType: 'plain',
        interchangeableAnswers: false,
        questions: [
          { questionNumber: 1, type: 'fill-blank', questionText: 'Q1', correctAnswer: 'blue' },
          { questionNumber: 2, type: 'fill-blank', questionText: 'Q2', correctAnswer: 'green' },
        ],
      }],
    });

    const result = await listeningService.savePractice({
      sectionId: section._id,
      sectionTitle: 'Practice Section',
      partNumber: 1,
      answers: [
        { questionNumber: 1, userAnswer: 'blue' },
        { questionNumber: 2, userAnswer: 'wrong' },
      ],
      timeTaken: 20,
    }, student._id);

    expect(result.correctCount).toBe(1);
    expect(result.totalQuestions).toBe(2);
  });
});

// Same accuracy→streak-bonus tiering as vocabBookService.completePractice
// (<80%=0, 80-90%=+1, >=90%=+2), sharing that service's +5/day cap.
describe('listeningService.submitTest — streak bonus', () => {
  async function makeTenQuestionTest() {
    return createListeningTest({
      sections: [{
        partNumber: 1,
        title: 'Part 1',
        questionRange: { start: 1, end: 10 },
        questionGroups: [{
          groupType: 'plain',
          interchangeableAnswers: false,
          questions: Array.from({ length: 10 }, (_, i) => ({
            questionNumber: i + 1, type: 'fill-blank', questionText: `Q${i + 1}`, correctAnswer: `ans${i + 1}`,
          })),
        }],
      }],
    });
  }
  function makeAnswers(correctN) {
    const answers = {};
    for (let i = 1; i <= 10; i++) answers[i] = i <= correctN ? `ans${i}` : 'wrong';
    return answers;
  }

  test('>=90% accuracy adds +2 to the streak', async () => {
    const student = await createStudent();
    const test = await makeTenQuestionTest();

    const result = await listeningService.submitTest(test._id.toString(), { answers: makeAnswers(9) }, student);

    expect(result.bonusApplied).toBe(2);
    expect(result.streak).toBe(2);
  });

  test('80-90% accuracy adds +1 to the streak', async () => {
    const student = await createStudent();
    const test = await makeTenQuestionTest();

    const result = await listeningService.submitTest(test._id.toString(), { answers: makeAnswers(8) }, student);

    expect(result.bonusApplied).toBe(1);
    expect(result.streak).toBe(1);
  });

  test('below 80% accuracy adds no streak bonus', async () => {
    const student = await createStudent();
    const test = await makeTenQuestionTest();

    const result = await listeningService.submitTest(test._id.toString(), { answers: makeAnswers(5) }, student);

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

    const test = await makeTenQuestionTest();
    // Wants +2 (100% accuracy), but only 1 is left in today's shared cap.
    const result = await listeningService.submitTest(test._id.toString(), { answers: makeAnswers(10) }, student);

    expect(result.bonusApplied).toBe(1);
    expect(result.streak).toBe(1);
  });
});

// Regression coverage: startTest() persists an 'in-progress' ListeningAttempt
// row the moment a student opens a test (so an abandoned session isn't lost
// entirely), but listAdminAttempts/getAdminAttemptsStats had no status
// filter at all — unlike readingService.js's equivalents, which explicitly
// scope to status:'completed'. Every abandoned/never-submitted session
// (bandScore 0, correctCount 0) was counted in admin-facing totals/averages
// and shown in the admin attempts list as if it were a real submission.
describe('listeningService.listAdminAttempts / getAdminAttemptsStats', () => {
  test('listAdminAttempts only returns completed attempts', async () => {
    const student = await createStudent();
    const test = await createListeningTest({ name: 'Cambridge 18 Test 1' });
    await createListeningAttempt({ userId: student._id, testId: test._id, status: 'in-progress' }); // excluded
    const completed = await createListeningAttempt({ userId: student._id, testId: test._id, bandScore: 7 });

    const { attempts, total } = await listeningService.listAdminAttempts({ page: 1, limit: 50 });

    expect(total).toBe(1);
    expect(attempts.map(a => a._id.toString())).toEqual([completed._id.toString()]);
  });

  test('getAdminAttemptsStats computes overview from completed attempts only', async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    const test = await createListeningTest({ name: 'Stats Test' });
    await createListeningAttempt({ userId: studentA._id, testId: test._id, status: 'in-progress', bandScore: 0, correctCount: 0 }); // excluded
    await createListeningAttempt({ userId: studentA._id, testId: test._id, bandScore: 6, correctCount: 24 });
    await createListeningAttempt({ userId: studentB._id, testId: test._id, bandScore: 8, correctCount: 36 });

    const stats = await listeningService.getAdminAttemptsStats();

    expect(stats.overview.totalAttempts).toBe(2); // not 3 — the in-progress row is excluded
    expect(stats.overview.avgBand).toBeCloseTo(7, 5); // not dragged down by the 0-scored in-progress row
  });
});
