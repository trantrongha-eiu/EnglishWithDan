// Unit tests for services/listeningService.js — locks in calcBandScore's
// threshold table, flattenQuestions, and the server-side re-grading logic
// (gradeQuestionGroups, exercised only indirectly through submitTest /
// savePractice) added so the server never trusts client-supplied results.
const mongoose = require('mongoose');
const listeningService = require('../../../services/listeningService');
const { createStudent } = require('../../factories/userFactory');
const { createListeningTest, createListeningSection } = require('../../factories/contentFactory');

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
