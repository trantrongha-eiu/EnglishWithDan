'use strict';

// Durable progress for the Task 2 Templates practice path (see
// models/Task2TemplateProgress.js). The browser sends what the student just
// finished; this service validates it and merges it into the stored row so
// progress only ever moves forward (except an explicit reset).

const Task2TemplateProgress = require('../models/Task2TemplateProgress');

const STEP_KEYS = ['warmup', 'read', 'drill', 'assemble', 'apply'];
const DAY = 24 * 60 * 60 * 1000;
// Wait before review N (stage index) — first review 1 day after the essay
// is first recalled in full, then 3, 7, 14, 30 days.
const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30];
const REVIEW_PASS_PERCENT = 60;
const MASTERY_KEY = /^\d{1,2}-\d{1,2}$/;
const MAX_MASTERY_KEYS = 150;
const MAX_PARAGRAPHS = 8;
const MAX_APPLY_CHARS = 6000;
const TYPE_ID = /^type\d{2}$/;

function normLevel(level) {
  return level === 'band6' ? 'band6' : (level === 'band7' ? 'band7' : null);
}

function clampInt(v, lo, hi) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return null;
  return Math.min(hi, Math.max(lo, n));
}

function toPlain(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const m = o.mastery;
  o.mastery = m instanceof Map ? Object.fromEntries(m) : (m || {});
  return {
    typeId: o.typeId, level: o.level, steps: o.steps || {},
    drillRounds: o.drillRounds || [], mastery: o.mastery,
    warmupScore: o.warmupScore || 0, assembleBest: o.assembleBest || 0,
    applyText: o.applyText || [],
    reviewStage: o.reviewStage || 0, nextReviewAt: o.nextReviewAt || null,
    lastReviewAt: o.lastReviewAt || null, updatedAt: o.updatedAt || null,
  };
}

async function getProgress(userId, level) {
  const lvl = normLevel(level);
  if (!lvl) return [];
  const rows = await Task2TemplateProgress.find({ userId, level: lvl }).lean();
  return rows.map(toPlain);
}

// Merges one update into the student's row. Returns the saved progress, or
// null when level/typeId are invalid.
async function saveProgress(userId, level, typeId, body = {}, now = new Date()) {
  try {
    return await _save(userId, level, typeId, body, now);
  } catch (err) {
    // Two first-time saves racing on the unique index — the second one
    // merges into the row the first one just created.
    if (err && err.code === 11000) return _save(userId, level, typeId, body, now);
    throw err;
  }
}

async function _save(userId, level, typeId, body, now) {
  const lvl = normLevel(level);
  if (!lvl || !TYPE_ID.test(String(typeId || ''))) return null;
  const key = { userId, level: lvl, typeId };

  if (body.reset === true) {
    await Task2TemplateProgress.deleteOne(key);
    return toPlain({ ...key, steps: {}, drillRounds: [], mastery: {} });
  }

  let doc = await Task2TemplateProgress.findOne(key);
  if (!doc) doc = new Task2TemplateProgress(key);

  // Steps: a step's date is set once, the first time it's reported done.
  const steps = body.steps && typeof body.steps === 'object' ? body.steps : {};
  for (const k of STEP_KEYS) {
    if (steps[k] && !doc.steps[k]) doc.steps[k] = now;
  }

  if (Array.isArray(body.drillRounds)) {
    const prev = doc.drillRounds || [];
    const next = [];
    const len = Math.min(MAX_PARAGRAPHS, Math.max(prev.length, body.drillRounds.length));
    for (let i = 0; i < len; i++) {
      next.push(Math.max(clampInt(prev[i], 0, 3) || 0, clampInt(body.drillRounds[i], 0, 3) || 0));
    }
    doc.drillRounds = next;
  }

  if (body.mastery && typeof body.mastery === 'object' && !Array.isArray(body.mastery)) {
    for (const [k, v] of Object.entries(body.mastery)) {
      if (!MASTERY_KEY.test(k)) continue;
      if (!doc.mastery.has(k) && doc.mastery.size >= MAX_MASTERY_KEYS) continue;
      const n = clampInt(v, 0, 5);
      if (n != null) doc.mastery.set(k, n);
    }
  }

  const ws = clampInt(body.warmupScore, 0, 100);
  if (ws != null) doc.warmupScore = Math.max(doc.warmupScore || 0, ws);
  const ab = clampInt(body.assembleBest, 0, 100);
  if (ab != null) doc.assembleBest = Math.max(doc.assembleBest || 0, ab);

  if (Array.isArray(body.applyText)) {
    doc.applyText = body.applyText.slice(0, MAX_PARAGRAPHS).map(s => String(s == null ? '' : s).slice(0, MAX_APPLY_CHARS));
  }

  // Spaced review: scheduled once the whole essay has been recalled.
  if (doc.steps.assemble && !doc.nextReviewAt) {
    doc.reviewStage = 0;
    doc.nextReviewAt = new Date(now.getTime() + REVIEW_INTERVAL_DAYS[0] * DAY);
  }
  if (body.reviewDone === true && doc.steps.assemble) {
    const score = clampInt(body.reviewScore, 0, 100);
    const passed = score == null || score >= REVIEW_PASS_PERCENT;
    const last = REVIEW_INTERVAL_DAYS.length - 1;
    doc.reviewStage = passed ? Math.min(last, (doc.reviewStage || 0) + 1) : Math.max(0, (doc.reviewStage || 0) - 1);
    const days = passed ? REVIEW_INTERVAL_DAYS[doc.reviewStage] : REVIEW_INTERVAL_DAYS[0];
    doc.nextReviewAt = new Date(now.getTime() + days * DAY);
    doc.lastReviewAt = now;
  }

  await doc.save();
  return toPlain(doc);
}

module.exports = { getProgress, saveProgress, REVIEW_INTERVAL_DAYS };
