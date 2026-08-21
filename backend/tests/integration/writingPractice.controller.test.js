// Integration tests for controllers/writingPractice.controller.js
// (routes/writingPractice.js): premium gate on the content routes, the
// public meta/topics routes, grading, saveBatch/saveSingle, ownership
// scoping on history/my-stats, and the inline (route-level, not
// middleware-level) teacher/admin role checks on the admin routes.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createWPTopic, createWPExercise } = require('../factories/contentFactory');

describe('GET /api/writing-practice/exercises (premium gate)', () => {
  test('a free-plan student whose 24h trial has expired is blocked with 403 PLAN_REQUIRED', async () => {
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const res = await request(app).get('/api/writing-practice/exercises').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('unauthenticated requests are rejected (401)', async () => {
    expect((await request(app).get('/api/writing-practice/exercises')).status).toBe(401);
  });

  test('a premium student gets the list with sampleAnswer/blankAnswer/alternativeAnswers stripped', async () => {
    await createWPExercise({ question: 'Translate: xin chào', sampleAnswer: 'hello', extra: { blankAnswer: 'hello', alternativeAnswers: ['hi'] } });
    const user = await createPremiumStudent();
    const res = await request(app).get('/api/writing-practice/exercises').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.exercises).toHaveLength(1);
    expect(res.body.exercises[0].sampleAnswer).toBeUndefined();
  });
});

describe('GET /api/writing-practice/meta and /topics (public, no auth)', () => {
  test('meta is reachable without a token', async () => {
    await createWPTopic({ key: 'general' });
    await createWPExercise({ topicKey: 'general', level: 'beginner' });
    const res = await request(app).get('/api/writing-practice/meta');
    expect(res.status).toBe(200);
    expect(res.body.totalExercises).toBeGreaterThanOrEqual(1);
  });

  test('topics is reachable without a token', async () => {
    await createWPTopic({ key: 'family', title: 'Family' });
    const res = await request(app).get('/api/writing-practice/topics');
    expect(res.status).toBe(200);
    expect(res.body.topics.some(t => t.key === 'family')).toBe(true);
  });
});

describe('POST /api/writing-practice/check', () => {
  test('rejects a request missing exerciseId/userAnswer (400)', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/writing-practice/check').set('Authorization', `Bearer ${signTokenFor(user)}`).send({});
    expect(res.status).toBe(400);
  });

  test('returns 404 for a nonexistent exerciseId', async () => {
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/writing-practice/check')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ exerciseId: '000000000000000000000000', userAnswer: 'x' });
    expect(res.status).toBe(404);
  });

  test('grades a correct fill_blank answer', async () => {
    const ex = await createWPExercise({ type: 'fill_blank', sampleAnswer: 'grew', extra: { blankAnswer: 'grew' } });
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/writing-practice/check')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ exerciseId: String(ex._id), userAnswer: 'grew' });
    expect(res.status).toBe(200);
    expect(res.body.feedback.isCorrect).toBe(true);
    expect(res.body.xpEarned).toBe(15);
  });
});

describe('POST /api/writing-practice/check-test', () => {
  test('rejects an empty answers array (400)', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/writing-practice/check-test').set('Authorization', `Bearer ${signTokenFor(user)}`).send({ answers: [] });
    expect(res.status).toBe(400);
  });

  test('grades a batch and returns an aggregate score', async () => {
    const ex = await createWPExercise({ type: 'fill_blank', sampleAnswer: 'right', extra: { blankAnswer: 'right' } });
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/writing-practice/check-test')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ answers: [{ exerciseId: String(ex._id), userAnswer: 'right' }] });
    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(1);
  });
});

describe('POST /api/writing-practice/save-batch and /save', () => {
  test('save-batch rejects an empty attempts array (400)', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/writing-practice/save-batch').set('Authorization', `Bearer ${signTokenFor(user)}`).send({ attempts: [] });
    expect(res.status).toBe(400);
  });

  test('save-batch groups by topic/level and persists xpEarned server-side (never trusting the client)', async () => {
    const ex = await createWPExercise({ type: 'fill_blank', topicKey: 'general', level: 'beginner', sampleAnswer: 'right', extra: { blankAnswer: 'right' } });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);

    const res = await request(app)
      .post('/api/writing-practice/save-batch')
      .set('Authorization', `Bearer ${token}`)
      .send({ attempts: [{ exerciseId: String(ex._id), userAnswer: 'right' }] });
    expect(res.status).toBe(200);
    expect(res.body.saved).toBe(1);

    const statsRes = await request(app).get('/api/writing-practice/my-stats').set('Authorization', `Bearer ${token}`);
    expect(statsRes.body.totalDone).toBe(1);
    expect(statsRes.body.totalXP).toBe(15);
  });

  test('save (single) returns 404 for a nonexistent exerciseId', async () => {
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/writing-practice/save')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ exerciseId: '000000000000000000000000', userAnswer: 'x' });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/writing-practice/history (ownership scoping)', () => {
  test("only returns the requesting student's own attempts", async () => {
    const ex = await createWPExercise({ type: 'fill_blank', sampleAnswer: 'a', extra: { blankAnswer: 'a' } });
    const studentA = await createPremiumStudent();
    const studentB = await createPremiumStudent();

    await request(app).post('/api/writing-practice/save').set('Authorization', `Bearer ${signTokenFor(studentA)}`)
      .send({ exerciseId: String(ex._id), userAnswer: 'a' });
    await request(app).post('/api/writing-practice/save').set('Authorization', `Bearer ${signTokenFor(studentB)}`)
      .send({ exerciseId: String(ex._id), userAnswer: 'a' });

    const res = await request(app).get('/api/writing-practice/history').set('Authorization', `Bearer ${signTokenFor(studentA)}`);
    expect(res.status).toBe(200);
    expect(res.body.attempts).toHaveLength(1);
  });
});

describe('Admin routes — inline role check (route-level auth only, no teacherOnly middleware)', () => {
  test('adminBulkAddExercises: a plain student is rejected (403)', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post('/api/writing-practice/admin/exercises')
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ exercises: [{ topicKey: 'general', level: 'beginner', type: 'fill_blank', question: 'Q', sampleAnswer: 'A' }] });
    expect(res.status).toBe(403);
  });

  test('adminBulkAddExercises: unauthenticated requests are rejected (401)', async () => {
    expect((await request(app).post('/api/writing-practice/admin/exercises').send({ exercises: [] })).status).toBe(401);
  });

  test('adminBulkAddExercises: a teacher can create exercises', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post('/api/writing-practice/admin/exercises')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ exercises: [{ topicKey: 'general', level: 'beginner', type: 'fill_blank', question: 'Q', sampleAnswer: 'A' }] });
    expect(res.status).toBe(200);
    expect(res.body.created).toBe(1);
  });

  test('adminSoftDeleteExercise: a teacher is rejected (403) — this route only allows role === "admin"', async () => {
    const ex = await createWPExercise();
    const teacher = await createTeacher();
    const res = await request(app)
      .delete(`/api/writing-practice/admin/exercises/${ex._id}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(403);
  });

  test('adminSoftDeleteExercise: an admin can soft-delete', async () => {
    const ex = await createWPExercise();
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/writing-practice/admin/exercises/${ex._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
