// Coverage for backend/routes/admin/vocabAnalytics.js — the "Vocab Student
// Analytics" dashboard: per-student VocabBook breakdown, the aggregated
// vocab-students list (VocabBook + VocabActivity joined by userId), admin
// streak reset/restore, and the per-user activity time series. These routes
// compute real aggregates (band counts, totals, sort order, date bucketing)
// so this seeds specific known data and asserts the computed numbers, not
// just response shape — an off-by-one or wrong $group key would otherwise
// hide silently.
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createVocabBook } = require('../factories/contentFactory');
const User = require('../../models/User');
const VocabActivity = require('../../models/VocabActivity');

function word(overrides = {}) {
  return { word: overrides.word || 'apple', meaning: 'quả táo', status: overrides.status || 'chua-thuoc' };
}

describe('GET /api/admin/vocab-books/:userId (teacherOnly)', () => {
  test('401 without a token', async () => {
    const res = await request(app).get(`/api/admin/vocab-books/${new mongoose.Types.ObjectId()}`);
    expect(res.status).toBe(401);
  });

  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get(`/api/admin/vocab-books/${student._id}`).set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('computes per-book word status counts correctly', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    await createVocabBook({
      userId: student._id, name: 'Book A', isDefault: true,
      words: [
        word({ status: 'da-thuoc' }), word({ status: 'da-thuoc' }),
        word({ status: 'nho-so-so' }),
        word({ status: 'chua-thuoc' }),
      ],
    });
    await createVocabBook({ userId: student._id, name: 'Book B', words: [] });

    const res = await request(app).get(`/api/admin/vocab-books/${student._id}`).set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.books).toHaveLength(2);
    const bookA = res.body.books.find(b => b.name === 'Book A');
    expect(bookA.totalWords).toBe(4);
    expect(bookA.daThucCount).toBe(2);
    expect(bookA.nhoSoSoCount).toBe(1);
    expect(bookA.chuaThuocCount).toBe(1);
    expect(bookA.isDefault).toBe(true);
    const bookB = res.body.books.find(b => b.name === 'Book B');
    expect(bookB.totalWords).toBe(0);
  });
});

