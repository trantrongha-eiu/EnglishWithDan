// Integration tests for the local-auth flow: register, login, /me, and the
// forgot-password -> verify-otp -> reset-password chain. Also locks in the
// deliberate user-enumeration fix (login returns the identical status +
// message for "no such account" and "wrong password").
//
// Disable real email delivery BEFORE requiring the app: this repo's local
// .env carries real Gmail credentials (config/index.js's dotenv.config()
// only fills in vars not already set), and without this override
// forgot-password would attempt a live SMTP send on every test run. Forcing
// them empty here makes authService.requestPasswordReset() take its
// 'email_not_configured' branch instead, which still writes the OTP onto
// the user document — exactly what this suite reads back.
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';

const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { createStudent, createUser, signTokenFor, unique } = require('../factories/userFactory');

describe('POST /api/auth/register', () => {
  test('creates a new account and returns a token + user payload', async () => {
    const username = unique('newuser');
    const res = await request(app).post('/api/auth/register').send({
      username,
      email: `${username}@test.local`,
      password: 'Test1234!',
      firstName: 'New',
      lastName: 'User',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.username).toBe(username);
    expect(res.body.user.role).toBe('student');

    const saved = await User.findOne({ username });
    expect(saved).toBeTruthy();
    expect(saved.role).toBe('student');
  });

  test('rejects a duplicate email with 400', async () => {
    const existing = await createUser({ email: 'dup-email@test.local' });
    const res = await request(app).post('/api/auth/register').send({
      username: unique('anotherusername'),
      email: existing.email,
      password: 'Test1234!',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects a duplicate username with 400', async () => {
    const existing = await createUser({ username: 'dup-username' });
    const res = await request(app).post('/api/auth/register').send({
      username: existing.username,
      email: `${unique('freshemail')}@test.local`,
      password: 'Test1234!',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects missing required fields with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'only-email@test.local' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  test('correct credentials return 200 + a token', async () => {
    const user = await createUser({ email: `${unique('loginok')}@test.local`, rawPassword: 'CorrectPass1!' });
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'CorrectPass1!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe(user.email);
  });

  test('wrong password and nonexistent email return the identical 401 status + message (user-enumeration fix)', async () => {
    const user = await createUser({ email: `${unique('wrongpass')}@test.local`, rawPassword: 'CorrectPass1!' });

    const wrongPasswordRes = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'TotallyWrongPass1!' });
    const noSuchUserRes = await request(app)
      .post('/api/auth/login')
      .send({ email: `${unique('doesnotexist')}@test.local`, password: 'Whatever1!' });

    expect(wrongPasswordRes.status).toBe(401);
    expect(noSuchUserRes.status).toBe(401);
    expect(wrongPasswordRes.body).toEqual(noSuchUserRes.body);
    expect(wrongPasswordRes.body.success).toBe(false);
  });

  test('a banned user cannot log in even with correct credentials (403)', async () => {
    const user = await createUser({
      email: `${unique('banned')}@test.local`,
      rawPassword: 'CorrectPass1!',
      isBanned: true,
    });
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'CorrectPass1!' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/auth/me', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns the requesting user payload when authenticated', async () => {
    const user = await createStudent({ username: unique('meuser') });
    const token = signTokenFor(user);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(String(user._id));
    expect(res.body.user.username).toBe(user.username);
  });
});

describe('forgot-password -> verify-otp -> reset-password flow', () => {
  test('completes the full reset flow using the OTP read directly off the User document', async () => {
    const user = await createUser({ email: `${unique('resetflow')}@test.local`, rawPassword: 'OldPass123!' });

    // Step 1 — request the OTP. Email is forced "not configured" above, so
    // the service returns 'email_not_configured' and the controller answers
    // 500 — but it still writes the OTP onto the user document first, which
    // is all this flow needs to proceed.
    const forgotRes = await request(app).post('/api/auth/forgot-password').send({ email: user.email });
    expect(forgotRes.status).toBe(500);

    const withOtp = await User.findOne({ email: user.email });
    expect(withOtp.resetOTP).toMatch(/^\d{6}$/);

    // Step 2 — verify the OTP.
    const verifyRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: user.email, otp: withOtp.resetOTP });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(typeof verifyRes.body.resetToken).toBe('string');

    // Step 3 — reset the password using the resetToken.
    const resetRes = await request(app).post('/api/auth/reset-password').send({
      resetToken: verifyRes.body.resetToken,
      newPassword: 'BrandNewPass456!',
    });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // The new password now works, the old one doesn't.
    const loginNew = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'BrandNewPass456!' });
    expect(loginNew.status).toBe(200);

    const loginOld = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'OldPass123!' });
    expect(loginOld.status).toBe(401);
  });

  test('verify-otp rejects an incorrect code with 400', async () => {
    const user = await createUser({ email: `${unique('badotp')}@test.local` });
    await request(app).post('/api/auth/forgot-password').send({ email: user.email });
    const res = await request(app).post('/api/auth/verify-otp').send({ email: user.email, otp: '000000' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
