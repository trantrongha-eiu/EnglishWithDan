// Integration tests for the Vocabulary Lessons feature's HTTP surface —
// covers what the unit tests on the service layer can't: auth gating,
// the teacherOnly middleware (including the "teacher can't DELETE" rule
// shared with routes/vocab.js), and the route-ordering fix that keeps
// "/admin/import-history" from being swallowed by "/admin/:id".
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');

const GOOD_LESSON = `@lesson
title=Week 12 - Environment
difficulty=B1
order=12

@word
word=sustainable
meaning=bền vững
example=Solar energy is a sustainable source of power.
definition=Able to continue without harming the environment.
distractors=renewable|temporary|harmful
`;

describe('Auth gating', () => {
  test('every route requires a valid token', async () => {
    expect((await request(app).get('/api/vocabulary-lessons')).status).toBe(401);
    expect((await request(app).get('/api/vocabulary-lessons/admin')).status).toBe(401);
    expect((await request(app).post('/api/vocabulary-lessons/admin/import').send({ text: GOOD_LESSON })).status).toBe(401);
  });
});

describe('teacherOnly gate', () => {
  test('a student is rejected (403) from every /admin route', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);

    expect((await request(app).get('/api/vocabulary-lessons/admin').set('Authorization', `Bearer ${token}`)).status).toBe(403);
    expect((await request(app).post('/api/vocabulary-lessons/admin/import').set('Authorization', `Bearer ${token}`).send({ text: GOOD_LESSON })).status).toBe(403);
  });

  test('a teacher can create/edit but gets 403 attempting to delete (mirrors routes/vocab.js)', async () => {
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);

    const createRes = await request(app)
      .post('/api/vocabulary-lessons/admin/import')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: GOOD_LESSON });
    expect(createRes.status).toBe(201);

    const delRes = await request(app)
      .delete(`/api/vocabulary-lessons/admin/${createRes.body.lesson._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(403);
  });

  test('an admin can delete', async () => {
    const teacher = await createTeacher();
    const admin = await createAdmin();
    const createRes = await request(app)
      .post('/api/vocabulary-lessons/admin/import')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ text: GOOD_LESSON });

    const delRes = await request(app)
      .delete(`/api/vocabulary-lessons/admin/${createRes.body.lesson._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(delRes.status).toBe(200);
  });
});

describe('route ordering — /admin/import-history vs /admin/:id', () => {
  test('GET /admin/import-history hits the history list, not getAdminLesson with id="import-history"', async () => {
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);
    await request(app).post('/api/vocabulary-lessons/admin/import').set('Authorization', `Bearer ${token}`).send({ text: GOOD_LESSON });

    const res = await request(app).get('/api/vocabulary-lessons/admin/import-history').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.history)).toBe(true);
  });
});

describe('Import → validate error surface (400 with per-word messages)', () => {
  test('invalid lesson text returns 400 with the parser\'s error list', async () => {
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);
    const badText = `@lesson\ntitle=Broken\n\n@word\nword=oops\nmeaning=x\n`;

    const res = await request(app)
      .post('/api/vocabulary-lessons/admin/import')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: badText });

    expect(res.status).toBe(400);
    expect(res.body.errors.some(e => e.includes('Missing example'))).toBe(true);
  });

  test('POST /admin/parse never persists anything, even for invalid text', async () => {
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);
    const badText = `@lesson\ntitle=Broken\n\n@word\nword=oops\nmeaning=x\n`;

    const res = await request(app)
      .post('/api/vocabulary-lessons/admin/parse')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: badText });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(false);

    const listRes = await request(app).get('/api/vocabulary-lessons/admin').set('Authorization', `Bearer ${token}`);
    expect(listRes.body.lessons).toHaveLength(0);
  });
});

