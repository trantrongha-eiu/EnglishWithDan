'use strict';

// Extracted from controllers/speaking.controller.js, verbatim logic.
const SpeakingQuestion = require('../models/SpeakingQuestion');
const SpeakingMaterial = require('../models/SpeakingMaterial');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const { checkSpeaking, generateSampleAnswer, generateImprovedAnswer, generateSpeakingHints } = require('./geminiService');
const {
  checkSpeakingGroq, generateSampleAnswerGroq, generateSpeakingHintsGroq, generateImprovedAnswerGroq
} = require('./groqService');

async function listTopics(part) {
  const filter = { isActive: true };
  if (part && part !== 'all') filter.part = Number(part);
  const topics = await SpeakingQuestion.distinct('topic', filter);
  return topics.sort();
}

async function getRandomQuestion({ topic, part }) {
  const filter = { isActive: true };
  if (topic && topic !== 'all') filter.topic = topic;
  if (part && part !== 'all') filter.part = Number(part);

  const count = await SpeakingQuestion.countDocuments(filter);
  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);
  return SpeakingQuestion.findOne(filter).skip(skip).lean();
}

async function listQuestions({ topic, part }) {
  const filter = { isActive: true };
  if (topic && topic !== 'all') filter.topic = topic;
  if (part && part !== 'all') filter.part = Number(part);
  return SpeakingQuestion.find(filter).sort({ part: 1, topic: 1 }).lean();
}

// Lets AI errors (including .isOverloaded) propagate — the controller
// decides the HTTP status for those, since that's a request-flow decision.
// Falls back to Groq (same prompt/schema as Gemini, see groqService.js)
// ONLY when Gemini specifically reports itself overloaded/out of quota,
// not for other failures (a malformed transcript should fail the same way
// regardless of which engine handled it, not silently retry against a
// second engine). If Groq isn't configured, or also fails, the student
// sees Gemini's original "AI đang quá tải" message rather than a
// confusing second error. Used by every Speaking AI call below (analyze,
// sample answer, hints, improve) — previously only analyze had this
// fallback, so Gemini running out of quota still broke the other three.
async function _withGroqFallback(geminiFn, groqFn, label, args) {
  try {
    return await geminiFn(...args);
  } catch (geminiErr) {
    if (!geminiErr.isOverloaded || !process.env.GROQ_API_KEY) throw geminiErr;
    try {
      console.warn(`[Speaking] Gemini overloaded — falling back to Groq (${label})`);
      return await groqFn(...args);
    } catch (groqErr) {
      console.error(`[Speaking] Groq fallback also failed (${label}):`, groqErr.message);
      throw geminiErr;
    }
  }
}

async function gradeSpeaking(questionText, transcript, partNum) {
  return _withGroqFallback(checkSpeaking, checkSpeakingGroq, 'analyze', [questionText, transcript, partNum]);
}

// Cache-aside against SpeakingQuestion.sampleAnswer: serves a pre-generated
// (or previously auto-cached) answer with zero Gemini calls whenever one
// exists; only calls Gemini the first time a given question is ever
// requested, then persists the result so every later view (any student,
// any time) is instant and free. questionId is optional — falls back to a
// plain, uncached generation for e.g. ad-hoc questions with no bank entry.
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
    SpeakingQuestion.updateOne({ _id: questionId }, { $set: { sampleAnswer: data.sampleAnswer } })
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

// Cache-aside against SpeakingQuestion.hints — mirrors getSampleAnswer's
// pattern. Derives hints from the sample answer (generating + caching that
// too, internally, if it isn't cached yet) without ever exposing the full
// sample-answer text through this endpoint — a student who's only opened
// "Hints" never sees the sample answer unless they separately click that
// button too.
async function getSpeakingHints(questionId, questionText, partNum, cueCard) {
  let sourceSampleAnswer = null;
  if (questionId) {
    const cached = await SpeakingQuestion.findById(questionId).select('sampleAnswer hints').lean();
    if (cached?.hints && (cached.hints.vocab?.length || cached.hints.ideas?.length)) {
      return { hints: cached.hints };
    }
    sourceSampleAnswer = cached?.sampleAnswer || null;
  }

  if (!sourceSampleAnswer) {
    const sampleData = await getSampleAnswer(questionId, questionText, partNum, cueCard);
    sourceSampleAnswer = sampleData.sampleAnswer;
  }

  const hints = await _withGroqFallback(
    generateSpeakingHints, generateSpeakingHintsGroq, 'hints', [questionText, partNum, sourceSampleAnswer]
  );

  if (questionId && (hints.vocab?.length || hints.ideas?.length)) {
    SpeakingQuestion.updateOne({ _id: questionId }, { $set: { hints } })
      .catch(err => console.error('[Speaking] hints cache write failed:', err.message));
  }

  return { hints };
}

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
    strengths: feedback.strengths || [],
    corrections: (feedback.mistakes || []).map(m => ({
      original: m.original,
      corrected: m.corrected,
      explanation: m.reason
    })),
    vocabUpgrades: feedback.vocabUpgrades || [],
    suggestions: feedback.improvements || []
  };
}

// Persistence failure here is logged but must never fail the request —
// the student still gets their feedback even if saving the attempt fails.
// Returns the saved attempt's _id (or null on failure) so the frontend can
// key a locally-stored (IndexedDB) audio recording to this exact attempt.
async function saveAttempt(userId, { questionId, topic, part, questionText, transcript, duration, feedback }) {
  try {
    const attempt = new SpeakingAttempt({
      userId,
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
    return attempt._id;
  } catch (saveErr) {
    console.error('[Speaking] Save attempt error:', saveErr.message);
    return null;
  }
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
// _id (or null on failure) — same contract as saveAttempt.
async function finalizeAttempt(attemptId, feedback) {
  try {
    const updated = await SpeakingAttempt.findByIdAndUpdate(
      attemptId,
      { status: 'analyzed', aiFeedback: mapFeedbackToAiFeedback(feedback) },
      { new: true, runValidators: true }
    );
    return updated ? updated._id : null;
  } catch (err) {
    console.error('[Speaking] Finalize attempt error:', err.message);
    return null;
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
  createPendingAttempt, finalizeAttempt, markAttemptError,
  getHistory, listMaterials, getMaterialFilters, getSampleAnswer, getImprovedAnswer,
  getSpeakingHints,
};
