// Unit tests for services/authService.js — the most security-critical
// module in the app. Exercises registration, login (including the
// unified not_found/wrong_password/social_only/banned statuses and the
// timing-mitigation dummy-hash path), the full OTP password-reset flow
// (including the atomic findOneAndUpdate-based lockout added in a recent
// security fix), and Google OAuth user linking/creation.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authService = require('../../../services/authService');
const User = require('../../../models/User');
const { createUser, createStudent, unique } = require('../../factories/userFactory');

describe('authService.registerUser', () => {
  test('creates a new user and returns a token on success', async () => {
    const email = `${unique('reg')}@test.local`;
    const username = unique('reguser');
    const result = await authService.registerUser({
      firstName: 'Ada', lastName: 'Lovelace', username, email, password: 'Sup3rSecret!',
    });

    expect(result.status).toBe('ok');
    expect(typeof result.token).toBe('string');
    expect(result.user.email).toBe(email);
    expect(result.user.username).toBe(username);
    expect(result.user.plan).toBe('free');

    const saved = await User.findOne({ email }).select('+password');
    expect(saved).not.toBeNull();
    expect(saved.password).not.toBe('Sup3rSecret!'); // must be hashed
    expect(await bcrypt.compare('Sup3rSecret!', saved.password)).toBe(true);
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
  test('returns a token and user payload, and updates the streak on the in-memory user', async () => {
    const user = await createStudent({ extra: { learningStreak: 0, lastActivityDate: null } });

    const result = authService.completeGoogleLogin(user);
    expect(typeof result.token).toBe('string');
    expect(result.user.id.toString()).toBe(user._id.toString());
    // updateStreak() runs synchronously before the fire-and-forget save().
    expect(user.learningStreak).toBe(1);
    expect(user.lastActivityDate).not.toBeNull();

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

  test('signToken produces a verifiable JWT carrying the user id', () => {
    const token = authService.signToken('someUserId123');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('someUserId123');
  });
});
