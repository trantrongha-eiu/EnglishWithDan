// Unit tests for middleware/requirePremium.js — a factory returning
// middleware that gates a route behind full access: premium plan,
// admin/teacher role, or still within the first-24h free trial window
// (backend/utils/plan.js's hasFullAccess — see that module's own tests for
// the trial-window edge cases; these tests focus on the middleware
// plumbing itself: request/response shape, custom message override).
// Must run after `auth` middleware (relies on req.user already being set).
const requirePremium = require('../../../middleware/requirePremium');

const DAY_MS = 24 * 60 * 60 * 1000;
const justNow = () => new Date();
const longAgo = () => new Date(Date.now() - 2 * DAY_MS);

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('requirePremium middleware factory', () => {
  test('req.user.plan === "premium" calls next() regardless of createdAt', () => {
    const mw = requirePremium();
    const req = { user: { plan: 'premium', role: 'student', createdAt: longAgo() } };
    const res = makeRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('req.user.role === "admin" calls next() even with plan free and an old account', () => {
    const mw = requirePremium();
    const req = { user: { plan: 'free', role: 'admin', createdAt: longAgo() } };
    const res = makeRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('req.user.role === "teacher" calls next() even with plan free and an old account', () => {
    const mw = requirePremium();
    const req = { user: { plan: 'free', role: 'teacher', createdAt: longAgo() } };
    const res = makeRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('plan free + role student, account created just now -> calls next() (inside the 24h trial)', () => {
    const mw = requirePremium();
    const req = { user: { plan: 'free', role: 'student', createdAt: justNow() } };
    const res = makeRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('plan free + role student, account created 2 days ago -> 403 with default message and code PLAN_REQUIRED', () => {
    const mw = requirePremium();
    const req = { user: { plan: 'free', role: 'student', createdAt: longAgo() } };
    const res = makeRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Tài khoản dùng thử miễn phí 1 ngày của bạn đã hết hạn. Nâng cấp Premium để tiếp tục sử dụng.',
      code: 'PLAN_REQUIRED',
      requiresPremium: true,
    });
  });

  test('plan free + role student, no createdAt at all -> 403 (treated as expired, fail closed)', () => {
    const mw = requirePremium();
    const req = { user: { plan: 'free', role: 'student' } };
    const res = makeRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('expired trial with a custom message -> 403 uses the custom message', () => {
    const mw = requirePremium('Custom upgrade message');
    const req = { user: { plan: 'free', role: 'student', createdAt: longAgo() } };
    const res = makeRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Custom upgrade message',
      code: 'PLAN_REQUIRED',
      requiresPremium: true,
    });
  });
});
