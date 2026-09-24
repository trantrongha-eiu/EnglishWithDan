'use strict';

// Listening Tips → "🎧 Luyện tập": mini-practices built on the fly from the
// existing Listening bank (đề lẻ ListeningSection: its audio, transcript and
// questions). Nothing is copied into the database and no AI is called — a
// practice is existing questions + filtering + static guidance.
//
// Only sections whose transcript has been aligned to their audio are used
// (`dictationSentences`: start/end seconds per transcript sentence, see
// scripts/bulkAlignListeningDictation.js). The alignment passing is also
// the proof that the audio really is the recording the transcript was
// written from (sections still waiting for their real audio never align),
// and it lets each question play just the part of the audio it needs.
//
// Payloads never carry an answer key: POST …/practice/check grades one
// answer (the bank's own grading, listeningService.gradeQuestionGroups) and
// only then reveals the answer, the explanation and the audio evidence.

const ListeningTip = require('../models/ListeningTip');
const ListeningSection = require('../models/ListeningSection');
const { gradeQuestionGroups } = require('./listeningService');

// Keyed by ListeningTip.lessonKey — the 7 "Kỹ thuật nghe nền tảng" tips.
const PRACTICE_CONFIG = {
  'keyword-highlighting': { kind: 'keywords', maxQuestions: 5, maxPerSection: 2 },
  '30-second-strategy': { kind: 'preview', minQuestions: 3, maxQuestions: 5, prepSeconds: 30 },
  'symbols-and-paraphrase': { kind: 'symbols', meaningItems: 4, audioItems: 5 },
  'full-workflow-practice': { kind: 'workflow', minQuestions: 3, maxQuestions: 5 },
  // predict → (confirmed) → listen → answer
  'predict-noun-adjective-verb': { kind: 'wordclass', maxQuestions: 6, maxPerSection: 2 },
  'predict-number-date-place': { kind: 'infotype', maxQuestions: 6, maxPerSection: 2 },
  // predict → listen → answer → confirmed with the answer (the plural trap)
  'predict-plural-countable-formula': { kind: 'form', maxQuestions: 6, maxPerSection: 2 },
};

// What the student predicts, per kind (the server derives the real one).
const CHOICES = {
  keywords: ['proper', 'date', 'time', 'price', 'number', 'word'],
  preview: ['proper', 'date', 'time', 'price', 'number', 'word'],
  workflow: ['proper', 'date', 'time', 'price', 'number', 'word'],
  wordclass: ['noun', 'adjective', 'verb'],
  infotype: ['name', 'place', 'date', 'time', 'price', 'number'],
  form: ['singular', 'plural', 'uncountable', 'ving', 'verb', 'adjective', 'phrase'],
};
// Kinds whose prediction is confirmed right away, before listening.
const REVEAL_ON_PREDICT = new Set(['wordclass', 'infotype']);

// ── Text helpers (transcripts are plain text, one sentence per line) ───

function normalizeForMatch(s) {
  return String(s || '')
    .replace(/\s+/g, ' ').trim()
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[–—−]/g, '-');
}

function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Start offsets of whole-term matches of `term` in normalized text.
function termPositions(haystackNorm, term) {
  const t = normalizeForMatch(term);
  if (!t) return [];
  const re = new RegExp('(^|[^\\p{L}\\p{N}])(' + escapeRe(t) + ')(?![\\p{L}\\p{N}])', 'gu');
  const out = [];
  let m;
  while ((m = re.exec(haystackNorm))) {
    out.push(m.index + m[1].length);
    if (re.lastIndex === m.index) re.lastIndex++;
  }
  return out;
}

function allIndexes(hay, needle) {
  const out = [];
  for (let at = hay.indexOf(needle); at !== -1; at = hay.indexOf(needle, at + 1)) out.push(at);
  return out;
}

// Explanations are written like the Reading ones — "Vị trí: … Transcript:
// “…” — “…” Phân tích: …" — so the quoted transcript is the evidence.
function evidenceCandidates(explanation) {
  const ex = String(explanation || '');
  const out = [];
  let m;
  for (const re of [/“([^”]{6,}?)”/g, /"([^"\n]{6,}?)"/g]) {
    while ((m = re.exec(ex))) out.push(m[1]);
  }
  if (!out.length) {
    const labelled = /^[^\p{L}\n]*transcript\s*:\s*(.+)$/gimu;
    while ((m = labelled.exec(ex))) out.push(m[1]);
  }
  return out;
}

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…', pound: '£', euro: '€',
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

// Note lines / table cells are usually plain text but some were pasted as
// HTML (up to whole documents): block tags and <br> become line breaks,
// table cells " · ", and <head>/<style>/comments are dropped.
function htmlToLines(s) {
  const str = String(s || '');
  if (!/<[a-z!/]/i.test(str)) return [str];
  return decodeEntities(str
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(head|style|script|title)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:td|th)>/gi, ' · ')
    .replace(/<\/?(?:p|div|li|ul|ol|h[1-6]|tr|table|tbody|thead|section|hr|header|footer|body|html)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ''))
    .split('\n')
    .map(l => l.replace(/\s+/g, ' ').replace(/^(?:\s*·\s*)+|(?:\s*·\s*)+$/g, '').trim())
    .filter(Boolean);
}

const ABBREVIATIONS = /(?:\b(?:Mr|Mrs|Ms|Dr|Prof|St|Mt|Jr|Sr|vs|etc|No|Co|Inc|Ltd|approx)|\be\.g|\bi\.e|\ba\.m|\bp\.m|\b[A-Z])\.$/i;

// A transcript line's sentences (lines are mostly one sentence, but a
// monologue can hold a whole paragraph on one line).
function splitSentences(text) {
  const out = [];
  const re = /[.!?…]+["”’)\]]*(?=\s+["“‘([]?[A-Z0-9])/g;
  let start = 0;
  let m;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    if (ABBREVIATIONS.test(text.slice(Math.max(0, end - 8), end))) continue;
    out.push(text.slice(start, end).trim());
    start = end;
  }
  out.push(text.slice(start).trim());
  return out.filter(Boolean);
}

// Question markers some transcripts carry ("… £10 (Q5), 11 …", "… Street.
// Q6", "(Đáp án câu 3)") — removed from what students are shown.
function cleanTranscriptText(s) {
  return String(s || '')
    .replace(/\s*\((?:Q\s?\d+[^)]*|đáp án[^)]*|answer\s*\d*[^)]*)\)/giu, '')
    .replace(/\s+Q\d{1,2}\b(?=[\s,.;:!?]*$|\s+[A-Z])/g, '')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
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

// ── Transcript ↔ audio time ─────────────────────────────────────────────

// "Woman:" on its own line, or "Woman: text" — the stored conventions (see
// listeningTranscriptSplitter.js).
const SPEAKER_LINE = /^[\p{Lu}][\p{L} .'’-]{0,30}:$/u;
const SPEAKER_PREFIX = /^([\p{Lu}][\p{L}.'’-]{0,20}(?: [\p{Lu}][\p{L}.'’-]{0,20})?):\s+(?=\S)/u;
const SEC_PER_CHAR = 0.065; // ~15 characters a second of speech

function transcriptLines(transcript) {
  const out = [];
  let speaker = '';
  String(transcript || '').split('\n').map(l => l.trim()).filter(Boolean).forEach((line, i) => {
    if (i === 0 && /transcript/i.test(line) && line.length < 40) return; // "❓ Transcript" header
    if (SPEAKER_LINE.test(line)) { speaker = line.slice(0, -1).trim(); return; }
    const m = line.match(SPEAKER_PREFIX);
    if (m) { speaker = m[1]; line = line.slice(m[0].length); }
    out.push({ speaker, text: line });
  });
  return out;
}

