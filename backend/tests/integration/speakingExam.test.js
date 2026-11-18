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

describe('copy a week to the next one', () => {
  // Monday of the week after next, so every source slot is in the future.
  const futureMonday = () => {
    const key = vnDay(14);
    const dow = (new Date(`${key}T00:00:00Z`).getUTCDay() + 6) % 7;
    return vnDay(14 - dow);
  };
  const plus = (key, n) => new Date(Date.parse(`${key}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
  const copy = (t, classId, fromWeek) => request(app).post(`/api/classes/${classId}/speaking-exam/copy-week`).set(auth(t)).send({ fromWeek });

  test('slots move +7 days with their settings; bookings and results stay behind', async () => {
    const t = await createTeacher();
    const cls = await makeClass(t);
    const other = await makeClass(t, 'Lớp B');
    const s = await createStudent();
    await addStudent(t, cls._id, s);
    const mon = futureMonday();
    await openSlots(t, cls._id, { ranges: [{ date: plus(mon, 2), from: '14:00', to: '14:50' }], note: 'Mang tai nghe', classIds: [other._id] });
    const booked = await SpeakingExamSlot.findOne({ classIds: cls._id, startTime: '14:00' });
    await request(app).post(`/api/classes/my/speaking-exam/${booked._id}/book`).set(auth(s)).send({ mode: 'online' });

    // any day of the week identifies it
    const res = await copy(t, cls._id, plus(mon, 4));
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ fromWeek: mon, toWeek: plus(mon, 7), sourceCount: 2, created: 2, skippedOverlap: 0 });

    const copies = await SpeakingExamSlot.find({ dayKey: plus(mon, 9) }).sort({ startsAt: 1 }).lean();
    expect(copies.map((c) => c.startTime)).toEqual(['14:00', '14:25']);
    expect(copies[0]).toMatchObject({ studentId: null, classId: null, mode: null, result: '', note: 'Mang tai nghe', meetLink: 'https://meet.google.com/abc-defg-hij', address: '12 Nguyễn Huệ, Q1' });
    expect(copies[0].classIds.map(String).sort()).toEqual([String(cls._id), String(other._id)].sort());
    expect(copies[0].startsAt.toISOString()).toBe(new Date(`${plus(mon, 9)}T14:00:00+07:00`).toISOString());
  });

  test('copying twice adds nothing; an empty week is refused', async () => {
    const t = await createTeacher();
    const cls = await makeClass(t);
    const mon = futureMonday();
    await openSlots(t, cls._id, { ranges: [{ date: mon, from: '09:00', to: '09:50' }] });
    expect((await copy(t, cls._id, mon)).body.created).toBe(2);
    const again = await copy(t, cls._id, mon);
    expect(again.body).toMatchObject({ created: 0, skippedOverlap: 2 });
    expect(await SpeakingExamSlot.countDocuments({ classIds: cls._id })).toBe(4);
    expect((await copy(t, cls._id, plus(mon, 28))).status).toBe(400);
    expect((await copy(t, cls._id, '2026-02-31')).status).toBe(400);
  });

  test('a target already in the past is skipped; another teacher is refused', async () => {
    const t = await createTeacher();
    const cls = await makeClass(t);
    const day = vnDay(-21);
    await SpeakingExamSlot.create({
      teacherId: t._id, classIds: [cls._id], dayKey: day, startTime: '09:00', endTime: '09:25',
      startsAt: new Date(`${day}T09:00:00+07:00`), endsAt: new Date(`${day}T09:25:00+07:00`),
    });
    expect((await copy(t, cls._id, day)).body).toMatchObject({ created: 0, skippedPast: 1 });
    expect((await copy(await createTeacher(), cls._id, day)).status).toBe(403);
  });

  test('clear-week removes only the open future slots of that week', async () => {
    const t = await createTeacher();
    const cls = await makeClass(t);
    const s = await createStudent();
    await addStudent(t, cls._id, s);
    const mon = futureMonday();
    await openSlots(t, cls._id, { ranges: [{ date: mon, from: '09:00', to: '10:15' }, { date: plus(mon, 7), from: '09:00', to: '09:25' }] });
    const booked = await SpeakingExamSlot.findOne({ dayKey: mon, startTime: '09:00' });
    await request(app).post(`/api/classes/my/speaking-exam/${booked._id}/book`).set(auth(s)).send({ mode: 'online' });
    const res = await request(app).post(`/api/classes/${cls._id}/speaking-exam/clear-week`).set(auth(t)).send({ week: plus(mon, 3) });
    expect(res.body).toMatchObject({ success: true, week: mon, deleted: 2 });
    const left = await SpeakingExamSlot.find({ classIds: cls._id }).lean();
    expect(left.map((x) => `${x.dayKey} ${x.startTime}`).sort()).toEqual([`${mon} 09:00`, `${plus(mon, 7)} 09:00`]);
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

  test('swapping moves the booking in one step and frees the old slot', async () => {
    const { s } = await setup();
    const slots = (await request(app).get('/api/classes/my/speaking-exam').set(auth(s))).body.classes[0].openSlots;
    await request(app).post(`/api/classes/my/speaking-exam/${slots[0]._id}/book`).set(auth(s)).send({ mode: 'online' });
    const swap = await request(app).post(`/api/classes/my/speaking-exam/${slots[1]._id}/book`).set(auth(s)).send({ mode: 'offline', replaceBooking: true });
    expect(swap.status).toBe(200);
    expect(swap.body.booking.startTime).toBe('14:25');
    expect((await SpeakingExamSlot.findById(slots[0]._id)).studentId).toBeNull();
    expect(String((await SpeakingExamSlot.findById(slots[1]._id)).studentId)).toBe(String(s._id));
  });

  test('a failed swap keeps the booking the student already had', async () => {
    const { t, cls, s } = await setup();
    const s2 = await createStudent();
    await addStudent(t, cls._id, s2);
    const slots = (await request(app).get('/api/classes/my/speaking-exam').set(auth(s))).body.classes[0].openSlots;
    await request(app).post(`/api/classes/my/speaking-exam/${slots[0]._id}/book`).set(auth(s)).send({ mode: 'online' });
    await request(app).post(`/api/classes/my/speaking-exam/${slots[1]._id}/book`).set(auth(s2)).send({ mode: 'online' });
    const swap = await request(app).post(`/api/classes/my/speaking-exam/${slots[1]._id}/book`).set(auth(s)).send({ mode: 'online', replaceBooking: true });
    expect(swap.status).toBe(409);
    expect(String((await SpeakingExamSlot.findById(slots[0]._id)).studentId)).toBe(String(s._id));
  });

  test('a booking inside the 2-hour lock cannot be swapped away', async () => {
    const { s, cls } = await setup();
    const slots = (await request(app).get('/api/classes/my/speaking-exam').set(auth(s))).body.classes[0].openSlots;
    await request(app).post(`/api/classes/my/speaking-exam/${slots[0]._id}/book`).set(auth(s)).send({ mode: 'online' });
    const soon = new Date(Date.now() + 3600e3);
    await SpeakingExamSlot.updateOne({ _id: slots[0]._id }, { $set: { startsAt: soon, endsAt: new Date(soon.getTime() + 25 * 60e3) } });
    const swap = await request(app).post(`/api/classes/my/speaking-exam/${slots[1]._id}/book`).set(auth(s)).send({ mode: 'online', replaceBooking: true });
    expect(swap.status).toBe(400);
    expect(String((await SpeakingExamSlot.findOne({ _id: slots[0]._id, classIds: cls._id })).studentId)).toBe(String(s._id));
    expect((await SpeakingExamSlot.findById(slots[1]._id)).studentId).toBeNull();
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
