// Integration tests for backend/routes/admin/writingContent.js — Writing
// Tests dropdown, Writing Exams, Writing History (+ counts, detail),
// Writing Task 1 Pool, Writing Task 2 Pool. All teacherOnly.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createWritingExam, createWritingTask1, createWritingTask2, createWritingAttempt } = require('../factories/contentFactory');
const WritingExam = require('../../models/WritingExam');
const WritingTask1 = require('../../models/WritingTask1');
const WritingTask2 = require('../../models/WritingTask2');

async function authedTeacher() {
  const teacher = await createTeacher();
  return signTokenFor(teacher);
}

// ── Writing tests dropdown / exams ──────────────────────────────────────────
describe('GET /api/admin/writing-tests (dropdown)', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/writing-tests');
    expect(res.status).toBe(401);
  });

  test('returns only active exams', async () => {
    await createWritingExam({ name: 'Active Exam', isActive: true });
    await createWritingExam({ name: 'Inactive Exam', isActive: false });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/writing-tests').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.exams.some(e => e.name === 'Active Exam')).toBe(true);
    expect(res.body.exams.some(e => e.name === 'Inactive Exam')).toBe(false);
  });
});

describe('GET /api/admin/writing-exams', () => {
  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/writing-exams').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('returns all exams regardless of isActive', async () => {
    await createWritingExam({ name: 'Exam One', isActive: true });
    await createWritingExam({ name: 'Exam Two', isActive: false });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/writing-exams').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.exams.some(e => e.name === 'Exam One')).toBe(true);
    expect(res.body.exams.some(e => e.name === 'Exam Two')).toBe(true);
  });
});

describe('POST /api/admin/writing-exams/upload-image', () => {
  test('400 when imageBase64 missing', async () => {
    const token = await authedTeacher();
    const res = await request(app).post('/api/admin/writing-exams/upload-image').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });

  test('400 when imageBase64 invalid', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/writing-exams/upload-image')
      .set('Authorization', `Bearer ${token}`)
      .send({ imageBase64: 'garbage' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/admin/writing-exams', () => {
  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post('/api/admin/writing-exams')
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ name: 'x' });
    expect(res.status).toBe(403);
  });

  test('creates an exam and persists it', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/writing-exams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Academic Writing Test 5', duration: 60 });
    expect(res.status).toBe(201);
    expect(res.body.exam.name).toBe('Academic Writing Test 5');

    const saved = await WritingExam.findById(res.body.exam._id);
    expect(saved).not.toBeNull();
  });

  test('400 when required field (name) missing', async () => {
    const token = await authedTeacher();
    const res = await request(app).post('/api/admin/writing-exams').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/admin/writing-exams/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .put('/api/admin/writing-exams/64b000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'x' });
    expect(res.status).toBe(404);
  });

  test('updates and persists', async () => {
    const exam = await createWritingExam({ name: 'Old' });
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/writing-exams/${exam._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New' });
    expect(res.status).toBe(200);
    expect(res.body.exam.name).toBe('New');
  });
});

describe('DELETE /api/admin/writing-exams/:id (soft delete)', () => {
  test('teacher is blocked with 403', async () => {
    const exam = await createWritingExam();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/writing-exams/${exam._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin soft-deletes (isActive=false), doc still exists', async () => {
    const exam = await createWritingExam({ isActive: true });
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/writing-exams/${exam._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    const saved = await WritingExam.findById(exam._id);
    expect(saved).not.toBeNull();
    expect(saved.isActive).toBe(false);
  });
});

// ── Writing history ──────────────────────────────────────────────────────────
describe('GET /api/admin/writing-history', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/writing-history');
    expect(res.status).toBe(401);
  });

  test('lists attempts, excludes full-text fields, filterable by status/type', async () => {
    const student = await createStudent({ username: 'writinghistorystudent' });
    await createWritingAttempt({ userId: student._id, submissionType: 'practice', extra: { gradingStatus: 'pending', task1Answer: 'secret answer text' } });
    await createWritingAttempt({ userId: student._id, submissionType: 'exam', extra: { gradingStatus: 'ai_done' } });
    const token = await authedTeacher();

    const res = await request(app).get('/api/admin/writing-history').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(res.body.attempts.every(a => a.task1Answer === undefined)).toBe(true);

    const byStatus = await request(app).get('/api/admin/writing-history?status=pending').set('Authorization', `Bearer ${token}`);
    expect(byStatus.body.attempts.every(a => a.gradingStatus === 'pending')).toBe(true);

    const byType = await request(app).get('/api/admin/writing-history?type=practice').set('Authorization', `Bearer ${token}`);
    expect(byType.body.attempts.every(a => a.submissionType === 'practice')).toBe(true);
  });

  test('search matches by username', async () => {
    const student = await createStudent({ username: 'searchablewriter123' });
    await createWritingAttempt({ userId: student._id });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/writing-history?search=searchablewriter123').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.attempts.length).toBeGreaterThanOrEqual(1);
  });

  test('page/limit params clamp invalid values instead of erroring', async () => {
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/writing-history?page=abc&limit=0').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
  });
});

