// Integration tests for routes/classAttendance.js — the teacher
// class-management + attendance feature. Focus: per-teacher authorization
// scoping (teacher A must never reach teacher B's class), the attendance
// math end to end, soft-remove keeping history, and the student self-view.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const ClassEnrollment = require('../../models/ClassEnrollment');
const AttendanceRecord = require('../../models/AttendanceRecord');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const past = (days) => new Date(Date.now() - days * 864e5).toISOString();
const future = (days) => new Date(Date.now() + days * 864e5).toISOString();

async function makeClass(teacher, body = {}) {
  const res = await request(app).post('/api/classes').set(auth(teacher)).send({ name: 'Lớp Test', totalSessions: 40, ...body });
  return res.body.class;
}
async function addStudent(teacher, classId, student) {
  const res = await request(app).post(`/api/classes/${classId}/students`).set(auth(teacher)).send({ email: student.email });
  return res.body.added?.[0];
}
async function addSession(teacher, classId, body) {
  const res = await request(app).post(`/api/classes/${classId}/sessions`).set(auth(teacher)).send(body);
  return res.body.session;
}
async function mark(teacher, classId, sessionId, marks) {
  return request(app).put(`/api/classes/${classId}/sessions/${sessionId}/attendance`).set(auth(teacher)).send({ marks });
}

describe('auth gate', () => {
  test('401 without token', async () => {
    expect((await request(app).get('/api/classes')).status).toBe(401);
  });
  test('403 for a student', async () => {
    const s = await createStudent();
    expect((await request(app).get('/api/classes').set(auth(s))).status).toBe(403);
  });
});

describe('per-teacher scoping', () => {
  test('teacher A cannot see / read / edit teacher B\'s class', async () => {
    const a = await createTeacher();
    const b = await createTeacher();
    const clsB = await makeClass(b);

    const listA = await request(app).get('/api/classes').set(auth(a));
    expect(listA.body.classes.map((c) => c._id)).not.toContain(clsB._id);

    expect((await request(app).get(`/api/classes/${clsB._id}`).set(auth(a))).status).toBe(403);
    expect((await request(app).put(`/api/classes/${clsB._id}`).set(auth(a)).send({ name: 'x' })).status).toBe(403);
    expect((await request(app).get(`/api/classes/${clsB._id}/dashboard`).set(auth(a))).status).toBe(403);
    expect((await request(app).post(`/api/classes/${clsB._id}/sessions`).set(auth(a)).send({ date: past(1) })).status).toBe(403);
  });

  test('admin can read any class', async () => {
    const b = await createTeacher();
    const admin = await createAdmin();
    const clsB = await makeClass(b);
    expect((await request(app).get(`/api/classes/${clsB._id}`).set(auth(admin))).status).toBe(200);
  });
});

describe('class + policy defaults', () => {
  test('POST /api/classes seeds the documented policy defaults', async () => {
    const t = await createTeacher();
    const cls = await makeClass(t);
    expect(cls.policy).toMatchObject({
      maxAbsencesAllowed: 3,
      warnThreshold: 2,
      excusedCountsAsAbsence: true,
      lateToAbsenceRatio: 2,
      failOnExceed: true,
    });
  });
});

describe('roster', () => {
  test('add student twice → 409; soft-remove keeps attendance, re-add makes a new enrollment', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await makeClass(t);
    const enr1 = await addStudent(t, cls._id, s);
    expect(enr1).toBeTruthy();

    const dup = await request(app).post(`/api/classes/${cls._id}/students`).set(auth(t)).send({ email: s.email });
    expect(dup.status).toBe(409);

    // log one absence
    const sess = await addSession(t, cls._id, { date: past(2), status: 'held' });
    await mark(t, cls._id, sess._id, [{ enrollmentId: enr1.enrollmentId, status: 'absent' }]);
    expect(await AttendanceRecord.countDocuments({ classId: cls._id })).toBe(1);

    const rm = await request(app).delete(`/api/classes/${cls._id}/students/${enr1.enrollmentId}`).set(auth(t));
    expect(rm.status).toBe(200);
    expect(await AttendanceRecord.countDocuments({ classId: cls._id })).toBe(1); // history kept

    const enr2 = await addStudent(t, cls._id, s);
    expect(enr2.enrollmentId).not.toBe(enr1.enrollmentId);
    expect(await ClassEnrollment.countDocuments({ classId: cls._id, studentId: s._id })).toBe(2);
  });
});

