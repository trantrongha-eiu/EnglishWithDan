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

const MAX_OTP_ATTEMPTS = 5;

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
    planStartedAt: user.planStartedAt || null
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
      authProvider: 'google'
    });
  }
  await user.save();
  return user;
}

async function registerUser({ firstName, lastName, username, email, password }) {
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return { status: 'duplicate' };

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ firstName, lastName, username, email, password: hashed });
  await user.save();

  return { status: 'ok', token: signToken(user._id), user: userPayload(user) };
}

async function loginUser({ email, password }) {
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
  await user.save();
  return { status: 'ok' };
}

// Synchronous (not async) — matches the original googleCallback, which
// fire-and-forgets the save (`user.save().catch(console.error)`, never awaited).
function completeGoogleLogin(user) {
  user.updateStreak();
  user.save().catch(console.error);
  return { token: signToken(user._id), user: userPayload(user) };
}

module.exports = {
  signToken, userPayload, findOrCreateGoogleUser,
  registerUser, loginUser, requestPasswordReset, verifyOTP, resetPassword, completeGoogleLogin,
};
