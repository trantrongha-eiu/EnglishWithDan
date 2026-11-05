'use strict';

// One-PC + one-mobile login limit for students.
//
// Each student has two login slots on the User doc: activeSessions.desktop
// and activeSessions.mobile. A login fills the slot for its device type
// with a fresh random session id (sid) that also goes into the JWT. A newer
// login on the same device type overwrites the slot, so the older device's
// token stops matching and middleware/auth.js rejects it with
// code SESSION_REPLACED ("newest login wins" — never refusing the new
// login, so a student who cleared their browser can't get locked out).
//
// Staff, parents and guests are not limited.

const crypto = require('crypto');
const User = require('../models/User');

const DEVICE_TYPES = ['desktop', 'mobile'];

// Tablets count as mobile. iPadOS Safari reports a desktop (Mac) UA, so an
// iPad lands in the PC slot — still only 2 devices at once either way.
const MOBILE_UA_RE = /Mobi|Android|iPhone|iPad|iPod|Tablet|Silk|Kindle|Opera Mini|IEMobile|webOS|BlackBerry/i;

function deviceTypeFromUA(ua) {
  return MOBILE_UA_RE.test(String(ua || '')) ? 'mobile' : 'desktop';
}

function isLimited(user) {
  return !!user && (user.role || 'student') === 'student';
}

function deviceLabel(type) {
  return type === 'mobile' ? 'điện thoại' : 'máy tính';
}

// Claims a login slot for this request's device and returns the JWT claims
// to embed ({ sid, dt }), or null when the user isn't limited.
async function claimSlot(user, ctx) {
  if (!isLimited(user)) return null;
  const dt = deviceTypeFromUA(ctx && ctx.ua);
  const sid = crypto.randomBytes(16).toString('hex');
  await User.updateOne(
    { _id: user._id },
    { $set: { [`activeSessions.${dt}`]: {
      sid,
      at: new Date(),
      ua: String((ctx && ctx.ua) || '').slice(0, 300),
      ip: String((ctx && ctx.ip) || '').slice(0, 64),
    } } }
  );
  return { sid, dt };
}

// Frees this token's slot on logout — only if it still holds this sid, so
// a stale tab logging out can't kick the device that replaced it.
async function releaseSlot(userId, session) {
  if (!session || !session.sid || !DEVICE_TYPES.includes(session.dt)) return;
  await User.updateOne(
    { _id: userId, [`activeSessions.${session.dt}.sid`]: session.sid },
    { $unset: { [`activeSessions.${session.dt}`]: '' } }
  );
}

// 'ok' | 'replaced' for a verified token's claims against the user doc.
function checkSession(user, decoded) {
  if (!isLimited(user)) return 'ok';
  const slots = user.activeSessions || {};
  if (!decoded.sid) {
    // Token issued before this feature: allowed only until the student's
    // first new-style login anywhere (and at most its 7-day expiry), so
    // deploying this doesn't log every student out at once.
    return (slots.desktop && slots.desktop.sid) || (slots.mobile && slots.mobile.sid) ? 'replaced' : 'ok';
  }
  const slot = DEVICE_TYPES.includes(decoded.dt) ? slots[decoded.dt] : null;
  return slot && slot.sid === decoded.sid ? 'ok' : 'replaced';
}

// Request → the context claimSlot() needs.
function requestContext(req) {
  return { ua: req.get ? req.get('user-agent') : '', ip: req.ip || '' };
}

module.exports = { deviceTypeFromUA, isLimited, deviceLabel, claimSlot, releaseSlot, checkSession, requestContext, DEVICE_TYPES };
