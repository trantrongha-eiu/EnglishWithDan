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
    // 413 (file exceeds Groq free-tier's 25MB cap) can never succeed by
    // retrying — only compressing/re-uploading the source audio fixes it,
    // which no amount of transcript/code changes can do. Flagged so the
    // bulk script can stop re-attempting it on every run (unlike a content
    // rejection, which a transcript-cleaning fix might resolve).
    if (res.status === 413) {
      err.isFileTooLarge = true;
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

// Cambridge-style listening audio opens with spoken instructions ("You will
// hear a conversation about...") that are never part of the transcript we
// align against. Left alone, the global alignment's DP is free to match the
// FIRST known word against a coincidentally-similar word anywhere earlier
// in that instructional preamble — most dangerous for the first sentence,
// since there's no earlier matched neighbour to constrain it. Anchoring on
// a run of ANCHOR_LEN consecutive exact-matching words (a coincidence at
// that length is vanishingly unlikely) finds where the real transcript
// content actually starts and discards every ASR word before it, so the
// preamble is never a candidate match for anything.
const ANCHOR_LEN = 4;

function findAnchorOffset(knownWordsFlat, asrTokens, anchorLen = ANCHOR_LEN) {
  if (knownWordsFlat.length < anchorLen) return 0; // too short a transcript to anchor reliably — skip
  const needle = knownWordsFlat.slice(0, anchorLen);
  for (let j = 0; j + anchorLen <= asrTokens.length; j++) {
    let allMatch = true;
    for (let k = 0; k < anchorLen; k++) {
      if (asrTokens[j + k] !== needle[k]) { allMatch = false; break; }
    }
    if (allMatch) return j;
  }
  return 0; // no clean anchor found — fall back to aligning the full stream
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

  const fullAsrTokens = asrWords.map(w => normalizeWord(w.word));
  const anchorOffset = findAnchorOffset(knownWordsFlat, fullAsrTokens);
  asrWords = asrWords.slice(anchorOffset);
  const asrTokens = fullAsrTokens.slice(anchorOffset);
  const pairs = globalAlign(knownWordsFlat, asrTokens);

  const knownToAsr = new Array(knownWordsFlat.length).fill(null);
  for (const [ki, ai] of pairs) {
    if (ki !== null && ai !== null) knownToAsr[ki] = ai;
  }

  const results = knownSentences.map((sentence, s) => {
    const [wStart, wEnd] = sentenceWordRanges[s];
    let firstAsr = null, lastAsr = null, matchedWords = 0;
    const unmatchedTokens = [];
    for (let k = wStart; k < wEnd; k++) {
      if (knownToAsr[k] !== null) {
        if (firstAsr === null) firstAsr = knownToAsr[k];
        lastAsr = knownToAsr[k];
        matchedWords++;
      } else {
        unmatchedTokens.push(knownWordsFlat[k]);
      }
    }
    return {
      text: sentence,
      start: firstAsr !== null ? asrWords[firstAsr].start : null,
      end: lastAsr !== null ? asrWords[lastAsr].end : null,
      matchedWords,
      totalWords: wEnd - wStart,
      unmatchedTokens,
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

// Strict quality gate — the product requirement here is "100% accuracy",
// so this rejects a section entirely rather than shipping a mix of good and
// broken sentences. Two independent checks per sentence:
//  1. matchedWords === totalWords — every word in the sentence found its
//     own ASR word (not just "most of them"); a partial match means the
//     displayed text and the played audio have genuinely drifted apart.
//  2. Plausible speech rate — natural English conversation runs roughly
//     1.5-4 words/second; a sentence timed far outside that (e.g. "Fine."
//     clocking in at 0.01s, or a sentence spanning a 30s dead-air gap) is a
//     symptom of an alignment that locked onto the wrong part of the audio,
//     even if every word technically "matched" something.
const MIN_WORDS_PER_SECOND = 0.5;
const MAX_WORDS_PER_SECOND = 6;

// Hesitation sounds ("um", "uh", "hmm"...) are genuinely spoken, so they
// stay in the displayed/checked transcript text — but Whisper transcribes
// them inconsistently (drops them, or spells them differently each time),
// so requiring them to match like any other word rejected nearly every
// real conversational section (interviews/Part-1/Part-3 dialogue is full
// of them). A sentence is still accepted if every UNMATCHED word is one of
// these — every word that actually carries meaning still had to match.
const FILLER_WORDS = new Set(['um', 'umm', 'uh', 'uhh', 'erm', 'hmm', 'mm', 'mmhmm', 'ah', 'ahh', 'huh']);

function validateAlignment(results) {
  const issues = [];
  results.forEach((r, i) => {
    if (r.matchedWords !== r.totalWords) {
      const unmatched = r.unmatchedTokens || [];
      if (!unmatched.every(t => FILLER_WORDS.has(t))) {
        issues.push({ index: i, text: r.text, reason: `chỉ khớp ${r.matchedWords}/${r.totalWords} từ (thiếu: ${unmatched.join(', ')})` });
        return;
      }
    }
    const duration = r.end - r.start;
    const wps = duration > 0 ? r.totalWords / duration : Infinity;
    if (duration <= 0 || wps > MAX_WORDS_PER_SECOND || wps < MIN_WORDS_PER_SECOND) {
      issues.push({ index: i, text: r.text, reason: `thời lượng bất thường (${duration.toFixed(2)}s cho ${r.totalWords} từ)` });
    }
  });
  return { valid: issues.length === 0, issues };
}

// Per-sentence selection — unlike validateAlignment's all-or-nothing gate
// (reject the WHOLE section over a single bad sentence), this keeps
// whichever sentences are both accurately timed AND substantive, silently
// dropping the rest. Per product decision: a dictation section doesn't need
// EVERY sentence from the passage — spelled-out words/phone numbers/emails
// (exactly what routinely fails the word-match check, since Whisper
// transcribes digits/letters-said-aloud inconsistently) and short filler
// turns ("Okay.", "Hello.", "Right.") aren't useful listening-fill-in
// practice anyway, even when their timing happens to be perfectly accurate.
// Three independent reasons a sentence gets dropped:
//   1. Word-mismatch — same rule as validateAlignment (filler-word unmatched
//      tokens still pass).
//   2. Implausible speech rate — same MIN/MAX_WORDS_PER_SECOND bounds.
//   3. Too short to be a substantive dictation unit (< minWords), independent
//      of whether it aligned perfectly.
const MIN_DICTATION_WORDS = 6;

function selectDictationSentences(results, minWords = MIN_DICTATION_WORDS) {
  const kept = [];
  const dropped = [];
  results.forEach((r, i) => {
    const unmatched = r.unmatchedTokens || [];
    const wordsOk = r.matchedWords === r.totalWords || unmatched.every(t => FILLER_WORDS.has(t));
    const duration = r.end - r.start;
    const wps = duration > 0 ? r.totalWords / duration : Infinity;
    const timingOk = duration > 0 && wps <= MAX_WORDS_PER_SECOND && wps >= MIN_WORDS_PER_SECOND;
    const substantive = r.totalWords >= minWords;

    if (wordsOk && timingOk && substantive) {
      kept.push({ text: r.text, start: r.start, end: r.end });
      return;
    }
    let reason;
    if (!wordsOk) reason = `từ không khớp Whisper (thiếu: ${unmatched.join(', ')})`;
    else if (!timingOk) reason = `thời lượng bất thường (${duration.toFixed(2)}s cho ${r.totalWords} từ)`;
    else reason = `câu quá ngắn (${r.totalWords} từ < ${minWords})`;
    dropped.push({ index: i, text: r.text, reason });
  });
  return { kept, dropped };
}

module.exports = {
  transcribeWithWordTimestamps, alignSentences, validateAlignment, selectDictationSentences,
  tokenizeSentence, globalAlign, normalizeWord, findAnchorOffset,
};
