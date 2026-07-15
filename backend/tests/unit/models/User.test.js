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