describe('GET /api/admin/writing-history/counts', () => {
  test('returns counts keyed by gradingStatus', async () => {
    const student = await createStudent();
    await createWritingAttempt({ userId: student._id, extra: { gradingStatus: 'pending' } });
    await createWritingAttempt({ userId: student._id, extra: { gradingStatus: 'confirmed' } });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/writing-history/counts').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.counts).toHaveProperty('pending');
    expect(res.body.counts).toHaveProperty('ai_done');
    expect(res.body.counts).toHaveProperty('confirmed');
    expect(res.body.counts.pending).toBeGreaterThanOrEqual(1);
    expect(res.body.counts.confirmed).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/admin/writing-attempt/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/writing-attempt/64b000000000000000000000').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('returns full attempt detail including answer text', async () => {
    const student = await createStudent();
    const attempt = await createWritingAttempt({ userId: student._id, extra: { task1Answer: 'Full answer text here' } });
    const token = await authedTeacher();
    const res = await request(app).get(`/api/admin/writing-attempt/${attempt._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.attempt.task1Answer).toBe('Full answer text here');
  });
});

// ── Writing Task 1 Pool ──────────────────────────────────────────────────────
describe('GET /api/admin/writing-task1', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/writing-task1');
    expect(res.status).toBe(401);
  });

  test('lists tasks', async () => {
    await createWritingTask1({ prompt: 'Describe the chart below' });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/writing-task1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.tasks.some(t => t.prompt === 'Describe the chart below')).toBe(true);
  });
});

describe('GET /api/admin/writing-task1/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/writing-task1/64b000000000000000000000').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/admin/writing-task1/upload-image', () => {
  test('400 when imageBase64 missing', async () => {
    const token = await authedTeacher();
    const res = await request(app).post('/api/admin/writing-task1/upload-image').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/admin/writing-task1', () => {
  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post('/api/admin/writing-task1')
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ prompt: 'x' });
    expect(res.status).toBe(403);
  });

  test('creates a task and persists it', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/writing-task1')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'The chart shows internet usage.' });
    expect(res.status).toBe(201);
    expect(res.body.task.prompt).toBe('The chart shows internet usage.');

    const saved = await WritingTask1.findById(res.body.task._id);
    expect(saved).not.toBeNull();
  });
});

describe('PUT /api/admin/writing-task1/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .put('/api/admin/writing-task1/64b000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'x' });
    expect(res.status).toBe(404);
  });

  test('updates and persists', async () => {
    const task = await createWritingTask1({ prompt: 'Before' });
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/writing-task1/${task._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'After' });
    expect(res.status).toBe(200);
    expect(res.body.task.prompt).toBe('After');
  });
});

describe('DELETE /api/admin/writing-task1/:id (soft) and /permanent', () => {
  test('teacher blocked 403 on soft delete', async () => {
    const task = await createWritingTask1();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/writing-task1/${task._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin soft-deletes (isActive=false)', async () => {
    const task = await createWritingTask1({ isActive: true });
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/writing-task1/${task._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    const saved = await WritingTask1.findById(task._id);
    expect(saved.isActive).toBe(false);
  });

  test('teacher blocked 403 on permanent delete', async () => {
    const task = await createWritingTask1();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/writing-task1/${task._id}/permanent`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin permanently deletes the document', async () => {
    const task = await createWritingTask1();
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/writing-task1/${task._id}/permanent`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    const saved = await WritingTask1.findById(task._id);
    expect(saved).toBeNull();
  });
});

// ── Writing Task 2 Pool ──────────────────────────────────────────────────────
describe('GET /api/admin/writing-task2', () => {
  test('lists tasks', async () => {
    await createWritingTask2({ prompt: 'Some people think X. Discuss.' });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/writing-task2').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.tasks.some(t => t.prompt === 'Some people think X. Discuss.')).toBe(true);
  });
});

describe('GET /api/admin/writing-task2/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/writing-task2/64b000000000000000000000').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/admin/writing-task2', () => {
  test('creates a task and persists it', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/writing-task2')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'Discuss the advantages and disadvantages.' });
    expect(res.status).toBe(201);
    const saved = await WritingTask2.findById(res.body.task._id);
    expect(saved).not.toBeNull();
  });
});

describe('PUT /api/admin/writing-task2/:id', () => {
  test('updates and persists', async () => {
    const task = await createWritingTask2({ prompt: 'Before' });
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/writing-task2/${task._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'After' });
    expect(res.status).toBe(200);
    expect(res.body.task.prompt).toBe('After');
  });

  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .put('/api/admin/writing-task2/64b000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'x' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/writing-task2/:id (soft) and /permanent', () => {
  test('teacher blocked 403 on soft delete', async () => {
    const task = await createWritingTask2();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/writing-task2/${task._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin soft-deletes (isActive=false)', async () => {
    const task = await createWritingTask2({ isActive: true });
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/writing-task2/${task._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    const saved = await WritingTask2.findById(task._id);
    expect(saved.isActive).toBe(false);
  });

  test('admin permanently deletes the document', async () => {
    const task = await createWritingTask2();
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/writing-task2/${task._id}/permanent`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    const saved = await WritingTask2.findById(task._id);
    expect(saved).toBeNull();
  });
});
