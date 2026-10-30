// Regression test for a production bug: a user ended up with 6 "lửa"
// (streak bonus) in one day when the shared daily cap is 5. Root cause was
// reserveDailyStreakBonus's old read-then-write implementation — two
// concurrent requests from the same user (e.g. a reading test and a
// listening test finishing within the same second) could both read the
// same "4 of 5 used" snapshot and each independently push it to 5,
// overshooting the cap. The fix replaced it with an optimistic
// compare-and-swap that retries against fresh data instead of trusting a
// stale read.
const {
  reserveDailyStreakBonus, todayVNDate, awardPracticeFlames, DAILY_STREAK_BONUS_CAP,
  vocabBonusForAccuracy, testBonusForAccuracy, drillBonusForAccuracy,
  dailyWordTargetForBand, dailyWordTarget, vocabStudiedToday, reachedDailyWordThreshold,
} = require('../../../services/streakBonusService');
const VocabActivity = require('../../../models/VocabActivity');
const { createStudent } = require('../../factories/userFactory');

describe('reserveDailyStreakBonus', () => {
  test('the daily cap is 10', () => {
    expect(DAILY_STREAK_BONUS_CAP).toBe(10);
  });

  test('never exceeds the 10/day cap under concurrent requests from the same user', async () => {
    const student = await createStudent();

    // 6 concurrent requests each asking for +3 — sequentially this would be
    // capped at 10 total; the bug allowed concurrent calls to overshoot it.
    const results = await Promise.all(
      Array.from({ length: 6 }, () => reserveDailyStreakBonus(student._id, 3))
    );

    const totalApplied = results.reduce((sum, n) => sum + n, 0);
    expect(totalApplied).toBe(10);

    const doc = await VocabActivity.findOne({ userId: student._id, date: todayVNDate() });
    expect(doc.streakBonusEarned).toBe(10);
  });

  test('sequential calls stop granting once the cap is reached', async () => {
    const student = await createStudent();

    expect(await reserveDailyStreakBonus(student._id, 3)).toBe(3);
    expect(await reserveDailyStreakBonus(student._id, 3)).toBe(3);
    expect(await reserveDailyStreakBonus(student._id, 3)).toBe(3);
    expect(await reserveDailyStreakBonus(student._id, 3)).toBe(1); // only 1 left of 10
    expect(await reserveDailyStreakBonus(student._id, 3)).toBe(0); // cap exhausted

    const doc = await VocabActivity.findOne({ userId: student._id, date: todayVNDate() });
    expect(doc.streakBonusEarned).toBe(10);
  });

  test('rawBonus of 0 grants nothing and does not create a document', async () => {
    const student = await createStudent();
    expect(await reserveDailyStreakBonus(student._id, 0)).toBe(0);
    const doc = await VocabActivity.findOne({ userId: student._id, date: todayVNDate() });
    expect(doc).toBeNull();
  });
});

describe('daily vocab word target (scales with IELTS target band)', () => {
  test('band anchors: 5.0→35, 6.0→50, 7.0→70; .5 steps + edges', () => {
    expect(dailyWordTargetForBand(null)).toBe(35);
    expect(dailyWordTargetForBand(4.5)).toBe(35);
    expect(dailyWordTargetForBand(5.0)).toBe(35);
    expect(dailyWordTargetForBand(5.5)).toBe(40);
    expect(dailyWordTargetForBand(6.0)).toBe(50);
    expect(dailyWordTargetForBand(6.5)).toBe(60);
    expect(dailyWordTargetForBand(7.0)).toBe(70);
    expect(dailyWordTargetForBand(7.5)).toBe(80);
    expect(dailyWordTargetForBand(9.0)).toBe(80);
  });

  test('dailyWordTarget reads the user\'s targetBand', async () => {
    const s5 = await createStudent();
    const s7 = await createStudent({ extra: { targetBand: 7.0 } });
    expect(await dailyWordTarget(s5._id)).toBe(35);
    expect(await dailyWordTarget(s7._id)).toBe(70);
  });

  test('reachedDailyWordThreshold gates on the personal target, not a fixed 35', async () => {
    const student = await createStudent({ extra: { targetBand: 7.0 } }); // target 70
    // 40 words: over the old fixed 35, still under this student's 70.
    expect(await reachedDailyWordThreshold(student._id, { wordsStudied: 40 })).toBe(false);
    expect(await vocabStudiedToday(student._id)).toBe(40);
    // 30 more → 70, hits it.
    expect(await reachedDailyWordThreshold(student._id, { wordsStudied: 30 })).toBe(true);
  });

  test('a band-5 student unlocks at 35 STUDIED words', async () => {
    const student = await createStudent(); // no targetBand → 35
    expect(await reachedDailyWordThreshold(student._id, { wordsStudied: 34 })).toBe(false);
    expect(await reachedDailyWordThreshold(student._id, { wordsStudied: 1 })).toBe(true);
  });

  test('saving words (wordsAdded) never unlocks the day or shows in the goal', async () => {
    const student = await createStudent(); // target 35
    // Any number of saved words still leaves the day un-unlocked...
    expect(await reachedDailyWordThreshold(student._id, { wordsAdded: 100 })).toBe(false);
    // ...and the daily-goal nudge shows 0 studied, not 100.
    expect(await vocabStudiedToday(student._id)).toBe(0);
    // The add IS still recorded on the activity doc (analytics / heatmap).
    const doc = await VocabActivity.findOne({ userId: student._id, date: todayVNDate() });
    expect(doc.wordsAdded).toBe(100);
    // Only real studying moves it.
    expect(await reachedDailyWordThreshold(student._id, { wordsStudied: 35 })).toBe(true);
    expect(await vocabStudiedToday(student._id)).toBe(35);
  });
});

