const userService = require('../../../services/userService');
const WritingAttempt = require('../../../models/WritingAttempt');
const SpeakingAttempt = require('../../../models/SpeakingAttempt');
const { createStudent } = require('../../factories/userFactory');

// createdAt is normally stamped by Mongoose's timestamps plugin at creation
// time — bypass it with a raw collection update so tests can pin an exact
// instant, the same trick used to probe timezone-boundary bugs elsewhere.
async function forceCreatedAt(Model, id, isoUtc) {
  await Model.collection.updateOne({ _id: id }, { $set: { createdAt: new Date(isoUtc) } });
}

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
});
