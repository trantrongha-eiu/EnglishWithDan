// Integration tests for GET /api/badges — thin HTTP wrapper around
// badgeService.getBadges (see tests/unit/services/badgeService.test.js for
// the actual earned/threshold logic). This file only proves the route is
// wired correctly: auth required, not premium-gated (badges are a read of
// the student's own history, same as the free streak/leaderboard widgets),
// and the response shape matches what the frontend badge grid expects.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createVocabBook } = require('../factories/contentFactory');

describe('GET /api/badges', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/badges');
    expect(res.status).toBe(401);
  });

  test('a free-plan student (not premium) still gets the full badge list', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/badges').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.totalCount).toBe(res.body.badges.length);
    expect(res.body.earnedCount).toBe(0);
    expect(res.body.badges[0]).toMatchObject({
      id: expect.any(String),
      category: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      icon: expect.any(String),
      earned: expect.any(Boolean),
      progress: { current: expect.any(Number), target: expect.any(Number) },
    });
  });

  test('a premium student sees the same badge list (no plan-based filtering)', async () => {
    const student = await createPremiumStudent();
    const res = await request(app).get('/api/badges').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(200);
    expect(res.body.totalCount).toBeGreaterThan(0);
  });

  test('earnedCount reflects badges actually crossed', async () => {
    const student = await createStudent();
    await createVocabBook({
      userId: student._id,
      words: Array.from({ length: 20 }, (_, i) => ({ word: `w${i}`, status: 'da-thuoc' })),
    });
    const res = await request(app).get('/api/badges').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.body.earnedCount).toBe(1);
    expect(res.body.badges.find(b => b.id === 'vocab_20').earned).toBe(true);
  });

  test("one student's progress never leaks into another student's badge list", async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    await createVocabBook({
      userId: studentA._id,
      words: Array.from({ length: 20 }, (_, i) => ({ word: `w${i}`, status: 'da-thuoc' })),
    });

    const resB = await request(app).get('/api/badges').set('Authorization', `Bearer ${signTokenFor(studentB)}`);
    expect(resB.body.badges.find(b => b.id === 'vocab_20').earned).toBe(false);
  });
});
