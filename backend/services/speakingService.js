'use strict';

// Extracted from controllers/speaking.controller.js, verbatim logic.
const SpeakingQuestion = require('../models/SpeakingQuestion');
const SpeakingMaterial = require('../models/SpeakingMaterial');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const { checkSpeaking, generateSampleAnswer, generateImprovedAnswer } = require('./geminiService');
const {
  checkSpeakingGroq, generateSampleAnswerGroq, generateImprovedAnswerGroq
} = require('./groqService');
const badgeService = require('./badgeService');

async function listTopics(part) {
  const filter = { isActive: true };
  if (part && part !== 'all') filter.part = Number(part);
  const topics = await SpeakingQuestion.distinct('topic', filter);
  return topics.sort();
}

// Excluded from both student-facing listing queries below (security audit
// finding BUG-006): sampleAnswer/hints are cached directly on the question
// doc the first time ANY student reveals them (see getSampleAnswer/
// getSpeakingHints below, backing the dedicated POST /sample-answer and
// POST /hints reveal endpoints frontend/js/speaking.js already exclusively
// uses) — so once even one student had revealed a question, every future
// listing of it leaked the answer/hints to every other student before they
// ever attempted it. The reveal endpoints' own .select('sampleAnswer'/
// 'hints') cache reads are intentional and untouched; only these two
// listing paths were ever a leak.
const LISTING_EXCLUDED_FIELDS = '-sampleAnswer -hints';

async function getRandomQuestion({ topic, part }) {
  const filter = { isActive: true };
  if (topic && topic !== 'all') filter.topic = topic;
  if (part && part !== 'all') filter.part = Number(part);

  const count = await SpeakingQuestion.countDocuments(filter);
  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);
  return SpeakingQuestion.findOne(filter).select(LISTING_EXCLUDED_FIELDS).skip(skip).lean();
}

// userId is optional (some callers may not have an authenticated user), in
// which case every question is simply reported as not-yet-attempted.
async function listQuestions({ topic, part, userId }) {
  const filter = { isActive: true };
  if (topic && topic !== 'all') filter.topic = topic;
  if (part && part !== 'all') filter.part = Number(part);
  const questions = await SpeakingQuestion.find(filter).select(LISTING_EXCLUDED_FIELDS).sort({ part: 1, topic: 1 }).lean();

  let attemptedIds = new Set();
  if (userId && questions.length) {
    const ids = await SpeakingAttempt.distinct('questionId', {
      userId,
      questionId: { $in: questions.map(q => q._id) },
    });
    attemptedIds = new Set(ids.filter(Boolean).map(id => id.toString()));
  }
  for (const q of questions) q.attempted = attemptedIds.has(q._id.toString());
  return questions;
}

// Lets AI errors (including .isOverloaded) propagate — the controller
// decides the HTTP status for those, since that's a request-flow decision.
// Falls back to Groq (same prompt/schema as Gemini, see groqService.js) on
// ANY Gemini failure — overloaded/out of quota, network error, or a
// JSON-parse failure that survived Gemini's own retry — not just the
// overload case. A second engine attempt costs nothing extra on the happy
// path (Gemini succeeding), and a failure this app can recover from beats
// one it can't, regardless of why Gemini specifically failed. If Groq
// isn't configured, or also fails, the student sees Gemini's original
// error message rather than a confusing second one. Used by every Speaking
// AI call below (analyze, sample answer, hints, improve).
async function _withGroqFallback(geminiFn, groqFn, label, args) {
  try {
    return await geminiFn(...args);
  } catch (geminiErr) {
    if (!process.env.GROQ_API_KEY) throw geminiErr;
    try {
      console.warn(`[Speaking] Gemini failed (${geminiErr.message}) — falling back to Groq (${label})`);
      return await groqFn(...args);
    } catch (groqErr) {
      console.error(`[Speaking] Groq fallback also failed (${label}):`, groqErr.message);
      throw geminiErr;
    }
  }
}

