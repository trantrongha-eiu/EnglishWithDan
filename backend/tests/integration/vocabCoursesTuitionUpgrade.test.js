// Integration tests covering one representative slice each of Vocab Book,
// Courses, Tuition, and Upgrade — ownership scoping and input validation.
const request = require('supertest');
const app = require('../../app');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const { createVocabBook, createCourse, createTuitionFee } = require('../factories/contentFactory');

describe('Vocab book — scoped to the owning user', () => {
  test('a student can create and fetch their own book', async () => {
    const user = await createStudent();
    const token = signTokenFor(user);
    const createRes = await request(app)
      .post('/api/vocabbook')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'IELTS Vocab' });
    expect(createRes.status).toBe(201);

    const getRes = await request(app)
      .get(`/api/vocabbook/${createRes.body.book._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.book.name).toBe('IELTS Vocab');
  });

  test("another student cannot fetch, update, or delete someone else's book (404, not leaked)", async () => {
    const owner = await createStudent();
    const intruder = await createStudent();
    const book = await createVocabBook({ userId: owner._id, name: "Owner's book" });
    const token = signTokenFor(intruder);

    const getRes = await request(app).get(`/api/vocabbook/${book._id}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);

    const putRes = await request(app)
      .put(`/api/vocabbook/${book._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Hijacked' });
    expect(putRes.status).toBe(404);

    const delRes = await request(app).delete(`/api/vocabbook/${book._id}`).set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(404);
  });
});

describe('Vocab book — free-plan 24h trial gating', () => {
  const DAY_MS = 24 * 60 * 60 * 1000;

  test('a free student whose account is 2 days old is blocked from opening/creating/practicing (list stays open)', async () => {
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * DAY_MS) } });
    const token = signTokenFor(user);
    const book = await createVocabBook({ userId: user._id, name: 'Old book' });

    // The list itself stays reachable — matches Reading/Listening still
    // showing their test list to a locked-out free user.
    const listRes = await request(app).get('/api/vocabbook').set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);

    const getRes = await request(app).get(`/api/vocabbook/${book._id}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(403);
    expect(getRes.body.code).toBe('PLAN_REQUIRED');

    const createRes = await request(app)
      .post('/api/vocabbook')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New book' });
    expect(createRes.status).toBe(403);

    const wordRes = await request(app)
      .post(`/api/vocabbook/${book._id}/words`)
      .set('Authorization', `Bearer ${token}`)
      .send({ word: 'apple', meaning: 'táo' });
    expect(wordRes.status).toBe(403);
  });

  test('a freshly-created free student (still inside the 24h trial) has full access', async () => {
    const user = await createStudent({ extra: { createdAt: new Date() } });
    const token = signTokenFor(user);
    const book = await createVocabBook({ userId: user._id, name: 'Fresh book' });

    const getRes = await request(app).get(`/api/vocabbook/${book._id}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);

    const createRes = await request(app)
      .post('/api/vocabbook')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Another book' });
    expect(createRes.status).toBe(201);
  });

  test('a premium student is never blocked, regardless of account age', async () => {
    const user = await createStudent({ extra: { plan: 'premium', createdAt: new Date(Date.now() - 30 * DAY_MS) } });
    const token = signTokenFor(user);
    const book = await createVocabBook({ userId: user._id, name: 'Premium book' });

    const getRes = await request(app).get(`/api/vocabbook/${book._id}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);
  });
});

describe('GET /api/courses', () => {
  test('is public and unauthenticated', async () => {
    await createCourse({ title: 'IELTS Foundation', isActive: true });
    await createCourse({ title: 'Hidden course', isActive: false });

    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.courses)).toBe(true);
    expect(res.body.courses.some(c => c.title === 'IELTS Foundation')).toBe(true);
    expect(res.body.courses.some(c => c.title === 'Hidden course')).toBe(false);
  });
});

describe('GET /api/tuition/my — scoped to the requesting student', () => {
  test("only returns the requesting student's own fees", async () => {
    const studentA = await createStudent();
    const studentB = await createStudent();
    await createTuitionFee({ studentId: studentA._id, month: 1, year: 2026, amount: 500000 });
    await createTuitionFee({ studentId: studentB._id, month: 1, year: 2026, amount: 999000 });

    const token = signTokenFor(studentA);
    const res = await request(app).get('/api/tuition/my').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.fees.length).toBe(1);
    expect(res.body.fees[0].amount).toBe(500000);
  });
});

describe('POST /api/upgrade/request — months validated against a server-side allow-list', () => {
  test('a valid package (1 month) is accepted', async () => {
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/upgrade/request')
      .set('Authorization', `Bearer ${token}`)
      .send({ months: 1, note: 'please' });
    expect(res.status).toBe(201);
    expect(res.body.request.months).toBe(1);
  });

  test('an invalid package (e.g. 2 months) is rejected with 400 regardless of client-sent value', async () => {
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/upgrade/request')
      .set('Authorization', `Bearer ${token}`)
      .send({ months: 2 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
