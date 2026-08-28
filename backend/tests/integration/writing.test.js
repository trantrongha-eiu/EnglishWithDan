// Integration tests for a representative slice of the Writing API: /start
// (gated by the free-plan 24h trial, same as every other skill — see
// backend/utils/plan.js's hasFullAccess), ownership scoping on
// /my-history, and the forbidden-vs-not-found split on GET /attempt/:id
// (writingService.getAttempt).
const request = require('supertest');
const app = require('../../app');
const WritingAttempt = require('../../models/WritingAttempt');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const { createWritingTask1, createWritingTask2, createWritingExam, createWritingAttempt } = require('../factories/contentFactory');

const DAY_MS = 24 * 60 * 60 * 1000;

describe('POST /api/writing/start', () => {
  test('a freshly-created free-plan student can start (still inside the 24h trial)', async () => {
    await createWritingTask1();
    await createWritingTask2();
    const user = await createStudent({ plan: 'free', extra: { createdAt: new Date() } });
    const token = signTokenFor(user);
    const res = await request(app).post('/api/writing/start').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.exam.task1).toBeTruthy();
    expect(res.body.exam.task2).toBeTruthy();
  });

  test('a free-plan student whose 24h trial has expired is blocked', async () => {
    await createWritingTask1();
    await createWritingTask2();
    const user = await createStudent({ plan: 'free', extra: { createdAt: new Date(Date.now() - 2 * DAY_MS) } });
    const token = signTokenFor(user);
    const res = await request(app).post('/api/writing/start').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a premium student can start regardless of account age', async () => {
    await createWritingTask1();
    await createWritingTask2();
    const user = await createStudent({ plan: 'premium', extra: { createdAt: new Date(Date.now() - 30 * DAY_MS) } });
    const token = signTokenFor(user);
    const res = await request(app).post('/api/writing/start').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('requires authentication', async () => {
    const res = await request(app).post('/api/writing/start');
    expect(res.status).toBe(401);
  });
});

// BUG-A02: POST /api/writing/submit used to run with `auth` only — a
// lapsed-trial user could create a WritingAttempt (which then feeds the
// auto-grade cron + a teacher grading slot). It now carries the same
// `fullAccess` gate as /start and /practice/submit.
describe('POST /api/writing/submit (full-access gate — BUG-A02)', () => {
  test('a free-plan student whose 24h trial has expired is blocked with 403 PLAN_REQUIRED', async () => {
    const exam = await createWritingExam();
    const user = await createStudent({ plan: 'free', extra: { createdAt: new Date(Date.now() - 2 * DAY_MS) } });
    const token = signTokenFor(user);

    const res = await request(app)
      .post('/api/writing/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ examId: String(exam._id), task1Answer: 'x', task2Answer: 'y' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
    expect(res.body.requiresPremium).toBe(true);
  });

  test('the blocked request creates no WritingAttempt (nothing reaches grading)', async () => {
    const exam = await createWritingExam();
    const user = await createStudent({ plan: 'free', extra: { createdAt: new Date(Date.now() - 2 * DAY_MS) } });
    const token = signTokenFor(user);

    await request(app)
      .post('/api/writing/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ examId: String(exam._id), task1Answer: 'x', task2Answer: 'y' });

    expect(await WritingAttempt.countDocuments({ userId: user._id })).toBe(0);
  });

  test('a premium student is allowed through and the attempt is persisted', async () => {
    const exam = await createWritingExam();
    const user = await createStudent({ plan: 'premium', extra: { createdAt: new Date(Date.now() - 30 * DAY_MS) } });
    const token = signTokenFor(user);

    const res = await request(app)
      .post('/api/writing/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ examId: String(exam._id), task1Answer: 'x', task2Answer: 'y' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.attemptId).toBeTruthy();
    expect(await WritingAttempt.countDocuments({ userId: user._id })).toBe(1);
  });

  test('a freshly-created free-plan student can still submit (inside the 24h trial)', async () => {
    const exam = await createWritingExam();
    const user = await createStudent({ plan: 'free', extra: { createdAt: new Date() } });
    const token = signTokenFor(user);

    const res = await request(app)
      .post('/api/writing/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ examId: String(exam._id), task1Answer: 'x', task2Answer: 'y' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('requires authentication', async () => {
    const res = await request(app).post('/api/writing/submit').send({ examId: 'x' });
    expect(res.status).toBe(401);
  });
});

// BUG-A03: /api/writing/submit triggers TWO Gemini essay grades downstream
// (Task 1 + Task 2), /practice/submit one — neither had a rate limiter,
// unlike speaking.js's /analyze (20/15min) or reading.js's /start (10/15min).
// examSubmitLimiter = 10/15min, practiceSubmitLimiter = 20/15min, keyed per
// authenticated user, admin-exempt, hard 429 with the shared message.
describe('POST /api/writing/submit — rate limit (BUG-A03)', () => {
  const submit = (token, exam) => request(app)
    .post('/api/writing/submit')
    .set('Authorization', `Bearer ${token}`)
    .send({ examId: String(exam._id), task1Answer: 'x', task2Answer: 'y' });

  test('a normal submit is not rate-limited', async () => {
    const exam = await createWritingExam();
    const user = await createStudent({ plan: 'premium' });
    const res = await submit(signTokenFor(user), exam);
    expect(res.status).toBe(201);
  });

  test('the 11th submit in the window returns 429 with the shared message', async () => {
    const exam = await createWritingExam();
    const user = await createStudent({ plan: 'premium' });
    const token = signTokenFor(user);

    for (let i = 0; i < 10; i++) {
      const ok = await submit(token, exam);
      expect(ok.status).toBe(201);
    }
    const blocked = await submit(token, exam);
    expect(blocked.status).toBe(429);
    expect(blocked.body.success).toBe(false);
    expect(blocked.body.message).toMatch(/Quá nhiều yêu cầu/);
  });

  test('a rate-limited submit never persists an attempt (so it never reaches grading)', async () => {
    const exam = await createWritingExam();
    const user = await createStudent({ plan: 'premium' });
    const token = signTokenFor(user);

    for (let i = 0; i < 10; i++) await submit(token, exam);
    await submit(token, exam); // 11th — 429

    // submitExam() (the only path that writes a WritingAttempt, and the only
    // thing the auto-grade cron ever reads) ran exactly 10 times.
    expect(await WritingAttempt.countDocuments({ userId: user._id })).toBe(10);
  });

  test('exhausting the exam limiter does not affect other skills or the separate practice limiter', async () => {
    const exam = await createWritingExam();
    const user = await createStudent({ plan: 'premium' });
    const token = signTokenFor(user);

    for (let i = 0; i < 11; i++) await submit(token, exam); // exam limiter now tripped

    const listening = await request(app).get('/api/listening/tests').set('Authorization', `Bearer ${token}`);
    expect(listening.status).not.toBe(429);

    const practice = await request(app)
      .post('/api/writing/practice/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskType: 1, answer: 'a short practice answer' });
    expect(practice.status).not.toBe(429);
    expect(practice.status).toBe(201);
  });
});

describe('GET /api/writing/my-history (ownership scoping)', () => {
  test("only returns the requesting student's own attempts", async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    await createWritingAttempt({ userId: studentA._id, examName: 'Mine' });
    await createWritingAttempt({ userId: studentB._id, examName: 'NotMine' });

    const token = signTokenFor(studentA);
    const res = await request(app).get('/api/writing/my-history').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.attempts.length).toBe(1);
    expect(res.body.attempts[0].examName).toBe('Mine');
  });
});

describe('GET /api/writing/attempt/:id (ownership)', () => {
  test('the owner can fetch their own attempt', async () => {
    const owner = await createStudent();
    const attempt = await createWritingAttempt({ userId: owner._id });
    const token = signTokenFor(owner);
    const res = await request(app).get(`/api/writing/attempt/${attempt._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(String(res.body.attempt._id)).toBe(String(attempt._id));
  });

  test('a non-owner student is forbidden (403), not shown a 404', async () => {
    const owner = await createStudent();
    const intruder = await createStudent();
    const attempt = await createWritingAttempt({ userId: owner._id });
    const token = signTokenFor(intruder);
    const res = await request(app).get(`/api/writing/attempt/${attempt._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
