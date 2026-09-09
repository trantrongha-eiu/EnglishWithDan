'use strict';

// OPTIONAL second fallback engine for Speaking grading (the `analyze` path
// only), tried when Gemini fails and BEFORE Groq. Unlike Groq (Llama,
// text-only), Mistral's Voxtral is audio-native, so on the fallback path it
// can still grade Pronunciation from the recording — provided the container
// is one Voxtral accepts (NOT webm).
//
// Fully opt-in: with no MISTRAL_API_KEY set this module is never called and
// nothing changes. Mistral's "Experiment" tier on La Plateforme is free.
//
// Grades against the EXACT SAME system/user prompts + JSON schema as Gemini
// (imported from geminiService, never copied) so results stay
// indistinguishable and the two can't silently drift apart — same rule
// groqService.js follows.
const logger = require('../utils/logger');
const {
  speakingSystemInstruction, buildSpeakingGradingPrompt, extractJson,
} = require('./geminiService');

const MISTRAL_MODEL = 'voxtral-mini-latest'; // audio-native; also handles the text-only path
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

// speakingService.normalizeAudioForGemini hands us a mimeType like
// 'video/webm' | 'audio/ogg' | 'video/mp4' | 'audio/wav' | 'audio/mp3'.
// Voxtral takes common audio containers but not webm — map to its plain
// `format`, or null to fall back to transcript-only on this engine.
function _voxtralFormat(mimeType) {
  const m = String(mimeType || '').toLowerCase();
  if (m.includes('ogg')) return 'ogg';
  if (m.includes('wav')) return 'wav';
  if (m.includes('mp3') || m.includes('mpeg')) return 'mp3';
  if (m.includes('flac')) return 'flac';
  if (m.includes('mp4') || m.includes('m4a')) return 'm4a';
  return null; // webm / unknown
}

async function checkSpeakingMistral(question, transcript, part = 1, audio = null, _attempt = 0) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY chưa được cấu hình');

  const fmt = audio && audio.data ? _voxtralFormat(audio.mimeType) : null;
  const hasAudio = !!fmt;
  const promptText = buildSpeakingGradingPrompt(question, transcript, part, hasAudio);
  const userContent = hasAudio
    ? [
        { type: 'text', text: promptText },
        { type: 'input_audio', input_audio: { data: audio.data, format: fmt } },
      ]
    : promptText;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), hasAudio ? 45000 : 20000);

  let response;
  try {
    response = await fetch(MISTRAL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          { role: 'system', content: speakingSystemInstruction(hasAudio) },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    logger.ai('checkSpeakingMistral: network/timeout error', { errorMessage: err.message });
    throw new Error('Mistral không phản hồi kịp thời.', { cause: err });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    logger.ai('checkSpeakingMistral: API error', { status: response.status, errorMessage: errText.slice(0, 500) });
    throw new Error(`Mistral API lỗi (${response.status})`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';
  try {
    const parsed = extractJson(rawText);
    parsed._heardAudio = hasAudio;
    return parsed;
  } catch (parseErr) {
    if (_attempt < 1) {
      logger.ai('checkSpeakingMistral: JSON parse failed, retrying', { errorMessage: parseErr.message });
      return checkSpeakingMistral(question, transcript, part, audio, _attempt + 1);
    }
    throw new Error('Mistral không trả về JSON hợp lệ sau 2 lần thử', { cause: parseErr });
  }
}

module.exports = { checkSpeakingMistral, _voxtralFormat };
