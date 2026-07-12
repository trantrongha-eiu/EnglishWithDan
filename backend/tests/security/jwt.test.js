// JWT handling regressions on middleware/auth.js: expired tokens, tokens
// signed with the wrong secret, and malformed token strings must all be
// rejected with a clean 401 — never a 500 crash.
const request = require('supertest');
const app = require('../../app');
const jwt = require('jsonwebtoken');
const { createStudent } = require('../factories/userFactory');

describe('expired JWT', () => {
  test('a token that expired in the past is rejected with 401', async () => {
    const user = await createStudent();
    const expiredToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('tampered / invalid JWT', () => {
  test('a token signed with the wrong secret is rejected with 401', async () => {
    const user = await createStudent();
    const badToken = jwt.sign({ id: user._id }, 'totally-the-wrong-secret', { expiresIn: '7d' });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${badToken}`);
    expect(res.status).toBe(401);
  });

  test('a malformed token string does not crash the server (clean 401)', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not.a.real.jwt');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('a completely garbage Authorization header does not crash the server', async () => {
    // Header VALUES are restricted to Latin1 by the HTTP spec — Node's own
    // http client rejects non-Latin1 bytes (e.g. emoji) before the request
    // is even sent, so that can't reach the server to test its handling.
    // Garbage ASCII exercises the same "malformed token" path server-side.
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer !!!not-a-jwt-@#$%^&*()garbage');
    expect(res.status).toBe(401);
  });

  test('missing "Bearer " prefix is rejected with 401', async () => {
    const user = await createStudent();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const res = await request(app).get('/api/auth/me').set('Authorization', token);
    expect(res.status).toBe(401);
  });

  test('a valid token for a user that no longer exists is rejected with 401', async () => {
    const user = await createStudent();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const User = require('../../models/User');
    await User.findByIdAndDelete(user._id);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
});