describe('🔥 tiers', () => {
  test('vocab: >=70% → 1, >=80% → 2, >=90% → 3', () => {
    expect(vocabBonusForAccuracy(0.69)).toBe(0);
    expect(vocabBonusForAccuracy(0.7)).toBe(1);
    expect(vocabBonusForAccuracy(0.8)).toBe(2);
    expect(vocabBonusForAccuracy(0.9)).toBe(3);
    expect(vocabBonusForAccuracy(1)).toBe(3);
  });
  test('reading/listening: >=50% → 1, >=70% → 2, >=90% → 3', () => {
    expect(testBonusForAccuracy(0.49)).toBe(0);
    expect(testBonusForAccuracy(0.5)).toBe(1);
    expect(testBonusForAccuracy(0.7)).toBe(2);
    expect(testBonusForAccuracy(0.89)).toBe(2);
    expect(testBonusForAccuracy(0.9)).toBe(3);
  });
  test('other drills: >=70% → 1, >=90% → 2', () => {
    expect(drillBonusForAccuracy(0.69)).toBe(0);
    expect(drillBonusForAccuracy(0.7)).toBe(1);
    expect(drillBonusForAccuracy(0.9)).toBe(2);
  });
});

describe('awardPracticeFlames', () => {
  const User = require('../../../models/User');

  test('credits streak + wallet, and the same item only tops up within a day', async () => {
    const student = await createStudent();
    expect((await awardPracticeFlames(student._id, 'reading-practice:p1', 2)).bonusApplied).toBe(2);
    // Same passage again at the same tier → nothing new.
    expect((await awardPracticeFlames(student._id, 'reading-practice:p1', 2)).bonusApplied).toBe(0);
    // Better redo → only the difference.
    expect((await awardPracticeFlames(student._id, 'reading-practice:p1', 3)).bonusApplied).toBe(1);
    // A different passage earns on its own.
    expect((await awardPracticeFlames(student._id, 'reading-practice:p2', 3)).bonusApplied).toBe(3);
    const u = await User.findById(student._id).lean();
    expect(u.learningStreak).toBe(6);
    expect(u.flameWallet).toBe(6);
  });

  test('concurrent submits of the same item claim it once', async () => {
    const student = await createStudent();
    const res = await Promise.all(Array.from({ length: 4 }, () => awardPracticeFlames(student._id, 'gapfill:s1', 2)));
    expect(res.reduce((n, r) => n + r.bonusApplied, 0)).toBe(2);
  });

  test('stops at the daily cap; a 0 award still keeps the day alive', async () => {
    const student = await createStudent();
    let total = 0;
    for (let i = 0; i < 5; i++) total += (await awardPracticeFlames(student._id, `listening-test:${i}`, 3)).bonusApplied;
    expect(total).toBe(10);
    const r = await awardPracticeFlames(student._id, 'grammar:x', 0);
    expect(r.bonusApplied).toBe(0);
    const u = await User.findById(student._id).lean();
    expect(u.learningStreak).toBe(10);
    expect(u.lastActivityDate).toBeTruthy();
  });

  test('a capped-out item claim is handed back, so it can earn later', async () => {
    const student = await createStudent();
    await reserveDailyStreakBonus(student._id, 9);
    expect((await awardPracticeFlames(student._id, 'dictation:s1', 2)).bonusApplied).toBe(1);
    const doc = await VocabActivity.findOne({ userId: student._id, date: todayVNDate() }).lean();
    expect(doc.flameItems['dictation:s1']).toBe(1);
  });

  test('non-students earn nothing', async () => {
    const { createTeacher } = require('../../factories/userFactory');
    if (!createTeacher) return;
    const teacher = await createTeacher();
    expect((await awardPracticeFlames(teacher._id, 'x', 3)).bonusApplied).toBe(0);
  });
});
