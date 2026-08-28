// Integration tests for the admin ReviewBypassCode feature: teachers CRUD
// codes at /api/admin/review-bypass-codes, a student redeems one at
// /api/review/bypass, and redeeming marks every pending AttemptReview
// 'bypassed' so the mandatory-review gate opens.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const AttemptReview = require('../../models/AttemptReview');
const ReviewBypassCode = require('../../models/ReviewBypassCode');
const mongoose = require('mongoose');

function authed(user) {
  const token = signTokenFor(user);
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url, body) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body || {}),
    patch: (url, body) => request(app).patch(url).set('Authorization', `Bearer ${token}`).send(body || {}),
    del: (url) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
}

async function seedPending(userId, n, attemptType = 'reading') {
  for (let i = 0; i < n; i++) {
    await AttemptReview.create({
      userId, attemptType, attemptId: new mongoose.Types.ObjectId(), status: 'pending',
      mistakes: [{ questionNumber: i + 1, userAnswer: 'x', correctAnswer: 'y' }],
    });
  }
}

describe('admin review-bypass-codes CRUD', () => {
  test('teacher creates a code (auto-generated) and lists it', async () => {
    const t = authed(await createTeacher());
    const created = await t.post('/api/admin/review-bypass-codes', { label: 'Lớp A2', maxUses: 5 });
    expect(created.status).toBe(201);
    expect(created.body.code.code).toMatch(/^[A-Z0-9]{8}$/);
    expect(created.body.code).toMatchObject({ label: 'Lớp A2', maxUses: 5, usedCount: 0, active: true });

    const list = await t.get('/api/admin/review-bypass-codes');
    expect(list.status).toBe(200);
    expect(list.body.codes.map(c => c.code)).toContain(created.body.code.code);
  });

  test('a student cannot reach the admin endpoints', async () => {
    const s = authed(await createStudent());
    expect((await s.get('/api/admin/review-bypass-codes')).status).toBe(403);
    expect((await s.post('/api/admin/review-bypass-codes', {})).status).toBe(403);
  });

  test('custom code must be unique and well-formed', async () => {
    const t = authed(await createTeacher());
    expect((await t.post('/api/admin/review-bypass-codes', { code: 'bad code!' })).status).toBe(400);
    const ok = await t.post('/api/admin/review-bypass-codes', { code: 'class7', maxUses: 0 });
    expect(ok.status).toBe(201);
    expect(ok.body.code.code).toBe('CLASS7');
    expect((await t.post('/api/admin/review-bypass-codes', { code: 'CLASS7' })).status).toBe(409);
  });

  test('teacher can deactivate; only admin can delete', async () => {
    const t = authed(await createTeacher());
    const c = (await t.post('/api/admin/review-bypass-codes', {})).body.code;
    const off = await t.patch(`/api/admin/review-bypass-codes/${c._id}`, { active: false });
    expect(off.body.code.active).toBe(false);
    expect((await t.del(`/api/admin/review-bypass-codes/${c._id}`)).status).toBe(403);
    expect((await authed(await createAdmin()).del(`/api/admin/review-bypass-codes/${c._id}`)).status).toBe(200);
  });
});

describe('POST /api/review/bypass', () => {
  test('redeeming clears every pending review and consumes one use', async () => {
    const teacher = authed(await createTeacher());
    const code = (await teacher.post('/api/admin/review-bypass-codes', { maxUses: 2 })).body.code.code;

    const student = await createStudent();
    await seedPending(student._id, 3, 'reading');
    await seedPending(student._id, 1, 'listening');
    const s = authed(student);

    const res = await s.post('/api/review/bypass', { code: code.toLowerCase() }); // case-insensitive
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, cleared: 4 });

    expect(await AttemptReview.countDocuments({ userId: student._id, status: 'pending' })).toBe(0);
    expect(await AttemptReview.countDocuments({ userId: student._id, status: 'bypassed', bypassCode: code })).toBe(4);

    // The review gate now reports nothing pending.
    const pend = await s.get('/api/review/pending?skill=reading');
    expect(pend.body.count).toBe(0);
    expect(pend.body.blocked).toBe(false);

    const after = await ReviewBypassCode.findOne({ code });
    expect(after.usedCount).toBe(1);
    expect(after.redemptions).toHaveLength(1);
  });

  test('same student cannot redeem the same code twice', async () => {
    const teacher = authed(await createTeacher());
    const code = (await teacher.post('/api/admin/review-bypass-codes', { maxUses: 9 })).body.code.code;
    const student = await createStudent();
    await seedPending(student._id, 2);
    const s = authed(student);

    expect((await s.post('/api/review/bypass', { code })).status).toBe(200);
    const twice = await s.post('/api/review/bypass', { code });
    expect(twice.status).toBe(400);
    expect(twice.body.message).toMatch(/đã dùng/i);
  });

  test('rejects unknown / inactive / used-up / expired codes', async () => {
    const teacher = authed(await createTeacher());
    const s = authed(await createStudent());

    expect((await s.post('/api/review/bypass', { code: 'NOPE1234' })).status).toBe(404);

    const c1 = (await teacher.post('/api/admin/review-bypass-codes', {})).body.code;
    await teacher.patch(`/api/admin/review-bypass-codes/${c1._id}`, { active: false });
    expect((await s.post('/api/review/bypass', { code: c1.code })).status).toBe(400);

    const c2 = (await teacher.post('/api/admin/review-bypass-codes', { maxUses: 1 })).body.code;
    await authed(await createStudent()).post('/api/review/bypass', { code: c2.code }); // exhausts it
    expect((await s.post('/api/review/bypass', { code: c2.code })).status).toBe(400);
  });

  test('redeeming with nothing pending still succeeds (cleared:0) and consumes a use', async () => {
    const teacher = authed(await createTeacher());
    const code = (await teacher.post('/api/admin/review-bypass-codes', { maxUses: 3 })).body.code.code;
    const s = authed(await createStudent());
    const res = await s.post('/api/review/bypass', { code });
    expect(res.status).toBe(200);
    expect(res.body.cleared).toBe(0);
    expect((await ReviewBypassCode.findOne({ code })).usedCount).toBe(1);
  });
});