describe('Full happy path: import → publish → student reads → submits attempt', () => {
  test('end to end', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const teacherToken = signTokenFor(teacher);
    const studentToken = signTokenFor(student);

    // Unpublished lesson is invisible to the student.
    const importRes = await request(app)
      .post('/api/vocabulary-lessons/admin/import')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ text: GOOD_LESSON });
    expect(importRes.status).toBe(201);
    const lessonId = importRes.body.lesson._id;

    const hiddenListRes = await request(app).get('/api/vocabulary-lessons').set('Authorization', `Bearer ${studentToken}`);
    expect(hiddenListRes.body.lessons).toHaveLength(0);
    const hiddenGetRes = await request(app).get(`/api/vocabulary-lessons/${lessonId}`).set('Authorization', `Bearer ${studentToken}`);
    expect(hiddenGetRes.status).toBe(404);

    // Publish.
    const pubRes = await request(app)
      .patch(`/api/vocabulary-lessons/admin/${lessonId}/publish`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ published: true });
    expect(pubRes.status).toBe(200);

    // Now visible.
    const listRes = await request(app).get('/api/vocabulary-lessons').set('Authorization', `Bearer ${studentToken}`);
    expect(listRes.body.lessons.some(l => l._id === lessonId)).toBe(true);
    const getRes = await request(app).get(`/api/vocabulary-lessons/${lessonId}`).set('Authorization', `Bearer ${studentToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.lesson.words).toHaveLength(1);

    // No attempt yet.
    const noAttemptRes = await request(app).get(`/api/vocabulary-lessons/${lessonId}/attempt`).set('Authorization', `Bearer ${studentToken}`);
    expect(noAttemptRes.body.attempt).toBeNull();

    // Submit a result.
    const submitRes = await request(app)
      .post(`/api/vocabulary-lessons/${lessonId}/attempt`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ correctCount: 1, totalCount: 1, timeSpent: 15 });
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.attempt.score).toBe(100);
    expect(submitRes.body.attempt.bestScore).toBe(100);
    expect(submitRes.body.attempt.attemptCount).toBe(1);

    // Admin list now shows 1 completed.
    const adminListRes = await request(app).get('/api/vocabulary-lessons/admin').set('Authorization', `Bearer ${teacherToken}`);
    const row = adminListRes.body.lessons.find(l => l._id === lessonId);
    expect(row.completedCount).toBe(1);
  });

  test('submitAttempt on a lesson the student cannot see (unpublished) is rejected', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const importRes = await request(app)
      .post('/api/vocabulary-lessons/admin/import')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ text: GOOD_LESSON });

    const res = await request(app)
      .post(`/api/vocabulary-lessons/${importRes.body.lesson._id}/attempt`)
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ correctCount: 1, totalCount: 1, timeSpent: 5 });
    expect(res.status).toBe(404);
  });
});

describe('Analytics endpoints', () => {
  async function setUpPublishedLesson() {
    const teacher = await createTeacher();
    const student = await createStudent();
    const teacherToken = signTokenFor(teacher);
    const studentToken = signTokenFor(student);
    const importRes = await request(app)
      .post('/api/vocabulary-lessons/admin/import')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ text: GOOD_LESSON });
    const lessonId = importRes.body.lesson._id;
    await request(app).patch(`/api/vocabulary-lessons/admin/${lessonId}/publish`).set('Authorization', `Bearer ${teacherToken}`).send({ published: true });
    return { teacher, student, teacherToken, studentToken, lessonId };
  }

  test('student cannot reach any /admin/:id/... analytics route (403)', async () => {
    const { student, studentToken, lessonId } = await setUpPublishedLesson();
    expect((await request(app).get(`/api/vocabulary-lessons/admin/${lessonId}/students`).set('Authorization', `Bearer ${studentToken}`)).status).toBe(403);
    expect((await request(app).get(`/api/vocabulary-lessons/admin/${lessonId}/students/${student._id}/history`).set('Authorization', `Bearer ${studentToken}`)).status).toBe(403);
    expect((await request(app).get(`/api/vocabulary-lessons/admin/${lessonId}/missed-words`).set('Authorization', `Bearer ${studentToken}`)).status).toBe(403);
    expect((await request(app).get(`/api/vocabulary-lessons/admin/${lessonId}/export.csv`).set('Authorization', `Bearer ${studentToken}`)).status).toBe(403);
  });

  test('GET /:id/attempt/history returns the student\'s own submissions, newest first', async () => {
    const { studentToken, lessonId } = await setUpPublishedLesson();
    await request(app).post(`/api/vocabulary-lessons/${lessonId}/attempt`).set('Authorization', `Bearer ${studentToken}`).send({ correctCount: 0, totalCount: 1, timeSpent: 5, wrongWords: ['sustainable'] });
    await request(app).post(`/api/vocabulary-lessons/${lessonId}/attempt`).set('Authorization', `Bearer ${studentToken}`).send({ correctCount: 1, totalCount: 1, timeSpent: 3 });

    const res = await request(app).get(`/api/vocabulary-lessons/${lessonId}/attempt/history`).set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.history).toHaveLength(2);
    expect(res.body.history[0].score).toBe(100);
    expect(res.body.history[0].wrongWords).toBeUndefined();
  });

  test('GET /admin/:id/students returns the class breakdown', async () => {
    const { teacherToken, studentToken, student, lessonId } = await setUpPublishedLesson();
    await request(app).post(`/api/vocabulary-lessons/${lessonId}/attempt`).set('Authorization', `Bearer ${studentToken}`).send({ correctCount: 1, totalCount: 1, timeSpent: 5 });

    const res = await request(app).get(`/api/vocabulary-lessons/admin/${lessonId}/students`).set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.students).toHaveLength(1);
    expect(res.body.students[0].userId).toBe(String(student._id));
    expect(res.body.students[0].bestScore).toBe(100);
  });

  test('GET /admin/:id/students/:userId/history — same shape as the student\'s own history route', async () => {
    const { teacherToken, studentToken, student, lessonId } = await setUpPublishedLesson();
    await request(app).post(`/api/vocabulary-lessons/${lessonId}/attempt`).set('Authorization', `Bearer ${studentToken}`).send({ correctCount: 1, totalCount: 1, timeSpent: 5 });

    const res = await request(app).get(`/api/vocabulary-lessons/admin/${lessonId}/students/${student._id}/history`).set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.history).toHaveLength(1);
    expect(res.body.history[0].score).toBe(100);
  });

  test('GET /admin/:id/missed-words aggregates wrongWords across the class', async () => {
    const { teacherToken, studentToken, lessonId } = await setUpPublishedLesson();
    await request(app).post(`/api/vocabulary-lessons/${lessonId}/attempt`).set('Authorization', `Bearer ${studentToken}`).send({ correctCount: 0, totalCount: 1, timeSpent: 5, wrongWords: ['sustainable'] });

    const res = await request(app).get(`/api/vocabulary-lessons/admin/${lessonId}/missed-words`).set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.words).toEqual([{ word: 'sustainable', count: 1 }]);
  });

  test('GET /admin/:id/export.csv returns a CSV attachment, not JSON', async () => {
    const { teacherToken, studentToken, lessonId } = await setUpPublishedLesson();
    await request(app).post(`/api/vocabulary-lessons/${lessonId}/attempt`).set('Authorization', `Bearer ${studentToken}`).send({ correctCount: 1, totalCount: 1, timeSpent: 5 });

    const res = await request(app).get(`/api/vocabulary-lessons/admin/${lessonId}/export.csv`).set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
    expect(res.text).toContain('Student');
  });

  test('all analytics routes 404 for a nonexistent lesson id, not a raw CastError 500', async () => {
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);
    const fakeId = '000000000000000000000000';
    expect((await request(app).get(`/api/vocabulary-lessons/admin/${fakeId}/students`).set('Authorization', `Bearer ${token}`)).status).toBe(404);
    expect((await request(app).get(`/api/vocabulary-lessons/admin/${fakeId}/missed-words`).set('Authorization', `Bearer ${token}`)).status).toBe(404);
    expect((await request(app).get(`/api/vocabulary-lessons/admin/${fakeId}/export.csv`).set('Authorization', `Bearer ${token}`)).status).toBe(404);
  });
});

describe('GET /leaderboard', () => {
  test('requires auth, and is not swallowed by "/:id" (route-ordering)', async () => {
    expect((await request(app).get('/api/vocabulary-lessons/leaderboard')).status).toBe(401);

    const student = await createStudent();
    const res = await request(app).get('/api/vocabulary-lessons/leaderboard').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.leaderboard)).toBe(true);
  });

  test('reflects a real qualifying submission', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const teacherToken = signTokenFor(teacher);
    const studentToken = signTokenFor(student);

    const importRes = await request(app).post('/api/vocabulary-lessons/admin/import').set('Authorization', `Bearer ${teacherToken}`).send({ text: GOOD_LESSON });
    const lessonId = importRes.body.lesson._id;
    await request(app).patch(`/api/vocabulary-lessons/admin/${lessonId}/publish`).set('Authorization', `Bearer ${teacherToken}`).send({ published: true });
    await request(app).post(`/api/vocabulary-lessons/${lessonId}/attempt`).set('Authorization', `Bearer ${studentToken}`).send({ correctCount: 5, totalCount: 5, timeSpent: 12 });

    const res = await request(app).get('/api/vocabulary-lessons/leaderboard').set('Authorization', `Bearer ${studentToken}`);
    expect(res.body.leaderboard.some(r => r.userId === String(student._id) && r.score === 100)).toBe(true);
  });
});
