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

// Splits into sentences on '.', '!', '?' followed by whitespace + a capital
// letter (or end of string) — avoids splitting mid-abbreviation in the
// common case (e.g. "Mr. Smith") since a capital immediately after "Mr."
// looks identical to a real sentence boundary either way for our purposes:
// worst case a name gets its own zero-content "sentence", which the
// alignment step tolerates (see listeningAlignmentService's null-fallback).
const SENTENCE_BOUNDARY = /(?<=[.!?])\s+(?=[A-Z0-9"'])/;

function stripSpeakerPrefix(line) {
  // Inline speaker label at the start of a paragraph block, e.g.
  // "WOMAN   I've been meaning..." or "Interviewer: So tell me about...".
  const m = line.match(/^([A-Z][A-Za-z]{0,20}|[A-Z][A-Z\s]{0,20})[:\s]{2,}(.*)$/);
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
    .filter(l => !PART_LABEL_LINE.test(l) && !SPEAKER_LABEL_LINE.test(l))
    .map(stripTranscriptHeaderGlue)
    .filter(l => l !== null && l !== '');

  const sentences = [];
  for (const line of lines) {
    const content = stripSpeakerPrefix(line);
    if (!content) continue;
    const parts = content.split(SENTENCE_BOUNDARY).map(s => s.trim()).filter(Boolean);
    sentences.push(...parts);
  }
  return sentences;
}

module.exports = { splitTranscriptIntoSentences };
