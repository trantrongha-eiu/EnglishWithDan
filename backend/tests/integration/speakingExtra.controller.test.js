// Additional integration tests for controllers/speaking.controller.js,
// covering the routes NOT already exercised by tests/integration/speaking.test.js
// (which only covers /topics's premium gate and /history's ownership +
// free-tier exception). This file covers: getRandom, getQuestions, the
// AI-calling routes (analyze/sample-answer/hints/improve/retry — Gemini
// mocked so no real network call is made, same pattern as
// tests/unit/services/speakingService.test.js), and materials/material-filters.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createSpeakingQuestion, createSpeakingAttempt } = require('../factories/contentFactory');
const SpeakingMaterial = require('../../models/SpeakingMaterial');

jest.mock('../../services/geminiService');
const geminiService = require('../../services/geminiService');

function feedback(overrides = {}) {
  return { fluency: 6, vocabulary: 6, grammar: 6, pronunciation: 6, overallFeedback: 'Good job', ...overrides };
}

describe('GET /api/speaking/random', () => {
  test('requires premium (403 PLAN_REQUIRED for an expired free trial)', async () => {
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const res = await request(app).get('/api/speaking/random').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('returns success:false when no question matches the filter', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).get('/api/speaking/random?topic=NoSuchTopic').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
  });

  test('returns a real question when one matches', async () => {
    await createSpeakingQuestion({ topic: 'Travel', part: 1 });
    const user = await createPremiumStudent();
    const res = await request(app).get('/api/speaking/random?topic=Travel&part=1').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.question.topic).toBe('Travel');
  });
});

describe('GET /api/speaking/questions', () => {
  test('requires premium', async () => {
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    expect((await request(app).get('/api/speaking/questions').set('Authorization', `Bearer ${signTokenFor(user)}`)).status).toBe(403);
  });

  test('marks a question as attempted once the student has a saved attempt for it', async () => {
    const q = await createSpeakingQuestion({ topic: 'Hobbies', part: 1 });
    const user = await createPremiumStudent();
    await createSpeakingAttempt({ userId: user._id, topic: 'Hobbies', part: 1, extra: { questionId: q._id } });

    const res = await request(app).get('/api/speaking/questions?topic=Hobbies&part=1').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.questions[0].attempted).toBe(true);
  });
});

describe('POST /api/speaking/analyze', () => {
  test('rejects an empty transcript (400)', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/speaking/analyze').set('Authorization', `Bearer ${signTokenFor(user)}`).send({ transcript: '   ' });
    expect(res.status).toBe(400);
  });

  test('requires premium', async () => {
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const res = await request(app).post('/api/speaking/analyze').set('Authorization', `Bearer ${signTokenFor(user)}`).send({ transcript: 'I like reading books.' });
    expect(res.status).toBe(403);
  });

  test('success: grades the transcript, persists the attempt, and returns feedback + attemptId', async () => {
    geminiService.checkSpeaking.mockResolvedValue(feedback());
    const user = await createPremiumStudent();
    const token = signTokenFor(user);

    const res = await request(app)
      .post('/api/speaking/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({ transcript: 'I enjoy reading books in my free time.', question: 'What do you like to do?', part: 1 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.feedback.overallBand).toBeGreaterThan(0);
    expect(res.body.attemptId).toBeTruthy();

    const historyRes = await request(app).get('/api/speaking/history').set('Authorization', `Bearer ${token}`);
    expect(historyRes.body.attempts).toHaveLength(1);
    expect(historyRes.body.attempts[0].status).toBe('analyzed');
  });

  test('AI overload error surfaces as 503, and marks the pending attempt as error', async () => {
    const overloadErr = new Error('Model overloaded');
    overloadErr.isOverloaded = true;
    geminiService.checkSpeaking.mockRejectedValue(overloadErr);
    const user = await createPremiumStudent();
    const token = signTokenFor(user);

    const res = await request(app)
      .post('/api/speaking/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({ transcript: 'Some transcript text here.', part: 1 });
    expect(res.status).toBe(503);

    const historyRes = await request(app).get('/api/speaking/history').set('Authorization', `Bearer ${token}`);
    expect(historyRes.body.attempts[0].status).toBe('error');
  });

  test('a generic AI failure surfaces as 500', async () => {
    geminiService.checkSpeaking.mockRejectedValue(new Error('network blew up'));
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/speaking/analyze')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ transcript: 'Some transcript text here.', part: 1 });
    expect(res.status).toBe(500);
  });
});

describe('POST /api/speaking/sample-answer', () => {
  test('rejects a missing question (400)', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/speaking/sample-answer').set('Authorization', `Bearer ${signTokenFor(user)}`).send({});
    expect(res.status).toBe(400);
  });

  test('rejects an invalid part (400)', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/speaking/sample-answer').set('Authorization', `Bearer ${signTokenFor(user)}`).send({ question: 'Describe your home.', part: 9 });
    expect(res.status).toBe(400);
  });

  test('success: returns a generated sample answer and caches it on the question', async () => {
    geminiService.generateSampleAnswer.mockResolvedValue({ sampleAnswer: 'My home is a cozy apartment.', vocab: ['cozy'] });
    const q = await createSpeakingQuestion({ topic: 'Home', part: 1, question: 'Describe your home.' });
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/speaking/sample-answer')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ questionId: String(q._id), question: 'Describe your home.', part: 1 });
    expect(res.status).toBe(200);
    expect(res.body.sampleAnswer).toContain('cozy apartment');
  });
});

