// Unit tests for middleware/auth.js — the app's JWT authentication gate.
// Uses fake req/res objects (no full Express app needed) plus a real
// Mongo-backed User document via userFactory, since the middleware does a
// real User.findById lookup.
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../middleware/auth');
const User = require('../../../models/User');
const { createStudent, createPremiumStudent, signTokenFor } = require('../../factories/userFactory');

function makeReq(token) {
  return {
    header: (name) => (name === 'Authorization' && token ? `Bearer ${token}` : undefined),
  };
}

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('auth middleware', () => {
  test('valid token + existing non-banned user sets req.user and calls next() with no args', async () => {
    const user = await createStudent();
    const token = signTokenFor(user);
    const req = makeReq(token);
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeDefined();
    expect(req.user._id.toString()).toBe(user._id.toString());
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('missing Authorization header -> 401, next not called', async () => {
    const req = makeReq(null);
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  test('malformed header (does not start with "Bearer ") -> 401', async () => {
    const req = { header: (name) => (name === 'Authorization' ? 'Token abc123' : undefined) };
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('invalid JWT (garbage string) -> 401', async () => {
    const req = makeReq('this.is.not-a-valid-jwt');
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.any(String) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('expired JWT -> 401', async () => {
    const user = await createStudent();
    const expiredToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const req = makeReq(expiredToken);
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('valid token but user since-deleted from DB -> 401 "Tài khoản không tồn tại"', async () => {
    const user = await createStudent();
    const token = signTokenFor(user);
    await User.findByIdAndDelete(user._id);

    const req = makeReq(token);
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Tài khoản không tồn tại' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('valid token for a banned user -> 403 (not 401) with ban message, next not called', async () => {
    const user = await createStudent({ isBanned: true });
    const token = signTokenFor(user);
    const req = makeReq(token);
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('cấm'),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('premium user with planExpiresAt in the past is auto-downgraded to free on req.user', async () => {
    const user = await createPremiumStudent({ planExpiresAt: new Date(Date.now() - 60 * 1000) });
    const token = signTokenFor(user);
    const req = makeReq(token);
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.plan).toBe('free');
  });

  test('premium user with planExpiresAt in the future keeps plan=premium', async () => {
    const user = await createPremiumStudent({ planExpiresAt: new Date(Date.now() + 60 * 60 * 1000) });
    const token = signTokenFor(user);
    const req = makeReq(token);
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.plan).toBe('premium');
  });
});
