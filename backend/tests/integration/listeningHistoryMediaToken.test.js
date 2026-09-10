'use strict';

// P2 regression fix — the listening history/review endpoints are auth-only
// (no requirePremium, by product design: you can always look back at your
// own results). But they must NOT mint a fresh media token for a user who
// no longer has full access, or a lapsed premium/trial could keep re-
// arming 1h audio tokens for tests/sections they once completed.
//
//   GET /api/listening/history/:attemptId          (full test review)
//   GET /api/listening/practice/history/:attemptId  (practice review)
//
// Rule: canMint = hasFullAccess(req.user), enforced server-side in the
// controller (utils/plan.js — the single source of truth). No requirePremium
// gate is added, so the rest of the review stays visible.
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const ListeningAttempt = require('../../models/ListeningAttempt');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');
const {
  createStudent, createPremiumStudent, createTeacher, createAdmin, signTokenFor,
} = require('../factories/userFactory');
const { createListeningSection } = require('../factories/contentFactory');

const CLOUD_AUDIO = 'https://res.cloudinary.com/demo/video/upload/v1/listening/sample.mp3';
const PROXY_PREFIX = '/api/media/listening?token=';
const bearer = (u) => `Bearer ${signTokenFor(u)}`;
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const SNAPSHOT = [{
  partNumber: 1,
  questionGroups: [{ groupType: 'plain', questions: [{ questionNumber: 1, type: 'sentence-completion', questionText: 'Q1' }] }],
}];

function fullTestAttempt(userId) {
  return ListeningAttempt.create({
    userId, testId: new mongoose.Types.ObjectId(), testName: 'LT 1', status: 'completed',
    answers: [{ questionNumber: 1, userAnswer: 'a', correctAnswer: 'b', isCorrect: false }],
    correctCount: 0, wrongCount: 1, skippedCount: 0, totalQuestions: 1, bandScore: 5,
    submittedAt: new Date(),
    sectionsSnapshot: SNAPSHOT,
    audioUrlSnapshot: CLOUD_AUDIO,
  });
}
async function practiceAttempt(userId) {
  const section = await createListeningSection({ extra: { audioUrl: CLOUD_AUDIO } });
  const attempt = await ListeningPracticeAttempt.create({
    userId, sectionId: section._id, sectionTitle: 'S', partNumber: 1,
    answers: [{ questionNumber: 1, userAnswer: 'a', correctAnswer: 'b', isCorrect: false }],
    totalQuestions: 1, correctCount: 0, wrongCount: 1, submittedAt: new Date(),
  });
  return attempt;
}

const hasProxyToken = (s) => typeof s === 'string' && s.includes(PROXY_PREFIX);

// ───────────────────── GET /api/listening/history/:attemptId ─────────────────────

