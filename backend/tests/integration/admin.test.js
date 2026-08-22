// Integration tests proving role-gating on /api/admin/* routes actually
// works: teacherOnly vs adminOnly are two distinct gates (routes/admin/
// _shared.js), and a teacher is explicitly blocked from DELETE methods on
// teacherOnly routes even though GET/PUT are allowed.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createListeningTest } = require('../factories/contentFactory');

describe('GET /api/admin/users (teacherOnly)', () => {
  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('a teacher is allowed through', async () => {
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('an admin is allowed through', async () => {
    const admin = await createAdmin();
    const token = signTokenFor(admin);
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

// PLATFORM_AUDIT_2026-08-22 "làm ngay" #4 — GET /api/badges only ever read
// req.user._id (a student's own badges); this admin route reuses the same
// badgeService.getBadges() against an arbitrary student id for StudentDetail.jsx.
describe('GET /api/admin/users/:id/badges (teacherOnly)', () => {
  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const res = await request(app).get(`/api/admin/users/${student._id}/badges`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('a teacher can fetch a student\'s badge catalog', async () => {
    const student = await createStudent();
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);
    const res = await request(app).get(`/api/admin/users/${student._id}/badges`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.badges)).toBe(true);
    expect(res.body.badges.length).toBeGreaterThan(0);
    expect(typeof res.body.earnedCount).toBe('number');
    expect(typeof res.body.totalCount).toBe('number');
  });
});

describe('POST /api/admin/users (adminOnly — stricter than teacherOnly)', () => {
  test('a teacher is blocked with 403 even though they pass teacherOnly routes', async () => {
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'shouldnotbecreated', email: 'x@test.local', password: 'Test1234!' });
    expect(res.status).toBe(403);
  });

  test('an admin succeeds', async () => {
    const admin = await createAdmin();
    const token = signTokenFor(admin);
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'createdbyadmin', email: 'createdbyadmin@test.local', password: 'Test1234!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('createdbyadmin');
  });
});

describe('DELETE on a teacherOnly route — teachers are explicitly blocked from deleting content', () => {
  test('a teacher gets 403 deleting a listening test', async () => {
    const test = await createListeningTest();
    const teacher = await createTeacher();
    const token = signTokenFor(teacher);
    // Moved from /api/listening/admin/tests to /api/admin/listening/tests
    // (admin panel audit finding #7 — namespace consistency with every
    // other content type's admin routes).
    const res = await request(app)
      .delete(`/api/admin/listening/tests/${test._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/admin/online-users (teacherOnly)', () => {
  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const res = await request(app).get('/api/admin/online-users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
