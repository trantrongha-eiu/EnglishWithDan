// Copy the Student's Book's MODEL ANSWER and UPGRADE (Band 5 → 6 → 7) boxes
// into each Speaking lesson as `bookModels`, word for word, so the lesson page
// shows the same worked answers as the printed book.
//
//   python backend/scripts/speakingBook/extractDocx.py <book.docx> book.json
//   node backend/scripts/speakingBook/syncBookModels.js book.json [--dry]
//   node backend/scripts/seedCourse.js speaking
//
// Writes data/speakingCourse/lessons*.json only; seedCourse pushes them to the
// DB. Re-run after every new edition of the book.
//
// bookModels[] = { kind: 'model' | 'upgrade', title, question, lines[] }.
// lines keep the book's **bold** marks; frontend/js/speaking-course.js
// (renderBookLines) turns "**BAND 6**", "→ note", "▸ diff", "**FIXED ▸ **text"
// and Vietnamese analysis lines into their own styles.
'use strict';

const fs = require('fs');
const path = require('path');

const src = process.argv[2];
const dry = process.argv.includes('--dry');
if (!src || src.startsWith('--')) {
  console.error('Usage: node scripts/speakingBook/syncBookModels.js <book.json> [--dry]');
  process.exit(1);
}
const DATA_DIR = path.join(__dirname, '..', 'data', 'speakingCourse');
const blocks = JSON.parse(fs.readFileSync(src, 'utf8'));
const unbold = (s) => s.replace(/\*\*/g, '');

// ── 1. Group the book's MODEL / UPGRADE tables by lesson code ──────────
function collect() {
  const byLesson = {};
  let part = 0;
  let cur = null;
  for (const b of blocks) {
    if (b.k === 'p') {
      const t = unbold(b.t).trim();
      if (/^PHẦN I —/.test(t)) part = 1;
      else if (/^PHẦN II —/.test(t)) part = 2;
      else if (/^PHẦN III —/.test(t)) part = 3;
      const m = t.match(/^LESSON (\d+) · /);
      if (m) { cur = `SPK-P${part}-L${m[1].padStart(2, '0')}`; byLesson[cur] = []; continue; }
      // Appendices and part / phase headings end the current lesson.
      if (/^PHỤ LỤC/.test(t) || b.s === '2' || b.s === '3') cur = null;
      continue;
    }
    if (!cur) continue;
    const paras = b.rows.flat(2)
      .map((s) => s.replace(/ /g, ' ').replace(/[ \t]+/g, ' ').trim())
      .filter(Boolean);
    const head = unbold(paras[0] || '').trim();
    if (!/^(MODEL|UPGRADE)/.test(head)) continue;
    byLesson[cur].push(toModel(head, paras.slice(1)));
  }
  // A model box that doesn't restate its cue card (Part 2 L02) answers the
  // same cue card as that lesson's UPGRADE box.
  for (const [code, models] of Object.entries(byLesson)) {
    const up = models.find((m) => m.kind === 'upgrade' && m.question);
    for (const m of models) {
      if (m.question || !up) continue;
      m.question = up.question;
      console.log(`  (${code}: "${m.title}" dùng câu hỏi của khung UPGRADE)`);
    }
  }
  return byLesson;
}

// "**Question: Do you like cooking?**", "**Cue card / Question:** Describe…",
// "**Cue card: Describe…**", or a bare bold question (Part 3 models).
function splitQuestion(lines) {
  const first = lines[0] || '';
  const m = unbold(first).match(/^(?:Cue card(?: \/ Question)?|Question):\s*(.+)$/);
  if (m) return { question: m[1].trim(), rest: lines.slice(1) };
  if (/^\*\*[^*]+\?\*\*$/.test(first)) return { question: unbold(first).trim(), rest: lines.slice(1) };
  return { question: '', rest: lines };
}

function cleanLines(lines) {
  const out = [];
  for (let l of lines) {
    // Part 2 L02: the keyword list wraps over two bold paragraphs.
    if (out.length && /^(\*\*)?Ghi chú gốc/.test(out[out.length - 1]) && /^\*\*[^*]*\*\*$/.test(l)) {
      out[out.length - 1] = unbold(out[out.length - 1] + ' ' + l).replace(/\s+/g, ' ');
      continue;
    }
    if (/^\*\*Ghi chú gốc/.test(l)) l = unbold(l).replace(/\s+/g, ' ');
    // Two labelled samples in one paragraph ("**Mở đầu — Band 6:** … **Mở đầu — Band 7:** …").
    for (const part of l.split(/ (?=\*\*[^*]{3,40}:\*\*)/)) out.push(part.trim());
  }
  return out.filter(Boolean);
}

function toModel(head, lines) {
  const { question, rest } = splitQuestion(lines);
  return {
    kind: /^UPGRADE/.test(head) ? 'upgrade' : 'model',
    title: head.replace(/\s+CORE$/, '').trim(),
    question,
    lines: cleanLines(rest),
  };
}

// ── 2. Write them into lessons*.json ───────────────────────────────────
function main() {
  const byLesson = collect();
  const files = fs.readdirSync(DATA_DIR).filter((f) => /^lessons.*\.json$/.test(f)).sort();
  let total = 0;
  for (const f of files) {
    const file = path.join(DATA_DIR, f);
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const l of j.lessons || []) {
      const models = byLesson[l.code] || [];
      total += models.length;
      console.log(`  ${l.code}: ${models.map((m) => m.kind).join(' + ') || '—'}`);
      // Keep key order stable: bookModels sits right after keyLanguage.
      const next = {};
      for (const [k, v] of Object.entries(l)) {
        if (k === 'bookModels') continue;
        next[k] = v;
        if (k === 'keyLanguage') next.bookModels = models;
      }
      if (!('bookModels' in next)) next.bookModels = models;
      Object.keys(l).forEach((k) => delete l[k]);
      Object.assign(l, next);
    }
    if (!dry) fs.writeFileSync(file, JSON.stringify(j, null, 2) + '\n');
  }
  const missing = Object.keys(byLesson).filter((c) => !files.some((f) =>
    (JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')).lessons || []).some((l) => l.code === c)));
  if (missing.length) console.warn('  ⚠ lesson trong sách không có trên web:', missing.join(', '));
  console.log(`\n${total} khung mẫu → ${files.join(', ')}${dry ? ' (dry run — chưa ghi)' : ''}`);
}

main();
