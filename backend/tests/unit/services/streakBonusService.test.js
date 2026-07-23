// Regression test for a production bug: a user ended up with 6 "lửa"
// (streak bonus) in one day when the shared daily cap is 5. Root cause was
// reserveDailyStreakBonus's old read-then-write implementation — two
// concurrent requests from the same user (e.g. a reading test and a
// listening test finishing within the same second) could both read the
// same "4 of 5 used" snapshot and each independently push it to 5,
// overshooting the cap. The fix replaced it with an optimistic
// compare-and-swap that retries against fresh data instead of trusting a
// stale read.
const { reserveDailyStreakBonus, todayVNDate } = require('../../../services/streakBonusService');
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
