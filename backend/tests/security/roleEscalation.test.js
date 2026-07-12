// Role-escalation regressions: neither registration nor a profile update
// can let a caller elevate their own role/plan by simply including it in
// the request body — both controllers only destructure a fixed whitelist
// of fields off req.body.
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { createStudent, signTokenFor, unique } = require('../factories/userFactory');

describe('registration cannot set role', () => {
  test('sending role: "admin" at registration still creates a plain student', async () => {
    const username = unique('escalate');
    const res = await request(app).post('/api/auth/register').send({
      username,
      email: `${username}@test.local`,
      password: 'Test1234!',
      role: 'admin',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('student');

    const fromDb = await User.findOne({ username });
    expect(fromDb.role).toBe('student');
  });
});

describe('profile update cannot set role or plan', () => {
  test("a student sending role/plan in PUT /api/user/profile doesn't change them", async () => {
    const user = await createStudent({ plan: 'free' });
    const token = signTokenFor(user);

    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'admin', plan: 'premium', firstName: 'Still Student' });

    expect(res.status).toBe(200);

    const fromDb = await User.findById(user._id);
    expect(fromDb.role).toBe('student');
    expect(fromDb.plan).toBe('free');

    // The escalation attempt didn't even change the token's authority: /me
    // still reports the original role for the same token.
    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.body.user.role).toBe('student');
  });
});
