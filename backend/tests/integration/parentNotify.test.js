// Phụ huynh alerts — services/parentNotifyService.js and its triggers:
// absence on the teacher's attendance save, the daily sweep (overdue
// homework, tuition due), staff tuition reminders, and the parent bell API.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, createUser, signTokenFor } = require('../factories/userFactory');
const { createClassGroup, enrollStudent, createSession, createAssignment } = require('../factories/classFactory');
const ParentLink = require('../../models/ParentLink');
const ParentNotification = require('../../models/ParentNotification');
const TuitionFee = require('../../models/TuitionFee');
const emailService = require('../../services/emailService');
const { runSweep } = require('../../cron/parentNotifySweep');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const DAY = 864e5;

let emailSpy;
beforeEach(() => { emailSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValue(true); });
afterEach(() => emailSpy.mockRestore());

async function family({ parentEmail } = {}) {
  const teacher = await createTeacher();
  const student = await createStudent({ firstName: 'Minh', lastName: 'An' });
  const parent = await createUser({ role: 'parent', email: parentEmail || `p${Date.now()}${Math.random()}@parent.invalid` });
  await ParentLink.create({ parentId: parent._id, studentId: student._id, relation: 'mother' });
  const cls = await createClassGroup({ teacher, name: 'IELTS 6.5 K12' });
  const enrollment = await enrollStudent(cls, student);
  return { teacher, student, parent, cls, enrollment };
}

function mark(teacher, cls, session, enrollment, status) {
  return request(app).put(`/api/classes/${cls._id}/sessions/${session._id}/attendance`).set(auth(teacher))
    .send({ marks: [{ enrollmentId: enrollment._id, status }] });
}

// A date in the current VN month on the given day-of-month, at noon VN.
function vnDay(day) {
  const now = new Date(Date.now() + 7 * 3600e3);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day, 5));
}

describe('absence alert on attendance save', () => {
  test('absent → one alert; re-save does not duplicate; excused rewrites it; present retracts it', async () => {
    const { teacher, student, parent, cls, enrollment } = await family();
    const session = await createSession(cls, { daysAgo: 1, status: 'scheduled' });

    expect((await mark(teacher, cls, session, enrollment, 'absent')).status).toBe(200);
    let rows = await ParentNotification.find({ parentId: parent._id }).lean();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: 'absence', studentId: student._id });
    expect(rows[0].title).toContain('Minh An vắng không phép');
    expect(rows[0].body).toContain('IELTS 6.5 K12');
    expect(rows[0].body).toMatch(/Số buổi nghỉ tính đến nay: 1/);

    await mark(teacher, cls, session, enrollment, 'absent');
    expect(await ParentNotification.countDocuments({ parentId: parent._id })).toBe(1);

    await mark(teacher, cls, session, enrollment, 'excused');
    rows = await ParentNotification.find({ parentId: parent._id }).lean();
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toContain('vắng có phép');

    await mark(teacher, cls, session, enrollment, 'present');
    expect(await ParentNotification.countDocuments({ parentId: parent._id })).toBe(0);
  });

  test('present / late alone never alert; a student without a parent never alerts', async () => {
    const { teacher, parent, cls, enrollment } = await family();
    const s1 = await createSession(cls, { daysAgo: 2, status: 'scheduled' });
    await mark(teacher, cls, s1, enrollment, 'late');
    expect(await ParentNotification.countDocuments({ parentId: parent._id })).toBe(0);

    const orphan = await createStudent();
    const e2 = await enrollStudent(cls, orphan);
    await mark(teacher, cls, s1, e2, 'absent');
    expect(await ParentNotification.countDocuments({ studentId: orphan._id })).toBe(0);
  });

  test('email only when the parent has a real email', async () => {
    const a = await family();
    await mark(a.teacher, a.cls, await createSession(a.cls, { daysAgo: 1, status: 'scheduled' }), a.enrollment, 'absent');
    expect(emailSpy).not.toHaveBeenCalled();

    const b = await family({ parentEmail: `lan${Date.now()}@gmail.com` });
    await mark(b.teacher, b.cls, await createSession(b.cls, { daysAgo: 1, status: 'scheduled' }), b.enrollment, 'absent');
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy.mock.calls[0][0]).toBe(b.parent.email);
    expect(emailSpy.mock.calls[0][2]).toContain('/phu-huynh');
  });
});

