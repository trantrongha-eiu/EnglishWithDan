// Regression tests from the 2026-11-12 Profile page debug pass:
//  - GET /api/user/profile no longer leaks internal fields, reports hasPassword
//  - a social-only account can SET a password (profile.html never let it)
//  - malformed profile / password input is a 400, not a 500
//  - Writing placeholders (test opened, not submitted) don't light the heatmap
//  - admin password reset: min length, signs the account out everywhere
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const WritingAttempt = require('../../models/WritingAttempt');
const { createStudent, createAdmin, signTokenFor } = require('../factories/userFactory');

const auth = user => ({ Authorization: `Bearer ${signTokenFor(user)}` });

describe('GET /api/user/profile — response shape', () => {
  test('omits savedVocab / activeSessions / tallies and reports hasPassword', async () => {
    const user = await createStudent({ extra: { savedVocab: [{ word: 'apple' }], earnedBadgeIds: ['x'] } });
    const res = await request(app).get('/api/user/profile').set(auth(user));
    expect(res.status).toBe(200);
    const u = res.body.user;
    expect(u.savedVocab).toBeUndefined();
    expect(u.activeSessions).toBeUndefined();
    expect(u.earnedBadgeIds).toBeUndefined();
    expect(u.resetOTPAttempts).toBeUndefined();
    expect(u.hasPassword).toBe(true);
  });

  test('a social-only account reports hasPassword:false', async () => {
    const user = await createStudent({ password: '', extra: { authProvider: 'google', googleId: 'g-1' } });
    const res = await request(app).get('/api/user/profile').set(auth(user));
    expect(res.body.user.hasPassword).toBe(false);
  });
});

describe('PUT /api/user/profile — malformed input', () => {
  test('a non-string firstName is a 400, not a 500', async () => {
    const user = await createStudent();
    const res = await request(app).put('/api/user/profile').set(auth(user)).send({ firstName: { $gt: '' } });
    expect(res.status).toBe(400);
  });

  test('an over-long name is rejected', async () => {
    const user = await createStudent();
    const res = await request(app).put('/api/user/profile').set(auth(user)).send({ firstName: 'a'.repeat(51) });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/user/change-password — social accounts and bad input', () => {
  test('a Google account with no password can set one (no currentPassword needed)', async () => {
    const user = await createStudent({ password: '', extra: { authProvider: 'google', googleId: 'g-2' } });
    const res = await request(app).put('/api/user/change-password').set(auth(user)).send({ newPassword: 'BrandNew123' });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    const fromDb = await User.findById(user._id).select('+password');
    expect(fromDb.password).toBeTruthy();
  });

  test('…even when the client still sends a currentPassword', async () => {
    const user = await createStudent({ password: '', extra: { authProvider: 'google', googleId: 'g-3' } });
    const res = await request(app).put('/api/user/change-password').set(auth(user)).send({ currentPassword: 'whatever', newPassword: 'BrandNew123' });
    expect(res.status).toBe(200);
  });

  test('missing currentPassword on a password account is a 400, not a 500', async () => {
    const user = await createStudent();
    const res = await request(app).put('/api/user/change-password').set(auth(user)).send({ newPassword: 'BrandNew123' });
    expect(res.status).toBe(400);
  });

  test('a non-string newPassword is a 400, not a 500', async () => {
    const user = await createStudent();
    const res = await request(app).put('/api/user/change-password').set(auth(user)).send({ currentPassword: 'Test1234!', newPassword: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/user/activity-heatmap — Writing placeholders', () => {
  test('an opened-but-not-submitted Writing test does not count', async () => {
    const user = await createStudent();
    await WritingAttempt.collection.insertMany([
      { userId: user._id, status: 'in-progress', createdAt: new Date() },
      { userId: user._id, status: 'cancelled', createdAt: new Date() },
    ]);
    const res = await request(app).get('/api/user/activity-heatmap?days=7').set(auth(user));
    expect(res.status).toBe(200);
    expect(res.body.activity).toEqual([]);
  });
});

describe('PUT /api/admin/users/:id — password reset', () => {
  test('rejects a password shorter than 8 characters', async () => {
    const admin = await createAdmin();
    const student = await createStudent();
    const res = await request(app).put(`/api/admin/users/${student._id}`).set(auth(admin)).send({ newPassword: 'short' });
    expect(res.status).toBe(400);
  });

  test('a reset signs the student out of sessions issued before it', async () => {
    const admin = await createAdmin();
    const student = await createStudent();
    const oldToken = jwt.sign({ id: student._id, iat: Math.floor(Date.now() / 1000) - 5 }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const res = await request(app).put(`/api/admin/users/${student._id}`).set(auth(admin)).send({ newPassword: 'ResetPass123' });
    expect(res.status).toBe(200);
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${oldToken}`);
    expect(me.status).toBe(401);
  });

  test('a duplicate email gets a readable message, not the raw E11000 text', async () => {
    const admin = await createAdmin();
    const a = await createStudent();
    const b = await createStudent();
    const res = await request(app).put(`/api/admin/users/${b._id}`).set(auth(admin)).send({ email: a.email });
    expect(res.status).toBe(400);
    expect(res.body.message).not.toMatch(/E11000/);
  });
});
