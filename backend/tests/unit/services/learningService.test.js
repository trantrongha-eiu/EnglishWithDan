'use strict';

const learningService = require('../../../services/learningService');
const goalService = require('../../../services/goalService');
const User = require('../../../models/User');
const { createStudent } = require('../../factories/userFactory');
const {
  createCompletedTestAttempt, createWritingAttempt,
} = require('../../factories/contentFactory');
const { todayVNDate } = require('../../../services/streakBonusService');

// Computed dynamically (not hard-coded to whichever weekday the suite
// happens to run on) — DAY_CODES index matches JS's native getUTCDay()
// (0=Sun..6=Sat), same convention studyPlanService's own DAY_INDEX inverts.
const DAY_CODES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
function todayCode() { return DAY_CODES[todayVNDate().getUTCDay()]; }
function otherCode() { return todayCode() === 'mon' ? 'tue' : 'mon'; } // any day that's never today

const future = days => new Date(Date.now() + days * 86400000);

const gradeBlock = (ta, cc, lr, gra) => ({
  bandScore: (ta + cc + lr + gra) / 4,
  ta: { score: ta }, cc: { score: cc }, lr: { score: lr }, gra: { score: gra },
});

async function setGoal(userId, overrides = {}) {
  await User.updateOne({ _id: userId }, { $set: {
    currentBand: 5.5, targetBand: 7.0, targetExamDate: future(90),
    weeklyStudyMinutes: 240, studyDays: [todayCode()], preferredSessionMinutes: 60,
    ...overrides,
  } });
}

