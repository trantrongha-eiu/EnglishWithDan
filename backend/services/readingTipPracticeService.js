'use strict';

// Reading Tips → "Luyện tập" mini-practices, built ONLY from existing
// Passage data (no new collection, no copied passages/questions, no AI).
//
// Why question selection reads the CONTENT instead of trusting `type` /
// `groupType`: those fields were entered by hand in the admin editor and
// are demonstrably inconsistent across the bank — e.g. the
// matching-options/matching-info pair is used for Matching Information,
// Matching Features, Sentence Endings, "Choose TWO letters" MCQs and
// word-list note completion alike, and a few TFNG groups carry the YNNG
// instruction. Every predicate below therefore looks at what a student
// actually sees (question stem, options, answer shape, group template,
// the passage itself), and `type` is at most a weak hint. Items whose
// data contradicts itself (stem says "third paragraph" but the teacher's
// explanation quotes the last one; a typed answer that never occurs in
// the passage) are left out rather than shown half-right.
//
// Answer-key safety: the practice payload never contains correctAnswer or
// explanation. Answers are graded one at a time by checkAnswer() (reusing
// readingService.gradeGroups — the same grading as the real Reading
// practice), and only that response reveals the answer, explanation and
// the located evidence. checkAnswer() re-validates that the question is
// actually part of this tip's pool, so the endpoint can't be used to pull
// the key for arbitrary questions. The one deliberate exception is the
// worked example ("I do"): the first question of a question-type practice
// carries its own answer + explanation, flagged isGuidedExample; the
// second ("We do") only gets hints (keywords, location, evidence
// sentence), never its key.

const Passage = require('../models/Passage');
const ReadingTest = require('../models/ReadingTest');
const ReadingTip = require('../models/ReadingTip');
const { gradeGroups } = require('./readingService');

// lessonKey (ReadingTip.lessonKey) → practice definition. Only tips listed
// here get a practice section.
const QUESTION_TYPE_DEFAULTS = { kind: 'questions', maxQuestions: 7, minQuestions: 3, preferQuestions: 5 };
const PRACTICE_CONFIG = {
  skimming: { kind: 'skimming', maxQuestions: 5, maxPerPassage: 2 },
  scanning: { kind: 'scanning', maxQuestions: 6, minQuestions: 3, preferQuestions: 5 },
  'keyword-to-paraphrase': { kind: 'paraphrase', maxQuestions: 6, maxPerPassage: 2 },
  'skim-scan-workflow': { kind: 'workflow', details: 3 },
  'true-false-not-given': { ...QUESTION_TYPE_DEFAULTS, questionType: 'tfng' },
  'yes-no-not-given': { ...QUESTION_TYPE_DEFAULTS, questionType: 'ynng' },
  'matching-headings': { ...QUESTION_TYPE_DEFAULTS, questionType: 'headings' },
  'matching-information': { ...QUESTION_TYPE_DEFAULTS, questionType: 'matching_info' },
  'matching-features': { ...QUESTION_TYPE_DEFAULTS, questionType: 'matching_features' },
  'sentence-summary-note-completion': { ...QUESTION_TYPE_DEFAULTS, questionType: 'completion' },
  'multiple-choice': { ...QUESTION_TYPE_DEFAULTS, questionType: 'mcq' },
  'short-answer-questions': { ...QUESTION_TYPE_DEFAULTS, questionType: 'short_answer' },
};

const CATEGORY_LABEL = { passage1: 'Passage 1', passage2: 'Passage 2', passage3: 'Passage 3' };

// ── Text helpers ────────────────────────────────────────────────────────

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…',
};

function decodeEntities(s) {
  return String(s || '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    const named = NAMED_ENTITIES[code.toLowerCase()];
    return named === undefined ? m : named;
  });
}

// 1:1 character mapping on already-collapsed text (lowercase + unify
// quote/dash variants), so an index found in the normalized paragraph is
// also the index in the original paragraph text.
function normalizeForMatch(s) {
  return String(s || '')
    .replace(/\s+/g, ' ').trim()
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[–—−]/g, '-');
}

function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Whole-term match (not a substring of a longer word/number).
function containsTerm(haystackNorm, term) {
  const t = normalizeForMatch(term);
  return !!t && new RegExp('(?:^|[^\\p{L}\\p{N}])' + escapeRe(t) + '(?![\\p{L}\\p{N}])', 'u').test(haystackNorm);
}

const ABBREVIATIONS = /(?:\b(?:Mr|Mrs|Ms|Dr|Prof|St|Mt|Jr|Sr|vs|etc|No|Co|Inc|Ltd|approx)|\be\.g|\bi\.e|\b[A-Z])\.$/;

// End index (exclusive) of each sentence in an already-collapsed string.
function sentenceEnds(text) {
  const ends = [];
  const re = /[.!?…]+["”’)\]]*(?=\s+["“‘([]?[A-Z0-9])/g;
  let m;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    if (ABBREVIATIONS.test(text.slice(Math.max(0, end - 8), end))) continue;
    ends.push(end);
  }
  ends.push(text.length);
  return ends;
}

function splitSentences(text) {
  const out = [];
  let start = 0;
  for (const end of sentenceEnds(text)) {
    const s = text.slice(start, end).trim();
    if (s) out.push(s);
    start = end;
  }
  return out;
}

