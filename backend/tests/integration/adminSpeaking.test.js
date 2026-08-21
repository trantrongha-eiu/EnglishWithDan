// Coverage for backend/routes/admin/speaking.js — Speaking Questions CRUD
// (soft + permanent delete), Speaking Materials CRUD (incl. PDF upload via
// Cloudinary) and the Speaking History search/filter/pagination endpoint.
//
// uploadPdfBuffer (_shared.js) calls the real `cloudinary` SDK directly
// (not the services/cloudinaryService.js wrapper other admin routes use),
// so the 'cloudinary' package itself is mocked here — otherwise the
// upload-pdf test would try a real network call with no credentials.
jest.mock('cloudinary', () => ({
  v2: {
    uploader: { upload: jest.fn().mockResolvedValue({ secure_url: 'https://res.cloudinary.com/test/speaking-materials/fake.pdf' }) },
    config: jest.fn(),
  },
}));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const cloudinary = require('cloudinary').v2;
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createSpeakingQuestion, createSpeakingAttempt } = require('../factories/contentFactory');
const SpeakingQuestion = require('../../models/SpeakingQuestion');
const SpeakingMaterial = require('../../models/SpeakingMaterial');

async function createSpeakingMaterial(overrides = {}) {
  return SpeakingMaterial.create({
    title: overrides.title || 'Sample material',
    quarter: overrides.quarter || 'Q1 2026',
    topic: overrides.topic || 'Family',
    pdfUrl: overrides.pdfUrl || 'https://res.cloudinary.com/test/old.pdf',
    isActive: overrides.isActive ?? true,
  });
}

// ── Questions ────────────────────────────────────────────────────────────
describe('GET /api/admin/speaking/questions (teacherOnly)', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/speaking/questions');
    expect(res.status).toBe(401);
  });

  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/speaking/questions').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('excludes soft-deleted (isActive: false) questions', async () => {
    const teacher = await createTeacher();
    await createSpeakingQuestion({ topic: 'Visible', isActive: true });
    await createSpeakingQuestion({ topic: 'Hidden', isActive: false });

    const res = await request(app).get('/api/admin/speaking/questions').set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    const topics = res.body.questions.map(q => q.topic);
    expect(topics).toContain('Visible');
    expect(topics).not.toContain('Hidden');
  });
});

