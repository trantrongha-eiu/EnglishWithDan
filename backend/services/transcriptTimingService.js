'use strict';

// Word-level timing of a Listening transcript, for the "highlight what the
// speaker is saying" sync (frontend js/shared/transcript-sync.js).
//
// A transcript is cut into raw tokens exactly like the browser does —
// text.split(/\s+/) minus empties — and every token gets [start, end]
// seconds into the audio, or null when it isn't spoken (speaker labels,
// "(31)"/"Q1" annotations, headings Whisper never heard). Times come from
// aligning our verified transcript against local faster-whisper word
// timestamps (scripts/alignTranscriptTiming.js) with the same
// Needleman-Wunsch aligner the dictation feature uses — Whisper's own
// wording is only a timing oracle, never shown.
//
// Stored as a compact string (see encodeTiming) on ListeningSection
// .transcriptTiming and ListeningTest.sections[].transcriptTiming.

const { globalAlign, normalizeWord, findAnchorOffset } = require('./listeningAlignmentService');

function tokenize(text) {
  return String(text || '').split(/\s+/).filter(Boolean);
}

// Same speaker-label rule as the Gap-fill renderer (GF_SPEAKER_RE in
// listening-practice.js): a line starting with up to 3 capitalised words and
// a colon — "Woman:", "LEON:", "MRS SMITH:".
const SPEAKER_RE = /^\s*([A-Z][A-Za-z'.-]*(?:\s+[A-Z][A-Za-z'.-]*){0,2}):\s*(.*)$/;
const ANNOTATION_RE = /^(\(\d{1,3}\)|Q\d{1,3}\.?)$/;

// true per raw token that is meant to be heard.
function spokenMask(text) {
  const mask = [];
  for (const line of String(text || '').split('\n')) {
    const m = line.match(SPEAKER_RE);
    const labelWords = m ? m[1].trim().split(/\s+/).length : 0;
    tokenize(line).forEach((tok, i) => {
      mask.push(i >= labelWords && !ANNOTATION_RE.test(tok) && !!normalizeWord(tok));
    });
  }
  return mask;
}

// Unmatched words between two matched ones get evenly spread times — but
// only when the hole is about as long as those words would take to say;
// a longer hole means text that was never spoken (or a long pause), and a
// highlight there would just be wrong.
function interpolate(times) {
  let i = 0;
  while (i < times.length) {
    if (times[i] !== null) { i++; continue; }
    let j = i;
    while (j < times.length && times[j] === null) j++;
    const prev = i > 0 ? times[i - 1] : null;
    const next = j < times.length ? times[j] : null;
    const k = j - i;
    if (prev && next) {
      const a = prev[1], b = next[0];
      if (b >= a && b - a <= 0.7 * k + 1.5) {
        const step = (b - a) / k;
        for (let x = 0; x < k; x++) times[i + x] = [a + step * x, a + step * (x + 1)];
      }
    }
    i = j;
  }
  return times;
}

