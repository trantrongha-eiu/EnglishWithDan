'use strict';

// Server-side copy of the highlights a student makes on a Reading/Listening
// attempt. They used to live ONLY in the browser's localStorage (keyed by
// attemptId), so reviewing on another device/browser, in a private window,
// after the browser evicted site data (iOS Safari does this after 7 days),
// or once localStorage filled up (it stored whole passage HTML per attempt
// and was never pruned) showed the review with every highlight gone.
//
// Stored shape (attempt.highlights):
//   { ts: <client ms timestamp of the last change>,
//     parts: { "<passage/part index>": {
//       p: [[start, end, colorKey, text], ...],  // passage/transcript, char offsets over its text
//       q: [text | { text, colorKey }, ...],      // questions panel, re-found by text
//     } } }
// Practice ("bài lẻ") attempts only ever use part "0".

const TestAttempt = require('../models/TestAttempt');
const ReadingPracticeAttempt = require('../models/ReadingPracticeAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');

const MODELS = {
  reading: TestAttempt,
  'reading-practice': ReadingPracticeAttempt,
  listening: ListeningAttempt,
  'listening-practice': ListeningPracticeAttempt,
};

const COLORS = new Set(['', 'green', 'purple', 'pink', 'orange']);
const MAX_PARTS = 10;
const MAX_ITEMS = 400;     // per list, per part
const MAX_TEXT = 3000;     // one highlighted stretch
const MAX_OFFSET = 2000000;
const MAX_BYTES = 200 * 1024;

function cleanText(t) {
  return typeof t === 'string' && t.trim() ? t.slice(0, MAX_TEXT) : null;
}

function cleanColor(c) {
  return typeof c === 'string' && COLORS.has(c) ? c : '';
}

function cleanRange(r) {
  if (!Array.isArray(r)) return null;
  const [s, e, c, t] = r;
  if (!Number.isInteger(s) || !Number.isInteger(e) || s < 0 || e <= s || e > MAX_OFFSET || e - s > MAX_TEXT) return null;
  const text = cleanText(t);
  if (!text) return null;
  return [s, e, cleanColor(c), text];
}

function cleanQuestionItem(item) {
  if (typeof item === 'string') return cleanText(item);
  if (item && typeof item === 'object') {
    const text = cleanText(item.text);
    if (!text) return null;
    const colorKey = cleanColor(item.colorKey);
    return colorKey ? { text, colorKey } : text;
  }
  return null;
}

// Returns the cleaned value, or null when the payload is not an object of
// the expected shape. Unknown keys and malformed entries are dropped rather
// than rejected, so one odd entry never costs the student the rest.
function sanitizeHighlights(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const parts = {};
  const rawParts = raw.parts && typeof raw.parts === 'object' && !Array.isArray(raw.parts) ? raw.parts : {};
  for (const key of Object.keys(rawParts).slice(0, MAX_PARTS)) {
    if (!/^\d{1,2}$/.test(key)) continue;
    const part = rawParts[key];
    if (!part || typeof part !== 'object') continue;
    const p = (Array.isArray(part.p) ? part.p : []).slice(0, MAX_ITEMS).map(cleanRange).filter(Boolean);
    const q = (Array.isArray(part.q) ? part.q : []).slice(0, MAX_ITEMS).map(cleanQuestionItem).filter(Boolean);
    if (p.length || q.length) parts[key] = { p, q };
  }
  const ts = Number.isFinite(raw.ts) && raw.ts > 0 ? Math.min(raw.ts, Date.now() + 60 * 1000) : Date.now();
  return { ts, parts };
}

function tooLarge(clean) {
  return Buffer.byteLength(JSON.stringify(clean), 'utf8') > MAX_BYTES;
}

// Owner-scoped: a student can only write highlights onto their own attempt.
// Returns 'ok' | 'bad_kind' | 'invalid' | 'too_large' | 'not_found'.
async function saveHighlights(kind, attemptId, userId, raw) {
  const Model = MODELS[kind];
  if (!Model) return 'bad_kind';
  const clean = sanitizeHighlights(raw);
  if (!clean) return 'invalid';
  if (tooLarge(clean)) return 'too_large';
  const res = await Model.updateOne({ _id: attemptId, userId }, { $set: { highlights: clean } });
  return res.matchedCount ? 'ok' : 'not_found';
}

module.exports = { saveHighlights, sanitizeHighlights, tooLarge, MODELS };
