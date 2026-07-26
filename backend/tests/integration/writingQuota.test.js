// Integration tests for the free-plan daily quota on Writing (added
// 2026-07-26, see middleware/dailyLimit.js) — /start (writingExam, 2/day)
// and /practice/submit (writingPractice, 3/day). Complements
// tests/unit/middleware/dailyLimit.test.js (pure counting logic) by
// proving the middleware is actually wired into these two routes and
// persists correctly against a real (in-memory) database.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createWritingTask1, createWritingTask2 } = require('../factories/contentFactory');
const WritingAttempt = require('../../models/WritingAttempt');

describe('POST /api/writing/start — daily quota (writingExam, 2/day)', () => {
  test('a free student can start twice, then gets 403 DAILY_LIMIT_REACHED on the 3rd', async () => {
    await createWritingTask1();
    await createWritingTask2();
    const user = await createStudent({ plan: 'free' });
    const token = signTokenFor(user);

    const first = await request(app).post('/api/writing/start').set('Authorization', `Bearer ${token}`);
    expect(first.status).toBe(200);

    const second = await request(app).post('/api/writing/start').set('Authorization', `Bearer ${token}`);
    expect(second.status).toBe(200);

    const third = await request(app).post('/api/writing/start').set('Authorization', `Bearer ${token}`);
    expect(third.status).toBe(403);
    expect(third.body).toMatchObject({
      success: false,
      code: 'DAILY_LIMIT_REACHED',
      requiresPremium: true,
      limit: 2,
      remaining: 0,
    });
  });

  test('a premium student is never blocked by the quota', async () => {
    await createWritingTask1();
    await createWritingTask2();
    const user = await createPremiumStudent();
    const token = signTokenFor(user);

    for (let i = 0; i < 4; i++) {
      const res = await request(app).post('/api/writing/start').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    }
  });
});

describe('POST /api/writing/practice/submit — daily quota (writingPractice, 3/day)', () => {
  // submitPractice's own business rule blocks a 2nd submission while the
  // previous one is still ungraded (findPendingPracticeAttempt) — unrelated
  // to the daily quota, but it means each successive call in this test must
  // have its predecessor marked graded first, or every call past the first
  // would 429 for that reason instead of exercising the quota.
  async function markAllConfirmed(userId) {
    await WritingAttempt.updateMany({ userId }, { $set: { gradingStatus: 'confirmed' } });
  }

  test('a free student can submit 3 practice attempts, then gets 403 DAILY_LIMIT_REACHED on the 4th', async () => {
    const user = await createStudent({ plan: 'free' });
    const token = signTokenFor(user);
    const body = { taskType: 2, answer: 'This is a practice essay answer for the quota test.', wordCount: 10 };

    for (let i = 0; i < 3; i++) {
      await markAllConfirmed(user._id);
      const res = await request(app).post('/api/writing/practice/submit').set('Authorization', `Bearer ${token}`).send(body);
      expect(res.status).toBe(201);
    }

    await markAllConfirmed(user._id);
    const fourth = await request(app).post('/api/writing/practice/submit').set('Authorization', `Bearer ${token}`).send(body);
    expect(fourth.status).toBe(403);
    expect(fourth.body).toMatchObject({
      success: false,
      code: 'DAILY_LIMIT_REACHED',
      requiresPremium: true,
      limit: 3,
      remaining: 0,
    });
  });

  test('a teacher is never blocked by the quota', async () => {
    const { createTeacher } = require('../factories/userFactory');
    const user = await createTeacher();
    const token = signTokenFor(user);
    const body = { taskType: 2, answer: 'Teacher test answer, long enough to be valid.', wordCount: 10 };

    for (let i = 0; i < 4; i++) {
      await markAllConfirmed(user._id);
      const res = await request(app).post('/api/writing/practice/submit').set('Authorization', `Bearer ${token}`).send(body);
      expect(res.status).toBe(201);
    }
  });
});
