// Coverage for backend/routes/admin/courses.js — CRUD for the public
// "Khóa học" listing, plus its soft-delete (isActive: false, hides from the
// public page) vs permanent hard-delete distinction.
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createCourse } = require('../factories/contentFactory');
const Course = require('../../models/Course');

describe('GET /api/admin/courses (teacherOnly)', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/admin/courses');
    expect(res.status).toBe(401);
  });

  test('a student is blocked with 403', async () => {
    const student = await createStudent();
    const res = await request(app).get('/api/admin/courses').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(403);
  });

  test('returns courses sorted by order then createdAt', async () => {
    const teacher = await createTeacher();
    await createCourse({ title: 'Second', order: 2 });
    await createCourse({ title: 'First', order: 1 });
    await createCourse({ title: 'Third', order: 3 });

    const res = await request(app).get('/api/admin/courses').set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.courses.map(c => c.title)).toEqual(['First', 'Second', 'Third']);
  });
});

describe('POST /api/admin/courses (teacherOnly)', () => {
  test('a teacher can create a course', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ title: 'IELTS Foundation', category: 'ielts', order: 1 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.course.title).toBe('IELTS Foundation');
    const saved = await Course.findById(res.body.course._id);
    expect(saved).not.toBeNull();
    expect(saved.title).toBe('IELTS Foundation');
  });

  test('missing required title returns 400', async () => {
    const admin = await createAdmin();
    const res = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${signTokenFor(admin)}`)
      .send({ category: 'ielts' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/admin/courses/:id (teacherOnly)', () => {
  test('a teacher can update a course', async () => {
    const teacher = await createTeacher();
    const course = await createCourse({ title: 'Old title' });
    const res = await request(app)
      .put(`/api/admin/courses/${course._id}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ title: 'New title' });
    expect(res.status).toBe(200);
    expect(res.body.course.title).toBe('New title');
    const saved = await Course.findById(course._id);
    expect(saved.title).toBe('New title');
  });

  test('404 when the course does not exist', async () => {
    const teacher = await createTeacher();
    const res = await request(app)
      .put(`/api/admin/courses/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ title: 'New title' });
    expect(res.status).toBe(404);
  });

  test('an invalid enum value (category) returns 400 via runValidators', async () => {
    const teacher = await createTeacher();
    const course = await createCourse();
    const res = await request(app)
      .put(`/api/admin/courses/${course._id}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`)
      .send({ category: 'not-a-real-category' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/admin/courses/:id (soft delete — teacherOnly, blocks teachers)', () => {
  test('a teacher gets 403 (DELETE is blocked by teacherOnly even on this route)', async () => {
    const teacher = await createTeacher();
    const course = await createCourse();
    const res = await request(app)
      .delete(`/api/admin/courses/${course._id}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(403);
    const stillThere = await Course.findById(course._id);
    expect(stillThere.isActive).toBe(true);
  });

  test('an admin soft-deletes: isActive becomes false but the document still exists', async () => {
    const admin = await createAdmin();
    const course = await createCourse();
    const res = await request(app)
      .delete(`/api/admin/courses/${course._id}`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const saved = await Course.findById(course._id);
    expect(saved).not.toBeNull();
    expect(saved.isActive).toBe(false);
  });
});

describe('DELETE /api/admin/courses/:id/permanent (hard delete — teacherOnly, blocks teachers)', () => {
  test('a teacher gets 403', async () => {
    const teacher = await createTeacher();
    const course = await createCourse();
    const res = await request(app)
      .delete(`/api/admin/courses/${course._id}/permanent`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(res.status).toBe(403);
    expect(await Course.findById(course._id)).not.toBeNull();
  });

  test('an admin permanently deletes the document', async () => {
    const admin = await createAdmin();
    const course = await createCourse();
    const res = await request(app)
      .delete(`/api/admin/courses/${course._id}/permanent`)
      .set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(await Course.findById(course._id)).toBeNull();
  });
});
