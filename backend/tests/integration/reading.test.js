// Integration tests for a representative slice of the Reading API:
// the auth-required list endpoint, the premium-gated /start endpoint, and
// ownership scoping on /history.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createReadingTest, createCompletedTestAttempt, createPassage } = require('../factories/contentFactory');

describe('GET /api/reading/tests', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/reading/tests');
    expect(res.status).toBe(401);
  });

  test('returns the active test list shape for an authenticated user', async () => {
    await createReadingTest({ name: 'Orange Test 1', testNumber: 1 });
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app).get('/api/reading/tests').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.tests)).toBe(true);
    expect(res.body.tests.length).toBeGreaterThanOrEqual(1);
    expect(res.body.userPlan).toBe('free');
  });
});

describe('POST /api/reading/start (premium gate)', () => {
  // Free-plan gating is now the 24h-trial rule (backend/utils/plan.js's
  // hasFullAccess) — a free student whose account is past the trial window
  // is blocked; a freshly-created one (the default createStudent() shape)
  // is still inside it, so that case needs its own test below instead of
  // asserting 403 on a bare createStudent().
  test('a free-plan student whose 24h trial has expired is blocked with 403 PLAN_REQUIRED', async () => {
    const test = await createReadingTest();
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/reading/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ testId: String(test._id) });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a freshly-created free-plan student (still inside the 24h trial) passes the gate', async () => {
    const test = await createReadingTest();
    const user = await createStudent({ extra: { createdAt: new Date() } });
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/reading/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ testId: String(test._id) });
    expect(res.status).not.toBe(403);
  });

  test('a premium student passes the gate (reaches the controller, no 403)', async () => {
    const test = await createReadingTest();
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/reading/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ testId: String(test._id) });
    // No passages seeded in this test DB, so the controller reports
    // insufficient_data (400) rather than succeeding — the point of this
    // assertion is that the premium gate itself was passed (not a 403).
    expect(res.status).not.toBe(403);
    expect([200, 400]).toContain(res.status);
  });
});

describe('GET /api/reading/practice/by-id/:id and /api/reading/practice/:category (premium gate)', () => {
  // Regression test for the paywall-bypass bug found in the 2026-08-21 audit:
  // these two routes returned full passage content to any authenticated user
  // (including a free student past the 24h trial) because requirePremium was
  // missing here while the equivalent Listening routes already had it.
  test('practice/by-id/:id blocks a free-plan student whose 24h trial has expired with 403 PLAN_REQUIRED', async () => {
    const passage = await createPassage({ category: 'passage1' });
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app)
      .get(`/api/reading/practice/by-id/${passage._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('practice/by-id/:id lets a premium student through (no 403)', async () => {
    const passage = await createPassage({ category: 'passage1' });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .get(`/api/reading/practice/by-id/${passage._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).not.toBe(403);
    expect(res.status).toBe(200);
  });

  test('practice/:category (random passage) blocks a free-plan student whose 24h trial has expired with 403 PLAN_REQUIRED', async () => {
    await createPassage({ category: 'passage2' });
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app)
      .get('/api/reading/practice/passage2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('practice/:category (random passage) lets a premium student through (no 403)', async () => {
    await createPassage({ category: 'passage2' });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .get('/api/reading/practice/passage2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).not.toBe(403);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/reading/history (ownership scoping)', () => {
  test("only returns the requesting student's own completed attempts", async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    await createCompletedTestAttempt({ userId: studentA._id, bandScore: 7.0 });
    await createCompletedTestAttempt({ userId: studentB._id, bandScore: 5.0 });

    const token = signTokenFor(studentA);
    const res = await request(app).get('/api/reading/history').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.history.length).toBe(1);
    expect(res.body.history[0].bandScore).toBe(7.0);
  });
});