describe('POST /api/admin/speaking/questions (teacherOnly)', () => {
  test('a teacher can create a question', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post('/api/admin/speaking/questions')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ topic: 'Hometown', part: 2, question: 'Describe your hometown.', cueCard: 'You should say...' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.question.topic).toBe('Hometown');
    expect(await SpeakingQuestion.findById(res.body.question._id)).not.toBeNull();
  });

  test('missing required question text returns 400', async () => {
    const admin = await createAdmin();
    const res = await request(app)
      .post('/api/admin/speaking/questions')
      .set('Authorization', `Bearer ${signTokenFor(admin)}`)
      .send({ topic: 'Hometown', part: 2 });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/admin/speaking/questions/:id (teacherOnly)', () => {
  test('a teacher can update a question', async () => {
    const teacher = await createTeacher();
    const q = await createSpeakingQuestion({ question: 'Old question?' });
    const res = await request(app)
      .put(`/api/admin/speaking/questions/${q._id}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ question: 'New question?' });
    expect(res.status).toBe(200);
    expect(res.body.question.question).toBe('New question?');
  });

  test('404 when the question does not exist', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .put(`/api/admin/speaking/questions/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ question: 'New question?' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/speaking/questions/:id (soft delete, teacherOnly blocks teachers)', () => {
  test('a teacher gets 403', async () => {
    const teacher = await createTeacher();
    const q = await createSpeakingQuestion();
    const res = await request(app)
      .delete(`/api/admin/speaking/questions/${q._id}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(403);
  });

  test('an admin soft-deletes: isActive becomes false, document still exists', async () => {
    const admin = await createAdmin();
    const q = await createSpeakingQuestion();
    const res = await request(app)
      .delete(`/api/admin/speaking/questions/${q._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    const saved = await SpeakingQuestion.findById(q._id);
    expect(saved.isActive).toBe(false);
  });
});

describe('DELETE /api/admin/speaking/questions/:id/permanent (hard delete, teacherOnly blocks teachers)', () => {
  test('an admin permanently deletes the document', async () => {
    const admin = await createAdmin();
    const q = await createSpeakingQuestion();
    const res = await request(app)
      .delete(`/api/admin/speaking/questions/${q._id}/permanent`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(await SpeakingQuestion.findById(q._id)).toBeNull();
  });
});

// ── Materials (PDF) ─────────────────────────────────────────────────────
describe('GET /api/admin/speaking/materials (teacherOnly)', () => {
  test('excludes soft-deleted materials', async () => {
    const teacher = await createTeacher();
    await createSpeakingMaterial({ title: 'Visible', isActive: true });
    await createSpeakingMaterial({ title: 'Hidden', isActive: false });

    const res = await request(app).get('/api/admin/speaking/materials').set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    const titles = res.body.materials.map(m => m.title);
    expect(titles).toContain('Visible');
    expect(titles).not.toContain('Hidden');
  });
});

describe('POST /api/admin/speaking/materials/upload-pdf (teacherOnly)', () => {
  test('401 without a token', async () => {
    const res = await request(app).post('/api/admin/speaking/materials/upload-pdf');
    expect(res.status).toBe(401);
  });

  test('400 when no file is attached', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post('/api/admin/speaking/materials/upload-pdf')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(400);
  });

  test('uploads a PDF buffer to Cloudinary and returns the secure URL', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post('/api/admin/speaking/materials/upload-pdf')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .attach('pdf', Buffer.from('%PDF-1.4 fake pdf content'), { filename: 'material.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.url).toBe('https://res.cloudinary.com/test/speaking-materials/fake.pdf');
    expect(cloudinary.uploader.upload).toHaveBeenCalled();
    const [, opts] = cloudinary.uploader.upload.mock.calls[cloudinary.uploader.upload.mock.calls.length - 1];
    expect(opts.folder).toBe('speaking-materials');
  });

  test('rejects a non-PDF file via multer fileFilter with a proper JSON 400', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post('/api/admin/speaking/materials/upload-pdf')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .attach('pdf', Buffer.from('not a pdf'), { filename: 'material.txt', contentType: 'text/plain' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/PDF/);
  });
});

describe('POST /api/admin/speaking/materials (teacherOnly)', () => {
  test('a teacher can create a material record directly (metadata only)', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post('/api/admin/speaking/materials')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ title: 'Q1 pack', quarter: 'Q1 2026', topic: 'Family', pdfUrl: 'https://res.cloudinary.com/test/x.pdf' });
    expect(res.status).toBe(201);
    expect(res.body.material.title).toBe('Q1 pack');
  });

  test('missing required pdfUrl returns 400', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post('/api/admin/speaking/materials')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ title: 'Q1 pack', quarter: 'Q1 2026', topic: 'Family' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/admin/speaking/materials/:id (teacherOnly)', () => {
  test('a teacher can update a material', async () => {
    const teacher = await createTeacher();
    const m = await createSpeakingMaterial({ title: 'Old title' });
    const res = await request(app)
      .put(`/api/admin/speaking/materials/${m._id}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ title: 'New title' });
    expect(res.status).toBe(200);
    expect(res.body.material.title).toBe('New title');
  });

  test('404 when the material does not exist', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .put(`/api/admin/speaking/materials/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ title: 'New title' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/speaking/materials/:id and /permanent (teacherOnly blocks teachers)', () => {
  test('a teacher is blocked from soft-deleting', async () => {
    const teacher = await createTeacher();
    const m = await createSpeakingMaterial();
    const res = await request(app)
      .delete(`/api/admin/speaking/materials/${m._id}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(403);
  });

  test('an admin soft-deletes then permanently deletes', async () => {
    const admin = await createAdmin();
    const m = await createSpeakingMaterial();

    const soft = await request(app)
      .delete(`/api/admin/speaking/materials/${m._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(soft.status).toBe(200);
    expect((await SpeakingMaterial.findById(m._id)).isActive).toBe(false);

    const hard = await request(app)
      .delete(`/api/admin/speaking/materials/${m._id}/permanent`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(hard.status).toBe(200);
    expect(await SpeakingMaterial.findById(m._id)).toBeNull();
  });
});

// ── History ──────────────────────────────────────────────────────────────
describe('GET /api/admin/speaking/history (teacherOnly)', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/speaking/history');
    expect(res.status).toBe(401);
  });

  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/speaking/history').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('lists attempts across all students with populated username, newest first', async () => {
    const teacher = await createTeacher();
    const studentA = await createStudent({ username: 'alice_speaks' });
    const studentB = await createStudent({ username: 'bob_speaks' });
    await createSpeakingAttempt({ userId: studentA._id, topic: 'Travel' });
    await new Promise(r => setTimeout(r, 5));
    await createSpeakingAttempt({ userId: studentB._id, topic: 'Food' });

    const res = await request(app).get('/api/admin/speaking/history').set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.attempts).toHaveLength(2);
    // Newest first.
    expect(res.body.attempts[0].topic).toBe('Food');
    expect(res.body.attempts[0].userId.username).toBe('bob_speaks');
  });

  test('?userId= filters to a single student', async () => {
    const teacher = await createTeacher();
    const studentA = await createStudent();
    const studentB = await createStudent();
    await createSpeakingAttempt({ userId: studentA._id, topic: 'Travel' });
    await createSpeakingAttempt({ userId: studentB._id, topic: 'Food' });

    const res = await request(app)
      .get(`/api/admin/speaking/history?userId=${studentA._id}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.attempts).toHaveLength(1);
    expect(res.body.attempts[0].topic).toBe('Travel');
  });

  test('?part= filters by speaking part number', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    await createSpeakingAttempt({ userId: student._id, part: 1, topic: 'Part1 topic' });
    await createSpeakingAttempt({ userId: student._id, part: 2, topic: 'Part2 topic' });

    const res = await request(app)
      .get('/api/admin/speaking/history?part=2')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.attempts).toHaveLength(1);
    expect(res.body.attempts[0].topic).toBe('Part2 topic');
  });

  test('?search= resolves matching usernames server-side (not just the current page)', async () => {
    const teacher = await createTeacher();
    const targetStudent = await createStudent({ username: 'search_target_zz' });
    const otherStudent = await createStudent({ username: 'someone_else' });
    await createSpeakingAttempt({ userId: targetStudent._id, topic: 'By username match' });
    await createSpeakingAttempt({ userId: otherStudent._id, topic: 'Not matching' });

    const res = await request(app)
      .get('/api/admin/speaking/history?search=search_target')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.attempts).toHaveLength(1);
    expect(res.body.attempts[0].topic).toBe('By username match');
  });

  test('pagination: page/limit/pages are computed correctly', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    for (let i = 0; i < 5; i++) {
      await createSpeakingAttempt({ userId: student._id, topic: `Topic ${i}` });
    }

    const res = await request(app)
      .get('/api/admin/speaking/history?limit=2&page=2')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(5);
    expect(res.body.page).toBe(2);
    expect(res.body.pages).toBe(3); // ceil(5/2)
    expect(res.body.attempts).toHaveLength(2);
  });
});
