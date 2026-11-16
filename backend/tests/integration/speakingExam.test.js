// Integration tests for routes/speakingExam.js — 🎤 Đăng kí thi Speaking.
// Teacher opens free windows split into 25' slots (15' thi + 10' feedback);
// a class student books ONE slot online/offline; Meet link / address only
// reach the student who booked.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const SpeakingExamSlot = require('../../models/SpeakingExamSlot');
const Message = require('../../models/Message');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
// Vietnam calendar day N days from now.
const vnDay = (n) => new Date(Date.now() + 7 * 3600e3 + n * 864e5).toISOString().slice(0, 10);

async function makeClass(teacher, name = 'Lớp Speaking') {
  const res = await request(app).post('/api/classes').set(auth(teacher)).send({ name, totalSessions: 20 });
  return res.body.class;
}
async function addStudent(teacher, classId, student) {
  await request(app).post(`/api/classes/${classId}/students`).set(auth(teacher)).send({ email: student.email });
}
async function openSlots(teacher, classId, body = {}) {
  return request(app).post(`/api/classes/${classId}/speaking-exam`).set(auth(teacher)).send({
    ranges: [{ date: vnDay(3), from: '14:00', to: '15:20' }],
    modes: ['online', 'offline'],
    meetLink: 'meet.google.com/abc-defg-hij',
    address: '12 Nguyễn Huệ, Q1',
    ...body,
  });
}

describe('teacher creates slots', () => {
  test('a 14:00–15:20 window becomes 3 × 25-minute slots', async () => {
    const t = await createTeacher();
    const cls = await makeClass(t);
    const res = await openSlots(t, cls._id);
    expect(res.status).toBe(201);
    expect(res.body.created).toBe(3);
    const list = await request(app).get(`/api/classes/${cls._id}/speaking-exam`).set(auth(t));
    expect(list.body.slots.map((s) => `${s.startTime}-${s.endTime}`)).toEqual(['14:00-14:25', '14:25-14:50', '14:50-15:15']);
    expect(list.body.slots[0].meetLink).toBe('https://meet.google.com/abc-defg-hij');
  });

  test('overlapping windows are skipped, short windows / offline without address rejected', async () => {
    const t = await createTeacher();
    const cls = await makeClass(t);
    await openSlots(t, cls._id);
    const again = await openSlots(t, cls._id, { ranges: [{ date: vnDay(3), from: '14:30', to: '15:45' }] });
    expect(again.body.created).toBe(1); // only 15:15–15:40 is free
    expect(again.body.skippedOverlap).toBe(2);
    expect((await openSlots(t, cls._id, { ranges: [{ date: vnDay(4), from: '09:00', to: '09:20' }] })).status).toBe(400);
    expect((await openSlots(t, cls._id, { modes: ['offline'], address: '' })).status).toBe(400);
  });

  test('another teacher cannot touch the class slots', async () => {
    const t = await createTeacher();
    const other = await createTeacher();
    const cls = await makeClass(t);
    expect((await request(app).get(`/api/classes/${cls._id}/speaking-exam`).set(auth(other))).status).toBe(403);
    expect((await openSlots(other, cls._id)).status).toBe(403);
  });
});

