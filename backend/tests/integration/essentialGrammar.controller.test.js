// Integration tests for controllers/essentialGrammar.controller.js
// (routes/essentialGrammar.js): the teacherOnly admin CRUD/analytics
// surface (mirrors vocabularyLesson.test.js/vocab.controller.test.js —
// same middleware, same "teacher can't DELETE" rule), student
// attempt/history flow, and ownership scoping.
//
// FIXED 2026-09-10: GET /api/essential-grammar/lessons now requires `auth`
// (no premium gate — it stays "free" for any logged-in user, including an
// expired-trial free account). Previously it had no middleware at all and
// listLessons() returns full lesson docs including `blocks` (quiz
// questions + correct answerIndex + explanations, graded client-side), so
// the whole question bank was scrapable by anyone with `curl`. The tests
// below now assert 401-without-token and 200-with-any-token.
//
// SPLIT 2026-09-10: GET /lessons returns metadata only (no `blocks`); a
// lesson's blocks — which carry the client-graded quiz/practice answer
// keys — are fetched one at a time via GET /lessons/:id. Both share a
// per-account read limiter so a logged-in scraper can't pull the whole
// bank in one request.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createEssentialGrammarLesson } = require('../factories/contentFactory');

describe('GET /api/essential-grammar/lessons — auth-gated metadata list (no premium gate, no blocks)', () => {
  test('rejects an unauthenticated request (401) — question bank is no longer publicly scrapable', async () => {
    await createEssentialGrammarLesson({ title: 'Present Simple' });
    const res = await request(app).get('/api/essential-grammar/lessons');
    expect(res.status).toBe(401);
  });

  test('a plain free-plan student (expired trial, no premium) gets the list — metadata only, NO blocks', async () => {
    await createEssentialGrammarLesson({ title: 'Present Simple' });
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) } });
    const res = await request(app)
      .get('/api/essential-grammar/lessons')
      .set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.lessons).toHaveLength(1);
    expect(res.body.lessons[0].title).toBe('Present Simple');
    // The answer-carrying content must not be in the list payload anymore.
    expect(res.body.lessons[0].blocks).toBeUndefined();
  });
});

describe('GET /api/essential-grammar/lessons/:id — auth-gated lesson detail (blocks included)', () => {
  test('rejects an unauthenticated request (401)', async () => {
    const lesson = await createEssentialGrammarLesson();
    const res = await request(app).get(`/api/essential-grammar/lessons/${lesson._id}`);
    expect(res.status).toBe(401);
  });

  test('a plain free-plan student gets one lesson WITH its blocks (incl. quiz answerIndex)', async () => {
    const lesson = await createEssentialGrammarLesson({ title: 'Present Simple' });
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) } });
    const res = await request(app)
      .get(`/api/essential-grammar/lessons/${lesson._id}`)
      .set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(200);
    expect(res.body.lesson._id).toBe(String(lesson._id));
    const quizBlock = res.body.lesson.blocks.find(b => b.type === 'quiz');
    expect(quizBlock.data.questions[0].answerIndex).toBeDefined();
  });

  test('404 for a nonexistent id, and for an inactive lesson', async () => {
    const user = await createStudent();
    const token = `Bearer ${signTokenFor(user)}`;
    expect((await request(app).get('/api/essential-grammar/lessons/000000000000000000000000').set('Authorization', token)).status).toBe(404);
    const hidden = await createEssentialGrammarLesson({ isActive: false });
    expect((await request(app).get(`/api/essential-grammar/lessons/${hidden._id}`).set('Authorization', token)).status).toBe(404);
  });
});

describe('Student progress: GET/POST /:id/attempt (auth required, no premium gate on this route today)', () => {
  test('requires authentication (401)', async () => {
    const lesson = await createEssentialGrammarLesson();
    expect((await request(app).get(`/api/essential-grammar/${lesson._id}/attempt`)).status).toBe(401);
    expect((await request(app).post(`/api/essential-grammar/${lesson._id}/attempt`).send({ totalCount: 1 })).status).toBe(401);
  });

  test('a plain free-plan student (no premium) can submit and read an attempt', async () => {
    const lesson = await createEssentialGrammarLesson();
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);

    const noAttempt = await request(app).get(`/api/essential-grammar/${lesson._id}/attempt`).set('Authorization', `Bearer ${token}`);
    expect(noAttempt.body.attempt).toBeNull();

    const submitRes = await request(app)
      .post(`/api/essential-grammar/${lesson._id}/attempt`)
      .set('Authorization', `Bearer ${token}`)
      .send({ correctCount: 1, totalCount: 2, timeSpent: 10, wrongQuestions: ['q2'] });
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.attempt.score).toBe(50);
    expect(submitRes.body.attempt.bestScore).toBe(50);
  });

  test('returns 404 for a nonexistent lesson', async () => {
    const user = await createStudent();
    const res = await request(app)
      .get('/api/essential-grammar/000000000000000000000000/attempt')
      .set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(404);
  });

  test('submitAttempt rejects a missing/invalid totalCount (400)', async () => {
    const lesson = await createEssentialGrammarLesson();
    const user = await createStudent();
    const res = await request(app)
      .post(`/api/essential-grammar/${lesson._id}/attempt`)
      .set('Authorization', `Bearer ${signTokenFor(user)}`)
      .send({ correctCount: 1 });
    expect(res.status).toBe(400);
  });

  test('GET /:id/attempt/history only returns the requesting student\'s own submissions', async () => {
    const lesson = await createEssentialGrammarLesson();
    const studentA = await createStudent();
    const studentB = await createStudent();

    await request(app).post(`/api/essential-grammar/${lesson._id}/attempt`).set('Authorization', `Bearer ${signTokenFor(studentA)}`)
      .send({ correctCount: 2, totalCount: 2, timeSpent: 5 });
    await request(app).post(`/api/essential-grammar/${lesson._id}/attempt`).set('Authorization', `Bearer ${signTokenFor(studentB)}`)
      .send({ correctCount: 0, totalCount: 2, timeSpent: 5 });

    const res = await request(app).get(`/api/essential-grammar/${lesson._id}/attempt/history`).set('Authorization', `Bearer ${signTokenFor(studentA)}`);
    expect(res.status).toBe(200);
    expect(res.body.history).toHaveLength(1);
    expect(res.body.history[0].score).toBe(100);
  });
});

