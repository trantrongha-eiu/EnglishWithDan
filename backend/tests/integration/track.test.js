// Integration tests for the site-visit beacon (POST /api/track/visit,
// public/unauthenticated) and the admin traffic chart it feeds
// (GET /api/admin/stats/visits, teacherOnly).
const request = require('supertest');
const app = require('../../app');
const PageVisit = require('../../models/PageVisit');
const { getVNDay } = require('../../utils/streak');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');

describe('POST /api/track/visit', () => {
  test('is public (no auth needed) and returns 204', async () => {
    const res = await request(app).post('/api/track/visit');
    expect(res.status).toBe(204);
  });

  test('increments today\'s PageVisit count, creating the doc on first ping', async () => {
    await request(app).post('/api/track/visit');
    const doc = await PageVisit.findOne({ date: getVNDay(new Date()) });
    expect(doc).not.toBeNull();
    expect(doc.count).toBeGreaterThanOrEqual(1);
  });

  test('a second ping the same day increments rather than duplicating the doc', async () => {
    await request(app).post('/api/track/visit');
    await request(app).post('/api/track/visit');
    const docs = await PageVisit.find({ date: getVNDay(new Date()) });
    expect(docs).toHaveLength(1);
    expect(docs[0].count).toBeGreaterThanOrEqual(2);
  });
});

describe('GET /api/admin/stats/visits', () => {
  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const res = await request(app).get('/api/admin/stats/visits').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('a teacher gets a per-day series with zero-filled gaps', async () => {
    const today = getVNDay(new Date());
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    await PageVisit.create({ date: today, count: 7 });
    await PageVisit.create({ date: twoDaysAgo, count: 3 });
    // yesterday deliberately left with no PageVisit doc — must come back as 0

    const teacher = await createTeacher();
    const token = signTokenFor(teacher);
    const res = await request(app)
      .get('/api/admin/stats/visits?days=3')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.visits).toHaveLength(3);
    expect(res.body.visits[0].count).toBe(3);  // two days ago
    expect(res.body.visits[1].count).toBe(0);  // yesterday — no data
    expect(res.body.visits[2].count).toBe(7);  // today
    expect(res.body.visits[2].date).toBe(today.toISOString().slice(0, 10));
  });

  test('clamps an out-of-range `days` query to the [1, 90] window', async () => {
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);
    const res = await request(app)
      .get('/api/admin/stats/visits?days=9999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.visits).toHaveLength(90);
  });
});
