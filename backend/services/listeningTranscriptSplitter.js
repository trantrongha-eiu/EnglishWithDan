'use strict';

// Splits a Listening transcript into an ordered array of plain sentences,
// stripped of speaker labels and any authoring artifacts. Feeds
// listeningAlignmentService.alignSentences() — the alignment only works if
// this returns sentences in the same order they're actually spoken, which
// both known transcript formats in this DB already guarantee (verified
// against real data: no reordering, per the dictation-feature research).
//
// Two DIFFERENT formats coexist in production and this handles both:
//  A) ListeningTest.sections[].transcript — paragraph blocks separated by
//     blank lines, each block starting with an inline speaker label
//     ("WOMAN   I've been meaning to ask...") and often containing
//     several sentences per block.
//  B) Standalone ListeningSection.transcript — already mostly one sentence
//     per line, but with the speaker name repeated on its OWN line before
//     each sentence ("Man:\nOh, hello...") and a stray "❓ Transcript"
//     header line.
// Rather than branching on format, one general pass handles both: strip
// speaker-label-only lines, then sentence-split whatever text remains
// (a no-op for lines that are already single sentences).

// A line that's JUST a speaker cue, nothing else — "Man:", "Speaker 1:",
// "Interviewer:", or a bare all-caps name like "WOMAN". The colon is
// mandatory for the mixed-case form: an earlier version made it optional,
// which also matched real short sentences like "Hi Steve." or "You've been
// here all day." purely because they happened to be short and punctuation-
// free — silently dropping them from the transcript. Never match a plain
// sentence: those end in ./!/? or contain a comma, which this excludes.
const SPEAKER_LABEL_LINE = /^([A-Za-z][A-Za-z\s'-]{0,24}:|[A-Z][A-Z\s]{0,20})\s*$/;
const HEADER_LINE = /^❓?\s*Transcript\s*$/i;
// A third source format has no "❓ Transcript" wrapper at all, just a bare
// "PART 1" / "Part 2" section-label line before the dialogue starts.
const PART_LABEL_LINE = /^part\s*\d+\s*$/i;
// A standalone parenthetical production note describing dead air/silence
// between question blocks ("(An interval of 30 seconds)", "(A pause)") —
// never spoken, so it's dropped as its own line rather than tokenized.
const INTERVAL_NOTE_LINE = /^\(\s*(?:an?\s+)?(?:interval|pause|break)\b[^)]*\)\s*$/i;
// Standard IELTS boilerplate spoken between question blocks in the FULL
// test recording ("Before you hear the rest of the conversation, you have
// some time to look at questions 26 to 30 on page 7.") — present in the
// transcript because it's part of the official source document, but a
// standalone "bài lẻ" section's audio is trimmed to just the
// conversation/talk, so this line was never actually spoken in it (0/N
// words ever match). Content varies (question range, page number) but the
// fixed opening phrase is a reliable, low-risk-of-false-positive anchor.
const PRE_INTERVAL_INSTRUCTION_LINE = /^before you hear the rest of the (?:conversation|talk)\b/i;

// Splits into sentences on '.', '!', '?' followed by whitespace + a capital
// letter (or end of string) — avoids splitting mid-abbreviation in the
// common case (e.g. "Mr. Smith") since a capital immediately after "Mr."
// looks identical to a real sentence boundary either way for our purposes:
// worst case a name gets its own zero-content "sentence", which the
// alignment step tolerates (see listeningAlignmentService's null-fallback).
const SENTENCE_BOUNDARY = /(?<=[.!?])\s+(?=[A-Z0-9"'])/;

// Inline editorial markers like "(Q11)" or "(Q29/Q30)" flag where a
// fill-in-blank answer falls in the transcript text — they're never spoken
// in the audio, so Whisper can never match them, which guaranteed exactly
// one "missing word" (and a strict-validation rejection) for every sentence
// that contained one. Strip them before tokenizing/displaying; students
// shouldn't see these either.
const QUESTION_ANNOTATION = /\(\s*Q\d+(?:\s*[/,]\s*Q?\d+)*\s*\)/gi;
// Square-bracket stage directions like "[laughs]" or "[pause]" describe a
// non-verbal sound, not spoken words — Whisper never transcribes them
// either, for the same reason as above. Parentheses are left alone here
// since real spoken asides use them too (only the Q-annotation form above
// is stripped from parens).
const STAGE_DIRECTION = /\[[^\]]*\]/g;

function stripQuestionAnnotations(line) {
  return line
    .replace(QUESTION_ANNOTATION, ' ')
    .replace(STAGE_DIRECTION, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,!?])/g, '$1')
    .trim();
}

