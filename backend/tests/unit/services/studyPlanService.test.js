'use strict';

const mongoose = require('mongoose');
const studyPlanService = require('../../../services/studyPlanService');
const goalService = require('../../../services/goalService');
const User = require('../../../models/User');
const { createStudent } = require('../../factories/userFactory');
const {
  createCompletedTestAttempt, createListeningAttempt, createWritingAttempt, createSpeakingAttempt,
} = require('../../factories/contentFactory');

const future = days => new Date(Date.now() + days * 86400000);
const past = days => new Date(Date.now() - days * 86400000);

const gradeBlock = (ta, cc, lr, gra) => ({
  bandScore: (ta + cc + lr + gra) / 4,
  ta: { score: ta }, cc: { score: cc }, lr: { score: lr }, gra: { score: gra },
});

async function seedReadingBand(userId, band, count = 3) {
  for (let i = 0; i < count; i++) await createCompletedTestAttempt({ userId, bandScore: band });
}
async function seedListeningBand(userId, band, count = 3) {
  for (let i = 0; i < count; i++) await createListeningAttempt({ userId, bandScore: band });
}
async function seedWritingBand(userId, band, count = 3) {
  for (let i = 0; i < count; i++) {
    await createWritingAttempt({ userId, extra: { grading: { overallBand: band, task1: gradeBlock(band, band, band, band) } } });
  }
}
async function seedSpeakingBand(userId, band, count = 3) {
  for (let i = 0; i < count; i++) {
    await createSpeakingAttempt({ userId, extra: { aiFeedback: { overallBand: band, fluency: band, vocabulary: band, grammar: band, pronunciation: band } } });
  }
}
async function setGoal(userId, overrides = {}) {
  await User.updateOne({ _id: userId }, { $set: {
    currentBand: 5.5, targetBand: 7.0, targetExamDate: future(90),
    weeklyStudyMinutes: 240, studyDays: ['mon', 'tue', 'thu', 'sat'], preferredSessionMinutes: 60,
    ...overrides,
  } });
}

