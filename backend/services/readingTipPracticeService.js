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
// the key for arbitrary questions.

const Passage = require('../models/Passage');
const ReadingTest = require('../models/ReadingTest');
const ReadingTip = require('../models/ReadingTip');
const { gradeGroups } = require('./readingService');

// lessonKey (ReadingTip.lessonKey) → practice definition. Only tips listed
// here get a practice section; Phase 2 adds the question-type tips.
const PRACTICE_CONFIG = {
  skimming: { kind: 'skimming', maxQuestions: 5, maxPerPassage: 2 },
  scanning: { kind: 'scanning', maxQuestions: 6, minQuestions: 3, preferQuestions: 5 },
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
    // Section/paragraph letter on its own ("A", "A.", "Paragraph B") or on
    // its own line above the text — attach it to the paragraph it labels.
    const own = block.match(/^(?:(?:paragraph|section)\s+)?\(?([A-J])[.):]?$/i);
    if (own) { pendingLabel = own[1].toUpperCase(); continue; }
    let label = null;
    const lead = block.match(/^(?:(?:paragraph|section)\s+)?\(?([A-J])[.):]?[ \t]*\n\s*([\s\S]+)$/i);
    if (lead) { label = lead[1].toUpperCase(); block = lead[2]; }
    block = block.replace(/\s+/g, ' ').trim();
    if (!block) continue;
    if (!label && pendingLabel) label = pendingLabel;
    pendingLabel = null;
    blocks.push({ text: block, label, emphasized });
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
  const paragraphs = passageToParagraphs(passage.content);
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

function scanItemsForPassage(passage) {
  const paragraphs = passageToParagraphs(passage.content);
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
      // Consistency with the teacher's own explanation: the sentence it
      // quotes must contain the answer (the bank has answer keys copied
      // from the neighbouring question — explanation right, answer
      // wrong), and the evidence must sit next to what the question tells
      // you to scan for. Without a locatable quote, the passage sentence
      // holding the answer is the evidence.
      const quotes = locateQuotes(q.explanation, paragraphs);
      const quoted = quotes.find(qt => answerInPassage(q.correctAnswer, normalizeForMatch(evidenceSentences(qt, paragraphs))));
      if (quotes.length && !quoted) continue;
      const evidence = quoted || answerSentence(q.correctAnswer, paragraphs, anchors);
      if (!evidence) continue;
      const near = normalizeForMatch(paragraphs.filter(p => Math.abs(p.i - evidence.paragraphIndex) <= 1).map(p => p.text).join(' '));
      if (anchors.length && !anchors.some(a => containsTerm(near, a))) continue;
      items.push({ group, q, stem, anchors, evidence, wordLimit: wordLimit(group) });
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

async function buildScanning(cfg, rng) {
  const candidates = (await loadActivePassages())
    .map(p => ({ passage: p, ...scanItemsForPassage(p) }))
    .filter(c => c.items.length >= cfg.minQuestions);
  if (!candidates.length) return null;
  const preferred = candidates.filter(c => c.items.length >= cfg.preferQuestions);
  const tier = preferred.length ? preferred : candidates;
  const pick = tier[Math.floor(rng() * tier.length)];
  const items = pick.items.slice(0, cfg.maxQuestions);

  const names = await sourceNames([pick.passage]);
  return {
    kind: 'scanning',
    passageId: String(pick.passage._id),
    passageTitle: pick.passage.title,
    sourceName: names[String(pick.passage._id)],
    paragraphs: pick.paragraphs.map(publicParagraph),
    questions: items.map(it => ({
      questionNumber: it.q.questionNumber,
      text: it.stem,
      anchors: it.anchors,
      wordLimit: it.wordLimit,
    })),
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
  const practice = cfg.kind === 'skimming' ? await buildSkimming(cfg, rng) : await buildScanning(cfg, rng);
  return { status: 'ok', tip: { lessonKey: tip.lessonKey, title: tip.title }, practice };
}

// Grades ONE answer and only then reveals answer + explanation + evidence.
async function checkAnswer(lessonKey, { passageId, questionNumber, answer }) {
  const tip = await findTip(lessonKey);
  if (!tip) return { status: 'no_practice' };
  const cfg = PRACTICE_CONFIG[lessonKey];
  const passage = await Passage.findOne({ _id: passageId, isActive: true })
    .select('content questionGroups questions')
    .lean();
  if (!passage) return { status: 'not_found' };

  const qNum = Number(questionNumber);
  const entry = cfg.kind === 'skimming'
    ? skimItemsForPassage(passage).find(it => it.q.questionNumber === qNum)
    : scanItemsForPassage(passage).items.find(it => it.q.questionNumber === qNum);
  if (!entry) return { status: 'not_in_practice' };

  const userAnswer = String(answer == null ? '' : answer).slice(0, 200);
  const { gradedAnswers } = gradeGroups([{ questions: [entry.q] }], { [qNum]: userAnswer });
  const evidence = entry.evidence || locateEvidence(entry.q.explanation, entry.paragraphs);
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
    locateQuotes,
    passageToParagraphs, locateEvidence, answerSentence, splitSentences, extractAnchors, normalizeForMatch,
    skimItemsForPassage, scanItemsForPassage, questionStem, isChoiceAnswer, answerInPassage, wordLimit, htmlToLines,
  },
};
