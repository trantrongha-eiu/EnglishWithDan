// Integration tests for backend/routes/admin/task2Topics.js — Task 2
// Topics CRUD (teacherOnly) plus nested question CRUD, plus the one-off
// adminOnly maintenance endpoint (fix-task1-context — deliberately NOT
// called by admin-src UI, see the route file's comment block; here we
// only verify the auth/role gate, not the underlying script behavior).
// reseed-task2-week12 (formerly tested below) was removed in the
// 2026-08-26 curriculum restructure — "week 12" no longer means what its
// hardcoded seed data assumed; see that route file's comment block.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createTask2Topic, defaultTask2Question } = require('../factories/contentFactory');
const Task2Topic = require('../../models/Task2Topic');

async function authedTeacher() {
  const teacher = await createTeacher();
  return signTokenFor(teacher);
}

describe('GET /api/admin/task2/topics', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/task2/topics');
    expect(res.status).toBe(401);
  });

  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/task2/topics').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('teacher lists topics with pagination shape, filterable by week/search', async () => {
    await createTask2Topic({ week: 3, topicName: 'Pollution reduction strategies' });
    await createTask2Topic({ week: 5, topicName: 'Education funding' });
    const token = await authedTeacher();

    const all = await request(app).get('/api/admin/task2/topics').set('Authorization', `Bearer ${token}`);
    expect(all.status).toBe(200);
    expect(all.body.success).toBe(true);
    expect(typeof all.body.total).toBe('number');

    const byWeek = await request(app).get('/api/admin/task2/topics?week=3').set('Authorization', `Bearer ${token}`);
    expect(byWeek.body.topics.every(t => t.week === 3)).toBe(true);

    const bySearch = await request(app).get('/api/admin/task2/topics?search=Pollution').set('Authorization', `Bearer ${token}`);
    expect(bySearch.body.topics.some(t => t.topicName.includes('Pollution'))).toBe(true);
  });
});

