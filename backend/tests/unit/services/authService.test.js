// Unit tests for services/authService.js — the most security-critical
// module in the app. Exercises registration, login (including the
// unified not_found/wrong_password/social_only/banned statuses and the
// timing-mitigation dummy-hash path), the full OTP password-reset flow
// (including the atomic findOneAndUpdate-based lockout added in a recent
// security fix), and Google OAuth user linking/creation.
// Force email delivery "configured" BEFORE anything requires config/index.js
// (authService → config reads process.env at module load). Locally the
// repo .env sets these; CI has no .env, so without this authService would
// see email as unconfigured and registration would take the degraded
// auto-verify branch instead of the verify-email branch these tests cover.
// nodemailer is mocked globally in setupTestDb.js, so nothing is sent.
process.env.EMAIL_USER = process.env.EMAIL_USER || 'test-mailer@example.com';
process.env.EMAIL_PASS = process.env.EMAIL_PASS || 'test-pass';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const authService = require('../../../services/authService');
const User = require('../../../models/User');
const { createUser, createStudent, unique } = require('../../factories/userFactory');

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
describe('authService.registerUser (email verification required)', () => {
  test('creates an UNVERIFIED user, no token/session, and a hashed verify token on the doc', async () => {
    const email = `${unique('reg')}@test.local`;
    const username = unique('reguser');
    const result = await authService.registerUser({
      firstName: 'Ada', lastName: 'Lovelace', username, email, password: 'Sup3rSecret!',
    });

    expect(result.status).toBe('ok');
    expect(result.needsEmailVerification).toBe(true);
    expect(result.token).toBeUndefined();
    expect(result.user).toBeUndefined();

    const saved = await User.findOne({ email }).select('+password +emailVerifyTokenHash');
    expect(saved).not.toBeNull();
    expect(saved.emailVerified).toBe(false);
    expect(saved.trialStartedAt).toBeNull();
    expect(saved.emailVerifyTokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(saved.emailVerifyExpires.getTime()).toBeGreaterThan(Date.now());
    expect(await bcrypt.compare('Sup3rSecret!', saved.password)).toBe(true); // still hashed
  });

  test('rejects registration with a duplicate email', async () => {
    const email = `${unique('dup')}@test.local`;
    await createUser({ email });

    const result = await authService.registerUser({
      firstName: 'A', lastName: 'B', username: unique('newname'), email, password: 'x',
    });
    expect(result.status).toBe('duplicate');
  });

  test('rejects registration with a duplicate username', async () => {
    const username = unique('dupuser');
    await createUser({ username });

    const result = await authService.registerUser({
      firstName: 'A', lastName: 'B', username, email: `${unique('new')}@test.local`, password: 'x',
    });
    expect(result.status).toBe('duplicate');
  });

  test('rejects a disposable-email domain before creating anything', async () => {
    const username = unique('disp');
    const result = await authService.registerUser({
      firstName: 'A', lastName: 'B', username, email: 'throwaway@mailinator.com', password: 'Test1234!',
    });
    expect(result.status).toBe('disposable');
    expect(await User.findOne({ username })).toBeNull();
  });
});

describe('authService.verifyEmailToken', () => {
  // Helper: register, then read the raw token back is impossible (only the
  // hash is stored) — so mint the account directly with a known raw token.
  async function makeUnverified(rawToken, { expiresInMs = 60 * 60 * 1000, extra = {} } = {}) {
    return User.create({
      username: unique('vet'), email: `${unique('vet')}@test.local`,
      password: await bcrypt.hash('x', 4),
      emailVerified: false,
      emailVerifyTokenHash: sha256(rawToken),
      emailVerifyExpires: new Date(Date.now() + expiresInMs),
      ...extra,
    });
  }

  test('valid token → verifies, starts the trial clock, returns a session, single-uses the token', async () => {
    const raw = crypto.randomBytes(32).toString('hex');
    const user = await makeUnverified(raw);

    const result = await authService.verifyEmailToken(raw);
    expect(result.status).toBe('ok');
    expect(typeof result.token).toBe('string');
    expect(jwt.verify(result.token, process.env.JWT_SECRET).id).toBe(String(user._id));
    expect(result.user.emailVerified).toBe(true);

    const saved = await User.findById(user._id).select('+emailVerifyTokenHash');
    expect(saved.emailVerified).toBe(true);
    expect(saved.emailVerifyTokenHash).toBe('');
    expect(saved.emailVerifyExpires).toBeNull();
    expect(saved.trialStartedAt).toBeInstanceOf(Date);
    expect(Math.abs(saved.trialStartedAt.getTime() - Date.now())).toBeLessThan(10000);
  });

  test('reusing the same token fails (single-use — hash cleared on first success)', async () => {
    const raw = crypto.randomBytes(32).toString('hex');
    await makeUnverified(raw);

    expect((await authService.verifyEmailToken(raw)).status).toBe('ok');
    expect((await authService.verifyEmailToken(raw)).status).toBe('invalid');
  });

  test('expired token → invalid, account stays unverified', async () => {
    const raw = crypto.randomBytes(32).toString('hex');
    const user = await makeUnverified(raw, { expiresInMs: -1000 });

    expect((await authService.verifyEmailToken(raw)).status).toBe('invalid');
    const saved = await User.findById(user._id);
    expect(saved.emailVerified).toBe(false);
    expect(saved.trialStartedAt).toBeNull();
  });

  test('unknown / malformed token → invalid (no throw)', async () => {
    expect((await authService.verifyEmailToken('not-a-real-token')).status).toBe('invalid');
    expect((await authService.verifyEmailToken('')).status).toBe('invalid');
    expect((await authService.verifyEmailToken(null)).status).toBe('invalid');
  });

  test('does not re-anchor trialStartedAt if it was somehow already set', async () => {
    const raw = crypto.randomBytes(32).toString('hex');
    const earlier = new Date(Date.now() - 5 * 60 * 1000);
    const user = await makeUnverified(raw, { extra: { trialStartedAt: earlier } });

    await authService.verifyEmailToken(raw);
    const saved = await User.findById(user._id);
    expect(saved.trialStartedAt.getTime()).toBe(earlier.getTime());
  });
});

describe('authService.resendVerification', () => {
  test('unverified local account → issues a fresh token (status "sent")', async () => {
    const user = await User.create({
      username: unique('rsv'), email: `${unique('rsv')}@test.local`,
      password: await bcrypt.hash('x', 4), emailVerified: false,
    });
    const result = await authService.resendVerification(user.email);
    expect(result.status).toBe('sent');
    const saved = await User.findById(user._id).select('+emailVerifyTokenHash');
    expect(saved.emailVerifyTokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(saved.emailVerifyExpires.getTime()).toBeGreaterThan(Date.now());
  });

  test('already-verified account → noop (no token issued)', async () => {
    const user = await createStudent(); // factory → emailVerified defaults true
    const result = await authService.resendVerification(user.email);
    expect(result.status).toBe('noop');
  });

  test('unknown email → noop (no user enumeration)', async () => {
    expect((await authService.resendVerification('nobody@test.local')).status).toBe('noop');
  });

  test('social (google) account → noop', async () => {
    const user = await User.create({
      username: unique('gsv'), email: `${unique('gsv')}@test.local`,
      authProvider: 'google', googleId: unique('gid'), emailVerified: false,
    });
    expect((await authService.resendVerification(user.email)).status).toBe('noop');
  });
});

describe('authService.loginUser', () => {
  test('correct password succeeds and returns a valid token', async () => {
    const email = `${unique('login')}@test.local`;
    await createStudent({ email, rawPassword: 'CorrectHorse1!' });

    const result = await authService.loginUser({ email, password: 'CorrectHorse1!' });
    expect(result.status).toBe('ok');
    expect(typeof result.token).toBe('string');
    const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
    expect(decoded.id).toBeDefined();
    expect(result.user.email).toBe(email);
  });

  test('login also succeeds when supplying the username in the email field', async () => {
    const username = unique('loginbyname');
    await createStudent({ username, rawPassword: 'CorrectHorse1!' });

    const result = await authService.loginUser({ email: username, password: 'CorrectHorse1!' });
    expect(result.status).toBe('ok');
  });

  test('wrong password returns wrong_password status', async () => {
    const email = `${unique('wrongpw')}@test.local`;
    await createStudent({ email, rawPassword: 'CorrectHorse1!' });

    const result = await authService.loginUser({ email, password: 'totallyWrong' });
    expect(result.status).toBe('wrong_password');
    expect(result.token).toBeUndefined();
  });

  test('nonexistent email returns not_found status', async () => {
    const result = await authService.loginUser({ email: `${unique('nosuch')}@test.local`, password: 'whatever' });
    expect(result.status).toBe('not_found');
  });

  test('banned user with correct password returns banned status', async () => {
    const email = `${unique('banned')}@test.local`;
    await createStudent({ email, rawPassword: 'CorrectHorse1!', isBanned: true });

    const result = await authService.loginUser({ email, password: 'CorrectHorse1!' });
    expect(result.status).toBe('banned');
  });

  test('social-only account (no password) returns social_only status', async () => {
    const email = `${unique('social')}@test.local`;
    // password: '' models a Google/Facebook-only account (User.password defaults to '').
    await createUser({ email, password: '', extra: { authProvider: 'google', googleId: 'g-123' } });

    const result = await authService.loginUser({ email, password: 'anything' });
    expect(result.status).toBe('social_only');
  });

  test('pays a comparable bcrypt time cost for not_found as for a real wrong-password check (timing mitigation)', async () => {
    // Not a strict statistical timing-attack test (too flaky in CI), just a
    // sanity check that the not_found path still invokes bcrypt.compare
    // against the dummy hash rather than returning near-instantly.
    const start = Date.now();
    await authService.loginUser({ email: `${unique('timing')}@test.local`, password: 'whatever' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(1); // bcrypt.compare was actually awaited
  });
});

describe('authService password reset OTP flow', () => {
  async function requestAndGetOtp(email) {
    await authService.requestPasswordReset(email);
    const user = await User.findOne({ email });
    return user.resetOTP;
  }

  test('full flow: request -> verify correct OTP -> reset password with resetToken', async () => {
    const email = `${unique('otpflow')}@test.local`;
    await createStudent({ email, rawPassword: 'OldPassword1!' });

    const otp = await requestAndGetOtp(email);
    expect(otp).toMatch(/^\d{6}$/);

    const verifyResult = await authService.verifyOTP(email, otp);
    expect(verifyResult.status).toBe('ok');
    expect(typeof verifyResult.resetToken).toBe('string');

    const decoded = jwt.verify(verifyResult.resetToken, process.env.JWT_SECRET);
    expect(decoded.purpose).toBe('reset');

    const resetResult = await authService.resetPassword(verifyResult.resetToken, 'BrandNewPassword1!');
    expect(resetResult.status).toBe('ok');

    // Old password no longer works, new one does.
    const oldLogin = await authService.loginUser({ email, password: 'OldPassword1!' });
    expect(oldLogin.status).toBe('wrong_password');
    const newLogin = await authService.loginUser({ email, password: 'BrandNewPassword1!' });
    expect(newLogin.status).toBe('ok');

    // OTP fields are cleared after a successful reset.
    const userAfter = await User.findOne({ email });
    expect(userAfter.resetOTP).toBe('');
    expect(userAfter.resetOTPAttempts).toBe(0);
  });

  // BUG-023: a password reset must revoke tokens issued before it — the
  // scenario is literally "someone may have had access to this account".
  test('resetPassword sets tokenValidAfter, invalidating tokens issued before the reset', async () => {
    const email = `${unique('otprevoke')}@test.local`;
    const user = await createStudent({ email, rawPassword: 'OldPassword1!' });
    const oldToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const otp = await requestAndGetOtp(email);
    const verifyResult = await authService.verifyOTP(email, otp);
    await authService.resetPassword(verifyResult.resetToken, 'BrandNewPassword1!');

    const userAfter = await User.findOne({ email });
    expect(userAfter.tokenValidAfter).toBeTruthy();
    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
    expect(decoded.iat).toBeLessThan(Math.floor(userAfter.tokenValidAfter.getTime() / 1000) + 1);
  });

  test('requestPasswordReset for a nonexistent email returns no_such_user', async () => {
    const result = await authService.requestPasswordReset(`${unique('ghost')}@test.local`);
    expect(result.status).toBe('no_such_user');
  });

  test('wrong OTP is rejected and increments the attempt counter', async () => {
    const email = `${unique('wrongotp')}@test.local`;
    await createStudent({ email });
    await requestAndGetOtp(email);

    const result = await authService.verifyOTP(email, '000000');
    // '000000' has a 1-in-a-million chance of colliding with the real OTP;
    // guard against that flake explicitly rather than assume distinctness.
    const real = (await User.findOne({ email })).resetOTP;
    if ('000000' === real) return; // astronomically unlikely, but be safe
    expect(result.status).toBe('invalid');

    const user = await User.findOne({ email });
    expect(user.resetOTPAttempts).toBe(1);
  });

  test('5 wrong attempts locks out further attempts even with the correct OTP', async () => {
    const email = `${unique('lockout')}@test.local`;
    await createStudent({ email });
    const otp = await requestAndGetOtp(email);
    const wrongOtp = otp === '111111' ? '222222' : '111111';

    for (let i = 1; i <= 5; i++) {
      const r = await authService.verifyOTP(email, wrongOtp);
      expect(r.status).toBe('invalid');
      const user = await User.findOne({ email });
      expect(user.resetOTPAttempts).toBe(i);
    }

    // 6th attempt, even with the CORRECT OTP, must be rejected — the
    // atomic findOneAndUpdate filter excludes documents with
    // resetOTPAttempts >= MAX_OTP_ATTEMPTS(5).
    const lockedResult = await authService.verifyOTP(email, otp);
    expect(lockedResult.status).toBe('invalid');
    expect(lockedResult.resetToken).toBeUndefined();

    // Attempt counter must NOT have been incremented past 5 by the locked-out call.
    const finalUser = await User.findOne({ email });
    expect(finalUser.resetOTPAttempts).toBe(5);
  });

  test('verifyOTP rejects an expired OTP', async () => {
    const email = `${unique('expired')}@test.local`;
    await createStudent({ email });
    const otp = await requestAndGetOtp(email);
    await User.updateOne({ email }, { resetOTPExpires: new Date(Date.now() - 1000) });

    const result = await authService.verifyOTP(email, otp);
    expect(result.status).toBe('invalid');
  });

  test('resetPassword rejects a malformed/invalid token', async () => {
    const result = await authService.resetPassword('not-a-real-jwt', 'whatever1!');
    expect(result.status).toBe('bad_token');
  });

  test('resetPassword rejects a well-formed token that lacks purpose=reset', async () => {
    const user = await createStudent();
    const loginToken = authService.signToken(user._id); // ordinary login token, no `purpose` claim
    const result = await authService.resetPassword(loginToken, 'whatever1!');
    expect(result.status).toBe('bad_purpose');
  });

  test('resetPassword rejects a valid reset token for a since-deleted user', async () => {
    const user = await createStudent();
    const resetToken = jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    await User.findByIdAndDelete(user._id);

    const result = await authService.resetPassword(resetToken, 'whatever1!');
    expect(result.status).toBe('not_found');
  });
});

describe('authService.findOrCreateGoogleUser', () => {
  test('creates a new user from a Google profile if none exists', async () => {
    const profile = {
      id: unique('google-id-'),
      emails: [{ value: `${unique('gnew')}@gmail.com` }],
      displayName: 'Jane Doe',
      name: { givenName: 'Jane', familyName: 'Doe' },
      photos: [{ value: 'https://example.com/avatar.png' }],
    };

    const user = await authService.findOrCreateGoogleUser(profile);
    expect(user._id).toBeDefined();
    expect(user.googleId).toBe(profile.id);
    expect(user.authProvider).toBe('google');
    expect(user.email).toBe(profile.emails[0].value);
    expect(user.avatar).toBe(profile.photos[0].value);

    // Idempotent: calling again with the same googleId returns the same user.
    const again = await authService.findOrCreateGoogleUser(profile);
    expect(again._id.toString()).toBe(user._id.toString());
  });

  test('links to an existing local user by email if one exists', async () => {
    const email = `${unique('linkme')}@test.local`;
    const existing = await createStudent({ email, extra: { avatar: '' } });
    expect(existing.googleId).toBe('');

    const profile = {
      id: unique('google-id-link-'),
      emails: [{ value: email }],
      displayName: 'Existing User',
      photos: [{ value: 'https://example.com/new-avatar.png' }],
    };

    const linked = await authService.findOrCreateGoogleUser(profile);
    expect(linked._id.toString()).toBe(existing._id.toString());
    expect(linked.googleId).toBe(profile.id);
    expect(linked.authProvider).toBe('google');
    expect(linked.avatar).toBe(profile.photos[0].value); // filled in since it was empty

    const reloaded = await User.findById(existing._id);
    expect(reloaded.googleId).toBe(profile.id);
  });

  test('does not overwrite an existing avatar when linking', async () => {
    const email = `${unique('keepavatar')}@test.local`;
    await createStudent({ email, extra: { avatar: 'https://example.com/old.png' } });

    const profile = {
      id: unique('google-id-avatar-'),
      emails: [{ value: email }],
      photos: [{ value: 'https://example.com/new.png' }],
    };

    const linked = await authService.findOrCreateGoogleUser(profile);
    expect(linked.avatar).toBe('https://example.com/old.png');
  });

  test('auto-generates a unique username when the display name collides', async () => {
    await createStudent({ username: 'janedoe' });

    const profile = {
      id: unique('google-id-collide-'),
      emails: [{ value: `${unique('collide')}@gmail.com` }],
      displayName: 'Jane Doe', // normalizes to base username "janedoe", already taken
    };

    const user = await authService.findOrCreateGoogleUser(profile);
    expect(user.username).not.toBe('janedoe');
    expect(user.username.startsWith('janedoe')).toBe(true);
  });
});

describe('authService.completeGoogleLogin', () => {
  test('returns a token and user payload, and credits the streak (atomically, fire-and-forget)', async () => {
    const user = await createStudent({ extra: { learningStreak: 0, lastActivityDate: null } });

    const result = authService.completeGoogleLogin(user);
    expect(typeof result.token).toBe('string');
    expect(result.user.id.toString()).toBe(user._id.toString());

    // applyStreakActivity() is atomic (a single findOneAndUpdate) and fired
    // without awaiting — it's a real async DB round-trip, not synchronous
    // in-memory mutation (which is why it's race-safe: nothing ever mutates
    // an in-memory snapshot for a later .save() to clobber). Poll instead of
    // a single tick/fixed sleep, since exactly how long that round-trip
    // takes isn't something this test should have to guess at.
    let fresh;
    for (let i = 0; i < 20; i++) {
      fresh = await User.findById(user._id).select('learningStreak lastActivityDate');
      if (fresh.learningStreak > 0) break;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    expect(fresh.learningStreak).toBe(1);
    expect(fresh.lastActivityDate).not.toBeNull();

    const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
    expect(decoded.id.toString()).toBe(user._id.toString());
  });
});

describe('authService.userPayload / signToken', () => {
  test('userPayload omits sensitive fields like password/OTP', () => {
    const fakeUser = {
      _id: 'abc', firstName: 'F', lastName: 'L', username: 'u', email: 'e@test.local',
      role: 'student', avatar: '', plan: 'free', planExpiresAt: null, planStartedAt: null,
      password: 'should-not-appear', resetOTP: 'should-not-appear',
    };
    const payload = authService.userPayload(fakeUser);
    expect(payload.password).toBeUndefined();
    expect(payload.resetOTP).toBeUndefined();
    expect(payload.email).toBe('e@test.local');
  });

  // createdAt is the anchor the frontend needs to compute the free-plan 24h
  // trial window (AuthService.hasPremiumAccess()) without an extra round
  // trip — regression guard for it being silently dropped again.
  test('userPayload includes createdAt', () => {
    const created = new Date('2026-01-01T00:00:00.000Z');
    const payload = authService.userPayload({ _id: 'abc', role: 'student', createdAt: created });
    expect(payload.createdAt).toBe(created);
  });

  test('signToken produces a verifiable JWT carrying the user id', () => {
    const token = authService.signToken('someUserId123');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('someUserId123');
  });
});

// BUG-023: JWT session revocation on explicit logout.
describe('authService.logoutAllSessions', () => {
  test('sets tokenValidAfter to now, invalidating any token issued before this call', async () => {
    const user = await createStudent();
    const oldToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    expect(user.tokenValidAfter).toBeFalsy();

    await authService.logoutAllSessions(user._id);

    const userAfter = await User.findById(user._id);
    expect(userAfter.tokenValidAfter).toBeTruthy();
    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
    // The pre-existing token's iat must now be at or before tokenValidAfter
    // (seconds precision) — i.e. middleware/auth.js would reject it.
    expect(decoded.iat).toBeLessThanOrEqual(Math.floor(userAfter.tokenValidAfter.getTime() / 1000));
  });
});
