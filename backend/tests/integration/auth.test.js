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
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/User');
const { createStudent, createUser, signTokenFor, unique } = require('../factories/userFactory');

describe('POST /api/auth/register', () => {
  // The email is checked for real/fake up front (utils/emailCheck) instead
  // of via an emailed link, so a passing account is active immediately and
  // can log in straight away. DNS is stubbed — tests never hit the network.
  const dns = require('dns');
  const { _mxCache } = require('../../utils/emailCheck');
  let resolveMx;
  beforeEach(() => {
    _mxCache.clear();
    resolveMx = jest.spyOn(dns.promises, 'resolveMx');
  });
  afterEach(() => resolveMx.mockRestore());

  const body = (overrides = {}) => {
    const username = unique('newuser');
    return { username, email: `${username}@gmail.com`, password: 'Test1234!', firstName: 'New', lastName: 'User', ...overrides };
  };

  test('real email: 201, account active with trial started, then login works at once', async () => {
    const payload = body({ email: `Mixed.Case${Date.now()}@Gmail.com` });
    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeUndefined(); // no session — client goes to login.html
    expect(res.body.email).toBe(payload.email.toLowerCase());
    expect(resolveMx).not.toHaveBeenCalled(); // big providers skip DNS

    const user = await User.findOne({ username: payload.username });
    expect(user.email).toBe(payload.email.toLowerCase());
    expect(user.emailVerified).toBe(true);
    expect(user.trialStartedAt).toBeInstanceOf(Date);

    // Typed with the original casing at login — still matches.
    const login = await request(app).post('/api/auth/login').send({ email: payload.email, password: payload.password });
    expect(login.status).toBe(200);
    expect(login.body.user.emailVerified).toBe(true);
  });

  test('custom domain with MX records is accepted', async () => {
    resolveMx.mockResolvedValue([{ exchange: 'mx.school.edu.vn', priority: 10 }]);
    const payload = body({ email: `${unique('st')}@school.edu.vn` });
    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(201);
    expect(resolveMx).toHaveBeenCalledWith('school.edu.vn');
  });

  test.each([
    ['domain with no mail server', 'someone@no-such-domain-xyz.com', 'no_mx'],
    ['disposable inbox', 'someone@mailinator.com', 'disposable'],
    ['impossible Gmail name', 'abc@gmail.com', 'gmail_invalid'],
    ['typo\'d domain', 'someone@gmial.com', 'typo'],
    ['malformed', 'not-an-email', 'invalid'],
  ])('fake email (%s) → 400 BAD_EMAIL, no account', async (_label, email, reason) => {
    resolveMx.mockRejectedValue(Object.assign(new Error('nx'), { code: 'ENOTFOUND' }));
    const payload = body({ email });
    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('BAD_EMAIL');
    expect(res.body.reason).toBe(reason);
    if (reason === 'typo') expect(res.body.suggestion).toBe('someone@gmail.com');
    expect(await User.findOne({ username: payload.username })).toBeNull();
  });

  test('DNS outage fails open — a real student is never blocked by infra trouble', async () => {
    resolveMx.mockRejectedValue(Object.assign(new Error('servfail'), { code: 'ESERVFAIL' }));
    const res = await request(app).post('/api/auth/register').send(body({ email: `${unique('x')}@company.vn` }));
    expect(res.status).toBe(201);
  });

  test('duplicate email or username → 400', async () => {
    const first = body();
    expect((await request(app).post('/api/auth/register').send(first)).status).toBe(201);
    const dupEmail = await request(app).post('/api/auth/register').send(body({ email: first.email.toUpperCase() }));
    expect(dupEmail.status).toBe(400);
    const dupUser = await request(app).post('/api/auth/register').send(body({ username: first.username }));
    expect(dupUser.status).toBe(400);
  });

  test('short password / bad username → 400', async () => {
    expect((await request(app).post('/api/auth/register').send(body({ password: 'short' }))).status).toBe(400);
    expect((await request(app).post('/api/auth/register').send(body({ username: 'a b' }))).status).toBe(400);
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

  // Regression coverage for BUG-021 (2026-08-27 audit): a non-string
  // password (surviving mongoSanitize as e.g. {} once its $-operator keys
  // were stripped) reached bcrypt.compare() and threw, surfacing as a raw
  // 500 with no indication of what went wrong — instead of the normal
  // login-failure path.
  describe('non-string password values (BUG-021)', () => {
    test.each([
      ['null', null],
      ['an empty object', {}],
      ['an array', []],
      ['a number', 12345],
      ['a boolean', true],
    ])('password: %s never 500s — same clean 401 as a real wrong password', async (_label, password) => {
      const user = await createUser({ email: `${unique('badpwtype')}@test.local`, rawPassword: 'CorrectPass1!' });
      const res = await request(app).post('/api/auth/login').send({ email: user.email, password });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      // No bcrypt error / stack trace / implementation detail leaked.
      expect(JSON.stringify(res.body).toLowerCase()).not.toMatch(/bcrypt|stack|at\s+\w+\s*\(/);
    });

    test('an empty string password also gets the clean 401, not a crash', async () => {
      const user = await createUser({ email: `${unique('emptypw')}@test.local`, rawPassword: 'CorrectPass1!' });
      const res = await request(app).post('/api/auth/login').send({ email: user.email, password: '' });
      expect(res.status).toBe(401);
    });

    test('a valid string password still logs in normally (no regression)', async () => {
      const user = await createUser({ email: `${unique('goodpwtype')}@test.local`, rawPassword: 'CorrectPass1!' });
      const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'CorrectPass1!' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
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

// BUG-023: logout must revoke the session server-side, not just clear the
// client's localStorage — otherwise a "logged out" token stays valid for
// up to 7 more days against every protected route.
describe('POST /api/auth/logout', () => {
  test('requires authentication', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });

  // Tokens are signed with an explicit iat a few seconds in the past —
  // middleware/auth.js deliberately treats a token issued in the SAME
  // second as the revocation event as still valid (see its comment: this
  // is what lets change-password reissue a working token for the current
  // request instant), which real login→logout timing is never close
  // enough to hit, but a synchronous test signing the token immediately
  // before logging out could.
  function tokenIssuedSecondsAgo(user, seconds) {
    return jwt.sign({ id: user._id, iat: Math.floor(Date.now() / 1000) - seconds }, process.env.JWT_SECRET, { expiresIn: '7d' });
  }

  test('invalidates the token used to call it — a subsequent request with the same token 401s', async () => {
    const user = await createStudent({ username: unique('logoutuser') });
    const token = tokenIssuedSecondsAgo(user, 5);

    const logoutRes = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(401);
  });

  test('invalidates every token for that user, not just the one used to log out (all-devices revocation)', async () => {
    const user = await createStudent({ username: unique('multidevice') });
    const phoneToken = tokenIssuedSecondsAgo(user, 5);
    const laptopToken = tokenIssuedSecondsAgo(user, 3);

    await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${phoneToken}`);

    const laptopRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${laptopToken}`);
    expect(laptopRes.status).toBe(401);
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