describe('POST /api/speaking/hints', () => {
  test('rejects a missing question (400)', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/speaking/hints').set('Authorization', `Bearer ${signTokenFor(user)}`).send({});
    expect(res.status).toBe(400);
  });

  test('success: returns vocab hints without exposing the sample answer text', async () => {
    geminiService.generateSampleAnswer.mockResolvedValue({ sampleAnswer: 'Full sample text.', vocab: ['spacious', 'cozy'] });
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/speaking/hints')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ question: 'Describe your home.', part: 1 });
    expect(res.status).toBe(200);
    expect(res.body.hints.vocab).toEqual(['spacious', 'cozy']);
    expect(res.body.sampleAnswer).toBeUndefined();
  });
});

describe('POST /api/speaking/improve', () => {
  test('rejects an empty transcript (400)', async () => {
    const user = await createPremiumStudent();
    const res = await request(app).post('/api/speaking/improve').set('Authorization', `Bearer ${signTokenFor(user)}`).send({ transcript: '' });
    expect(res.status).toBe(400);
  });

  test('success: returns the improved answer', async () => {
    geminiService.generateImprovedAnswer.mockResolvedValue({ improvedAnswer: 'A much better version of the answer.' });
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/speaking/improve')
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ question: 'What do you like to do?', part: 1, transcript: 'I like read book.' });
    expect(res.status).toBe(200);
    expect(res.body.improvedAnswer).toContain('better version');
  });
});

describe('POST /api/speaking/:attemptId/retry', () => {
  test('returns 404 for a nonexistent/not-owned attempt', async () => {
    const user = await createPremiumStudent();
    const res = await request(app)
      .post('/api/speaking/000000000000000000000000/retry')
      .set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(404);
  });

  test('refuses to re-grade an already-analyzed attempt (409)', async () => {
    const user = await createPremiumStudent();
    const attempt = await createSpeakingAttempt({ userId: user._id, status: 'analyzed' });
    const res = await request(app)
      .post(`/api/speaking/${attempt._id}/retry`)
      .set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(409);
  });

  test('re-grades a stuck "error" attempt against its own stored transcript', async () => {
    geminiService.checkSpeaking.mockResolvedValue(feedback());
    const user = await createPremiumStudent();
    const attempt = await createSpeakingAttempt({ userId: user._id, status: 'error', transcript: 'My stored transcript.' });
    const res = await request(app)
      .post(`/api/speaking/${attempt._id}/retry`)
      .set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.feedback.overallBand).toBeGreaterThan(0);
  });

  test('another user cannot retry-grade someone else\'s attempt (ownership scoping -> 404)', async () => {
    const owner = await createPremiumStudent();
    const intruder = await createPremiumStudent();
    const attempt = await createSpeakingAttempt({ userId: owner._id, status: 'error' });
    const res = await request(app)
      .post(`/api/speaking/${attempt._id}/retry`)
      .set('Authorization', `Bearer ${signTokenFor(intruder)}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/speaking/materials and /material-filters', () => {
  test('materials requires premium', async () => {
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    expect((await request(app).get('/api/speaking/materials').set('Authorization', `Bearer ${signTokenFor(user)}`)).status).toBe(403);
  });

  test('materials returns active materials filtered by quarter/topic', async () => {
    await SpeakingMaterial.create({ title: 'Set 1', quarter: 'Q1 2025', topic: 'Travel', pdfUrl: 'https://x/1.pdf' });
    await SpeakingMaterial.create({ title: 'Set 2', quarter: 'Q2 2025', topic: 'Travel', pdfUrl: 'https://x/2.pdf' });
    const user = await createPremiumStudent();
    const res = await request(app).get('/api/speaking/materials?quarter=Q1 2025').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.materials).toHaveLength(1);
    expect(res.body.materials[0].title).toBe('Set 1');
  });

  test('material-filters returns the distinct quarters/topics available', async () => {
    await SpeakingMaterial.create({ title: 'Set 1', quarter: 'Q1 2025', topic: 'Travel', pdfUrl: 'https://x/1.pdf' });
    const user = await createPremiumStudent();
    const res = await request(app).get('/api/speaking/material-filters').set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.quarters).toContain('Q1 2025');
    expect(res.body.topics).toContain('Travel');
  });
});
