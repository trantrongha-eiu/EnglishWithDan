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
// Staff, parents and guests are not limited: they can be signed in on any
// number of tabs, browsers and devices. Their tokens still carry a sid (no
// device type) so logging out ends only that one session — the sid goes
// into User.revokedSessions until the token would have expired anyway.

const crypto = require('crypto');
const User = require('../models/User');

const DEVICE_TYPES = ['desktop', 'mobile'];
// Matches the JWT lifetime in services/authService.js signToken().
const TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_REVOKED = 200;

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

function newSid() {
  return crypto.randomBytes(16).toString('hex');
}

// Coarse OS name from a user agent — part of the "same device" guess below.
function osFamily(ua) {
  const s = String(ua || '');
  if (/iPhone|iPad|iPod/i.test(s)) return 'ios';
  if (/Android/i.test(s)) return 'android';
  if (/Windows/i.test(s)) return 'windows';
  if (/Mac OS X|Macintosh/i.test(s)) return 'mac';
  if (/CrOS/i.test(s)) return 'chromeos';
  if (/Linux/i.test(s)) return 'linux';
  return 'other';
}

// Max sessions kept in one slot (tabs/browsers of the same device).
const MAX_SLOT_SIDS = 10;

function slotSids(slot) {
  if (!slot) return [];
  if (Array.isArray(slot.sids) && slot.sids.length) return slot.sids.filter(Boolean);
  return slot.sid ? [slot.sid] : [];
}

// The limit is per device, not per tab or browser: a login that comes from
// the device already holding the slot joins it instead of kicking it. Same
// device = same browser id (localStorage, sent by the login page), or the
// same IP + OS — which also covers a second browser on that device (Chrome
// + Edge, or Zalo/Facebook's in-app browser + Chrome on a phone).
function isSameDevice(slot, ctx) {
  if (!slot || !slotSids(slot).length) return false;
  if (ctx.deviceId && slot.deviceId && ctx.deviceId === slot.deviceId) return true;
  return !!ctx.ip && slot.ip === ctx.ip && osFamily(slot.ua) === osFamily(ctx.ua);
}

// Claims a login slot for this request's device and returns the JWT claims
// to embed ({ sid, dt }). Users without the limit get just { sid }: no slot,
// nobody is kicked.
async function claimSlot(user, ctx) {
  if (!user) return null;
  const sid = newSid();
  if (!isLimited(user)) return { sid };
  ctx = {
    ua: String((ctx && ctx.ua) || '').slice(0, 300),
    ip: String((ctx && ctx.ip) || '').slice(0, 64),
    deviceId: String((ctx && ctx.deviceId) || '').slice(0, 64),
  };
  const dt = deviceTypeFromUA(ctx.ua);
  const fresh = await User.findById(user._id).select('activeSessions').lean();
  const current = fresh && fresh.activeSessions ? fresh.activeSessions[dt] : null;
  const sameDevice = isSameDevice(current, ctx);
  const sids = sameDevice
    ? slotSids(current).filter((s) => s !== sid).concat(sid).slice(-MAX_SLOT_SIDS)
    : [sid];
  await User.updateOne(
    { _id: user._id },
    { $set: { [`activeSessions.${dt}`]: {
      sid,
      sids,
      deviceId: ctx.deviceId || (sameDevice && current.deviceId) || '',
      at: new Date(),
      ua: ctx.ua,
      ip: ctx.ip,
    } } }
  );
  return { sid, dt };
}

// Logout: this session leaves its slot — the device's other tabs/browsers
// stay signed in, and a stale tab can't kick the device that replaced it.
async function releaseSlot(userId, session) {
  if (!session || !session.sid || !DEVICE_TYPES.includes(session.dt)) return;
  const key = `activeSessions.${session.dt}`;
  await User.updateOne({ _id: userId, [`${key}.sids`]: session.sid }, { $pull: { [`${key}.sids`]: session.sid } });
  await User.updateOne({ _id: userId, [`${key}.sid`]: session.sid }, { $unset: { [`${key}.sid`]: '' } });
}

// Logout for an unlimited user's session: only this sid stops working, the
// user's other tabs/devices stay signed in. Expired entries are pruned.
async function revokeSession(userId, sid) {
  if (!sid) return;
  const now = new Date();
  await User.updateOne({ _id: userId }, { $pull: { revokedSessions: { exp: { $lte: now } } } });
  await User.updateOne(
    { _id: userId },
    { $push: { revokedSessions: {
      $each: [{ sid: String(sid), exp: new Date(now.getTime() + TOKEN_LIFETIME_MS) }],
      $slice: -MAX_REVOKED,
    } } }
  );
}

// 'ok' | 'replaced' | 'revoked' for a verified token's claims against the
// user doc.
function checkSession(user, decoded) {
  if (!isLimited(user)) {
    const revoked = decoded.sid && (user.revokedSessions || []).some((r) => r && r.sid === decoded.sid);
    return revoked ? 'revoked' : 'ok';
  }
  const slots = user.activeSessions || {};
  if (!decoded.sid) {
    // Token issued before this feature: allowed only until the student's
    // first new-style login anywhere (and at most its 7-day expiry), so
    // deploying this doesn't log every student out at once.
    return slotSids(slots.desktop).length || slotSids(slots.mobile).length ? 'replaced' : 'ok';
  }
  const slot = DEVICE_TYPES.includes(decoded.dt) ? slots[decoded.dt] : null;
  if (!slot) return 'replaced';
  return slot.sid === decoded.sid || (slot.sids || []).includes(decoded.sid) ? 'ok' : 'replaced';
}

// Request → the context claimSlot() needs.
function requestContext(req) {
  const body = req.body || {};
  const deviceId = typeof body.deviceId === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(body.deviceId) ? body.deviceId : '';
  return { ua: req.get ? req.get('user-agent') : '', ip: req.ip || '', deviceId };
}

module.exports = { deviceTypeFromUA, osFamily, isLimited, deviceLabel, claimSlot, releaseSlot, revokeSession, checkSession, requestContext, DEVICE_TYPES };
