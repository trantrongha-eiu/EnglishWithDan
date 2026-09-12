'use strict';

// Extracted from controllers/auth.controller.js, verbatim logic —
// register/login/OTP/reset-password business logic previously lived
// directly in the controller alongside signToken/userPayload helpers.
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const { escapeHtml } = require('../utils/escapeHtml');
const logger = require('../utils/logger');
const { sendEmail } = require('./emailService');
const { isDisposableEmail } = require('../utils/disposableEmailDomains');
const { applyStreakActivity } = require('../utils/streak');

const MAX_OTP_ATTEMPTS = 5;
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // link valid 24h

// Email delivery is optional infrastructure in this app (config/index.js
// never throws on missing vars). When it isn't configured we can't run a
// verify-email step at all, so registration degrades to the previous
// behavior: account is auto-verified and the 24h trial runs from
// createdAt. On a properly configured deployment this is always true and
// the anti-farming gate is enforced.
function emailConfigured() {
  return !!(config.email.user && config.email.pass);
}

function hashVerifyToken(raw) {
  return crypto.createHash('sha256').update(String(raw)).digest('hex');
}

// Public site origin for links we email out. FRONTEND_URL is set in prod;
// the hard fallback keeps the verification link absolute (and clickable
// from an inbox) even if the env var is ever missing — a relative link in
// an email is dead.
const PUBLIC_SITE_URL = 'https://ieltsthayha.com';

async function sendVerificationEmail(user, rawToken) {
  const base = (config.frontendUrl || process.env.FRONTEND_URL || PUBLIC_SITE_URL).replace(/\/$/, '');
  const link = `${base}/verify-email.html?token=${rawToken}`;
  const name = escapeHtml(user.firstName || user.username || '');
  return sendEmail(
    user.email,
    'Xác minh email - EnglishWithDan',
    `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #667eea;">EnglishWithDan</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Nhấn nút bên dưới để xác minh email và kích hoạt <strong>1 ngày dùng thử miễn phí</strong> của bạn:</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${link}" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;display:inline-block;">Xác minh email</a>
        </p>
        <p style="color:#888;font-size:13px;">Hoặc mở liên kết này: <br>${link}</p>
        <p style="color:#888;font-size:12px;">Liên kết có hiệu lực trong <strong>24 giờ</strong>. Nếu bạn không tạo tài khoản này, hãy bỏ qua email.</p>
      </div>
    `
  );
}

// Fixed dummy hash so the "no such account"/"social-only account" login
// paths still pay bcrypt's ~80-150ms cost — without this, those paths
// return near-instantly while a real wrong-password guess takes much
// longer, letting an attacker distinguish them by response time alone
// even after the response message/status was unified (security audit finding).
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('timing-attack-mitigation', 10);

function signToken(userId) {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '7d' });
}

function userPayload(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '',
    plan: user.plan || 'free',
    planExpiresAt: user.planExpiresAt || null,
    planStartedAt: user.planStartedAt || null,
    studyReminderCount: user.studyReminderCount || 0,
    tuitionReminderCount: user.tuitionReminderCount || 0,
    lastVocabStudyDate: user.lastVocabStudyDate || null,
    // Self-set IELTS target band — the daily vocab word target scales with
    // it (streakBonusService.dailyWordTargetForBand).
    targetBand: user.targetBand || null,
    // Anchor for the free-plan 24h trial window (backend/utils/plan.js's
    // hasFullAccess) — the frontend needs this to compute
    // AuthService.hasPremiumAccess() without a round trip per check.
    createdAt: user.createdAt || null,
    // Anti trial-farming: an unverified local account has no trial until
    // the email is confirmed; trialStartedAt (verification time) is the
    // trial anchor when present. Mirrored in AuthService.isWithinTrial().
    emailVerified: user.emailVerified !== false,
    trialStartedAt: user.trialStartedAt || null
  };
}

async function findOrCreateGoogleUser(profile) {
  let user = await User.findOne({ googleId: profile.id });
  if (user) return user;

  const email = profile.emails?.[0]?.value;
  user = email ? await User.findOne({ email }) : null;

  if (user) {
    user.googleId = profile.id;
    user.authProvider = 'google';
    if (!user.avatar) user.avatar = profile.photos?.[0]?.value || '';
  } else {
    const base = (profile.displayName || 'user').toLowerCase().replace(/\s+/g, '');
    let username = base;
    let i = 1;
    while (await User.findOne({ username })) { username = `${base}${i++}`; }

    user = new User({
      googleId: profile.id,
      email: email || `${profile.id}@google.oauth`,
      username,
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      avatar: profile.photos?.[0]?.value || '',
      authProvider: 'google',
      // Google has already proven ownership of this address — no
      // verify-email step, trial runs from createdAt as before.
      emailVerified: true
    });
  }
  await user.save();
  return user;
}

