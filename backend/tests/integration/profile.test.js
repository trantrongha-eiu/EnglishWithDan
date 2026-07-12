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
});
