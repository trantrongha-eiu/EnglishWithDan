const userService = require('../../../services/userService');
const User = require('../../../models/User');
const TestAttempt = require('../../../models/TestAttempt');
const WritingAttempt = require('../../../models/WritingAttempt');
const SpeakingAttempt = require('../../../models/SpeakingAttempt');
const VocabActivity = require('../../../models/VocabActivity');
const { createStudent } = require('../../factories/userFactory');
const { createCompletedTestAttempt } = require('../../factories/contentFactory');

// createdAt is normally stamped by Mongoose's timestamps plugin at creation
// time — bypass it with a raw collection update so tests can pin an exact
// instant, the same trick used to probe timezone-boundary bugs elsewhere.
async function forceCreatedAt(Model, id, isoUtc) {
  await Model.collection.updateOne({ _id: id }, { $set: { createdAt: new Date(isoUtc) } });
}

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

describe('userService.getStats — previousStreak', () => {
  test('exposes previousStreak so the dashboard mascot can show the "just lost a streak" state', async () => {
    const user = await createStudent({ extra: { learningStreak: 12, lastActivityDate: daysAgo(3) } });

    const stats = await userService.getStats(user._id);

    // getStats() calls resetIfStale() internally, which should have just
    // snapshotted the dead 12-day streak before zeroing learningStreak.
    expect(stats.streak).toBe(0);
    expect(stats.previousStreak).toBe(12);
  });
});

describe('userService.getStats — resetIfStale race with a concurrent updateStreak()', () => {
  // Regression for: student studies enough to earn today's streak, but a
  // near-simultaneous page-load's stale reset-save lands afterward and
  // stomps it back to 0 ("studied today but streak still reset"). The fix
  // guards the reset write with the exact lastActivityDate read, so a
  // concurrent write in between makes the guard a no-op and getStats()
  // re-fetches instead of trusting its now-stale in-memory reset.
  afterEach(() => jest.restoreAllMocks());

  test('does not clobber a streak the student just earned in a concurrent request', async () => {
    const staleDate = daysAgo(3);
    const user = await createStudent({ extra: { learningStreak: 12, lastActivityDate: staleDate } });

    // Simulate vocabBookService.completePractice()'s updateStreak() write
    // landing in between getStats()'s read and its guarded reset write.
    const realUpdateOne = User.updateOne.bind(User);
    jest.spyOn(User, 'updateOne').mockImplementationOnce(async (...args) => {
      await User.collection.updateOne(
        { _id: user._id },
        { $set: { learningStreak: 1, previousStreak: 12, lastActivityDate: new Date() } }
      );
      return realUpdateOne(...args); // now runs against the changed lastActivityDate -> guard fails
    });

    const stats = await userService.getStats(user._id);

    expect(stats.streak).toBe(1); // the just-studied value, not stomped back to 0
    const fresh = await User.findById(user._id).lean();
    expect(fresh.learningStreak).toBe(1);
  });
});

describe('userService.getStats — búa Daniel fields', () => {
  test('exposes streakHammers and canUseHammer', async () => {
    const user = await createStudent({
      extra: { learningStreak: 0, previousStreak: 8, lastActivityDate: daysAgo(3), streakHammers: 2, streakLostAt: daysAgo(1) }
    });

    const stats = await userService.getStats(user._id);

    expect(stats.streakHammers).toBe(2);
    expect(stats.canUseHammer).toBe(true);
  });

  test('canUseHammer is false with no hammers in inventory', async () => {
    const user = await createStudent({
      extra: { learningStreak: 0, previousStreak: 8, lastActivityDate: daysAgo(3), streakHammers: 0, streakLostAt: daysAgo(1) }
    });

    const stats = await userService.getStats(user._id);

    expect(stats.canUseHammer).toBe(false);
  });
});

describe('userService.getStats — averages computed over full history, not just the last N', () => {
  it('reading avgBand reflects ALL completed attempts, not just the 10 most recent', async () => {
    const student = await createStudent();
    // 5 older attempts at band 5.0
    for (let i = 0; i < 5; i++) {
      const a = await createCompletedTestAttempt({ userId: student._id, bandScore: 5.0 });
      await forceCreatedAt(TestAttempt, a._id, new Date(Date.now() - (20 - i) * 86400000).toISOString());
    }
    // 10 newer attempts at band 9.0 — a "last 10 only" average would see only these and report 9.0.
    for (let i = 0; i < 10; i++) {
      const a = await createCompletedTestAttempt({ userId: student._id, bandScore: 9.0 });
      await forceCreatedAt(TestAttempt, a._id, new Date(Date.now() - (9 - i) * 86400000).toISOString());
    }

    const stats = await userService.getStats(student._id);

    // True average across all 15: (5*5.0 + 10*9.0) / 15 = 7.7
    expect(stats.reading.avgBand).toBe('7.7');
    expect(stats.reading.total).toBe(15);
  });

  it('writing.total counts every submission (graded or still pending review), unlike the average', async () => {
    const student = await createStudent();
    await WritingAttempt.create({ userId: student._id, submissionType: 'exam', grading: { overallBand: 7.0 } });
    await WritingAttempt.create({ userId: student._id, submissionType: 'exam', grading: { overallBand: 6.0 } });
    await WritingAttempt.create({ userId: student._id, submissionType: 'exam' }); // still awaiting a teacher grade

    const stats = await userService.getStats(student._id);

    expect(stats.writing.total).toBe(3); // all 3 submissions count
    expect(stats.writing.avgBand).toBe('6.5'); // average only over the 2 graded ones
  });
});

