// Unit tests for middleware/requirePremium.js — a factory returning
// middleware that gates a route behind premium plan (or admin/teacher role).
// Must run after `auth` middleware (relies on req.user already being set).
const requirePremium = require('../../../middleware/requirePremium');

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('requirePremium middleware factory', () => {
  test('req.user.plan === "premium" calls next()', () => {
    const mw = requirePremium();
    const req = { user: { plan: 'premium', role: 'student' } };
    const res = makeRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('req.user.role === "admin" calls next() even with plan free', () => {
    const mw = requirePremium();
    const req = { user: { plan: 'free', role: 'admin' } };
    const res = makeRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('req.user.role === "teacher" calls next() even with plan free', () => {
    const mw = requirePremium();
    const req = { user: { plan: 'free', role: 'teacher' } };
    const res = makeRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('plan free + role student -> 403 with default message and code PLAN_REQUIRED', () => {
    const mw = requirePremium();
    const req = { user: { plan: 'free', role: 'student' } };
    const res = makeRes();
    const next = jest.fn();

    mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Bạn cần nâng cấp lên Premium để dùng tính năng này',
      code: 'PLAN_REQUIRED',
      requiresPremium: true,
    });
  });

  test('plan free + role student with a custom message -> 403 uses the custom message', () => {
    const mw = requirePremium('Custom upgrade message');
    const req = { user: { plan: 'free', role: 'student' } };
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
