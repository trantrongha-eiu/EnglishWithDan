'use strict';

// Extracted from controllers/speaking.controller.js, verbatim logic.
const SpeakingQuestion = require('../models/SpeakingQuestion');
const SpeakingMaterial = require('../models/SpeakingMaterial');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const { checkSpeaking } = require('./geminiService');

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

// Persistence failure here is logged but must never fail the request —
// the student still gets their feedback even if saving the attempt fails.
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
        overallBand: feedback.overall_band || 0,
        fluency: feedback.fluency || 0,
        vocabulary: feedback.vocabulary || 0,
        grammar: feedback.grammar || 0,
        pronunciation: feedback.pronunciation || 0,
        overallFeedback: feedback.overall_feedback || '',
        correctedVersion: feedback.corrected || '',
        strengths: feedback.strengths || [],
        corrections: (feedback.errors || []).map(e => ({
          original: e.wrong,
          corrected: e.right,
          explanation: e.tip
        })),
        suggestions: feedback.improvements || []
      }
    });
    await attempt.save();
  } catch (saveErr) {
    console.error('[Speaking] Save attempt error:', saveErr.message);
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
  getHistory, listMaterials, getMaterialFilters,
};
