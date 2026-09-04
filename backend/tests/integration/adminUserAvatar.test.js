// POST/DELETE /api/admin/users/:id/avatar — lets an admin set or clear a
// user's avatar from the "Chỉnh sửa người dùng" modal, reusing the same
// cloudinaryService upload path as the student's own self-service avatar
// upload (backend/services/userService.js's uploadAvatar).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const cloudinaryService = require('../../services/cloudinaryService');

const TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

describe('POST /api/admin/users/:id/avatar (adminOnly)', () => {
  test('a teacher is blocked with 403', async () => {
    const teacher = await createTeacher();
    const target = await createStudent();
    const token = signTokenFor(teacher);
    const res = await request(app)
      .post(`/api/admin/users/${target._id}/avatar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ imageBase64: TINY_PNG });
    expect(res.status).toBe(403);
  });

  test('rejects a non-data-URI payload', async () => {
    const admin = await createAdmin();
    const target = await createStudent();
    const token = signTokenFor(admin);
    const res = await request(app)
      .post(`/api/admin/users/${target._id}/avatar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ imageBase64: 'https://evil.example/x.png' });
    expect(res.status).toBe(400);
  });

  // BUG-025: a direct API call bypasses the frontend's own client-side
  // compression entirely, so the server needs its own real size cap.
  test('rejects a payload over the 5MB decoded-byte cap, no Cloudinary call made', async () => {
    // stub the upload so a guard regression can't fire a real network call
    const uploadSpy = jest.spyOn(cloudinaryService, 'uploadImage')
      .mockResolvedValue({ secure_url: 'https://res.cloudinary.com/test/x.jpg' });
    // just over 5 MB decoded (7 MiB of base64 → ~5.25 MB), built as one plain
    // string — no Buffer.alloc + toString('base64') double allocation, which
    // made this the heaviest single line in the whole suite and flaked it
    // under memory pressure once the suite count grew.
    const oversized = 'data:image/png;base64,' + 'A'.repeat(7 * 1024 * 1024);
    const admin = await createAdmin();
    const target = await createStudent();
    const token = signTokenFor(admin);
    const res = await request(app)
      .post(`/api/admin/users/${target._id}/avatar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ imageBase64: oversized });
    expect(res.status).toBe(400);
    expect(uploadSpy).not.toHaveBeenCalled();
    uploadSpy.mockRestore();
  });

  test('an admin can set a user avatar', async () => {
    const uploadSpy = jest.spyOn(cloudinaryService, 'uploadImage')
      .mockResolvedValue({ secure_url: 'https://res.cloudinary.com/test/avatars/abc.jpg' });
    const admin = await createAdmin();
    const target = await createStudent();
    const token = signTokenFor(admin);
    const res = await request(app)
      .post(`/api/admin/users/${target._id}/avatar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ imageBase64: TINY_PNG });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.avatar).toBe('https://res.cloudinary.com/test/avatars/abc.jpg');
    uploadSpy.mockRestore();
  });
});

describe('DELETE /api/admin/users/:id/avatar (adminOnly)', () => {
  test('a teacher is blocked with 403', async () => {
    const teacher = await createTeacher();
    const target = await createStudent({ extra: { avatar: 'https://res.cloudinary.com/test/avatars/old.jpg' } });
    const token = signTokenFor(teacher);
    const res = await request(app)
      .delete(`/api/admin/users/${target._id}/avatar`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('an admin can clear a user avatar', async () => {
    const admin = await createAdmin();
    const target = await createStudent({ extra: { avatar: 'https://res.cloudinary.com/test/avatars/old.jpg' } });
    const token = signTokenFor(admin);
    const res = await request(app)
      .delete(`/api/admin/users/${target._id}/avatar`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.avatar).toBe('');
  });
});
