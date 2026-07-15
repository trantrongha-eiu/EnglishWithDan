// Integration tests for the student-reply feature added on top of the
// existing inbox: POST /api/user/messages/:id/reply and the admin-side
// GET/DELETE /api/admin/messages/received routes that surface those replies.
const request = require('supertest');
const app = require('../../app');
const Message = require('../../models/Message');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');

describe('POST /api/user/messages/:id/reply', () => {
  test('requires authentication', async () => {
    const res = await request(app).post('/api/user/messages/000000000000000000000000/reply').send({ body: 'hi' });
    expect(res.status).toBe(401);
  });

  test('student replies to a teacher message, and the teacher can see it under "received"', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const studentToken = signTokenFor(student);
    const teacherToken = signTokenFor(teacher);

    const original = await Message.create({
      fromId: teacher._id, fromName: teacher.username, toId: student._id,
      subject: 'Nhắc học phí', body: 'Em nhớ đóng học phí tháng này nhé', isBroadcast: false
    });

    const replyRes = await request(app)
      .post(`/api/user/messages/${original._id}/reply`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ body: 'Dạ em đóng rồi ạ, thầy kiểm tra giúp em' });

    expect(replyRes.status).toBe(201);
    expect(replyRes.body.success).toBe(true);
    expect(replyRes.body.message.subject).toBe('Re: Nhắc học phí');

    const receivedRes = await request(app)
      .get('/api/admin/messages/received')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(receivedRes.status).toBe(200);
    expect(receivedRes.body.total).toBe(1);
    expect(receivedRes.body.messages[0].body).toBe('Dạ em đóng rồi ạ, thầy kiểm tra giúp em');
    expect(receivedRes.body.messages[0].fromId.username).toBe(student.username);
  });

  test('rejects a reply to a message addressed to a different student', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const otherStudent = await createStudent();
    const token = signTokenFor(student);

    const original = await Message.create({
      fromId: teacher._id, fromName: teacher.username, toId: otherStudent._id,
      body: 'Riêng cho bạn kia', isBroadcast: false
    });

    const res = await request(app)
      .post(`/api/user/messages/${original._id}/reply`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Em xem trộm' });

    expect(res.status).toBe(403);
  });

  test('rejects an empty reply body', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const token = signTokenFor(student);
    const original = await Message.create({ fromId: teacher._id, fromName: teacher.username, toId: student._id, body: 'Hi', isBroadcast: false });

    const res = await request(app)
      .post(`/api/user/messages/${original._id}/reply`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: '   ' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/admin/messages/received', () => {
  test('requires a teacher/admin role', async () => {
    const student = await createStudent();
    const token = signTokenFor(student);
    const res = await request(app).get('/api/admin/messages/received').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('only shows messages addressed to the requesting teacher, not another teacher\'s inbox', async () => {
    const teacherA = await createTeacher();
    const teacherB = await createTeacher();
    const student = await createStudent();
    await Message.create({ fromId: student._id, fromName: student.username, toId: teacherA._id, body: 'Cho A', isBroadcast: false });
    await Message.create({ fromId: student._id, fromName: student.username, toId: teacherB._id, body: 'Cho B', isBroadcast: false });

    const res = await request(app)
      .get('/api/admin/messages/received')
      .set('Authorization', `Bearer ${signTokenFor(teacherA)}`);

    expect(res.body.total).toBe(1);
    expect(res.body.messages[0].body).toBe('Cho A');
  });
});

describe('DELETE /api/admin/messages/received/:id', () => {
  test('admin can soft-delete a received message from their own list only', async () => {
    const admin = await createAdmin();
    const student = await createStudent();
    const msg = await Message.create({ fromId: student._id, fromName: student.username, toId: admin._id, body: 'Xoá tôi', isBroadcast: false });
    const token = signTokenFor(admin);

    const delRes = await request(app).delete(`/api/admin/messages/received/${msg._id}`).set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(200);

    const listRes = await request(app).get('/api/admin/messages/received').set('Authorization', `Bearer ${token}`);
    expect(listRes.body.total).toBe(0);

    // The underlying document still exists (soft delete, not a hard delete).
    const stillExists = await Message.findById(msg._id);
    expect(stillExists).not.toBeNull();
  });

  // Same site-wide policy as the existing "sent messages" delete route
  // (routes/admin/_shared.js teacherOnly): teachers can view but not delete.
  test('a teacher is blocked from deleting, same policy as sent messages', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const msg = await Message.create({ fromId: student._id, fromName: student.username, toId: teacher._id, body: 'Không xoá được', isBroadcast: false });

    const res = await request(app)
      .delete(`/api/admin/messages/received/${msg._id}`)
      .set('Authorization', `Bearer ${signTokenFor(teacher)}`);

    expect(res.status).toBe(403);
    expect(await Message.findById(msg._id)).not.toBeNull();
  });
});

describe('GET /api/user/activity-heatmap', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/user/activity-heatmap');
    expect(res.status).toBe(401);
  });

  test('returns an empty array for a user with no activity', async () => {
    const student = await createStudent();
    const res = await request(app)
      .get('/api/user/activity-heatmap')
      .set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.activity).toEqual([]);
  });
});
