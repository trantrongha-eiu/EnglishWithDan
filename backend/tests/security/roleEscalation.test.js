// Role-escalation regression: a profile update can't let a caller elevate
// their own role/plan by simply including it in the request body — the
// controller only destructures a fixed whitelist of fields off req.body.
// (Email/password registration was removed; accounts come from Google OAuth.)
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { createStudent, signTokenFor } = require('../factories/userFactory');

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