async function registerUser({ firstName, lastName, username, email, password }) {
  // Anti trial-farming: block registration from known throwaway-mailbox
  // providers so "one disposable inbox per account" stops being a cheap
  // way to reset the 24h trial. Real providers are never on this list.
  if (isDisposableEmail(email)) {
    logger.auth('Blocked registration from disposable email domain', { email });
    return { status: 'disposable' };
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return { status: 'duplicate' };

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ firstName, lastName, username, email, password: hashed });

  // Anti trial-farming: when email delivery is configured, a new local
  // account starts UNVERIFIED and gets no 24h trial until the emailed
  // link is used (which also sets trialStartedAt). Client never sees the
  // token or a session — it must go verify. If email isn't configured
  // (dev / misconfigured deploy) we fall back to the old behavior so the
  // product still works.
  if (emailConfigured()) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.emailVerified = false;
    user.emailVerifyTokenHash = hashVerifyToken(rawToken);
    user.emailVerifyExpires = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);
    await user.save();
    const sent = await sendVerificationEmail(user, rawToken);
    if (!sent) {
      // Transient SMTP failure — the account exists and stays unverified;
      // the user recovers via POST /resend-verification. Log loudly.
      logger.auth('Verification email failed to send at registration', { userId: String(user._id) });
    }
    return { status: 'ok', needsEmailVerification: true, email: user.email };
  }

  user.emailVerified = true; // no way to verify → don't strand the user
  await user.save();
  logger.auth('Registered without email verification (email not configured)', { userId: String(user._id) });
  return { status: 'ok', needsEmailVerification: false, token: signToken(user._id), user: userPayload(user) };
}

// Consumes a raw verification token from the emailed link. Single-use
// (the hash is cleared on success), time-limited (emailVerifyExpires),
// and it's what starts the 24h trial clock (trialStartedAt). Returns a
// fresh session on success so the client can go straight into the app.
async function verifyEmailToken(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') return { status: 'invalid' };
  const user = await User.findOne({
    emailVerifyTokenHash: hashVerifyToken(rawToken),
    emailVerifyExpires: { $gt: new Date() },
  }).select('+emailVerifyTokenHash');
  // Covers wrong token, expired token, and a token already consumed
  // (hash cleared) — all indistinguishable to the caller, no user
  // enumeration.
  if (!user) return { status: 'invalid' };

  if (!user.trialStartedAt) user.trialStartedAt = new Date(); // start the trial once, now
  user.emailVerified = true;
  user.emailVerifyTokenHash = '';
  user.emailVerifyExpires = null;
  await user.save();

  logger.auth('Email verified', { userId: String(user._id) });
  return { status: 'ok', token: signToken(user._id), user: userPayload(user) };
}

// Re-sends the verification link. Always reports the same generic
// outcome to the caller (see controller) so it can't be used to probe
// which emails exist or which are already verified.
async function resendVerification(email) {
  if (!emailConfigured()) return { status: 'noop' };
  const user = await User.findOne({ email });
  if (!user || user.emailVerified || user.authProvider !== 'local') return { status: 'noop' };

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.emailVerifyTokenHash = hashVerifyToken(rawToken);
  user.emailVerifyExpires = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);
  await user.save();
  await sendVerificationEmail(user, rawToken);
  return { status: 'sent' };
}

async function loginUser({ email, password }) {
  // bcrypt.compare() requires a string and throws on anything else — a
  // password value that survives mongoSanitize as a non-string (e.g. an
  // object whose operator keys were stripped, leaving {}) reached
  // bcrypt.compare() below and threw, surfacing as a raw 500 instead of
  // the normal login-failure path (audit finding BUG-021). Reuses the
  // exact same 'not_found' status wrong-password/no-such-account already
  // return — same generic 401, same anti-enumeration property, and it
  // never reaches bcrypt at all, so it can't expose a bcrypt error either.
  if (typeof password !== 'string' || !password) {
    return { status: 'not_found' };
  }
  const user = await User.findOne({ $or: [{ email }, { username: email }] }).select('+password');
  if (!user || !user.password) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH); // pay the same time cost as a real check
    return { status: user ? 'social_only' : 'not_found' };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    // Wrong-password attempts were previously invisible in logs — a
    // sustained credential-stuffing run against /api/auth/login left no
    // trace even after the fact (production-readiness audit finding).
    logger.auth('Wrong password attempt', { email });
    return { status: 'wrong_password' };
  }

  if (user.isBanned) {
    logger.auth('Login attempt on banned account', { userId: String(user._id) });
    return { status: 'banned' };
  }

  return { status: 'ok', token: signToken(user._id), user: userPayload(user) };
}

