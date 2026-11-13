'use strict';

// ══════════════════════════════════════════════════════
// "EnglishWithDan Speaking Format" parser
//
//   @topic
//   topic=A TV/online programme you enjoy
//   group=culture_media
//
//   @part1
//   What kinds of TV programmes do you like to watch?
//   How often do you watch television?
//
//   @part2
//   cue=what it is about | how often you watch it | who you watch it with | and explain why you enjoy it
//   Describe a TV or online programme that you enjoy watching
//
//   @part3
//   Why do some people spend so much time watching TV?
//   Do younger and older people enjoy similar programmes?
//
// One @topic block carries all three parts for a topic (any part may be
// omitted). Repeat @topic for each topic — a whole quarterly set pastes in
// one go. Under @part1 / @part3, every non-blank line is one question. Under
// @part2 there is an optional `cue=` line (bullet points separated by `|`)
// and exactly one question line (the cue-card prompt). `group=` (optional,
// Part 2/3 only) is one of SPEAKING_GROUP_CODES.
//
// The text usually comes straight out of ChatGPT/Gemini via the admin's
// "Copy AI Prompt" button, so the parser tolerates the usual AI habits
// rather than failing the whole paste on them: a ``` fence, **bold**
// markers, a chatty line before the first @topic, "1." / "-" / "•" in front
// of questions, `topic:` instead of `topic=`, `@Part 1`, `\'` escapes, and a
// "You should say:" + bullet list under @part2 instead of a `cue=` line.
//
// Lines starting with "#" are comments; "# Ghi chú: ..." / "# Note: ..."
// comments are surfaced as warnings so the AI can flag problems it saw in
// the source (e.g. a Part 3 list that belongs to another cue card).
//
// This module never calls an AI API; it only parses text.
// ══════════════════════════════════════════════════════

const SPEAKING_GROUP_CODES = ['people', 'places', 'objects', 'events', 'activities_skills', 'nature_science', 'culture_media'];

const SECTION_RE = /^@\s*(topic|part\s*[123])\s*:?$/i;
const LIST_MARKER_RE = /^(?:[-–•*·▪●○]|\d{1,2}[.)]|\d{1,2}(?=\s+[A-Z]))\s+/;
const CUE_INTRO_RE = /^you should say\s*:?$/i;
const NOTE_RE = /^#+\s*(?:ghi chú|ghi chu|note|lưu ý|luu y)\s*:?\s*(.*)$/i;

