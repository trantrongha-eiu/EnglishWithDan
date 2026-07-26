'use strict';

// Fallback grading/generation engine — used ONLY when Gemini is
// overloaded/out of quota (see speakingService.js's _withGroqFallback).
// Groq previously WAS this app's primary AI grader (writing essays, pre-
// Gemini migration — see git history "chuyển AI chấm bài từ Gemini sang
// Groq" then later "switch essay checker from Groq/Llama to Google
// Gemini"), so this reuses that same OpenAI-compatible chat-completions
// call shape.
//
// Every function here grades/generates against the EXACT SAME
// system/user prompts as its Gemini counterpart (imported from
// geminiService.js rather than copied) so a student can't tell which
// engine served their request from the result shape, and the two can
// never silently drift apart.
const logger = require('../utils/logger');
const {
  SPEAKING_SYSTEM, buildSpeakingGradingPrompt,
  SAMPLE_ANSWER_SYSTEM, buildSampleAnswerPrompt,
  HINTS_SYSTEM, buildHintsPrompt,
  IMPROVE_ANSWER_SYSTEM, buildImproveAnswerPrompt,
  extractJson,
} = require('./geminiService');

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Shared low-level call — every function below hits the same OpenAI-
// compatible chat-completions endpoint with the same timeout/error
// shaping, differing only in system/user prompt, token budget, and
// whether the response is JSON or plain text.
async function _callGroq(system, userPrompt, { maxTokens = 768, json = true, label = 'groq' } = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY chưa được cấu hình');

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
          { role: 'system', content: system },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: 'json_object' } } : {})
      }),
      signal: controller.signal
    });
  } catch (err) {
    logger.ai(`${label}: network/timeout error`, { errorMessage: err.message });
    throw new Error('Groq không phản hồi kịp thời.');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    logger.ai(`${label}: Groq API error`, { status: response.status, errorMessage: errText.slice(0, 500) });
    throw new Error(`Groq API lỗi (${response.status})`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function checkSpeakingGroq(question, transcript, part = 1, _attempt = 0) {
  const rawText = await _callGroq(
    SPEAKING_SYSTEM, buildSpeakingGradingPrompt(question, transcript, part),
    { maxTokens: 1024, label: 'checkSpeakingGroq' } // matches geminiService.checkSpeaking's budget — same schema, same headroom need
  );
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

async function generateSampleAnswerGroq(question, part = 1, cueCard = '', _attempt = 0) {
  const rawText = await _callGroq(
    SAMPLE_ANSWER_SYSTEM, buildSampleAnswerPrompt(question, part, cueCard),
    { maxTokens: 1024, label: 'generateSampleAnswerGroq' }
  );
  try {
    return extractJson(rawText);
  } catch (parseErr) {
    if (_attempt < 1) {
      logger.ai('generateSampleAnswerGroq: JSON parse failed, retrying', { errorMessage: parseErr.message });
      return generateSampleAnswerGroq(question, part, cueCard, _attempt + 1);
    }
    throw new Error('Groq không trả về JSON hợp lệ sau 2 lần thử');
  }
}

async function generateSpeakingHintsGroq(question, part = 1, sampleAnswerText, _attempt = 0) {
  const rawText = await _callGroq(
    HINTS_SYSTEM, buildHintsPrompt(question, part, sampleAnswerText),
    { maxTokens: 500, label: 'generateSpeakingHintsGroq' }
  );
  try {
    const parsed = extractJson(rawText);
    parsed.vocab = Array.isArray(parsed.vocab) ? parsed.vocab.slice(0, 8).map(String) : [];
    parsed.ideas = Array.isArray(parsed.ideas) ? parsed.ideas.slice(0, 5).map(String) : [];
    return parsed;
  } catch (parseErr) {
    if (_attempt < 1) {
      logger.ai('generateSpeakingHintsGroq: JSON parse failed, retrying', { errorMessage: parseErr.message });
      return generateSpeakingHintsGroq(question, part, sampleAnswerText, _attempt + 1);
    }
    throw new Error('Groq không trả về JSON hợp lệ sau 2 lần thử');
  }
}

async function generateImprovedAnswerGroq(question, part = 1, transcript, _attempt = 0) {
  const rawText = await _callGroq(
    IMPROVE_ANSWER_SYSTEM, buildImproveAnswerPrompt(question, transcript),
    { maxTokens: 512, json: false, label: 'generateImprovedAnswerGroq' }
  );
  const improvedAnswer = (rawText || '').trim();
  if (!improvedAnswer) {
    if (_attempt < 1) {
      logger.ai('generateImprovedAnswerGroq: empty response, retrying', {});
      return generateImprovedAnswerGroq(question, part, transcript, _attempt + 1);
    }
    throw new Error('Groq không trả về nội dung sau 2 lần thử');
  }
  return { improvedAnswer };
}

module.exports = {
  checkSpeakingGroq, generateSampleAnswerGroq, generateSpeakingHintsGroq, generateImprovedAnswerGroq,
};
