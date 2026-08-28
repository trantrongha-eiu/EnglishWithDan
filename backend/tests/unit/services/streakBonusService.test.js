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
  reserveDailyStreakBonus, todayVNDate,
  dailyWordTargetForBand, dailyWordTarget, vocabStudiedToday, reachedDailyWordThreshold,
} = require('../../../services/streakBonusService');
const VocabActivity = require('../../../models/VocabActivity');
const { createStudent } = require('../../factories/userFactory');

describe('reserveDailyStreakBonus', () => {
  test('never exceeds the +5/day cap under concurrent requests from the same user', async () => {
    const student = await createStudent();

    // 5 concurrent requests each asking for +2 — sequentially this would be
    // capped at 5 total; the bug allowed concurrent calls to overshoot it.
    const results = await Promise.all(
      Array.from({ length: 5 }, () => reserveDailyStreakBonus(student._id, 2))
    );

    const totalApplied = results.reduce((sum, n) => sum + n, 0);
    expect(totalApplied).toBe(5);

    const doc = await VocabActivity.findOne({ userId: student._id, date: todayVNDate() });
    expect(doc.streakBonusEarned).toBe(5);
  });

  test('sequential calls stop granting once the cap is reached', async () => {
    const student = await createStudent();

    expect(await reserveDailyStreakBonus(student._id, 2)).toBe(2);
    expect(await reserveDailyStreakBonus(student._id, 2)).toBe(2);
    expect(await reserveDailyStreakBonus(student._id, 2)).toBe(1); // only 1 left of 5
    expect(await reserveDailyStreakBonus(student._id, 2)).toBe(0); // cap exhausted

    const doc = await VocabActivity.findOne({ userId: student._id, date: todayVNDate() });
    expect(doc.streakBonusEarned).toBe(5);
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

  test('a band-5 student still unlocks at 35', async () => {
    const student = await createStudent(); // no targetBand → 35
    expect(await reachedDailyWordThreshold(student._id, { wordsAdded: 34 })).toBe(false);
    expect(await reachedDailyWordThreshold(student._id, { wordsAdded: 1 })).toBe(true);
  });
});
