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
    const res = await request(app)
      .delete(`/api/listening/admin/tests/${test._id}`)
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
