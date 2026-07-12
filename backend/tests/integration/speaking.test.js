// Integration tests for a representative slice of the Speaking API: the
// premium gate on /topics, the deliberate free-tier exception on /history
// ("free users vẫn xem được lịch sử cũ" — see routes/speaking.js), and
// ownership scoping on that same history endpoint.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createSpeakingAttempt } = require('../factories/contentFactory');

describe('GET /api/speaking/topics (premium gate)', () => {
  test('a free-plan student is blocked with 403 PLAN_REQUIRED', async () => {
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app).get('/api/speaking/topics').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a premium student is allowed through', async () => {
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app).get('/api/speaking/topics').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/speaking/history', () => {
  test('a free-plan student can still view their own history (deliberate exception)', async () => {
    const user = await createStudent();
    await createSpeakingAttempt({ userId: user._id });
    const token = signTokenFor(user);
    const res = await request(app).get('/api/speaking/history').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.attempts.length).toBe(1);
  });

  test('only returns the requesting student\'s own attempts', async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    await createSpeakingAttempt({ userId: studentA._id, topic: 'A-topic' });
    await createSpeakingAttempt({ userId: studentB._id, topic: 'B-topic' });

    const token = signTokenFor(studentA);
    const res = await request(app).get('/api/speaking/history').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.attempts.length).toBe(1);
    expect(res.body.attempts[0].topic).toBe('A-topic');
  });
});