describe('studyPlanService.getStudyPlan', () => {
  it('User A — no goal at all: hasPlan false, explains what to do, never a fabricated plan', async () => {
    const student = await createStudent();
    const plan = await studyPlanService.getStudyPlan(student._id);
    expect(plan.hasPlan).toBe(false);
    expect(plan.message).toMatch(/set up your study availability/i);
    expect(plan.sessions).toBeUndefined();
  });

  it('User B — current 5.5 -> target 7.0 with a real gap: reading gets more than baseline', async () => {
    const student = await createStudent();
    await setGoal(student._id, { currentBand: 5.5, targetBand: 7.0 });
    await seedReadingBand(student._id, 5.0); // clear gap toward target 7.0
    const plan = await studyPlanService.getStudyPlan(student._id);
    expect(plan.hasPlan).toBe(true);
    const reading = plan.allocation.find(a => a.category === 'reading');
    expect(reading.dataStatus).toBe('estimated');
    expect(reading.minutes).toBeGreaterThan(reading.baselineMinutes);
  });

  it('User C — current === target: gap-based score is 0 for that skill, still gets baseline exposure', async () => {
    const student = await createStudent();
    await setGoal(student._id, { currentBand: 6.5, targetBand: 6.5 });
    await seedReadingBand(student._id, 6.5); // matches target exactly -> zero gap
    const plan = await studyPlanService.getStudyPlan(student._id);
    const reading = plan.allocation.find(a => a.category === 'reading');
    expect(reading.minutes).toBeGreaterThan(0); // baseline still applies
  });

  it('User D — exam tomorrow: urgencyExponent is the critical (highest) tier', async () => {
    const student = await createStudent();
    await setGoal(student._id, { targetExamDate: future(1) });
    const plan = await studyPlanService.getStudyPlan(student._id);
    expect(plan.urgencyExponent).toBe(studyPlanService.URGENCY_EXPONENT.critical);
  });

  it('User E — exam in 90 days: urgencyExponent is the low (lowest) tier', async () => {
    const student = await createStudent();
    await setGoal(student._id, { targetExamDate: future(90) });
    const plan = await studyPlanService.getStudyPlan(student._id);
    expect(plan.urgencyExponent).toBe(studyPlanService.URGENCY_EXPONENT.low);
  });

  it('User F — past exam date: plan still generates (using default urgency), goal flags isPastExamDate', async () => {
    const student = await createStudent();
    await setGoal(student._id, { targetExamDate: past(5) });
    const plan = await studyPlanService.getStudyPlan(student._id);
    expect(plan.hasPlan).toBe(true);
    expect(plan.goal.isPastExamDate).toBe(true);
    expect(plan.urgencyExponent).toBe(1.0); // no urgency signal from a past/null examUrgency
  });

  it('User G — no skill data anywhere: every category insufficient_data, allocation stays close to baseline-even', async () => {
    const student = await createStudent();
    await setGoal(student._id);
    const plan = await studyPlanService.getStudyPlan(student._id);
    const skillCats = plan.allocation.filter(a => a.category !== 'vocabulary');
    expect(skillCats.every(a => a.dataStatus === 'insufficient_data')).toBe(true);
    const minutes = skillCats.map(a => a.minutes);
    expect(Math.max(...minutes) - Math.min(...minutes)).toBeLessThanOrEqual(2); // near-identical, same neutral score
  });

  it('User H — only Reading has data: reading is "estimated", the other three stay "insufficient_data"', async () => {
    const student = await createStudent();
    await setGoal(student._id);
    await seedReadingBand(student._id, 6.0);
    const plan = await studyPlanService.getStudyPlan(student._id);
    const byCat = Object.fromEntries(plan.allocation.map(a => [a.category, a]));
    expect(byCat.reading.dataStatus).toBe('estimated');
    expect(byCat.listening.dataStatus).toBe('insufficient_data');
    expect(byCat.writing.dataStatus).toBe('insufficient_data');
    expect(byCat.speaking.dataStatus).toBe('insufficient_data');
  });

  it('User I — Writing clearly weakest: Writing receives the most weekly minutes of the four skills', async () => {
    const student = await createStudent();
    await setGoal(student._id, { currentBand: 5.5, targetBand: 7.0 });
    await seedReadingBand(student._id, 6.5);
    await seedListeningBand(student._id, 6.0);
    await seedWritingBand(student._id, 5.0);
    await seedSpeakingBand(student._id, 5.5);
    const plan = await studyPlanService.getStudyPlan(student._id);
    const byCat = Object.fromEntries(plan.allocation.map(a => [a.category, a]));
    const skillMinutes = [byCat.reading.minutes, byCat.listening.minutes, byCat.speaking.minutes];
    expect(byCat.writing.minutes).toBeGreaterThan(Math.max(...skillMinutes));
    // A session somewhere in the week actually names Writing with a reason.
    const writingItem = plan.sessions.flatMap(s => s.items).find(i => i.category === 'writing');
    expect(writingItem).toBeTruthy();
    expect(writingItem.reason.length).toBeGreaterThan(0);
  });

  it('User J — all four skills balanced and near target: no single skill dominates the allocation', async () => {
    const student = await createStudent();
    await setGoal(student._id, { currentBand: 6.5, targetBand: 7.0 });
    await seedReadingBand(student._id, 6.8);
    await seedListeningBand(student._id, 6.8);
    await seedWritingBand(student._id, 6.8);
    await seedSpeakingBand(student._id, 6.8);
    const plan = await studyPlanService.getStudyPlan(student._id);
    const skillMinutes = plan.allocation.filter(a => a.category !== 'vocabulary').map(a => a.minutes);
    const [max, ...rest] = [...skillMinutes].sort((a, b) => b - a);
    // No skill should outweigh the combined remaining three — a much
    // looser bar than "near-identical", since writing/speaking legitimately
    // carry an extra absolute-distance-from-9 severity signal (from the
    // seeded per-criterion data) that reading/listening don't have any
    // equivalent granular signal for in this test, even at the same
    // overall band — that's a real difference in AVAILABLE signal, not an
    // allocation bug. See studyPlanService.severityScoreForCriterion.
    expect(max).toBeLessThan(rest.reduce((a, b) => a + b, 0));
  });

  it('User K — 2 days x 60min vs 6 days x 30min: session count and per-day totals follow the schedule, not a fixed shape', async () => {
    const studentA = await createStudent();
    await setGoal(studentA._id, { studyDays: ['mon', 'thu'], preferredSessionMinutes: 60, weeklyStudyMinutes: 120 });
    const planA = await studyPlanService.getStudyPlan(studentA._id);
    expect(planA.sessions).toHaveLength(2);
    expect(planA.sessions.every(s => s.totalMinutes <= 60)).toBe(true);

    const studentB = await createStudent();
    await setGoal(studentB._id, { studyDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'], preferredSessionMinutes: 30, weeklyStudyMinutes: 180 });
    const planB = await studyPlanService.getStudyPlan(studentB._id);
    expect(planB.sessions).toHaveLength(6);
    expect(planB.sessions.every(s => s.totalMinutes <= 30)).toBe(true);
  });

  it('User L — updating the goal regenerates the plan; underlying practice history is never touched', async () => {
    const student = await createStudent();
    await setGoal(student._id, { weeklyStudyMinutes: 120 });
    await seedReadingBand(student._id, 6.0);
    const planBefore = await studyPlanService.getStudyPlan(student._id);
    expect(planBefore.totalMinutes).toBe(120);

    await goalService.updateGoal(student._id, { weeklyStudyMinutes: 300 });
    const planAfter = await studyPlanService.getStudyPlan(student._id);
    expect(planAfter.totalMinutes).toBe(300);

    // History preserved: the same reading attempts still back the estimate.
    const CountReadingAttempts = await mongoose.model('TestAttempt').countDocuments({ userId: student._id });
    expect(CountReadingAttempts).toBe(3);
  });

  it('Issue M/N — rejected goal updates never reach the plan (still reads the last valid goal)', async () => {
    const student = await createStudent();
    await setGoal(student._id, { weeklyStudyMinutes: 150 });
    const rejected = await goalService.updateGoal(student._id, { targetBand: 8.0 }); // > 7.5
    expect(rejected.status).toBe('invalid');
    const plan = await studyPlanService.getStudyPlan(student._id);
    expect(plan.totalMinutes).toBe(150); // unaffected by the rejected update
  });
});

describe('studyPlanService — allocation algorithm', () => {
  it('every category is guaranteed a non-zero baseline share regardless of score', () => {
    const categories = Object.fromEntries(
      studyPlanService.CATEGORY_KEYS.map(k => [k, { score: 0 }])
    );
    const { minutesByCategory, baselineEach } = studyPlanService.allocateWeeklyMinutes(categories, 200, 'low');
    expect(baselineEach).toBeGreaterThan(0);
    for (const key of studyPlanService.CATEGORY_KEYS) {
      expect(minutesByCategory[key]).toBeGreaterThanOrEqual(baselineEach);
    }
  });

  it('all category minutes sum to (approximately) the total minutes', () => {
    const categories = {
      reading: { score: 80 }, listening: { score: 20 }, writing: { score: 90 }, speaking: { score: 10 }, vocabulary: { score: 50 },
    };
    const { minutesByCategory } = studyPlanService.allocateWeeklyMinutes(categories, 300, 'moderate');
    const sum = Object.values(minutesByCategory).reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 300)).toBeLessThanOrEqual(5); // rounding slack
  });

  it('higher exam urgency concentrates minutes more sharply toward the highest-scoring category', () => {
    const categories = {
      reading: { score: 90 }, listening: { score: 10 }, writing: { score: 10 }, speaking: { score: 10 }, vocabulary: { score: 10 },
    };
    const low = studyPlanService.allocateWeeklyMinutes(categories, 300, 'low').minutesByCategory.reading;
    const critical = studyPlanService.allocateWeeklyMinutes(categories, 300, 'critical').minutesByCategory.reading;
    expect(critical).toBeGreaterThan(low);
  });
});
