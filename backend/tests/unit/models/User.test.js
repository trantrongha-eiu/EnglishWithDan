const { createStudent } = require('../../factories/userFactory');

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

describe('User.resetIfStale / updateStreak — previousStreak snapshot', () => {
  test('resetIfStale() snapshots the dead streak into previousStreak before zeroing it', async () => {
    const user = await createStudent({
      extra: { learningStreak: 15, lastActivityDate: daysAgo(3) } // missed >= 2 days
    });

    const wasReset = user.resetIfStale();

    expect(wasReset).toBe(true);
    expect(user.learningStreak).toBe(0);
    expect(user.previousStreak).toBe(15);
  });

  test('resetIfStale() is a no-op (and does not touch previousStreak) within the 1-day grace period', async () => {
    const user = await createStudent({
      extra: { learningStreak: 5, lastActivityDate: daysAgo(1), previousStreak: 0 } // studied yesterday, still safe today
    });

    const wasReset = user.resetIfStale();

    expect(wasReset).toBe(false);
    expect(user.learningStreak).toBe(5);
    expect(user.previousStreak).toBe(0);
  });

  test('updateStreak() clears previousStreak as soon as the student studies again', async () => {
    const user = await createStudent({
      extra: { learningStreak: 0, lastActivityDate: daysAgo(3), previousStreak: 15 }
    });

    user.updateStreak();

    expect(user.learningStreak).toBe(1); // streak restarts
    expect(user.previousStreak).toBe(0); // "just lost" flag is cleared
  });

  test('a brand-new user (never studied) has previousStreak 0, not a false "lost streak"', async () => {
    const user = await createStudent({ extra: { learningStreak: 0, lastActivityDate: null } });
    expect(user.previousStreak).toBe(0);
    expect(user.resetIfStale()).toBe(false);
  });
});

describe('User.updateStreak(bonus) — accuracy-tiered streak points', () => {
  test('advancing a day adds the given bonus instead of a flat +1', async () => {
    const user = await createStudent({ extra: { learningStreak: 3, lastActivityDate: daysAgo(1) } });
    user.updateStreak(2);
    expect(user.learningStreak).toBe(5);
  });

  test('a 0-bonus session on a new day keeps the streak unchanged but still advances lastActivityDate', async () => {
    const user = await createStudent({ extra: { learningStreak: 4, lastActivityDate: daysAgo(1) } });
    const before = user.lastActivityDate;
    user.updateStreak(0);
    expect(user.learningStreak).toBe(4); // unchanged, chain not broken
    expect(user.lastActivityDate.getTime()).not.toBe(new Date(before).getTime());
  });

  test('same-day repeat calls are a no-op by default (existing flat-rate callers)', async () => {
    const user = await createStudent({ extra: { learningStreak: 2, lastActivityDate: new Date() } });
    user.updateStreak(); // default bonus=1, no allowSameDayStack
    expect(user.learningStreak).toBe(2);
  });

  test('same-day repeat calls stack when allowSameDayStack is set (vocab practice sessions)', async () => {
    const user = await createStudent({ extra: { learningStreak: 2, lastActivityDate: new Date() } });
    user.updateStreak(2, { allowSameDayStack: true });
    expect(user.learningStreak).toBe(4);
    user.updateStreak(1, { allowSameDayStack: true });
    expect(user.learningStreak).toBe(5);
  });

  test('a real gap (>=2 days) snapshots the dying streak into previousStreak/streakLostAt even via updateStreak (not just resetIfStale)', async () => {
    const user = await createStudent({ extra: { learningStreak: 12, lastActivityDate: daysAgo(3) } });
    user.updateStreak(1);
    expect(user.learningStreak).toBe(1); // restarted at this call's bonus
    expect(user.previousStreak).toBe(12);
    expect(user.streakLostAt).not.toBeNull();
  });
});

describe('User búa Daniel — canUseHammer() / useHammerToRestore()', () => {
  test('not eligible with zero hammers even if a streak was just lost', async () => {
    const user = await createStudent({
      extra: { learningStreak: 0, previousStreak: 10, streakLostAt: new Date(), streakHammers: 0 }
    });
    expect(user.canUseHammer()).toBe(false);
  });

  test('not eligible once the streak is already active again (nothing to restore)', async () => {
    const user = await createStudent({
      extra: { learningStreak: 3, previousStreak: 0, streakLostAt: null, streakHammers: 2 }
    });
    expect(user.canUseHammer()).toBe(false);
  });

  test('not eligible more than 3 days after the loss', async () => {
    const user = await createStudent({
      extra: { learningStreak: 0, previousStreak: 10, streakLostAt: daysAgo(4), streakHammers: 1 }
    });
    expect(user.canUseHammer()).toBe(false);
  });

  test('eligible within 3 days, with a hammer in inventory — restores and consumes exactly 1 hammer', async () => {
    const user = await createStudent({
      extra: { learningStreak: 0, previousStreak: 10, streakLostAt: daysAgo(2), streakHammers: 3 }
    });
    expect(user.canUseHammer()).toBe(true);

    const ok = user.useHammerToRestore();
    expect(ok).toBe(true);
    expect(user.learningStreak).toBe(10);
    expect(user.previousStreak).toBe(0);
    expect(user.streakLostAt).toBeNull();
    expect(user.streakHammers).toBe(2);
  });

  test('useHammerToRestore() is a no-op returning false when not eligible', async () => {
    const user = await createStudent({
      extra: { learningStreak: 5, previousStreak: 0, streakLostAt: null, streakHammers: 3 }
    });
    const ok = user.useHammerToRestore();
    expect(ok).toBe(false);
    expect(user.streakHammers).toBe(3); // untouched
  });

  // Regression: useHammerToRestore() used to leave the stale
  // lastActivityDate untouched, so the very next resetIfStale() call (e.g.
  // on the next /user/stats load) saw the same >=2-day gap and immediately
  // re-zeroed the streak it had just restored.
  test('a restored streak survives an immediate resetIfStale() call right after', async () => {
    const user = await createStudent({
      extra: { learningStreak: 0, previousStreak: 7, lastActivityDate: daysAgo(3), streakLostAt: daysAgo(2), streakHammers: 1 }
    });

    expect(user.useHammerToRestore()).toBe(true);
    expect(user.learningStreak).toBe(7);

    const wasReset = user.resetIfStale();
    expect(wasReset).toBe(false);
    expect(user.learningStreak).toBe(7);
  });
});
