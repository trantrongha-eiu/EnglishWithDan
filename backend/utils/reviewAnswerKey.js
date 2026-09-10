'use strict';

// Deep-deletes the answer-key fields (`correctAnswer`, `explanation`)
// anywhere in a completed-test / section review payload.
//
// The full-test review routes are auth-only (not requirePremium-gated) so
// a student can always look back at their own results — but a user who no
// longer has full access (lapsed premium / expired trial) must not be
// able to keep pulling the full answer key for every test they once sat.
// Controllers call this only when `!hasFullAccess(req.user)`; a
// premium/trial/staff user's review is returned untouched.
//
// Sibling of utils/protectMediaUrls.js's walker — same shallow-payload
// shape, same cycle guard.
const ANSWER_KEY_KEYS = new Set(['correctAnswer', 'explanation']);
const MAX_DEPTH = 10;

function stripReviewAnswerKey(payload) {
  const seen = new WeakSet();
  const walk = (node, depth) => {
    if (!node || typeof node !== 'object' || depth > MAX_DEPTH || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    for (const k of Object.keys(node)) {
      if (ANSWER_KEY_KEYS.has(k)) delete node[k];
      else walk(node[k], depth + 1);
    }
  };
  walk(payload, 0);
  return payload;
}

module.exports = { stripReviewAnswerKey };
