const userService = require('../../../services/userService');
const { createStudent, createTeacher, createAdmin } = require('../../factories/userFactory');

const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

describe('userService.getStreakLeaderboard', () => {
  test('sorts students by streak descending', async () => {
    await createStudent({ firstName: 'Low', lastName: '', extra: { learningStreak: 2, lastActivityDate: daysAgo(0) } });
    await createStudent({ firstName: 'High', lastName: '', extra: { learningStreak: 20, lastActivityDate: daysAgo(0) } });
    await createStudent({ firstName: 'Mid', lastName: '', extra: { learningStreak: 8, lastActivityDate: daysAgo(0) } });

    const board = await userService.getStreakLeaderboard(10);

    expect(board.map(b => b.name)).toEqual(['High', 'Mid', 'Low']);
    expect(board.map(b => b.streak)).toEqual([20, 8, 2]);
  });

  test('excludes a stale streak (>=2 days since last activity) even though learningStreak is still non-zero in the DB', async () => {
    await createStudent({ firstName: 'Stale', lastName: '', extra: { learningStreak: 30, lastActivityDate: daysAgo(5) } });
    await createStudent({ firstName: 'Fresh', lastName: '', extra: { learningStreak: 3, lastActivityDate: daysAgo(1) } });

    const board = await userService.getStreakLeaderboard(10);

    expect(board.map(b => b.name)).toEqual(['Fresh']);
  });

  test('excludes teachers and admins even if they somehow have a streak', async () => {
    await createStudent({ firstName: 'StudentOne', lastName: '', extra: { learningStreak: 5, lastActivityDate: daysAgo(0) } });
    await createTeacher({ firstName: 'TeacherOne', lastName: '', extra: { learningStreak: 99, lastActivityDate: daysAgo(0) } });
    await createAdmin({ firstName: 'AdminOne', lastName: '', extra: { learningStreak: 99, lastActivityDate: daysAgo(0) } });

    const board = await userService.getStreakLeaderboard(10);

    expect(board.map(b => b.name)).toEqual(['StudentOne']);
  });

  test('respects the limit parameter', async () => {
    for (let i = 0; i < 5; i++) {
      await createStudent({ firstName: `S${i}`, extra: { learningStreak: i + 1, lastActivityDate: daysAgo(0) } });
    }

    const board = await userService.getStreakLeaderboard(3);

    expect(board).toHaveLength(3);
    expect(board.map(b => b.streak)).toEqual([5, 4, 3]);
  });

  test('falls back to username when first/last name are blank', async () => {
    await createStudent({ username: 'nonameuser', firstName: '', lastName: '', extra: { learningStreak: 4, lastActivityDate: daysAgo(0) } });

    const board = await userService.getStreakLeaderboard(10);

    expect(board[0].name).toBe('nonameuser');
  });

  test('returns an empty list when no student has an active streak', async () => {
    await createStudent({ extra: { learningStreak: 0 } });

    const board = await userService.getStreakLeaderboard(10);

    expect(board).toEqual([]);
  });
});

describe('userService.getStreakStanding', () => {
  test("returns the caller's rank and the next-longer streak, even outside the top `limit`", async () => {
    const ids = [];
    for (const n of [30, 20, 20, 10, 5]) {
      ids.push((await createStudent({ extra: { learningStreak: n, lastActivityDate: daysAgo(0) } }))._id);
    }
    const { leaderboard, me } = await userService.getStreakStanding(ids[4], 2);
    expect(leaderboard.map(b => b.streak)).toEqual([30, 20]);
    expect(me).toEqual({ rank: 5, streak: 5, total: 5, nextStreak: 10 });

    // Tied with the place above -> the next target is the first LONGER streak.
    const tied = await userService.getStreakStanding(ids[2], 10);
    expect(tied.me.streak).toBe(20);
    expect(tied.me.nextStreak).toBe(30);

    const top = await userService.getStreakStanding(ids[0], 10);
    expect(top.me).toMatchObject({ rank: 1, nextStreak: null });
  });

  test('unranked student gets rank null; staff get no standing', async () => {
    const s = await createStudent({ extra: { learningStreak: 0 } });
    expect((await userService.getStreakStanding(s._id)).me).toEqual({ rank: null, streak: 0, total: 0 });
    const t = await createTeacher({ extra: { learningStreak: 9, lastActivityDate: daysAgo(0) } });
    expect((await userService.getStreakStanding(t._id)).me).toBeNull();
  });
});
