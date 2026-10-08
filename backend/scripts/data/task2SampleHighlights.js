'use strict';

// Shared helpers for the colour-coded sentence roles on Task 2 model essays
// ("Bài mẫu từ Daniel"). A sample section stores its highlights as
//   highlights: [{ role, text }]
// where `text` is an exact sentence of `content`; the frontend wraps each
// match in a coloured span (unmatched texts are skipped, so an admin edit
// of `content` can never break the page — it just drops that highlight).

// Roles, in reading order. Task 2: introduction (hook, thesis), body
// (topic, idea1, support1, idea2, support2), conclusion (restate, final).
// Task 1 (task1DanielSamples.js): introduction (paraphrase), overview,
// body (topic, detail, compare). Keep in sync with ROLES in
// frontend/js/shared/task2-highlight.js and the enums in
// models/WritingTask2.js / models/WritingTask1.js.
const TASK2_ROLES = ['hook', 'thesis', 'topic', 'idea1', 'support1', 'idea2', 'support2', 'restate', 'final'];
const TASK1_ROLES = ['paraphrase', 'overview', 'topic', 'detail', 'compare'];
const ROLES = ['hook', 'thesis', 'paraphrase', 'overview', 'topic', 'idea1', 'support1', 'idea2', 'support2', 'detail', 'compare', 'restate', 'final'];

// Abbreviations that end in "." but don't end a sentence.
const ABBR = /\b(?:e\.g|i\.e|etc|vs|Dr|Mr|Mrs|Ms|St|U\.S|U\.K|approx|No)\.$/i;

function splitSentences(text) {
  const src = String(text || '').replace(/\s+/g, ' ').trim();
  if (!src) return [];
  const out = [];
  let buf = '';
  const parts = src.split(/(?<=[.!?]["”’)]?)\s+(?=["“‘(]?[A-Z0-9])/);
  for (const p of parts) {
    buf = buf ? buf + ' ' + p : p;
    if (ABBR.test(buf)) continue;
    out.push(buf);
    buf = '';
  }
  if (buf) out.push(buf);
  return out;
}

// "T0 I1 S2-3 J4 U5" (body), "H0-1 P2" (intro) or "R0-1 F2" (conclusion)
// → [{role, idx}]
const CODE = {
  // Task 2
  H: 'hook', P: 'thesis',
  T: 'topic', I: 'idea1', S: 'support1', J: 'idea2', U: 'support2',
  R: 'restate', F: 'final',
  // Task 1 (T = topic is shared)
  Q: 'paraphrase', O: 'overview', D: 'detail', C: 'compare',
};
function parseSpec(spec) {
  const res = [];
  for (const tok of String(spec || '').trim().split(/\s+/).filter(Boolean)) {
    const m = /^([HPTISJURFQODC])(\d+)(?:-(\d+))?$/.exec(tok);
    if (!m) throw new Error(`bad spec token "${tok}" in "${spec}"`);
    const from = +m[2], to = m[3] ? +m[3] : from;
    for (let i = from; i <= to; i++) res.push({ role: CODE[m[1]], idx: i });
  }
  return res;
}

// Build a section's highlights from a sentence-index spec.
function highlightsFromSpec(content, spec) {
  const sents = splitSentences(content);
  return parseSpec(spec).map(({ role, idx }) => {
    if (!sents[idx]) throw new Error(`sentence ${idx} out of range (${sents.length}) for spec "${spec}"`);
    return { role, text: sents[idx] };
  });
}

// Authoring format for hand-written essays (task2DanielSamples.js): a
// paragraph is an array of [code, sentence] pairs, code one of the CODE
// letters or '' for untagged → { content, highlights }.
function buildParagraph(pairs) {
  const content = pairs.map(p => p[1].trim()).join(' ');
  const highlights = pairs.filter(p => p[0]).map(([code, text]) => {
    if (!CODE[code]) throw new Error(`unknown role code "${code}"`);
    return { role: CODE[code], text: text.trim() };
  });
  return { content, highlights };
}

module.exports = { ROLES, TASK1_ROLES, TASK2_ROLES, splitSentences, parseSpec, highlightsFromSpec, buildParagraph };
