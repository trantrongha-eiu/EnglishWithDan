// Integration tests for a representative slice of the Speaking API: the
// premium gate on /topics, the deliberate free-tier exception on /history
// ("free users vẫn xem được lịch sử cũ" — see routes/speaking.js), and
// ownership scoping on that same history endpoint.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createSpeakingAttempt, createSpeakingQuestion } = require('../factories/contentFactory');

describe('GET /api/speaking/topics (premium gate)', () => {
  // Free-plan gating is now the 24h-trial rule (backend/utils/plan.js's
  // hasFullAccess) — see reading.test.js's matching describe block for the
  // same note.
  test('a free-plan student whose 24h trial has expired is blocked with 403 PLAN_REQUIRED', async () => {
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app).get('/api/speaking/topics').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a freshly-created free-plan student (still inside the 24h trial) is allowed through', async () => {
    const user = await createStudent({ extra: { createdAt: new Date() } });
    const token = signTokenFor(user);
    const res = await request(app).get('/api/speaking/topics').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('a premium student is allowed through', async () => {
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app).get('/api/speaking/topics').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// Regression coverage for BUG-006 (2026-08-27 audit): once a question's
// sampleAnswer/hints were cached (by any student revealing them via the
// dedicated POST /sample-answer or /hints endpoints), GET /questions and
// GET /random returned them directly — 176/176 questions exposed at audit
// time. Direct-API-call security test, exactly as the audit requires.
describe('GET /api/speaking/questions and /random — sampleAnswer/hints never leak', () => {
  test('GET /questions omits sampleAnswer/hints even when cached on the question', async () => {
    await createSpeakingQuestion({
      topic: 'Travel', part: 1,
      sampleAnswer: 'This is the secret model answer.', hints: { vocab: ['itinerary'] },
    });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app).get('/api/speaking/questions?topic=all&part=all').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.questions.length).toBeGreaterThan(0);
    expect(JSON.stringify(res.body)).not.toContain('secret model answer');
    expect(JSON.stringify(res.body)).not.toContain('itinerary');
    for (const q of res.body.questions) {
      expect(q.sampleAnswer).toBeUndefined();
      expect(q.hints).toBeUndefined();
    }
  });

  test('GET /random omits sampleAnswer/hints even when cached on the question', async () => {
    await createSpeakingQuestion({
      topic: 'Food', part: 1,
      sampleAnswer: 'Another secret model answer.', hints: { vocab: ['cuisine'] },
    });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app).get('/api/speaking/random?topic=Food&part=1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.question.sampleAnswer).toBeUndefined();
    expect(res.body.question.hints).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('secret model answer');
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
