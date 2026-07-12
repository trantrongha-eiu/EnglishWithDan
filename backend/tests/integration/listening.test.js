// Integration tests for a representative slice of the Listening API:
// the auth-required list endpoint, the premium-gated /start endpoint, and
// ownership scoping on /history.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createListeningTest, createListeningAttempt } = require('../factories/contentFactory');

describe('GET /api/listening/tests', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/listening/tests');
    expect(res.status).toBe(401);
  });

  test('returns the active test list shape for an authenticated user', async () => {
    await createListeningTest({ name: 'Listening Set 1', testNumber: 1 });
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app).get('/api/listening/tests').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.tests)).toBe(true);
    expect(res.body.userPlan).toBe('free');
  });
});

describe('POST /api/listening/tests/:id/start (premium gate)', () => {
  test('a free-plan student is blocked with 403 PLAN_REQUIRED', async () => {
    const test = await createListeningTest();
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .post(`/api/listening/tests/${test._id}/start`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a premium student passes the gate and can fetch the test', async () => {
    const test = await createListeningTest();
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .post(`/api/listening/tests/${test._id}/start`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/listening/history (ownership scoping)', () => {
  test("only returns the requesting student's own attempts", async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    await createListeningAttempt({ userId: studentA._id, bandScore: 7.5 });
    await createListeningAttempt({ userId: studentB._id, bandScore: 5.0 });

    const token = signTokenFor(studentA);
    const res = await request(app).get('/api/listening/history').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.attempts.length).toBe(1);
    expect(res.body.attempts[0].bandScore).toBe(7.5);
  });
});