describe('Admin CRUD — teacherOnly gate', () => {
  test('a student is rejected (403) from every /admin route', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    expect((await request(app).get('/api/essential-grammar/admin').set('Authorization', `Bearer ${token}`)).status).toBe(403);
  });

  test('a teacher can edit metadata but gets 403 attempting to delete', async () => {
    const lesson = await createEssentialGrammarLesson();
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);

    const updateRes = await request(app)
      .put(`/api/essential-grammar/admin/${lesson._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.lesson.title).toBe('Updated Title');

    const delRes = await request(app).delete(`/api/essential-grammar/admin/${lesson._id}`).set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(403);
  });

  test('an admin can delete a lesson', async () => {
    const lesson = await createEssentialGrammarLesson();
    const admin = await createAdmin();
    const res = await request(app).delete(`/api/essential-grammar/admin/${lesson._id}`).set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('setActive toggles visibility and returns 404 for a bad id', async () => {
    const lesson = await createEssentialGrammarLesson({ isActive: true });
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);

    const res = await request(app)
      .patch(`/api/essential-grammar/admin/${lesson._id}/active`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.lesson.isActive).toBe(false);

    const notFound = await request(app)
      .patch('/api/essential-grammar/admin/000000000000000000000000/active')
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: false });
    expect(notFound.status).toBe(404);
  });

  test('getAdminLesson returns the full doc (including inactive lessons, unlike the public /lessons list)', async () => {
    const lesson = await createEssentialGrammarLesson({ isActive: false });
    const teacher = await createTeacher();
    const res = await request(app).get(`/api/essential-grammar/admin/${lesson._id}`).set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.lesson.isActive).toBe(false);
  });
});

describe('Admin analytics — teacherOnly gate + not-found handling', () => {
  test('a student cannot reach any analytics route (403)', async () => {
    const lesson = await createEssentialGrammarLesson();
    const student = await createStudent();
    const token = signTokenFor(student);
    expect((await request(app).get(`/api/essential-grammar/admin/${lesson._id}/students`).set('Authorization', `Bearer ${token}`)).status).toBe(403);
    expect((await request(app).get(`/api/essential-grammar/admin/${lesson._id}/missed-questions`).set('Authorization', `Bearer ${token}`)).status).toBe(403);
    expect((await request(app).get(`/api/essential-grammar/admin/${lesson._id}/export.csv`).set('Authorization', `Bearer ${token}`)).status).toBe(403);
  });

  test('breakdown/missed-questions/export all 404 for a nonexistent lesson', async () => {
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);
    const fakeId = '000000000000000000000000';
    expect((await request(app).get(`/api/essential-grammar/admin/${fakeId}/students`).set('Authorization', `Bearer ${token}`)).status).toBe(404);
    expect((await request(app).get(`/api/essential-grammar/admin/${fakeId}/missed-questions`).set('Authorization', `Bearer ${token}`)).status).toBe(404);
    expect((await request(app).get(`/api/essential-grammar/admin/${fakeId}/export.csv`).set('Authorization', `Bearer ${token}`)).status).toBe(404);
  });

  test('GET /admin/:id/students reflects a real submitted attempt', async () => {
    const lesson = await createEssentialGrammarLesson();
    const student = await createStudent();
    const teacher = await createTeacher();
    await request(app).post(`/api/essential-grammar/${lesson._id}/attempt`).set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ correctCount: 1, totalCount: 1, timeSpent: 5 });

    const res = await request(app).get(`/api/essential-grammar/admin/${lesson._id}/students`).set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.students).toHaveLength(1);
    expect(res.body.students[0].userId).toBe(String(student._id));
  });

  test('GET /admin/:id/students/:userId/history returns that specific student\'s history', async () => {
    const lesson = await createEssentialGrammarLesson();
    const student = await createStudent();
    const teacher = await createTeacher();
    await request(app).post(`/api/essential-grammar/${lesson._id}/attempt`).set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ correctCount: 1, totalCount: 1, timeSpent: 5 });

    const res = await request(app)
      .get(`/api/essential-grammar/admin/${lesson._id}/students/${student._id}/history`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.history).toHaveLength(1);
  });

  test('GET /admin/:id/export.csv returns a CSV attachment, not JSON', async () => {
    const lesson = await createEssentialGrammarLesson();
    const student = await createStudent();
    const teacher = await createTeacher();
    await request(app).post(`/api/essential-grammar/${lesson._id}/attempt`).set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ correctCount: 1, totalCount: 1, timeSpent: 5 });

    const res = await request(app).get(`/api/essential-grammar/admin/${lesson._id}/export.csv`).set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
  });
});