async function requestPasswordReset(email) {
  const user = await User.findOne({ email });
  if (!user) return { status: 'no_such_user' };

  // Generate 6-digit OTP — crypto.randomInt (CSPRNG), not Math.random()
  const otp = crypto.randomInt(100000, 1000000).toString();
  user.resetOTP = otp;
  user.resetOTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  user.resetOTPAttempts = 0;
  await user.save();

  // Send email if nodemailer is configured
  if (config.email.user && config.email.pass) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: config.email.user, pass: config.email.pass }
      });
      await transporter.sendMail({
        from: `"EnglishWithDan" <${config.email.user}>`,
        to: email,
        subject: 'Mã xác nhận đặt lại mật khẩu - EnglishWithDan',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 10px;">
            <h2 style="color: #667eea;">EnglishWithDan</h2>
            <p>Xin chào <strong>${escapeHtml(user.firstName || user.username)}</strong>,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu. Mã xác nhận của bạn là:</p>
            <div style="background: linear-gradient(135deg,#667eea,#764ba2); color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px;">${otp}</span>
            </div>
            <p style="color: #888;">Mã có hiệu lực trong <strong>15 phút</strong>. Không chia sẻ mã này với ai.</p>
            <p style="color: #888; font-size: 12px;">Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
          </div>
        `
      });
    } catch (mailErr) {
      console.error('[Auth] Email error:', mailErr.message);
      // Still return success but log the error
    }
    return { status: 'sent' };
  }

  // Never log the raw OTP — if this fires, email isn't configured at all.
  console.error('[Auth] EMAIL_USER/EMAIL_PASS not configured — cannot deliver password-reset OTP');
  return { status: 'email_not_configured' };
}

async function verifyOTP(email, otp) {
  // Atomically claim one guess in the same op that checks eligibility —
  // a separate read-then-write (findOne, check in JS, then save) let
  // concurrent requests all read the same stale attempt count and each
  // pass the "< 5 attempts" gate, bypassing the intended lockout under a
  // burst of parallel requests (security audit finding). A single
  // findOneAndUpdate with the attempt cap in the filter is atomic at the
  // DB level, so only requests that see a genuinely-still-under-cap
  // document can increment it.
  const user = await User.findOneAndUpdate(
    {
      email,
      resetOTP: { $ne: '' },
      resetOTPExpires: { $gt: new Date() },
      resetOTPAttempts: { $lt: MAX_OTP_ATTEMPTS }
    },
    { $inc: { resetOTPAttempts: 1 } },
    { new: true }
  );
  if (!user) return { status: 'invalid' }; // no matching pending OTP, or attempt cap already hit

  if (user.resetOTP !== otp) {
    logger.auth('Wrong OTP guess on password reset', { email, attempts: user.resetOTPAttempts });
    return { status: 'invalid' };
  }

  // Correct OTP — reset the attempt counter and issue a short-lived reset token
  user.resetOTPAttempts = 0;
  await user.save();
  const resetToken = jwt.sign({ id: user._id, purpose: 'reset' }, config.jwtSecret, { expiresIn: '15m' });
  return { status: 'ok', resetToken };
}

async function resetPassword(resetToken, newPassword) {
  let decoded;
  try {
    decoded = jwt.verify(resetToken, config.jwtSecret);
  } catch {
    return { status: 'bad_token' };
  }

  if (decoded.purpose !== 'reset') return { status: 'bad_purpose' };

  const user = await User.findById(decoded.id);
  if (!user) return { status: 'not_found' };

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetOTP = '';
  user.resetOTPExpires = null;
  user.resetOTPAttempts = 0;
  // BUG-023: a password reset is exactly the "someone may have had access
  // to my account" scenario — invalidate any token issued before this
  // moment (including one an attacker used to get here, and the user's
  // own other devices). No fresh token is issued here: the frontend
  // already leaves the user on the login page after a successful reset,
  // never carrying a session forward (see login.html's forgot-password
  // modal), so there's nothing to keep alive.
  user.tokenValidAfter = new Date();
  await user.save();
  return { status: 'ok' };
}

// Synchronous (not async) — matches the original googleCallback, which
// fire-and-forgets the streak update, never awaited. Atomic (see
// applyStreakActivity's comment) instead of the old updateStreak()+save()
// pattern, which could race a concurrent activity's own save.
function completeGoogleLogin(user) {
  applyStreakActivity(User, user._id).catch(console.error);
  return { token: signToken(user._id), user: userPayload(user) };
}

// BUG-023 — called on explicit logout. Invalidates every token issued for
// this user up to this instant, on every device (see User.tokenValidAfter
// / middleware/auth.js's revocation check) — there's no per-device session
// tracking in this app, so "log out" means "this user, everywhere."
async function logoutAllSessions(userId) {
  await User.updateOne({ _id: userId }, { tokenValidAfter: new Date() });
}

module.exports = {
  signToken, userPayload, findOrCreateGoogleUser,
  registerUser, verifyEmailToken, resendVerification,
  loginUser, requestPasswordReset, verifyOTP, resetPassword, completeGoogleLogin,
  logoutAllSessions,
};