// texts: transcripts that are heard one after another in the same audio
// (one bài lẻ section, or the 4 parts of a full test). asrWords: [{w,s,e}].
// Returns one timing array per text: per raw token [start, end] or null.
function alignTranscripts(texts, asrWords) {
  const parts = texts.map(t => ({ toks: tokenize(t), mask: spokenMask(t) }));
  const known = [];
  const ref = []; // known index -> [part, token]
  parts.forEach((p, pi) => p.toks.forEach((tok, ti) => {
    if (!p.mask[ti]) return;
    known.push(normalizeWord(tok));
    ref.push([pi, ti]);
  }));

  const asrAll = asrWords.map(w => normalizeWord(w.w || w.word || ''));
  const off = findAnchorOffset(known, asrAll);
  const asr = asrAll.slice(off);
  const asrW = asrWords.slice(off);

  // Exact matches only; mismatched pairs are left to interpolation so a
  // heading can't borrow the time of an unrelated instruction word.
  const knownTimes = new Array(known.length).fill(null);
  const exact = new Array(known.length).fill(false);
  if (known.length && asr.length) {
    for (const [ki, ai] of globalAlign(known, asr)) {
      if (ki === null || ai === null || known[ki] !== asr[ai]) continue;
      knownTimes[ki] = [asrW[ai].s ?? asrW[ai].start, asrW[ai].e ?? asrW[ai].end];
      exact[ki] = true;
    }
  }
  // A lone match with no matched neighbour close by in time is a
  // coincidence — e.g. a heading word "Festival" pairing with the intro's
  // "...the Beechen festival office" a minute before the dialogue.
  const near = (k, j) => j >= 0 && j < known.length && exact[j] &&
    Math.abs(knownTimes[j][0] - knownTimes[k][0]) <= 4;
  const isolated = [];
  for (let k = 0; k < known.length; k++) {
    if (exact[k] && !near(k, k - 1) && !near(k, k + 1)) isolated.push(k);
  }
  isolated.forEach(k => { knownTimes[k] = null; exact[k] = false; });
  interpolate(knownTimes);

  const out = parts.map(p => new Array(p.toks.length).fill(null));
  const exactOut = parts.map(p => new Array(p.toks.length).fill(false));
  ref.forEach(([pi, ti], k) => { out[pi][ti] = knownTimes[k]; exactOut[pi][ti] = exact[k]; });
  out.forEach((arr, pi) => {
    Object.defineProperty(arr, 'stats', {
      enumerable: false,
      value: { spoken: parts[pi].mask.filter(Boolean).length, exact: exactOut[pi].filter(Boolean).length },
    });
  });
  return out;
}

function timingQuality(timing) {
  const st = timing.stats || { spoken: timing.length, exact: timing.filter(Boolean).length };
  return {
    match: st.spoken ? st.exact / st.spoken : 0,
    covered: timing.length ? timing.filter(Boolean).length / timing.length : 0,
  };
}

// Compact text form, one comma-separated entry per raw token: empty for an
// unspoken token, else "<start delta>.<duration>" in base-36 centiseconds,
// the delta counted from the previous timed token's start. ~5 chars/word.
// decodeTiming here and in js/shared/transcript-sync.js must stay in step.
function encodeTiming(timing) {
  let prev = 0;
  return timing.map(t => {
    if (!t) return '';
    const s = Math.max(0, Math.round(t[0] * 100));
    const d = Math.max(0, Math.round(t[1] * 100) - s);
    const delta = s - prev;
    prev = s;
    return `${delta < 0 ? '-' + (-delta).toString(36) : delta.toString(36)}.${d.toString(36)}`;
  }).join(',');
}

function decodeTiming(str) {
  if (!str) return null;
  let prev = 0;
  return str.split(',').map(e => {
    if (!e) return null;
    const [a, b] = e.split('.');
    const s = prev + (a[0] === '-' ? -parseInt(a.slice(1), 36) : parseInt(a, 36));
    prev = s;
    return [s / 100, (s + parseInt(b, 36)) / 100];
  });
}

// Gap-fill template tokens ("a [[1]] with") → timing, from the transcript's
// own timing: the template is the transcript with answers swapped for
// [[n]], so expanding each template token consumes the transcript tokens it
// stands for. Encoded string, or '' when anything doesn't line up.
function gapFillTiming(template, answers, transcript, transcriptTiming) {
  const timing = decodeTiming(transcriptTiming);
  const tTok = tokenize(transcript);
  if (!timing || timing.length !== tTok.length) return '';
  const out = [];
  let k = 0;
  for (const tok of tokenize(template)) {
    const expanded = tok.replace(/\[\[(\d+)\]\]/g, (_, n) => (answers || [])[n - 1] ?? '');
    let s = null, e = null;
    for (const x of tokenize(expanded)) {
      if (tTok[k] !== x) return '';
      const tm = timing[k++];
      if (tm) { if (s === null) s = tm[0]; e = tm[1]; }
    }
    out.push(s === null ? null : [s, e]);
  }
  return k === tTok.length ? encodeTiming(out) : '';
}

// Token count must match for a stored timing to still belong to the text
// (an admin edit of the transcript makes it stale).
function timingFits(text, encoded) {
  return !!encoded && encoded.split(',').length === tokenize(text).length;
}

module.exports = {
  tokenize, spokenMask, alignTranscripts, timingQuality,
  encodeTiming, decodeTiming, gapFillTiming, timingFits,
};