describe('daily sweep', () => {
  test('overdue homework alerts once; old overdue work is not dug up', async () => {
    const { parent, cls } = await family();
    await createAssignment(cls, { title: 'Reading C18 T2', createdAt: new Date(Date.now() - 5 * DAY), deadline: new Date(Date.now() - DAY) });
    await createAssignment(cls, { title: 'Ancient', createdAt: new Date(Date.now() - 20 * DAY), deadline: new Date(Date.now() - 10 * DAY) });
    await createAssignment(cls, { title: 'Not yet due', deadline: new Date(Date.now() + 2 * DAY) });

    await runSweep(new Date());
    let rows = await ParentNotification.find({ parentId: parent._id }).lean();
    expect(rows.map((r) => r.title)).toEqual(['Bài tập quá hạn: Reading C18 T2']);
    expect(rows[0].kind).toBe('homework_overdue');

    await runSweep(new Date());
    rows = await ParentNotification.find({ parentId: parent._id }).lean();
    expect(rows).toHaveLength(1);
  });

  test('tuition: nothing before day 8, "đến hạn" from day 8, "quá hạn" after day 10, none once reported paid', async () => {
    const { student, parent } = await family();
    const ref = vnDay(15);
    const fee = await TuitionFee.create({ studentId: student._id, feeType: 'monthly', month: ref.getUTCMonth() + 1, year: ref.getUTCFullYear(), amount: 1800000 });

    await runSweep(vnDay(5));
    expect(await ParentNotification.countDocuments({ parentId: parent._id, kind: 'tuition_due' })).toBe(0);

    await runSweep(vnDay(8));
    let rows = await ParentNotification.find({ parentId: parent._id, kind: 'tuition_due' }).lean();
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toMatch(/^Đến hạn đóng học phí/);

    await runSweep(vnDay(9));
    expect(await ParentNotification.countDocuments({ parentId: parent._id, kind: 'tuition_due' })).toBe(1);

    await runSweep(vnDay(11));
    rows = await ParentNotification.find({ parentId: parent._id, kind: 'tuition_due' }).sort({ createdAt: 1 }).lean();
    expect(rows).toHaveLength(2);
    expect(rows[1].title).toMatch(/^Học phí quá hạn/);

    await TuitionFee.updateOne({ _id: fee._id }, { studentNotified: true });
    await ParentNotification.deleteMany({});
    await runSweep(vnDay(12));
    expect(await ParentNotification.countDocuments({ parentId: parent._id })).toBe(0);
  });
});

describe('staff tuition reminder', () => {
  test('admin "Nhắc" on a fee also alerts the parent, once per day', async () => {
    const admin = await createAdmin();
    const { student, parent } = await family();
    const fee = await TuitionFee.create({ studentId: student._id, feeType: 'course', courseName: 'IELTS 6.5', amount: 5000000 });
    expect((await request(app).post(`/api/tuition/${fee._id}/remind`).set(auth(admin)).send({})).status).toBe(200);
    await request(app).post(`/api/tuition/${fee._id}/remind`).set(auth(admin)).send({});
    const rows = await ParentNotification.find({ parentId: parent._id }).lean();
    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe('tuition_reminder');
    expect(rows[0].title).toContain('5.000.000');
  });
});

describe('parent bell API', () => {
  test('list with child name + unread count; mark all read; only own notifications', async () => {
    const { teacher, parent, cls, enrollment } = await family();
    await mark(teacher, cls, await createSession(cls, { daysAgo: 1, status: 'scheduled' }), enrollment, 'absent');
    const other = await family();
    await mark(other.teacher, other.cls, await createSession(other.cls, { daysAgo: 1, status: 'scheduled' }), other.enrollment, 'absent');

    let r = await request(app).get('/api/parent/notifications').set(auth(parent));
    expect(r.status).toBe(200);
    expect(r.body.unreadCount).toBe(1);
    expect(r.body.notifications).toHaveLength(1);
    expect(r.body.notifications[0]).toMatchObject({ kind: 'absence', studentName: 'Minh An', read: false });

    expect((await request(app).post('/api/parent/notifications/read').set(auth(parent))).body.marked).toBe(1);
    r = await request(app).get('/api/parent/notifications').set(auth(parent));
    expect(r.body.unreadCount).toBe(0);
    expect(r.body.notifications[0].read).toBe(true);
    expect(await ParentNotification.countDocuments({ parentId: other.parent._id, readAt: null })).toBe(1);
  });

  test('a read absence alert is kept even if the teacher corrects the mark', async () => {
    const { teacher, parent, cls, enrollment } = await family();
    const s = await createSession(cls, { daysAgo: 1, status: 'scheduled' });
    await mark(teacher, cls, s, enrollment, 'absent');
    await request(app).post('/api/parent/notifications/read').set(auth(parent));
    await mark(teacher, cls, s, enrollment, 'present');
    expect(await ParentNotification.countDocuments({ parentId: parent._id })).toBe(1);
  });

  test('students cannot call it', async () => {
    const s = await createStudent();
    expect((await request(app).get('/api/parent/notifications').set(auth(s))).status).toBe(403);
  });
});
