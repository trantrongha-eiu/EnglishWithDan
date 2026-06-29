const SpeakingQuestion = require('../models/SpeakingQuestion');
const SpeakingMaterial = require('../models/SpeakingMaterial');
const SpeakingAttempt  = require('../models/SpeakingAttempt');
const { checkSpeaking } = require('../services/geminiService');

// ── GET /api/speaking/topics ─────────────────────────────────
exports.getTopics = async (req, res) => {
  try {
    const { part } = req.query;
    const filter = { isActive: true };
    if (part && part !== 'all') filter.part = Number(part);
    const topics = await SpeakingQuestion.distinct('topic', filter);
    res.json({ success: true, topics: topics.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/speaking/random ─────────────────────────────────
exports.getRandom = async (req, res) => {
  try {
    const { topic, part } = req.query;
    const filter = { isActive: true };
    if (topic && topic !== 'all') filter.topic = topic;
    if (part  && part  !== 'all') filter.part = Number(part);

    const count = await SpeakingQuestion.countDocuments(filter);
    if (count === 0) return res.json({ success: false, message: 'Không có câu hỏi' });

    const skip = Math.floor(Math.random() * count);
    const question = await SpeakingQuestion.findOne(filter).skip(skip);
    res.json({ success: true, question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/speaking/questions ──────────────────────────────
exports.getQuestions = async (req, res) => {
  try {
    const { topic, part } = req.query;
    const filter = { isActive: true };
    if (topic && topic !== 'all') filter.topic = topic;
    if (part  && part  !== 'all') filter.part = Number(part);

    const questions = await SpeakingQuestion.find(filter).sort({ part: 1, topic: 1 });
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/speaking/analyze ───────────────────────────────
exports.analyze = async (req, res) => {
  try {
    const { transcript, question, questionId, topic, part, duration } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ success: false, message: 'Transcript trống' });
    }

    const partNum = part ? Number(part) : 1;
    const questionText = question || 'General speaking practice';

    let feedback;
    try {
      feedback = await checkSpeaking(questionText, transcript.trim(), partNum);
    } catch (aiErr) {
      console.error('[Speaking] Gemini error:', aiErr.message);
      if (aiErr.isOverloaded) {
        return res.status(503).json({ success: false, message: aiErr.message });
      }
      return res.status(500).json({ success: false, message: 'AI không thể phân tích. Vui lòng thử lại.' });
    }

    // Save attempt
    try {
      const attempt = new SpeakingAttempt({
        userId:     req.user._id,
        questionId: questionId || null,
        topic:      topic || '',
        part:       partNum,
        question:   questionText,
        transcript,
        duration:   duration || 0,
        status:     'analyzed',
        aiFeedback: {
          overallBand:      feedback.overall_band   || 0,
          fluency:          feedback.fluency         || 0,
          vocabulary:       feedback.vocabulary      || 0,
          grammar:          feedback.grammar         || 0,
          pronunciation:    feedback.pronunciation   || 0,
          overallFeedback:  feedback.overall_feedback || '',
          correctedVersion: feedback.corrected       || '',
          strengths:        feedback.strengths       || [],
          corrections:      (feedback.errors || []).map(e => ({
            original:    e.wrong,
            corrected:   e.right,
            explanation: e.tip
          })),
          suggestions:      feedback.improvements   || []
        }
      });
      await attempt.save();
    } catch (saveErr) {
      console.error('[Speaking] Save attempt error:', saveErr.message);
    }

    res.json({ success: true, feedback });
  } catch (err) {
    console.error('[Speaking] analyze error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/speaking/history ────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const attempts = await SpeakingAttempt.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/speaking/materials ──────────────────────────────
exports.getMaterials = async (req, res) => {
  try {
    const { quarter, topic } = req.query;
    const filter = { isActive: true };
    if (quarter && quarter !== 'all') filter.quarter = quarter;
    if (topic   && topic   !== 'all') filter.topic = topic;

    const materials = await SpeakingMaterial.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/speaking/material-filters ──────────────────────
exports.getMaterialFilters = async (req, res) => {
  try {
    const [quarters, topics] = await Promise.all([
      SpeakingMaterial.distinct('quarter', { isActive: true }),
      SpeakingMaterial.distinct('topic',   { isActive: true })
    ]);
    res.json({ success: true, quarters: quarters.sort().reverse(), topics: topics.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
