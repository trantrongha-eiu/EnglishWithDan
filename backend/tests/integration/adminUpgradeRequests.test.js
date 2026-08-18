// Integration tests for PUT /api/admin/upgrade-requests/:id/approve —
// covers the atomic-claim fix for a double-approve race that could
// otherwise grant premium duration twice for one paid request (see
// backend/routes/admin/premium.js).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createUpgradeRequest } = require('../factories/contentFactory');
const User = require('../../models/User');

describe('PUT /api/admin/upgrade-requests/:id/approve', () => {
  test('approves a pending request and grants the requested months of premium', async () => {
    const admin = await createAdmin();
    const adminToken = signTokenFor(admin);
    const student = await createStudent();
    const upgradeRequest = await createUpgradeRequest({ userId: student._id, months: 3 });

    const res = await request(app)
      .put(`/api/admin/upgrade-requests/${upgradeRequest._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(200);

    const updated = await User.findById(student._id);
    expect(updated.plan).toBe('premium');
    expect(updated.planExpiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  test('a second approve on an already-approved request is rejected and does not grant premium again', async () => {
    const admin = await createAdmin();
    const adminToken = signTokenFor(admin);
    const student = await createStudent();
    const upgradeRequest = await createUpgradeRequest({ userId: student._id, months: 1 });

    const first = await request(app)
      .put(`/api/admin/upgrade-requests/${upgradeRequest._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(first.status).toBe(200);
    const afterFirst = await User.findById(student._id);
    const expiryAfterFirst = afterFirst.planExpiresAt.getTime();

    // Simulates the losing side of a race (double-click, or two admin
    // sessions): the request is no longer 'pending', so the atomic
    // findOneAndUpdate({_id, status:'pending'}) filter in the route must
    // not match, and grantPremium() must never run a second time.
    const second = await request(app)
      .put(`/api/admin/upgrade-requests/${upgradeRequest._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(second.status).toBe(400);

    const afterSecond = await User.findById(student._id);
    expect(afterSecond.planExpiresAt.getTime()).toBe(expiryAfterFirst); // not extended a second time
  });

  test('404s for a nonexistent request', async () => {
    const admin = await createAdmin();
    const adminToken = signTokenFor(admin);
    const res = await request(app)
      .put('/api/admin/upgrade-requests/000000000000000000000000/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(404);
  });
});