// Undo formatting an AI (or a PDF copy) wraps around a line.
function cleanLine(raw) {
  let s = String(raw || '').trim();
  s = s.replace(/^\*\*(.*)\*\*$/, '$1').replace(/^__(.*)__$/, '$1').trim();
  s = s.replace(/\\(['"])/g, '$1');      // it\'s → it's
  s = s.replace(/\s+/g, ' ');
  return s;
}

function stripListMarker(s) {
  return s.replace(LIST_MARKER_RE, '').trim();
}

// Split raw text into @topic blocks, each with per-section raw lines.
function tokenize(raw) {
  const lines = String(raw || '').split(/\r?\n/);
  const errors = [];
  const warnings = [];
  const blocks = [];
  let block = null;      // { line, topic, group, sections: {part1:[],part2:[],part3:[]}, cue: [], cueOpen }
  let section = null;    // 'topic' | 'part1' | 'part2' | 'part3'
  let skippedPreamble = 0;
  // If the AI wrapped its answer in ``` fences, only what's inside them is
  // data — the chatter around them ("Chúc bạn học tốt!") is dropped.
  const fenced = lines.some(l => /^\s*```/.test(l));
  let inFence = false;
  let skippedOutside = 0;

  lines.forEach((rawLine, i) => {
    const lineNo = i + 1;
    const line = cleanLine(rawLine);
    if (/^```/.test(line)) { inFence = !inFence; return; }
    if (!line) return;
    if (fenced && !inFence) { skippedOutside++; return; }

    if (line.startsWith('#')) {
      const note = line.match(NOTE_RE);
      if (note && note[1]) warnings.push(`${block?.topic ? `Topic "${block.topic}"` : `Dòng ${lineNo}`}: ${note[1]}`);
      return;
    }

    const m = line.match(SECTION_RE);
    if (m) {
      const kind = m[1].toLowerCase().replace(/\s+/g, '');
      if (kind === 'topic') {
        if (block) blocks.push(block);
        block = { line: lineNo, topic: '', group: '', sections: { part1: [], part2: [], part3: [] }, cue: [], cueOpen: false };
        section = 'topic';
      } else {
        if (!block) { errors.push(`Dòng ${lineNo}: "@${kind}" nằm ngoài một khối @topic`); return; }
        section = kind;
      }
      return;
    }

    // Chatty lead-in before the first @topic ("Dưới đây là bộ đề...") —
    // ignored, but counted so the admin can see something was dropped.
    if (!block) { skippedPreamble++; return; }

    if (section === 'topic') {
      const kv = line.match(/^(topic|group)\s*[=:]\s*(.*)$/i);
      if (kv) {
        const key = kv[1].toLowerCase();
        const value = kv[2].trim().replace(/^["']|["']$/g, '');
        if (key === 'topic') block.topic = value;
        else block.group = value;
      } else {
        errors.push(`Dòng ${lineNo}: trong @topic chỉ chấp nhận "topic=..." và "group=..." (nhận được "${line}")`);
      }
      return;
    }

    if (section === 'part2') {
      if (/^cue\s*[=:]/i.test(line)) {
        block.cue.push(line.replace(/^cue\s*[=:]/i, '').trim());
        return;
      }
      // "You should say:" followed by bullets — the AI ignored cue=; every
      // line after it is a cue bullet, as is any line with a list marker.
      // A "Describe ..." line is always the prompt, even if numbered.
      if (CUE_INTRO_RE.test(line)) { block.cueOpen = true; return; }
      if (!/^describe\b/i.test(stripListMarker(line)) && (block.cueOpen || LIST_MARKER_RE.test(line))) {
        block.cue.push(stripListMarker(line));
        return;
      }
    }

    block.sections[section].push({ lineNo, text: stripListMarker(line) });
  });
  if (block) blocks.push(block);
  if (skippedPreamble) warnings.push(`Đã bỏ qua ${skippedPreamble} dòng nằm trước @topic đầu tiên (lời dẫn của AI?)`);
  if (skippedOutside) warnings.push(`Đã bỏ qua ${skippedOutside} dòng nằm ngoài khung \`\`\` (lời dẫn của AI?)`);
  return { blocks, errors, warnings };
}

// Build the "You should say:" cue card text from a `cue=` line. Accepts
// either a bare `|`-separated bullet list or a value that already starts
// with "You should say".
function buildCueCard(cue) {
  const v = String(cue || '').trim();
  if (!v) return '';
  if (/^you should say/i.test(v)) return v.replace(/\r?\n/g, '\n');
  const bullets = v.split('|').map(s => s.trim().replace(/^[-•]\s*/, '')).filter(Boolean);
  if (!bullets.length) return '';
  return 'You should say:\n' + bullets.map(b => '- ' + b).join('\n');
}

// Accept a code ("people"), a number 1–7 (textbook "Nhóm 1".."Nhóm 7"), or
// loose spellings like "Activities/Skills". Returns '' when unrecognized.
function normalizeGroup(raw) {
  const v = String(raw || '').trim().toLowerCase();
  if (!v) return '';
  const n = v.match(/^(?:nhóm|nhom|group)?\s*([1-7])\b/);
  if (n) return SPEAKING_GROUP_CODES[Number(n[1]) - 1];
  const code = v.replace(/[\s/&-]+/g, '_');
  if (SPEAKING_GROUP_CODES.includes(code)) return code;
  return SPEAKING_GROUP_CODES.find(c => code.startsWith(c.split('_')[0])) || '';
}

// Parses + validates. Returns:
//   { valid, errors[], warnings[], topics: [...], questionDocs: [...], counts }
// topics/questionDocs are only populated when valid === true.
function parseSpeakingText(raw) {
  const { blocks, errors, warnings } = tokenize(raw);

  if (blocks.length === 0) errors.push('Không tìm thấy khối @topic nào');

  const topics = [];
  const seenTopics = new Map();

  blocks.forEach((b, bi) => {
    const label = b.topic ? `"${b.topic}"` : `#${bi + 1}`;
    if (!b.topic) {
      errors.push(`Topic #${bi + 1} (dòng ${b.line}): thiếu "topic=..."`);
    } else {
      const key = b.topic.toLowerCase();
      if (seenTopics.has(key)) errors.push(`Topic ${label}: trùng topic (đã xuất hiện ở khối #${seenTopics.get(key)})`);
      else seenTopics.set(key, bi + 1);
    }

    const p1 = b.sections.part1.map(l => l.text);
    const p3 = b.sections.part3.map(l => l.text);
    const p2lines = b.sections.part2.map(l => l.text);

    if (!p1.length && !p2lines.length && !p3.length) {
      errors.push(`Topic ${label}: không có câu hỏi nào (thiếu cả @part1, @part2 và @part3)`);
    }

    let group = '';
    if (b.group) {
      group = normalizeGroup(b.group);
      if (!group) errors.push(`Topic ${label}: group="${b.group}" không hợp lệ — dùng 1 trong: ${SPEAKING_GROUP_CODES.join(', ')}`);
      else if (!p2lines.length && !p3.length) {
        warnings.push(`Topic ${label}: group chỉ áp dụng cho Part 2/3 — bỏ qua với topic chỉ có Part 1`);
        group = '';
      }
    }

    // dup questions within a part — the same loose key the import matches
    // on, so "What's your favourite…" + "What is your favorite…" in one
    // paste is caught here instead of becoming two near-identical questions.
    for (const [part, list] of [['1', p1], ['3', p3]]) {
      const seen = new Set();
      list.forEach(q => {
        const k = normQuestionKey(q);
        if (seen.has(k)) errors.push(`Topic ${label} Part ${part}: câu hỏi trùng ("${q.slice(0, 50)}")`);
        else seen.add(k);
      });
    }

    let part2 = null;
    const cue = b.cue.join(' | ');
    if (p2lines.length) {
      if (p2lines.length > 1) {
        errors.push(`Topic ${label} Part 2: chỉ được 1 dòng câu hỏi (đề bài cue card) — nhận được ${p2lines.length}. Dùng "cue=" cho các gạch đầu dòng.`);
      } else {
        part2 = { question: p2lines[0], cueCard: buildCueCard(cue) };
        if (!part2.cueCard) warnings.push(`Topic ${label} Part 2: chưa có "cue=" (cue card sẽ trống)`);
      }
    } else if (cue) {
      errors.push(`Topic ${label}: có "cue=" nhưng không có câu đề bài @part2`);
    }

    if (p1.length && p1.length < 2) warnings.push(`Topic ${label} Part 1: chỉ có ${p1.length} câu (thường 4–11 câu)`);
    if (p3.length && p3.length < 3) warnings.push(`Topic ${label} Part 3: chỉ có ${p3.length} câu (thường 4–6 câu)`);

    topics.push({ topic: b.topic, group: group || null, part1: p1, part2, part3: p3 });
  });

  const valid = errors.length === 0;

  const questionDocs = [];
  if (valid) {
    for (const t of topics) {
      for (const q of t.part1) questionDocs.push({ topic: t.topic, part: 1, question: q, cueCard: '', group: null });
      if (t.part2) questionDocs.push({ topic: t.topic, part: 2, question: t.part2.question, cueCard: t.part2.cueCard, group: t.group });
      for (const q of t.part3) questionDocs.push({ topic: t.topic, part: 3, question: q, cueCard: '', group: t.group });
    }
  }

  const counts = {
    topics: topics.length,
    part1: topics.reduce((n, t) => n + t.part1.length, 0),
    part2: topics.filter(t => t.part2).length,
    part3: topics.reduce((n, t) => n + t.part3.length, 0),
  };
  counts.total = counts.part1 + counts.part2 + counts.part3;

  return {
    valid,
    errors,
    warnings,
    topics: valid ? topics : [],
    questionDocs,
    counts,
  };
}

// Loose keys used to match an import against what's already in the bank, so
// "What’s your favorite type of shoes?" lands on the existing "What is your
// favourite type of shoes?" instead of becoming a second copy.
function normQuestionKey(s) {
  return String(s || '').toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\((?:why|what|how|why\/why not)[^)]*\)/g, ' ')
    .replace(/\bwhat's\b/g, 'what is').replace(/\bit's\b/g, 'it is')
    .replace(/favourite/g, 'favorite').replace(/colour/g, 'color').replace(/neighbour/g, 'neighbor')
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function normTopicKey(s) {
  return String(s || '').toLowerCase().replace(/\s*\/\s*/g, '/').replace(/[^a-z0-9/' ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = { parseSpeakingText, buildCueCard, normalizeGroup, normQuestionKey, normTopicKey, SPEAKING_GROUP_CODES };
