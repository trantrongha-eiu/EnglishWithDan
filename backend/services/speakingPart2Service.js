'use strict';

// Speaking Part 2 · 7 câu chuyện gốc (speaking-part2.html).
//  - content: the full story text is Premium-only (served by the API, not a
//    static file); everyone else gets the story list to see what's inside.
//  - progress: per student per story, merged from the page (several devices
//    may sync). Mastery and step flags are recomputed here from the raw keys
//    so a client can't simply claim "done".
//  - 7 khung nói: 5 FIXED frames + WHY + Kết luận (framesOf). Each sentence
//    is worth 2 points: 🎙️ nhại (shadowing score >= SHADOW_PASS) and ⌨️ dịch
//    (typed right once). A frame opens once the frame before it is >= 70%.
//  - homework: `speaking_part2` (resourceCompletionService) — one pickable
//    row per story, passed once the whole story is >= 70% learnt.

const mongoose = require('mongoose');
const DATA = require('../data/speakingPart2');
const SpeakingPart2Progress = require('../models/SpeakingPart2Progress');
const VocabularyLesson = require('../models/VocabularyLesson');
const { hasFullAccess } = require('../utils/plan');

const STEP_KEYS = ['read', 'vocab', 'learn', 'speak'];
const MIN_WHY = 2;        // the WHY frame counts this many cue-card variants (or all, if fewer)
const PASS_PERCENT = 70;  // frame unlock + homework pass
const SHADOW_PASS = 70;   // a sentence's shadowing score that counts as "nhại đạt"

const STORIES = DATA.stories;
const byId = new Map(STORIES.map((s) => [s.id, s]));

// Homework catalog rows: a story has no document of its own, so each gets a
// stable made-up ObjectId (same idea as task1_skill). Never renumber.
const STORY_ROWS = STORIES.map((s, i) => ({
  _id: new mongoose.Types.ObjectId(`7732${String(i + 1).padStart(20, '0')}`),
  code: s.id, name: `${s.no} · ${s.group} — ${s.title}`,
}));

// The 7 frames of a story (same as the page's framesOf()).
function framesOf(st) {
  const frames = [];
  st.fixed.forEach((sec, si) => {
    const keys = sec.s.map((_, j) => `f${si}.${j}`);
    const prev = frames[frames.length - 1];
    if (sec.join && prev) { prev.h = sec.join; prev.keys.push(...keys); } else frames.push({ kind: 'fixed', h: sec.h, keys });
  });
  frames.push({ kind: 'why', h: 'WHY', variants: st.why.map((w, k) => w.s.map((_, j) => `w${k}.${j}`)) });
  frames.push({ kind: 'con', h: 'Kết luận', keys: st.conclusion.map((_, j) => `c${j}`) });
  return frames;
}
const FRAMES = new Map(STORIES.map((s) => [s.id, framesOf(s)]));
const VOCAB_KEYS = new Map(STORIES.map((s) => [s.id, s.vocab.map((_, i) => `v${i}`)]));
const SENTENCE_KEYS = new Map([...FRAMES].map(([id, fr]) => [id, new Set(fr.flatMap((f) => f.keys || f.variants.flat()))]));
const ALL_KEYS = new Map([...SENTENCE_KEYS].map(([id, k]) => [id, new Set([...VOCAB_KEYS.get(id), ...k])]));

// Shadow scores are stored with "_" for "." ("f0.1" → "f0_1"): a dotted key
// in a Mixed field would be saved as a nested path.
const toDbKey = (k) => k.replace('.', '_');

