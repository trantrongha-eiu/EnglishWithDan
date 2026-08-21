// Integration tests for controllers/task1Practice.controller.js
// (routes/task1Practice.js): the premium gate on the actual practice
// content routes, checkAnswer/checkTest grading, saveBatch's server-side
// re-grade, and ownership scoping on history/progress.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createTask1Exercise } = require('../factories/contentFactory');

describe('GET /api/task1/meta', () => {
  test('is public (no auth) and returns counts + totalExercises', async () => {
    await createTask1Exercise({ level: 'beginner', skillType: 'overview' });
    const res = await request(app).get('/api/task1/meta');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.totalExercises).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/task1/exercises (premium gate)', () => {
  test('a free-plan student whose 24h trial has expired is blocked with 403 PLAN_REQUIRED', async () => {
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app).get('/api/task1/exercises').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('unauthenticated requests are rejected (401)', async () => {
    const res = await request(app).get('/api/task1/exercises');
    expect(res.status).toBe(401);
  });

  test('a premium student gets the exercise list, with sampleAnswers/correctOptionIndex stripped', async () => {
    await createTask1Exercise({ level: 'beginner', skillType: 'overview', type: 'fill_blank', sentenceWithBlanks: 'The chart ___.', extra: { primaryAnswer: 'shows', sampleAnswers: ['shows'] } });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app).get('/api/task1/exercises').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.exercises.length).toBeGreaterThanOrEqual(1);
    expect(res.body.exercises[0].sampleAnswers).toBeUndefined();
    expect(res.body.exercises[0].primaryAnswer).toBeUndefined();
  });
});

describe('POST /api/task1/check', () => {
  test('rejects a request missing exerciseId/userAnswer (400)', async () => {
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/task1/check')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({});
    expect(res.status).toBe(400);
  });

  test('returns 404 for a nonexistent exerciseId', async () => {
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/task1/check')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ exerciseId: '000000000000000000000000', userAnswer: 'x' });
    expect(res.status).toBe(404);
  });

  test('grades a correct fill_blank answer', async () => {
    const ex = await createTask1Exercise({
      type: 'fill_blank', extra: { primaryAnswer: 'increased', sampleAnswers: ['increased'], xpReward: 10 },
    });
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/task1/check')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ exerciseId: String(ex._id), userAnswer: 'increased' });
    expect(res.status).toBe(200);
    expect(res.body.isCorrect).toBe(true);
    expect(res.body.xpEarned).toBe(10);
  });

  test('grades an incorrect answer with reduced xp', async () => {
    const ex = await createTask1Exercise({
      type: 'fill_blank', extra: { primaryAnswer: 'increased', sampleAnswers: ['increased'], xpReward: 10 },
    });
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/task1/check')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ exerciseId: String(ex._id), userAnswer: 'totally wrong' });
    expect(res.status).toBe(200);
    expect(res.body.isCorrect).toBe(false);
    expect(res.body.xpEarned).toBe(1);
  });
});

describe('GET /api/task1/test-questions (premium gate)', () => {
  test('a premium student gets a hint-free question set', async () => {
    await createTask1Exercise({ type: 'fill_blank', extra: { primaryAnswer: 'x', sampleAnswers: ['x'] } });
    const user = await createPremiumStudent();
    const res = await request(app)
      .get('/api/task1/test-questions?count=5')
      .set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.exercises)).toBe(true);
  });
});

describe('POST /api/task1/check-test', () => {
  test('rejects an empty answers array (400)', async () => {
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/task1/check-test')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ answers: [] });
    expect(res.status).toBe(400);
  });

  test('grades a batch and returns an aggregate score', async () => {
    const ex = await createTask1Exercise({ type: 'fill_blank', extra: { primaryAnswer: 'right', sampleAnswers: ['right'] } });
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/task1/check-test')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ answers: [{ exerciseId: String(ex._id), userAnswer: 'right' }] });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(1);
    expect(res.body.score).toBe(100);
  });
});

describe('POST /api/task1/save-batch (server-side re-grading)', () => {
  test('ignores a client-forged isCorrect/xpEarned and re-grades against the real answer key', async () => {
    const ex = await createTask1Exercise({ type: 'fill_blank', extra: { primaryAnswer: 'right', sampleAnswers: ['right'], xpReward: 20 } });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);

    const res = await request(app)
      .post('/api/task1/save-batch')
      .set('Authorization', `Bearer ${token}`)
      .send({ attempts: [{ exerciseId: String(ex._id), userAnswer: 'totally wrong', isCorrect: true, xpEarned: 9999 }] });
    expect(res.status).toBe(200);
    expect(res.body.saved).toBe(1);

    const historyRes = await request(app).get('/api/task1/history').set('Authorization', `Bearer ${token}`);
    expect(historyRes.body.attempts[0].isCorrect).toBe(false);
    expect(historyRes.body.attempts[0].xpEarned).not.toBe(9999);
  });

  test('an empty attempts array returns saved:0 without error', async () => {
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/task1/save-batch')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ attempts: [] });
    expect(res.status).toBe(200);
    expect(res.body.saved).toBe(0);
  });
});

describe('GET /api/task1/history and /api/task1/progress (ownership scoping)', () => {
  test('history only returns the requesting student\'s own attempts', async () => {
    const ex = await createTask1Exercise({ type: 'fill_blank', extra: { primaryAnswer: 'a', sampleAnswers: ['a'] } });
    const studentA = await createPremiumStudent();
    const studentB = await createPremiumStudent();

    await request(app).post('/api/task1/save-batch').set('Authorization', `Bearer ${signTokenFor(studentA)}`)
      .send({ attempts: [{ exerciseId: String(ex._id), userAnswer: 'a' }] });
    await request(app).post('/api/task1/save-batch').set('Authorization', `Bearer ${signTokenFor(studentB)}`)
      .send({ attempts: [{ exerciseId: String(ex._id), userAnswer: 'a' }] });

    const res = await request(app).get('/api/task1/history').set('Authorization', `Bearer ${signTokenFor(studentA)}`);
    expect(res.status).toBe(200);
    expect(res.body.attempts).toHaveLength(1);
  });

  test('progress aggregates only the requesting student\'s own XP', async () => {
    const ex = await createTask1Exercise({ type: 'fill_blank', extra: { primaryAnswer: 'a', sampleAnswers: ['a'], xpReward: 10 } });
    const studentA = await createPremiumStudent();
    const studentB = await createPremiumStudent();

    await request(app).post('/api/task1/save-batch').set('Authorization', `Bearer ${signTokenFor(studentA)}`)
      .send({ attempts: [{ exerciseId: String(ex._id), userAnswer: 'a' }] });
    await request(app).post('/api/task1/save-batch').set('Authorization', `Bearer ${signTokenFor(studentB)}`)
      .send({ attempts: [{ exerciseId: String(ex._id), userAnswer: 'a' }] });

    const res = await request(app).get('/api/task1/progress').set('Authorization', `Bearer ${signTokenFor(studentA)}`);
    expect(res.status).toBe(200);
    expect(res.body.totalXP).toBe(10);
  });

  test('progress and history require auth (401) but not premium', async () => {
    expect((await request(app).get('/api/task1/history')).status).toBe(401);
    expect((await request(app).get('/api/task1/progress')).status).toBe(401);
  });
});
