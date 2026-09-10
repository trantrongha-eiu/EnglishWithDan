'use strict';

// Deep-walks an outgoing response payload and swaps every Cloudinary
// audio URL for a sealed, expiring proxy URL (services/mediaTokenService).
// The client then only ever sees `<backend>/api/media/listening?token=…`,
// never the permanent public Cloudinary secure_url.
//
// `canMint` (default true) — pass `hasFullAccess(req.user)` from any call
// site whose route is NOT already requirePremium-gated (the listening
// history endpoints). When false, the audio URL is dropped to '' instead:
// no fresh media token is issued, and (as always) the raw Cloudinary URL
// is never emitted. This stops a lapsed premium/trial user from re-minting
// 1h audio tokens by re-hitting a history endpoint (P2 regression finding).
//
// Only these keys are rewritten (audio is the audited premium asset —
// chart/map `imageUrl`s are left as-is for now; extend AUDIO_KEYS or add
// an image pass when that's tackled). Non-Cloudinary values (legacy local
// paths, empty strings) are ignored by isProtectableUrl().
const config = require('../config');
const { sealMediaUrl, isProtectableUrl } = require('../services/mediaTokenService');

const AUDIO_KEYS = new Set(['audioUrl', 'audioUrlSnapshot']);
const MAX_DEPTH = 8; // payloads are shallow; guard against pathological nesting / cycles

function mediaBase() {
  return (config.backendUrl || 'https://englishwithdan.onrender.com').replace(/\/$/, '');
}

/**
 * @param {*} payload   the object about to be JSON-serialised to the client (mutated in place)
 * @param {string} userId  the requesting user (goes into the token, for logging / limiter keying)
 * @param {boolean} [canMint=true]  false ⇒ drop audio URLs to '' instead of minting a token
 * @returns the same payload
 */
function protectListeningAudio(payload, userId, canMint = true) {
  const base = mediaBase();
  const seen = new WeakSet();

  const walk = (node, depth) => {
    if (!node || typeof node !== 'object' || depth > MAX_DEPTH) return;
    if (seen.has(node)) return;
    seen.add(node);

    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    for (const k of Object.keys(node)) {
      const v = node[k];
      if (AUDIO_KEYS.has(k) && isProtectableUrl(v)) {
        node[k] = canMint
          ? `${base}/api/media/listening?token=${encodeURIComponent(sealMediaUrl(v, userId))}`
          : '';
      } else if (v && typeof v === 'object') {
        walk(v, depth + 1);
      }
    }
  };

  walk(payload, 0);
  return payload;
}

module.exports = { protectListeningAudio };
