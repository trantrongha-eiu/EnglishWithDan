// Integration tests for GET/PUT /api/user/profile — including a
// mass-assignment regression test: sending role/plan in the PUT body must
// never change them (updateProfile only destructures firstName/lastName/
// bio/studyMotto/targetBand off req.body).
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const cloudinaryService = require('../../services/cloudinaryService');

describe('GET /api/user/profile', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/user/profile');
    expect(res.status).toBe(401);
  });

  test('returns the profile shape for the authenticated user', async () => {
    const user = await createStudent({ firstName: 'Alice', lastName: 'Nguyen' });
    const token = signTokenFor(user);
    const res = await request(app).get('/api/user/profile').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe(user.username);
    expect(res.body.user.firstName).toBe('Alice');
    expect(res.body.user.password).toBeUndefined();
  });
});

describe('PUT /api/user/profile', () => {
  test('updates only the whitelisted fields', async () => {
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Updated', lastName: 'Name', bio: 'New bio', studyMotto: 'Never give up', targetBand: 7.5 });

    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe('Updated');
    expect(res.body.user.lastName).toBe('Name');
    expect(res.body.user.bio).toBe('New bio');
    expect(res.body.user.studyMotto).toBe('Never give up');
    expect(res.body.user.targetBand).toBe(7.5);
  });

  test('mass-assignment regression: sending role/plan in the body does not change them', async () => {
    const user = await createStudent({ plan: 'free' });
    const token = signTokenFor(user);

    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'StillStudent', role: 'admin', plan: 'premium', isBanned: true });

    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe('StillStudent');

    const fromDb = await User.findById(user._id);
    expect(fromDb.role).toBe('student');
    expect(fromDb.plan).toBe('free');
    expect(fromDb.isBanned).toBe(false);
  });

  // Regression coverage for BUG-003 (2026-08-27 audit): this endpoint used
  // to accept targetBand/targetExamDate with no validation at all — a
  // crafted targetBand:15 or a past exam date was persisted verbatim.
  test('rejects an out-of-range targetBand with 400, and never persists it', async () => {
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ targetBand: 15 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    const fromDb = await User.findById(user._id);
    expect(fromDb.targetBand).toBeNull();
  });

  test('rejects a past targetExamDate with 400, and never persists it', async () => {
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ targetExamDate: '2020-01-01' });

    expect(res.status).toBe(400);

    const fromDb = await User.findById(user._id);
    expect(fromDb.targetExamDate).toBeNull();
  });

  test('accepts a valid future targetExamDate', async () => {
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ targetExamDate: '2099-06-15' });

    expect(res.status).toBe(200);
    expect(new Date(res.body.user.targetExamDate).toISOString().slice(0, 10)).toBe('2099-06-15');
  });
});

// BUG-023: changing your password revokes every token issued before the
// change, but hands back a fresh one so the request that just made the
// change doesn't itself get logged out.
describe('PUT /api/user/change-password', () => {
  test('requires authentication', async () => {
    const res = await request(app).put('/api/user/change-password').send({ currentPassword: 'x', newPassword: 'NewPassword1!' });
    expect(res.status).toBe(401);
  });

  test('wrong currentPassword -> 400, no token issued', async () => {
    const user = await createStudent({ rawPassword: 'OldPassword1!' });
    const token = signTokenFor(user);
    const res = await request(app)
      .put('/api/user/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'WrongOne!', newPassword: 'NewPassword1!' });

    expect(res.status).toBe(400);
    expect(res.body.token).toBeUndefined();
  });

  test('correct currentPassword: 200 with a fresh token that still works for this same session', async () => {
    const user = await createStudent({ rawPassword: 'OldPassword1!' });
    const currentToken = signTokenFor(user);

    const res = await request(app)
      .put('/api/user/change-password')
      .set('Authorization', `Bearer ${currentToken}`)
      .send({ currentPassword: 'OldPassword1!', newPassword: 'NewPassword1!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe('string');

    // The fresh token keeps working — this is the whole point of reissuing
    // one: without it, the request that just changed the password would
    // immediately 401 on its own next call.
    const meWithNewToken = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${res.body.token}`);
    expect(meWithNewToken.status).toBe(200);
  });

  // A genuinely older session (signed well before the change, unlike the
  // request's own token above which is deliberately NOT penalized for
  // landing in the same second — see middleware/auth.js's comment) must
  // be revoked.
  test('an older token from a different session is revoked by the change', async () => {
    const jwt = require('jsonwebtoken');
    const user = await createStudent({ rawPassword: 'OldPassword1!' });
    const otherDeviceToken = jwt.sign(
      { id: user._id, iat: Math.floor(Date.now() / 1000) - 5 },
      process.env.JWT_SECRET, { expiresIn: '7d' }
    );
    const currentToken = signTokenFor(user);

    const res = await request(app)
      .put('/api/user/change-password')
      .set('Authorization', `Bearer ${currentToken}`)
      .send({ currentPassword: 'OldPassword1!', newPassword: 'NewPassword1!' });
    expect(res.status).toBe(200);

    const meWithOldDevice = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${otherDeviceToken}`);
    expect(meWithOldDevice.status).toBe(401);
  });
});

// BUG-025: a direct API call bypasses the frontend's own client-side
// compression (profile.html resizes to ~600px before ever sending), so
// the server needs its own real size cap independent of that.
describe('POST /api/user/avatar', () => {
  const TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

  test('requires authentication', async () => {
    const res = await request(app).post('/api/user/avatar').send({ imageBase64: TINY_PNG });
    expect(res.status).toBe(401);
  });

  test('rejects a non-data-URI payload', async () => {
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/user/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ imageBase64: 'https://evil.example/x.png' });
    expect(res.status).toBe(400);
  });

  test('rejects a payload over the 5MB decoded-byte cap, no Cloudinary call made', async () => {
    const uploadSpy = jest.spyOn(cloudinaryService, 'uploadImage');
    const oversized = 'data:image/png;base64,' + Buffer.alloc(6 * 1024 * 1024, 1).toString('base64');
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/user/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ imageBase64: oversized });
    expect(res.status).toBe(400);
    expect(uploadSpy).not.toHaveBeenCalled();
    uploadSpy.mockRestore();
  });

  test('accepts a payload comfortably under the cap', async () => {
    const uploadSpy = jest.spyOn(cloudinaryService, 'uploadImage')
      .mockResolvedValue({ secure_url: 'https://res.cloudinary.com/test/avatars/me.jpg' });
    const user = await createStudent();
    const token = signTokenFor(user);
    const res = await request(app)
      .post('/api/user/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ imageBase64: TINY_PNG });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.avatar).toBe('https://res.cloudinary.com/test/avatars/me.jpg');
    uploadSpy.mockRestore();
  });
});
