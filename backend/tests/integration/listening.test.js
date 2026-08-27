// Integration tests for a representative slice of the Listening API:
// the auth-required list endpoint, the premium-gated /start endpoint, and
// ownership scoping on /history.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createListeningTest, createListeningAttempt, createListeningSection } = require('../factories/contentFactory');

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
  // Free-plan gating is now the 24h-trial rule (backend/utils/plan.js's
  // hasFullAccess) — see reading.test.js's matching describe block for the
  // same note.
  test('a free-plan student whose 24h trial has expired is blocked with 403 PLAN_REQUIRED', async () => {
    const test = await createListeningTest();
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app)
      .post(`/api/listening/tests/${test._id}/start`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a freshly-created free-plan student (still inside the 24h trial) passes the gate', async () => {
    const test = await createListeningTest();
    const user = await createStudent({ extra: { createdAt: new Date() } });
    const token = signTokenFor(user);
    const res = await request(app)
      .post(`/api/listening/tests/${test._id}/start`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).not.toBe(403);
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

// Regression coverage for BUG-009 (2026-08-27 audit): /practice/save had no
// premium check at all — a lapsed-trial user could call it directly with
// any sectionId to create a real ListeningPracticeAttempt.
describe('POST /api/listening/practice/save (premium gate)', () => {
  test('a free-plan student whose 24h trial has expired is blocked with 403 PLAN_REQUIRED', async () => {
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/listening/practice/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ sectionId: '000000000000000000000000', answers: [] });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a premium student passes the gate and the attempt is actually saved', async () => {
    const section = await createListeningSection();
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/listening/practice/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ sectionId: String(section._id), answers: [{ questionNumber: 1, userAnswer: 'sunny' }], timeTaken: 30 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.attemptId).toBeTruthy();
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

  // Regression coverage for BUG-013 (2026-08-27 audit): this endpoint used
  // to be a bare .limit(50) with no total/hasMore.
  test('reports an honest total/hasMore, independent of ?limit=', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    for (let i = 0; i < 3; i++) await createListeningAttempt({ userId: student._id, bandScore: 6.0 });

    const page = await request(app).get('/api/listening/history').set('Authorization', `Bearer ${token}`).query({ limit: 2 }).send();
    expect(page.body.attempts).toHaveLength(2);
    expect(page.body.total).toBe(3);
    expect(page.body.hasMore).toBe(true);

    const full = await request(app).get('/api/listening/history').set('Authorization', `Bearer ${token}`).query({ limit: 50 }).send();
    expect(full.body.attempts).toHaveLength(3);
    expect(full.body.total).toBe(3);
    expect(full.body.hasMore).toBe(false);
  });

  test('an invalid ?limit= never crashes or returns unbounded results', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    await createListeningAttempt({ userId: student._id, bandScore: 6.0 });

    for (const limit of ['not-a-number', -5, 999999]) {
      const res = await request(app).get('/api/listening/history').set('Authorization', `Bearer ${token}`).query({ limit }).send();
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.attempts)).toBe(true);
    }
  });

  test('an empty history reports total:0, hasMore:false', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const res = await request(app).get('/api/listening/history').set('Authorization', `Bearer ${token}`);
    expect(res.body.attempts).toEqual([]);
    expect(res.body.total).toBe(0);
    expect(res.body.hasMore).toBe(false);
  });
});
