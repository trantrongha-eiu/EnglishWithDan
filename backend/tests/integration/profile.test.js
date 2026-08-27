// Integration tests for GET/PUT /api/user/profile — including a
// mass-assignment regression test: sending role/plan in the PUT body must
// never change them (updateProfile only destructures firstName/lastName/
// bio/studyMotto/targetBand off req.body).
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { createStudent, signTokenFor } = require('../factories/userFactory');

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
