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
// "Today" as the admin date picker sends it: the Vietnam calendar day
// (YYYY-MM-DD). past(0) was the UTC day — a different day 00:00–07:00 ICT.
const vnToday = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);

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
      warnThreshold: null, // = half of maxAbsencesAllowed (utils/classPolicy.js)
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

  test('GET /:id roster rows carry enrollmentId, and removing by that id works', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await makeClass(t);
    await addStudent(t, cls._id, s);

    const detail = await request(app).get(`/api/classes/${cls._id}`).set(auth(t));
    expect(detail.status).toBe(200);
    const row = detail.body.roster[0];
    expect(row.enrollmentId).toBeTruthy();
    expect(String(row.enrollmentId)).toMatch(/^[a-f0-9]{24}$/);

    // The admin trash button hits exactly this — used to send `undefined`
    // because the roster shape omitted enrollmentId.
    const rm = await request(app).delete(`/api/classes/${cls._id}/students/${row.enrollmentId}`).set(auth(t));
    expect(rm.status).toBe(200);
  });
});

describe('PUT /:classId/sessions/:sessionId — "Đánh dấu đã học" shortcut', () => {
  test('flipping status to held (without going through Điểm danh) seeds default present records so heldSessions counts it', async () => {
    const t = await createTeacher();
    const s1 = await createStudent();
    const s2 = await createStudent();
    const cls = await makeClass(t);
    const enr1 = await addStudent(t, cls._id, s1);
    await addStudent(t, cls._id, s2);
    const sess = await addSession(t, cls._id, { date: past(2), status: 'scheduled' });

    // The bug: this used to flip the session to 'held' with zero
    // AttendanceRecords, so computeEnrollmentStats (which requires a record
    // per student to count a held session) silently kept reporting 0 held
    // sessions for every enrolled student even though admin's Buổi học tab
    // showed "Đã học".
    const upd = await request(app).put(`/api/classes/${cls._id}/sessions/${sess._id}`).set(auth(t)).send({ status: 'held' });
    expect(upd.status).toBe(200);
    expect(await AttendanceRecord.countDocuments({ sessionId: sess._id })).toBe(2);
    expect(await AttendanceRecord.countDocuments({ sessionId: sess._id, status: 'present' })).toBe(2);

    const e1 = await ClassEnrollment.findById(enr1.enrollmentId).lean();
    expect(e1.stats.heldSessions).toBe(1);
    expect(e1.stats.attendedCount).toBe(1);

    // Re-run doesn't duplicate a student who was already marked (e.g. a
    // teacher who later corrects one student on Điểm danh, then re-saves the
    // session some other way) — idempotent on top of the unique index.
    const upd2 = await request(app).put(`/api/classes/${cls._id}/sessions/${sess._id}`).set(auth(t)).send({ topic: 'x' });
    expect(upd2.status).toBe(200);
    expect(await AttendanceRecord.countDocuments({ sessionId: sess._id })).toBe(2);
  });
});

