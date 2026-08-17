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

module.exports = { splitTranscriptIntoSentences, mergeTinyFragments, MIN_UNIT_WORDS, stripQuestionAnnotations };