describe('userService.updateProfile — targetExamDate', () => {
  it('sets targetExamDate from an ISO date string', async () => {
    const student = await createStudent();
    const examDate = '2026-12-05';

    const result = await userService.updateProfile(student._id, { targetExamDate: examDate });

    expect(result.status).toBe('ok');
    expect(new Date(result.user.targetExamDate).toISOString().slice(0, 10)).toBe('2026-12-05');
  });

  it('clears targetExamDate when set to an empty string', async () => {
    const student = await createStudent({ extra: { targetExamDate: new Date('2026-12-05') } });

    const result = await userService.updateProfile(student._id, { targetExamDate: '' });

    expect(result.status).toBe('ok');
    expect(result.user.targetExamDate).toBeNull();
  });

  it('leaves targetExamDate untouched when not present in the update payload', async () => {
    const original = new Date('2026-12-05');
    const student = await createStudent({ extra: { targetExamDate: original } });

    const result = await userService.updateProfile(student._id, { firstName: 'New Name' });

    expect(result.status).toBe('ok');
    expect(new Date(result.user.targetExamDate).getTime()).toBe(original.getTime());
  });
});

// Regression coverage for BUG-003 (2026-08-27 audit): PUT /api/user/profile
// accepted targetBand/targetExamDate with zero validation — a crafted
// targetBand:15 or a past targetExamDate round-tripped straight back on
// the next GET. validateProfileInput() enforces the User schema's own
// bound (4-9), deliberately NOT goalService's stricter 4.0-7.5 product-scope
// range (see userService.js's own comment on why those must stay separate).
describe('userService.updateProfile — validation (BUG-003)', () => {
  it('accepts a targetBand within the schema bound (4-9)', async () => {
    const student = await createStudent();
    const result = await userService.updateProfile(student._id, { targetBand: 7.5 });
    expect(result.status).toBe('ok');
    expect(result.user.targetBand).toBe(7.5);
  });

  it('rejects a targetBand above the schema bound', async () => {
    const student = await createStudent();
    const result = await userService.updateProfile(student._id, { targetBand: 15 });
    expect(result.status).toBe('invalid');
    expect(result.errors[0]).toMatch(/targetBand/);

    const reloaded = await userService.getProfile(student._id, 'free');
    expect(reloaded.targetBand).toBeNull(); // never persisted
  });

  it('rejects a targetBand below the schema bound', async () => {
    const student = await createStudent();
    const result = await userService.updateProfile(student._id, { targetBand: 0 });
    expect(result.status).toBe('invalid');
  });

  it('rejects a non-numeric targetBand (string)', async () => {
    const student = await createStudent();
    const result = await userService.updateProfile(student._id, { targetBand: '7.5' });
    expect(result.status).toBe('invalid');
  });

  it('allows clearing targetBand with null', async () => {
    const student = await createStudent({ extra: { targetBand: 7 } });
    const result = await userService.updateProfile(student._id, { targetBand: null });
    expect(result.status).toBe('ok');
    expect(result.user.targetBand).toBeNull();
  });

  it('rejects a malformed targetExamDate', async () => {
    const student = await createStudent();
    const result = await userService.updateProfile(student._id, { targetExamDate: 'not-a-date' });
    expect(result.status).toBe('invalid');
    expect(result.errors[0]).toMatch(/targetExamDate/);
  });

  it('rejects a past targetExamDate', async () => {
    const student = await createStudent();
    const result = await userService.updateProfile(student._id, { targetExamDate: '2020-01-01' });
    expect(result.status).toBe('invalid');
    expect(result.errors[0]).toMatch(/past/);

    const reloaded = await userService.getProfile(student._id, 'free');
    expect(reloaded.targetExamDate).toBeNull(); // never persisted
  });

  it('accepts a future targetExamDate', async () => {
    const student = await createStudent();
    const result = await userService.updateProfile(student._id, { targetExamDate: '2099-01-01' });
    expect(result.status).toBe('ok');
  });

  it('leaves unrelated profile fields (firstName) working exactly as before', async () => {
    const student = await createStudent();
    const result = await userService.updateProfile(student._id, { firstName: '  Trang  ' });
    expect(result.status).toBe('ok');
    expect(result.user.firstName).toBe('Trang');
  });
});

describe('userService.getStats — speaking avgBand', () => {
  test('averages only analyzed attempts, excluding pending ones whose overallBand defaults to 0', async () => {
    const user = await createStudent();
    await SpeakingAttempt.create({ userId: user._id, status: 'analyzed', aiFeedback: { overallBand: 6 } });
    await SpeakingAttempt.create({ userId: user._id, status: 'analyzed', aiFeedback: { overallBand: 8 } });
    await SpeakingAttempt.create({ userId: user._id, status: 'pending' }); // overallBand defaults to 0 — must not drag the average down

    const stats = await userService.getStats(user._id);

    expect(stats.speaking.avgBand).toBe('7.0');
    expect(stats.speaking.total).toBe(2); // pending attempt excluded from total too
  });

  test('avgBand is null when the student has no analyzed speaking attempts', async () => {
    const user = await createStudent();

    const stats = await userService.getStats(user._id);

    expect(stats.speaking.avgBand).toBeNull();
  });
});

describe('userService.useHammer', () => {
  test('restores the streak and consumes 1 hammer when eligible', async () => {
    const user = await createStudent({
      extra: { learningStreak: 0, previousStreak: 9, streakLostAt: daysAgo(1), streakHammers: 1 }
    });

    const result = await userService.useHammer(user._id);

    expect(result.status).toBe('ok');
    expect(result.streak).toBe(9);
    expect(result.streakHammers).toBe(0);
  });

  test('returns not_eligible and makes no changes when the student has no hammers', async () => {
    const user = await createStudent({
      extra: { learningStreak: 0, previousStreak: 9, streakLostAt: daysAgo(1), streakHammers: 0 }
    });

    const result = await userService.useHammer(user._id);

    expect(result.status).toBe('not_eligible');
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