describe('DELETE /:classId/sessions — bulk wipe to re-generate a schedule', () => {
  test('scope "scheduled" (default) removes only Dự kiến sessions, keeps held + its attendance', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await makeClass(t);
    const enr = await addStudent(t, cls._id, s);

    const held = await addSession(t, cls._id, { date: past(3), status: 'scheduled' });
    await mark(t, cls._id, held._id, [{ enrollmentId: enr.enrollmentId, status: 'present' }]);
    await request(app).put(`/api/classes/${cls._id}/sessions/${held._id}`).set(auth(t)).send({ status: 'held' });
    await addSession(t, cls._id, { date: future(1), status: 'scheduled' });
    await addSession(t, cls._id, { date: future(3), status: 'scheduled' });

    const gen = await request(app).post(`/api/classes/${cls._id}/sessions/generate`).set(auth(t))
      .send({ weekdays: [0, 1, 2, 3, 4, 5, 6], startDate: future(5).slice(0, 10), endDate: future(12).slice(0, 10) });
    expect(gen.body.created).toBeGreaterThan(0);

    const del = await request(app).delete(`/api/classes/${cls._id}/sessions`).set(auth(t)).send({ scope: 'scheduled' });
    expect(del.status).toBe(200);
    expect(del.body.deleted).toBe(2 + gen.body.created);
    expect(del.body.attendanceDeleted).toBe(0);

    const after = await request(app).get(`/api/classes/${cls._id}/sessions`).set(auth(t));
    expect(after.body.sessions).toHaveLength(1);
    expect(after.body.sessions[0]._id).toBe(String(held._id));
    expect(await AttendanceRecord.countDocuments({ sessionId: held._id })).toBe(1);

    // re-generating afterwards works and numbers from 1 again (only the held one is left)
    const regen = await request(app).post(`/api/classes/${cls._id}/sessions/generate`).set(auth(t))
      .send({ weekdays: [1, 3], startDate: future(20).slice(0, 10), endDate: future(34).slice(0, 10) });
    expect(regen.status).toBe(201);
    expect(regen.body.created).toBeGreaterThan(0);
  });

  test('scope "all" also removes held sessions and their AttendanceRecords', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await makeClass(t);
    const enr = await addStudent(t, cls._id, s);
    const held = await addSession(t, cls._id, { date: past(2), status: 'scheduled' });
    await mark(t, cls._id, held._id, [{ enrollmentId: enr.enrollmentId, status: 'present' }]);
    await request(app).put(`/api/classes/${cls._id}/sessions/${held._id}`).set(auth(t)).send({ status: 'held' });
    await addSession(t, cls._id, { date: future(1), status: 'scheduled' });

    const del = await request(app).delete(`/api/classes/${cls._id}/sessions`).set(auth(t)).send({ scope: 'all' });
    expect(del.status).toBe(200);
    expect(del.body.deleted).toBe(2);
    expect(del.body.attendanceDeleted).toBe(1);
    expect((await request(app).get(`/api/classes/${cls._id}/sessions`).set(auth(t))).body.sessions).toHaveLength(0);
    expect(await AttendanceRecord.countDocuments({ classId: cls._id })).toBe(0);
  });

  test('empty is a no-op, and a teacher cannot wipe another teacher\'s class', async () => {
    const a = await createTeacher();
    const b = await createTeacher();
    const clsA = await makeClass(a);
    const noop = await request(app).delete(`/api/classes/${clsA._id}/sessions`).set(auth(a)).send({ scope: 'scheduled' });
    expect(noop.status).toBe(200);
    expect(noop.body.deleted).toBe(0);
    expect((await request(app).delete(`/api/classes/${clsA._id}/sessions`).set(auth(b)).send({ scope: 'all' })).status).toBe(403);
  });
});