function stripSpeakerPrefix(line) {
  // Inline speaker label at the start of a paragraph block, e.g.
  // "WOMAN   I've been meaning..." or "Interviewer: So tell me about...".
  // Also matches two+ names joined by "&" for a shared line of dialogue
  // spoken/reacted to together, e.g. "Helen & Bob: Right." or
  // "Andy & Bob: Fair enough." — without this, both names were tokenized
  // as if spoken, guaranteeing a mismatch since Whisper never says them.
  const m = line.match(/^((?:[A-Z][A-Za-z]{0,20})(?:\s*&\s*[A-Z][A-Za-z]{0,20})*|[A-Z][A-Z\s]{0,20})[:\s]{2,}(.*)$/);
  if (m && m[2].trim()) return m[2].trim();
  return line;
}

// A couple of source docs embed a longer title/section descriptor ending in
// the literal word "Transcript" on one line — sometimes glued directly onto
// the next sentence with no separator at all, e.g.
// "Aboriginal Textile Design TranscriptThe Indigenous people...". No real
// spoken sentence would ever contain the word "transcript" referring to
// itself, so: cut the line at that word and keep only what follows (if the
// line was glued to real content) — dropping the line entirely if nothing
// meaningful remains after it (the "Listening Test 9 – Section 2 Transcript"
// case, a header with nothing following on the same line).
function stripTranscriptHeaderGlue(line) {
  const m = line.match(/transcript\s*(.*)$/i);
  if (!m) return line;
  return m[1].trim() || null;
}

// A dictation unit of 1-2 words ("Fine.", "Oh, hello.") gives the forced-
// aligner almost no context to anchor on reliably — a single short/common
// word can spuriously match the wrong occurrence elsewhere in the audio
// (e.g. into the pre-dialogue instructions), producing a broken near-zero
// or wildly wrong duration. Merging it into an adjacent sentence gives the
// aligner enough surrounding words to lock onto the right position, and
// incidentally matches what a dictation exercise should feel like anyway —
// one complete, meaningful spoken turn per unit, not a stray fragment.
const MIN_UNIT_WORDS = 3;

function wordCount(s) { return s.trim().split(/\s+/).filter(Boolean).length; }

function mergeTinyFragments(sentences, minWords = MIN_UNIT_WORDS) {
  if (sentences.length <= 1) return sentences.slice();
  const merged = [];
  for (const s of sentences) {
    if (merged.length && wordCount(merged[merged.length - 1]) < minWords) {
      merged[merged.length - 1] = merged[merged.length - 1] + ' ' + s;
    } else {
      merged.push(s);
    }
  }
  // A trailing fragment has no "next" sentence to merge forward into —
  // fold it backward onto the previous unit instead.
  if (merged.length > 1 && wordCount(merged[merged.length - 1]) < minWords) {
    const tail = merged.pop();
    merged[merged.length - 1] = merged[merged.length - 1] + ' ' + tail;
  }
  return merged;
}

