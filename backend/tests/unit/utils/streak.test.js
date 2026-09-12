const { createStudent } = require('../../factories/userFactory');
const User = require('../../../models/User');
const { applyStreakActivity } = require('../../../utils/streak');

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// applyStreakActivity() must implement the exact same day-chain rules as
// User.prototype.updateStreak() (see models/User.js's tests) — it's the
// atomic, race-safe replacement every activity-crediting service now calls
// instead. Same cases, mirrored here against the real DB write.
describe('applyStreakActivity — same day-chain rules as User.updateStreak(), applied atomically', () => {
  test('advancing a day adds the given bonus instead of a flat +1', async () => {
    const user = await createStudent({ extra: { learningStreak: 3, lastActivityDate: daysAgo(1) } });
    const updated = await applyStreakActivity(User, user._id, 2);
    expect(updated.learningStreak).toBe(5);
  });

  test('a 0-bonus session on a new day keeps the streak unchanged but still advances lastActivityDate', async () => {
    const user = await createStudent({ extra: { learningStreak: 4, lastActivityDate: daysAgo(1) } });
    const before = user.lastActivityDate;
    const updated = await applyStreakActivity(User, user._id, 0);
    expect(updated.learningStreak).toBe(4);
    expect(updated.lastActivityDate.getTime()).not.toBe(new Date(before).getTime());
  });

  test('same-day repeat calls are a no-op by default', async () => {
    const user = await createStudent({ extra: { learningStreak: 2, lastActivityDate: new Date() } });
    const updated = await applyStreakActivity(User, user._id, 1);
    expect(updated.learningStreak).toBe(2);
  });

  test('same-day repeat calls stack when allowSameDayStack is set (vocab practice sessions)', async () => {
    const user = await createStudent({ extra: { learningStreak: 2, lastActivityDate: new Date() } });
    let updated = await applyStreakActivity(User, user._id, 2, { allowSameDayStack: true });
    expect(updated.learningStreak).toBe(4);
    updated = await applyStreakActivity(User, user._id, 1, { allowSameDayStack: true });
    expect(updated.learningStreak).toBe(5);
  });

  test('a real gap (>=2 days) snapshots the dying streak into previousStreak/streakLostAt before restarting', async () => {
    const user = await createStudent({ extra: { learningStreak: 12, lastActivityDate: daysAgo(3) } });
    const updated = await applyStreakActivity(User, user._id, 1);
    expect(updated.learningStreak).toBe(1);
    expect(updated.previousStreak).toBe(12);
    expect(updated.streakLostAt).not.toBeNull();
  });

  test('exactly 1 day missed keeps the chain alive (must NOT reset — this is the reported bug)', async () => {
    const user = await createStudent({ extra: { learningStreak: 6, lastActivityDate: daysAgo(1), previousStreak: 0 } });
    const updated = await applyStreakActivity(User, user._id, 1);
    expect(updated.learningStreak).toBe(7); // continued, not reset to 1
    expect(updated.previousStreak).toBe(0);
  });

  test('a brand-new user (no lastActivityDate yet) starts at the given bonus', async () => {
    const user = await createStudent({ extra: { learningStreak: 0, lastActivityDate: null } });
    const updated = await applyStreakActivity(User, user._id, 1);
    expect(updated.learningStreak).toBe(1);
    expect(updated.previousStreak).toBe(0);
    expect(updated.lastActivityDate).not.toBeNull();
  });

  test('studying again clears previousStreak ("just lost a streak" mascot state ends)', async () => {
    const user = await createStudent({ extra: { learningStreak: 0, lastActivityDate: daysAgo(3), previousStreak: 15 } });
    const updated = await applyStreakActivity(User, user._id, 1);
    expect(updated.learningStreak).toBe(1);
    expect(updated.previousStreak).toBe(0);
  });

  // The actual regression this atomic rewrite fixes: two qualifying
  // activities (e.g. a vocab session and a Reading test) finishing at
  // effectively the same moment used to each load their own stale snapshot
  // of the user and save independently, so one could silently discard the
  // other's advance of lastActivityDate — corrupting it back to 2+ VN-days
  // stale and tripping a spurious reset on the student's next visit, even
  // though they had genuinely studied every day. Firing many concurrent
  // calls at the real DB (no artificial delay needed — the whole point of
  // an atomic update pipeline is that MongoDB itself serializes them)
  // must land on the fully-applied result, never a partially-lost one.
  test('concurrent activities never lose an update — the actual bug this fixes', async () => {
    const user = await createStudent({ extra: { learningStreak: 5, lastActivityDate: daysAgo(1) } });

    const results = await Promise.all([
      applyStreakActivity(User, user._id, 1, { allowSameDayStack: true }),
      applyStreakActivity(User, user._id, 1, { allowSameDayStack: true }),
      applyStreakActivity(User, user._id, 1, { allowSameDayStack: true }),
    ]);
    // Every call's own diff===1 branch (first call) or diff===0+stack branch
    // (the rest, once lastActivityDate has advanced) always ADDS its bonus —
    // nothing here can be a silent no-op, so after 3 concurrent +1 bonuses
    // the total must be exactly 5 + 3 = 8, whichever order Mongo applied them in.
    const final = await User.findById(user._id).select('learningStreak lastActivityDate');
    expect(final.learningStreak).toBe(8);
    expect(Math.max(...results.map(r => r.learningStreak))).toBe(8);
  });
});
