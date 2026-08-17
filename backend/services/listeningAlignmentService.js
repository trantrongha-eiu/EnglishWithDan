'use strict';

// Sentence-level forced-alignment for Listening dictation practice: given a
// known, human-verified transcript (already split into sentences by
// listeningTranscriptSplitter) and that same audio's word-level ASR output
// from Groq Whisper, recovers a start/end timestamp for each KNOWN
// sentence. The text shown to students always stays our verified
// transcript — Whisper is used purely as a timing oracle, so its own
// recognition mistakes don't affect what's displayed, only the timing.
//
// Technique: normalize both word streams (lowercase, strip punctuation),
// then run a Needleman-Wunsch global alignment (words as tokens) between
// our known-word sequence and the ASR word sequence. Neither sequence is
// ever reordered (same audio, spoken once), so a global alignment reliably
// recovers which ASR word(s) correspond to each known word even where
// Whisper mis-transcribed a handful of words along the way.

const logger = require('../utils/logger');

const GROQ_TRANSCRIBE_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const WHISPER_MODEL = 'whisper-large-v3';

function normalizeWord(w) {
  return w.toLowerCase().replace(/[^a-z0-9']/g, '');
}

// audioBuffer: Buffer (already downloaded audio bytes, mp3/wav/etc — any
// format Groq's Whisper endpoint accepts). Throws on API error.
async function transcribeWithWordTimestamps(audioBuffer, filename = 'audio.mp3') {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY chưa được cấu hình');

  const form = new FormData();
  form.append('file', new Blob([audioBuffer]), filename);
  form.append('model', WHISPER_MODEL);
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'word');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000); // long-form audio, generous timeout
  let res;
  try {
    res = await fetch(GROQ_TRANSCRIBE_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: form,
      signal: controller.signal,
    });
  } catch (err) {
    logger.ai('listeningAlignment: Groq transcription network/timeout error', { errorMessage: err.message });
    throw new Error('Groq không phản hồi kịp thời khi transcribe audio.');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    logger.ai('listeningAlignment: Groq transcription API error', { status: res.status, errorMessage: errText.slice(0, 500) });
    const err = new Error(`Groq transcription lỗi (${res.status}): ${errText.slice(0, 300)}`);
    // Free-tier "seconds of audio per hour" (ASPH) cap — once hit, every
    // subsequent call fails identically until the rolling hourly window
    // frees up room, so callers should stop the batch rather than burn
    // through the rest of a run hitting this same wall on every item (see
    // the incident this fixed: a 95-section run kept "processing" for 80
    // more items after hitting this on item #16, each failing instantly).
    if (res.status === 429 && /rate_limit_exceeded/.test(errText)) {
      err.isRateLimited = true;
      const m = errText.match(/try again in ([\d.]+)(m)?([\d.]+)?s/);
      if (m) err.retryAfterSeconds = m[2] ? (parseFloat(m[1]) * 60 + parseFloat(m[3] || 0)) : parseFloat(m[1]);
    }
    throw err;
  }

  const data = await res.json();
  // data.words: [{ word, start, end }] — present when timestamp_granularities includes 'word'.
  return (data.words || []).map(w => ({ word: w.word, start: w.start, end: w.end }));
}

function tokenizeSentence(sentence) {
  return sentence.split(/\s+/).filter(Boolean).map(normalizeWord).filter(Boolean);
}

// Needleman-Wunsch global alignment between two token arrays. Returns an
// array of [knownIndex|null, asrIndex|null] pairs in order — null on one
// side means an insertion/deletion (a word only that side has).
function globalAlign(knownTokens, asrTokens) {
  const n = knownTokens.length, m = asrTokens.length;
  const MATCH = 2, MISMATCH = -1, GAP = -1;

  const dp = new Array(n + 1);
  for (let i = 0; i <= n; i++) dp[i] = new Float32Array(m + 1);
  for (let i = 1; i <= n; i++) dp[i][0] = dp[i - 1][0] + GAP;
  for (let j = 1; j <= m; j++) dp[0][j] = dp[0][j - 1] + GAP;

  for (let i = 1; i <= n; i++) {
    const row = dp[i], prevRow = dp[i - 1];
    for (let j = 1; j <= m; j++) {
      const sub = prevRow[j - 1] + (knownTokens[i - 1] === asrTokens[j - 1] ? MATCH : MISMATCH);
      const del = prevRow[j] + GAP;
      const ins = row[j - 1] + GAP;
      row[j] = Math.max(sub, del, ins);
    }
  }

  const pairs = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const sub = dp[i - 1][j - 1] + (knownTokens[i - 1] === asrTokens[j - 1] ? MATCH : MISMATCH);
      if (dp[i][j] === sub) {
        pairs.push([i - 1, j - 1]);
        i--; j--;
        continue;
      }
    }
    if (i > 0 && dp[i][j] === dp[i - 1][j] + GAP) {
      pairs.push([i - 1, null]);
      i--;
      continue;
    }
    pairs.push([null, j - 1]);
    j--;
  }
  pairs.reverse();
  return pairs;
}

// Aligns known sentences (string[]) against ASR word timestamps, returning
// [{ text, start, end, matchedWords, totalWords }] — one per known
// sentence, in order. A sentence with zero directly-matched ASR words
// (rare — e.g. a lone name) falls back to interpolating from its nearest
// aligned neighbours, so every sentence still gets a playable time range.
function alignSentences(knownSentences, asrWords) {
  const knownWordsFlat = [];
  const sentenceWordRanges = []; // [startIdx, endIdx) into knownWordsFlat, per sentence
  for (const sentence of knownSentences) {
    const tokens = tokenizeSentence(sentence);
    const start = knownWordsFlat.length;
    knownWordsFlat.push(...tokens);
    sentenceWordRanges.push([start, knownWordsFlat.length]);
  }

  const asrTokens = asrWords.map(w => normalizeWord(w.word));
  const pairs = globalAlign(knownWordsFlat, asrTokens);

  const knownToAsr = new Array(knownWordsFlat.length).fill(null);
  for (const [ki, ai] of pairs) {
    if (ki !== null && ai !== null) knownToAsr[ki] = ai;
  }

  const results = knownSentences.map((sentence, s) => {
    const [wStart, wEnd] = sentenceWordRanges[s];
    let firstAsr = null, lastAsr = null, matchedWords = 0;
    for (let k = wStart; k < wEnd; k++) {
      if (knownToAsr[k] !== null) {
        if (firstAsr === null) firstAsr = knownToAsr[k];
        lastAsr = knownToAsr[k];
        matchedWords++;
      }
    }
    return {
      text: sentence,
      start: firstAsr !== null ? asrWords[firstAsr].start : null,
      end: lastAsr !== null ? asrWords[lastAsr].end : null,
      matchedWords,
      totalWords: wEnd - wStart,
    };
  });

  for (let s = 0; s < results.length; s++) {
    if (results[s].start === null) {
      const prevEnd = s > 0 ? results[s - 1].end : 0;
      let next = s + 1;
      while (next < results.length && results[next].start === null) next++;
      const nextStart = next < results.length ? results[next].start : (asrWords[asrWords.length - 1]?.end ?? prevEnd);
      results[s].start = prevEnd;
      results[s].end = nextStart;
    }
  }

  return results;
}

module.exports = { transcribeWithWordTimestamps, alignSentences, tokenizeSentence, globalAlign, normalizeWord };