// The transcript as one normalized string (line offsets kept) plus the
// aligned sentences found in it, in order: the anchors that map any
// transcript position to a time in the audio.
const timelineCache = new WeakMap();
function timelineOf(section) {
  if (timelineCache.has(section)) return timelineCache.get(section);
  let full = '';
  const lines = transcriptLines(section.transcript).map((l) => {
    const norm = normalizeForMatch(l.text);
    const from = full ? full.length + 1 : 0;
    full = full ? `${full} ${norm}` : norm;
    return { ...l, norm, from, to: from + norm.length };
  });
  const anchors = [];
  let cursor = 0;
  (section.dictationSentences || []).forEach((d, index) => {
    const t = normalizeForMatch(d.text);
    const at = t ? full.indexOf(t, cursor) : -1;
    if (at === -1) return;
    anchors.push({ from: at, to: at + t.length, start: d.start, end: d.end, index });
    cursor = at + t.length;
  });
  // every sentence of every line, with its offsets in `full`
  const sentences = [];
  lines.forEach((l, lineIndex) => {
    let at = l.from;
    for (const text of splitSentences(l.text)) {
      const n = normalizeForMatch(text);
      const from = full.indexOf(n, at);
      if (from === -1 || from > l.to) continue;
      sentences.push({ text, speaker: l.speaker, from, to: from + n.length, lineIndex });
      at = from + n.length;
    }
  });
  const last = anchors[anchors.length - 1];
  const tl = { lines, sentences, full, anchors, duration: section.audioDuration || (last ? last.end + 10 : 0) };
  timelineCache.set(section, tl);
  return tl;
}

// Seconds into the audio of a transcript offset: exact inside an aligned
// sentence, interpolated between two (sentences the alignment dropped).
function timeAt(tl, off) {
  const A = tl.anchors;
  if (!A.length) return null;
  for (let i = 0; i < A.length; i++) {
    const a = A[i];
    if (off < a.from) {
      if (i === 0) return Math.max(0, a.start - (a.from - off) * SEC_PER_CHAR);
      const p = A[i - 1];
      const gap = a.from - p.to;
      return gap > 0 ? p.end + (a.start - p.end) * ((off - p.to) / gap) : a.start;
    }
    if (off <= a.to) return a.start + (a.end - a.start) * ((off - a.from) / Math.max(1, a.to - a.from));
  }
  const l = A[A.length - 1];
  return Math.min(tl.duration || Infinity, l.end + (off - l.to) * SEC_PER_CHAR);
}

const round = (n) => Math.round(n * 100) / 100;

// Where the explanation's quotes sit in the transcript. The longest quote
// fixes the place (the first occurrence at/after `after` — questions follow
// the audio); shorter ones must be near it.
function quoteRange(tl, explanation, after) {
  const frags = [];
  for (const cand of evidenceCandidates(explanation)) {
    for (const frag of cand.replace(/\[([^\]]*)\]/g, '$1').split(/\.{3,}|…|\s[—–-]\s/)) {
      const nf = normalizeForMatch(frag).replace(/^["'\s.,;:-]+|["'\s.,;:-]+$/g, '');
      if (nf.length >= 8) frags.push(nf);
    }
  }
  frags.sort((a, b) => b.length - a.length);
  let anchor = null;
  const hits = [];
  for (const nf of frags) {
    const tries = nf.length > 60 ? [nf, wordPrefix(nf, 45), wordSuffix(nf, 45)] : [nf];
    for (const t of tries) {
      const pos = allIndexes(tl.full, t);
      if (!pos.length) continue;
      const at = anchor == null
        ? (pos.find(p => p >= after) ?? pos[0])
        : pos.reduce((best, p) => (Math.abs(p - anchor) < Math.abs(best - anchor) ? p : best));
      if (anchor == null) anchor = at;
      if (Math.abs(at - anchor) < 500) hits.push({ from: at, to: at + t.length });
      break;
    }
  }
  if (!hits.length) return null;
  return { from: Math.min(...hits.map(h => h.from)), to: Math.max(...hits.map(h => h.to)) };
}

// Typed answers are words heard in the audio: their first whole-term
// occurrence at/after `after`.
function answerRange(tl, correctAnswer, after) {
  for (const alt of answerAlternatives(correctAnswer)) {
    const pos = termPositions(tl.full, alt);
    if (!pos.length) continue;
    const at = pos.find(p => p >= after) ?? pos[0];
    return { from: at, to: at + normalizeForMatch(alt).length };
  }
  return null;
}

// The whole sentence(s) around a located range (at most three), with their
// times in the audio. Speakers are named when the evidence is an exchange.
function evidenceOf(tl, range) {
  const hit = tl.sentences.filter(s => s.to > range.from && s.from < range.to).slice(0, 3);
  if (!hit.length) return null;
  const first = hit[0];
  const lastS = hit[hit.length - 1];
  const start = timeAt(tl, first.from);
  const end = timeAt(tl, lastS.to);
  if (start == null || end == null) return null;
  const exchange = new Set(hit.map(s => s.speaker)).size > 1;
  const text = hit.map((s, i) => {
    const t = cleanTranscriptText(s.text);
    return exchange && s.speaker && (i === 0 || s.speaker !== hit[i - 1].speaker) ? `${s.speaker}: ${t}` : t;
  }).join(' ');
  return {
    text,
    speaker: exchange ? '' : first.speaker,
    start: round(start),
    end: round(end),
    sentenceIndex: tl.sentences.indexOf(first),
  };
}

// What a question plays: from the sentence before its evidence (a lead-in,
// as in the test) to just after it.
function segmentFor(tl, ev) {
  const prev = tl.sentences[ev.sentenceIndex - 1];
  let start = prev ? timeAt(tl, prev.from) : ev.start - 3;
  if (ev.start - start > 12) start = ev.start - 4;
  const end = Math.min(ev.end + 1.2, tl.duration || Infinity);
  return { start: round(Math.max(0, start - 0.3)), end: round(end) };
}

// ── Questions ───────────────────────────────────────────────────────────

function answerAlternatives(ans) {
  return String(ans || '').split('/').map(s => s.trim()).filter(Boolean);
}

const WORD_LIMIT_RE = /(NO MORE THAN (?:ONE|TWO|THREE|FOUR) WORDS?(?:\s*(?:AND\/OR|OR|AND)\s*A NUMBER)?|(?:ONE|TWO|THREE) WORDS?(?: ONLY)?(?:\s*(?:AND\/OR|OR)\s*A NUMBER)?|ONE WORD(?: ONLY)?|A NUMBER)/i;
function wordLimit(group) {
  const m = String(group.instruction || '').match(WORD_LIMIT_RE);
  return m ? m[1].replace(/\s+/g, ' ').toUpperCase() : null;
}

const BULLET = /^[\s●○•◦▪■□◆◇·*–-]+/;

// The gap as the student sees it on the paper: its note line / sentence
// (the heading above it as context), or its table cell under the column
// header (the row's first cell as context) — this gap as "_____", any
// other gap as "…".
function gapText(group, q) {
  const marker = `__Q${q.questionNumber}__`;
  const clean = (s) => String(s || '').replace(/^>>/, '').replace(BULLET, '').replace(marker, ' _____ ')
    .replace(/__Q\d+__/g, ' … ').replace(/\s+/g, ' ').replace(/\s+([.,;:?!)])/g, '$1').trim();
  if (group.groupType === 'table') {
    const { headers = [], rows = [] } = group.tableConfig || {};
    for (const row of rows) {
      const ci = (row || []).findIndex(c => String(c || '').includes(marker));
      if (ci === -1) continue;
      const cell = htmlToLines(row[ci]).find(l => l.includes(marker));
      const head = htmlToLines(headers[ci]).join(' ').trim();
      const first = ci > 0 ? clean(htmlToLines(row[0]).join(' ')) : '';
      return {
        text: clean(`${head ? `${head}: ` : ''}${cell}`),
        context: first && !first.includes('_____') && !first.includes('…') ? first : '',
      };
    }
    return null;
  }
  const raw = group.groupType === 'note-form' ? (group.noteConfig || {}).lines
    : group.groupType === 'bullet-list' ? (group.bulletConfig || {}).items : null;
  if (!raw) return null;
  const lines = raw.flatMap(l => htmlToLines(String(l || '').replace(/^>>/, '')));
  const i = lines.findIndex(l => l.includes(marker));
  if (i === -1) return null;
  // the nearest heading above: no gap, no bullet, and either "Label:" or a
  // short line without a "label: value" pair
  const isHeading = (l) => !/__Q\d+__/.test(l) && !BULLET.test(l)
    && (/:\s*$/.test(l) || (!l.includes(':') && l.length <= 50));
  let context = htmlToLines((group.noteConfig || {}).title).join(' ').trim();
  for (let j = i - 1; j >= Math.max(0, i - 8); j--) {
    if (isHeading(lines[j].trim())) { context = clean(lines[j]).replace(/:\s*$/, ''); break; }
  }
  return { text: clean(lines[i]), context };
}