describe('GET /api/admin/vocab-students (teacherOnly)', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/vocab-students');
    expect(res.status).toBe(401);
  });

  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/vocab-students').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('joins VocabBook + VocabActivity stats per student and includes students with no vocab data at all', async () => {
    const teacher = await createTeacher();
    const withData = await createStudent({ username: 'withdata', firstName: 'With', lastName: 'Data' });
    const noData = await createStudent({ username: 'nodata' });

    await createVocabBook({
      userId: withData._id,
      words: [word({ status: 'da-thuoc' }), word({ status: 'da-thuoc' }), word({ status: 'nho-so-so' })],
    });
    await VocabActivity.create({ userId: withData._id, date: new Date(Date.UTC(2026, 0, 5)), viewCount: 3, wordsAdded: 2, wordsStudied: 1 });
    await VocabActivity.create({ userId: withData._id, date: new Date(Date.UTC(2026, 0, 6)), viewCount: 0, wordsAdded: 0, wordsStudied: 0 });

    const res = await request(app).get('/api/admin/vocab-students').set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);

    const rowWithData = res.body.students.find(s => s.username === 'withdata');
    expect(rowWithData.totalBooks).toBe(1);
    expect(rowWithData.totalWords).toBe(3);
    expect(rowWithData.daThuoc).toBe(2);
    expect(rowWithData.nhoSoSo).toBe(1);
    expect(rowWithData.chuaThuoc).toBe(0);
    expect(rowWithData.totalViews).toBe(3);
    expect(rowWithData.totalAdded).toBe(2);
    expect(rowWithData.totalStudied).toBe(1);
    // activeDays counts only rows with viewCount > 0 — one of the two seeded rows has viewCount: 0.
    expect(rowWithData.activeDays).toBe(1);

    const rowNoData = res.body.students.find(s => s.username === 'nodata');
    expect(rowNoData.totalBooks).toBe(0);
    expect(rowNoData.totalWords).toBe(0);
    expect(rowNoData.totalViews).toBe(0);
  });

  test('?search= filters by username/email/firstName/lastName (case-insensitive)', async () => {
    const teacher = await createTeacher();
    await createStudent({ username: 'findable_zz', email: 'other@test.local' });
    await createStudent({ username: 'unrelated_user' });

    const res = await request(app)
      .get('/api/admin/vocab-students?search=FINDABLE')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.students).toHaveLength(1);
    expect(res.body.students[0].username).toBe('findable_zz');
  });

  test('sort=words-desc orders students by totalWords descending', async () => {
    const teacher = await createTeacher();
    const low = await createStudent({ username: 'low_words' });
    const high = await createStudent({ username: 'high_words' });
    await createVocabBook({ userId: low._id, words: [word()] });
    await createVocabBook({ userId: high._id, words: [word(), word(), word()] });

    const res = await request(app)
      .get('/api/admin/vocab-students?sort=words-desc')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    const names = res.body.students.map(s => s.username);
    expect(names.indexOf('high_words')).toBeLessThan(names.indexOf('low_words'));
  });

  test('sort=name orders by display name (firstName+lastName, falling back to username), Vietnamese-aware', async () => {
    const teacher = await createTeacher();
    await createStudent({ username: 'zzz_user', firstName: 'An', lastName: 'Nguyen' });
    await createStudent({ username: 'aaa_user', firstName: 'Binh', lastName: 'Tran' });

    const res = await request(app)
      .get('/api/admin/vocab-students?sort=name')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    const names = res.body.students.map(s => s.username);
    // "An Nguyen" < "Binh Tran" alphabetically, regardless of username.
    expect(names.indexOf('zzz_user')).toBeLessThan(names.indexOf('aaa_user'));
  });

  test('pagination (page + limit) slices the sorted result and reports totalPages', async () => {
    const teacher = await createTeacher();
    for (let i = 0; i < 5; i++) await createStudent({ username: `page_student_${i}` });

    const res = await request(app)
      .get('/api/admin/vocab-students?page=2&limit=2')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(5);
    expect(res.body.page).toBe(2);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.students).toHaveLength(2);
  });

  test('omitting page/limit returns the full unpaginated list (opt-in pagination)', async () => {
    const teacher = await createTeacher();
    for (let i = 0; i < 3; i++) await createStudent({ username: `full_list_${i}` });

    const res = await request(app).get('/api/admin/vocab-students').set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBeUndefined();
    expect(res.body.students.length).toBeGreaterThanOrEqual(3);
  });
});

describe('POST /api/admin/vocab-students/:userId/reset-streak (teacherOnly)', () => {
  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post(`/api/admin/vocab-students/${student._id}/reset-streak`)
      .set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('404 when the student does not exist', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post(`/api/admin/vocab-students/${new mongoose.Types.ObjectId()}/reset-streak`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(404);
  });

  test('zeroes an active streak and snapshots it into previousStreak', async () => {
    const teacher = await createTeacher();
    const student = await createStudent({ extra: { learningStreak: 12 } });

    const res = await request(app)
      .post(`/api/admin/vocab-students/${student._id}/reset-streak`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.learningStreak).toBe(0);
    expect(res.body.previousStreak).toBe(12);

    const saved = await User.findById(student._id);
    expect(saved.learningStreak).toBe(0);
    expect(saved.previousStreak).toBe(12);
    expect(saved.streakLostAt).toBeTruthy();
  });

  test('a streak already at 0 is a no-op (previousStreak stays 0)', async () => {
    const teacher = await createTeacher();
    const student = await createStudent({ extra: { learningStreak: 0 } });

    const res = await request(app)
      .post(`/api/admin/vocab-students/${student._id}/reset-streak`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.previousStreak).toBe(0);
  });
});

