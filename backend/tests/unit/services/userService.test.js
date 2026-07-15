const userService = require('../../../services/userService');
const WritingAttempt = require('../../../models/WritingAttempt');
const SpeakingAttempt = require('../../../models/SpeakingAttempt');
const VocabActivity = require('../../../models/VocabActivity');
const { createStudent } = require('../../factories/userFactory');

// createdAt is normally stamped by Mongoose's timestamps plugin at creation
// time — bypass it with a raw collection update so tests can pin an exact
// instant, the same trick used to probe timezone-boundary bugs elsewhere.
async function forceCreatedAt(Model, id, isoUtc) {
  await Model.collection.updateOne({ _id: id }, { $set: { createdAt: new Date(isoUtc) } });
}

describe('userService.getStats — previousStreak', () => {
  test('exposes previousStreak so the dashboard mascot can show the "just lost a streak" state', async () => {
    const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
    const user = await createStudent({ extra: { learningStreak: 12, lastActivityDate: daysAgo(3) } });

    const stats = await userService.getStats(user._id);

    // getStats() calls resetIfStale() internally, which should have just
    // snapshotted the dead 12-day streak before zeroing learningStreak.
    expect(stats.streak).toBe(0);
    expect(stats.previousStreak).toBe(12);
  });
});

describe('userService.getActivityHeatmap', () => {
  test('buckets an attempt by Vietnam calendar day, not UTC day', async () => {
    const user = await createStudent();
    // 2020-01-14T19:00:00Z == 2020-01-15 02:00 in Vietnam (UTC+7) —
    // a UTC-day grouping would (wrongly) file this under 2020-01-14.
    const doc = await WritingAttempt.create({ userId: user._id, task1Answer: 'x' });
    await forceCreatedAt(WritingAttempt, doc._id, '2020-01-14T19:00:00.000Z');

    const activity = await userService.getActivityHeatmap(user._id, 3000);
    const byDate = Object.fromEntries(activity.map(a => [a.date, a.count]));

    expect(byDate['2020-01-15']).toBe(1);
    expect(byDate['2020-01-14']).toBeUndefined();
  });

  test('sums attempts from different skills on the same Vietnam day', async () => {
    const user = await createStudent();
    const w = await WritingAttempt.create({ userId: user._id, task1Answer: 'x' });
    const s = await SpeakingAttempt.create({ userId: user._id });
    // Both at 2020-06-01 10:00 UTC == 2020-06-01 17:00 Vietnam — same VN day.
    await forceCreatedAt(WritingAttempt, w._id, '2020-06-01T10:00:00.000Z');
    await forceCreatedAt(SpeakingAttempt, s._id, '2020-06-01T10:05:00.000Z');

    const activity = await userService.getActivityHeatmap(user._id, 3000);
    const byDate = Object.fromEntries(activity.map(a => [a.date, a.count]));

    expect(byDate['2020-06-01']).toBe(2);
  });

  test('excludes attempts older than the requested window', async () => {
    const user = await createStudent();
    const doc = await WritingAttempt.create({ userId: user._id, task1Answer: 'x' });
    const farPast = new Date();
    farPast.setDate(farPast.getDate() - 400);
    await forceCreatedAt(WritingAttempt, doc._id, farPast.toISOString());

    const activity = await userService.getActivityHeatmap(user._id, 30);

    expect(activity).toEqual([]);
  });

  // Regression: vocab practice (dashboard.html's main activity) logs to a
  // separate VocabActivity collection, not one of the 4 "attempt" models —
  // it was missing entirely from the heatmap, so a student who only ever
  // studies vocab saw a real learningStreak but a totally blank calendar.
  test('counts real vocab study actions (wordsStudied/wordsAdded)', async () => {
    const user = await createStudent();
    await VocabActivity.create({
      userId: user._id, date: new Date('2021-03-10T00:00:00.000Z'),
      wordsStudied: 7, wordsAdded: 2, viewCount: 4
    });

    const activity = await userService.getActivityHeatmap(user._id, 3000);
    const byDate = Object.fromEntries(activity.map(a => [a.date, a.count]));

    expect(byDate['2021-03-10']).toBe(9); // 7 studied + 2 added, viewCount excluded
  });

  test('a vocab day with only page views (no study/add) does not appear on the calendar', async () => {
    const user = await createStudent();
    await VocabActivity.create({
      userId: user._id, date: new Date('2021-03-11T00:00:00.000Z'),
      wordsStudied: 0, wordsAdded: 0, viewCount: 3
    });

    const activity = await userService.getActivityHeatmap(user._id, 3000);
    const byDate = Object.fromEntries(activity.map(a => [a.date, a.count]));

    expect(byDate['2021-03-11']).toBeUndefined();
  });

  test('sums vocab activity together with a skill attempt on the same Vietnam day', async () => {
    const user = await createStudent();
    const w = await WritingAttempt.create({ userId: user._id, task1Answer: 'x' });
    await forceCreatedAt(WritingAttempt, w._id, '2021-05-01T10:00:00.000Z'); // 2021-05-01 17:00 VN
    await VocabActivity.create({
      userId: user._id, date: new Date('2021-05-01T00:00:00.000Z'), // already VN-day-aligned
      wordsStudied: 5, wordsAdded: 0, viewCount: 1
    });

    const activity = await userService.getActivityHeatmap(user._id, 3000);
    const byDate = Object.fromEntries(activity.map(a => [a.date, a.count]));

    expect(byDate['2021-05-01']).toBe(6); // 1 writing attempt + 5 words studied
  });
});
