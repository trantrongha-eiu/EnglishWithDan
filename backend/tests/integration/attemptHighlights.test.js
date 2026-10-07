'use strict';

// Reading/Listening highlights used to live only in the browser's
// localStorage, so a review opened on another device/browser (or after the
// browser dropped its storage) showed none. They're now saved on the attempt:
//   PUT /api/highlights/:kind/:attemptId   (owner only)
// and returned by every review endpoint; practice attempts also accept them
// on /practice/save (they have no id before that).
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const TestAttempt = require('../../models/TestAttempt');
const ListeningAttempt = require('../../models/ListeningAttempt');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');
const ReadingPracticeAttempt = require('../../models/ReadingPracticeAttempt');
const { sanitizeHighlights } = require('../../services/attemptHighlightService');
const { createPremiumStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const {
  createPassage, createListeningSection, createReadingPracticeAttempt, createListeningAttempt,
} = require('../factories/contentFactory');

const bearer = (u) => `Bearer ${signTokenFor(u)}`;

const HL = {
  ts: 1700000000000,
  parts: {
    0: { p: [[10, 22, 'green', 'pollinate cr']], q: ['Which insect', { text: 'NOT GIVEN', colorKey: 'pink' }] },
    2: { p: [], q: ['flow chart'] },
  },
};

function readingAttempt(userId) {
  const passage = {
    _id: new mongoose.Types.ObjectId(), title: 'P1', category: 'passage1', content: 'Bees pollinate crops.',
    questionRange: { start: 1, end: 1 },
    questionGroups: [{ groupType: 'plain', questions: [{ questionNumber: 1, type: 'sentence-completion', questionText: 'Q1', correctAnswer: 'a' }] }],
    questions: [],
  };
  return TestAttempt.create({
    userId, testId: new mongoose.Types.ObjectId(), status: 'completed',
    passagesUsed: [passage._id], passagesSnapshot: [passage],
    answers: [{ questionNumber: 1, userAnswer: 'b', correctAnswer: 'a', isCorrect: false }],
    correctCount: 0, wrongCount: 1, skippedCount: 0, totalQuestions: 1, bandScore: 5,
    startTime: new Date(), endTime: new Date(), duration: 600,
  });
}

describe('PUT /api/highlights/:kind/:attemptId', () => {
  test('owner saves → full-test reading review returns them', async () => {
    const user = await createPremiumStudent();
    const attempt = await readingAttempt(user._id);

    const put = await request(app).put(`/api/highlights/reading/${attempt._id}`)
      .set('Authorization', bearer(user)).send({ highlights: HL });
    expect(put.status).toBe(200);

    const res = await request(app).get(`/api/reading/attempt/${attempt._id}/review`).set('Authorization', bearer(user));
    expect(res.status).toBe(200);
    expect(res.body.attempt.highlights).toEqual(HL);
  });

  test('works on an in-progress attempt too (saved while taking the test)', async () => {
    const user = await createPremiumStudent();
    const attempt = await TestAttempt.create({
      userId: user._id, testId: new mongoose.Types.ObjectId(), status: 'in-progress', startTime: new Date(),
    });
    const put = await request(app).put(`/api/highlights/reading/${attempt._id}`)
      .set('Authorization', bearer(user)).send({ highlights: HL });
    expect(put.status).toBe(200);
    expect((await TestAttempt.findById(attempt._id).lean()).highlights).toEqual(HL);
  });

  test('listening full test → history detail returns them', async () => {
    const user = await createPremiumStudent();
    const attempt = await createListeningAttempt({
      userId: user._id,
      extra: { sectionsSnapshot: [{ partNumber: 1, title: 'S1', questionGroups: [] }] },
    });
    await request(app).put(`/api/highlights/listening/${attempt._id}`)
      .set('Authorization', bearer(user)).send({ highlights: HL }).expect(200);

    const res = await request(app).get(`/api/listening/history/${attempt._id}`).set('Authorization', bearer(user));
    expect(res.status).toBe(200);
    expect(res.body.result.highlights).toEqual(HL);
  });

  test('reading practice → practice history detail returns them', async () => {
    const user = await createPremiumStudent();
    const passage = await createPassage();
    const attempt = await createReadingPracticeAttempt({ userId: user._id, passageId: passage._id });
    await request(app).put(`/api/highlights/reading-practice/${attempt._id}`)
      .set('Authorization', bearer(user)).send({ highlights: HL }).expect(200);

    const res = await request(app).get(`/api/reading/practice/history/${attempt._id}`).set('Authorization', bearer(user));
    expect(res.status).toBe(200);
    expect(res.body.attempt.highlights).toEqual(HL);
  });

  test("another student's attempt → 404 and nothing written (staff included)", async () => {
    const owner = await createPremiumStudent();
    const other = await createPremiumStudent();
    const teacher = await createTeacher();
    const attempt = await readingAttempt(owner._id);
    for (const u of [other, teacher]) {
      const res = await request(app).put(`/api/highlights/reading/${attempt._id}`)
        .set('Authorization', bearer(u)).send({ highlights: HL });
      expect(res.status).toBe(404);
    }
    expect((await TestAttempt.findById(attempt._id).lean()).highlights).toBeUndefined();
  });

  test('needs auth; rejects an unknown kind, a bad id and a non-object payload', async () => {
    const user = await createPremiumStudent();
    const attempt = await readingAttempt(user._id);
    await request(app).put(`/api/highlights/reading/${attempt._id}`).send({ highlights: HL }).expect(401);
    await request(app).put(`/api/highlights/writing/${attempt._id}`)
      .set('Authorization', bearer(user)).send({ highlights: HL }).expect(404);
    await request(app).put('/api/highlights/reading/not-an-id')
      .set('Authorization', bearer(user)).send({ highlights: HL }).expect(400);
    await request(app).put(`/api/highlights/reading/${attempt._id}`)
      .set('Authorization', bearer(user)).send({ highlights: 'x' }).expect(400);
  });

  test('rejects an oversized payload with 413', async () => {
    const user = await createPremiumStudent();
    const attempt = await readingAttempt(user._id);
    const big = 'x'.repeat(2900);
    const parts = {};
    for (let i = 0; i < 10; i++) parts[i] = { p: [], q: Array.from({ length: 400 }, (_, j) => big + j) };
    const res = await request(app).put(`/api/highlights/reading/${attempt._id}`)
      .set('Authorization', bearer(user)).send({ highlights: { ts: 1, parts } });
    expect(res.status).toBe(413);
  });
});

describe('practice save carries highlights', () => {
  test('reading /practice/save stores them on the new attempt', async () => {
    const user = await createPremiumStudent();
    const passage = await createPassage();
    const res = await request(app).post('/api/reading/practice/save').set('Authorization', bearer(user)).send({
      passageId: passage._id, answers: [], highlights: HL,
    });
    expect(res.status).toBe(200);
    expect((await ReadingPracticeAttempt.findById(res.body.attemptId).lean()).highlights).toEqual(HL);
  });

  test('listening /practice/save stores them on the new attempt', async () => {
    const user = await createPremiumStudent();
    const section = await createListeningSection();
    const res = await request(app).post('/api/listening/practice/save').set('Authorization', bearer(user)).send({
      sectionId: section._id, answers: [], highlights: HL,
    });
    expect(res.status).toBe(200);
    expect((await ListeningPracticeAttempt.findById(res.body.attemptId).lean()).highlights).toEqual(HL);
  });

  test('history lists leave highlights out', async () => {
    const user = await createPremiumStudent();
    const attempt = await readingAttempt(user._id);
    await TestAttempt.updateOne({ _id: attempt._id }, { $set: { highlights: HL } });
    const res = await request(app).get('/api/reading/history').set('Authorization', bearer(user));
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('pollinate cr');
  });
});

describe('sanitizeHighlights', () => {
  test('drops malformed entries but keeps the good ones', () => {
    const clean = sanitizeHighlights({
      ts: 5,
      parts: {
        0: {
          p: [[3, 1, '', 'bad'], [0, 4, 'red', 'Bees'], 'junk', [0, 2, '', '  ']],
          q: ['ok', '', { text: 'c', colorKey: 'orange' }, { text: 'd', colorKey: 'nope' }, 7],
        },
        abc: { p: [[0, 1, '', 'x']], q: [] },
        1: { p: [], q: [] },
      },
      extra: 'ignored',
    });
    expect(clean).toEqual({ ts: 5, parts: { 0: { p: [[0, 4, '', 'Bees']], q: ['ok', { text: 'c', colorKey: 'orange' }, 'd'] } } });
    expect(sanitizeHighlights(null)).toBeNull();
    expect(sanitizeHighlights([])).toBeNull();
  });
});