// ── content versions ────────────────────────────────────────────────────
// FIXED sentence keys are positional, so when the FIXED text is rewritten the
// old keys would land on different sentences. v3 (framework v3, 2026-11-12)
// shortened every FIXED part: a pre-v3 key is carried over only when its old
// sentence covers >= 85% of the new sentence's words (in order) — the rest
// are dropped and learnt again. WHY / Kết luận / vocab keys did not change.
const VERSION = DATA.version;
const V3_FIXED_KEYS = {
  people: { 'f0.0': 'f0.0', 'f3.0': 'f2.0', 'f4.0': 'f3.0', 'f4.3': 'f3.2', 'f5.0': 'f4.0' },
  places: { 'f1.0': 'f1.0', 'f1.1': 'f1.1', 'f4.0': 'f4.0' },
  objects: { 'f2.2': 'f2.1', 'f2.3': 'f2.2', 'f4.0': 'f4.0' },
  events: { 'f2.0': 'f2.0', 'f5.0': 'f5.0' },
  activities: { 'f4.0': 'f4.0' },
  nature: { 'f1.0': 'f1.0', 'f2.2': 'f2.1', 'f4.0': 'f4.0' },
  media: { 'f0.0': 'f0.0', 'f2.0': 'f2.0', 'f2.1': 'f2.1', 'f2.2': 'f2.2', 'f4.0': 'f3.1', 'f5.0': 'f4.0' },
};
const isFixedKey = (k) => /^f\d/.test(k);
// A progress doc (lean or not) whose keys predate v3 → { ok, shadow } with the
// FIXED keys moved onto the v3 sentences; null when it's already current.
function upgradeKeys(doc) {
  if (!doc || (Number(doc.v) || 0) >= VERSION) return null;
  const map = V3_FIXED_KEYS[doc.storyId] || {};
  const ok = [];
  for (const k of doc.ok || []) {
    if (!isFixedKey(k)) ok.push(k);
    else if (map[k] && !ok.includes(map[k])) ok.push(map[k]);
  }
  const shadow = {};
  for (const [dk, v] of Object.entries(doc.shadow || {})) {
    const k = dk.replace('_', '.');
    const nk = isFixedKey(k) ? map[k] : k;
    if (nk) shadow[toDbKey(nk)] = Math.max(Number(shadow[toDbKey(nk)]) || 0, Number(v) || 0);
  }
  return { ok, shadow };
}
// Lean doc → same doc with current keys (for reads; saved on the next write).
function current(doc) {
  const up = upgradeKeys(doc);
  return up ? { ...doc, ...up, v: VERSION } : doc;
}
function shadowOut(doc) {
  const out = {};
  for (const [k, v] of Object.entries((doc && doc.shadow) || {})) out[k.replace('_', '.')] = Number(v) || 0;
  return out;
}

// { got, of } points of a list of sentence keys.
function pointsOf(keys, ok, shadow) {
  let got = 0;
  for (const k of keys) {
    if (ok.has(k)) got++;
    if ((Number(shadow[k]) || 0) >= SHADOW_PASS) got++;
  }
  return { got, of: keys.length * 2 };
}
// Per-frame % + the whole story's %, and which frames are open.
function masteryOf(storyId, doc) {
  const frames = FRAMES.get(storyId);
  if (!frames) return null;
  const ok = new Set((doc && doc.ok) || []);
  const shadow = shadowOut(doc);
  let got = 0, of = 0, open = true;
  const out = frames.map((f) => {
    let p;
    if (f.kind === 'why') {
      const best = f.variants.map((keys) => pointsOf(keys, ok, shadow))
        .sort((a, b) => b.got / b.of - a.got / a.of)
        .slice(0, Math.min(MIN_WHY, f.variants.length));
      p = best.reduce((a, x) => ({ got: a.got + x.got, of: a.of + x.of }), { got: 0, of: 0 });
    } else p = pointsOf(f.keys, ok, shadow);
    got += p.got; of += p.of;
    const pct = p.of ? Math.round((p.got / p.of) * 100) : 0;
    const row = { h: f.h, pct, open };
    open = open && pct >= PASS_PERCENT;
    return row;
  });
  return { frames: out, pct: of ? Math.round((got / of) * 100) : 0 };
}

