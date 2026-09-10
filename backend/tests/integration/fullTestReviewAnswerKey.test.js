'use strict';

// FOUND-BUT-NOT-TOUCHED → now fixed: the full-test review routes are
// auth-only (review your own past result) but returned correctAnswer +
// explanation inline, so a lapsed premium/trial user could keep
// harvesting answer keys for every test they ever sat.
//
//   GET /api/reading/attempt/:id/review   (readingService.getAttemptReview)
//   GET /api/listening/history/:attemptId (listeningService.getHistoryDetail)
//
// Fix: controller strips the answer key when !hasFullAccess(req.user) and
// sets `answerKeyWithheld: true`. Scores / band / right-wrong stay.
// Ownership / staff bypass unchanged.
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const TestAttempt = require('../../models/TestAttempt');
const ListeningAttempt = require('../../models/ListeningAttempt');
const {
  createStudent, createPremiumStudent, createTeacher, createAdmin, createUser, signTokenFor,
} = require('../factories/userFactory');

const CORRECT = 'SENTINEL_CORRECT';
const EXPLAIN = 'SENTINEL_EXPLANATION';
const bearer = (u) => `Bearer ${signTokenFor(u)}`;
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const READING_SNAPSHOT = [{
  _id: new mongoose.Types.ObjectId(), title: 'P1', category: 'passage1', content: 'passage text',
  questionRange: { start: 1, end: 1 },
  questionGroups: [{
    groupType: 'plain',
    questions: [{ questionNumber: 1, type: 'sentence-completion', questionText: 'Q1', correctAnswer: CORRECT, explanation: EXPLAIN }],
  }],
  questions: [],
}];
const LISTENING_SNAPSHOT = [{
  partNumber: 1, title: 'S1', questionRange: { start: 1, end: 1 },
  questionGroups: [{
    groupType: 'plain',
    questions: [{ questionNumber: 1, type: 'sentence-completion', questionText: 'Q1', correctAnswer: CORRECT, explanation: EXPLAIN }],
  }],
}];
const ANSWERS = [{ questionNumber: 1, userAnswer: 'mine', correctAnswer: CORRECT, isCorrect: false }];

function readingAttempt(userId) {
  return TestAttempt.create({
    userId, testId: new mongoose.Types.ObjectId(), status: 'completed',
    passagesUsed: [READING_SNAPSHOT[0]._id], passagesSnapshot: READING_SNAPSHOT, answers: ANSWERS,
    correctCount: 0, wrongCount: 1, skippedCount: 0, totalQuestions: 1, bandScore: 5,
    startTime: daysAgo(1), endTime: daysAgo(1), duration: 600,
  });
}
function listeningAttempt(userId) {
  return ListeningAttempt.create({
    userId, testId: new mongoose.Types.ObjectId(), testName: 'LT', status: 'completed',
    sectionsSnapshot: LISTENING_SNAPSHOT, audioUrlSnapshot: '', answers: ANSWERS,
    correctCount: 0, wrongCount: 1, skippedCount: 0, totalQuestions: 1, bandScore: 5,
    submittedAt: daysAgo(1),
  });
}

function assertKeyPresent(body) {
  const raw = JSON.stringify(body);
  expect(raw).toContain(CORRECT);
  expect(raw).toContain(EXPLAIN);
  expect(body.answerKeyWithheld).toBeFalsy();
}
function assertKeyWithheld(body) {
  const raw = JSON.stringify(body);
  expect(raw).not.toContain(CORRECT);
  expect(raw).not.toContain(EXPLAIN);
  expect(raw).not.toContain('"correctAnswer"');
  expect(raw).not.toContain('"explanation"');
  expect(body.answerKeyWithheld).toBe(true);
}

// ───────────────────────────── READING ─────────────────────────────

describe('GET /api/reading/attempt/:id/review — answer key gated by full access', () => {
  const url = (id) => `/api/reading/attempt/${id}/review`;

  test('premium owner → full review WITH correctAnswer + explanation', async () => {
    const u = await createPremiumStudent();
    const a = await readingAttempt(u._id);
    const r = await request(app).get(url(a._id)).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    assertKeyPresent(r.body);
    expect(r.body.attempt.bandScore).toBe(5); // scores still there
  });

  test('active-trial owner (fresh account) → full review', async () => {
    const u = await createStudent();
    const a = await readingAttempt(u._id);
    const r = await request(app).get(url(a._id)).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    assertKeyPresent(r.body);
  });

  test('expired-trial owner → 200, review WITHOUT the answer key, scores kept', async () => {
    const u = await createStudent({ extra: { createdAt: daysAgo(5) } });
    const a = await readingAttempt(u._id);
    const r = await request(app).get(url(a._id)).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    assertKeyWithheld(r.body);
    expect(r.body.attempt.bandScore).toBe(5);
    expect(r.body.attempt.correctCount).toBe(0);
    const q = r.body.attempt.passages[0].questionGroups[0].questions[0];
    expect(q.questionText).toBe('Q1');     // question itself kept
    expect(q.isCorrect).toBe(false);       // right/wrong flag kept
    expect(q.correctAnswer).toBeUndefined();
    expect(q.explanation).toBeUndefined();
  });

  test('expired premium (plan flips to free) → answer key withheld', async () => {
    const u = await createUser({ role: 'student', plan: 'premium', planExpiresAt: daysAgo(1), extra: { createdAt: daysAgo(30) } });
    const a = await readingAttempt(u._id);
    const r = await request(app).get(url(a._id)).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    assertKeyWithheld(r.body);
  });

  test('staff (teacher & admin) keep the full review', async () => {
    for (const u of [await createTeacher(), await createAdmin()]) {
      const a = await readingAttempt(u._id);
      const r = await request(app).get(url(a._id)).set('Authorization', bearer(u));
      expect(r.status).toBe(200);
      assertKeyPresent(r.body);
    }
  });

  test('non-owner student → 404, unchanged', async () => {
    const owner = await createStudent();
    const other = await createStudent();
    const a = await readingAttempt(owner._id);
    const r = await request(app).get(url(a._id)).set('Authorization', bearer(other));
    expect(r.status).toBe(404);
  });
});

// ──────────────────────────── LISTENING ────────────────────────────

describe('GET /api/listening/history/:attemptId — answer key gated by full access', () => {
  const url = (id) => `/api/listening/history/${id}`;

  test('premium owner → full review WITH correctAnswer + explanation', async () => {
    const u = await createPremiumStudent();
    const a = await listeningAttempt(u._id);
    const r = await request(app).get(url(a._id)).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    assertKeyPresent(r.body);
  });

  test('expired-trial owner → 200, no answer key, scores kept', async () => {
    const u = await createStudent({ extra: { createdAt: daysAgo(5) } });
    const a = await listeningAttempt(u._id);
    const r = await request(app).get(url(a._id)).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    assertKeyWithheld(r.body);
    expect(r.body.result.bandScore).toBe(5);
    expect(r.body.result.questions[0].isCorrect).toBe(false);
  });

  test('staff keep the full review', async () => {
    const u = await createAdmin();
    const a = await listeningAttempt(u._id);
    const r = await request(app).get(url(a._id)).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    assertKeyPresent(r.body);
  });

  test('non-owner student → 404, unchanged', async () => {
    const owner = await createStudent();
    const other = await createStudent();
    const a = await listeningAttempt(owner._id);
    const r = await request(app).get(url(a._id)).set('Authorization', bearer(other));
    expect(r.status).toBe(404);
  });
});
