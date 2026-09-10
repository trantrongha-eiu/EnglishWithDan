'use strict';

// Streaming proxy for protected media (Listening audio).
//
// The client is given `/api/media/listening?token=<sealed>` instead of the
// Cloudinary secure_url. This handler opens the token (server-only key),
// checks it hasn't expired and points at one of our hosts, then streams
// the bytes from Cloudinary through the API — forwarding the browser's
// Range header so <audio> seeking still works. The origin URL never
// reaches the browser, and the link stops working when the token expires.
//
// Redirects are followed MANUALLY (see fetchAllowedRedirects): the token's
// URL is validated up front, and every redirect hop's destination is
// re-validated against the same Cloudinary allowlist BEFORE it is
// requested — the server never fetches a host outside the allowlist.
//
// No `auth` middleware here on purpose: an <audio src> can't send an
// Authorization header, so the sealed token IS the credential. Premium /
// ownership was enforced at the moment the token was ISSUED (the listening
// endpoints that call protectListeningAudio are all behind auth +
// requirePremium or own-content checks); the short TTL bounds sharing.
const { Readable } = require('stream');
const { openMediaToken, isProtectableUrl } = require('../services/mediaTokenService');
const logger = require('../utils/logger');

// Headers worth relaying from Cloudinary → client for correct media playback.
const PASS_THROUGH = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'last-modified', 'etag'];

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;

// Fetch `startUrl`, following redirects MANUALLY so every hop's destination
// is checked against the same allowlist (`isProtectableUrl` →
// mediaTokenService.ALLOWED_MEDIA_HOSTS) BEFORE it is requested. `fetch`'s
// automatic `redirect: 'follow'` would blindly chase a `res.cloudinary.com`
// URL that 3xx-redirects to an arbitrary/internal host (SSRF). Reused
// host validation — no second allowlist.
async function fetchAllowedRedirects(startUrl, opts) {
  if (!isProtectableUrl(startUrl)) {
    const e = new Error('start URL is not an allowed media host');
    e.blockedHost = safeHost(startUrl);
    throw e;
  }
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const resp = await fetch(current, { ...opts, redirect: 'manual' });
    if (!REDIRECT_STATUSES.has(resp.status)) return resp; // final (non-redirect) response

    const location = resp.headers.get('location');
    try { await resp.body?.cancel(); } catch { /* drain the redirect response */ }
    if (!location) {
      const e = new Error(`redirect ${resp.status} with no Location`);
      e.badRedirect = true;
      throw e;
    }
    // Resolve a possibly-relative Location against the current URL, then
    // validate the destination host before we request it.
    let dest;
    try { dest = new URL(location, current).href; } catch {
      const e = new Error('unparseable redirect Location');
      e.badRedirect = true;
      throw e;
    }
    if (!isProtectableUrl(dest)) {
      const e = new Error('redirect to a non-allowed host');
      e.blockedHost = safeHost(dest);
      throw e;
    }
    current = dest;
  }
  const e = new Error('too many redirects');
  e.tooManyRedirects = true;
  throw e;
}

function safeHost(u) {
  try { return new URL(u).host; } catch { return '(unparseable)'; }
}

exports.streamListening = async (req, res) => {
  const opened = openMediaToken(req.query.token || '');
  if (!opened.ok) {
    // 403 for both malformed and expired — the frontend just needs "this
    // won't play, re-open the section". `MEDIA_URL_EXPIRED` lets the
    // client distinguish a stale link if it ever wants to.
    const code = opened.reason === 'expired' ? 'MEDIA_URL_EXPIRED' : 'MEDIA_URL_INVALID';
    return res.status(403).json({ success: false, message: 'Liên kết media không hợp lệ hoặc đã hết hạn.', code });
  }

  const range = req.headers.range;
  let upstream;
  try {
    upstream = await fetchAllowedRedirects(opened.url, {
      method: req.method === 'HEAD' ? 'HEAD' : 'GET',
      headers: range ? { Range: range } : {},
    });
  } catch (err) {
    // A redirect to a host outside the Cloudinary allowlist is a
    // (blocked) SSRF attempt — log the destination host server-side, never
    // to the client, and fail with the same generic error as any other
    // upstream problem.
    if (err.blockedHost || err.badRedirect || err.tooManyRedirects) {
      logger.security('Media proxy: blocked upstream redirect', {
        userId: opened.userId, reason: err.message, blockedHost: err.blockedHost || null,
      });
    } else {
      logger.security('Media proxy: upstream fetch failed', { userId: opened.userId, err: err.message });
    }
    return res.status(502).json({ success: false, message: 'Không tải được media lúc này.' });
  }

  if (!upstream.ok && upstream.status !== 206) {
    // 404 from Cloudinary (asset deleted), 5xx, etc. — relay a sane status,
    // never the upstream body.
    return res.status(upstream.status === 404 ? 404 : 502)
      .json({ success: false, message: 'Không tải được media lúc này.' });
  }

  res.status(upstream.status); // 200 or 206 (partial)
  for (const h of PASS_THROUGH) {
    const val = upstream.headers.get(h);
    if (val) res.setHeader(h, val);
  }
  if (!upstream.headers.get('accept-ranges')) res.setHeader('Accept-Ranges', 'bytes');
  // Private + short cache: a browser may reuse the bytes for the life of
  // the token, but shared/CDN caches must not hold a copy.
  res.setHeader('Cache-Control', 'private, max-age=600');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'HEAD' || !upstream.body) return res.end();

  Readable.fromWeb(upstream.body)
    .on('error', () => { if (!res.headersSent) res.status(502); res.end(); })
    .pipe(res);
};
