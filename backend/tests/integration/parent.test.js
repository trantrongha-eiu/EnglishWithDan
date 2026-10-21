// Integration tests for the phụ huynh (parent) role — routes/admin/parents.js
// (staff create/link/reset/unlink) and routes/parent.js (the read-only
// parent view). Focus: who may create a parent, that a parent token reaches
// nothing but /api/parent/*, and that a parent sees only linked children.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, createUser, signTokenFor } = require('../factories/userFactory');
const { seedAttendance, createAssignment } = require('../factories/classFactory');
const User = require('../../models/User');
const ParentLink = require('../../models/ParentLink');
const TuitionFee = require('../../models/TuitionFee');
const WritingAttempt = require('../../models/WritingAttempt');
const AssignmentProgress = require('../../models/AssignmentProgress');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
let phoneSeq = 0;
const nextPhone = () => `09${String(10000000 + (phoneSeq += 1)).padStart(8, '0')}`;

async function addParent(staff, student, body = {}) {
  return request(app).post(`/api/admin/users/${student._id}/parents`).set(auth(staff))
    .send({ name: 'Nguyễn Thị Lan', phone: nextPhone(), relation: 'mother', ...body });
}

async function login(username, password) {
  return request(app).post('/api/auth/login').send({ email: username, password });
}

describe('staff create / link parents', () => {
  test('teacher creates a parent for a student in their class; parent logs in with phone + temp password', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    await seedAttendance({ teacher, student, marks: ['present'] });

    const res = await addParent(teacher, student, { phone: '+84 912 345 678' });
    expect(res.status).toBe(201);
    expect(res.body.created).toBe(true);
    expect(res.body.parent.phone).toBe('0912345678');
    expect(res.body.tempPassword).toMatch(/^[a-z2-9]{8}$/);

    const parent = await User.findById(res.body.parent._id).lean();
    expect(parent.role).toBe('parent');
    expect(parent.mustChangePassword).toBe(true);

    const lg = await login('0912345678', res.body.tempPassword);
    expect(lg.status).toBe(200);
    expect(lg.body.user.role).toBe('parent');
    expect(lg.body.user.mustChangePassword).toBe(true);
  });

  test('teacher cannot add a parent for a student outside their classes', async () => {
    const a = await createTeacher();
    const b = await createTeacher();
    const student = await createStudent();
    await seedAttendance({ teacher: b, student, marks: [] });
    expect((await addParent(a, student)).status).toBe(403);
    expect((await request(app).get(`/api/admin/users/${student._id}/parents`).set(auth(a))).status).toBe(403);
  });

  test('admin can add a parent for any student; a student cannot', async () => {
    const admin = await createAdmin();
    const student = await createStudent();
    expect((await addParent(admin, student)).status).toBe(201);
    const other = await createStudent();
    expect((await addParent(other, student)).status).toBe(403);
  });

  test('same phone again links the existing parent (siblings) without a new password', async () => {
    const admin = await createAdmin();
    const s1 = await createStudent();
    const s2 = await createStudent();
    const phone = nextPhone();
    const first = await addParent(admin, s1, { phone });
    const second = await addParent(admin, s2, { phone, name: '' });
    expect(second.status).toBe(200);
    expect(second.body.created).toBe(false);
    expect(second.body.tempPassword).toBeNull();
    expect(second.body.parent._id).toBe(first.body.parent._id);
    expect((await addParent(admin, s2, { phone })).status).toBe(409);
  });

  test('a phone already used by a non-parent account is refused', async () => {
    const admin = await createAdmin();
    const student = await createStudent();
    await createUser({ username: '0987654321' });
    expect((await addParent(admin, student, { phone: '0987654321' })).status).toBe(409);
  });

  test('invalid phone → 400', async () => {
    const admin = await createAdmin();
    const student = await createStudent();
    expect((await addParent(admin, student, { phone: '12345' })).status).toBe(400);
  });

  test('list, reset password (old sessions revoked), unlink', async () => {
    const admin = await createAdmin();
    const student = await createStudent();
    const created = await addParent(admin, student);
    const parentId = created.body.parent._id;

    const list = await request(app).get(`/api/admin/users/${student._id}/parents`).set(auth(admin));
    expect(list.body.parents).toHaveLength(1);
    expect(list.body.parents[0].email).toBe(''); // placeholder email hidden

    const parent = await User.findById(parentId);
    const oldToken = signTokenFor(parent);
    await new Promise((r) => setTimeout(r, 1100)); // tokenValidAfter compares whole seconds
    const reset = await request(app).post(`/api/admin/users/${student._id}/parents/${parentId}/reset-password`).set(auth(admin));
    expect(reset.status).toBe(200);
    expect(reset.body.tempPassword).toMatch(/^[a-z2-9]{8}$/);
    expect((await request(app).get('/api/parent/children').set({ Authorization: `Bearer ${oldToken}` })).status).toBe(401);
    expect((await login(created.body.parent.phone, reset.body.tempPassword)).status).toBe(200);

    const del = await request(app).delete(`/api/admin/users/${student._id}/parents/${parentId}`).set(auth(admin));
    expect(del.status).toBe(200);
    expect(await ParentLink.countDocuments({ parentId })).toBe(0);
    expect(await User.exists({ _id: parentId })).toBeTruthy();
  });

  test('teacher can unlink (DELETE is not blocked for teachers here)', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    await seedAttendance({ teacher, student, marks: [] });
    const created = await addParent(teacher, student);
    const del = await request(app).delete(`/api/admin/users/${student._id}/parents/${created.body.parent._id}`).set(auth(teacher));
    expect(del.status).toBe(200);
  });
});

