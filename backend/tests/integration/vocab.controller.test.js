// Integration tests for controllers/vocab.controller.js (routes/vocab.js):
// public/premium student surface (listUnits, getUnit) and the teacherOnly
// admin CRUD surface (units + words), mirroring the conventions in
// vocabularyLesson.test.js (same teacherOnly middleware, same "teacher
// can't DELETE" rule) and reading.test.js (24h-trial premium gate).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createVocabUnit } = require('../factories/contentFactory');

describe('GET /api/vocab/units', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/vocab/units');
    expect(res.status).toBe(401);
  });

  test('returns the active unit list for any authenticated user (not premium-gated)', async () => {
    await createVocabUnit({ unitNumber: 1, title: 'Unit One' });
    await createVocabUnit({ unitNumber: 2, title: 'Unit Two', isActive: false });
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app).get('/api/vocab/units').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    // bare array, no {success} wrapper — see the controller's own comment
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.map(u => u.unitNumber)).toEqual([1]);
  });
});

describe('GET /api/vocab/unit/:number (premium gate)', () => {
  test('a free-plan student whose 24h trial has expired is blocked with 403 PLAN_REQUIRED', async () => {
    await createVocabUnit({ unitNumber: 5 });
    const user = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const token = signTokenFor(user);
    const res = await request(app).get('/api/vocab/unit/5').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a premium student gets the full unit content', async () => {
    await createVocabUnit({ unitNumber: 7, title: 'Premium Unit', words: [{ word: 'apple', meaning: 'táo' }] });
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app).get('/api/vocab/unit/7').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Premium Unit');
    expect(res.body.words).toHaveLength(1);
  });

  test('returns 404 for a nonexistent unit number', async () => {
    const user = await createPremiumStudent();
    const token = signTokenFor(user);
    const res = await request(app).get('/api/vocab/unit/999999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Unit not found');
  });
});