// Same rounding convention as Writing's server-side recompute (see
// backend/routes/admin/writingGrading.js: "bandScore in JSON is ignored —
// server recalculates from (ta+cc+lr+gra)/4 rounded to nearest 0.5").
// Gemini is asked to self-report overallBand as the average of the 4
// sub-scores, but nothing enforces that arithmetic on its side — a slip
// there (band 0 despite valid sub-scores) previously persisted straight to
// the DB and rendered as a real "0.0" band everywhere it was read. Applied
// once here, immediately after grading succeeds, so the live response
// returned to the student and the version later persisted by
// mapFeedbackToAiFeedback are always the same number — never two
// different "overall band"s for the same attempt.
function roundToHalfBand(n) {
  return Math.round(n * 2) / 2;
}

async function gradeSpeaking(questionText, transcript, partNum) {
  const feedback = await _withGroqFallback(checkSpeaking, checkSpeakingGroq, 'analyze', [questionText, transcript, partNum]);
  const fluency = feedback.fluency || 0;
  const vocabulary = feedback.vocabulary || 0;
  const grammar = feedback.grammar || 0;
  const pronunciation = feedback.pronunciation || 0;
  feedback.overallBand = roundToHalfBand((fluency + vocabulary + grammar + pronunciation) / 4);
  return feedback;
}

// Cache-aside against SpeakingQuestion.sampleAnswer: serves a pre-generated
// (or previously auto-cached) answer with zero Gemini calls whenever one
// exists; only calls Gemini the first time a given question is ever
// requested, then persists the result so every later view (any student,
// any time) is instant and free. questionId is optional — falls back to a
// plain, uncached generation for e.g. ad-hoc questions with no bank entry.
// The same generation call also returns `vocab` (see buildSampleAnswerPrompt)
// — cached alongside the sample so getSpeakingHints below never needs its
// own separate AI call.
async function getSampleAnswer(questionId, questionText, partNum, cueCard) {
  if (questionId) {
    const cached = await SpeakingQuestion.findById(questionId).select('sampleAnswer').lean();
    if (cached?.sampleAnswer) return { sampleAnswer: cached.sampleAnswer };
  }

  const data = await _withGroqFallback(
    generateSampleAnswer, generateSampleAnswerGroq, 'sampleAnswer', [questionText, partNum, cueCard]
  );

  if (questionId && data.sampleAnswer) {
    // Fire-and-forget — a failed cache write must never fail the response
    // the student is already waiting on.
    const $set = { sampleAnswer: data.sampleAnswer };
    if (data.vocab?.length) $set['hints.vocab'] = data.vocab;
    SpeakingQuestion.updateOne({ _id: questionId }, { $set })
      .catch(err => console.error('[Speaking] sampleAnswer cache write failed:', err.message));
  }

  return data;
}

// Stage 2 — opt-in only, called from POST /api/speaking/improve, never from
// the automatic analyze flow. Same error-propagation contract as above.
async function getImprovedAnswer(questionText, partNum, transcript) {
  return _withGroqFallback(
    generateImprovedAnswer, generateImprovedAnswerGroq, 'improve', [questionText, partNum, transcript]
  );
}

// Cache-aside against SpeakingQuestion.hints.vocab — vocab rides along on
// the SAME sample-answer generation call (see getSampleAnswer above and
// buildSampleAnswerPrompt's schema), never a separate "extract hints from
// the sample" AI call, so opening Hints is free once either button has ever
// been clicked for this question. Never persists/exposes the full sample
// text if it wasn't already cached — a student who's only opened "Hints"
// still never sees the sample answer unless they separately click that
// button too. A question whose sampleAnswer was cached before vocab
// existed on this schema self-heals here (one extra generation, then
// cached forever), same pattern as authService's createdAt self-heal.
async function getSpeakingHints(questionId, questionText, partNum, cueCard) {
  let cached = null;
  if (questionId) {
    cached = await SpeakingQuestion.findById(questionId).select('sampleAnswer hints').lean();
    if (cached?.hints?.vocab?.length) return { hints: { vocab: cached.hints.vocab } };
  }

  const data = await _withGroqFallback(
    generateSampleAnswer, generateSampleAnswerGroq, 'sampleAnswer', [questionText, partNum, cueCard]
  );

  if (questionId) {
    const $set = {};
    if (data.vocab?.length) $set['hints.vocab'] = data.vocab;
    if (!cached?.sampleAnswer && data.sampleAnswer) $set.sampleAnswer = data.sampleAnswer;
    if (Object.keys($set).length) {
      SpeakingQuestion.updateOne({ _id: questionId }, { $set })
        .catch(err => console.error('[Speaking] hints cache write failed:', err.message));
    }
  }

  return { hints: { vocab: data.vocab || [] } };
}

