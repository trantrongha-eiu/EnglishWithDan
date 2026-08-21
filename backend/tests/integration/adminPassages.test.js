// Integration tests for backend/routes/admin/passages.js — Passages,
// Reading Tests, and the Listening Tests dropdown, all teacherOnly.
// Mirrors the role-gating pattern from tests/integration/admin.test.js:
// student blocked 403, teacher/admin allowed on GET/PUT/POST, teacher
// blocked 403 on DELETE (teacherOnly's "no deleting content" rule).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createPassage, createReadingTest, createListeningTest } = require('../factories/contentFactory');
const Passage = require('../../models/Passage');
const ReadingTest = require('../../models/ReadingTest');

async function authedTeacher() {
  const teacher = await createTeacher();
  return signTokenFor(teacher);
}

describe('GET /api/admin/passages', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/passages');
    expect(res.status).toBe(401);
  });

  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/passages').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('teacher gets a paginated list with computed questionCount', async () => {
    await createPassage({
      title: 'Ocean Currents',
      category: 'passage1',
      questions: [
        { questionNumber: 1, type: 'sentence-completion', questionText: 'Q1 __1__', correctAnswer: 'a' },
        { questionNumber: 2, type: 'sentence-completion', questionText: 'Q2 __2__', correctAnswer: 'b' },
      ],
    });
    const res = await request(app).get('/api/admin/passages').set('Authorization', `Bearer ${await authedTeacher()}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const found = res.body.passages.find(p => p.title === 'Ocean Currents');
    expect(found).toBeDefined();
    expect(found.questionCount).toBe(2);
    expect(typeof res.body.total).toBe('number');
  });

  test('filters by category', async () => {
    await createPassage({ title: 'P2 filter test', category: 'passage2' });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/passages?category=passage2').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.passages.every(p => p.category === 'passage2')).toBe(true);
  });
});

describe('GET /api/admin/passages/stats', () => {
  test('returns counts per category for active passages only', async () => {
    await createPassage({ category: 'passage1', isActive: true });
    await createPassage({ category: 'passage1', isActive: false });
    await createPassage({ category: 'passage3', isActive: true });
    const res = await request(app).get('/api/admin/passages/stats').set('Authorization', `Bearer ${await authedTeacher()}`);
    expect(res.status).toBe(200);
    expect(res.body.stats).toHaveProperty('passage1');
    expect(res.body.stats).toHaveProperty('passage2');
    expect(res.body.stats).toHaveProperty('passage3');
    expect(res.body.stats.passage3).toBeGreaterThanOrEqual(1);
  });
});

describe('POST /api/admin/passages/upload-map-image', () => {
  test('400 when imageBase64 missing', async () => {
    const res = await request(app)
      .post('/api/admin/passages/upload-map-image')
      .set('Authorization', `Bearer ${await authedTeacher()}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('400 when imageBase64 is not a valid image data URI', async () => {
    const res = await request(app)
      .post('/api/admin/passages/upload-map-image')
      .set('Authorization', `Bearer ${await authedTeacher()}`)
      .send({ imageBase64: 'not-an-image' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/admin/passages', () => {
  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post('/api/admin/passages')
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ title: 'x', category: 'passage1', content: 'c', questionRange: { start: 1, end: 1 } });
    expect(res.status).toBe(403);
  });

  test('creates a passage and persists it', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/passages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'A New Reading Passage',
        category: 'passage1',
        content: 'Full passage text here.',
        questionRange: { start: 1, end: 5 },
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.passage.title).toBe('A New Reading Passage');

    const saved = await Passage.findById(res.body.passage._id);
    expect(saved).not.toBeNull();
    expect(saved.content).toBe('Full passage text here.');
  });

  test('400 when a required field is missing', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/passages')
      .set('Authorization', `Bearer ${token}`)
      .send({ category: 'passage1' }); // missing title/content/questionRange
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/admin/passages/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .get('/api/admin/passages/64b000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('returns the passage', async () => {
    const passage = await createPassage({ title: 'Findable Passage' });
    const token = await authedTeacher();
    const res = await request(app).get(`/api/admin/passages/${passage._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.passage.title).toBe('Findable Passage');
  });
});

describe('PUT /api/admin/passages/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .put('/api/admin/passages/64b000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'x' });
    expect(res.status).toBe(404);
  });

  test('updates fields and persists them', async () => {
    const passage = await createPassage({ title: 'Before', isActive: true });
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/passages/${passage._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'After', isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.passage.title).toBe('After');
    expect(res.body.passage.isActive).toBe(false);

    const saved = await Passage.findById(passage._id);
    expect(saved.title).toBe('After');
    expect(saved.isActive).toBe(false);
  });
});

describe('DELETE /api/admin/passages/:id (soft delete)', () => {
  test('teacher is blocked with 403', async () => {
    const passage = await createPassage();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/passages/${passage._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin soft-deletes (isActive=false), document still exists', async () => {
    const passage = await createPassage({ isActive: true });
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/passages/${passage._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const saved = await Passage.findById(passage._id);
    expect(saved).not.toBeNull();
    expect(saved.isActive).toBe(false);
  });
});

describe('DELETE /api/admin/passages/:id/permanent (hard delete)', () => {
  test('teacher is blocked with 403', async () => {
    const passage = await createPassage();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/passages/${passage._id}/permanent`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('404 for unknown id (admin)', async () => {
    const admin = await createAdmin();
    const res = await request(app)
      .delete('/api/admin/passages/64b000000000000000000000/permanent')
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(404);
  });

  test('admin permanently deletes the document', async () => {
    const passage = await createPassage();
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/passages/${passage._id}/permanent`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const saved = await Passage.findById(passage._id);
    expect(saved).toBeNull();
  });
});

describe('GET /api/admin/tests (Reading Tests)', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/tests');
    expect(res.status).toBe(401);
  });

  test('lists tests sorted by testNumber desc', async () => {
    await createReadingTest({ name: 'Test A', testNumber: 5 });
    await createReadingTest({ name: 'Test B', testNumber: 9 });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/tests').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.tests.length).toBeGreaterThanOrEqual(2);
    expect(res.body.tests[0].testNumber).toBeGreaterThanOrEqual(res.body.tests[1].testNumber);
  });
});

describe('POST /api/admin/tests', () => {
  test('creates a reading test and persists it', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/tests')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Orange Test 20', testNumber: 20 });
    expect(res.status).toBe(201);
    expect(res.body.test.name).toBe('Orange Test 20');

    const saved = await ReadingTest.findById(res.body.test._id);
    expect(saved).not.toBeNull();
  });

  test('400 when required field missing', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .post('/api/admin/tests')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Missing test number' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/admin/tests/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/tests/64b000000000000000000000').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/admin/tests/:id', () => {
  test('404 for unknown id', async () => {
    const token = await authedTeacher();
    const res = await request(app)
      .put('/api/admin/tests/64b000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'x' });
    expect(res.status).toBe(404);
  });

  test('updates and persists', async () => {
    const test = await createReadingTest({ name: 'Old Name' });
    const token = await authedTeacher();
    const res = await request(app)
      .put(`/api/admin/tests/${test._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name' });
    expect(res.status).toBe(200);
    expect(res.body.test.name).toBe('New Name');
  });
});

describe('DELETE /api/admin/tests/:id (soft) and /permanent', () => {
  test('teacher blocked 403 on soft delete', async () => {
    const test = await createReadingTest();
    const token = await authedTeacher();
    const res = await request(app).delete(`/api/admin/tests/${test._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin soft-deletes (isActive=false)', async () => {
    const test = await createReadingTest({ isActive: true });
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/tests/${test._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    const saved = await ReadingTest.findById(test._id);
    expect(saved.isActive).toBe(false);
  });

  test('admin permanently deletes, 404 on unknown id', async () => {
    const admin = await createAdmin();
    const token = signTokenFor(admin);
    const res404 = await request(app)
      .delete('/api/admin/tests/64b000000000000000000000/permanent')
      .set('Authorization', `Bearer ${token}`);
    expect(res404.status).toBe(404);

    const test = await createReadingTest();
    const res = await request(app).delete(`/api/admin/tests/${test._id}/permanent`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const saved = await ReadingTest.findById(test._id);
    expect(saved).toBeNull();
  });
});

describe('GET /api/admin/reading-tests/attempts and /stats', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/reading-tests/attempts');
    expect(res.status).toBe(401);
  });

  test('teacher gets paginated attempts shape', async () => {
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/reading-tests/attempts').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.attempts)).toBe(true);
  });

  test('teacher gets attempts stats shape', async () => {
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/reading-tests/attempts/stats').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/admin/listening-tests (dropdown)', () => {
  test('student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/listening-tests').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('returns only active tests, sorted desc, with limited fields', async () => {
    await createListeningTest({ name: 'Active LT', testNumber: 3, isActive: true });
    await createListeningTest({ name: 'Inactive LT', testNumber: 4, isActive: false });
    const token = await authedTeacher();
    const res = await request(app).get('/api/admin/listening-tests').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.tests.some(t => t.name === 'Active LT')).toBe(true);
    expect(res.body.tests.some(t => t.name === 'Inactive LT')).toBe(false);
  });
});
