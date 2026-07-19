'use strict';

// Extracted from controllers/speaking.controller.js, verbatim logic.
const SpeakingQuestion = require('../models/SpeakingQuestion');
const SpeakingMaterial = require('../models/SpeakingMaterial');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const { checkSpeaking, generateSampleAnswer, generateImprovedAnswer } = require('./geminiService');

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
async function gradeSpeaking(questionText, transcript, partNum) {
  return checkSpeaking(questionText, transcript, partNum);
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

  const data = await generateSampleAnswer(questionText, partNum, cueCard);

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
  return generateImprovedAnswer(questionText, partNum, transcript);
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
      aiFeedback: {
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
        suggestions: feedback.improvements || []
      }
    });
    await attempt.save();
    return attempt._id;
  } catch (saveErr) {
    console.error('[Speaking] Save attempt error:', saveErr.message);
    return null;
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
  getHistory, listMaterials, getMaterialFilters, getSampleAnswer, getImprovedAnswer,
};
