// Integration tests for backend/routes/admin/writingPracticeWP.js —
// Writing Practice (WP) Topics/Exercises/Attempts admin CRUD, all
// teacherOnly. PUT/DELETE handlers 404 on an unknown id and POST maps
// validation errors to 400, matching passages/task1Exercises/task2Topics
// (fixed 2026-08-21 — this file used to skip the existence check and
// return 500 instead of 400 on bad input).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createWPTopic, createWPExercise, createWritingPracticeAttempt } = require('../factories/contentFactory');
const WPTopic = require('../../models/WPTopic');
const WPExercise = require('../../models/WPExercise');
const WritingPracticeAttempt = require('../../models/WritingPracticeAttempt');

async function authedTeacher() {
  const teacher = await createTeacher();
  return signTokenFor(teacher);
}

// ── WP Topics ────────────────────────────────────────────────────────────────
describe('GET /api/admin/wp-topics', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/wp-topics');
    expect(res.status).toBe(401);
  });

  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/wp-topics').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('teacher lists topics sorted by orderIndex', async () => {
    await createWPTopic({ key: 'topic-a', title: 'Topic A', orderIndex: 2 });
    await createWPTopic({ key: 'topic-b', title: 'Topic B', orderIndex: 1 });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/wp-topics').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const titles = res.body.topics.map(t => t.title);
    expect(titles.indexOf('Topic B')).toBeLessThan(titles.indexOf('Topic A'));
  });
});

describe('POST /api/admin/wp-topics', () => {
  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post('/api/admin/wp-topics')
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ key: 'x', title: 'x' });
    expect(res.status).toBe(403);
  });

  test('creates a topic and persists it', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/wp-topics')
      .set('Authorization', `Bearer ${token}`)
      .send({ key: 'daily-life', title: 'Daily Life' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.topic.title).toBe('Daily Life');

    const saved = await WPTopic.findById(res.body.topic._id);
    expect(saved).not.toBeNull();
    expect(saved.key).toBe('daily-life');
  });

  test('missing required field (key) surfaces as a 400', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/wp-topics')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'No key here' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('duplicate key violates the unique index and surfaces as a 400', async () => {
    // Ensure the schema's unique index on `key` is actually built before
    // we rely on it — mongoose builds indexes asynchronously in the
    // background, so without this the duplicate insert can race ahead of
    // index creation and succeed instead of throwing.
    await WPTopic.init();
    await createWPTopic({ key: 'dup-key' });
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/wp-topics')
      .set('Authorization', `Bearer ${token}`)
      .send({ key: 'dup-key', title: 'Second' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/admin/wp-topics/:id', () => {
  test('updates fields and persists them', async () => {
    const topic = await createWPTopic({ title: 'Before' });
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/wp-topics/${topic._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'After' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const saved = await WPTopic.findById(topic._id);
    expect(saved.title).toBe('After');
  });

  test('unknown id returns 404', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .put('/api/admin/wp-topics/64b000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'x' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/admin/wp-topics/:id (soft delete)', () => {
  test('teacher is blocked with 403', async () => {
    const topic = await createWPTopic();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/wp-topics/${topic._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin soft-deletes (isActive=false), document still exists', async () => {
    const topic = await createWPTopic({ isActive: true });
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/wp-topics/${topic._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const saved = await WPTopic.findById(topic._id);
    expect(saved).not.toBeNull();
    expect(saved.isActive).toBe(false);
  });
});

// ── WP Exercises ─────────────────────────────────────────────────────────────
describe('GET /api/admin/wp-exercises', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/wp-exercises');
    expect(res.status).toBe(401);
  });

  test('teacher lists exercises, filterable by level/topic/type/active', async () => {
    await createWPExercise({ topicKey: 'daily-life', level: 'beginner', type: 'translation', isActive: true });
    await createWPExercise({ topicKey: 'work', level: 'advanced', type: 'combine', isActive: false });
    const token = await authedTeacher();

    const all = await request(app).get('/api/admin/wp-exercises').set('Authorization', `Bearer ${token}`);
    expect(all.status).toBe(200);
    expect(all.body.success).toBe(true);
    expect(typeof all.body.total).toBe('number');

    const byLevel = await request(app).get('/api/admin/wp-exercises?level=beginner').set('Authorization', `Bearer ${token}`);
    expect(byLevel.body.exercises.every(e => e.level === 'beginner')).toBe(true);

    const activeOnly = await request(app).get('/api/admin/wp-exercises?active=true').set('Authorization', `Bearer ${token}`);
    expect(activeOnly.body.exercises.every(e => e.isActive === true)).toBe(true);

    const inactiveOnly = await request(app).get('/api/admin/wp-exercises?active=false').set('Authorization', `Bearer ${token}`);
    expect(inactiveOnly.body.exercises.every(e => e.isActive === false)).toBe(true);
  });
});

describe('POST /api/admin/wp-exercises', () => {
  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post('/api/admin/wp-exercises')
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ topicKey: 'x', level: 'beginner', type: 'translation', question: 'q', sampleAnswer: 'a' });
    expect(res.status).toBe(403);
  });

  test('creates an exercise and persists it', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/wp-exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ topicKey: 'hobbies', level: 'elementary', type: 'fill_blank', question: 'Fill the blank', sampleAnswer: 'answer' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.exercise.question).toBe('Fill the blank');

    const saved = await WPExercise.findById(res.body.exercise._id);
    expect(saved).not.toBeNull();
    expect(saved.topicKey).toBe('hobbies');
  });

  test('missing required field surfaces as a 400', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/wp-exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ topicKey: 'x', level: 'beginner' }); // missing type/question/sampleAnswer
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/admin/wp-exercises/:id', () => {
  test('updates fields and persists them', async () => {
    const ex = await createWPExercise({ question: 'Before' });
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/wp-exercises/${ex._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ question: 'After' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const saved = await WPExercise.findById(ex._id);
    expect(saved.question).toBe('After');
  });
});

