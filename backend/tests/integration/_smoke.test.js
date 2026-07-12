// Infrastructure smoke test — proves the test harness itself works
// (in-memory Mongo connects, factories create real documents, Supertest
// can hit the real Express app) before the rest of the suite is built on
// top of it. Not a feature test.
const request = require('supertest');
const app = require('../../app');
const { createStudent, signTokenFor } = require('../factories/userFactory');

describe('test infrastructure smoke test', () => {
  test('connects to the in-memory database and can create a document', async () => {
    const user = await createStudent({ username: 'smoketest' });
    expect(user._id).toBeDefined();
    expect(user.role).toBe('student');
  });

  test('Express app responds to a request via Supertest', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  test('unauthenticated request to a protected route is rejected', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('authenticated request with a factory-issued token succeeds', async () => {
    const user = await createStudent({ username: 'smoketest2' });
    const token = signTokenFor(user);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.id).toBe(String(user._id));
  });
});
