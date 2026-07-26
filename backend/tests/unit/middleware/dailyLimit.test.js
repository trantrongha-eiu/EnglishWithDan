// Unit tests for middleware/dailyLimit.js — a factory returning middleware
// that gates a route behind a per-day usage quota for free-plan users.
// Mirrors requirePremium.test.js's structure/style, but User.updateOne is
// mocked (dailyLimit is async and touches the DB) rather than hitting a
// real database — the counting logic itself is what's under test here.
jest.mock('../../../models/User', () => ({ updateOne: jest.fn().mockResolvedValue({}) }));

const User = require('../../../models/User');
const dailyLimit = require('../../../middleware/dailyLimit');
const { getVNDay } = require('../../../utils/streak');

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

beforeEach(() => {
  User.updateOne.mockClear();
});

describe('dailyLimit middleware factory', () => {
  test('premium plan bypasses entirely — no DB write, no counting', async () => {
    const mw = dailyLimit('writingExam', 2, 'msg');
    const req = { user: { _id: 'u1', plan: 'premium', role: 'student', freeUsage: { date: null } } };
    const res = makeRes();
    const next = jest.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(User.updateOne).not.toHaveBeenCalled();
  });

  test('admin role bypasses even with plan free', async () => {
    const mw = dailyLimit('writingExam', 2, 'msg');
    const req = { user: { _id: 'u1', plan: 'free', role: 'admin', freeUsage: {} } };
    const res = makeRes();
    const next = jest.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(User.updateOne).not.toHaveBeenCalled();
  });

  test('teacher role bypasses even with plan free', async () => {
    const mw = dailyLimit('writingExam', 2, 'msg');
    const req = { user: { _id: 'u1', plan: 'free', role: 'teacher', freeUsage: {} } };
    const res = makeRes();
    const next = jest.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(User.updateOne).not.toHaveBeenCalled();
  });

  test('free student with no prior usage today — allowed, count seeded to 1', async () => {
    const mw = dailyLimit('writingExam', 2, 'msg');
    const req = { user: { _id: 'u1', plan: 'free', role: 'student', freeUsage: { date: null } } };
    const res = makeRes();
    const next = jest.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    const [filter, update] = User.updateOne.mock.calls[0];
    expect(filter).toEqual({ _id: 'u1' });
    expect(update.$set.freeUsage.writingExam).toBe(1);
    expect(update.$set.freeUsage.date.getTime()).toBe(getVNDay(new Date()).getTime());
  });

  test('free student under limit today — increments existing same-day count', async () => {
    const mw = dailyLimit('writingExam', 2, 'msg');
    const today = getVNDay(new Date());
    const req = { user: { _id: 'u1', plan: 'free', role: 'student', freeUsage: { date: today, writingExam: 1 } } };
    const res = makeRes();
    const next = jest.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const [, update] = User.updateOne.mock.calls[0];
    expect(update.$set['freeUsage.writingExam']).toBe(2);
  });

  test('free student at limit today — blocked with 403 DAILY_LIMIT_REACHED, no DB write, next() not called', async () => {
    const mw = dailyLimit('writingExam', 2, 'Custom quota message');
    const today = getVNDay(new Date());
    const req = { user: { _id: 'u1', plan: 'free', role: 'student', freeUsage: { date: today, writingExam: 2 } } };
    const res = makeRes();
    const next = jest.fn();

    await mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(User.updateOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Custom quota message',
      code: 'DAILY_LIMIT_REACHED',
      requiresPremium: true,
      limit: 2,
      remaining: 0,
    });
  });

  test('free student over limit from a previous VN-day — treated as a new day, allowed again', async () => {
    const mw = dailyLimit('writingExam', 2, 'msg');
    const yesterday = new Date(getVNDay(new Date()).getTime() - 24 * 60 * 60 * 1000);
    const req = { user: { _id: 'u1', plan: 'free', role: 'student', freeUsage: { date: yesterday, writingExam: 2 } } };
    const res = makeRes();
    const next = jest.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    const [, update] = User.updateOne.mock.calls[0];
    expect(update.$set.freeUsage.writingExam).toBe(1);
  });

  test('separate features track independent counters on the same user/day', async () => {
    const mw = dailyLimit('writingPractice', 3, 'msg');
    const today = getVNDay(new Date());
    // writingExam is already maxed out today, but writingPractice hasn't been touched.
    const req = { user: { _id: 'u1', plan: 'free', role: 'student', freeUsage: { date: today, writingExam: 2 } } };
    const res = makeRes();
    const next = jest.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('a DB error while tracking usage fails open — request still proceeds', async () => {
    User.updateOne.mockRejectedValueOnce(new Error('connection lost'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mw = dailyLimit('writingExam', 2, 'msg');
    const req = { user: { _id: 'u1', plan: 'free', role: 'student', freeUsage: { date: null } } };
    const res = makeRes();
    const next = jest.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('missing freeUsage entirely (never used any quota before) is treated as a fresh day', async () => {
    const mw = dailyLimit('writingExam', 2, 'msg');
    const req = { user: { _id: 'u1', plan: 'free', role: 'student' } };
    const res = makeRes();
    const next = jest.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
