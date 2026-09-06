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
// A dictation clip should be a WHOLE, self-contained sentence. Only when one
// runs much longer than `softMaxSec` is it broken up — and then ONLY at a
// strong internal boundary (a semicolon / colon / dash, an internal
// sentence break, or a comma immediately before a word that clearly starts a
// new clause) so that every resulting piece is still a complete, meaningful
// chunk — never a fragment cut off mid-thought ("...a research study I did
// over |"). If a long sentence has no such boundary it is left whole: a long
// complete sentence beats a truncated one. Sub-clip start/end are
// interpolated across the parent's real [start,end] by characters spoken.
// Idempotent: a clip within bounds, or with nowhere clean to cut, is
// returned unchanged.

// Words that genuinely open a new clause — cutting just before one, right
// after a comma, gives a piece that ends cleanly and a piece that stands on
// its own. Excludes words that are usually prepositions/complementisers in
// speech.
const CLAUSE_OPENERS = new Set([
  'and', 'but', 'so', 'or', 'nor', 'yet', 'plus',
  'because', 'although', 'though', 'while', 'whilst', 'whereas', 'since',
  'unless', 'if', 'as',
  'which', 'who', 'whom', 'whose',
  'however', 'therefore', 'meanwhile', 'then',
  'i', 'we', 'you', 'they', 'he', 'she', 'it',
]);
const MIN_PIECE_WORDS = 4;
const MIN_PIECE_SEC = 1.8;
// Above this a clip is a run-on that must be broken even if it has no
// punctuation boundary — a softer "before a bare coordinator + a new
// subject" cut is then allowed.
const RUNON_SEC = 12;
// A dictation clip shorter than this is too brief to hear-and-type as its
// own unit — it gets folded into an adjacent clip instead.
const MIN_CLIP_SEC = 1.2;
// Words that can only begin a fresh clause (a subject / wh-word), used to
// confirm a bare "and/but/so" really starts a new clause in a run-on.
const CLAUSE_SUBJECTS = new Set([
  'i', 'we', 'you', 'they', 'he', 'she', 'it', 'there', 'this', 'that', 'these', 'those',
  'what', 'which', 'who', 'when', 'where', 'the', 'a', 'an', 'my', 'your', 'his', 'her',
  'our', 'their', 'people', 'everyone', 'someone', 'nobody', 'everything',
]);

