// Reading / Listening practice inside a course lesson (Mindset):
// WT1Lesson.practiceLinks point at a Passage / ListeningSection opened in the
// normal reading.html / listening.html. The student's results live in
// ReadingPracticeAttempt / ListeningPracticeAttempt (90-day TTL, like every
// other practice log). This module reads the best result per link — the
// lesson page shows it, and a Mindset lesson given as homework only ticks
// when every one of them reaches the pass bar (resourceCompletionService).
'use strict';

const mongoose = require('mongoose');
const ReadingPracticeAttempt = require('../models/ReadingPracticeAttempt');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');
const { COUNTABLE_ATTEMPT } = require('./attemptVisibility');

// practiceLinks[] → [{ kind: 'reading'|'listening', id }] (grammar / other links skipped)
function practiceRefs(links) {
  const out = [];
  for (const p of links || []) {
    const url = String((p && p.url) || '');
    let m = /^\/reading\.html\?(?:.*&)?passageId=([a-f0-9]{24})/i.exec(url);
    if (m) { out.push({ kind: 'reading', id: m[1] }); continue; }
    m = /^\/listening\.html\?(?:.*&)?sectionId=([a-f0-9]{24})/i.exec(url);
    if (m) out.push({ kind: 'listening', id: m[1] });
  }
  return out;
}

const pct = (a) => (a.totalQuestions ? Math.round((a.correctCount / a.totalQuestions) * 100) : 0);

// Best attempt per practice id → Map(id → { correct, total, percent, at, attempts })
async function bestScores(userId, refs) {
  const out = new Map();
  if (!userId || !refs.length) return out;
  const uid = new mongoose.Types.ObjectId(String(userId));
  const ids = (kind) => refs.filter((r) => r.kind === kind).map((r) => new mongoose.Types.ObjectId(r.id));
  const [reading, listening] = await Promise.all([
    ids('reading').length
      ? ReadingPracticeAttempt.find({ userId: uid, passageId: { $in: ids('reading') }, ...COUNTABLE_ATTEMPT })
        .select('passageId correctCount totalQuestions createdAt').lean().catch(() => [])
      : [],
    ids('listening').length
      ? ListeningPracticeAttempt.find({ userId: uid, sectionId: { $in: ids('listening') }, ...COUNTABLE_ATTEMPT })
        .select('sectionId correctCount totalQuestions createdAt').lean().catch(() => [])
      : [],
  ]);
  const take = (id, a) => {
    const key = String(id);
    const cur = out.get(key);
    const p = pct(a);
    const attempts = (cur ? cur.attempts : 0) + 1;
    if (!cur || p > cur.percent || (p === cur.percent && a.createdAt > cur.at)) {
      out.set(key, { correct: a.correctCount || 0, total: a.totalQuestions || 0, percent: p, at: a.createdAt, attempts });
    } else cur.attempts = attempts;
  };
  for (const a of reading) take(a.passageId, a);
  for (const a of listening) take(a.sectionId, a);
  return out;
}

// Lesson payload helper: practiceLinks with `result` (best score) attached.
async function withResults(userId, links) {
  const refs = practiceRefs(links);
  const best = await bestScores(userId, refs);
  return (links || []).map((p) => {
    const r = practiceRefs([p])[0];
    return r ? { ...p, result: best.get(r.id) || null } : p;
  });
}

module.exports = { practiceRefs, bestScores, withResults };
