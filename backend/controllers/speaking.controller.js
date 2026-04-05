const SpeakingQuestion = require('../models/SpeakingQuestion');
const SpeakingMaterial = require('../models/SpeakingMaterial');
const SpeakingAttempt  = require('../models/SpeakingAttempt');

// ── GET /api/speaking/topics ─────────────────────────────────
exports.getTopics = async (req, res) => {
  try {
    const topics = await SpeakingQuestion.distinct('topic', { isActive: true });
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

    const questions = await SpeakingQuestion.find(filter).sort({ topic: 1, part: 1 });
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

    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_KEY) {
      return res.json({
        success: true,
        feedback: {
          corrected:     transcript,
          errors:        [],
          tips:          ['Chưa cấu hình OPENROUTER_API_KEY trong .env'],
          band_estimate: null
        }
      });
    }

    const prompt = `You are an IELTS speaking examiner. Analyze this student response and reply ONLY with a JSON object, no markdown, no explanation.

Question: "${question || 'General speaking practice'}"
Student said: "${transcript}"

Return ONLY this JSON:
{"corrected":"improved natural version","errors":[{"wrong":"original","right":"better","tip":"why"}],"tips":["tip1","tip2"],"band_estimate":"5.0-6.0","fluency":6,"vocabulary":5,"grammar":6,"pronunciation":6,"overall_band":5.5}

Rules: max 3 errors, max 2 tips, scores 1-9. Return ONLY the JSON.`;

    let feedback = null;
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://englishwithdan.onrender.com',
          'X-Title': 'EnglishWithDan'
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [
            { role: 'system', content: 'You are an IELTS examiner. Respond with valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 900
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

      try {
        feedback = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*"corrected"[\s\S]*\}/);
        if (match) feedback = JSON.parse(match[0]);
      }
    } catch (aiErr) {
      console.error('[Speaking] AI error:', aiErr.message);
    }

    if (!feedback) {
      return res.json({ success: false, message: 'AI không thể phân tích. Vui lòng thử lại.' });
    }

    // Save attempt to DB
    try {
      const attempt = new SpeakingAttempt({
        userId:     req.user._id,
        questionId: questionId || null,
        topic:      topic || '',
        part:       part ? Number(part) : 1,
        question:   question || '',
        transcript,
        duration:   duration || 0,
        status:     'analyzed',
        aiFeedback: {
          overallBand:   feedback.overall_band || 0,
          fluency:       feedback.fluency || 0,
          vocabulary:    feedback.vocabulary || 0,
          grammar:       feedback.grammar || 0,
          pronunciation: feedback.pronunciation || 0,
          feedback:      feedback.corrected || '',
          corrections:   (feedback.errors || []).map(e => ({
            original:    e.wrong,
            corrected:   e.right,
            explanation: e.tip
          })),
          suggestions:   feedback.tips || []
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
      .limit(20)
      .select('-transcript');
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