describe('Admin routes — teacherOnly gate', () => {
  test('a student is rejected (403) from admin routes', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    expect((await request(app).get('/api/vocab/admin/units').set('Authorization', `Bearer ${token}`)).status).toBe(403);
    expect((await request(app).post('/api/vocab/admin/units').set('Authorization', `Bearer ${token}`).send({ unitNumber: 1, title: 'X' })).status).toBe(403);
  });

  test('a teacher can create/edit but gets 403 attempting to delete (mirrors routes/vocabularyLesson.js)', async () => {
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);

    const createRes = await request(app)
      .post('/api/vocab/admin/units')
      .set('Authorization', `Bearer ${token}`)
      .send({ unitNumber: 20, title: 'Teacher Unit' });
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);

    const delRes = await request(app)
      .delete(`/api/vocab/admin/units/${createRes.body.unit._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(403);
  });

  test('an admin can delete a unit', async () => {
    const unit = await createVocabUnit({ unitNumber: 21 });
    const admin = await createAdmin();
    const res = await request(app)
      .delete(`/api/vocab/admin/units/${unit._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Admin CRUD — validation / not-found branches', () => {
  test('createUnit rejects a duplicate unitNumber (400)', async () => {
    await createVocabUnit({ unitNumber: 30 });
    const teacher = await createTeacher();
    const res = await request(app)
      .post('/api/vocab/admin/units')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ unitNumber: 30, title: 'Dup' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('updateUnit returns 404 for a nonexistent unit', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .put('/api/vocab/admin/units/000000000000000000000000')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ title: 'New title' });
    expect(res.status).toBe(404);
  });

  test('getAdminUnit returns the full unit (including words) for a teacher', async () => {
    const unit = await createVocabUnit({ unitNumber: 31, words: [{ word: 'cat', meaning: 'mèo' }] });
    const teacher = await createTeacher();
    const res = await request(app)
      .get(`/api/vocab/admin/units/${unit._id}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.unit.words).toHaveLength(1);
  });

  test('addWord: success then duplicate rejection', async () => {
    const unit = await createVocabUnit({ unitNumber: 32, words: [] });
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);

    const addRes = await request(app)
      .post(`/api/vocab/admin/units/${unit._id}/words`)
      .set('Authorization', `Bearer ${token}`)
      .send({ word: 'dog', meaning: 'chó' });
    expect(addRes.status).toBe(201);
    expect(addRes.body.wordCount).toBe(1);

    const dupRes = await request(app)
      .post(`/api/vocab/admin/units/${unit._id}/words`)
      .set('Authorization', `Bearer ${token}`)
      .send({ word: 'Dog', meaning: 'chó 2' });
    expect(dupRes.status).toBe(200);
    expect(dupRes.body.success).toBe(false);
  });

  test('updateWord returns 400 for a bad index', async () => {
    const unit = await createVocabUnit({ unitNumber: 33, words: [{ word: 'fish', meaning: 'cá' }] });
    const teacher = await createTeacher();
    const res = await request(app)
      .put(`/api/vocab/admin/units/${unit._id}/words/9`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ meaning: 'new meaning' });
    expect(res.status).toBe(400);
  });

  test('deleteWord returns 404 for a nonexistent unit', async () => {
    // DELETE is forbidden for teacher (teacherOnly middleware) — use admin.
    const admin = await createAdmin();
    const res = await request(app)
      .delete('/api/vocab/admin/units/000000000000000000000000/words/0')
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(404);
  });

  test('bulkAddWords merges new words and reports wordCount', async () => {
    const unit = await createVocabUnit({ unitNumber: 34, words: [{ word: 'one', meaning: '1' }] });
    const teacher = await createTeacher();
    const res = await request(app)
      .post(`/api/vocab/admin/units/${unit._id}/words/bulk`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ words: [{ word: 'two', meaning: '2' }, { word: 'three', meaning: '3' }] });
    expect(res.status).toBe(200);
    expect(res.body.wordCount).toBe(3);
  });

  test('bulkAddWords rejects an empty word list (400)', async () => {
    const unit = await createVocabUnit({ unitNumber: 35 });
    const teacher = await createTeacher();
    const res = await request(app)
      .post(`/api/vocab/admin/units/${unit._id}/words/bulk`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ words: [] });
    expect(res.status).toBe(400);
  });

  test('splitUnit reports too_small (400) when the unit does not exceed chunkSize', async () => {
    const unit = await createVocabUnit({ unitNumber: 36, words: [{ word: 'a', meaning: '1' }] });
    const teacher = await createTeacher();
    const res = await request(app)
      .post(`/api/vocab/admin/units/${unit._id}/split`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ chunkSize: 100 });
    expect(res.status).toBe(400);
  });

  test('reorderUnits rejects a non-array body (400)', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .patch('/api/vocab/admin/units/reorder')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ notAnArray: true });
    expect(res.status).toBe(400);
  });

  test('reorderUnits reassigns unitNumber/sortOrder by array position', async () => {
    const a = await createVocabUnit({ unitNumber: 40 });
    const b = await createVocabUnit({ unitNumber: 41 });
    const teacher = await createTeacher();
    const res = await request(app)
      .patch('/api/vocab/admin/units/reorder')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send([{ _id: String(b._id) }, { _id: String(a._id) }]);
    expect(res.status).toBe(200);

    const listRes = await request(app)
      .get('/api/vocab/admin/units')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    const bRow = listRes.body.units.find(u => u._id === String(b._id));
    const aRow = listRes.body.units.find(u => u._id === String(a._id));
    expect(bRow.unitNumber).toBe(1);
    expect(aRow.unitNumber).toBe(2);
  });

  test('importUnits creates a new unit from an array payload', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post('/api/vocab/admin/import')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send([{ unitNumber: 50, title: 'Imported Unit', words: [{ word: 'imported', meaning: 'nhập' }] }]);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('1 tạo mới');
  });
});