describe('DELETE /api/admin/wp-exercises/:id (soft delete)', () => {
  test('teacher is blocked with 403', async () => {
    const ex = await createWPExercise();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/wp-exercises/${ex._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin soft-deletes (isActive=false), document still exists', async () => {
    const ex = await createWPExercise({ isActive: true });
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/wp-exercises/${ex._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const saved = await WPExercise.findById(ex._id);
    expect(saved).not.toBeNull();
    expect(saved.isActive).toBe(false);
  });
});

// ── WP Attempts ──────────────────────────────────────────────────────────────
describe('GET /api/admin/wp-attempts', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/wp-attempts');
    expect(res.status).toBe(401);
  });

  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/wp-attempts').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('teacher lists attempts populated with student username/firstName', async () => {
    const student = await createStudent({ username: 'wpattemptstudent', firstName: 'Dan' });
    await createWritingPracticeAttempt({ studentId: student._id, topic: 'daily-life' });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/wp-attempts').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.total).toBe('number');
    const found = res.body.attempts.find(a => a.topic === 'daily-life');
    expect(found).toBeDefined();
    expect(found.studentId.username).toBe('wpattemptstudent');
  });
});

describe('DELETE /api/admin/wp-attempts/:id', () => {
  test('teacher is blocked with 403 (teacherOnly route, DELETE)', async () => {
    const student = await createStudent();
    const attempt = await createWritingPracticeAttempt({ studentId: student._id });
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/wp-attempts/${attempt._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin deletes and the document is actually gone', async () => {
    const student = await createStudent();
    const attempt = await createWritingPracticeAttempt({ studentId: student._id });
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/wp-attempts/${attempt._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const saved = await WritingPracticeAttempt.findById(attempt._id);
    expect(saved).toBeNull();
  });

  test('unknown id returns 404', async () => {
    const admin = await createAdmin();
    const res = await request(app)
      .delete('/api/admin/wp-attempts/64b000000000000000000000')
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
