// Integration tests for the email-verification anti trial-farming flow:
//   POST /api/auth/register           (email configured → no session, verify required)
//   POST /api/auth/verify-email       (consume link → session + trial starts)
//   POST /api/auth/resend-verification
// plus the trial gate itself (utils/plan.js) seen through a real
// requirePremium-gated route.
//
// Unlike auth.test.js, this file KEEPS email delivery "configured" so the
// verify-email branch is exercised. nodemailer is mocked globally in
// setupTestDb.js, so nothing is actually sent.
process.env.EMAIL_USER = process.env.EMAIL_USER || 'test-mailer@example.com';
process.env.EMAIL_PASS = process.env.EMAIL_PASS || 'test-pass';

const request = require('supertest');
const crypto = require('crypto');
const app = require('../../app');
const User = require('../../models/User');
const {
  createStudent, createPremiumStudent, createAdmin, createUser, signTokenFor, unique,
} = require('../factories/userFactory');

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const GATED = '/api/vocab/unit/1'; // auth + requirePremium(); 403 iff no full access

async function makeUnverified(rawToken, { expiresInMs = 60 * 60 * 1000, extra = {} } = {}) {
  return User.create({
    username: unique('ev'), email: `${unique('ev')}@test.local`,
    password: '$2a$04$abcdefghijklmnopqrstuv', // any bcrypt-shaped string; login not exercised here
    emailVerified: false,
    emailVerifyTokenHash: sha256(rawToken),
    emailVerifyExpires: new Date(Date.now() + expiresInMs),
    ...extra,
  });
}

describe('POST /api/auth/register — email configured', () => {
  test('creates the account but returns NO session; response says verification is needed', async () => {
    const username = unique('reg');
    const res = await request(app).post('/api/auth/register').send({
      username, email: `${username}@test.local`, password: 'Test1234!', firstName: 'A', lastName: 'B',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.needsEmailVerification).toBe(true);
    expect(res.body.token).toBeUndefined();
    expect(res.body.user).toBeUndefined();

    const saved = await User.findOne({ username }).select('+emailVerifyTokenHash');
    expect(saved.emailVerified).toBe(false);
    expect(saved.trialStartedAt).toBeNull();
    expect(saved.emailVerifyTokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  test('case 9 — client cannot self-grant: emailVerified / trialStartedAt / plan in the body are ignored', async () => {
    const username = unique('tamper');
    const res = await request(app).post('/api/auth/register').send({
      username, email: `${username}@test.local`, password: 'Test1234!',
      emailVerified: true, trialStartedAt: new Date(Date.now() - 1000), plan: 'premium', role: 'admin',
    });
    expect(res.body.needsEmailVerification).toBe(true);

    const saved = await User.findOne({ username });
    expect(saved.emailVerified).toBe(false);
    expect(saved.trialStartedAt).toBeNull();
    expect(saved.plan).toBe('free');
    expect(saved.role).toBe('student');
  });

  test('rejects a disposable-email registration with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: unique('disp'), email: 'farmer@mailinator.com', password: 'Test1234!',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/email/i);
  });

  test('case 1 — a freshly registered (unverified) user gets NO trial on a premium-gated route', async () => {
    const user = await makeUnverified(crypto.randomBytes(32).toString('hex'));
    const res = await request(app).get(GATED).set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });
});

describe('POST /api/auth/verify-email', () => {
  test('case 2 — valid token: verifies, starts the trial, returns a session, and unlocks gated routes', async () => {
    const raw = crypto.randomBytes(32).toString('hex');
    const user = await makeUnverified(raw);

    const res = await request(app).post('/api/auth/verify-email').send({ token: raw });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.emailVerified).toBe(true);

    const saved = await User.findById(user._id).select('+emailVerifyTokenHash');
    expect(saved.emailVerified).toBe(true);
    expect(saved.trialStartedAt).toBeInstanceOf(Date);
    expect(saved.emailVerifyTokenHash).toBe('');

    // The returned session now passes the premium gate (still inside 24h).
    const gated = await request(app).get(GATED).set('Authorization', `Bearer ${res.body.token}`);
    expect(gated.status).not.toBe(403);
  });

  test('case 6 — invalid token → 400, no session', async () => {
    const res = await request(app).post('/api/auth/verify-email').send({ token: 'garbage-token' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.token).toBeUndefined();
  });

  test('case 7 — expired token → 400, account stays unverified', async () => {
    const raw = crypto.randomBytes(32).toString('hex');
    const user = await makeUnverified(raw, { expiresInMs: -1000 });

    const res = await request(app).post('/api/auth/verify-email').send({ token: raw });
    expect(res.status).toBe(400);
    expect((await User.findById(user._id)).emailVerified).toBe(false);
  });

  test('case 8 — reusing a token that already worked → 400 (single-use)', async () => {
    const raw = crypto.randomBytes(32).toString('hex');
    await makeUnverified(raw);

    expect((await request(app).post('/api/auth/verify-email').send({ token: raw })).status).toBe(200);
    expect((await request(app).post('/api/auth/verify-email').send({ token: raw })).status).toBe(400);
  });

  test('missing token → 400 (no crash)', async () => {
    expect((await request(app).post('/api/auth/verify-email').send({})).status).toBe(400);
  });
});

describe('POST /api/auth/resend-verification', () => {
  test('always returns the same generic 200 — unknown email, verified account, or a real resend', async () => {
    const unverified = await makeUnverified(crypto.randomBytes(32).toString('hex'));
    const verified = await createStudent();

    for (const email of [unverified.email, verified.email, 'nobody@test.local']) {
      const res = await request(app).post('/api/auth/resend-verification').send({ email });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    }

    // The unverified account actually got a fresh token/expiry rotated in.
    const after = await User.findById(unverified._id).select('+emailVerifyTokenHash');
    expect(after.emailVerifyTokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(after.emailVerified).toBe(false);
  });
});

describe('trial gate — backward compatibility (utils/plan.js via a real gated route)', () => {
  test('case 3 — existing premium user keeps access regardless of email/createdAt', async () => {
    const user = await createPremiumStudent({
      extra: { createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), emailVerified: true },
    });
    const res = await request(app).get(GATED).set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).not.toBe(403);
  });

  test('case 4 — expired premium (plan flips to free, old account) → 403', async () => {
    const user = await createUser({
      role: 'student', plan: 'premium',
      planExpiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      extra: { createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    const res = await request(app).get(GATED).set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
    expect((await User.findById(user._id)).plan).toBe('free'); // auth middleware auto-downgraded
  });

  test('case 5 — staff (teacher/admin) always has access, verified or not', async () => {
    const admin = await createAdmin({
      extra: { createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), emailVerified: false },
    });
    const res = await request(app).get(GATED).set('Authorization', `Bearer ${signTokenFor(admin)}`);
    expect(res.status).not.toBe(403);
  });

  test('pre-feature account (no emailVerified field stored) still gets its createdAt-based trial', async () => {
    const user = await createStudent({ extra: { createdAt: new Date() } });
    await User.collection.updateOne({ _id: user._id }, { $unset: { emailVerified: '' } });
    const res = await request(app).get(GATED).set('Authorization', `Bearer ${signTokenFor(user)}`);
    expect(res.status).not.toBe(403);
  });
});