describe('student self-check-in ("tôi có mặt")', () => {
  test('happy path: student ticks in, teacher confirms via saving present → checkin becomes confirmed', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await makeClass(t);
    const enr = await addStudent(t, cls._id, s);
    const sess = await addSession(t, cls._id, { date: vnToday() }); // today

    const empty = await request(app).get('/api/classes/my/checkin').set(auth(s));
    expect(empty.body.classes[0]).toMatchObject({ classId: String(cls._id), checkin: null });
    expect(empty.body.classes[0].session._id).toBe(String(sess._id));

    const tick = await request(app).post(`/api/classes/my/sessions/${sess._id}/checkin`).set(auth(s));
    expect(tick.status).toBe(200);
    expect(tick.body.checkin.status).toBe('pending');

    // Re-ticking while still pending is fine (idempotent).
    expect((await request(app).post(`/api/classes/my/sessions/${sess._id}/checkin`).set(auth(s))).status).toBe(200);

    const roster = await request(app).get(`/api/classes/${cls._id}/sessions/${sess._id}/attendance`).set(auth(t));
    const row = roster.body.roster.find((r) => String(r.enrollmentId) === String(enr.enrollmentId));
    expect(row.checkin).toMatchObject({ status: 'pending' });

    await mark(t, cls._id, sess._id, [{ enrollmentId: enr.enrollmentId, status: 'present' }]);

    const after = await request(app).get(`/api/classes/${cls._id}/sessions/${sess._id}/attendance`).set(auth(t));
    const rowAfter = after.body.roster.find((r) => String(r.enrollmentId) === String(enr.enrollmentId));
    expect(rowAfter.checkin.status).toBe('confirmed');

    // Locked once reviewed — can't quietly re-tick to reset it.
    const relock = await request(app).post(`/api/classes/my/sessions/${sess._id}/checkin`).set(auth(s));
    expect(relock.status).toBe(409);
  });

  test('teacher marks the self-checked-in student absent instead → checkin becomes rejected', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await makeClass(t);
    const enr = await addStudent(t, cls._id, s);
    const sess = await addSession(t, cls._id, { date: vnToday() });

    await request(app).post(`/api/classes/my/sessions/${sess._id}/checkin`).set(auth(s));
    await mark(t, cls._id, sess._id, [{ enrollmentId: enr.enrollmentId, status: 'absent' }]);

    const after = await request(app).get(`/api/classes/${cls._id}/sessions/${sess._id}/attendance`).set(auth(t));
    const row = after.body.roster.find((r) => String(r.enrollmentId) === String(enr.enrollmentId));
    expect(row.checkin.status).toBe('rejected');
  });

  test('cannot check in for a session not dated today, or for a class the student is not in', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const outsider = await createStudent();
    const cls = await makeClass(t);
    await addStudent(t, cls._id, s);
    const pastSess = await addSession(t, cls._id, { date: past(2) });

    const notToday = await request(app).post(`/api/classes/my/sessions/${pastSess._id}/checkin`).set(auth(s));
    expect(notToday.status).toBe(400);

    const todaySess = await addSession(t, cls._id, { date: vnToday() });
    const notEnrolled = await request(app).post(`/api/classes/my/sessions/${todaySess._id}/checkin`).set(auth(outsider));
    expect(notEnrolled.status).toBe(403);
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

describe('POST /:classId/sessions/generate — bulk session generation', () => {
  test('creates a scheduled session on every matching weekday within the range, in order', async () => {
    const t = await createTeacher();
    const cls = await makeClass(t);
    // 2026-09-07 is a Monday. Ask for Mon(1)/Wed(3) through 2026-09-16 (Wed)
    // -> Mon 7, Wed 9, Mon 14, Wed 16 = 4 sessions.
    const res = await request(app).post(`/api/classes/${cls._id}/sessions/generate`).set(auth(t)).send({
      weekdays: [1, 3], startDate: '2026-09-07', endDate: '2026-09-16',
    });
    expect(res.status).toBe(201);
    expect(res.body.created).toBe(4);
    const dates = res.body.sessions.map((s) => new Date(s.date).toISOString().slice(0, 10));
    expect(dates).toEqual(['2026-09-07', '2026-09-09', '2026-09-14', '2026-09-16']);
    expect(res.body.sessions.every((s) => s.status === 'scheduled' && s.type === 'regular')).toBe(true);
    expect(res.body.sessions.map((s) => s.sessionNumber)).toEqual([1, 2, 3, 4]);
  });

  test('skips a date that already has a session instead of duplicating it, and continues sessionNumber after existing ones', async () => {
    const t = await createTeacher();
    const cls = await makeClass(t);
    await addSession(t, cls._id, { date: '2026-09-09' }); // sessionNumber 1, manually added

    const res = await request(app).post(`/api/classes/${cls._id}/sessions/generate`).set(auth(t)).send({
      weekdays: [1, 3], startDate: '2026-09-07', endDate: '2026-09-16',
    });
    expect(res.status).toBe(201);
    expect(res.body.created).toBe(3); // the 9th was skipped — already existed
    const dates = res.body.sessions.map((s) => new Date(s.date).toISOString().slice(0, 10));
    expect(dates).toEqual(['2026-09-07', '2026-09-14', '2026-09-16']);
    expect(res.body.sessions.map((s) => s.sessionNumber)).toEqual([2, 3, 4]); // continues after #1

    const all = await request(app).get(`/api/classes/${cls._id}/sessions`).set(auth(t));
    expect(all.body.sessions).toHaveLength(4); // 1 manual + 3 generated, no duplicate on the 9th
  });

  test('falls back to the class\'s own startDate/endDate when not given in the request', async () => {
    const t = await createTeacher();
    const cls = await makeClass(t, { startDate: '2026-09-07', endDate: '2026-09-16' });
    const res = await request(app).post(`/api/classes/${cls._id}/sessions/generate`).set(auth(t)).send({ weekdays: [1] });
    expect(res.status).toBe(201);
    expect(res.body.created).toBe(2); // Mon 7 and Mon 14
  });

  test('validation: no weekdays, missing dates, or start after end all 400', async () => {
    const t = await createTeacher();
    const cls = await makeClass(t); // no startDate/endDate set
    expect((await request(app).post(`/api/classes/${cls._id}/sessions/generate`).set(auth(t)).send({ weekdays: [], startDate: '2026-09-07', endDate: '2026-09-16' })).status).toBe(400);
    expect((await request(app).post(`/api/classes/${cls._id}/sessions/generate`).set(auth(t)).send({ weekdays: [1] })).status).toBe(400); // no class dates either
    expect((await request(app).post(`/api/classes/${cls._id}/sessions/generate`).set(auth(t)).send({ weekdays: [1], startDate: '2026-09-16', endDate: '2026-09-07' })).status).toBe(400);
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

describe('GET /api/classes/my/overview — dashboard homepage class summary', () => {
  test('student in no classroom → hasClasses: false', async () => {
    const s = await createStudent();
    const res = await request(app).get('/api/classes/my/overview').set(auth(s));
    expect(res.body).toMatchObject({ success: true, hasClasses: false, classes: [] });
  });

  test('enrolled student sees class size, sessions held, absences, and homework miss count', async () => {
    const t = await createTeacher();
    const s1 = await createStudent();
    const s2 = await createStudent();
    const cls = await makeClass(t, { courseName: 'IELTS 6.5', policy: { maxAbsencesAllowed: 5 } });
    const e1 = await addStudent(t, cls._id, s1);
    await addStudent(t, cls._id, s2); // just to make classSize meaningfully > 1

    const sess = await addSession(t, cls._id, { date: past(2) });
    await mark(t, cls._id, sess._id, [
      { enrollmentId: e1.enrollmentId, status: 'absent' },
      { enrollmentId: (await ClassEnrollment.findOne({ classId: cls._id, studentId: s2._id }))._id, status: 'present' },
    ]);

    const res = await request(app).get('/api/classes/my/overview').set(auth(s1));
    expect(res.body.hasClasses).toBe(true);
    expect(res.body.classes[0]).toMatchObject({
      className: 'Lớp Test',
      courseName: 'IELTS 6.5',
      teacherName: expect.any(String),
      classSize: 2,
      heldSessions: 1,
      absentTotal: 1,
      maxAbsencesAllowed: 5,
      homeworkMissedCount: 0,
      homeworkWarnThreshold: 5,
      homeworkFailThreshold: 10,
    });
  });

  test('a stale stored "warning" with 0 absences / 0 misses is resynced, and gives no absence reminder', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const cls = await makeClass(t, { policy: { maxAbsencesAllowed: 4 } });
    const e = await addStudent(t, cls._id, s);
    // written by the old rules (e.g. warnThreshold 0 → everyone "warning")
    await ClassEnrollment.updateOne({ _id: e.enrollmentId }, { $set: { status: 'warning', statusAuto: true, statusReason: 'Đã nghỉ 0 buổi' } });

    const status = await request(app).get('/api/classes/my/attendance-status').set(auth(s));
    expect(status.body.classes[0]).toMatchObject({ attendanceLevel: 'ok', homeworkLevel: 'ok' });

    const res = await request(app).get('/api/classes/my/overview').set(auth(s));
    expect(res.body.classes[0]).toMatchObject({ status: 'active', attendanceLevel: 'ok', absentTotal: 0 });
    expect((await ClassEnrollment.findById(e.enrollmentId)).status).toBe('active');
  });
});

describe('guardAgainstMassDelete', () => {
  test('AttendanceRecord / ClassEnrollment refuse an unscoped deleteMany', async () => {
    await expect(AttendanceRecord.deleteMany({})).rejects.toThrow(/unscoped filter/i);
    await expect(ClassEnrollment.deleteMany({})).rejects.toThrow(/unscoped filter/i);
  });
});

describe('auto attendance at class time', () => {
  const { autoMarkDueSessions } = require('../../services/classAutoAttendanceService');
  const ClassSession = require('../../models/ClassSession');
  // A UTC-midnight day key N days from now on the Vietnam calendar.
  const vnDay = (offset = 0) => new Date(Date.now() + 7 * 3600e3 + offset * 864e5).toISOString().slice(0, 10);

  test('marks everyone present once the class time passes; teacher can still edit', async () => {
    const t = await createTeacher();
    const s1 = await createStudent();
    const s2 = await createStudent();
    const cls = await makeClass(t, { startTime: '00:00' });
    expect(cls.startTime).toBe('00:00');
    await addStudent(t, cls._id, s1);
    const e2 = await addStudent(t, cls._id, s2);
    const today = await addSession(t, cls._id, { date: vnDay(0) });
    const tomorrow = await addSession(t, cls._id, { date: vnDay(1) });

    const r = await autoMarkDueSessions({ classIds: [cls._id] });
    expect(r).toEqual({ sessions: 1, records: 2 });

    const recs = await AttendanceRecord.find({ sessionId: today._id }).lean();
    expect(recs).toHaveLength(2);
    expect(recs.every((x) => x.status === 'present' && x.autoMarked)).toBe(true);
    const s = await ClassSession.findById(today._id).lean();
    expect(s.status).toBe('held');
    expect(s.autoMarkedAt).toBeTruthy();
    expect(await AttendanceRecord.countDocuments({ sessionId: tomorrow._id })).toBe(0);

    // Idempotent — a second run (cron + lazy read racing) marks nothing.
    expect(await autoMarkDueSessions({ classIds: [cls._id] })).toEqual({ sessions: 0, records: 0 });

    const res = await mark(t, cls._id, today._id, [{ enrollmentId: e2.enrollmentId || e2._id, status: 'absent' }]);
    expect(res.status).toBe(200);
    const edited = await AttendanceRecord.findOne({ sessionId: today._id, studentId: s2._id }).lean();
    expect(edited.status).toBe('absent');
    expect(edited.autoMarked).toBe(false);
    expect(edited.editHistory[0]).toMatchObject({ from: 'present', to: 'absent' });
  });

  test('does not touch a session the teacher already marked, or one before its start time', async () => {
    const t = await createTeacher();
    const st = await createStudent();
    const cls = await makeClass(t, { startTime: '23:59' });
    const e = await addStudent(t, cls._id, st);
    const marked = await addSession(t, cls._id, { date: vnDay(-1) });
    await mark(t, cls._id, marked._id, [{ enrollmentId: e.enrollmentId || e._id, status: 'absent' }]);
    const later = await addSession(t, cls._id, { date: vnDay(0) }); // 23:59 today — not yet (unless run at 23:59)

    const r = await autoMarkDueSessions({ classIds: [cls._id] });
    expect(r.sessions).toBeLessThanOrEqual(1);
    const rec = await AttendanceRecord.findOne({ sessionId: marked._id }).lean();
    expect(rec.status).toBe('absent');
    expect(rec.autoMarked).toBe(false);
    if (r.sessions === 0) expect(await AttendanceRecord.countDocuments({ sessionId: later._id })).toBe(0);
  });

  // session.date is UTC midnight of the Vietnam school day, so between
  // 00:00–07:00 ICT it is still AHEAD of "now" in UTC. The due-session query
  // used to cap date at now and skipped these sessions until 07:00 ICT (CI
  // run at 17:32 UTC failed on exactly this). Fixed clock → deterministic.
  test('a class before 07:00 ICT is auto-marked while UTC is still on the previous day', async () => {
    const t = await createTeacher();
    const st = await createStudent();
    const cls = await makeClass(t, { startTime: '00:30' });
    await addStudent(t, cls._id, st);
    const s = await addSession(t, cls._id, { date: '2030-01-15' });

    // 00:20 ICT on Jan 15 — before the 00:30 start: not due yet.
    expect(await autoMarkDueSessions({ classIds: [cls._id], now: new Date('2030-01-14T17:20:00Z') }))
      .toEqual({ sessions: 0, records: 0 });
    // 00:45 ICT on Jan 15 (= 17:45 UTC Jan 14): due.
    expect(await autoMarkDueSessions({ classIds: [cls._id], now: new Date('2030-01-14T17:45:00Z') }))
      .toEqual({ sessions: 1, records: 1 });
    expect(await AttendanceRecord.countDocuments({ sessionId: s._id, autoMarked: true })).toBe(1);
  });

  test('student check-in status shows the automatic mark', async () => {
    const t = await createTeacher();
    const st = await createStudent();
    const cls = await makeClass(t, { startTime: '00:00' });
    await addStudent(t, cls._id, st);
    await addSession(t, cls._id, { date: vnDay(0) });
    const ov = await request(app).get('/api/classes/my/overview').set(auth(st));
    expect(ov.status).toBe(200);
    expect(ov.body.classes[0].progress).toMatchObject({ phase: expect.any(String), startTime: '00:00' });
    const ck = await request(app).get('/api/classes/my/checkin').set(auth(st));
    const row = ck.body.classes.find((c) => String(c.classId) === String(cls._id));
    // /my/checkin picks "today" by the Vietnam day (vnDayRange) — this used
    // to be a UTC day and found nothing between 00:00–07:00 ICT.
    expect(row.session).toBeTruthy();
    expect(row.record).toEqual({ status: 'present', autoMarked: true });
    expect(await AttendanceRecord.countDocuments({ classId: cls._id, autoMarked: true })).toBe(1);
  });
});