function splitTranscriptIntoSentences(rawTranscript) {
  if (!rawTranscript || !rawTranscript.trim()) return [];

  let rawLines = rawTranscript.split('\n').map(l => l.trim()).filter(Boolean);

  // One specific format always pairs the "❓ Transcript" header with a
  // separate title line directly after it (e.g. "Beechen Festival",
  // "Walking holiday") — a heading, not spoken content, so it isn't part of
  // the audio and would otherwise leak in as a fake first "sentence" with
  // no real timing.
  if (rawLines.length && HEADER_LINE.test(rawLines[0])) {
    rawLines = rawLines.slice(2);
  }

  const lines = rawLines
    .filter(l => !PART_LABEL_LINE.test(l) && !SPEAKER_LABEL_LINE.test(l) && !INTERVAL_NOTE_LINE.test(l))
    .map(stripTranscriptHeaderGlue)
    .filter(l => l !== null && l !== '');

  const sentences = [];
  for (const line of lines) {
    const content = stripQuestionAnnotations(stripSpeakerPrefix(line));
    if (!content || PRE_INTERVAL_INSTRUCTION_LINE.test(content)) continue;
    const parts = content.split(SENTENCE_BOUNDARY).map(s => s.trim()).filter(Boolean);
    sentences.push(...parts);
  }
  return mergeTinyFragments(sentences);
}

// ── splitting an already-aligned dictation unit that plays for too long ──
// A single dictation clip much longer than a few seconds is hard to hold in
// working memory while typing (real complaint: a 12s / 37-word clip). This
// takes one aligned unit { text, start, end } (seconds into the audio) and,
// if it runs longer than `triggerSec`, breaks it into consecutive
// sub-clips of at most ~`targetSec` each — cutting at the most natural
// in-sentence boundary near each target point (a comma/semicolon/dash, then
// a coordinating/subordinating conjunction, then — only if neither exists
// in the window — a plain word gap). Sub-clip start/end are interpolated
// across the parent's real [start,end] weighted by characters spoken, which
// is close enough for a play-this-slice player (speakers don't pause evenly,
// but a slightly-early cut beats a 12-second wall). Idempotent: a unit
// already within bounds is returned unchanged, so re-running is a no-op.
// Words that almost always START a new clause, so cutting just before one
// gives a clean break. Deliberately excludes words that are far more often
// prepositions or complementisers in speech ("for", "as", "that", "since",
// "before", "after", "until") — treating those as clause boundaries pulled
// cuts to the wrong place (e.g. "a competition | for the kids").
const CONJUNCTIONS = new Set([
  'and', 'but', 'so', 'or', 'yet', 'because', 'which', 'who', 'whom', 'whose',
  'when', 'while', 'where', 'if', 'unless', 'though', 'although', 'whereas',
  'however',
]);
const MIN_PIECE_WORDS = 3;
// A dictation clip shorter than this is too brief to hear-and-type as its
// own unit — it gets folded into an adjacent clip instead.
const MIN_CLIP_SEC = 1.2;
// Hysteresis: a split must leave every piece comfortably above MIN_CLIP_SEC,
// not merely at it — otherwise char-proportional rounding can nudge a piece
// just under MIN_CLIP_SEC, the merge step folds it straight back, and the
// split never sticks (so re-running the migration keeps "changing" it).
const SPLIT_MIN_CLIP_SEC = MIN_CLIP_SEC + 0.15;