describe('parent token confinement', () => {
  test('a parent token is refused everywhere outside /api/parent + session basics', async () => {
    const parent = await createUser({ role: 'parent' });
    for (const path of ['/api/reading/tests', '/api/classes/my/overview', '/api/assignments/mine', '/api/user/profile', '/api/tuition/my/summary', '/api/admin/users', '/api/nav/summary']) {
      const r = await request(app).get(path).set(auth(parent));
      expect([path, r.status]).toEqual([path, 403]);
    }
    expect((await request(app).get('/api/auth/me').set(auth(parent))).status).toBe(200);
    expect((await request(app).get('/api/parent/children').set(auth(parent))).status).toBe(200);
  });

  test('change-password works and clears mustChangePassword', async () => {
    const admin = await createAdmin();
    const student = await createStudent();
    const created = await addParent(admin, student);
    const lg = await login(created.body.parent.phone, created.body.tempPassword);
    const r = await request(app).put('/api/user/change-password').set({ Authorization: `Bearer ${lg.body.token}` })
      .send({ currentPassword: created.body.tempPassword, newPassword: 'MatKhauMoi123' });
    expect(r.status).toBe(200);
    expect((await User.findById(created.body.parent._id).lean()).mustChangePassword).toBe(false);
  });

  test('/api/parent/* is parent-only', async () => {
    const student = await createStudent();
    expect((await request(app).get('/api/parent/children').set(auth(student))).status).toBe(403);
  });
});