describe('learningService.getTodayLearning', () => {
  it('Test A — no goal: no actionable learning, honest onboarding message', async () => {
    const student = await createStudent();
    const result = await learningService.getTodayLearning(student._id);
    expect(result.hasGoal).toBe(false);
    expect(result.hasPlan).toBe(false);
    expect(result.sessions).toEqual([]);
    expect(result.message).toMatch(/set your ielts goal/i);
  });

  it('goal exists but no study plan (no availability configured yet)', async () => {
    const student = await createStudent();
    await goalService.updateGoal(student._id, { currentBand: 5.5, targetBand: 7.0 }); // no weeklyStudyMinutes/studyDays/session
    const result = await learningService.getTodayLearning(student._id);
    expect(result.hasGoal).toBe(true);
    expect(result.hasPlan).toBe(false);
    expect(result.sessions).toEqual([]);
    expect(result.message).toMatch(/set up your study availability/i);
  });

  it('Test B — valid goal + valid study plan: returns today\'s sessions', async () => {
    const student = await createStudent();
    await setGoal(student._id);
    const result = await learningService.getTodayLearning(student._id);
    expect(result.hasGoal).toBe(true);
    expect(result.hasPlan).toBe(true);
    expect(result.isStudyDay).toBe(true);
    expect(result.sessions.length).toBeGreaterThan(0);
    expect(result.date).toBe(todayVNDate().toISOString().slice(0, 10));
  });

  it('Test C — today is not a study day: no error, no sessions, no borrowing another day', async () => {
    const student = await createStudent();
    await setGoal(student._id, { studyDays: [otherCode()] }); // deliberately excludes today
    const result = await learningService.getTodayLearning(student._id);
    expect(result.hasGoal).toBe(true);
    expect(result.hasPlan).toBe(true);
    expect(result.isStudyDay).toBe(false);
    expect(result.sessions).toEqual([]);
    expect(result.message).toMatch(/not one of your scheduled study days/i);
  });

  it('Test D — one scheduled category: a tiny session budget yields exactly one item', async () => {
    const student = await createStudent();
    await setGoal(student._id, { weeklyStudyMinutes: 10, preferredSessionMinutes: 10 });
    const result = await learningService.getTodayLearning(student._id);
    expect(result.isStudyDay).toBe(true);
    expect(result.sessions).toHaveLength(1);
  });

  it('Test E — multiple categories: a full-size session mixes more than one', async () => {
    const student = await createStudent();
    await setGoal(student._id, { weeklyStudyMinutes: 240, preferredSessionMinutes: 60 });
    const result = await learningService.getTodayLearning(student._id);
    expect(result.sessions.length).toBeGreaterThan(1);
  });

  it('Test F — recommendation exists: uses the recommendation\'s own action/reason verbatim, not invented text', async () => {
    const student = await createStudent();
    await setGoal(student._id, { currentBand: 5.5, targetBand: 7.0 });
    // Clear reading weakness -> READING_WEAK_TYPE recommendation exists.
    const { createPassage, createReadingPracticeAttempt } = require('../../factories/contentFactory');
    const passage = await createPassage({
      questionRange: { start: 1, end: 4 },
      questionGroups: [{ groupType: 'plain', questions: [1, 2, 3, 4].map(n => ({ questionNumber: n, type: 'sentence-completion', questionText: `Q${n}`, correctAnswer: 'a' })) }],
    });
    await createReadingPracticeAttempt({
      userId: student._id, passageId: passage._id,
      answers: [1, 2, 3, 4].map(n => ({ questionNumber: n, userAnswer: 'x', correctAnswer: 'a', isCorrect: false })),
    });
    const result = await learningService.getTodayLearning(student._id);
    const readingItem = result.sessions.find(s => s.category === 'reading');
    expect(readingItem).toBeTruthy();
    expect(readingItem.recommendationType).toBe('READING_WEAK_TYPE');
    expect(readingItem.reason).toBe('You scored 0% correctly on "sentence-completion" across your last 4 attempts.');
  });

  it('Test G — no matching recommendation: a safe category-level action, never a fabricated weakness claim', async () => {
    const student = await createStudent();
    await setGoal(student._id); // no practice history seeded at all
    const result = await learningService.getTodayLearning(student._id);
    for (const s of result.sessions) {
      expect(s.recommendationType).toBeNull();
      expect(s.reason.toLowerCase()).not.toMatch(/\bweak\b/);
      expect(s.action.length).toBeGreaterThan(0);
    }
  });

  it('Test H — insufficient performance data: reason says so honestly, never invents a band/accuracy claim', async () => {
    const student = await createStudent();
    await setGoal(student._id, { currentBand: 5.5, targetBand: 7.0 });
    const result = await learningService.getTodayLearning(student._id);
    const readingItem = result.sessions.find(s => s.category === 'reading');
    expect(readingItem.reason).toMatch(/not available yet/i);
    expect(readingItem.reason).not.toMatch(/\d+(\.\d+)?%|band \d/i); // no fabricated number
  });

  it('Test I — vocabulary recommendation maps to the existing vocabulary practice flow', async () => {
    const student = await createStudent();
    await setGoal(student._id);
    const { createVocabBook } = require('../../factories/contentFactory');
    await createVocabBook({ userId: student._id, words: Array.from({ length: 12 }, (_, i) => ({ word: `w${i}`, nextReviewAt: null })) });
    const result = await learningService.getTodayLearning(student._id);
    const vocabItem = result.sessions.find(s => s.category === 'vocabulary');
    expect(vocabItem).toBeTruthy();
    expect(vocabItem.practiceType).toBe('vocabulary');
    expect(vocabItem.practiceUrl).toBe('dashboard.html');
    expect(vocabItem.recommendationType).toBe('VOCAB_REVIEW');
  });

  it('Test J — returned session minutes match the underlying study plan exactly', async () => {
    const student = await createStudent();
    await setGoal(student._id);
    const studyPlanService = require('../../../services/studyPlanService');
    const plan = await studyPlanService.getStudyPlan(student._id);
    const todaysPlanSession = plan.sessions.find(s => s.date === todayVNDate().toISOString().slice(0, 10));

    const result = await learningService.getTodayLearning(student._id);
    expect(result.sessions.map(s => s.minutes)).toEqual(todaysPlanSession.items.map(i => i.minutes));
  });

  it('Test K — returned totalMinutes equals the sum of today\'s returned sessions', async () => {
    const student = await createStudent();
    await setGoal(student._id);
    const result = await learningService.getTodayLearning(student._id);
    const sum = result.sessions.reduce((s, i) => s + i.minutes, 0);
    expect(result.totalMinutes).toBe(sum);
  });

  it('today is a study day but the weekly allocation ran out before reaching it (known Priority 2B debt) — honest empty message, not a silent/confusing blank', async () => {
    const student = await createStudent();
    // 6 study days but weeklyStudyMinutes only covers ~1 day's worth —
    // reproduces the Priority 2B audit's Finding 1 at the learning-API layer.
    await setGoal(student._id, { weeklyStudyMinutes: 60, studyDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'], preferredSessionMinutes: 60 });
    const result = await learningService.getTodayLearning(student._id);
    if (result.sessions.length === 0 && result.isStudyDay) {
      expect(result.message).toMatch(/no specific practice was allocated/i);
    } else {
      expect(result.totalMinutes).toBe(result.sessions.reduce((s, i) => s + i.minutes, 0));
    }
  });

  it('does not modify the user/goal/plan — calling it repeatedly returns the same logical result', async () => {
    const student = await createStudent();
    await setGoal(student._id);
    const first = await learningService.getTodayLearning(student._id);
    const second = await learningService.getTodayLearning(student._id);
    expect(first).toEqual(second);
  });

  it('past exam date / legacy goal data does not crash and does not invent claims', async () => {
    const student = await createStudent();
    await setGoal(student._id, { targetExamDate: new Date(Date.now() - 10 * 86400000) });
    const result = await learningService.getTodayLearning(student._id);
    expect(result.hasPlan).toBe(true);
    expect(result.goal.isPastExamDate).toBe(true);
  });
});
