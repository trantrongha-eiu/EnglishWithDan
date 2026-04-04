const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
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
    if (part && part !== 'all') filter.part = Number(part);

    const count = await SpeakingQuestion.countDocuments(filter);
    if (count === 0) return res.json({ success: false, message: 'Không có câu hỏi' });

    const skip = Math.floor(Math.random() * count);
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
    if (part && part !== 'all') filter.part = Number(part);

    const questions = await SpeakingQuestion.find(filter).sort({ topic: 1, part: 1 });
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/speaking/analyze ────────────────────────────
// Thay thế toàn bộ route này trong backend/routes/speaking.js
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

    const prompt = `You are an IELTS speaking examiner. Analyze this student response and reply ONLY with a JSON object, no markdown, no explanation, just raw JSON.

Question: "${question || 'General speaking practice'}"
Student said: "${transcript}"

Return exactly this JSON structure:
{"corrected":"improved natural version of what student said","errors":[{"wrong":"original phrase","right":"better phrase","tip":"why"}],"tips":["tip1","tip2"],"band_estimate":"5.0-6.0"}

Rules: max 3 errors, max 2 tips, band_estimate as range string. Return ONLY the JSON object.`;

    // MỚI - thay toàn bộ vòng lặp for bằng 1 call duy nhất:
    let feedback = null;

    try {
      console.log(`[Speaking] Trying openrouter/free router`);
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
            {
              role: 'system',
              content: 'You are an IELTS examiner. Always respond with valid JSON only, no markdown, no extra text.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 800
        })
      });

      const data = await response.json();
      console.log(`[Speaking] Response:`, JSON.stringify(data).slice(0, 300));
      const content = data.choices?.[0]?.message?.content || '';

      const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      try {
        feedback = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*"corrected"[\s\S]*\}/);
        if (match) feedback = JSON.parse(match[0]);
      }
    } catch (err) {
      console.log(`[Speaking] Error:`, err.message);
    }

    // Fallback: trả về thông báo lỗi rõ ràng thay vì echo transcript
    return res.json({
      success: false,
      message: 'AI không thể phân tích lúc này. Vui lòng thử lại sau.'
    });

  } catch (err) {
    console.error('[Speaking] Analyze error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/speaking/materials?quarter=Q1+2025&topic=Travel ──
router.get('/materials', auth, async (req, res) => {
  try {
    const { quarter, topic } = req.query;
    const filter = { isActive: true };
    if (quarter && quarter !== 'all') filter.quarter = quarter;
    if (topic && topic !== 'all') filter.topic = topic;

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
      SpeakingMaterial.distinct('topic', { isActive: true })
    ]);
    res.json({ success: true, quarters: quarters.sort().reverse(), topics: topics.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