describe('parent view of a linked child', () => {
  async function setup() {
    const teacher = await createTeacher();
    const student = await createStudent({ firstName: 'Minh', lastName: 'An' });
    const { classGroup } = await seedAttendance({ teacher, student, marks: ['present', 'absent', 'late', 'excused'] });
    const parent = await createUser({ role: 'parent' });
    await ParentLink.create({ parentId: parent._id, studentId: student._id, relation: 'father' });
    return { teacher, student, parent, classGroup };
  }

  test('children list carries the quick badges', async () => {
    const { student, parent } = await setup();
    await TuitionFee.create({ studentId: student._id, feeType: 'monthly', month: 9, year: 2026, amount: 1500000 });
    const r = await request(app).get('/api/parent/children').set(auth(parent));
    expect(r.status).toBe(200);
    expect(r.body.children).toHaveLength(1);
    const c = r.body.children[0];
    expect(c.name).toBe('Minh An');
    expect(c.absentTotal).toBe(2);
    expect(c.lateCount).toBe(1);
    expect(c.unpaidCount).toBe(1);
    expect(c.unpaidAmount).toBe(1500000);
  });

  test('classes: attendance summary + per-session marks', async () => {
    const { student, parent } = await setup();
    const r = await request(app).get(`/api/parent/children/${student._id}/classes`).set(auth(parent));
    expect(r.status).toBe(200);
    expect(r.body.classes).toHaveLength(1);
    const c = r.body.classes[0];
    expect(c.heldSessions).toBe(4);
    expect(c.absentUnexcused).toBe(1);
    expect(c.absentExcused).toBe(1);
    expect(c.sessions.map((s) => s.mark)).toEqual(['present', 'absent', 'late', 'excused']);
  });

  test('homework: titles/status only, no resource links, nothing persisted', async () => {
    const { student, parent, classGroup } = await setup();
    await createAssignment(classGroup, { title: 'Bài tuần 1', deadline: new Date(Date.now() - 864e5) });
    const r = await request(app).get(`/api/parent/children/${student._id}/homework`).set(auth(parent));
    expect(r.status).toBe(200);
    expect(r.body.assignments).toHaveLength(1);
    expect(r.body.assignments[0].title).toBe('Bài tuần 1');
    expect(r.body.assignments[0].status).toBe('overdue');
    expect(r.body.assignments[0].resources).toBeUndefined();
    expect(await AssignmentProgress.countDocuments({ studentId: student._id })).toBe(0);
  });

  test('scores: confirmed writing grade + teacher comment, never the essay text', async () => {
    const { student, parent } = await setup();
    await WritingAttempt.create({
      userId: student._id, examName: 'Cambridge 18 Test 1', task2Answer: 'SECRET ESSAY TEXT',
      gradingStatus: 'confirmed',
      grading: { overallBand: 6.5, adminNote: 'Cần luyện thêm Task 1', task2: { bandScore: 6.5, overallFeedback: 'Lập luận rõ' } },
    });
    await WritingAttempt.create({ userId: student._id, examName: 'AI only', gradingStatus: 'ai_done', aiGrading: { task2: { bandScore: 7 } } });
    const r = await request(app).get(`/api/parent/children/${student._id}/scores`).set(auth(parent));
    expect(r.status).toBe(200);
    expect(r.body.writing).toHaveLength(1);
    expect(r.body.writing[0]).toMatchObject({ overallBand: 6.5, teacherNote: 'Cần luyện thêm Task 1', task2Comment: 'Lập luận rõ' });
    expect(JSON.stringify(r.body)).not.toContain('SECRET ESSAY TEXT');
  });

  test('tuition: fees + bank details only', async () => {
    const { student, parent } = await setup();
    await TuitionFee.create({ studentId: student._id, feeType: 'course', courseName: 'IELTS 6.5', amount: 5000000 });
    const r = await request(app).get(`/api/parent/children/${student._id}/tuition`).set(auth(parent));
    expect(r.status).toBe(200);
    expect(r.body.fees).toHaveLength(1);
    expect(r.body.payment).toBeDefined();
    expect(r.body.payment.autoRemindEnabled).toBeUndefined();
  });

  test('another student (not linked) → 404 on every child endpoint', async () => {
    const { parent } = await setup();
    const stranger = await createStudent();
    for (const part of ['classes', 'homework', 'scores', 'tuition']) {
      const r = await request(app).get(`/api/parent/children/${stranger._id}/${part}`).set(auth(parent));
      expect([part, r.status]).toEqual([part, 404]);
    }
    expect((await request(app).get('/api/parent/children/not-an-id/classes').set(auth(parent))).status).toBe(404);
  });
});
