'use strict';

// Neural text-to-speech (Azure Speech) with a permanent R2 cache: a sentence is
// generated once per voice, then every student replays the same MP3. The
// browser falls back to its own voice whenever this service says no, so nothing
// here is allowed to break a practice session.
const crypto = require('crypto');
const config = require('../config');
const r2Service = require('./r2Service');
const TtsUsage = require('../models/TtsUsage');
const logger = require('../utils/logger');
const { AppError, ValidationError } = require('../errors/AppError');
const { getVoice, WORD_VOICE } = require('../constants/ttsVoices');

const MAX_TEXT_LEN = 1200;
const AZURE_TIMEOUT_MS = 12000;
const OUTPUT_FORMAT = 'audio-24khz-96kbitrate-mono-mp3';
const KNOWN_KEYS_MAX = 5000;
const DAY_MS = 24 * 60 * 60 * 1000;

const knownKeys = new Set();     // R2 keys confirmed to exist (skips a HEAD)
const inFlight = new Map();      // R2 key → Promise<url>, so a burst generates once

function isEnabled() {
  return !!(config.tts.azureKey && config.tts.azureRegion && r2Service.isConfigured());
}

function normalizeText(text) {
  if (typeof text !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function buildSsml(text, voice) {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voice.locale}">`
    + `<voice name="${voice.azure}">${escapeXml(text)}</voice></speak>`;
}

// The Azure voice name is part of the hash, so remapping a voice in
// constants/ttsVoices.js produces new audio instead of replaying the old one.
function objectKey(text, voice) {
  const hash = crypto.createHash('sha256').update(`${voice.azure}\n${text}`).digest('hex').slice(0, 40);
  return `tts/v1/${voice.id}/${hash}.mp3`;
}

function remember(key) {
  if (knownKeys.size >= KNOWN_KEYS_MAX) knownKeys.delete(knownKeys.values().next().value);
  knownKeys.add(key);
}

// Atomically adds `n` to a budget window unless that would pass `limit`.
async function reserve(key, n, limit, expiresAt) {
  // Without this, a new window's upsert would insert `n` past the limit.
  if (n > limit) return false;
  const filter = { key, chars: { $lte: limit - n } };
  try {
    await TtsUsage.updateOne(filter, { $inc: { chars: n }, $setOnInsert: { expiresAt } }, { upsert: true });
    return true;
  } catch (err) {
    if (err.code !== 11000) throw err;
    // Either the window is full, or a concurrent request just created it.
    const res = await TtsUsage.updateOne(filter, { $inc: { chars: n } });
    return res.modifiedCount === 1;
  }
}

const refund = (key, n) => TtsUsage.updateOne({ key }, { $inc: { chars: -n } }).catch(() => {});

async function reserveBudget(userId, n) {
  const now = new Date();
  const iso = now.toISOString();
  const userKey = `user:${userId}:${iso.slice(0, 10)}`;
  const monthKey = `month:${iso.slice(0, 7)}`;

  if (!await reserve(userKey, n, config.tts.userDailyCharLimit, new Date(now.getTime() + 2 * DAY_MS))) {
    throw new AppError('Bạn đã dùng hết lượt tạo giọng đọc mới hôm nay.', 429);
  }
  if (!await reserve(monthKey, n, config.tts.monthlyCharLimit, new Date(now.getTime() + 40 * DAY_MS))) {
    await refund(userKey, n);
    logger.warn('tts', 'Monthly character budget reached', { monthKey });
    throw new AppError('Giọng đọc AI tạm hết hạn mức tháng này.', 429);
  }
  return () => Promise.all([refund(userKey, n), refund(monthKey, n)]);
}

async function synthesize(text, voice) {
  const url = `https://${config.tts.azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.tts.azureKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': OUTPUT_FORMAT,
        'User-Agent': 'EnglishWithDan',
      },
      body: buildSsml(text, voice),
      signal: AbortSignal.timeout(AZURE_TIMEOUT_MS),
    });
  } catch (err) {
    logger.warn('tts', 'Azure request failed', { voice: voice.id, error: err.message });
    throw new AppError('Dịch vụ giọng đọc đang bận.', 503);
  }
  if (!res.ok) {
    logger.warn('tts', 'Azure rejected the request', { voice: voice.id, status: res.status });
    throw new AppError('Dịch vụ giọng đọc đang bận.', 503);
  }
  const audio = Buffer.from(await res.arrayBuffer());
  if (!audio.length) throw new AppError('Dịch vụ giọng đọc đang bận.', 503);
  return audio;
}

async function generate(key, text, voice, userId) {
  if (await r2Service.objectExists(key)) return r2Service.publicUrlOf(key);
  const undoBudget = await reserveBudget(userId, text.length);
  try {
    const audio = await synthesize(text, voice);
    return await r2Service.putObject(key, audio, 'audio/mpeg');
  } catch (err) {
    await undoBudget();
    throw err;
  }
}

// Public URL of `text` spoken by `voiceId` (default: the vocabulary voice).
async function getSpeechUrl({ text, voiceId, userId }) {
  if (!isEnabled()) throw new AppError('Giọng đọc AI chưa được bật.', 503);

  const clean = normalizeText(text);
  if (!clean || !/[A-Za-z]/.test(clean)) throw new ValidationError('Thiếu nội dung cần đọc');
  if (clean.length > MAX_TEXT_LEN) throw new ValidationError('Nội dung quá dài');
  const voice = getVoice(voiceId || WORD_VOICE);
  if (!voice) throw new ValidationError('Giọng đọc không hợp lệ');

  const key = objectKey(clean, voice);
  if (knownKeys.has(key)) return r2Service.publicUrlOf(key);

  let job = inFlight.get(key);
  if (!job) {
    job = generate(key, clean, voice, userId).finally(() => inFlight.delete(key));
    inFlight.set(key, job);
  }
  const url = await job;
  remember(key);
  return url;
}

// Test hook: the caches above outlive a single test.
function resetCaches() { knownKeys.clear(); inFlight.clear(); }

module.exports = { isEnabled, getSpeechUrl, buildSsml, normalizeText, objectKey, resetCaches, MAX_TEXT_LEN };