describe('attendance math end to end', () => {
  async function setup() {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await makeClass(t, { policy: { maxAbsencesAllowed: 3, warnThreshold: 2 } });
    const enr = await addStudent(t, cls._id, s);
    return { t, s, cls, enr };
  }

  test('present/absent/late/excused counts + rate', async () => {
    const { t, cls, enr } = await setup();
    const s1 = await addSession(t, cls._id, { date: past(5) });
    const s2 = await addSession(t, cls._id, { date: past(4) });
    const s3 = await addSession(t, cls._id, { date: past(3) });
    const s4 = await addSession(t, cls._id, { date: past(2) });
    await mark(t, cls._id, s1._id, [{ enrollmentId: enr.enrollmentId, status: 'present' }]);
    await mark(t, cls._id, s2._id, [{ enrollmentId: enr.enrollmentId, status: 'absent' }]);
    await mark(t, cls._id, s3._id, [{ enrollmentId: enr.enrollmentId, status: 'late', lateMinutes: 20 }]);
    await mark(t, cls._id, s4._id, [{ enrollmentId: enr.enrollmentId, status: 'late' }]);

    const dash = await request(app).get(`/api/classes/${cls._id}/dashboard`).set(auth(t));
    const row = dash.body.rows[0];
    expect(row.heldSessions).toBe(4);
    expect(row.attendedCount).toBe(3);       // present + 2 late
    expect(row.absentUnexcused).toBe(1);
    expect(row.lateCount).toBe(2);
    expect(row.absenceEquivalent).toBe(2);   // 1 absent + 2*(1/2) late
    expect(row.attendanceRate).toBe(75);
    expect(row.status).toBe('warning');      // 2 >= warnThreshold
  });

  test('future session is not counted', async () => {
    const { t, cls, enr } = await setup();
    const s1 = await addSession(t, cls._id, { date: past(1) });
    await mark(t, cls._id, s1._id, [{ enrollmentId: enr.enrollmentId, status: 'present' }]);
    const s2 = await addSession(t, cls._id, { date: future(3), status: 'held' });
    const res = await mark(t, cls._id, s2._id, [{ enrollmentId: enr.enrollmentId, status: 'absent' }]);
    expect(res.status).toBe(400); // can't take attendance for a future session

    const dash = await request(app).get(`/api/classes/${cls._id}/dashboard`).set(auth(t));
    expect(dash.body.rows[0].heldSessions).toBe(1);
  });

  test('makeup present cancels the linked original absence', async () => {
    const { t, cls, enr } = await setup();
    const orig = await addSession(t, cls._id, { date: past(5) });
    await mark(t, cls._id, orig._id, [{ enrollmentId: enr.enrollmentId, status: 'absent' }]);
    let dash = await request(app).get(`/api/classes/${cls._id}/dashboard`).set(auth(t));
    expect(dash.body.rows[0].absenceEquivalent).toBe(1);

    const makeup = await addSession(t, cls._id, { date: past(1), type: 'makeup', makeupForSessionId: orig._id });
    await mark(t, cls._id, makeup._id, [{ enrollmentId: enr.enrollmentId, status: 'present' }]);
    dash = await request(app).get(`/api/classes/${cls._id}/dashboard`).set(auth(t));
    expect(dash.body.rows[0].absenceEquivalent).toBe(0);
    expect(dash.body.rows[0].absentTotal).toBe(0);
  });

  test('exceeding the max flips the enrollment to failed (auto)', async () => {
    const { t, cls, enr } = await setup();
    for (let i = 0; i < 4; i++) {
      const s = await addSession(t, cls._id, { date: past(10 - i) });
      await mark(t, cls._id, s._id, [{ enrollmentId: enr.enrollmentId, status: 'absent' }]);
    }
    const e = await ClassEnrollment.findById(enr.enrollmentId).lean();
    expect(e.status).toBe('failed');
    expect(e.statusAuto).toBe(true);
  });

  test('editing a mark appends editHistory and never deletes the row', async () => {
    const { t, cls, enr } = await setup();
    const s1 = await addSession(t, cls._id, { date: past(2) });
    await mark(t, cls._id, s1._id, [{ enrollmentId: enr.enrollmentId, status: 'absent' }]);
    await mark(t, cls._id, s1._id, [{ enrollmentId: enr.enrollmentId, status: 'present' }]);
    const recs = await AttendanceRecord.find({ sessionId: s1._id }).lean();
    expect(recs).toHaveLength(1);
    expect(recs[0].status).toBe('present');
    expect(recs[0].editHistory).toHaveLength(1);
    expect(recs[0].editHistory[0]).toMatchObject({ from: 'absent', to: 'present' });
  });
});

describe('student self-view', () => {
  test('GET /api/classes/my/attendance-status returns warning only for the affected student', async () => {
    const t = await createTeacher();
    const s1 = await createStudent();
    const s2 = await createStudent();
    const cls = await makeClass(t, { policy: { warnThreshold: 2, maxAbsencesAllowed: 5 } });
    const e1 = await addStudent(t, cls._id, s1);
    const e2 = await addStudent(t, cls._id, s2);
    for (let i = 0; i < 2; i++) {
      const sess = await addSession(t, cls._id, { date: past(5 - i) });
      await mark(t, cls._id, sess._id, [
        { enrollmentId: e1.enrollmentId, status: 'absent' },
        { enrollmentId: e2.enrollmentId, status: 'present' },
      ]);
    }
    const r1 = await request(app).get('/api/classes/my/attendance-status').set(auth(s1));
    expect(r1.body.classes[0]).toMatchObject({ status: 'warning', absenceEquivalent: 2, maxAbsencesAllowed: 5, remaining: 3 });
    const r2 = await request(app).get('/api/classes/my/attendance-status').set(auth(s2));
    expect(r2.body.classes[0].status).toBe('active');
  });
});

describe('guardAgainstMassDelete', () => {
  test('AttendanceRecord / ClassEnrollment refuse an unscoped deleteMany', async () => {
    await expect(AttendanceRecord.deleteMany({})).rejects.toThrow(/unscoped filter/i);
    await expect(ClassEnrollment.deleteMany({})).rejects.toThrow(/unscoped filter/i);
  });
});