describe('GET /api/admin/task2/topics/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/task2/topics/64b000000000000000000000').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('returns the topic', async () => {
    const topic = await createTask2Topic({ topicName: 'Findable Topic' });
    const token = await authedTeacher();
    const res = await request(app).get(`/api/admin/task2/topics/${topic._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.topic.topicName).toBe('Findable Topic');
  });
});

describe('POST /api/admin/task2/topics', () => {
  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post('/api/admin/task2/topics')
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ week: 1, block: 'A', topicName: 'x', essayType: 'agree_disagree', prompt: 'p' });
    expect(res.status).toBe(403);
  });

  test('creates a topic and persists it', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/task2/topics')
      .set('Authorization', `Bearer ${token}`)
      .send({ week: 4, block: 'B', topicName: 'Remote work', essayType: 'discuss_both_views', prompt: 'Discuss both views.' });
    expect(res.status).toBe(201);
    expect(res.body.topic.topicName).toBe('Remote work');

    const saved = await Task2Topic.findById(res.body.topic._id);
    expect(saved).not.toBeNull();
    expect(saved.week).toBe(4);
  });

  test('400 when a required field is missing', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/task2/topics')
      .set('Authorization', `Bearer ${token}`)
      .send({ week: 1, block: 'A' }); // missing topicName/essayType/prompt
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/admin/task2/topics/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .put('/api/admin/task2/topics/64b000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ topicName: 'x' });
    expect(res.status).toBe(404);
  });

  test('updates fields and persists them, questions field ignored (managed separately)', async () => {
    const topic = await createTask2Topic({ topicName: 'Before', questions: [] });
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/task2/topics/${topic._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ topicName: 'After', questions: [defaultTask2Question()] });
    expect(res.status).toBe(200);
    expect(res.body.topic.topicName).toBe('After');
    // questions was stripped from the update payload by the route handler
    expect(res.body.topic.questions.length).toBe(0);

    const saved = await Task2Topic.findById(topic._id);
    expect(saved.topicName).toBe('After');
    expect(saved.questions.length).toBe(0);
  });
});

describe('DELETE /api/admin/task2/topics/:id', () => {
  test('teacher is blocked with 403', async () => {
    const topic = await createTask2Topic();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/task2/topics/${topic._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('404 for unknown id (admin)', async () => {
    const admin = await createAdmin();
    const res = await request(app)
      .delete('/api/admin/task2/topics/64b000000000000000000000')
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(404);
  });

  test('admin deletes and the document is actually gone', async () => {
    const topic = await createTask2Topic();
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/task2/topics/${topic._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    const saved = await Task2Topic.findById(topic._id);
    expect(saved).toBeNull();
  });
});

describe('POST /api/admin/task2/topics/:id/questions', () => {
  test('404 for unknown topic id', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/task2/topics/64b000000000000000000000/questions')
      .set('Authorization', `Bearer ${token}`)
      .send(defaultTask2Question());
    expect(res.status).toBe(404);
  });

  test('pushes a question and persists it', async () => {
    const topic = await createTask2Topic({ questions: [] });
    const token = await authedTeacher();
    const res = await request(app)
      .post(`/api/admin/task2/topics/${topic._id}/questions`)
      .set('Authorization', `Bearer ${token}`)
      .send(defaultTask2Question({ questionText: 'New question text' }));
    expect(res.status).toBe(201);
    expect(res.body.question.questionText).toBe('New question text');

    const saved = await Task2Topic.findById(topic._id);
    expect(saved.questions.length).toBe(1);
    expect(saved.questions[0].questionText).toBe('New question text');
  });

  test('400 when question body is missing required fields', async () => {
    const topic = await createTask2Topic({ questions: [] });
    const token = await authedTeacher();
    const res = await request(app)
      .post(`/api/admin/task2/topics/${topic._id}/questions`)
      .set('Authorization', `Bearer ${token}`)
      .send({ level: 'beginner' }); // missing type/questionText
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/admin/task2/topics/:topicId/questions/:qid', () => {
  test('404 for unknown question id', async () => {
    const topic = await createTask2Topic({ questions: [defaultTask2Question()] });
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/task2/topics/${topic._id}/questions/64b000000000000000000000`)
      .set('Authorization', `Bearer ${token}`)
      .send({ questionText: 'x' });
    expect(res.status).toBe(404);
  });

  test('updates the nested question and persists it', async () => {
    const topic = await createTask2Topic({ questions: [defaultTask2Question({ questionText: 'Old text' })] });
    const qid = topic.questions[0]._id.toString();
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/task2/topics/${topic._id}/questions/${qid}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ questionText: 'New text' });
    expect(res.status).toBe(200);
    expect(res.body.question.questionText).toBe('New text');

    const saved = await Task2Topic.findById(topic._id);
    expect(saved.questions.find(q => q._id.toString() === qid).questionText).toBe('New text');
  });
});

describe('DELETE /api/admin/task2/topics/:topicId/questions/:qid', () => {
  test('teacher is blocked with 403 (teacherOnly route, DELETE)', async () => {
    const topic = await createTask2Topic({ questions: [defaultTask2Question()] });
    const qid = topic.questions[0]._id.toString();
    const token = await authedTeacher();
    const res = await request(app)
      .delete(`/api/admin/task2/topics/${topic._id}/questions/${qid}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('404 for unknown topic id (admin)', async () => {
    const admin = await createAdmin();
    const res = await request(app)
      .delete('/api/admin/task2/topics/64b000000000000000000000/questions/64b000000000000000000001')
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(404);
  });

  test('admin removes the nested question and it is actually gone', async () => {
    const topic = await createTask2Topic({ questions: [defaultTask2Question()] });
    const qid = topic.questions[0]._id.toString();
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/task2/topics/${topic._id}/questions/${qid}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);

    const saved = await Task2Topic.findById(topic._id);
    expect(saved.questions.length).toBe(0);
  });
});

describe('POST /api/admin/fix-task1-context (adminOnly, no frontend caller — manual maintenance tool)', () => {
  test('teacher is blocked with 403 (adminOnly, stricter than teacherOnly)', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post('/api/admin/fix-task1-context')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(403);
  });
});
