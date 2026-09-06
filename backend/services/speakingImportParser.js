'use strict';

// ══════════════════════════════════════════════════════
// "EnglishWithDan Speaking Format" parser
//
//   @topic
//   topic=A TV/online programme you enjoy
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
// and exactly one question line (the cue-card prompt).
//
// Flat text an admin pastes straight from ChatGPT/Gemini — no JSON, no
// Markdown. This module never calls an AI API; it only parses text.
// ══════════════════════════════════════════════════════

const SECTION_RE = /^@(topic|part1|part2|part3)\s*$/i;

// Split raw text into @topic blocks, each with per-section raw lines.
function tokenize(raw) {
  const lines = String(raw || '').split(/\r?\n/);
  const errors = [];
  const blocks = [];
  let block = null;      // { line, topic, sections: {part1:[],part2:[],part3:[]}, cue }
  let section = null;    // 'topic' | 'part1' | 'part2' | 'part3'

  lines.forEach((rawLine, i) => {
    const lineNo = i + 1;
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return;

    const m = line.match(SECTION_RE);
    if (m) {
      const kind = m[1].toLowerCase();
      if (kind === 'topic') {
        if (block) blocks.push(block);
        block = { line: lineNo, topic: '', sections: { part1: [], part2: [], part3: [] }, cue: '' };
        section = 'topic';
      } else {
        if (!block) { errors.push(`Dòng ${lineNo}: "@${kind}" nằm ngoài một khối @topic`); return; }
        section = kind;
      }
      return;
    }

    if (!block) { errors.push(`Dòng ${lineNo}: "${line}" nằm ngoài một khối @topic`); return; }

    if (section === 'topic') {
      const eq = line.indexOf('=');
      const key = eq === -1 ? '' : line.slice(0, eq).trim().toLowerCase();
      if (key === 'topic') block.topic = line.slice(eq + 1).trim();
      else errors.push(`Dòng ${lineNo}: trong @topic chỉ chấp nhận "topic=..." (nhận được "${line}")`);
      return;
    }

    if (section === 'part2' && /^cue\s*=/i.test(line)) {
      block.cue = line.replace(/^cue\s*=/i, '').trim();
      return;
    }

    block.sections[section].push({ lineNo, text: line });
  });
  if (block) blocks.push(block);
  return { blocks, errors };
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

// Parses + validates. Returns:
//   { valid, errors[], warnings[], topics: [...], questionDocs: [...], counts }
// topics/questionDocs are only populated when valid === true.
function parseSpeakingText(raw) {
  const { blocks, errors } = tokenize(raw);

  if (blocks.length === 0) errors.push('Không tìm thấy khối @topic nào');

  const warnings = [];
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

    // dup questions within a part
    for (const [part, list] of [['1', p1], ['3', p3]]) {
      const seen = new Set();
      list.forEach(q => {
        const k = q.toLowerCase().replace(/\s+/g, ' ');
        if (seen.has(k)) errors.push(`Topic ${label} Part ${part}: câu hỏi trùng ("${q.slice(0, 50)}")`);
        else seen.add(k);
      });
    }

    let part2 = null;
    if (p2lines.length) {
      if (p2lines.length > 1) {
        errors.push(`Topic ${label} Part 2: chỉ được 1 dòng câu hỏi (đề bài cue card) — nhận được ${p2lines.length}. Dùng "cue=" cho các gạch đầu dòng.`);
      } else {
        part2 = { question: p2lines[0], cueCard: buildCueCard(b.cue) };
        if (!part2.cueCard) warnings.push(`Topic ${label} Part 2: chưa có "cue=" (cue card sẽ trống)`);
      }
    } else if (b.cue) {
      errors.push(`Topic ${label}: có "cue=" nhưng không có câu đề bài @part2`);
    }

    if (p1.length && p1.length < 2) warnings.push(`Topic ${label} Part 1: chỉ có ${p1.length} câu (thường 4–11 câu)`);
    if (p3.length && p3.length < 3) warnings.push(`Topic ${label} Part 3: chỉ có ${p3.length} câu (thường 4–6 câu)`);

    topics.push({ topic: b.topic, part1: p1, part2, part3: p3 });
  });

  const valid = errors.length === 0;

  const questionDocs = [];
  if (valid) {
    for (const t of topics) {
      for (const q of t.part1) questionDocs.push({ topic: t.topic, part: 1, question: q, cueCard: '' });
      if (t.part2) questionDocs.push({ topic: t.topic, part: 2, question: t.part2.question, cueCard: t.part2.cueCard });
      for (const q of t.part3) questionDocs.push({ topic: t.topic, part: 3, question: q, cueCard: '' });
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

module.exports = { parseSpeakingText, buildCueCard };