// Is a cut *after* word index i a strong, meaning-preserving boundary?
function isStrongBoundary(words, i) {
  const w = words[i] || '';
  const next = (words[i + 1] || '').toLowerCase().replace(/[^a-z']/g, '');
  if (!next) return false;
  if (/[.!?][")'’”\]]*$/.test(w)) return true;               // internal sentence end
  if (/[;:][")'’”\]]*$/.test(w)) return true;                 // semicolon / colon
  // a dash break — em/en dash, or a hyphen used as one ("volunteer- people")
  if (/[—–]$/.test(w) || /\w-$/.test(w) || words[i + 1] === '—' || words[i + 1] === '–' || words[i + 1] === '-') return true;
  if (/,[")'’”\]]*$/.test(w) && CLAUSE_OPENERS.has(next)) return true;
  return false;
}

// A weaker boundary for run-ons only (no punctuation to lean on): cut just
// before a word that clearly opens a fresh clause —
//   • a bare "and/but/so/or" followed by a subject / wh-word, or
//   • a bare subordinator (because / although / while / when / …), or
//   • a bare relative "which / who".
const RUNON_SUBORDINATORS = new Set([
  'because', 'although', 'though', 'while', 'whilst', 'whereas', 'since',
  'unless', 'when', 'whenever', 'wherever',
]);
function isRunonBoundary(words, i) {
  const w = words[i] || '';
  if (/[.,!?;:—–]$/.test(w)) return false;                   // handled as a strong boundary
  const next = (words[i + 1] || '').toLowerCase().replace(/[^a-z']/g, '');
  const after = (words[i + 2] || '').toLowerCase().replace(/[^a-z']/g, '');
  if ((next === 'and' || next === 'but' || next === 'so' || next === 'or') && CLAUSE_SUBJECTS.has(after)) return true;
  if (RUNON_SUBORDINATORS.has(next) && after) return true;
  if ((next === 'which' || next === 'who') && after) return true;
  return false;
}

// Capitalise the first letter of a mid-sentence piece so a split
// continuation ("but it's now cooking instead…") still reads as a sentence.
function capFirst(s) {
  return s.replace(/^([^A-Za-z]*)([a-z])/, (_, pre, c) => pre + c.toUpperCase());
}

function splitLongUnit(unit, opts = {}) {
  // `softMaxSec` (was `targetSec`/`triggerSec`) — only consider splitting a
  // clip longer than this. Kept flexible for callers/tests.
  const softMaxSec = opts.softMaxSec != null ? opts.softMaxSec
    : opts.targetSec != null ? opts.targetSec : 9;
  // Above this, a "sentence" this long means the forced-alignment drifted,
  // not real speech — leave it whole and let the caller flag it.
  const maxSplittableSec = opts.maxSplittableSec != null ? opts.maxSplittableSec : Infinity;
  const text = String(unit && unit.text || '').trim();
  const start = Number(unit && unit.start);
  const end = Number(unit && unit.end);
  const dur = end - start;

  const words = text.split(/\s+/).filter(Boolean);
  if (!text || !isFinite(dur) || dur <= softMaxSec || dur > maxSplittableSec ||
      words.length < MIN_PIECE_WORDS * 2) {
    return [{ text, start, end }];
  }

  const cum = [0];
  for (let i = 0; i < words.length; i++) cum.push(cum[i] + words[i].length + 1);
  const totalChars = cum[words.length];
  const estDur = (a, b) => dur * (cum[b] - cum[a]) / totalChars;
  const at = idx => +(start + dur * (cum[idx] / totalChars)).toFixed(2);

  // one cut, at the strong boundary nearest the time-midpoint that leaves
  // both sides big enough; recurse on any half still too long.
  function recur(a, b, s, e, depth) {
    const d = e - s;
    if (d <= softMaxSec || (b - a) < MIN_PIECE_WORDS * 2 || depth > 6) {
      return [{ text: words.slice(a, b).join(' '), start: s, end: e }];
    }
    const mid = (cum[a] + cum[b]) / 2;
    const pick = test => {
      let best = -1, bestDelta = Infinity;
      for (let i = a + MIN_PIECE_WORDS - 1; i <= b - MIN_PIECE_WORDS - 1; i++) {
        if (!test(words, i)) continue;
        if (estDur(a, i + 1) < MIN_PIECE_SEC || estDur(i + 1, b) < MIN_PIECE_SEC) continue;
        const delta = Math.abs(cum[i + 1] - mid);
        if (delta < bestDelta) { bestDelta = delta; best = i; }
      }
      return best;
    };
    // strong (punctuation) boundary first; for a run-on with none, fall back
    // to a bare-coordinator boundary rather than leave a 16s wall.
    let best = pick(isStrongBoundary);
    if (best < 0 && d > RUNON_SEC) best = pick(isRunonBoundary);
    if (best < 0) return [{ text: words.slice(a, b).join(' '), start: s, end: e }];
    const cutTime = at(best + 1);
    return [
      ...recur(a, best + 1, s, cutTime, depth + 1),
      ...recur(best + 1, b, cutTime, e, depth + 1),
    ];
  }
  const pieces = recur(0, words.length, start, end, 0);
  // every piece after the first is a mid-sentence continuation — capitalise
  // its first letter so it still reads as a sentence on its own.
  for (let i = 1; i < pieces.length; i++) pieces[i].text = capFirst(pieces[i].text);
  return pieces;
}

function splitLongUnits(units, opts) {
  const out = [];
  for (const u of units || []) out.push(...splitLongUnit(u, opts));
  return out;
}

const ENDS_SENTENCE = /[.!?]["'”’)\]]*\s*$/;

// Glue back together clips that an earlier, more aggressive splitter cut out
// of one sentence: whenever a clip does NOT end on sentence-final
// punctuation and the next clip starts right where it ends (contiguous
// audio), they were one sentence — join them. Leaves genuinely separate
// sentences alone. Used once, to undo mid-thought fragments already saved to
// the DB before whole-sentence clips were the rule.
function mergeAdjacentFragments(units, gapTol = 0.6) {
  const out = [];
  for (const u of units || []) {
    const cur = { text: String(u.text || '').trim(), start: Number(u.start), end: Number(u.end) };
    const last = out[out.length - 1];
    if (last && !ENDS_SENTENCE.test(last.text) && Math.abs(cur.start - last.end) <= gapTol) {
      last.text = (last.text + ' ' + cur.text).replace(/\s+/g, ' ').trim();
      last.end = cur.end;
    } else {
      out.push(cur);
    }
  }
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

// Full normalise for a section's dictationSentences: keep whole sentences,
// break only ones running well over ~maxSec and only at a strong internal
// boundary, then fold away any sub-second stub. Repeated to a fixpoint (both
// steps are individually convergent). Used by the one-off migration and by
// the bulk-alignment pipeline so new and existing content follow the same
// "whole meaningful sentences, nothing truncated, nothing tiny" rule.
function normalizeDictationUnits(units, opts = {}) {
  const softMaxSec = opts.maxSec != null ? opts.maxSec : 9;
  const splitOpts = {
    softMaxSec,
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
  mergeShortUnits, mergeAdjacentFragments, normalizeDictationUnits, MIN_CLIP_SEC,
};