// The prompt asks for strengths/improvements as plain text strings, but the
// model occasionally returns objects instead (e.g. {"phrase":"...","reason":
// "..."}) — likely because the strengths rule mentions "quoting a specific
// word/phrase", which reads similarly to the mistakes/vocabUpgrades rules
// that DO want structured objects. The frontend renders these with a bare
// `${s}`, so an object silently became the literal text "[object Object]"
// instead of throwing anywhere. Coerce defensively so bad output degrades
// to *some* readable string rather than corrupting the UI.
function coerceToStringItems(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => {
    if (typeof item === 'string') return item.trim();
    if (item && typeof item === 'object') {
      const candidate = item.text || item.phrase || item.point || item.strength
        || item.suggestion || item.content || item.description
        || Object.values(item).find(v => typeof v === 'string');
      return (candidate || '').trim();
    }
    return item == null ? '' : String(item);
  }).filter(Boolean);
}

// overallBand is already recomputed by gradeSpeaking() above by the time
// this runs — trust it as-is rather than a second, potentially-divergent
// recompute here.
function mapFeedbackToAiFeedback(feedback) {
  return {
    overallBand: feedback.overallBand || 0,
    fluency: feedback.fluency || 0,
    vocabulary: feedback.vocabulary || 0,
    grammar: feedback.grammar || 0,
    pronunciation: feedback.pronunciation || 0,
    overallFeedback: feedback.overallFeedback || '',
    correctedVersion: '', // Stage 1 no longer generates this — stays empty unless a caller later chooses to persist a fetched improved answer
    todaysFocus: feedback.todaysFocus || '',
    strengths: coerceToStringItems(feedback.strengths),
    corrections: (feedback.mistakes || []).map(m => ({
      original: m.original,
      corrected: m.corrected,
      explanation: m.reason
    })),
    vocabUpgrades: feedback.vocabUpgrades || [],
    suggestions: coerceToStringItems(feedback.improvements)
  };
}

// Persistence failure here is logged but must never fail the request —
// the student still gets their feedback even if saving the attempt fails.
// Returns the saved attempt's _id (or null on failure) so the frontend can
// key a locally-stored (IndexedDB) audio recording to this exact attempt.
// `user` is the full req.user Mongoose document (not just an id) — needed
// to advance the streak below, same convention as reading/listeningService.
async function saveAttempt(user, { questionId, topic, part, questionText, transcript, duration, feedback }) {
  try {
    const attempt = new SpeakingAttempt({
      userId: user._id,
      questionId: questionId || null,
      topic: topic || '',
      part,
      question: questionText,
      transcript,
      duration: duration || 0,
      status: 'analyzed',
      aiFeedback: mapFeedbackToAiFeedback(feedback)
    });
    await attempt.save();
    const newlyUnlocked = await _creditStreakForAnalyzedAttempt(user);
    return { attemptId: attempt._id, newlyUnlocked };
  } catch (saveErr) {
    console.error('[Speaking] Save attempt error:', saveErr.message);
    return { attemptId: null, newlyUnlocked: [] };
  }
}

// Speaking (like Writing) is graded by AI, not right-vs-wrong, so there's
// no accuracy to tier a bonus off — a flat +1 just keeps today's link in
// the streak chain alive (matches vocabBookService's flat-bonus
// activities); same-day repeats are a no-op since updateStreak() defaults
// allowSameDayStack to false. This was previously missing entirely: the
// activity heatmap already counts SpeakingAttempt docs (userService.
// getActivityHeatmap), so a student who only practiced Speaking that day
// saw the day marked "done" there yet had their streak quietly die anyway.
async function _creditStreakForAnalyzedAttempt(user) {
  if (!user || user.role !== 'student') return [];
  user.updateStreak();
  // Awaited (was fire-and-forget) — checkAndAwardNewBadges below re-reads
  // the streak fresh from the DB, so the save must actually land first.
  await user.save().catch(() => {});
  const { newlyUnlocked } = await badgeService.checkAndAwardNewBadges(user._id);
  return newlyUnlocked;
}

