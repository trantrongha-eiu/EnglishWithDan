'use strict';

// No-login Entrance Test ("Test đầu vào" from the home page): a visitor types
// their name + phone, gets a `role: 'guest'` User and a short-lived token, and
// then runs the exact same proctored flow a logged-in student does
// (entranceTestService). middleware/auth.js limits a guest token to the
// Entrance Test APIs. Admins see the name + phone on the attempt.
//
// Each sign-up makes a NEW guest (never "log back in by phone number" —
// anyone could type someone else's number and read their result). The
// browser keeps the token, so the same device resumes / sees its results.

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { AppError } = require('../errors/AppError');
const { userPayload } = require('./authService');

const GUEST_TOKEN_TTL = '3d';

// Vietnamese mobile/landline, with or without +84 / spaces / dots / dashes.
function normalizePhone(raw) {
  let p = String(raw || '').replace(/[\s.\-()]/g, '');
  if (p.startsWith('+84')) p = '0' + p.slice(3);
  else if (p.startsWith('84') && p.length === 11) p = '0' + p.slice(2);
  return /^0\d{9,10}$/.test(p) ? p : null;
}

function normalizeName(raw) {
  const n = String(raw || '').replace(/\s+/g, ' ').trim();
  return n.length >= 2 && n.length <= 60 && /\p{L}/u.test(n) ? n : null;
}

// "Nguyễn Văn An" -> lastName "Nguyễn Văn", firstName "An" (how the site
// displays Vietnamese names elsewhere: `${lastName} ${firstName}`).
function splitName(full) {
  const parts = full.split(' ');
  if (parts.length === 1) return { firstName: full, lastName: '' };
  return { firstName: parts[parts.length - 1], lastName: parts.slice(0, -1).join(' ') };
}

async function createGuestSession({ name, phone }) {
  const fullName = normalizeName(name);
  if (!fullName) throw new AppError('Vui lòng nhập họ tên (2–60 ký tự).', 400);
  const tel = normalizePhone(phone);
  if (!tel) throw new AppError('Số điện thoại không hợp lệ (VD: 0912345678).', 400);

  const tag = crypto.randomBytes(6).toString('hex');
  const user = await User.create({
    username: `guest_${tag}`,
    // .invalid (RFC 2606) — never deliverable, so no mailer can reach it.
    email: `guest-${tag}@guest.invalid`,
    ...splitName(fullName),
    phone: tel,
    role: 'guest',
    authProvider: 'local',
    emailVerified: true,
  });
  const token = jwt.sign({ id: user._id, guest: true }, config.jwtSecret, { expiresIn: GUEST_TOKEN_TTL });
  return { token, user: userPayload(user) };
}

module.exports = { createGuestSession, normalizePhone, normalizeName, splitName };
