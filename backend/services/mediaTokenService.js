'use strict';

// Sealed, expiring media tokens.
//
// Premium media (right now: Listening audio) is stored on Cloudinary as a
// permanent, unauthenticated `secure_url`. We must not hand that URL to
// the client, or a copied link works forever for anyone. Instead the API
// hands out `<backend>/api/media/listening?token=<sealed>` where the token
// is an AES-256-GCM sealed blob holding the real origin URL + an expiry +
// the user it was issued to.
//
//   - The sealing key is derived from a server-only secret
//     (config.media.tokenSecret) — it is NEVER sent to the frontend, and
//     the client cannot forge or read the token (GCM = confidential +
//     tamper-evident).
//   - Tokens expire (config.media.urlTtlSeconds) so a leaked/shared link
//     stops working shortly after.
//   - The media route (controllers/media.controller.js) opens the token,
//     re-checks the expiry and that the URL is one of ours, then streams
//     the bytes — the Cloudinary URL never reaches the browser.
//
// This is a delivery-layer protection, NOT authorization: the endpoints
// that ISSUE tokens stay behind their existing auth / requirePremium /
// own-content checks. The short TTL is what bounds link sharing.
const crypto = require('crypto');
const config = require('../config');

const ALG = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;

// Only these hosts may be proxied — a hard stop against the sealed-URL
// mechanism ever being pointed at an internal address (SSRF), even though
// the URL is always one we put in the token ourselves.
const ALLOWED_MEDIA_HOSTS = new Set(['res.cloudinary.com']);

function key() {
  const secret = config.media.tokenSecret;
  if (!secret) throw new Error('media.tokenSecret is not configured');
  return crypto.createHash('sha256').update(String(secret)).digest(); // 32 bytes
}

function b64urlEncode(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  return Buffer.from(String(str).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

// True if a stored URL is one we can/should protect (a Cloudinary asset).
// Non-Cloudinary values (legacy local paths like "img/course-x.jpg", empty
// strings) are left untouched by the rewrite pass.
function isProtectableUrl(url) {
  if (typeof url !== 'string' || !url) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && ALLOWED_MEDIA_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

/**
 * Seal an origin media URL into an opaque, expiring token.
 * @param {string} originUrl  the Cloudinary secure_url
 * @param {string|object} userId  who this token is issued to (for logging / limiter keying)
 * @param {number} [ttlSeconds]
 * @returns {string} url-safe token
 */
function sealMediaUrl(originUrl, userId, ttlSeconds = config.media.urlTtlSeconds) {
  const payload = JSON.stringify({
    u: userId ? String(userId) : null,
    url: originUrl,
    e: Math.floor(Date.now() / 1000) + Math.max(60, ttlSeconds),
  });
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALG, key(), iv);
  const ct = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return b64urlEncode(Buffer.concat([iv, tag, ct]));
}

/**
 * Open a sealed token.
 * @returns {{ ok: true, url: string, userId: string|null } | { ok: false, reason: 'malformed'|'expired' }}
 */
function openMediaToken(token) {
  let raw;
  try {
    raw = b64urlDecode(token);
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (!raw || raw.length < IV_LEN + TAG_LEN + 2) return { ok: false, reason: 'malformed' };

  const iv = raw.subarray(0, IV_LEN);
  const tag = raw.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ct = raw.subarray(IV_LEN + TAG_LEN);

  let payload;
  try {
    const decipher = crypto.createDecipheriv(ALG, key(), iv);
    decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
    payload = JSON.parse(pt.toString('utf8'));
  } catch {
    return { ok: false, reason: 'malformed' }; // wrong key, tampered, or not JSON
  }

  if (!payload || typeof payload.url !== 'string' || typeof payload.e !== 'number') {
    return { ok: false, reason: 'malformed' };
  }
  if (Math.floor(Date.now() / 1000) >= payload.e) return { ok: false, reason: 'expired' };
  if (!isProtectableUrl(payload.url)) return { ok: false, reason: 'malformed' };

  return { ok: true, url: payload.url, userId: payload.u || null };
}

module.exports = {
  sealMediaUrl,
  openMediaToken,
  isProtectableUrl,
  ALLOWED_MEDIA_HOSTS,
};