// Persisted BEFORE calling Gemini so the submission is visible to the
// student and admin immediately (status: 'pending') instead of only
// appearing once grading finishes — Part 2/3's longer transcripts are the
// ones most likely to hit Gemini's JSON-truncation retry path (up to ~60s)
// or fail outright, and previously nothing was saved until grading
// succeeded, so a slow/failed grade meant the attempt was invisible or
// silently lost. Same never-throw contract as saveAttempt.
async function createPendingAttempt(userId, { questionId, topic, part, questionText, transcript, duration }) {
  try {
    const attempt = new SpeakingAttempt({
      userId,
      questionId: questionId || null,
      topic: topic || '',
      part,
      question: questionText,
      transcript,
      duration: duration || 0,
      status: 'pending'
    });
    await attempt.save();
    return attempt._id;
  } catch (err) {
    console.error('[Speaking] Create pending attempt error:', err.message);
    return null;
  }
}

// Fills in a pending attempt once grading succeeds. Returns the attempt's
// _id (or null on failure) — same contract as saveAttempt. `user` (the full
// req.user document) is optional — retryGrading()'s only caller always has
// it, but pass-through call sites shouldn't be forced to fetch one just to
// finalize a grade.
async function finalizeAttempt(attemptId, feedback, user) {
  try {
    const updated = await SpeakingAttempt.findByIdAndUpdate(
      attemptId,
      { status: 'analyzed', aiFeedback: mapFeedbackToAiFeedback(feedback) },
      { new: true, runValidators: true }
    );
    const newlyUnlocked = updated ? await _creditStreakForAnalyzedAttempt(user) : [];
    return { attemptId: updated ? updated._id : null, newlyUnlocked };
  } catch (err) {
    console.error('[Speaking] Finalize attempt error:', err.message);
    return { attemptId: null, newlyUnlocked: [] };
  }
}

// Marks a pending attempt as failed grading — keeps the transcript on
// record (visible to admin as "grading failed") instead of vanishing.
// Best-effort: never throws.
async function markAttemptError(attemptId) {
  try {
    await SpeakingAttempt.findByIdAndUpdate(attemptId, { status: 'error' });
  } catch (err) {
    console.error('[Speaking] Mark attempt error failed:', err.message);
  }
}

// Re-grades an already-submitted attempt against its own stored transcript
// — no new recording/transcript needed from the client. Used by the
// history tab's "Thử chấm lại" button for attempts stuck 'pending' (swept
// to 'error' after a while by attemptTimeoutSweep.js) or that already
// failed grading once. Refuses to touch an 'analyzed' row — retrying a
// successful grade isn't a "retry", it's a silent re-grade a student never
// asked for. AI errors propagate the same way analyze()'s do, so the
// controller can apply the same isOverloaded -> 503 handling.
async function retryGrading(attemptId, user) {
  const attempt = await SpeakingAttempt.findOne({ _id: attemptId, userId: user._id });
  if (!attempt) return { status: 'not_found' };
  if (attempt.status === 'analyzed') return { status: 'already_analyzed' };

  try {
    const feedback = await gradeSpeaking(attempt.question, attempt.transcript, attempt.part);
    await finalizeAttempt(attempt._id, feedback, user);
    return { status: 'ok', feedback, attemptId: attempt._id };
  } catch (aiErr) {
    await markAttemptError(attempt._id);
    throw aiErr;
  }
}

async function getHistory(userId) {
  return SpeakingAttempt.find({ userId }).sort({ createdAt: -1 }).limit(30).lean();
}

async function listMaterials({ quarter, topic }) {
  const filter = { isActive: true };
  if (quarter && quarter !== 'all') filter.quarter = quarter;
  if (topic && topic !== 'all') filter.topic = topic;
  return SpeakingMaterial.find(filter).sort({ createdAt: -1 }).lean();
}

async function getMaterialFilters() {
  const [quarters, topics] = await Promise.all([
    SpeakingMaterial.distinct('quarter', { isActive: true }),
    SpeakingMaterial.distinct('topic', { isActive: true })
  ]);
  return { quarters: quarters.sort().reverse(), topics: topics.sort() };
}

module.exports = {
  listTopics, getRandomQuestion, listQuestions, gradeSpeaking, saveAttempt,
  createPendingAttempt, finalizeAttempt, markAttemptError, retryGrading,
  getHistory, listMaterials, getMaterialFilters, getSampleAnswer, getImprovedAnswer,
  getSpeakingHints,
};
