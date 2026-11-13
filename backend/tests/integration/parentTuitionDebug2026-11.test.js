// Phụ huynh + Học phí debug pass (2026-11-14).
jest.mock('../../services/emailService');

const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const TuitionFee = require('../../models/TuitionFee');
const TuitionSettings = require('../../models/TuitionSettings');
const Message = require('../../models/Message');
const ParentLink = require('../../models/ParentLink');
const SpeakingAttempt = require('../../models/SpeakingAttempt');
const { createStudent, createAdmin, createUser, signTokenFor } = require('../factories/userFactory');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

describe('student "Đã chuyển khoản"', () => {
  test('a second press does not message the admins again', async () => {
    await createAdmin();
    const s = await createStudent();
    const fee = await TuitionFee.create({ studentId: s._id, feeType: 'monthly', month: 5, year: 2026, amount: 1000000 });
    const r = await Promise.all([1, 2].map(() => request(app).post(`/api/tuition/${fee._id}/notify`).set(auth(s))));
    r.forEach((x) => expect(x.status).toBe(200));
    await request(app).post(`/api/tuition/${fee._id}/notify`).set(auth(s));
    expect(await Message.countDocuments({ fromId: s._id })).toBe(1);
  });

  test('a malformed fee id is 404, not 500', async () => {
    const s = await createStudent();
    expect((await request(app).post('/api/tuition/abc/notify').set(auth(s))).status).toBe(404);
  });
});

describe('admin fees', () => {
  test('create refuses a monthly fee without a month, a negative amount, a nameless course or an unknown student', async () => {
    const a = await createAdmin();
    const s = await createStudent();
    const post = (body) => request(app).post('/api/tuition').set(auth(a)).send({ studentId: s._id, ...body });
    expect((await post({ feeType: 'monthly', amount: 100 })).status).toBe(400);
    expect((await post({ feeType: 'monthly', month: 5, year: 2026, amount: -5 })).status).toBe(400);
    expect((await post({ feeType: 'course', courseName: ' ', amount: 100 })).status).toBe(400);
    expect((await post({ feeType: 'monthly', month: 5, year: 2026, amount: 100, studentId: new mongoose.Types.ObjectId() })).status).toBe(400);
    expect(await TuitionFee.countDocuments({})).toBe(0);
    expect((await post({ feeType: 'monthly', month: 5, year: 2026, amount: 100 })).status).toBe(201);
  });

  test('update: moving onto a taken month is a 400; "true" marks paid and confirms to the student', async () => {
    const a = await createAdmin();
    const s = await createStudent();
    await TuitionFee.create({ studentId: s._id, feeType: 'monthly', month: 5, year: 2026, amount: 100 });
    const f6 = await TuitionFee.create({ studentId: s._id, feeType: 'monthly', month: 6, year: 2026, amount: 100 });
    expect((await request(app).put(`/api/tuition/${f6._id}`).set(auth(a)).send({ month: 5 })).status).toBe(400);
    expect((await request(app).put(`/api/tuition/${f6._id}`).set(auth(a)).send({ month: 13 })).status).toBe(400);
    const paid = await request(app).put(`/api/tuition/${f6._id}`).set(auth(a)).send({ isPaid: 'true' });
    expect(paid.status).toBe(200);
    expect(paid.body.fee.isPaid).toBe(true);
    expect(await Message.countDocuments({ toId: s._id, subject: /Đã xác nhận thanh toán/ })).toBe(1);
  });

  test('switching a fee to a course clears its month/year', async () => {
    const a = await createAdmin();
    const s = await createStudent();
    const f = await TuitionFee.create({ studentId: s._id, feeType: 'monthly', month: 7, year: 2026, amount: 100 });
    const res = await request(app).put(`/api/tuition/${f._id}`).set(auth(a)).send({ feeType: 'course', courseName: 'IELTS 6.5' });
    expect(res.status).toBe(200);
    const doc = await TuitionFee.findById(f._id).lean();
    expect(doc.month).toBeUndefined();
    expect(doc.year).toBeUndefined();
  });

  test('reminding a paid fee is refused; bulk reminders survive a deleted student', async () => {
    const a = await createAdmin();
    const s = await createStudent();
    const paid = await TuitionFee.create({ studentId: s._id, feeType: 'monthly', month: 8, year: 2026, amount: 100, isPaid: true });
    expect((await request(app).post(`/api/tuition/${paid._id}/remind`).set(auth(a)).send({})).status).toBe(400);

    await TuitionFee.create({ studentId: new mongoose.Types.ObjectId(), feeType: 'monthly', month: 9, year: 2026, amount: 100 });
    await TuitionFee.create({ studentId: s._id, feeType: 'monthly', month: 9, year: 2026, amount: 100 });
    const bulk = await request(app).post('/api/tuition/remind-bulk').set(auth(a)).send({ month: 9, year: 2026 });
    expect(bulk.status).toBe(200);
    expect(bulk.body.sent).toBe(1);
  });

  test('settings: auto-remind day stays within 1–28; junk list paging is clamped', async () => {
    const a = await createAdmin();
    await request(app).put('/api/tuition/settings').set(auth(a)).send({ autoRemindDay: 31, defaultMonthlyFee: 'abc' });
    const s = await TuitionSettings.getSingleton();
    expect(s.autoRemindDay).toBe(28);
    expect(Number.isFinite(s.defaultMonthlyFee)).toBe(true);
    expect((await request(app).get('/api/tuition?page=abc&limit=0&studentId=zzz').set(auth(a))).status).toBe(200);
  });
});

describe('parent view — speaking scores', () => {
  test("shows the teacher's band + comment once reviewed", async () => {
    const s = await createStudent();
    const p = await createUser({ role: 'parent', username: '0912345678' });
    await ParentLink.create({ parentId: p._id, studentId: s._id, relation: 'mother' });
    await SpeakingAttempt.create({
      userId: s._id, part: 2, topic: 'Travel', question: 'Q', transcript: 't', status: 'analyzed',
      aiFeedback: { overallBand: 5.5 },
      teacherReview: { band: 6, note: 'Phát âm tốt hơn rồi', reviewedAt: new Date() },
    });
    const res = await request(app).get(`/api/parent/children/${s._id}/scores`).set(auth(p));
    expect(res.status).toBe(200);
    expect(res.body.speaking[0].teacherBand).toBe(6);
    expect(res.body.speaking[0].teacherNote).toBe('Phát âm tốt hơn rồi');
  });
});