// Admin-authored HTML fragment → plain-text lines (block tags and <br>
// become line breaks; <head>/<title>/<style> dropped entirely).
function htmlToLines(html) {
  return decodeEntities(String(html || '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<(head|title|script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ' ')
    .replace(/<\/?(p|div|li|ul|ol|tr|table|thead|tbody|h[1-6]|body|html|section|article|blockquote)(\s[^>]*)?>/gi, '\n')
    .replace(/<[^>]+>/g, ''))
    .split(/\n+/)
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

// Passage.content comes in several shapes (plain <p>s, a full <!DOCTYPE>
// document, no <p> at all with <br><br> breaks, <h2>/<h3> titles, a bold
// "standfirst" under the title, section letters as "<strong>A</strong><br>"
// or as their own "<p><strong>A.</strong></p>"). Normalize all of them to
// plain-text blocks so "the second paragraph", topic sentences and
// evidence highlighting work the same everywhere. Read-only: the stored
// content is never modified.
function passageToParagraphs(html) {
  let s = String(html || '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<(head|script|style)[\s\S]*?<\/\1>/gi, '');
  // A bold letter opening a block ("<p><strong>A.</strong> Around\u2026",
  // "<p><b>A</b> Most\u2026", "<p><strong>A</strong><br>\u2026") is that paragraph's
  // label \u2014 mark it before the tags are stripped.
  s = s.replace(/(<(?:p|div|h[1-6])(?:\s[^>]*)?>)\s*<(strong|b)(?:\s[^>]*)?>\s*(?:(?:paragraph|section)\s+)?\(?([A-J])[.):]?\s*<\/\2>/gi,
    (m, open, em, letter) => `${open}\uE001${letter.toUpperCase()}\uE001 `);
  // Flag blocks that are entirely bold/italic (a standfirst, or a label
  // like "<p><strong>A.</strong></p>") before the tags are stripped.
  s = s.replace(/<(p|div|h[1-6])(\s[^>]*)?>\s*<(strong|b|em|i)(\s[^>]*)?>((?:(?!<\/\3>)[\s\S])*)<\/\3>\s*<\/\1>/gi,
    (m, tag, a, em, b, inner) => `<${tag}>\uE000${inner}</${tag}>`);
  s = s.replace(/<\/?(p|div|h[1-6]|li|ul|ol|blockquote|section|article|tr|table|body|html)(\s[^>]*)?>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  s = decodeEntities(s).replace(/\r/g, '');

  const blocks = [];
  let pendingLabel = null;
  for (const raw of s.split(/\n[ \t\u00a0]*\n/)) {
    let block = raw.replace(/[ \t\u00a0]+/g, ' ').trim();
    const emphasized = block.includes('\uE000');
    block = block.replace(/\uE000/g, '').trim();
    if (!block) continue;
    let label = null;
    let plainLabel = false;
    const marked = block.match(/^([A-J])\s*([\s\S]*)$/);
    if (marked) {
      if (!marked[2].trim()) { pendingLabel = marked[1]; continue; }
      label = marked[1];
      block = marked[2];
    }
    // Section/paragraph letter on its own ("A", "A.", "Paragraph B") or on
    // its own line above the text — attach it to the paragraph it labels.
    const own = !label && block.match(/^(?:(?:paragraph|section)\s+)?\(?([A-J])[.):]?$/i);
    if (own) { pendingLabel = own[1].toUpperCase(); continue; }
    const lead = !label && block.match(/^(?:(?:paragraph|section)\s+)?\(?([A-J])[.):]?[ \t]*\n\s*([\s\S]+)$/i);
    if (lead) { label = lead[1].toUpperCase(); block = lead[2]; }
    // Plain-text "A. Around…" — only trusted if the letters come out as a
    // clean A, B, C… sequence (checked below), since "A. J. Smith…" exists.
    const inline = !label && !pendingLabel && block.match(/^([A-J])\.\s+(?=\S)([\s\S]+)$/);
    if (inline) { label = inline[1]; block = inline[2]; plainLabel = true; }
    block = block.replace(/\s+/g, ' ').trim();
    if (!block) continue;
    if (!label && pendingLabel) label = pendingLabel;
    pendingLabel = null;
    blocks.push({ text: block, label, emphasized, plainLabel, raw: inline ? inline[0] : null });
  }

  // Plain-text labels must read A, B, C… (at least three, in order);
  // otherwise they were just text ("A. J. Smith…") — put them back.
  if (blocks.some(b => b.plainLabel)) {
    const seq = blocks.filter(b => b.label).map(b => b.label);
    const ordered = seq.length >= 3 && seq.every((l, i) => l.charCodeAt(0) === 65 + i);
    if (!ordered) {
      for (const b of blocks) {
        if (b.plainLabel) { b.text = b.raw.replace(/\s+/g, ' ').trim(); b.label = null; b.plainLabel = false; }
      }
    }
  }

  // A bold/italic block before the first real paragraph is the standfirst
  // (IELTS doesn't count it as paragraph 1) — unless the whole passage is
  // bold, in which case emphasis carries no meaning.
  const mostlyEmphasized = blocks.filter(b => b.emphasized).length > blocks.length / 2;
  let n = 0;
  return blocks.map((b, i) => {
    const words = b.text.split(' ').length;
    const titleLike = !b.label && b.text.length <= 120 && words <= 16 && !/[.!?…"”’)]$/.test(b.text);
    const standfirst = !b.label && b.emphasized && !mostlyEmphasized && n === 0;
    const heading = titleLike || standfirst;
    return {
      i,
      text: b.text,
      label: b.label,
      heading,
      // 1-based position among real paragraphs ("the second paragraph");
      // null for titles/sub-headings/standfirst, which IELTS never counts.
      n: heading ? null : ++n,
      leadEnd: sentenceEnds(b.text)[0],
    };
  });
}

// ── Evidence ────────────────────────────────────────────────────────────

// Explanations are free-form Vietnamese written by teachers, but most quote
// the passage: a "Transcript:/Dẫn chứng:" line, or text in “…”/"…".
function evidenceCandidates(explanation) {
  const ex = String(explanation || '');
  const out = [];
  const labelled = /^[^\p{L}\n]*(?:transcript|dẫn chứng|trích dẫn|evidence|thông tin trong bài)\s*:\s*(.+)$/gimu;
  let m;
  while ((m = labelled.exec(ex))) out.push(m[1]);
  for (const re of [/“([^”]{10,}?)”/g, /"([^"\n]{10,}?)"/g, /«([^»]{10,}?)»/g]) {
    while ((m = re.exec(ex))) out.push(m[1]);
  }
  return out;
}

function wordPrefix(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 0)) || cut;
}
function wordSuffix(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(s.length - max);
  const sp = cut.indexOf(' ');
  return sp >= 0 ? cut.slice(sp + 1) : cut;
}

// Every passage fragment the explanation quotes, longest first →
// [{ paragraphIndex, text }] where text is the exact paragraph substring.
// "[tree species]" is how some teachers mark the answer inside a quote,
// so brackets are unwrapped; "…" / "(Đoạn 4)" split a quote into pieces.
function locateQuotes(explanation, paragraphs) {
  const normParas = paragraphs.map(p => normalizeForMatch(p.text));
  const hits = [];
  for (const cand of evidenceCandidates(explanation)) {
    const frags = cand.replace(/\[([^\]]*)\]/g, '$1')
      .split(/\.{3,}|…|\(\s*(?:paragraph|đoạn|section)[^)]*\)/i);
    for (const frag of frags) {
      const nf = normalizeForMatch(frag).replace(/^["'\s.,;:-]+|["'\s.,;:-]+$/g, '');
      if (nf.length < 12) continue;
      const tries = [nf];
      if (nf.length > 70) tries.push(wordPrefix(nf, 50), wordSuffix(nf, 50));
      for (const t of tries) {
        if (t.length < 12) continue;
        const pi = normParas.findIndex(np => np.includes(t));
        if (pi === -1) continue;
        const start = normParas[pi].indexOf(t);
        if (!hits.some(h => h.pi === pi && h.start <= start && start + t.length <= h.start + h.len)) {
          hits.push({ pi, start, len: t.length });
        }
        break; // the full fragment matched — its prefix/suffix add nothing
      }
    }
  }
  return hits.sort((a, b) => b.len - a.len).map(h => ({
    paragraphIndex: paragraphs[h.pi].i,
    text: paragraphs[h.pi].text.substr(h.start, h.len),
  }));
}

function locateEvidence(explanation, paragraphs) {
  return locateQuotes(explanation, paragraphs)[0] || null;
}

// Full sentence(s) of the paragraph that the located evidence overlaps
// (explanations often quote only part of a sentence).
function evidenceSentences(evidence, paragraphs) {
  const p = paragraphs.find(x => x.i === evidence.paragraphIndex);
  if (!p) return '';
  const start = p.text.indexOf(evidence.text);
  const end = start + evidence.text.length;
  const out = [];
  let from = 0;
  for (const to of sentenceEnds(p.text)) {
    if (to > start && from < end) out.push(p.text.slice(from, to));
    from = to;
  }
  return out.join(' ');
}

// Typed completion answers are copied from the passage, so the sentence
// holding the answer is itself the evidence (used when the explanation
// quotes nothing locatable). Prefers a sentence that also holds a scan
// anchor from the question.
function answerSentence(correctAnswer, paragraphs, anchors) {
  const alts = answerAlternatives(correctAnswer);
  let fallback = null;
  for (const p of paragraphs) {
    for (const sent of splitSentences(p.text)) {
      const ns = normalizeForMatch(sent);
      if (!alts.some(a => containsTerm(ns, a))) continue;
      const hit = { paragraphIndex: p.i, text: sent };
      if (!anchors.length || anchors.some(a => containsTerm(ns, a))) return hit;
      if (!fallback) fallback = hit;
    }
  }
  return fallback;
}

// The paragraphs of a (lean, per-request) passage object, parsed once.
const paragraphCache = new WeakMap();
function paragraphsOf(passage) {
  if (!paragraphCache.has(passage)) paragraphCache.set(passage, passageToParagraphs(passage.content));
  return paragraphCache.get(passage);
}

// The whole sentence(s) of a paragraph around a located evidence fragment,
// as one exact substring of the paragraph (for display + highlighting).
function evidenceSpan(evidence, paragraphs) {
  const p = evidence && paragraphs.find(x => x.i === evidence.paragraphIndex);
  if (!p) return null;
  const at = p.text.indexOf(evidence.text);
  if (at === -1) return { paragraphIndex: p.i, text: evidence.text };
  const endAt = at + evidence.text.length;
  const ends = sentenceEnds(p.text);
  const start = ends.filter(e => e <= at).pop() || 0;
  const end = ends.find(e => e >= endAt) || p.text.length;
  return { paragraphIndex: p.i, text: p.text.slice(start, end).trim() };
}

// ── Keywords (for guided steps) ─────────────────────────────────────────

const STOPWORDS = new Set(('a an the and or but if of to in on at by for with from as is are was were be been being this that these '
  + 'those it its their there they them he she his her we our you your not no nor so than then too very can could may might must '
  + 'should would will shall do does did done have has had having about above after again against all am any because before below '
  + 'between both during each few further here how into more most other out over own same some such only which who whom why what '
  + 'when where while up down off once under until also just every many much one two three first second new way ways thing things '
  + 'according following statement writer passage paragraph section '
  // question-frame words ("What point does the writer make…", "a reference to…")
  + 'point make makes say says suggest suggests mention mentions describe describes reviewer author writers text '
  + 'information reference example examples description explanation').split(' '));

function contentWords(text) {
  return (String(text || '').toLowerCase().match(/[\p{L}][\p{L}'’-]*/gu) || [])
    .filter(w => w.length >= 3 && !STOPWORDS.has(w));
}

// Crude stem so "affected"/"affects", "species"/"specie" meet.
function wordStem(w) {
  return w.replace(/['’]s$/, '').replace(/(?:ing|ed|es|s|ly)$/, '');
}

// Keywords a student should pick out of a question: its names / numbers /
// quoted terms, then its content words that the evidence sentence repeats.
function stemKeywords(stem, evidenceText, ctx) {
  const clean = String(stem || '').replace(/_____|…/g, ' ');
  const picked = extractAnchors(clean, ctx.passageText, ctx.passageNorm);
  const evidenceStems = new Set(contentWords(evidenceText).map(wordStem));
  for (const w of contentWords(clean)) {
    if (picked.length >= 5) break;
    if (evidenceStems.has(wordStem(w)) && !picked.some(p => p.toLowerCase().includes(w))) picked.push(w);
  }
  if (!picked.length) {
    [...new Set(contentWords(clean))].sort((a, b) => b.length - a.length).slice(0, 3).forEach(w => picked.push(w));
  }
  return picked;
}

// The sentence of paragraph `p` sharing the most keywords.
function bestSentence(p, keywords) {
  const stems = keywords.flatMap(k => contentWords(k)).map(wordStem);
  let best = null;
  let from = 0;
  for (const to of sentenceEnds(p.text)) {
    const text = p.text.slice(from, to).trim();
    const score = contentWords(text).filter(w => stems.includes(wordStem(w))).length;
    if (text && (!best || score > best.score)) best = { score, text };
    from = to;
  }
  return best ? { paragraphIndex: p.i, text: best.text } : null;
}

// ── Question helpers ────────────────────────────────────────────────────

function nonEmptyGroups(passage) {
  const groups = (passage.questionGroups || []).filter(g => (g.questions || []).length);
  if (groups.length) return groups;
  // Legacy passages with only the flat questions[] array — same fallback
  // readingService's grading uses.
  return (passage.questions || []).length ? [{ groupType: 'plain', instruction: '', questions: passage.questions }] : [];
}

function stripOwnNumber(text, qNum) {
  return String(text || '').replace(new RegExp('^\\s*(?:Q(?:uestion)?\\s*)?' + qNum + '\\s*[.):]?\\s+(?=\\S)', 'i'), '').trim();
}

function isPlaceholderText(text) {
  const t = String(text || '').trim();
  return !t || /^(?:q(?:uestion)?\s*)?\d+\s*[.):]?$/i.test(t) || /^__Q\d+__$/.test(t);
}

function wordsOutsideBlanks(s) {
  return String(s || '').replace(/__Q\d+__|_{3,}|…/g, ' ').trim().split(/\s+/).filter(Boolean).length;
}

// The line (or, for a long line, the sentence) holding this blank.
function unitWithMarker(html, marker) {
  const line = htmlToLines(html).find(l => l.includes(marker));
  if (!line) return null;
  const unit = line.length > 160 ? (splitSentences(line).find(x => x.includes(marker)) || line) : line;
  return unit.replace(/^[●•▪◦·*–-]\s*/, '').trim();
}

// Same `__Qn__` template convention reading-v2.js's findTemplateContext()
// renders from; narrowed to the one line / sentence / table row holding
// this question's blank so the stem reads as a self-contained prompt.
function templateStem(group, qNum) {
  const marker = `__Q${qNum}__`;
  const rows = group.tableConfig && group.tableConfig.rows;
  if (Array.isArray(rows)) {
    const headers = (group.tableConfig.headers || []).map(h => htmlToLines(h).join(' '));
    for (const row of rows) {
      if (!Array.isArray(row)) continue;
      const j = row.findIndex(c => String(c || '').includes(marker));
      if (j === -1) continue;
      const unit = unitWithMarker(row[j], marker);
      if (!unit) return null;
      if (wordsOutsideBlanks(unit) >= 4) {
        const lead = j > 0 ? htmlToLines(row[0]).join(' ') : '';
        return (lead && lead.length <= 40 && !lead.includes('__Q') ? `${lead} — ` : '') + unit;
      }
      const ctx = row.map((c, k) => {
        if (k === j) return null;
        const t = htmlToLines(c).join(' ');
        return t && t.length <= 90 ? (headers[k] ? `${headers[k]}: ${t}` : t) : null;
      }).filter(Boolean);
      return [(headers[j] ? `${headers[j]}: ` : '') + unit, ...ctx].join(' — ');
    }
  }
  let found = null;
  (function walk(val) {
    if (found) return;
    if (typeof val === 'string') { if (val.includes(marker)) found = val; return; }
    if (Array.isArray(val)) { val.forEach(walk); return; }
    if (val && typeof val === 'object') Object.values(val).forEach(walk);
  })([group.noteConfig, group.bulletConfig, group.summaryConfig && group.summaryConfig.text, group.dragDropConfig]);
  return found ? unitWithMarker(found, marker) : null;
}

function cleanStem(stem, qNum) {
  return stripOwnNumber(stem, qNum)
    .replace(/^[●•▪◦·*]\s*/, '')
    .replace(new RegExp(`\\b${qNum}\\s*(?=__Q${qNum}__)`, 'g'), '') // "called 13__Q13__"
    .replace(new RegExp(`__Q${qNum}__`, 'g'), '_____')
    .replace(/__Q\d+__/g, '…')
    .replace(/_{3,}/g, '_____')
    .replace(/(\S)_____/g, '$1 _____')
    .replace(/_____(?=[\p{L}\p{N}])/gu, '_____ ')
    .replace(/\s+/g, ' ')
    .trim();
}

function questionStem(group, q) {
  if (!isPlaceholderText(q.questionText)) return cleanStem(q.questionText, q.questionNumber);
  const t = templateStem(group, q.questionNumber);
  return t ? cleanStem(t, q.questionNumber) : '';
}

const WORD_LIMIT_RE = /(NO MORE THAN (?:ONE|TWO|THREE|FOUR) WORDS?(?:\s*(?:AND\/OR|OR|AND)\s*A NUMBER)?|(?:ONE|TWO|THREE) WORDS?(?: ONLY)?(?:\s*(?:AND\/OR|OR)\s*A NUMBER)?|ONE WORD(?: ONLY)?|A NUMBER)/i;

function wordLimit(group) {
  const m = String(group.instruction || '').replace(/\s+/g, ' ').replace(/ONL Y/g, 'ONLY').match(WORD_LIMIT_RE);
  return m ? m[1].toUpperCase() : null;
}

// Letter / numeral / TFNG answers mean the student picks, not types.
function isChoiceAnswer(ans) {
  const a = String(ans || '').trim();
  return /^[A-Za-z]$/.test(a) || /^[ivx]{1,5}$/i.test(a) || /^\[.*\]$/.test(a)
    || /^(true|false|yes|no|not given)$/i.test(a);
}

function answerAlternatives(ans) {
  return String(ans || '').split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
}

// An IELTS completion answer is copied word-for-word from the passage; an
// answer that appears nowhere in it is a data-entry slip, not a question
// worth practising on. Multi-part answers ("1976 and 1995") pass if every
// part is there.
function answerInPassage(ans, passageNorm) {
  return answerAlternatives(ans).some(alt => containsTerm(passageNorm, alt)
    || alt.split(/\s*(?:,|\band\b|&)\s*/).filter(Boolean).every(part => containsTerm(passageNorm, part)));
}

// ── Skimming ────────────────────────────────────────────────────────────

// Real exam MCQs that test global understanding — the skill Skimming
// trains (paragraph purpose / main idea / overall title).
const SKIM_STEM_RE = new RegExp([
  'main (?:idea|point|purpose|aim|argument)',
  '(?:best|most suitable|suitable) (?:title|subtitle|heading|subheading)',
  '(?:purpose|aim) of (?:the|this) (?:\\w+ )?(?:paragraph|section|passage|article|text)',
  "(?:writer|author|reviewer)(?:'|’)?s? (?:main )?(?:purpose|aim)",
  'is the (?:writer|author|reviewer) doing',
  'are the (?:writers|authors) doing',
  'best summari[sz]es',
  '(?:paragraph|section) tells us about',
  'introduces the topic',
  'mainly (?:about|concerned)',
].join('|'), 'i');

const WHOLE_TEXT_RE = /(?:title|subtitle|heading|subheading)\b[^?]*\b(?:passage|article|text)|(?:best|most suitable|suitable) (?:title|subtitle|subheading)|for this (?:passage|article|text)/i;

const ORDINALS = { first: 1, opening: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10 };

function skimFocus(stem, scope) {
  if (scope === 'passage') return 'overall_topic';
  if (/doing|purpose|aim|introduces|in order to/i.test(stem)) return 'paragraph_purpose';
  return 'main_idea';
}

// The paragraph the stem itself points at ("second paragraph",
// "Section C", "the paragraph beginning 'To be fair…'").
function stemParagraphRef(stem, paragraphs) {
  const real = paragraphs.filter(p => !p.heading);
  const ord = stem.match(/\b(first|opening|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|last|final)\s+(?:paragraph|section)\b/i);
  if (ord) {
    const key = ord[1].toLowerCase();
    const p = (key === 'last' || key === 'final') ? real[real.length - 1] : real[ORDINALS[key] - 1];
    return p ? p.i : -1;
  }
  const lab = stem.match(/\b(?:paragraph|section)\s+([A-J])\b/);
  if (lab) {
    const p = paragraphs.find(x => x.label === lab[1]);
    return p ? p.i : -1;
  }
  const beg = stem.match(/beginning\s+['‘"“]([^'’"”]+?)\.*\s*['’"”]/i);
  if (beg) {
    const needle = normalizeForMatch(beg[1]).replace(/[.…\s]+$/, '');
    const p = paragraphs.find(x => normalizeForMatch(x.text).startsWith(needle));
    return p ? p.i : -1;
  }
  return null; // the stem names no paragraph
}

// Which paragraph to show. Whole-text questions (title/subtitle) get the
// whole passage in skim view. Otherwise the stem's own reference and the
// paragraph the existing explanation quotes must agree; if the data
// contradicts itself the item is dropped (null).
function skimTarget(stem, explanation, paragraphs) {
  if (WHOLE_TEXT_RE.test(stem)) return { scope: 'passage' };
  const ref = stemParagraphRef(stem, paragraphs);
  if (ref === -1) return null;
  const ev = locateEvidence(explanation, paragraphs);
  if (ref !== null && ev && ev.paragraphIndex !== ref) return null;
  const index = ref !== null ? ref : (ev ? ev.paragraphIndex : null);
  return index === null ? null : { scope: 'paragraph', index };
}

function isSkimQuestion(group, q) {
  const opts = (q.options || []).filter(o => String(o || '').trim());
  if (opts.length < 3) return false;
  if (!/^[A-Fa-f]$/.test(String(q.correctAnswer || '').trim())) return false;
  if (q.type === 'multi-answer-group' || /choose\s+(?:two|three)\s+letters/i.test(group.instruction || '')) return false;
  return SKIM_STEM_RE.test(String(q.questionText || ''));
}

function skimItemsForPassage(passage) {
  const paragraphs = paragraphsOf(passage);
  if (!paragraphs.some(p => !p.heading)) return [];
  const items = [];
  for (const group of nonEmptyGroups(passage)) {
    for (const q of group.questions) {
      if (!isSkimQuestion(group, q)) continue;
      const stem = stripOwnNumber(q.questionText, q.questionNumber);
      const target = skimTarget(stem, q.explanation, paragraphs);
      if (!target) continue;
      items.push({ passage, paragraphs, group, q, stem, target });
    }
  }
  return items;
}

// ── Scanning ────────────────────────────────────────────────────────────

const ANCHOR_STOPWORDS = new Set(['I', 'A', 'An', 'The', 'In', 'On', 'At', 'It', 'Its', 'This', 'That', 'These', 'Those',
  'What', 'Which', 'Who', 'Whom', 'Whose', 'When', 'Where', 'Why', 'How', 'According', 'As', 'By', 'For', 'From', 'If',
  'One', 'Some', 'Most', 'Many', 'Apart', 'After', 'Before', 'During', 'Although', 'While', 'To', 'Of', 'He', 'She',
  'They', 'We', 'Her', 'His', 'Their', 'Our', 'There', 'Here', 'But', 'And', 'Or', 'However', 'Also']);

const PROPER_RE = /[\p{Lu}][\p{L}\p{M}'’-]*(?:\s+(?:of|the|de|van|der|la|von|and|&)?\s*[\p{Lu}][\p{L}\p{M}'’-]*)*/gu;

// Scan targets a student would look for: numbers/years, names (not just a
// word capitalised because it opens the line) and quoted terms — kept
// only if they occur in the passage as whole terms.
function extractAnchors(stem, passageText, passageNorm) {
  const found = [];
  const push = (t) => {
    const s = String(t || '').replace(/^[\s,.;:'"“‘]+|[\s,.;:'"”’]+$/g, '').replace(/['’]s$/, '');
    if (s.length < 2) return;
    if (!containsTerm(passageNorm, s)) return;
    if (!found.some(f => f.toLowerCase() === s.toLowerCase())) found.push(s);
  };
  let m;
  const num = /\b\d{1,4}(?:[.,]\d+)*(?:s|st|nd|rd|th)?\b(?:\s?(?:%|per cent|percent))?/g;
  while ((m = num.exec(stem))) push(m[0]);
  const quoted = /['‘“"]([^'’”"]{3,40})['’”"]/g;
  while ((m = quoted.exec(stem))) push(m[1]);
  PROPER_RE.lastIndex = 0;
  while ((m = PROPER_RE.exec(stem))) {
    if (m.index > 0 && /[\p{L}\p{M}]/u.test(stem[m.index - 1])) continue; // mid-word
    const words = m[0].split(/\s+/);
    while (words.length && ANCHOR_STOPWORDS.has(words[0])) words.shift();
    const phrase = words.join(' ').replace(/\s+(?:of|the|de|van|der|la|von|and|&)$/, '');
    if (!phrase || !/^[\p{Lu}]/u.test(phrase)) continue;
    const atStart = !/[\p{L}\p{N},;]\s*$/u.test(stem.slice(0, m.index));
    if (atStart && words.length === 1 && m[0] === phrase
      && !new RegExp('[\\p{Ll},;]\\s+' + escapeRe(phrase) + '(?![\\p{L}])', 'u').test(passageText)) {
      // Only capitalised because it opens the line — keep it only if the
      // passage itself uses it as a name mid-sentence.
      continue;
    }
    push(phrase);
  }
  return found.slice(0, 4);
}

// Evidence for a typed (copied-from-the-passage) answer, or null when the
// data contradicts itself. The sentence the teacher's explanation quotes
// must contain the answer (the bank had answer keys copied from the
// neighbouring question — explanation right, answer wrong), and the
// evidence must sit next to what the question tells you to look for.
// Without a locatable quote, the passage sentence holding the answer is
// the evidence.
function typedEvidence(q, paragraphs, anchors) {
  const quotes = locateQuotes(q.explanation, paragraphs);
  const quoted = quotes.find(qt => answerInPassage(q.correctAnswer, normalizeForMatch(evidenceSentences(qt, paragraphs))));
  if (quotes.length && !quoted) return null;
  const evidence = quoted || answerSentence(q.correctAnswer, paragraphs, anchors);
  if (!evidence) return null;
  if (anchors.length) {
    const near = normalizeForMatch(paragraphs.filter(p => Math.abs(p.i - evidence.paragraphIndex) <= 1).map(p => p.text).join(' '));
    if (!anchors.some(a => containsTerm(near, a))) return null;
  }
  return evidence;
}

function scanItemsForPassage(passage) {
  const paragraphs = paragraphsOf(passage);
  if (!paragraphs.some(p => !p.heading)) return { paragraphs, items: [] };
  const passageText = paragraphs.map(p => p.text).join(' ');
  const passageNorm = normalizeForMatch(passageText);
  const items = [];
  for (const group of nonEmptyGroups(passage)) {
    // Picking from a list (headings, matching letters, word banks) isn't
    // scanning for a detail you then copy — only typed answers qualify.
    if (['matching-headings', 'matching-options', 'sentence-endings'].includes(group.groupType)) continue;
    if (group.summaryConfig && (group.summaryConfig.wordBank || []).length) continue;
    if (/list of (?:words|phrases|headings|people)|correct letter|correct ending/i.test(group.instruction || '')) continue;
    for (const q of group.questions) {
      if ((q.options || []).some(o => String(o || '').trim()) || (q.wordBank || []).length) continue;
      if (isChoiceAnswer(q.correctAnswer)) continue;
      if (!answerInPassage(q.correctAnswer, passageNorm)) continue;
      const stem = questionStem(group, q);
      if (!stem || (!stem.includes('_____') && !/\?\s*$/.test(stem))) continue;
      if (wordsOutsideBlanks(stem) < 4 || stem.length > 260) continue;
      const anchors = extractAnchors(stem.replace(/_____|…/g, ' '), passageText, passageNorm);
      if (!anchors.length && !/\d/.test(String(q.correctAnswer || ''))) continue;
      const evidence = typedEvidence(q, paragraphs, anchors);
      if (!evidence) continue;
      items.push({ group, q, stem, anchors, evidence, wordLimit: wordLimit(group) });
    }
  }
  items.sort((a, b) => a.q.questionNumber - b.q.questionNumber);
  return { paragraphs, items };
}

// ── Question-type practices (the 8 "Chiến thuật theo dạng bài" tips) ───

const TFNG_KEYS = ['TRUE', 'FALSE', 'NOT GIVEN'];
const YNNG_KEYS = ['YES', 'NO', 'NOT GIVEN'];

function groupText(group) {
  return `${group.groupTitle || ''} ${group.instruction || ''}`.replace(/\s+/g, ' ');
}

// What a student actually faces in this group, judged from its content
// (instruction wording, options, answer shape) — `type` only has to agree
// with the answer family for TFNG/YNNG. null = not one of the practised
// types (sentence endings, "Choose TWO letters", word-list completion, a
// classification whose category list isn't stored, …) or inconsistent.
function classifyGroup(group) {
  const qs = group.questions || [];
  if (!qs.length || group.interchangeableAnswers) return null;
  const text = groupText(group);
  const keys = qs.map(q => String(q.correctAnswer || '').trim().toUpperCase());

  const allNG = keys.every(k => k === 'NOT GIVEN');
  const allType = (t) => qs.every(q => q.type === t);
  if (keys.every(k => TFNG_KEYS.includes(k)) && (!allNG || allType('true-false-ng'))) return allType('true-false-ng') ? 'tfng' : null;
  if (keys.every(k => YNNG_KEYS.includes(k))) return allType('yes-no-ng') ? 'ynng' : null;

  const headings = (group.headingsConfig && group.headingsConfig.headings) || [];
  if (headings.length >= 3 && keys.every(k => /^[IVX]+$/.test(k))) return 'headings';

  if (/choose\s+(?:two|three|four)\b|which\s+(?:two|three|four)\b/i.test(text) || qs.some(q => q.type === 'multi-answer-group')) return null;
  if (group.groupType === 'sentence-endings' || /correct ending/i.test(text)) return null;
  if ((group.summaryConfig && (group.summaryConfig.wordBank || []).length) || /list of (?:words|phrases)|using the list/i.test(text)) return null;

  if (keys.every(k => /^[A-H]$/.test(k)) && qs.every(q => (q.options || []).filter(o => String(o || '').trim()).length >= 3)) return 'mcq';

  if (keys.every(k => /^[A-J]$/.test(k))) {
    const named = (group.matchingOptions || []).map(o => String(o || '').trim()).filter(o => o.length > 1);
    if (/which\s+(?:paragraph|section)|contains the following information/i.test(text)) return named.length ? null : 'matching_info';
    if (named.length >= 2) return 'matching_features';
    // "Classify…/Match each… with the list below" but no list stored.
    if (/classify|match each|list of|look at the following/i.test(text)) return null;
    return 'matching_info'; // letters with no list = paragraph letters
  }

  if (keys.every(k => k && !isChoiceAnswer(k))) return 'typed';
  return null;
}

const CHOICE_SETS = { tfng: TFNG_KEYS, ynng: YNNG_KEYS };

// One practice question of `qType` from question `q`, or null when its data
// doesn't hold together (key outside its own option list, headings question
// naming a paragraph the passage doesn't label, explanation quoting another
// paragraph than the key, typed answer not in the passage, …).
function typeItem(qType, group, q, ctx) {
  const key = String(q.correctAnswer || '').trim();
  const text = isPlaceholderText(q.questionText) ? '' : stripOwnNumber(q.questionText, q.questionNumber);
  const letterIdx = key.toUpperCase().charCodeAt(0) - 65;
  switch (qType) {
    case 'tfng':
    case 'ynng':
      return text ? { text, input: 'choice', choices: CHOICE_SETS[qType].map(k => ({ key: k, label: '' })) } : null;
    case 'mcq': {
      const options = (q.options || []).map(o => String(o || '').trim());
      if (!text || options.some(o => !o) || letterIdx < 0 || letterIdx >= options.length) return null;
      return { text, input: 'choice', choices: options.map((o, i) => ({ key: String.fromCharCode(65 + i), label: o })) };
    }
    case 'matching_features': {
      const options = (group.matchingOptions || []).map(o => String(o || '').trim());
      if (!text || options.some(o => !o) || letterIdx < 0 || letterIdx >= options.length) return null;
      return {
        text, input: 'choice', listTitle: String(group.matchingOptionsTitle || '').trim(),
        choices: options.map((o, i) => ({ key: String.fromCharCode(65 + i), label: o })),
      };
    }
    case 'matching_info': {
      const letter = key.toUpperCase();
      if (!text || ctx.labels.length < 3 || !ctx.labels.includes(letter)) return null;
      const quote = locateEvidence(q.explanation, ctx.paragraphs);
      const quotedPara = quote && ctx.paragraphs.find(p => p.i === quote.paragraphIndex);
      if (quotedPara && quotedPara.label && quotedPara.label !== letter) return null;
      const keyPara = ctx.paragraphs.find(p => p.label === letter);
      return {
        text, input: 'choice', choices: ctx.labels.map(l => ({ key: l, label: '' })),
        evidence: quote || { paragraphIndex: keyPara.i, text: keyPara.text },
      };
    }
    case 'headings': {
      const headings = ((group.headingsConfig && group.headingsConfig.headings) || [])
        .map(h => ({ key: String(h.numeral || '').trim().toLowerCase(), label: String(h.text || '').trim() }))
        .filter(h => h.key && h.label);
      const m = text.match(/\b(?:paragraph|section)\s+([A-J])\b/i);
      const target = m && ctx.paragraphs.find(p => p.label === m[1].toUpperCase());
      if (!target || !headings.some(h => h.key === key.toLowerCase())) return null;
      return { text, input: 'choice', listTitle: 'List of Headings', choices: headings, targetParagraph: target.i };
    }
    case 'completion':
    case 'short_answer': {
      const stem = questionStem(group, q);
      if (!stem) return null;
      const isQuestion = /\?\s*$/.test(stem);
      if (qType === 'short_answer' ? !isQuestion : (isQuestion || !stem.includes('_____'))) return null;
      if (wordsOutsideBlanks(stem) < 3 || stem.length > 300) return null;
      if (!answerInPassage(q.correctAnswer, ctx.passageNorm)) return null;
      const anchors = extractAnchors(stem.replace(/_____|…/g, ' '), ctx.passageText, ctx.passageNorm);
      const evidence = typedEvidence(q, ctx.paragraphs, anchors);
      return evidence ? { text: stem, input: 'text', evidence } : null;
    }
    default:
      return null;
  }
}

// Every usable question of `qType` in a passage, in original order — the
// reusable "passage → filter by type" step every question-type tip uses.
function questionTypeItems(passage, qType) {
  const paragraphs = paragraphsOf(passage);
  if (!paragraphs.some(p => !p.heading)) return { paragraphs, items: [] };
  const passageText = paragraphs.map(p => p.text).join(' ');
  const ctx = {
    paragraphs,
    labels: [...new Set(paragraphs.filter(p => p.label).map(p => p.label))],
    passageText,
    passageNorm: normalizeForMatch(passageText),
  };
  const typed = qType === 'completion' || qType === 'short_answer';
  const items = [];
  for (const group of nonEmptyGroups(passage)) {
    const cls = classifyGroup(group);
    if (typed ? cls !== 'typed' : cls !== qType) continue;
    const instruction = String(group.instruction || '').replace(/\s+/g, ' ').trim();
    for (const q of group.questions) {
      const item = typeItem(qType, group, q, ctx);
      if (item) items.push({ group, q, instruction, wordLimit: typed ? wordLimit(group) : null, ...item });
    }
  }
  items.sort((a, b) => a.q.questionNumber - b.q.questionNumber);
  return { paragraphs, items };
}

// ── Payload builders ────────────────────────────────────────────────────

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// "Cambridge/Reading Test …" label for a passage, when a ReadingTest
// links it; otherwise the passage slot ("Passage 2").
async function sourceNames(passages) {
  const ids = passages.map(p => p._id);
  const tests = await ReadingTest.find({ passageIds: { $in: ids } }).select('name passageIds').lean();
  const map = {};
  for (const p of passages) {
    const k = String(p._id);
    const t = tests.find(x => (x.passageIds || []).some(id => String(id) === k));
    map[k] = t ? t.name : (CATEGORY_LABEL[p.category] || '');
  }
  return map;
}

function publicParagraph(p) {
  return { i: p.i, n: p.n, label: p.label, heading: p.heading, text: p.text, leadEnd: p.leadEnd };
}

function loadActivePassages() {
  return Passage.find({ isActive: true }).select('title category content questionGroups questions').lean();
}

async function buildSkimming(cfg, rng) {
  const pool = (await loadActivePassages()).flatMap(skimItemsForPassage);
  if (!pool.length) return null;

  const shuffled = shuffle(pool, rng);
  // One overall-topic (title) question when the bank has any, the rest
  // paragraph-level — the things the Skimming tip teaches. Spread the
  // paragraph items across passages first (maxPerPassage), then fill any
  // remaining slots from whatever is left.
  const whole = shuffled.find(it => it.target.scope === 'passage');
  const paraPool = shuffled.filter(it => it.target.scope === 'paragraph');
  const paraSlots = whole ? cfg.maxQuestions - 1 : cfg.maxQuestions;
  const chosen = [];
  const perPassage = {};
  for (const it of paraPool) {
    const k = String(it.passage._id);
    if (chosen.length < paraSlots && (perPassage[k] || 0) < cfg.maxPerPassage) {
      chosen.push(it);
      perPassage[k] = (perPassage[k] || 0) + 1;
    }
  }
  for (const it of paraPool) {
    if (chosen.length < paraSlots && !chosen.includes(it)) chosen.push(it);
  }
  if (whole) chosen.push(whole);
  // Keep a passage's items together and in their original order, with the
  // whole-text (title) question last.
  const firstSeen = [];
  chosen.forEach(it => { const k = String(it.passage._id); if (!firstSeen.includes(k)) firstSeen.push(k); });
  chosen.sort((a, b) => (a.target.scope === 'passage') - (b.target.scope === 'passage')
    || firstSeen.indexOf(String(a.passage._id)) - firstSeen.indexOf(String(b.passage._id))
    || a.q.questionNumber - b.q.questionNumber);

  const names = await sourceNames([...new Map(chosen.map(it => [String(it.passage._id), it.passage])).values()]);
  return {
    kind: 'skimming',
    items: chosen.map(it => {
      const tp = it.target.scope === 'paragraph' ? it.paragraphs.find(p => p.i === it.target.index) : null;
      return {
        passageId: String(it.passage._id),
        questionNumber: it.q.questionNumber,
        passageTitle: it.passage.title,
        sourceName: names[String(it.passage._id)],
        scope: it.target.scope,
        targetLabel: tp ? (tp.label ? `Đoạn ${tp.label}` : tp.n ? `Đoạn ${tp.n}` : 'Đoạn mở đầu') : 'Toàn bài',
        focus: skimFocus(it.stem, it.target.scope),
        paragraphs: (tp ? [tp] : it.paragraphs).map(publicParagraph),
        question: { text: it.stem, options: (it.q.options || []).filter(o => String(o || '').trim()) },
      };
    }),
  };
}

// One existing passage with enough usable questions: at least
// cfg.minQuestions, preferring cfg.preferQuestions+ (and, when `prefer` is
// given, passages it accepts first), random within the best non-empty
// tier. Its first cfg.maxQuestions questions are kept, in original order.
async function pickPassage(cfg, rng, itemsOf, prefer) {
  const candidates = (await loadActivePassages())
    .map(p => ({ passage: p, ...itemsOf(p) }))
    .filter(c => c.items.length >= cfg.minQuestions);
  if (!candidates.length) return null;
  const big = (c) => c.items.length >= cfg.preferQuestions;
  const good = prefer ? candidates.filter(prefer) : [];
  const tiers = [good.filter(big), good, candidates.filter(big), candidates];
  const tier = tiers.find(t => t.length);
  const pick = tier[Math.floor(rng() * tier.length)];
  const names = await sourceNames([pick.passage]);
  return {
    passageId: String(pick.passage._id),
    passageTitle: pick.passage.title,
    sourceName: names[String(pick.passage._id)],
    paragraphs: pick.paragraphs.map(publicParagraph),
    items: pick.items.slice(0, cfg.maxQuestions),
  };
}

async function buildScanning(cfg, rng) {
  const pick = await pickPassage(cfg, rng, scanItemsForPassage);
  if (!pick) return null;
  const { items, ...base } = pick;
  return {
    kind: 'scanning',
    ...base,
    questions: items.map(it => ({
      questionNumber: it.q.questionNumber,
      text: it.stem,
      anchors: it.anchors,
      wordLimit: it.wordLimit,
    })),
  };
}

function textContext(paragraphs) {
  const passageText = paragraphs.map(p => p.text).join(' ');
  return { passageText, passageNorm: normalizeForMatch(passageText) };
}

// Step-by-step guidance for one question (Phase 3, "I do / We do"):
// keywords of the question, the paragraph to scan and the evidence
// sentence — all taken from the question, the passage and the teacher's
// existing explanation, no AI. null when there is no reliable evidence.
function guideFor(item, qType, paragraphs) {
  const ctx = textContext(paragraphs);
  let evidence;
  if (qType === 'headings') {
    const p = paragraphs.find(x => x.i === item.targetParagraph);
    evidence = p ? { paragraphIndex: p.i, text: p.text.slice(0, p.leadEnd).trim() } : null;
  } else {
    evidence = item.evidence || locateEvidence(item.q.explanation, paragraphs);
    const p = evidence && paragraphs.find(x => x.i === evidence.paragraphIndex);
    // Matching information falls back to its whole key paragraph; narrow it
    // to the sentence that best matches the statement.
    if (p && evidence.text === p.text) evidence = bestSentence(p, stemKeywords(item.text, p.text, ctx));
    evidence = evidenceSpan(evidence, paragraphs);
  }
  if (!evidence || !evidence.text) return null;
  return { keywords: stemKeywords(item.text, evidence.text, ctx), evidence };
}

async function buildQuestionType(cfg, rng) {
  const qType = cfg.questionType;
  // Prefer passages whose first two questions can be walked through.
  const guidable = (c) => c.items.length >= 2 && guideFor(c.items[0], qType, c.paragraphs) && guideFor(c.items[1], qType, c.paragraphs);
  const pick = await pickPassage(cfg, rng, p => questionTypeItems(p, qType), guidable);
  if (!pick) return null;
  const { items, ...base } = pick;
  return {
    kind: 'questions',
    questionType: qType,
    ...base,
    questions: items.map((it, i) => {
      const q = {
        questionNumber: it.q.questionNumber,
        text: it.text,
        input: it.input,
        choices: it.choices || null,
        listTitle: it.listTitle || null,
        instruction: it.instruction || null,
        wordLimit: it.wordLimit || null,
        targetParagraph: it.targetParagraph != null ? it.targetParagraph : null,
      };
      const guide = i < 2 ? guideFor(it, qType, base.paragraphs) : null;
      if (guide && i === 0) {
        // "I do": a worked example — the only question whose key is sent.
        q.isGuidedExample = true;
        q.guided = { mode: 'example', ...guide, answer: it.q.correctAnswer, explanation: it.q.explanation || '' };
      } else if (guide) {
        q.guided = { mode: 'hint', ...guide }; // "We do": hints, no key
      }
      return q;
    }),
  };
}

// ── Keyword → Paraphrase ────────────────────────────────────────────────

// Teacher explanations pair a question phrase with its passage wording:
// “inability to fly” khớp với “flightless”, “weather” = “climatic
// conditions”… Only pairs whose one side is in the question, the other in
// the passage (and not in the question) and which really differ are kept.
const PAIR_CONNECTOR = '(?:khớp với|tương ứng với|tương ứng|tương đương với|tương đương|đồng nghĩa với|được paraphrase thành|'
  + 'paraphrase của|paraphrase cho|được diễn đạt lại là|được hiểu là|chính là|=|≈|~|↔|⇔|->|→)';
const PAIR_RE = new RegExp(`[“"]([^“”"\\n]{2,90}?)[”"]\\s*(?:\\([^)]{0,60}\\)\\s*)?${PAIR_CONNECTOR}\\s*(?:với\\s*)?[“"]([^“”"\\n]{2,90}?)[”"]`, 'gu');

function paraphrasePairs(passage) {
  const paragraphs = paragraphsOf(passage);
  const normParas = paragraphs.map(p => normalizeForMatch(p.text));
  const passageNorm = normParas.join(' ');
  const out = [];
  for (const group of nonEmptyGroups(passage)) {
    for (const q of group.questions) {
      const stem = questionStem(group, q);
      const texts = [stem, ...(q.options || []).map(o => String(o || '').trim())].filter(Boolean);
      const seen = new Set();
      let k = 0;
      let m;
      PAIR_RE.lastIndex = 0;
      while ((m = PAIR_RE.exec(String(q.explanation || '')))) {
        const [a, b] = [m[1], m[2]].map(s => s.replace(/[.…,;:]+$/, '').trim());
        const na = normalizeForMatch(a);
        const nb = normalizeForMatch(b);
        const inQuestion = (n) => texts.find(t => containsTerm(normalizeForMatch(t), n));
        let keyword;
        let phraseNorm;
        let context;
        if ((context = inQuestion(na)) && containsTerm(passageNorm, nb) && !containsTerm(passageNorm, na)) { keyword = a; phraseNorm = nb; }
        else if ((context = inQuestion(nb)) && containsTerm(passageNorm, na) && !containsTerm(passageNorm, nb)) { keyword = b; phraseNorm = na; }
        if (!keyword || seen.has(phraseNorm)) continue;
        const kw = contentWords(keyword);
        const ph = contentWords(phraseNorm);
        const overlap = kw.filter(w => ph.map(wordStem).includes(wordStem(w))).length;
        if (!kw.length || !ph.length || keyword.split(/\s+/).length > 7 || phraseNorm.split(/\s+/).length > 8
          || overlap / Math.max(kw.length, 1) >= 0.5) continue;
        const pi = normParas.findIndex(np => containsTerm(np, phraseNorm));
        if (pi === -1) continue;
        const start = normParas[pi].indexOf(phraseNorm);
        const phrase = paragraphs[pi].text.substr(start, phraseNorm.length);
        const sentence = evidenceSpan({ paragraphIndex: paragraphs[pi].i, text: phrase }, paragraphs);
        if (!sentence || sentence.text.split(/\s+/).length > 70) continue;
        seen.add(phraseNorm);
        const question = context === stem ? stem : `${stem} — ${context}`;
        out.push({ group, q, k: k++, keyword, phrase, question, sentence });
      }
    }
  }
  return out;
}

// A highlighted span counts if it covers most of the passage phrase's
// content words without dragging in much else.
function gradePhraseSelection(selected, phrase) {
  const target = contentWords(phrase).map(wordStem);
  const picked = contentWords(selected).map(wordStem);
  if (normalizeForMatch(selected) === normalizeForMatch(phrase)) return true;
  if (!target.length || !picked.length) return false;
  const covered = target.filter(s => picked.includes(s)).length / target.length;
  const extra = picked.filter(s => !target.includes(s)).length;
  return covered >= 0.6 && extra <= 2;
}

async function buildParaphrase(cfg, rng) {
  const passages = await loadActivePassages();
  const pool = passages.flatMap(p => paraphrasePairs(p).map(pair => ({ passage: p, ...pair })));
  if (!pool.length) return null;
  const chosen = [];
  const perPassage = {};
  for (const it of shuffle(pool, rng)) {
    const key = String(it.passage._id);
    if (chosen.length >= cfg.maxQuestions || (perPassage[key] || 0) >= cfg.maxPerPassage) continue;
    if (chosen.some(c => c.passage === it.passage && c.q === it.q)) continue; // one pair per question
    chosen.push(it);
    perPassage[key] = (perPassage[key] || 0) + 1;
  }
  const names = await sourceNames([...new Set(chosen.map(it => it.passage))]);
  return {
    kind: 'paraphrase',
    items: chosen.map(it => {
      const p = paragraphsOf(it.passage).find(x => x.i === it.sentence.paragraphIndex);
      return {
        passageId: String(it.passage._id),
        questionNumber: it.q.questionNumber,
        pairIndex: it.k,
        passageTitle: it.passage.title,
        sourceName: names[String(it.passage._id)],
        question: it.question,
        keyword: it.keyword,
        sentence: it.sentence.text,
        paragraphLabel: p ? (p.label || (p.n ? String(p.n) : '')) : '',
      };
    }),
  };
}

// ── Quy trình làm bài (the 7-step workflow on one passage) ──────────────

const WORKFLOW_DETAIL_TYPES = ['tfng', 'ynng', 'mcq', 'completion', 'short_answer'];

// A passage's main-idea question (a real skimming MCQ or a headings
// question) and its detail questions whose evidence paragraph is known —
// the paragraph the student is asked to find in step 6. Only question
// types where the paragraph isn't itself the answer.
function workflowItems(passage) {
  const paragraphs = paragraphsOf(passage);
  const skim = skimItemsForPassage(passage).map(it => ({
    q: it.q, kind: 'mcq', text: it.stem,
    choices: (it.q.options || []).filter(o => String(o || '').trim()).map((o, i) => ({ key: String.fromCharCode(65 + i), label: o })),
    targetParagraph: it.target.scope === 'paragraph' ? it.target.index : null,
  }));
  const heads = questionTypeItems(passage, 'headings').items.map(it => ({
    q: it.q, kind: 'headings', text: it.text, choices: it.choices, listTitle: it.listTitle, targetParagraph: it.targetParagraph,
  }));
  const main = skim[0] || heads[0] || null;
  const details = WORKFLOW_DETAIL_TYPES
    .flatMap(t => questionTypeItems(passage, t).items.map(it => ({ ...it, questionType: t })))
    .filter(it => !main || it.q.questionNumber !== main.q.questionNumber) // step 3 already asks it
    .map(it => ({ ...it, evidence: it.evidence || locateEvidence(it.q.explanation, paragraphs) }))
    .filter(it => it.evidence)
    .sort((a, b) => a.q.questionNumber - b.q.questionNumber);
  return { paragraphs, main, details };
}

async function buildWorkflow(cfg, rng) {
  const candidates = (await loadActivePassages())
    .map(p => ({ passage: p, ...workflowItems(p) }))
    .filter(c => c.main && c.details.length >= 2);
  if (!candidates.length) return null;
  const pick = candidates[Math.floor(rng() * candidates.length)];
  // Spread the detail questions over different paragraphs where possible,
  // then restore the original order.
  const chosen = [];
  for (const d of pick.details) {
    if (chosen.length < cfg.details && !chosen.some(c => c.evidence.paragraphIndex === d.evidence.paragraphIndex)) chosen.push(d);
  }
  for (const d of pick.details) if (chosen.length < cfg.details && !chosen.includes(d)) chosen.push(d);
  chosen.sort((a, b) => a.q.questionNumber - b.q.questionNumber);

  const ctx = textContext(pick.paragraphs);
  const names = await sourceNames([pick.passage]);
  const m = pick.main;
  return {
    kind: 'workflow',
    passageId: String(pick.passage._id),
    passageTitle: pick.passage.title,
    sourceName: names[String(pick.passage._id)],
    paragraphs: pick.paragraphs.map(publicParagraph),
    main: {
      questionNumber: m.q.questionNumber, kind: m.kind, text: m.text, choices: m.choices,
      listTitle: m.listTitle || null, targetParagraph: m.targetParagraph,
    },
    questions: chosen.map(d => {
      const span = evidenceSpan(d.evidence, pick.paragraphs);
      return {
        questionNumber: d.q.questionNumber,
        questionType: d.questionType,
        text: d.text,
        input: d.input,
        choices: d.choices || null,
        wordLimit: d.wordLimit || null,
        instruction: d.instruction || null,
        keywords: stemKeywords(d.text, span ? span.text : '', ctx),
        locationParagraph: d.evidence.paragraphIndex,
      };
    }),
  };
}

// ── Public API ──────────────────────────────────────────────────────────

function hasPractice(lessonKey) {
  return Object.prototype.hasOwnProperty.call(PRACTICE_CONFIG, lessonKey);
}

async function findTip(lessonKey) {
  if (!hasPractice(lessonKey)) return null;
  return ReadingTip.findOne({ lessonKey, isActive: true }).select('lessonKey title').lean();
}

// { status: 'no_practice' } | { status: 'ok', tip, practice } — practice is
// null when the bank has nothing suitable (the client shows an empty state).
async function getPractice(lessonKey, { rng = Math.random } = {}) {
  const tip = await findTip(lessonKey);
  if (!tip) return { status: 'no_practice' };
  const cfg = PRACTICE_CONFIG[lessonKey];
  const build = {
    skimming: buildSkimming, scanning: buildScanning, questions: buildQuestionType,
    paraphrase: buildParaphrase, workflow: buildWorkflow,
  }[cfg.kind];
  const practice = await build(cfg, rng);
  return { status: 'ok', tip: { lessonKey: tip.lessonKey, title: tip.title }, practice };
}

// Grades ONE answer and only then reveals answer + explanation + evidence.
async function checkAnswer(lessonKey, { passageId, questionNumber, answer, pairIndex }) {
  const tip = await findTip(lessonKey);
  if (!tip) return { status: 'no_practice' };
  const cfg = PRACTICE_CONFIG[lessonKey];
  const passage = await Passage.findOne({ _id: passageId, isActive: true })
    .select('content questionGroups questions')
    .lean();
  if (!passage) return { status: 'not_found' };

  const qNum = Number(questionNumber);
  const userAnswer = String(answer == null ? '' : answer).slice(0, 200);

  if (cfg.kind === 'paraphrase') {
    const pair = paraphrasePairs(passage).find(p => p.q.questionNumber === qNum && p.k === Number(pairIndex));
    if (!pair) return { status: 'not_in_practice' };
    const at = pair.sentence.text.indexOf(pair.phrase);
    return {
      status: 'ok',
      result: {
        questionNumber: qNum,
        isCorrect: gradePhraseSelection(userAnswer, pair.phrase),
        correctAnswer: pair.phrase,
        keyword: pair.keyword,
        explanation: pair.q.explanation || '',
        evidence: { paragraphIndex: pair.sentence.paragraphIndex, text: at === -1 ? pair.sentence.text : pair.phrase },
      },
    };
  }

  let entry;
  let paragraphs;
  if (cfg.kind === 'skimming') {
    entry = skimItemsForPassage(passage).find(it => it.q.questionNumber === qNum);
    paragraphs = entry && entry.paragraphs;
  } else if (cfg.kind === 'workflow') {
    const w = workflowItems(passage);
    entry = [w.main, ...w.details].find(it => it && it.q.questionNumber === qNum);
    paragraphs = w.paragraphs;
  } else {
    const res = cfg.kind === 'scanning' ? scanItemsForPassage(passage) : questionTypeItems(passage, cfg.questionType);
    entry = res.items.find(it => it.q.questionNumber === qNum);
    paragraphs = res.paragraphs;
  }
  if (!entry) return { status: 'not_in_practice' };

  const { gradedAnswers } = gradeGroups([{ questions: [entry.q] }], { [qNum]: userAnswer });
  const evidence = entry.evidence || locateEvidence(entry.q.explanation, paragraphs);
  return {
    status: 'ok',
    result: {
      questionNumber: qNum,
      isCorrect: !!(gradedAnswers[0] && gradedAnswers[0].isCorrect),
      correctAnswer: entry.q.correctAnswer,
      explanation: entry.q.explanation || '',
      evidence,
    },
  };
}

module.exports = {
  PRACTICE_CONFIG,
  hasPractice,
  getPractice,
  checkAnswer,
  // Exported for unit tests / the read-only data audit.
  _internals: {
    locateQuotes, classifyGroup, questionTypeItems, guideFor, stemKeywords, evidenceSpan,
    paraphrasePairs, gradePhraseSelection, workflowItems,
    passageToParagraphs, locateEvidence, answerSentence, splitSentences, extractAnchors, normalizeForMatch,
    skimItemsForPassage, scanItemsForPassage, questionStem, isChoiceAnswer, answerInPassage, wordLimit, htmlToLines,
  },
};