describe('full-test history review — media token issuance vs. plan', () => {
  test('1. premium owner → audio proxied with a fresh token', async () => {
    const u = await createPremiumStudent();
    const a = await fullTestAttempt(u._id);
    const r = await request(app).get(`/api/listening/history/${a._id}`).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    expect(hasProxyToken(r.body.result.audioUrl)).toBe(true);
    expect(JSON.stringify(r.body)).not.toContain('res.cloudinary.com');
  });

  test('2. active-trial owner (fresh account) → audio proxied with a fresh token', async () => {
    const u = await createStudent(); // createdAt = now → inside 24h trial
    const a = await fullTestAttempt(u._id);
    const r = await request(app).get(`/api/listening/history/${a._id}`).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    expect(hasProxyToken(r.body.result.audioUrl)).toBe(true);
  });

  test('3. free / expired-trial owner → 200, review visible, but NO token and NO cloudinary URL', async () => {
    const u = await createStudent({ extra: { createdAt: daysAgo(3) } });
    const a = await fullTestAttempt(u._id);
    const r = await request(app).get(`/api/listening/history/${a._id}`).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    expect(r.body.result.audioUrl).toBe('');
    expect(JSON.stringify(r.body)).not.toContain('/api/media/listening?token=');
    expect(JSON.stringify(r.body)).not.toContain('res.cloudinary.com');
    // non-audio history data is still there
    expect(r.body.result.bandScore).toBe(5);
    expect(r.body.result.questions.length).toBe(1);
  });

  test('4. expired premium (plan flips to free) → NO token', async () => {
    const u = await createStudent({
      plan: 'premium', planExpiresAt: daysAgo(1),
      extra: { createdAt: daysAgo(30) },
    });
    const a = await fullTestAttempt(u._id);
    const r = await request(app).get(`/api/listening/history/${a._id}`).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    expect(r.body.result.audioUrl).toBe('');
  });

  test('6. staff keep their bypass — teacher & admin get a token', async () => {
    for (const u of [await createTeacher(), await createAdmin()]) {
      const a = await fullTestAttempt(u._id);
      const r = await request(app).get(`/api/listening/history/${a._id}`).set('Authorization', bearer(u));
      expect(r.status).toBe(200);
      expect(hasProxyToken(r.body.result.audioUrl)).toBe(true);
    }
  });

  test('7. non-owner (plain student) → 404, unchanged', async () => {
    const owner = await createStudent();
    const other = await createStudent();
    const a = await fullTestAttempt(owner._id);
    const r = await request(app).get(`/api/listening/history/${a._id}`).set('Authorization', bearer(other));
    expect(r.status).toBe(404);
  });

  test('8 + 10. a lapsed user cannot conjure a token by faking plan on the request', async () => {
    const u = await createStudent({ extra: { createdAt: daysAgo(3) } });
    const a = await fullTestAttempt(u._id);
    const r = await request(app)
      .get(`/api/listening/history/${a._id}?plan=premium`)
      .set('Authorization', bearer(u))
      .set('X-Plan', 'premium')
      .set('X-User-Role', 'admin');
    expect(r.status).toBe(200);
    expect(r.body.result.audioUrl).toBe(''); // server used req.user from the DB, not the request
  });
});

// ─────────────────── GET /api/listening/practice/history/:attemptId ───────────────────

describe('practice history review — same rule on the sibling endpoint', () => {
  test('premium owner → section audio proxied with a token', async () => {
    const u = await createPremiumStudent();
    const a = await practiceAttempt(u._id);
    const r = await request(app).get(`/api/listening/practice/history/${a._id}`).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    expect(hasProxyToken(r.body.section.audioUrl)).toBe(true);
  });

  test('expired-trial owner → 200, no token, no cloudinary URL', async () => {
    const u = await createStudent({ extra: { createdAt: daysAgo(3) } });
    const a = await practiceAttempt(u._id);
    const r = await request(app).get(`/api/listening/practice/history/${a._id}`).set('Authorization', bearer(u));
    expect(r.status).toBe(200);
    expect(r.body.section.audioUrl).toBe('');
    expect(JSON.stringify(r.body)).not.toContain('res.cloudinary.com');
    expect(JSON.stringify(r.body)).not.toContain('/api/media/listening?token=');
  });
});

// ───────────────────────────── the token itself is unchanged ─────────────────────────────

describe('P1 not reintroduced — a minted token still has all its protections', () => {
  test('token from a premium history review resolves to a sealed, host-locked proxy URL (not the raw cloudinary URL)', async () => {
    const u = await createPremiumStudent();
    const a = await fullTestAttempt(u._id);
    const r = await request(app).get(`/api/listening/history/${a._id}`).set('Authorization', bearer(u));

    const url = r.body.result.audioUrl;
    expect(url.startsWith('http')).toBe(true);
    expect(url).toContain('/api/media/listening?token=');
    const token = decodeURIComponent(url.split('token=')[1]);
    // opaque — the origin URL is sealed, not in the clear
    expect(token).not.toContain('cloudinary');
    expect(token).not.toContain('listening/sample');
  });
});