// score a candidate cut *after* word index i (0-based) — higher is better
function boundaryScore(words, i) {
  const w = words[i] || '';
  const next = words[i + 1] || '';
  if (/[.!?]["')\]]?$/.test(w)) return 5;
  if (/[;:]["')\]]?$/.test(w)) return 4;
  if (/[—–]$/.test(w) || next === '—' || next === '–') return 3.5;
  if (/,["')\]]?$/.test(w)) return 3;
  if (CONJUNCTIONS.has(next.toLowerCase().replace(/[^a-z]/g, ''))) return 2;
  return 0;
}

// one pass: cut `words` into up to `nPieces` spans at the best nearby
// boundary, timings interpolated char-proportionally across [start,end].
function splitOnce(words, start, end, nPieces) {
  const dur = end - start;
  const targetWords = words.length / nPieces;

  // char-weighted cumulative lengths — used to interpolate timings AND to
  // estimate how long a candidate piece would play.
  const cum = [0];
  for (let i = 0; i < words.length; i++) cum.push(cum[i] + words[i].length + 1);
  const totalChars = cum[words.length];
  const estDur = (a, b) => dur * (cum[b] - cum[a]) / totalChars;

  const cuts = [0];
  for (let p = 1; p < nPieces; p++) {
    const prev = cuts[cuts.length - 1];
    const ideal = Math.round(p * targetWords);
    let best = -1, bestScore = -Infinity;
    const lo = Math.max(prev + MIN_PIECE_WORDS - 1, ideal - 5);
    const hi = Math.min(words.length - MIN_PIECE_WORDS - 1, ideal + 5);
    for (let i = lo; i <= hi; i++) {
      // never pick a cut that leaves the piece just closed — or the whole
      // remainder — near the minimum clip length: that stub just gets merged
      // straight back, so the split wouldn't stick.
      if (estDur(prev, i + 1) < SPLIT_MIN_CLIP_SEC || estDur(i + 1, words.length) < SPLIT_MIN_CLIP_SEC) continue;
      const sc = boundaryScore(words, i) - Math.abs(i - ideal) * 0.15;
      if (sc > bestScore) { bestScore = sc; best = i; }
    }
    if (best < 0 || best + 1 <= prev) continue; // no viable cut in this window
    cuts.push(best + 1);
  }
  cuts.push(words.length);

  const out = [];
  for (let k = 0; k < cuts.length - 1; k++) {
    const a = cuts[k], b = cuts[k + 1];
    if (b <= a) continue;
    const s = k === 0 ? start : +(start + dur * (cum[a] / totalChars)).toFixed(2);
    const e = k === cuts.length - 2 ? end : +(start + dur * (cum[b] / totalChars)).toFixed(2);
    out.push({ words: words.slice(a, b), start: s, end: Math.max(e, s + 0.3) });
  }
  return out;
}

function splitLongUnit(unit, opts = {}) {
  const targetSec = opts.targetSec != null ? opts.targetSec : 4;
  const triggerSec = opts.triggerSec != null ? opts.triggerSec : targetSec + 1;
  // Above this, a "sentence" this long is a sign the forced-alignment for it
  // drifted rather than real speech — slicing it by character-proportion
  // would just spread the error over several clips, so leave it whole.
  const maxSplittableSec = opts.maxSplittableSec != null ? opts.maxSplittableSec : Infinity;
  const text = String(unit && unit.text || '').trim();
  const start = Number(unit && unit.start);
  const end = Number(unit && unit.end);
  const dur = end - start;

  const words = text.split(/\s+/).filter(Boolean);
  if (!text || !isFinite(dur) || dur <= triggerSec || dur > maxSplittableSec ||
      words.length < MIN_PIECE_WORDS * 2) {
    return [{ text, start, end }];
  }

  // Char-proportional timing means a first pass can still leave a piece over
  // target (long words soak up more of the clock than their word-count
  // share). Re-split any such piece until every piece is within bounds or
  // can't be divided further — so the result is a fixpoint and re-running
  // the migration is a genuine no-op. A pass that fails to divide a piece
  // (no usable interior boundary) returns it unchanged and ends recursion.
  function recur(w, s, e, depth) {
    const d = e - s;
    if (d <= triggerSec || w.length < MIN_PIECE_WORDS * 2 || depth > 6) {
      return [{ text: w.join(' '), start: s, end: e }];
    }
    const pieces = splitOnce(w, s, e, Math.max(2, Math.ceil(d / targetSec)));
    if (pieces.length <= 1) return [{ text: w.join(' '), start: s, end: e }];
    const res = [];
    for (const p of pieces) res.push(...recur(p.words, p.start, p.end, depth + 1));
    return res;
  }
  const out = recur(words, start, end, 0);

  // Char-proportional timing can hand a stub clause a sub-second slice that's
  // useless to hear and type — fold any piece shorter than MIN_CLIP_SEC into
  // its neighbour (previous by default; the next one if it's the first).
  // Safe to do unconditionally here: every piece came from one parent unit so
  // they're all contiguous in the audio.
  for (let i = 0; i < out.length && out.length > 1; ) {
    if (out[i].end - out[i].start >= MIN_CLIP_SEC) { i++; continue; }
    if (i === 0) {
      out[1].text = out[0].text + ' ' + out[1].text;
      out[1].start = out[0].start;
      out.splice(0, 1);
    } else {
      out[i - 1].text += ' ' + out[i].text;
      out[i - 1].end = out[i].end;
      out.splice(i, 1);
    }
  }
  return out;
}

function splitLongUnits(units, opts) {
  const out = [];
  for (const u of units || []) out.push(...splitLongUnit(u, opts));
  return out;
}

// Fold any dictation clip shorter than `minClipSec` into an adjacent clip —
// but ONLY when the two are actually contiguous in the audio (the next clip
// starts about where this one ends). A short clip sitting across a timing
// gap from its neighbours — e.g. a spelled-out name the aligner stretched,
// with dropped sentences on either side — is left alone rather than glued to
// a neighbour with seconds of unrelated audio in between. Merges toward
// whichever neighbour is contiguous (previous first), so re-running is a
// no-op once every clip is either long enough or isolated.
function mergeShortUnits(units, minClipSec = MIN_CLIP_SEC) {
  const GAP_TOL = 0.6; // seconds; two clips this close count as contiguous
  const out = (units || []).map(u => ({
    text: String(u.text || ''), start: Number(u.start), end: Number(u.end),
  }));
  for (let i = 0; i < out.length && out.length > 1; ) {
    const cur = out[i];
    if (!(cur.end - cur.start < minClipSec)) { i++; continue; }
    const prev = out[i - 1];
    const next = out[i + 1];
    const prevContig = prev && Math.abs(cur.start - prev.end) <= GAP_TOL;
    const nextContig = next && Math.abs(next.start - cur.end) <= GAP_TOL;
    if (prevContig) {
      prev.text = (prev.text + ' ' + cur.text).trim();
      prev.end = cur.end;
      out.splice(i, 1); // re-check prev (now longer, but was already ok) — fine to move on
    } else if (nextContig) {
      next.text = (cur.text + ' ' + next.text).trim();
      next.start = cur.start;
      out.splice(i, 1); // stay at i to re-check the merged next clip
    } else {
      i++; // isolated short clip — nothing safe to merge into
    }
  }
  return out;
}

// Full normalise for a section's dictationSentences: split anything over
// ~maxSec, then fold away sub-second stubs, repeated to a fixpoint (each is
// individually convergent; together they can ping-pong once at the boundary,
// so a couple of passes settles it). Used by the one-off migration and by
// the bulk-alignment pipeline so new and existing content obey the same
// "no clip longer than ~maxSec, none shorter than MIN_CLIP_SEC" rule.
function normalizeDictationUnits(units, opts = {}) {
  const maxSec = opts.maxSec != null ? opts.maxSec : 4;
  const splitOpts = {
    targetSec: maxSec, triggerSec: maxSec,
    maxSplittableSec: opts.maxSplittableSec != null ? opts.maxSplittableSec : 25,
  };
  let cur = (units || []).map(u => ({ text: String(u.text || ''), start: Number(u.start), end: Number(u.end) }));
  for (let pass = 0; pass < 4; pass++) {
    const next = mergeShortUnits(splitLongUnits(cur, splitOpts), MIN_CLIP_SEC);
    if (next.length === cur.length && next.every((u, i) =>
      u.text === cur[i].text && u.start === cur[i].start && u.end === cur[i].end)) {
      return next;
    }
    cur = next;
  }
  return cur;
}

module.exports = {
  splitTranscriptIntoSentences, mergeTinyFragments, MIN_UNIT_WORDS,
  stripQuestionAnnotations, splitLongUnit, splitLongUnits,
  mergeShortUnits, normalizeDictationUnits, MIN_CLIP_SEC,
};
