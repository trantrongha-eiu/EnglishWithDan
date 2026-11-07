'use strict';

// Speaking Part 2 · 7 câu chuyện gốc (speaking-part2.html).
//  - content: the full story text is Premium-only (served by the API, not a
//    static file); everyone else gets the story list to see what's inside.
//  - progress: per student per story, merged from the page (several devices
//    may sync) — the 5 step flags are recomputed here from the raw keys so a
//    client can't simply claim "done".
//  - homework: `speaking_part2` (resourceCompletionService) — one pickable
//    row per story, done once all 5 steps are done.

const mongoose = require('mongoose');
const DATA = require('../data/speakingPart2');
const SpeakingPart2Progress = require('../models/SpeakingPart2Progress');
const { hasFullAccess } = require('../utils/plan');

const STEP_KEYS = ['read', 'vocab', 'fixed', 'why', 'speak'];
const MIN_WHY = 2; // ④ needs this many cue-card variants (or all, if fewer)

const STORIES = DATA.stories;
const byId = new Map(STORIES.map((s) => [s.id, s]));

// Homework catalog rows: a story has no document of its own, so each gets a
// stable made-up ObjectId (same idea as task1_skill). Never renumber.
const STORY_ROWS = STORIES.map((s, i) => ({
  _id: new mongoose.Types.ObjectId(`7732${String(i + 1).padStart(20, '0')}`),
  code: s.id, name: `${s.no} · ${s.group} — ${s.title}`,
}));

// Every valid progress key of a story, grouped by step.
function keysOf(st) {
  const fixed = [];
  st.fixed.forEach((sec, si) => sec.s.forEach((_, j) => fixed.push(`f${si}.${j}`)));
  return {
    vocab: st.vocab.map((_, i) => `v${i}`),
    fixed,
    why: st.why.map((w, k) => w.s.map((_, j) => `w${k}.${j}`)),
    con: st.conclusion.map((_, j) => `c${j}`),
  };
}
const KEYS = new Map(STORIES.map((s) => [s.id, keysOf(s)]));
const ALL_KEYS = new Map([...KEYS].map(([id, k]) => [id, new Set([...k.vocab, ...k.fixed, ...k.why.flat(), ...k.con])]));

// Same rules as the page's stepStatus().
function stepsDone(storyId, doc) {
  const k = KEYS.get(storyId);
  if (!k || !doc) return {};
  const ok = new Set(doc.ok || []);
  const all = (list) => list.every((x) => ok.has(x));
  const whyDone = k.why.filter(all).length;
  return {
    read: !!doc.read,
    vocab: all(k.vocab),
    fixed: all(k.fixed),
    why: whyDone >= Math.min(MIN_WHY, k.why.length) && all(k.con),
    speak: (Number(doc.speak) || 0) > 0,
  };
}

// ── content ─────────────────────────────────────────────────────────────
function summaryOf(st) {
  return {
    id: st.id, no: st.no, group: st.group, emoji: st.emoji, color: st.color, title: st.title,
    rootQ: st.rootQ, borrow: st.borrow, skeleton: st.skeleton,
    remember: { topics: st.remember.topics },
    why: st.why.map((w) => ({ q: w.q, vi: w.vi })),
  };
}
function getContent(user) {
  if (hasFullAccess(user)) return { locked: false, howTo: DATA.howTo, logic: DATA.logic, stories: STORIES };
  return { locked: true, howTo: DATA.howTo, logic: DATA.logic, stories: STORIES.map(summaryOf) };
}

// ── progress ────────────────────────────────────────────────────────────
function publicShape(doc) {
  return {
    read: !!doc.read, ok: doc.ok || [], speak: doc.speak || 0, best: doc.best || {},
    steps: stepsDone(doc.storyId, doc), completedAt: doc.completedAt || null,
  };
}

async function getProgress(userId) {
  const rows = await SpeakingPart2Progress.find({ userId }).lean();
  const out = {};
  for (const r of rows) if (byId.has(r.storyId)) out[r.storyId] = publicShape(r);
  return out;
}

// Merge (never lose progress made on another device): ok = union of valid
// keys, read = OR, speak = max, best = this run's values. Step dates are
// stamped the first time a step turns done; completedAt when all 5 are.
async function saveProgress(userId, storyId, body) {
  if (!byId.has(storyId)) { const e = new Error('Không tìm thấy câu chuyện'); e.status = 404; throw e; }
  body = body || {};
  const valid = ALL_KEYS.get(storyId);
  const doc = (await SpeakingPart2Progress.findOne({ userId, storyId })) || new SpeakingPart2Progress({ userId, storyId });
  const ok = new Set(doc.ok || []);
  if (Array.isArray(body.ok)) for (const k of body.ok) if (typeof k === 'string' && valid.has(k)) ok.add(k);
  doc.ok = [...ok];
  if (body.read) doc.read = true;
  const speak = Math.floor(Number(body.speak) || 0);
  if (speak > (doc.speak || 0)) doc.speak = Math.min(speak, 9999);
  if (body.best && typeof body.best === 'object') {
    const best = { ...(doc.best || {}) };
    for (const [k, v] of Object.entries(body.best)) {
      if (/^(vocab|fixed|why\d{1,2})$/.test(k) && Number.isFinite(Number(v))) best[k] = Math.max(0, Math.min(100, Math.round(Number(v))));
    }
    doc.best = best;
    doc.markModified('best');
  }
  const now = new Date();
  const steps = stepsDone(storyId, doc);
  const at = { ...(doc.stepsAt || {}) };
  for (const s of STEP_KEYS) if (steps[s] && !at[s]) at[s] = now;
  doc.stepsAt = at;
  doc.markModified('stepsAt');
  if (!doc.completedAt && STEP_KEYS.every((s) => steps[s])) doc.completedAt = now;
  await doc.save();
  return publicShape(doc.toObject());
}

// ── homework (resourceCompletionService `speaking_part2`) ───────────────
// Like the course lessons, a story finished before the assignment counts.
async function checkCompletion(studentId, ids) {
  const out = new Map();
  const want = STORY_ROWS.filter((r) => ids.some((id) => String(id) === String(r._id)));
  if (!want.length) return out;
  const rows = await SpeakingPart2Progress.find({ userId: studentId, storyId: { $in: want.map((r) => r.code) } }).lean();
  for (const r of want) {
    const doc = rows.find((d) => d.storyId === r.code);
    if (!doc) continue;
    const steps = stepsDone(r.code, doc);
    const n = STEP_KEYS.filter((s) => steps[s]).length;
    out.set(String(r._id), {
      completed: !!doc.completedAt, completedAt: doc.completedAt || doc.updatedAt,
      stepsDone: n, stepsTotal: STEP_KEYS.length,
    });
  }
  return out;
}

module.exports = { STORY_ROWS, STEP_KEYS, getContent, getProgress, saveProgress, checkCompletion, stepsDone };