describe('POST /api/admin/vocab-students/:userId/restore-streak (teacherOnly)', () => {
  test('404 when the student does not exist', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post(`/api/admin/vocab-students/${new mongoose.Types.ObjectId()}/restore-streak`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(404);
  });

  test('400 when there is no previousStreak to restore', async () => {
    const teacher = await createTeacher();
    const student = await createStudent({ extra: { previousStreak: 0 } });
    const res = await request(app)
      .post(`/api/admin/vocab-students/${student._id}/restore-streak`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(400);
  });

  test('restores learningStreak from previousStreak and clears the snapshot', async () => {
    const teacher = await createTeacher();
    const student = await createStudent({ extra: { learningStreak: 0, previousStreak: 9, streakLostAt: new Date() } });

    const res = await request(app)
      .post(`/api/admin/vocab-students/${student._id}/restore-streak`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.learningStreak).toBe(9);

    const saved = await User.findById(student._id);
    expect(saved.learningStreak).toBe(9);
    expect(saved.previousStreak).toBe(0);
    expect(saved.streakLostAt).toBeNull();
  });
});

describe('GET /api/admin/vocab-activity/:userId (teacherOnly)', () => {
  test('401 without a token', async () => {
    const res = await request(app).get(`/api/admin/vocab-activity/${new mongoose.Types.ObjectId()}`);
    expect(res.status).toBe(401);
  });

  test('view=day buckets by day-of-month for the given year/month, filling unactivated days with zeros', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    // February 2026 (28 days) — one activity on day 3, one on day 15.
    await VocabActivity.create({ userId: student._id, date: new Date(Date.UTC(2026, 1, 3)), viewCount: 4, wordsAdded: 1, wordsStudied: 2 });
    await VocabActivity.create({ userId: student._id, date: new Date(Date.UTC(2026, 1, 15)), viewCount: 1, wordsAdded: 0, wordsStudied: 0 });
    // Different month — must NOT be included.
    await VocabActivity.create({ userId: student._id, date: new Date(Date.UTC(2026, 2, 3)), viewCount: 99, wordsAdded: 0, wordsStudied: 0 });

    const res = await request(app)
      .get(`/api/admin/vocab-activity/${student._id}?view=day&year=2026&month=2`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.view).toBe('day');
    expect(res.body.data).toHaveLength(28); // Feb 2026 is not a leap year
    expect(res.body.data[2]).toMatchObject({ label: '3', viewCount: 4, wordsAdded: 1, wordsStudied: 2 });
    expect(res.body.data[14]).toMatchObject({ label: '15', viewCount: 1 });
    expect(res.body.data[0]).toMatchObject({ label: '1', viewCount: 0 });
  });

  test('view=month buckets by month across the given year', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    await VocabActivity.create({ userId: student._id, date: new Date(Date.UTC(2026, 0, 10)), viewCount: 5, wordsAdded: 0, wordsStudied: 0 });
    await VocabActivity.create({ userId: student._id, date: new Date(Date.UTC(2026, 5, 20)), viewCount: 7, wordsAdded: 0, wordsStudied: 0 });

    const res = await request(app)
      .get(`/api/admin/vocab-activity/${student._id}?view=month&year=2026`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(12);
    expect(res.body.data[0]).toMatchObject({ label: 'T1', viewCount: 5 });
    expect(res.body.data[5]).toMatchObject({ label: 'T6', viewCount: 7 });
    expect(res.body.data[1]).toMatchObject({ label: 'T2', viewCount: 0 });
  });

  test('view=year aggregates all data by calendar year (no filling of missing years)', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    await VocabActivity.create({ userId: student._id, date: new Date(Date.UTC(2024, 0, 1)), viewCount: 2, wordsAdded: 0, wordsStudied: 0 });
    await VocabActivity.create({ userId: student._id, date: new Date(Date.UTC(2026, 0, 1)), viewCount: 3, wordsAdded: 0, wordsStudied: 0 });

    const res = await request(app)
      .get(`/api/admin/vocab-activity/${student._id}?view=year`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([
      { label: '2024', viewCount: 2, wordsAdded: 0, wordsStudied: 0 },
      { label: '2026', viewCount: 3, wordsAdded: 0, wordsStudied: 0 },
    ]);
  });

  test('an invalid userId (not a valid ObjectId) hits the catch block and returns 500', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .get('/api/admin/vocab-activity/not-a-valid-object-id')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(500);
  });
});
