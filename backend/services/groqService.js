'use strict';

// Fallback grading engine — used ONLY when Gemini is overloaded/out of
// quota (see speakingService.gradeSpeaking's try/catch). Groq previously
// WAS this app's primary AI grader (writing essays, pre-Gemini migration —
// see git history "chuyển AI chấm bài từ Gemini sang Groq" then later
// "switch essay checker from Groq/Llama to Google Gemini"), so this reuses
// that same OpenAI-compatible chat-completions call shape.
//
// Deliberately grades against the EXACT SAME prompt/schema as Gemini
// (geminiService.SPEAKING_SYSTEM / buildSpeakingGradingPrompt, imported
// rather than copied) so a student can't tell which engine graded their
// attempt from the result shape, and the two never silently drift apart.
const logger = require('../utils/logger');
const { SPEAKING_SYSTEM, buildSpeakingGradingPrompt, extractJson } = require('./geminiService');

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function checkSpeakingGroq(question, transcript, part = 1, _attempt = 0) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY chưa được cấu hình');

  const userPrompt = buildSpeakingGradingPrompt(question, transcript, part);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  let response;
  try {
    response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SPEAKING_SYSTEM },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 768,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });
  } catch (err) {
    logger.ai('checkSpeakingGroq: network/timeout error', { errorMessage: err.message });
    throw new Error('Groq không phản hồi kịp thời.');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    logger.ai('checkSpeakingGroq: Groq API error', { status: response.status, errorMessage: errText.slice(0, 500) });
    throw new Error(`Groq API lỗi (${response.status})`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';

  try {
    return extractJson(rawText);
  } catch (parseErr) {
    if (_attempt < 1) {
      logger.ai('checkSpeakingGroq: JSON parse failed, retrying', { errorMessage: parseErr.message });
      return checkSpeakingGroq(question, transcript, part, _attempt + 1);
    }
    throw new Error('Groq không trả về JSON hợp lệ sau 2 lần thử');
  }
}

module.exports = { checkSpeakingGroq };