function stepsDone(storyId, doc) {
  const vocab = VOCAB_KEYS.get(storyId);
  if (!vocab || !doc) return {};
  const ok = new Set(doc.ok || []);
  return {
    read: !!doc.read,
    vocab: vocab.every((k) => ok.has(k)),
    learn: masteryOf(storyId, doc).pct >= PASS_PERCENT,
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
  if (hasFullAccess(user)) return { locked: false, version: VERSION, howTo: DATA.howTo, logic: DATA.logic, stories: STORIES };
  return { locked: true, version: VERSION, howTo: DATA.howTo, logic: DATA.logic, stories: STORIES.map(summaryOf) };
}

// ── progress ────────────────────────────────────────────────────────────
function publicShape(doc) {
  return {
    read: !!doc.read, ok: doc.ok || [], shadow: shadowOut(doc), speak: doc.speak || 0, best: doc.best || {},
    steps: stepsDone(doc.storyId, doc), mastery: masteryOf(doc.storyId, doc),
    masteredAt: doc.masteredAt || null, completedAt: doc.completedAt || null,
  };
}

async function getProgress(userId) {
  const rows = await SpeakingPart2Progress.find({ userId }).lean();
  const out = {};
  for (const r of rows) if (byId.has(r.storyId)) out[r.storyId] = publicShape(current(r));
  return out;
}

// Merge (never lose progress made on another device): ok = union of valid
// keys, shadow = best score per sentence, read = OR, speak = max, best =
// this run's values. Step dates are stamped the first time a step turns
// done; masteredAt when the story first reaches PASS_PERCENT, completedAt
// when all 4 steps are done.
// FIXED keys are only taken from a page that sends the current content
// version (body.v): a tab opened before a content change would otherwise
// post its old keys onto the new sentences.
async function saveProgress(userId, storyId, body) {
  if (!byId.has(storyId)) { const e = new Error('Không tìm thấy câu chuyện'); e.status = 404; throw e; }
  body = body || {};
  const fresh = Number(body.v) === VERSION;
  const accept = (k) => fresh || !isFixedKey(k);
  const valid = ALL_KEYS.get(storyId);
  const sentences = SENTENCE_KEYS.get(storyId);
  const doc = (await SpeakingPart2Progress.findOne({ userId, storyId })) || new SpeakingPart2Progress({ userId, storyId, v: VERSION });
  const up = upgradeKeys(doc);
  if (up) { doc.ok = up.ok; doc.shadow = up.shadow; doc.markModified('shadow'); }
  doc.v = VERSION;
  const ok = new Set(doc.ok || []);
  if (Array.isArray(body.ok)) for (const k of body.ok) if (typeof k === 'string' && valid.has(k) && accept(k)) ok.add(k);
  doc.ok = [...ok];
  // Sent as [[key, score], …] — the request sanitizer drops dotted object keys.
  if (Array.isArray(body.shadow)) {
    const sh = { ...(doc.shadow || {}) };
    for (const pair of body.shadow) {
      if (!Array.isArray(pair) || typeof pair[0] !== 'string') continue;
      const [k, v] = pair;
      const n = Math.round(Number(v));
      if (sentences.has(k) && accept(k) && Number.isFinite(n)) sh[toDbKey(k)] = Math.max(Number(sh[toDbKey(k)]) || 0, Math.max(0, Math.min(100, n)));
    }
    doc.shadow = sh;
    doc.markModified('shadow');
  }
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
  if (!doc.masteredAt && steps.learn) doc.masteredAt = now;
  if (!doc.completedAt && STEP_KEYS.every((s) => steps[s])) doc.completedAt = now;
  await doc.save();
  return publicShape(doc.toObject());
}

// ── homework: the story's Vocab Topics lesson comes along ───────────────
// Assigning a story (e.g. Mrs Hoa) also assigns the "IELTS Speaking – …"
// vocabulary lesson of its group (words seeded by
// scripts/seedPart2StoryVocab.js). Matched by title so a re-seeded lesson
// keeps working.
const STORY_VOCAB_LESSON = {
  people: 'IELTS Speaking – Describing People',
  places: 'IELTS Speaking – Describing Places',
  objects: 'IELTS Speaking – Describing Objects',
  events: 'IELTS Speaking – Describing Events & Experiences',
  activities: 'IELTS Speaking – Activities & Skills',
  nature: 'IELTS Speaking – Nature, Animals & Science',
  media: 'IELTS Speaking – Culture, Media & Stories',
};

// Homework row id of a story → [{ _id, label }] of its published vocab
// lesson ([] when the id isn't a story or the lesson isn't published).
async function vocabLessonsForStory(rowId) {
  const row = STORY_ROWS.find((r) => String(r._id) === String(rowId));
  const title = row && STORY_VOCAB_LESSON[row.code];
  if (!title) return [];
  const lesson = await VocabularyLesson.findOne({ title, published: true }).select('_id title').lean();
  return lesson ? [{ _id: String(lesson._id), label: lesson.title }] : [];
}

// ── homework (resourceCompletionService `speaking_part2`) ───────────────
// Passed once the story is >= PASS_PERCENT learnt (nhại + dịch over the 7
// frames). Like the course lessons, a story learnt before the assignment counts.
// A story finished under the old rule (all 5 old steps, before the 70% rule
// of 2026-11-11) keeps its pass: completedAt is only set now once the story
// is >= 70%, so a completedAt below 70% can only come from the old rule.
// Likewise a story that once reached 70% (masteredAt) stays passed when a
// content change (v3 shortened the FIXED parts) brings its % back down.
async function checkCompletion(studentId, ids) {
  const out = new Map();
  const want = STORY_ROWS.filter((r) => ids.some((id) => String(id) === String(r._id)));
  if (!want.length) return out;
  const rows = await SpeakingPart2Progress.find({ userId: studentId, storyId: { $in: want.map((r) => r.code) } }).lean();
  for (const r of want) {
    const raw = rows.find((d) => d.storyId === r.code);
    if (!raw) continue;
    const doc = current(raw);
    const m = masteryOf(r.code, doc);
    const steps = stepsDone(r.code, doc);
    const passed = m.pct >= PASS_PERCENT || !!doc.completedAt || !!doc.masteredAt;
    out.set(String(r._id), {
      completed: passed, completedAt: (passed && (doc.masteredAt || doc.completedAt)) || doc.updatedAt,
      scorePercent: m.pct,
      stepsDone: STEP_KEYS.filter((s) => steps[s]).length, stepsTotal: STEP_KEYS.length,
    });
  }
  return out;
}

module.exports = {
  STORY_ROWS, STEP_KEYS, PASS_PERCENT, SHADOW_PASS, STORY_VOCAB_LESSON, VERSION, vocabLessonsForStory,
  getContent, getProgress, saveProgress, checkCompletion, stepsDone, masteryOf, framesOf, upgradeKeys,
};
