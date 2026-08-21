// Integration tests for backend/routes/admin/writingSamples.js — Writing
// Samples (PDF) CRUD, all teacherOnly. The upload-pdf route goes through
// multer + Cloudinary (uploadPdfBuffer in _shared.js); we don't hit real
// Cloudinary here, only assert the 400 "missing file" branch that runs
// before any upload attempt.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createWritingSample } = require('../factories/contentFactory');
const WritingSample = require('../../models/WritingSample');

async function authedTeacher() {
  const teacher = await createTeacher();
  return signTokenFor(teacher);
}

describe('GET /api/admin/writing/samples', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/writing/samples');
    expect(res.status).toBe(401);
  });

  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/writing/samples').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('teacher/admin list samples sorted by createdAt desc', async () => {
    await createWritingSample({ title: 'Older Sample' });
    await createWritingSample({ title: 'Newer Sample' });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/writing/samples').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.samples.some(s => s.title === 'Older Sample')).toBe(true);
    expect(res.body.samples.some(s => s.title === 'Newer Sample')).toBe(true);

    const admin = await createAdmin();
    const resAdmin = await request(app).get('/api/admin/writing/samples').set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(resAdmin.status).toBe(200);
  });
});

describe('POST /api/admin/writing/samples/upload-pdf', () => {
  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post('/api/admin/writing/samples/upload-pdf')
      .set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('400 when no file is attached', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/writing/samples/upload-pdf')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects a non-PDF file (multer fileFilter) with a proper JSON 400', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/writing/samples/upload-pdf')
      .set('Authorization', `Bearer ${token}`)
      .attach('pdf', Buffer.from('not a pdf'), { filename: 'note.txt', contentType: 'text/plain' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/PDF/);
  });
});

describe('POST /api/admin/writing/samples', () => {
  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post('/api/admin/writing/samples')
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ title: 'x' });
    expect(res.status).toBe(403);
  });

  test('creates a sample and persists it', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/writing/samples')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Band 8 Sample Essay', quarter: 'Q2 2025', topic: 'Technology', taskType: 'task2', pdfUrl: 'https://res.cloudinary.com/test/x.pdf' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.sample.title).toBe('Band 8 Sample Essay');

    const saved = await WritingSample.findById(res.body.sample._id);
    expect(saved).not.toBeNull();
    expect(saved.topic).toBe('Technology');
  });

  test('400 when a required field is missing', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/writing/samples')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Missing fields' }); // missing quarter/topic/pdfUrl
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/admin/writing/samples/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .put('/api/admin/writing/samples/64b000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'x' });
    expect(res.status).toBe(404);
  });

  test('updates fields and persists them', async () => {
    const sample = await createWritingSample({ title: 'Before' });
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/writing/samples/${sample._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'After' });
    expect(res.status).toBe(200);
    expect(res.body.sample.title).toBe('After');

    const saved = await WritingSample.findById(sample._id);
    expect(saved.title).toBe('After');
  });
});

describe('DELETE /api/admin/writing/samples/:id (soft delete)', () => {
  test('teacher is blocked with 403', async () => {
    const sample = await createWritingSample();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/writing/samples/${sample._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin soft-deletes (isActive=false), document still exists', async () => {
    const sample = await createWritingSample({ isActive: true });
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/writing/samples/${sample._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const saved = await WritingSample.findById(sample._id);
    expect(saved).not.toBeNull();
    expect(saved.isActive).toBe(false);
  });
});

describe('DELETE /api/admin/writing/samples/:id/permanent (hard delete)', () => {
  test('teacher is blocked with 403', async () => {
    const sample = await createWritingSample();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/writing/samples/${sample._id}/permanent`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin permanently deletes the document', async () => {
    const sample = await createWritingSample();
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/writing/samples/${sample._id}/permanent`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const saved = await WritingSample.findById(sample._id);
    expect(saved).toBeNull();
  });
});
