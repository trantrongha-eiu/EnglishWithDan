// Integration tests for a representative slice of the Writing API: /start
// (free — no premium gate), ownership scoping on /my-history, and the
// forbidden-vs-not-found split on GET /attempt/:id (writingService.getAttempt).
const request = require('supertest');
const app = require('../../app');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const { createWritingTask1, createWritingTask2, createWritingAttempt } = require('../factories/contentFactory');

describe('POST /api/writing/start', () => {
  test('a free-plan student can start (writing has no premium gate)', async () => {
    await createWritingTask1();
    await createWritingTask2();
    const user = await createStudent({ plan: 'free' });
    const token = signTokenFor(user);
    const res = await request(app).post('/api/writing/start').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.exam.task1).toBeTruthy();
    expect(res.body.exam.task2).toBeTruthy();
  });

  test('requires authentication', async () => {
    const res = await request(app).post('/api/writing/start');
    expect(res.status).toBe(401);
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
