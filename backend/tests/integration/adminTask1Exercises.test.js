// Integration tests for backend/routes/admin/task1Exercises.js — Task 1
// Exercises CRUD, all teacherOnly. Mirrors role-gating pattern from
// tests/integration/admin.test.js.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createTask1Exercise } = require('../factories/contentFactory');
const Task1Exercise = require('../../models/Task1Exercise');

async function authedTeacher() {
  const teacher = await createTeacher();
  return signTokenFor(teacher);
}

describe('GET /api/admin/task1/exercises', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/task1/exercises');
    expect(res.status).toBe(401);
  });

  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/task1/exercises').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('teacher lists exercises with pagination shape', async () => {
    await createTask1Exercise({ instruction: 'Describe the chart' });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/task1/exercises').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.exercises)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(res.body.page).toBe(1);
  });

  test('filters by level/skillType/type and search', async () => {
    await createTask1Exercise({ level: 'intermediate', skillType: 'comparison', type: 'translation', instruction: 'Findable unique instruction xyz' });
    await createTask1Exercise({ level: 'beginner', skillType: 'overview', type: 'fill_blank', instruction: 'Other one' });
    const token = await authedTeacher();

    const byLevel = await request(app).get('/api/admin/task1/exercises?level=intermediate').set('Authorization', `Bearer ${token}`);
    expect(byLevel.body.exercises.every(e => e.level === 'intermediate')).toBe(true);

    const bySearch = await request(app).get('/api/admin/task1/exercises?search=Findable%20unique').set('Authorization', `Bearer ${token}`);
    expect(bySearch.body.exercises.some(e => e.instruction.includes('Findable unique'))).toBe(true);
  });
});

describe('POST /api/admin/task1/exercises', () => {
  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post('/api/admin/task1/exercises')
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ skillType: 'overview', module: 1, level: 'beginner', type: 'fill_blank', instruction: 'x' });
    expect(res.status).toBe(403);
  });

  test('creates an exercise and persists it', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/task1/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ skillType: 'trend_language', module: 2, level: 'elementary', type: 'rearrange', instruction: 'Order the words' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.exercise.instruction).toBe('Order the words');

    const saved = await Task1Exercise.findById(res.body.exercise._id);
    expect(saved).not.toBeNull();
    expect(saved.skillType).toBe('trend_language');
  });

  test('400 when a required field is missing', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/task1/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ module: 1, level: 'beginner' }); // missing skillType/type/instruction
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('400 when an enum field has an invalid value', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/task1/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ skillType: 'not-a-real-skill', module: 1, level: 'beginner', type: 'fill_blank', instruction: 'x' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/admin/task1/exercises/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .put('/api/admin/task1/exercises/64b000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ instruction: 'x' });
    expect(res.status).toBe(404);
  });

  test('updates fields and persists them', async () => {
    const ex = await createTask1Exercise({ instruction: 'Before' });
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/task1/exercises/${ex._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ instruction: 'After' });
    expect(res.status).toBe(200);
    expect(res.body.exercise.instruction).toBe('After');

    const saved = await Task1Exercise.findById(ex._id);
    expect(saved.instruction).toBe('After');
  });

  test('400 when update sets an invalid enum value (runValidators)', async () => {
    const ex = await createTask1Exercise();
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/task1/exercises/${ex._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ level: 'not-a-real-level' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/admin/task1/exercises/:id', () => {
  test('teacher is blocked with 403', async () => {
    const ex = await createTask1Exercise();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/task1/exercises/${ex._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('404 for unknown id (admin)', async () => {
    const admin = await createAdmin();
    const res = await request(app)
      .delete('/api/admin/task1/exercises/64b000000000000000000000')
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(404);
  });

  test('admin deletes and the document is actually gone', async () => {
    const ex = await createTask1Exercise();
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/task1/exercises/${ex._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const saved = await Task1Exercise.findById(ex._id);
    expect(saved).toBeNull();
  });
});