// Typed-answer gaps (form / note / table / sentence completion) of a
// section, in order, each with its evidence in the audio.
function gapItems(section) {
  const tl = timelineOf(section);
  if (!tl.anchors.length) return [];
  const out = [];
  let after = 0;
  for (const group of section.questionGroups || []) {
    if (!['note-form', 'table', 'bullet-list'].includes(group.groupType) || (group.wordBank || []).length) continue;
    for (const q of group.questions || []) {
      if (q.type !== 'fill-blank' || !answerAlternatives(q.correctAnswer).length) continue;
      const gap = gapText(group, q);
      const range = quoteRange(tl, q.explanation, after) || answerRange(tl, q.correctAnswer, after);
      const ev = range && evidenceOf(tl, range);
      // a bare gap (no word around it) has nothing to highlight
      if (!gap || !gap.text.includes('_____') || !ev || !words(gap.text.replace('_____', ' ')).length) continue;
      after = range.from;
      out.push({ group, q, gap, ev, type: answerType(q, gap, tl), limit: wordLimit(group) });
    }
  }
  return out;
}

// ── Answer type (what kind of information fills the gap) ───────────────

const MONTHS = /\b(?:jan(?:uary)?|feb(?:ruary)?|march|apr(?:il)?|may|june|july|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;
const DAYS = /\b(?:mon|tues|wednes|thurs|fri|satur|sun)day\b/i;
const PRICE_CONTEXT = /[£$€]|\b(?:cost|costs|price|prices|fee|fees|charge|charges|pay|paid|rent|salary|pounds?|dollars?|euros?)\b/;

// A proper name: capitalised wherever the transcript says it (not only at
// the start of a sentence), spelled out letter by letter, or stored in
// capitals.
function isProperName(key, tl) {
  if (/^[A-Z][A-Z' -]{2,}$/.test(key)) return true;
  const letters = key.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (letters.length >= 3 && new RegExp(letters.split('').join('[- ]'), 'i').test(tl.lines.map(l => l.text).join(' '))) return true;
  const re = new RegExp(`(^|[^\\p{L}])(${escapeRe(key)})(?![\\p{L}])`, 'giu');
  const capitalised = (w) => w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase();
  let seen = 0;
  let midSentence = 0;
  for (const l of tl.lines) {
    let m;
    while ((m = re.exec(l.text))) {
      // every word of it capitalised ("Motor", "King Room"), every time
      if (!m[2].split(/\s+/).every(capitalised)) return false;
      seen++;
      const before = l.text.slice(0, m.index + m[1].length).trim();
      if (before && !/[.!?:"“‘'—–-]$/.test(before)) midSentence++;
    }
  }
  return seen > 0 && midSentence > 0;
}

// Derived from the correct answer + the words around the gap; null when it
// fits none of the types taught (an email / web address).
function answerType(q, gap, tl) {
  const key = answerAlternatives(q.correctAnswer)[0] || '';
  const around = `${gap.text} ${gap.context || ''}`.toLowerCase();
  if (!key) return null;
  if (/@|www\.|\.(?:com|org|net|co\.uk)\b/i.test(key) || /www\.|\.com\b|@/.test(around)) return null;
  if (DAYS.test(key) || MONTHS.test(key) || /\b\d{1,2}(?:st|nd|rd|th)\b/i.test(key)) return 'date';
  if (/^[£$€]/.test(key) || /[£$€]\s*_____/.test(around) || (/^\d[\d,.]*$/.test(key) && PRICE_CONTEXT.test(around))) return 'price';
  const clock = key.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?$/i);
  const validClock = clock && Number(clock[1]) <= 24 && (clock[2] == null || Number(clock[2]) < 60);
  if ((validClock && (clock[2] != null || clock[3])) || (validClock && /_____\s*(?:a\.?m|p\.?m|o'clock)/.test(around))
    || /\b(?:noon|midnight|o'clock)\b/i.test(key)) return 'time';
  if (/\d/.test(key)) return 'number';
  if (isProperName(key, tl)) return 'proper';
  return 'word';
}

// ── Keywords (what to underline before the audio starts) ────────────────

const STOPWORDS = new Set(('a an the and or but if of to in on at by for with from as is are was were be been being this that these '
  + 'those it its their there they them he she his her we our you your i my me not no so than then too very can could may might must '
  + 'should would will shall do does did have has had about after before all any each more most other some such only which who whom '
  + 'what when where while how also just every many much one per into up out over under also here').split(' '));
// Words right next to a gap that say what kind of answer it takes.
const SIGNALS_BEFORE = new Set(['a', 'an', 'the', 'at', 'on', 'in', 'by', 'from', 'to', 'about', 'many', 'several', 'much', 'very',
  'too', 'must', 'can', 'will', 'should', 'your', 'their', 'his', 'her', 'of', 'per', '£', '$', '€', 'mr', 'mrs', 'ms', 'dr', 'room',
  'every', 'each', 'two', 'three', 'four', 'some', 'no', 'be', 'is', 'are']);
const SIGNALS_AFTER = /^(?:p\.?m\.?|a\.?m\.?|o'clock|road|street|avenue|lane|square|park|hotel|centre|center|hall|campus|station|people|students|weeks|days|months|years|hours|minutes|km|kilometres|metres|miles|per|%|percent|pounds|dollars)$/i;

function words(text) {
  return String(text || '').match(/[£$€]|[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) || [];
}

// Content words of the gap text (names and numbers first, then the ones the
// evidence repeats — what you will actually hear), up to four; plus the
// answer-type signal right next to the gap.
function keywordsFor(gap, evidenceText) {
  const [before, after] = gap.text.split('_____');
  const prevWord = (words(before).pop() || '').toLowerCase().replace(/\.$/, '');
  const nextWord = words(after)[0] || '';
  const signals = [];
  if (SIGNALS_BEFORE.has(prevWord)) signals.push(words(before).pop());
  if (SIGNALS_AFTER.test(nextWord)) signals.push(nextWord);
  const bare = (w) => w.replace(/[.,;:!?]+$/, '');
  const stem = (w) => bare(w).toLowerCase().replace(/['’]s$/, '').replace(/(?:ing|ed|es|s)$/, '');
  const evStems = new Set(words(normalizeForMatch(evidenceText)).map(stem));
  const collect = (segs, base) => {
    const out = [];
    segs.forEach((seg, si) => words(seg).forEach((raw, i) => {
      const w = bare(raw);
      if (!w || STOPWORDS.has(w.toLowerCase()) || signals.includes(raw) || (w.length < 3 && !/\d/.test(w))) return;
      if (out.some(c => c.w.toLowerCase() === w.toLowerCase())) return;
      // a number, or a capitalised word that doesn't just start the line
      const anchor = /\d/.test(w) || (i > 0 && /^[\p{Lu}]/u.test(w));
      out.push({ w, seg: base + si, pos: i, anchor, s: (anchor ? 2 : 0) + (evStems.has(stem(w)) ? 1 : 0) });
    }));
    return out;
  };
  // the gap's own words; the heading only when the line itself is too bare
  let cands = collect([before, after], 1);
  if (cands.length < 2) cands = [...collect([gap.context || ''], 0).slice(0, 2 - cands.length), ...cands];
  const order = (a, b) => a.seg - b.seg || a.pos - b.pos;
  const picked = cands.map((c, i) => ({ ...c, i })).sort((a, b) => b.s - a.s || a.i - b.i).slice(0, 5).sort(order);
  // adjacent names / numbers read as one keyword: "Motor Show", "10 September"
  const keywords = [];
  picked.forEach((c, k) => {
    const prev = picked[k - 1];
    if (prev && prev.anchor && c.anchor && prev.seg === c.seg && c.pos === prev.pos + 1) keywords[keywords.length - 1] += ` ${c.w}`;
    else keywords.push(c.w);
  });
  return { keywords: keywords.slice(0, 4), signals };
}

// ── Grammar / information predictions (Phase 2) ─────────────────────────
// Each classifier answers only when the question itself shows it (the
// signal a student is taught to look for) AND the real key agrees; anything
// less certain is left out of that practice.

const CLAUSE_END = /^(?:and|or|but|for|to|than|because|so|in|on|at|with|from|of|by|if|when|while|which|that|who|as|before|after|during|near|around|into|per)\b/i;

function gapContext(gap) {
  const [before = '', after = ''] = String(gap.text).split('_____');
  const b = words(before);
  const a = words(after);
  // trailing punctuation off ("Mrs." → "Mrs"), but "a.m." / "p.m." stay whole
  const bare = (w) => String(w || '').replace(/[,;:]+$/, '').replace(/(?<![ap]\.m)\.$/i, '');
  const afterTrim = after.trim();
  return {
    before: before.trim(),
    prevRaw: bare(b[b.length - 1]),
    prev: bare(b[b.length - 1]).toLowerCase(),
    prev2: bare(b[b.length - 2]).toLowerCase(),
    nextRaw: bare(a[0]),
    next: bare(a[0]).toLowerCase(),
    // nothing (or only a preposition / conjunction) follows: the gap ends its phrase
    endsClause: !afterTrim || /^[.,;:!?)…–—-]/.test(afterTrim) || CLAUSE_END.test(afterTrim),
  };
}

const DETERMINERS = new Set(['a', 'an', 'the', 'your', 'their', 'his', 'her', 'its', 'our', 'my', 'this', 'that', 'these', 'those',
  'each', 'every', 'another', 'no', 'any', 'some']);
const INTENSIFIERS = new Set(['very', 'too', 'so', 'quite', 'extremely', 'really', 'particularly', 'fairly', 'rather', 'pretty',
  'highly', 'incredibly', 'surprisingly', 'relatively']);
const LINKING = new Set(['is', 'are', 'was', 'were', 'be', 'been', 'being', 'seem', 'seems', 'seemed', 'look', 'looks', 'looked',
  'feel', 'feels', 'felt', 'become', 'becomes', 'became', 'remain', 'remains', 'remained', 'sound', 'sounds', 'stay', 'stays']);
const MODALS = new Set(['must', 'can', 'could', 'should', 'will', 'would', 'may', 'might', 'shall', 'cannot', "can't", "won't",
  "mustn't", "shouldn't", "couldn't", "wouldn't", "don't", "doesn't", "didn't"]);
const TO_BEFORE = /\b(?:need|needs|needed|want|wants|wanted|have|has|had|used|going|able|unable|required|told|advised|asked|allowed|try|tries|tried|trying|plan|plans|planned|decide|decided|remember|how|order|hope|hopes|expect|expected|intend|aim|aims|agree|agreed|offer|offers|encouraged|supposed|likely|important|necessary|easy|difficult|hard|possible|impossible|essential|chance|opportunity|way|help|helps|helped)\s+to$/i;
const NOUN_PREPOSITIONS = new Set(['about', 'for', 'of', 'in', 'on', 'with', 'from', 'by', 'at', 'into', 'without', 'through']);
const ING_BEFORE = /\b(?:involves?|involving|includes?|including|enjoys?|enjoyed|avoid(?:s|ed)?|recommends?|recommended|suggests?|suggested|considers?|considered|finish(?:es|ed)?|keeps?|kept|mind|practi[sc]es?|practi[sc]ed|go|goes|went|spend|spends|spent|stop|stops|stopped|start|starts|started|like|likes|love|loves|hate|prefer|prefers)$/i;
const PLURAL_SIGNAL = /\b(?:two|three|four|five|six|seven|eight|nine|ten|twelve|twenty|hundred|thousand|many|several|various|both|few|numerous|a number of|a range of|a variety of|a lot of|lots of|plenty of|these|those|all the|\d{1,4})$/i;
const SINGULAR_SIGNAL = /\b(?:a|an|one|each|every|another|a single|this|that)$/i;
const ING_NOUNS = new Set(['morning', 'evening', 'ceiling', 'wedding', 'pudding', 'nothing', 'something', 'anything', 'everything',
  'thing', 'things', 'king', 'ring', 'spring', 'string', 'wing', 'sibling', 'darling', 'herring', 'lightning', 'sterling', 'offspring',
  'meeting', 'building', 'clothing', 'housing', 'heading', 'feeling', 'ending', 'railing', 'stuffing']);
const UNCOUNTABLE = new Set(['information', 'equipment', 'advice', 'furniture', 'luggage', 'baggage', 'accommodation', 'research',
  'homework', 'coursework', 'traffic', 'weather', 'money', 'music', 'software', 'knowledge', 'evidence', 'feedback', 'transport',
  'transportation', 'pollution', 'rubbish', 'litter', 'clothing', 'stationery', 'machinery', 'scenery', 'news', 'progress', 'employment',
  'insurance', 'electricity', 'water', 'bread', 'rice', 'sugar', 'salt', 'coffee', 'milk', 'cheese', 'safety', 'health', 'fitness',
  'nutrition', 'security', 'damage', 'sunshine', 'cash', 'jewellery', 'jewelry', 'fun', 'energy', 'fuel', 'oil', 'plastic', 'soil',
  'sand', 'grass', 'noise', 'waste', 'medication', 'furniture', 'staff', 'wildlife', 'vegetation', 'rain', 'snow']);
const IRREGULAR_PLURALS = new Set(['people', 'children', 'men', 'women', 'feet', 'teeth', 'mice', 'geese', 'data', 'media',
  'criteria', 'phenomena']);
const S_SINGULAR = /(?:ss|us|is|ous|ics|news|bus|gas|lens|plus|yes|this|thus|always|perhaps|series|species|means|eas|less)$/i;
const ADJ_SUFFIX = /(?:ful|less|ous|ive|able|ible|ic|ical|ish)$/i;
const COMMON_ADJ = new Set(['good', 'bad', 'cheap', 'expensive', 'free', 'busy', 'quiet', 'noisy', 'safe', 'popular', 'large', 'small',
  'big', 'long', 'short', 'high', 'low', 'full', 'empty', 'open', 'closed', 'early', 'late', 'hot', 'cold', 'warm', 'cool', 'dry', 'wet',
  'clean', 'dirty', 'easy', 'difficult', 'hard', 'soft', 'new', 'old', 'modern', 'local', 'public', 'private', 'available', 'suitable',
  'comfortable', 'convenient', 'strong', 'weak', 'fresh', 'healthy', 'simple', 'complex', 'fast', 'slow', 'friendly', 'lonely', 'lively',
  'narrow', 'wide', 'deep', 'heavy', 'light', 'bright', 'dark', 'rare', 'common', 'basic', 'main', 'major', 'real', 'true', 'fair', 'poor',
  'rich', 'young', 'famous', 'accurate', 'flexible', 'reliable', 'efficient', 'effective', 'relevant', 'traditional', 'original',
  'permanent', 'temporary', 'necessary', 'important', 'essential', 'different', 'similar', 'natural', 'national', 'social', 'special',
  'general', 'possible', 'impossible', 'plastic', 'wooden', 'metal', 'regular', 'urgent', 'formal', 'casual', 'crowded', 'boring',
  'tired', 'annoyed', 'disappointed', 'satisfied', 'stable', 'visible', 'secure', 'calm', 'noisy', 'wild', 'rural', 'urban', 'direct',
  'official', 'correct', 'wrong', 'serious', 'harmful', 'useful', 'helpful', 'successful']);
const NATIONALITIES = /^(?:english|french|chinese|italian|spanish|german|japanese|korean|arabic|indian|russian|greek|dutch|irish|scottish|welsh|british|american|australian|canadian|thai|vietnamese|portuguese|turkish|polish|swedish|mexican|latin|european|asian|african)$/i;
const NAME_TITLES = new Set(['mr', 'mrs', 'ms', 'miss', 'dr', 'professor', 'prof', 'sir', 'dame']);
const NAME_LABEL = /\b(?:name|surname|first name|family name|contact|called|supervisor|manager|agent|teacher|tutor|director|leader|instructor|coordinator|owner|chef|doctor|nurse|lecturer|speaker|author|organiser|organizer)\b/i;
const ORGANISATION = /^(?:ferries|ferry|company|hotel|restaurant|agency|school|club|centre|center|ltd|limited|group|travel|tours|airlines?|bank|shop|store|college|university)$/i;
const PLACE_WORDS = /^(?:road|street|avenue|lane|square|park|hotel|centre|center|hall|campus|station|bridge|island|islands|beach|river|lake|hill|hills|village|town|city|room|building|close|drive|way|place|gardens|court|terrace|crescent|bay|market|house|farm|valley|forest|mountain|mountains|airport|harbour|port|castle|tower|library|museum|theatre|theater|stadium)$/i;
const PLACE_LABEL = /\b(?:address|location|suburb|town|city|country|venue|place|destination|area|region|district|located|held|based|visited|live|lives|lived|from)\b/i;

const words1 = (s) => words(s).map(w => w.replace(/[.,;:]+$/, ''));
const keyWords = (key) => words1(answerAlternatives(key)[0] || '');

function isPluralWord(w) {
  const x = w.toLowerCase();
  return IRREGULAR_PLURALS.has(x) || (x.length > 3 && /s$/.test(x) && !S_SINGULAR.test(x) && !UNCOUNTABLE.has(x));
}
function isVing(w) {
  const x = w.toLowerCase();
  return x.length > 5 && /ing$/.test(x) && !ING_NOUNS.has(x);
}
const isBaseVerb = (w) => !/(?:ing|ed)$/i.test(w) && (!/s$/i.test(w) || /ss$/i.test(w));

// Noun / adjective / verb from the words around the gap (the tip's
// signals), for single-word (or two-word noun) keys.
function wordClassOf(it) {
  if (it.type !== 'word') return null;
  const kw = keyWords(it.q.correctAnswer);
  if (!kw.length || kw.length > 2) return null;
  const c = gapContext(it.gap);
  const last = kw[kw.length - 1].toLowerCase();
  const single = kw.length === 1;
  const adjLike = COMMON_ADJ.has(last) || ADJ_SUFFIX.test(last);
  if (c.prev === 'the' && c.next === 'of') {
    return { value: 'noun', reason: 'Cấu trúc “the ___ of” → luôn là danh từ.', signal: 'the' };
  }
  if (single && INTENSIFIERS.has(c.prev) && c.endsClause) {
    return { value: 'adjective', reason: `Sau “${c.prevRaw}” → cần tính từ.`, signal: c.prevRaw };
  }
  if (single && MODALS.has(c.prev) && isBaseVerb(last)) {
    return { value: 'verb', reason: `Sau động từ khuyết thiếu “${c.prevRaw}” → động từ nguyên mẫu.`, signal: c.prevRaw };
  }
  if (single && c.prev === 'to' && TO_BEFORE.test(c.before) && isBaseVerb(last) && !adjLike) {
    return { value: 'verb', reason: `Sau “${c.prev2} to” → động từ nguyên mẫu.`, signal: 'to' };
  }
  if (single && LINKING.has(c.prev) && c.endsClause && adjLike && !UNCOUNTABLE.has(last)) {
    return { value: 'adjective', reason: `Sau động từ “${c.prevRaw}” (be / seem / become…) và cuối cụm → tính từ.`, signal: c.prevRaw };
  }
  if (DETERMINERS.has(c.prev) && c.endsClause && !/ly$/.test(last) && !adjLike && !isVing(last)) {
    return { value: 'noun', reason: `Sau “${c.prevRaw}” và không có danh từ nào theo sau → chỗ trống là danh từ.`, signal: c.prevRaw };
  }
  if (single && NOUN_PREPOSITIONS.has(c.prev) && c.endsClause && !adjLike && !isVing(last) && !/ly$/.test(last)) {
    return { value: 'noun', reason: `Sau giới từ “${c.prevRaw}” → thường là danh từ.`, signal: c.prevRaw };
  }
  if (single && ['a', 'an', 'the'].includes(c.prev) && c.next && !c.endsClause && adjLike) {
    return {
      value: 'adjective',
      reason: `“${c.prevRaw} ___ ${c.nextRaw}” — chỗ trống đứng giữa mạo từ và danh từ “${c.nextRaw}” → tính từ bổ nghĩa (cẩn thận: đôi khi là danh từ bổ nghĩa).`,
      signal: c.nextRaw,
    };
  }
  return null;
}

// Name / place / date / time / price / number — only when the question
// itself says which (a label, a title, a unit, a currency sign…).
function infoTypeOf(it) {
  const c = gapContext(it.gap);
  const label = `${it.gap.context || ''} ${c.before}`;
  const key = answerAlternatives(it.q.correctAnswer)[0] || '';
  switch (it.type) {
    case 'time':
      if (/^(?:a\.?m\.?|p\.?m\.?|o'clock|am|pm)$/.test(c.next)) return { value: 'time', reason: `Có “${c.nextRaw}” sau chỗ trống → giờ.`, signal: c.nextRaw };
      if (/\b(?:time|times|starts?|begins?|opens?|closes?|finish(?:es)?|ends?|arrives?|leaves?|departure|arrival|until|till)\b/i.test(label)) return { value: 'time', reason: 'Câu hỏi nói về thời điểm (start / open / close / until…) → giờ.', signal: '' };
      return null;
    case 'price': {
      if (/[£$€]\s*$/.test(c.before)) return { value: 'price', reason: `Có “${c.before.trim().slice(-1)}” ngay trước chỗ trống → giá tiền.`, signal: c.before.trim().slice(-1) };
      const w = `${label} ${c.next}`.match(/\b(cost|costs|price|prices|fee|fees|charge|charges|pay|paid|rent|salary|deposit|fare)\b/i);
      return w ? { value: 'price', reason: `Từ “${w[1]}” → giá tiền.`, signal: w[1] } : null;
    }
    case 'date':
      if (c.prev === 'on') return { value: 'date', reason: 'Sau “on” → ngày / thứ.', signal: 'on' };
      if (/\b(?:date|day|days|deadline|month|year|when|by)\b/i.test(label)) return { value: 'date', reason: 'Câu hỏi hỏi ngày / thứ / tháng (Date / day / deadline…).', signal: '' };
      return null;
    case 'number': {
      const unit = c.next.match(/^(?:people|persons?|students?|km|kilometres?|miles?|metres?|minutes?|hours?|days?|weeks?|months?|years?|percent|%|degrees?|kg|times|rooms?|members?|places?|seats?)$/);
      if (unit) return { value: 'number', reason: `“___ ${c.nextRaw}” → một con số.`, signal: c.nextRaw };
      const lab = label.match(/\b(number|phone|telephone|mobile|postcode|post code|room|age|how many|size|capacity|total|code|reference|flight|platform|floor|level|population|max(?:imum)?|min(?:imum)?|approx(?:imately)?|about)\b/i);
      return lab ? { value: 'number', reason: `Từ “${lab[1]}” → một con số / mã số.`, signal: lab[1] } : null;
    }
    case 'proper': {
      if (NATIONALITIES.test(key) || ORGANISATION.test(c.next)) return null;
      // the words right at the gap first ("Mrs ___", "___ Street", "in ___"), then its label
      if (NAME_TITLES.has(c.prev.replace(/\.$/, ''))) return { value: 'name', reason: `Sau “${c.prevRaw}” → tên người.`, signal: c.prevRaw };
      if (PLACE_WORDS.test(c.next)) return { value: 'place', reason: `“___ ${c.nextRaw}” → tên địa điểm.`, signal: c.nextRaw };
      if (['in', 'at', 'near', 'opposite', 'to', 'from'].includes(c.prev)) return { value: 'place', reason: `Sau “${c.prevRaw}” + tên riêng → địa điểm.`, signal: c.prevRaw };
      if (NAME_LABEL.test(label)) return { value: 'name', reason: `Nhãn “${label.match(NAME_LABEL)[0]}” → tên người.`, signal: label.match(NAME_LABEL)[0] };
      if (PLACE_LABEL.test(label)) return { value: 'place', reason: `Từ “${label.match(PLACE_LABEL)[0]}” → địa điểm.`, signal: label.match(PLACE_LABEL)[0] };
      return null;
    }
    default:
      return null;
  }
}

// The form the answer takes — what to check when writing it down.
function formOf(it) {
  if (it.type !== 'word') return null;
  const kw = keyWords(it.q.correctAnswer);
  if (!kw.length || kw.length > 3) return null;
  const c = gapContext(it.gap);
  const last = kw[kw.length - 1].toLowerCase();
  if (kw.length >= 2) {
    const n = limitWords(it.limit);
    return { value: 'phrase', reason: `Đáp án là cả một cụm ${kw.length} từ${n ? ` (đề cho tối đa ${n} từ)` : ''} — nghe và chép đủ, đừng bỏ sót từ nào.` };
  }
  if (isVing(last)) {
    if (NOUN_PREPOSITIONS.has(c.prev) || c.prev === 'before' || c.prev === 'after') return { value: 'ving', reason: `Sau giới từ “${c.prevRaw}” → V-ing.`, signal: c.prevRaw };
    if (ING_BEFORE.test(c.before)) return { value: 'ving', reason: `Sau “${c.prevRaw}” → V-ing.`, signal: c.prevRaw };
    return { value: 'ving', reason: 'Đáp án ở dạng V-ing — nghe và viết đủ đuôi -ing.' };
  }
  if (isPluralWord(last)) {
    const sig = c.before.match(PLURAL_SIGNAL);
    return sig
      ? { value: 'plural', reason: `Sau “${sig[0]}” → danh từ số nhiều.`, signal: sig[0] }
      : { value: 'plural', reason: 'Câu hỏi không có dấu hiệu chắc chắn — phải nghe kỹ đuôi -s của danh từ số nhiều.' };
  }
  if (UNCOUNTABLE.has(last)) return { value: 'uncountable', reason: `“${last}” là danh từ không đếm được — không bao giờ thêm -s.` };
  const wc = wordClassOf(it);
  if (!wc) return null;
  if (wc.value !== 'noun') return wc;
  const sig = c.before.match(SINGULAR_SIGNAL);
  return sig ? { value: 'singular', reason: `Sau “${sig[0]}” → danh từ số ít.`, signal: sig[0] } : null;
}

function classify(kind, it) {
  if (kind === 'wordclass') return wordClassOf(it);
  if (kind === 'infotype') return infoTypeOf(it);
  if (kind === 'form') return formOf(it);
  return it.type ? { value: it.type, reason: '' } : null;
}

// ── Checking what was written (after a wrong answer) ────────────────────

function limitWords(limit) {
  const m = String(limit || '').match(/\b(ONE|TWO|THREE|FOUR)\s+WORDS?/i);
  return m ? { ONE: 1, TWO: 2, THREE: 3, FOUR: 4 }[m[1].toUpperCase()] : null;
}

function levenshtein(a, b) {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length];
}

// Why a wrong answer is wrong, when it's one of the classic slips: the
// word limit, singular / plural, the word's form, a missing word of a
// phrase, spelling.
function diagnose(answer, key, limit) {
  const ua = normalizeForMatch(answer).replace(/[.,;:!?]+$/, '');
  if (!ua) return null;
  const n = limitWords(limit);
  const counted = ua.split(' ').filter(w => !/^\d/.test(w));
  if (n && counted.length > n) return { kind: 'limit', note: `Vượt giới hạn từ: bạn viết ${counted.length} từ, đề chỉ cho tối đa ${n} từ.` };
  // communicate / communicating / communicated, run / running
  const stem = (w) => w.replace(/(?:ing|ed|es|s)$/, '').replace(/([bdgklmnprt])\1$/, '$1').replace(/e$/, '');
  for (const alt of answerAlternatives(key).map(normalizeForMatch)) {
    if (!alt) continue;
    if ([`${ua}s`, `${ua}es`, ua.replace(/y$/, 'ies')].includes(alt)) return { kind: 'plural', note: `Thiếu đuôi số nhiều — đáp án là “${alt}”.` };
    if ([`${alt}s`, `${alt}es`, alt.replace(/y$/, 'ies')].includes(ua)) return { kind: 'plural', note: `Thừa đuôi -s — đáp án là “${alt}” (số ít / không đếm được).` };
    if (ua !== alt && stem(ua) === stem(alt) && stem(ua).length >= 3) return { kind: 'form', note: `Đúng từ nhưng sai dạng — đáp án là “${alt}”.` };
    const altWords = alt.split(' ');
    const uaWords = ua.split(' ');
    if (altWords.length > uaWords.length && uaWords.every(w => altWords.includes(w))) return { kind: 'missing', note: `Thiếu từ — đáp án là cả cụm “${alt}”.` };
    if (alt.length >= 4 && levenshtein(ua, alt) <= (alt.length >= 8 ? 2 : 1)) return { kind: 'spelling', note: `Sai chính tả — đáp án viết là “${alt}”.` };
  }
  return null;
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

function loadSections() {
  return ListeningSection.find({ isActive: true, audioUrl: { $ne: '' }, 'dictationSentences.0': { $exists: true } })
    .select('title partNumber audioUrl audioDuration transcript questionGroups dictationSentences isActualTest')
    .lean();
}

function sourceName(section) {
  return `Part ${section.partNumber} · ${section.title}`;
}

// `exclude` = the student's most recent practice sections (newest first,
// kept in their browser); the oldest exclusions go first when nothing
// would be left.
function withoutRecent(candidates, exclude, idOf) {
  for (let n = exclude.length; n > 0; n--) {
    const skip = new Set(exclude.slice(0, n));
    const rest = candidates.filter(c => !skip.has(idOf(c)));
    if (rest.length) return rest;
  }
  return candidates;
}

function questionPayload(section, it) {
  const { keywords, signals } = keywordsFor(it.gap, it.ev.text);
  return {
    sectionId: String(section._id),
    questionNumber: it.q.questionNumber,
    text: it.gap.text,
    context: it.gap.context || '',
    wordLimit: it.limit,
    keywords,
    signals,
    segment: segmentFor(timelineOf(section), it.ev),
  };
}

// Highlight keyword: gaps from several sections (at most maxPerSection
// each), mixing answer types.
async function buildKeywords(cfg, rng, exclude) {
  const sections = await loadSections();
  const pool = shuffle(sections.flatMap(s => gapItems(s).filter(it => it.type).map(it => ({ s, it }))), rng);
  const skip = new Set(exclude);
  pool.sort((a, b) => skip.has(String(a.s._id)) - skip.has(String(b.s._id)));
  const chosen = [];
  const perSection = {};
  const perType = {};
  for (const pass of [true, false]) {
    for (const c of pool) {
      if (chosen.length >= cfg.maxQuestions) break;
      const k = String(c.s._id);
      if (chosen.includes(c) || (perSection[k] || 0) >= cfg.maxPerSection) continue;
      if (pass && (perType[c.it.type] || 0) >= 2) continue; // first pass: vary the types
      chosen.push(c);
      perSection[k] = (perSection[k] || 0) + 1;
      perType[c.it.type] = (perType[c.it.type] || 0) + 1;
    }
  }
  if (!chosen.length) return null;
  return {
    kind: 'keywords',
    items: chosen.map(({ s, it }) => ({
      ...questionPayload(s, it),
      sectionTitle: s.title,
      sourceName: sourceName(s),
      audioUrl: s.audioUrl,
    })),
  };
}

// 30 seconds: the first run of 3–5 consecutive gaps of one group, played
// as one stretch of audio after the preparation time.
function previewRuns(section, cfg) {
  const items = gapItems(section).filter(it => it.type);
  const runs = [];
  let run = [];
  for (const it of items) {
    const prev = run[run.length - 1];
    const consecutive = prev && prev.group === it.group && it.q.questionNumber === prev.q.questionNumber + 1 && it.ev.start >= prev.ev.start;
    if (!consecutive) { if (run.length >= cfg.minQuestions) runs.push(run); run = []; }
    run.push(it);
  }
  if (run.length >= cfg.minQuestions) runs.push(run);
  return runs.map(r => r.slice(0, cfg.maxQuestions));
}

// A run of gaps played as one stretch of audio (from just before the first
// one's evidence to just after the last one's).
function runPayload(kind, s, run) {
  const tl = timelineOf(s);
  const first = segmentFor(tl, run[0].ev);
  const last = run[run.length - 1].ev;
  return {
    kind,
    sectionId: String(s._id),
    sectionTitle: s.title,
    sourceName: sourceName(s),
    audioUrl: s.audioUrl,
    instruction: String(run[0].group.instruction || '').replace(/\s+/g, ' ').trim(),
    wordLimit: run[0].limit,
    segment: { start: round(Math.max(0, first.start - 3)), end: round(Math.min(last.end + 2, tl.duration || Infinity)) },
    questions: run.map(it => {
      const { segment, ...rest } = questionPayload(s, it); // eslint-disable-line no-unused-vars
      return rest;
    }),
  };
}

async function buildPreview(cfg, rng, exclude) {
  const sections = await loadSections();
  const all = sections.map(s => ({ s, runs: previewRuns(s, cfg) })).filter(c => c.runs.length);
  if (!all.length) return null;
  const candidates = withoutRecent(all, exclude, c => String(c.s._id));
  const big = candidates.filter(c => c.runs.some(r => r.length >= 5));
  const pickFrom = big.length ? big : candidates;
  const { s, runs } = pickFrom[Math.floor(rng() * pickFrom.length)];
  const run = runs.reduce((best, r) => (r.length > best.length ? r : best), runs[0]);
  return { ...runPayload('preview', s, run), prepSeconds: cfg.prepSeconds };
}

// Quy trình hoàn chỉnh: a run of consecutive gaps of one test, done step
// by step — highlight → predict → listen → answer → check — with no timer.
async function buildWorkflow(cfg, rng, exclude) {
  const sections = await loadSections();
  const all = sections.map(s => ({ s, runs: previewRuns(s, cfg) })).filter(c => c.runs.length);
  if (!all.length) return null;
  const candidates = withoutRecent(all, exclude, c => String(c.s._id));
  const { s, runs } = candidates[Math.floor(rng() * candidates.length)];
  return runPayload('workflow', s, runs[Math.floor(rng() * runs.length)]);
}

// Spreads the picks over the classes (noun / adjective / verb, …), taking
// turns, and over sections (at most maxPerSection each); recently practised
// sections go last.
function balancedPick(pool, classOf, n, maxPerSection, rng, exclude) {
  const skip = new Set(exclude);
  const buckets = {};
  shuffle(pool, rng)
    .sort((a, b) => skip.has(String(a.s._id)) - skip.has(String(b.s._id)))
    .forEach(c => { (buckets[classOf(c)] = buckets[classOf(c)] || []).push(c); });
  const order = shuffle(Object.keys(buckets), rng);
  const chosen = [];
  const perSection = {};
  let progress = true;
  while (chosen.length < n && progress) {
    progress = false;
    for (const k of order) {
      if (chosen.length >= n) break;
      const i = buckets[k].findIndex(c => (perSection[String(c.s._id)] || 0) < maxPerSection);
      if (i === -1) continue;
      const [c] = buckets[k].splice(i, 1);
      chosen.push(c);
      perSection[String(c.s._id)] = (perSection[String(c.s._id)] || 0) + 1;
      progress = true;
    }
  }
  return chosen;
}

// Predict (word class / type of information / form of the answer) →
// listen → answer, on single gaps the kind's classifier is sure about.
async function buildPredict(cfg, rng, exclude) {
  const sections = await loadSections();
  const pool = sections.flatMap(s => gapItems(s).map(it => ({ s, it, cls: classify(cfg.kind, it) })).filter(c => c.cls));
  const chosen = balancedPick(pool, c => c.cls.value, cfg.maxQuestions, cfg.maxPerSection, rng, exclude);
  if (!chosen.length) return null;
  return {
    kind: cfg.kind,
    items: chosen.map(({ s, it }) => ({
      sectionId: String(s._id),
      questionNumber: it.q.questionNumber,
      text: it.gap.text,
      context: it.gap.context || '',
      wordLimit: it.limit,
      segment: segmentFor(timelineOf(s), it.ev),
      sectionTitle: s.title,
      sourceName: sourceName(s),
      audioUrl: s.audioUrl,
    })),
  };
}

// ── Ký hiệu nhanh ───────────────────────────────────────────────────────

// The tip's own table (listeningTipsData/foundations.js).
const SYMBOLS = [
  { symbol: '$', meaning: 'price — giá tiền' },
  { symbol: '#', meaning: 'number — con số, số lượng' },
  { symbol: '→', meaning: 'change / result — thay đổi, kết quả' },
  { symbol: '+', meaning: 'advantage / positive — ưu điểm, tích cực' },
  { symbol: '–', meaning: 'disadvantage / negative — nhược điểm, tiêu cực' },
  { symbol: '?', meaning: 'uncertain — chưa chắc chắn' },
  { symbol: '✓', meaning: 'confirmed — đã xác nhận' },
  { symbol: '!', meaning: 'important — quan trọng' },
  { symbol: '≠', meaning: 'contrast — đối lập, so sánh' },
];
const NUM = '(?:\\d[\\d,.]*|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|hundred|thousand|million)';
// Only unambiguous signals — a sentence matching two symbols is not used.
const SYMBOL_PATTERNS = {
  '$': /[£$€]\s?\d[\d,]*(?:\.\d+)?|\b\d[\d,.]*\s?(?:pounds|dollars|euros)\b/i,
  '#': new RegExp(`\\b${NUM}\\s+(?:people|students|rooms|members|places|seats|participants|visitors|guests|children|adults|staff|employees|kilometres|kilometers|km|miles|metres|meters|hours|minutes|weeks|months|years|per ?cent|%)\\b`, 'i'),
  '→': /\b(?:has|have|had) (?:changed|increased|decreased|risen|fallen|gone up|gone down|doubled|dropped)\b|\b(?:increased|decreased|rose|fell|dropped|went up|went down) (?:to|from|by)\b|\bbut now\b|\bas a result\b|\bresulted in\b|\bled to\b/i,
  '+': /\b(?:advantages?|benefits?|plus side|good thing about|best thing about)\b/i,
  '–': /\b(?:disadvantages?|drawbacks?|downside|weakness(?:es)?|the (?:main |only |big )?problem (?:is|was|with))\b/i,
  '?': /\b(?:i'?m not (?:quite |completely |entirely |really )?sure|not certain|i don'?t know (?:if|whether)|haven'?t (?:yet )?decided|not decided yet)\b/i,
  '✓': /^(?:yes[,.]?\s+)?(?:definitely|exactly|that'?s (?:right|correct))\b|\b(?:has|have) been confirmed\b/i,
  '!': /\b(?:it'?s|it is|it was) (?:really |very |extremely |absolutely )?(?:important|essential|vital|crucial)\b|(?:^|[,.;:]\s*|\b(?:so|and|but|please|just|always)\s+)make sure\b|\bdon'?t forget\b|\bremember to\b/i,
  '≠': /\b(?:whereas|on the other hand|in contrast|by contrast|unlike)\b/i,
};

function symbolOf(text) {
  const hits = Object.keys(SYMBOL_PATTERNS).filter(k => SYMBOL_PATTERNS[k].test(text));
  return hits.length === 1 ? hits[0] : null;
}

function signalOf(text, symbol) {
  const m = String(text).match(SYMBOL_PATTERNS[symbol]);
  return m ? m[0].replace(/^[,.;:\s]+/, '') : '';
}

// Real, clearly-timed sentences of the audio that carry one symbol's meaning.
function symbolClips(section) {
  const out = [];
  (section.dictationSentences || []).forEach((d, i) => {
    const dur = d.end - d.start;
    const symbol = dur >= 1.5 && dur <= 12 ? symbolOf(d.text) : null;
    if (symbol) out.push({ section, index: i, symbol, d });
  });
  return out;
}

function symbolOptions(correct, rng, n = 4) {
  const others = shuffle(SYMBOLS.map(s => s.symbol).filter(s => s !== correct), rng).slice(0, n - 1);
  return shuffle([correct, ...others], rng);
}

async function buildSymbols(cfg, rng, exclude) {
  const meaning = shuffle(SYMBOLS, rng).slice(0, cfg.meaningItems).map(s => ({
    type: 'meaning',
    symbol: s.symbol,
    options: shuffle([s, ...shuffle(SYMBOLS.filter(x => x !== s), rng).slice(0, 3)], rng).map(x => x.meaning),
  }));
  const sections = await loadSections();
  const skip = new Set(exclude);
  const clips = shuffle(sections.flatMap(symbolClips), rng)
    .sort((a, b) => skip.has(String(a.section._id)) - skip.has(String(b.section._id)));
  const audio = [];
  for (const c of clips) { // one clip per symbol, one per section
    if (audio.length >= cfg.audioItems) break;
    if (audio.some(a => a.symbol === c.symbol || a.section === c.section)) continue;
    audio.push(c);
  }
  if (!audio.length) return null;
  return {
    kind: 'symbols',
    items: [
      ...meaning,
      ...audio.map(c => ({
        type: 'audio',
        sectionId: String(c.section._id),
        sentenceIndex: c.index,
        sourceName: sourceName(c.section),
        audioUrl: c.section.audioUrl,
        segment: { start: round(Math.max(0, c.d.start - 0.2)), end: round(c.d.end + 0.4) },
        options: symbolOptions(c.symbol, rng),
      })),
    ],
  };
}

// ── Public API ──────────────────────────────────────────────────────────

function hasPractice(lessonKey) {
  return Object.prototype.hasOwnProperty.call(PRACTICE_CONFIG, lessonKey);
}

async function findTip(lessonKey) {
  if (!hasPractice(lessonKey)) return null;
  return ListeningTip.findOne({ lessonKey, isActive: true }).select('lessonKey title').lean();
}

// { status: 'no_practice' } | { status: 'ok', tip, practice } — practice is
// null when the bank has nothing suitable (the client shows an empty state).
async function getPractice(lessonKey, { rng = Math.random, exclude = [] } = {}) {
  const tip = await findTip(lessonKey);
  if (!tip) return { status: 'no_practice' };
  const cfg = PRACTICE_CONFIG[lessonKey];
  const build = {
    keywords: buildKeywords, preview: buildPreview, symbols: buildSymbols, workflow: buildWorkflow,
    wordclass: buildPredict, infotype: buildPredict, form: buildPredict,
  }[cfg.kind];
  const practice = await build(cfg, rng, exclude.map(String));
  return { status: 'ok', tip: { lessonKey: tip.lessonKey, title: tip.title }, practice };
}

// Grades ONE answer and only then reveals answer + explanation + evidence.
// `stage: 'predict'` (word class / type of information) only confirms the
// prediction — why, from the question's own words — without the answer.
async function checkAnswer(lessonKey, body) {
  const tip = await findTip(lessonKey);
  if (!tip) return { status: 'no_practice' };
  const cfg = PRACTICE_CONFIG[lessonKey];
  const answer = String(body.answer == null ? '' : body.answer).slice(0, 200);

  if (cfg.kind === 'symbols' && body.item === 'meaning') {
    const s = SYMBOLS.find(x => x.symbol === body.symbol);
    if (!s) return { status: 'not_in_practice' };
    return { status: 'ok', result: { isCorrect: answer === s.meaning, correctAnswer: s.meaning, symbol: s.symbol } };
  }

  const section = await ListeningSection.findOne({ _id: body.sectionId, isActive: true })
    .select('title partNumber audioDuration transcript questionGroups dictationSentences')
    .lean();
  if (!section) return { status: 'not_found' };

  if (cfg.kind === 'symbols') {
    const d = (section.dictationSentences || [])[Number(body.sentenceIndex)];
    const symbol = d && symbolOf(d.text);
    if (!symbol) return { status: 'not_in_practice' };
    const s = SYMBOLS.find(x => x.symbol === symbol);
    return {
      status: 'ok',
      result: {
        isCorrect: answer === symbol,
        correctAnswer: symbol,
        meaning: s.meaning,
        evidence: { text: d.text, signal: signalOf(d.text, symbol), start: round(d.start), end: round(d.end) },
      },
    };
  }

  const it = gapItems(section).find(x => x.q.questionNumber === Number(body.questionNumber));
  const cls = it && classify(cfg.kind, it);
  if (!cls) return { status: 'not_in_practice' };
  const prediction = CHOICES[cfg.kind].includes(body.prediction) ? body.prediction : null;
  const why = { category: cls.value, reason: cls.reason || '', signal: cls.signal || '' };

  if (body.stage === 'predict') {
    if (!REVEAL_ON_PREDICT.has(cfg.kind) || !prediction) return { status: 'not_in_practice' };
    return { status: 'ok', result: { stage: 'predict', questionNumber: it.q.questionNumber, prediction, predictionCorrect: prediction === cls.value, ...why } };
  }

  const { reviewed } = gradeQuestionGroups([{ questions: [it.q] }], () => answer.trim());
  const isCorrect = !!(reviewed[0] && reviewed[0].isCorrect);
  return {
    status: 'ok',
    result: {
      questionNumber: it.q.questionNumber,
      isCorrect,
      correctAnswer: it.q.correctAnswer,
      answerType: it.type,
      ...why,
      prediction,
      predictionCorrect: prediction ? prediction === cls.value : null,
      explanation: it.q.explanation || '',
      evidence: { text: it.ev.text, speaker: it.ev.speaker, start: it.ev.start, end: it.ev.end },
      diagnosis: isCorrect ? null : diagnose(answer, it.q.correctAnswer, it.limit),
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
    transcriptLines, timelineOf, timeAt, quoteRange, answerRange, evidenceOf, segmentFor,
    gapText, gapItems, answerType, keywordsFor, symbolOf, symbolClips, previewRuns, normalizeForMatch,
    gapContext, wordClassOf, infoTypeOf, formOf, classify, diagnose, balancedPick,
  },
};