describe('student booking', () => {
  async function setup() {
    const t = await createTeacher();
    const cls = await makeClass(t);
    const s = await createStudent();
    await addStudent(t, cls._id, s);
    await openSlots(t, cls._id);
    return { t, cls, s };
  }

  test('open slots hide the Meet link / address; booking reveals the chosen one', async () => {
    const { s } = await setup();
    const ov = await request(app).get('/api/classes/my/speaking-exam').set(auth(s));
    expect(ov.status).toBe(200);
    const c = ov.body.classes[0];
    expect(c.openSlots).toHaveLength(3);
    expect(c.openSlots[0].meetLink).toBeUndefined();
    expect(c.openSlots[0].address).toBeUndefined();

    const book = await request(app).post(`/api/classes/my/speaking-exam/${c.openSlots[0]._id}/book`).set(auth(s)).send({ mode: 'offline' });
    expect(book.status).toBe(200);
    expect(book.body.booking.address).toBe('12 Nguyễn Huệ, Q1');
    expect(book.body.booking.meetLink).toBe('');

    const ov2 = await request(app).get('/api/classes/my/speaking-exam').set(auth(s));
    expect(ov2.body.classes[0].booking.startTime).toBe('14:00');
    expect(ov2.body.classes[0].openSlots).toHaveLength(2);
  });

  test('one booking per class; a taken slot cannot be booked by a classmate', async () => {
    const { t, cls, s } = await setup();
    const s2 = await createStudent();
    await addStudent(t, cls._id, s2);
    const slots = (await request(app).get('/api/classes/my/speaking-exam').set(auth(s))).body.classes[0].openSlots;
    expect((await request(app).post(`/api/classes/my/speaking-exam/${slots[0]._id}/book`).set(auth(s)).send({ mode: 'online' })).status).toBe(200);
    expect((await request(app).post(`/api/classes/my/speaking-exam/${slots[1]._id}/book`).set(auth(s)).send({ mode: 'online' })).status).toBe(409);
    expect((await request(app).post(`/api/classes/my/speaking-exam/${slots[0]._id}/book`).set(auth(s2)).send({ mode: 'online' })).status).toBe(409);
  });

  test('a student outside the class cannot book; mode must be allowed', async () => {
    const { t, cls } = await setup();
    const outsider = await createStudent();
    const slot = await SpeakingExamSlot.findOne({ classIds: cls._id });
    expect((await request(app).post(`/api/classes/my/speaking-exam/${slot._id}/book`).set(auth(outsider)).send({ mode: 'online' })).status).toBe(403);
    await request(app).put(`/api/classes/${cls._id}/speaking-exam/${slot._id}`).set(auth(t)).send({ modes: ['online'] });
    const s = await createStudent();
    await addStudent(t, cls._id, s);
    expect((await request(app).post(`/api/classes/my/speaking-exam/${slot._id}/book`).set(auth(s)).send({ mode: 'offline' })).status).toBe(400);
  });

  test('student can cancel and rebook; slots < 2h away are locked', async () => {
    const { s, cls } = await setup();
    const slots = (await request(app).get('/api/classes/my/speaking-exam').set(auth(s))).body.classes[0].openSlots;
    await request(app).post(`/api/classes/my/speaking-exam/${slots[0]._id}/book`).set(auth(s)).send({ mode: 'online' });
    expect((await request(app).post(`/api/classes/my/speaking-exam/${slots[0]._id}/cancel`).set(auth(s))).status).toBe(200);
    expect((await request(app).post(`/api/classes/my/speaking-exam/${slots[1]._id}/book`).set(auth(s)).send({ mode: 'online' })).status).toBe(200);

    const soon = new Date(Date.now() + 3600e3);
    const near = await SpeakingExamSlot.create({
      teacherId: (await SpeakingExamSlot.findById(slots[0]._id)).teacherId, classIds: [cls._id],
      dayKey: vnDay(0), startTime: '00:00', endTime: '00:25', startsAt: soon, endsAt: new Date(soon.getTime() + 25 * 60e3),
    });
    expect((await request(app).post(`/api/classes/my/speaking-exam/${near._id}/book`).set(auth(s)).send({ mode: 'online' })).status).toBe(400);
  });

  test('teacher cancelling a booking frees the slot and messages the student; result is shown to the student', async () => {
    const { t, cls, s } = await setup();
    const slots = (await request(app).get('/api/classes/my/speaking-exam').set(auth(s))).body.classes[0].openSlots;
    await request(app).post(`/api/classes/my/speaking-exam/${slots[0]._id}/book`).set(auth(s)).send({ mode: 'online' });
    const cancel = await request(app).put(`/api/classes/${cls._id}/speaking-exam/${slots[0]._id}`).set(auth(t)).send({ cancelBooking: true, reason: 'GV bận' });
    expect(cancel.status).toBe(200);
    expect(await Message.countDocuments({ toId: s._id, mustRead: true })).toBe(1);
    expect((await SpeakingExamSlot.findById(slots[0]._id)).studentId).toBeNull();

    await request(app).post(`/api/classes/my/speaking-exam/${slots[1]._id}/book`).set(auth(s)).send({ mode: 'online' });
    const graded = await request(app).put(`/api/classes/${cls._id}/speaking-exam/${slots[1]._id}`).set(auth(t))
      .send({ result: 'done', band: 6.5, feedbackNote: 'Fluency tốt, cần thêm từ vựng.' });
    expect(graded.status).toBe(200);
    const ov = await request(app).get('/api/classes/my/speaking-exam').set(auth(s));
    expect(ov.body.classes[0].booking).toBeNull();
    expect(ov.body.classes[0].history[0]).toMatchObject({ result: 'done', band: 6.5 });
    expect((await request(app).put(`/api/classes/${cls._id}/speaking-exam/${slots[1]._id}`).set(auth(t)).send({ band: 6.3 })).status).toBe(400);
  });
});
