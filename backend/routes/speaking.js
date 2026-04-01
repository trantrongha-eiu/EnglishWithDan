const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const SpeakingQuestion = require('../models/SpeakingQuestion');
const SpeakingMaterial = require('../models/SpeakingMaterial');

// ── GET /api/speaking/topics ─────────────────────────────
router.get('/topics', auth, async (req, res) => {
  try {
    const topics = await SpeakingQuestion.distinct('topic', { isActive: true });
    res.json({ success: true, topics: topics.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/speaking/random?topic=Travel&part=1 ─────────
router.get('/random', auth, async (req, res) => {
  try {
    const { topic, part } = req.query;
    const filter = { isActive: true };
    if (topic && topic !== 'all') filter.topic = topic;
    if (part  && part  !== 'all') filter.part  = Number(part);

    const count = await SpeakingQuestion.countDocuments(filter);
    if (count === 0) return res.json({ success: false, message: 'Không có câu hỏi' });

    const skip     = Math.floor(Math.random() * count);
    const question = await SpeakingQuestion.findOne(filter).skip(skip);
    res.json({ success: true, question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/speaking/questions?topic=Travel&part=1 ──────
router.get('/questions', auth, async (req, res) => {
  try {
    const { topic, part } = req.query;
    const filter = { isActive: true };
    if (topic && topic !== 'all') filter.topic = topic;
    if (part  && part  !== 'all') filter.part  = Number(part);

    const questions = await SpeakingQuestion.find(filter).sort({ topic: 1, part: 1 });
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/speaking/analyze ────────────────────────────
// Body: { transcript, question }
router.post('/analyze', auth, async (req, res) => {
  try {
    const { transcript, question } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ success: false, message: 'Transcript trống' });
    }

    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_KEY) {
      return res.json({
        success: true,
        feedback: {
          corrected: transcript,
          errors: [],
          tips: ['Chưa cấu hình OPENROUTER_API_KEY trong .env'],
          band_estimate: null
        }
      });
    }

    const prompt = `You are an IELTS speaking examiner and coach.

The student was asked: "${question || 'General speaking practice'}"

The student said:
"${transcript}"

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "corrected": "A natural, improved version of what the student said",
  "errors": [
    {"wrong": "original phrase", "right": "corrected phrase", "tip": "short explanation"}
  ],
  "tips": ["vocabulary tip", "grammar or fluency tip"],
  "band_estimate": "5.0-6.0"
}

Rules:
- Max 3 errors (pick the most important ones)
- Max 2 tips (practical, actionable)
- corrected should sound natural and fluent
- band_estimate as a range like "5.5-6.0"
- Be encouraging but honest`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://englishwithdan.onrender.com',
        'X-Title': 'EnglishWithDan'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 600
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const feedback = JSON.parse(jsonMatch[0]);
        return res.json({ success: true, feedback });
      } catch { /* fall through */ }
    }

    res.json({
      success: true,
      feedback: { corrected: content, errors: [], tips: [], band_estimate: null }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/speaking/materials?quarter=Q1+2025&topic=Travel ──
router.get('/materials', auth, async (req, res) => {
  try {
    const { quarter, topic } = req.query;
    const filter = { isActive: true };
    if (quarter && quarter !== 'all') filter.quarter = quarter;
    if (topic   && topic   !== 'all') filter.topic   = topic;

    const materials = await SpeakingMaterial.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/speaking/material-filters ───────────────────
router.get('/material-filters', auth, async (req, res) => {
  try {
    const [quarters, topics] = await Promise.all([
      SpeakingMaterial.distinct('quarter', { isActive: true }),
      SpeakingMaterial.distinct('topic',   { isActive: true })
    ]);
    res.json({ success: true, quarters: quarters.sort().reverse(), topics: topics.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
