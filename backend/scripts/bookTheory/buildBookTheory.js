// Turn the theory pages of the two printed books into lesson theory cards
// ("📘 Lý thuyết" on the lesson page), word for word and in the book's order:
//
//   Writing book  writing/IELTS_Writing_EnglishWithDan_Ban_Hoc_Vien*.docx (2026-11
//                 edition, student copy; the old task 1 grammar/AcademicWritingFull_
//                 DanielHa.docx still parses too — see normalizeEdition)
//                 → Task 1 course (Buổi 1–22 + Mở rộng Layout + Phụ lục A–B, D) and
//                   Task 2 course (Phần A, 7 dạng đề, Phần C, lỗi + checklist)
//   Speaking book speaking/IELTS_Speaking_StudentsBook_DanielHa_v2.docx
//                 → Speaking course Part 1 / 2 / 3 (45 lessons)
//   Noun Phrase   task 2 writing/Noun_Phrase_IELTS_Task_1_Task_2_Teaching_Material.docx
//                 → "Phụ lục Noun Phrase" lessons T1-L09B–D and T2-L19–21
//
//   py backend/scripts/speakingBook/extractDocx.py "task 1 grammar/AcademicWritingFull_DanielHa.docx" wbook.json --images
//   py backend/scripts/speakingBook/extractDocx.py speaking/IELTS_Speaking_StudentsBook_DanielHa_v2.docx sbook.json --images
//   py backend/scripts/speakingBook/extractDocx.py "task 2 writing/Noun_Phrase_IELTS_Task_1_Task_2_Teaching_Material.docx" npbook.json --images
//   node backend/scripts/bookTheory/buildBookTheory.js --writing wbook.json --nounphrase npbook.json --speaking sbook.json [--dry]
//     (pictures: add --missing need.json, then node backend/scripts/bookTheory/uploadBookImages.js <book.docx> need.json, re-run)
//   node backend/scripts/seedCourse.js t1 && node backend/scripts/seedCourse.js t2 && node backend/scripts/seedCourse.js speaking
//
// Only the book's teaching pages become cards (input, language, structures,
// tips, warnings, worked analyses, sample essays). PRACTICE / HOMEWORK /
// exercises / tests are skipped — they are the lessons' exercises already.
// Generated cards carry src:'book' so a re-run replaces just them; hand-written
// cards (Task 2 Phần C) are kept and only get the book's missing examples and
// "Dùng ở đâu trong bài" note merged in.
//
// Card = { src:'book', title, titleEn, blocks[] } — blocks keep the book order:
//   {k:'h', t}                         sub-heading
//   {k:'p', lines[]}                   paragraphs; "• " list item, "▸ " example,
//                                      "→ " translation/comment, ✔ / ✘ lines
//   {k:'box', tone, t, lines[]}        the book's coloured boxes; tone =
//                                      formula | tip | warn | note | goal | task
//   {k:'table', rows[[cell]]}          first row = header; "\n" inside a cell
//   {k:'img', url, caption}            chart / map / diagram (bookImages.json)
// Rendered by renderTheory() in frontend/js/shared/course-engine.js.
'use strict';

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const dry = args.includes('--dry');
const DATA = path.join(__dirname, '..', 'data');
const IMAGES = path.join(__dirname, 'bookImages.json'); // media/imageN.png → R2 url
const imageUrls = fs.existsSync(IMAGES) ? JSON.parse(fs.readFileSync(IMAGES, 'utf8')) : {};
const missingImages = new Set(); // media/… names still without an R2 url

// ── text helpers ─────────────────────────────────────────────────────
const unbold = (s) => String(s || '').replace(/\*\*/g, '');
// The extractor wraps each bold run in **…**; runs often carry their own
// spaces ("**O **— Opinion", "**▸ **The number…"). Re-split on ** so spaces
// move outside the bold, and bold that is only symbols/punctuation is dropped.
function clean(s) {
  const parts = String(s || '').replace(/ /g, ' ').replace(/\t/g, ' ').split('**');
  if (parts.length % 2 === 0) parts.push(''); // unbalanced → treat the tail as plain
  let t = '';
  parts.forEach((seg, i) => {
    if (i % 2 === 0) { t += seg; return; }
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(seg);
    const core = m[2];
    if (!core || /^[\s▸•→✔✘❌✅☐⚠️①②③④⑤⑥⑦⑧⑨\-–—·:.,;()[\]/'"“”‘’]*$/u.test(core)) t += seg;
    else t += m[1] + '**' + core + '**' + m[3];
  });
  return t.replace(/\*\*\*\*/g, '').replace(/[ ]{2,}/g, ' ').trim();
}
const isBlankLine = (t) => !unbold(t).trim() || /_{5,}|\.{8,}|…{3,}|^(→|O:|R:.*|E:.*|Câu hỏi.*:)\s*$/.test(unbold(t).trim());
const hasVi = (s) => /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹáàãéèíìóòõúùýđ]/i.test(s);

function toneOf(title) {
  const T = unbold(title).trim().toUpperCase();
  // the book's own box icon wins over the words in the title
  const icon = { '🎯': 'goal', '⚠': 'warn', '🧩': 'formula', '💡': 'tip', '📌': 'note' }[[...T][0]];
  if (icon) return icon;
  if (/MỤC TIÊU|TARGET OUTPUT/.test(T)) return 'goal';
  if (/^⚠|LỖI|CẤM|MISTAKE|ĐỪNG|\bSAI\b|TỤT|BỊ CẤM/.test(T)) return 'warn';
  if (/^🧩|CÔNG THỨC|CẤU TRÚC|^KHUNG|TEMPLATE|^BAND \d|GRAMMAR|^INTRO\b|^MỖI BODY|DÀN Ý|TARGET LANGUAGE|^BODY \d|ĐỀ THƯỜNG CÓ DẠNG/.test(T)) return 'formula';
  if (/^💡|MẸO|TIP|KỸ THUẬT|PRONUNCIATION|GỢI Ý|VAN THOÁT|QUY TẮC|CÂU GIỜ/.test(T)) return 'tip';
  return 'note';
}

// A paragraph block → one line ("• " for the book's bullet list style).
function paraLine(b) {
  const t = clean(b.t);
  if (!t || isBlankLine(t)) return null;
  return b.s === '18' && !/^[•▸→✔✘❌✅☐①-⑨]/u.test(unbold(t)) ? '• ' + t : t;
}

// A one-cell table = one of the book's boxes. Its first paragraph is the title
// when it is bold / starts with an emoji / is upper case.
// Every row a single cell (title row + body row in the Speaking book).
const isBox = (b) => b.rows.length > 0 && b.rows.every((r) => r.length === 1);
const boxParas = (b) => b.rows.flatMap((r) => r[0] || []);
function boxOf(b) {
  const paras = boxParas(b).map(clean).filter((t) => t && !isBlankLine(t));
  if (!paras.length) return null;
  const head = paras[0];
  const plain = unbold(head).trim();
  const titled = paras.length > 1 && (/^\*\*[^*]+\*\*:?$/.test(head) || /^\p{Extended_Pictographic}/u.test(plain) || (plain === plain.toUpperCase() && /[A-ZĐ]/.test(plain)));
  if (!titled) return { k: 'box', tone: 'task', t: '', lines: paras };
  const t = plain.replace(/\s{2,}(CORE|TUỲ CHỌN.*|VỀ NHÀ.*)$/, '').replace(/^(\p{Extended_Pictographic}️?)\s+/u, '$1 ').trim();
  return { k: 'box', tone: toneOf(t), t, lines: paras.slice(1) };
}

function tableOf(b) {
  const rows = b.rows
    .map((r) => r.map((cell) => cell.map(clean).filter((t) => t && !isBlankLine(t)).join('\n')))
    .filter((r) => r.some(Boolean));
  if (rows.length < 2 && (!rows[0] || rows[0].filter(Boolean).length < 2)) return null;
  // worksheet tables (every row but the header has only its label filled) are kept:
  // they are the book's checklists / phiếu chấm.
  return { k: 'table', rows };
}

function imgOf(b) {
  const url = imageUrls[b.name];
  if (!url) { missingImages.add(b.name); return null; }
  return { k: 'img', url, caption: b.caption || '' };
}

// A centred paragraph right under a picture is its caption (extractDocx 'c').
function attachCaptions(blocks) {
  const out = [];
  for (const b of blocks) {
    const prev = out[out.length - 1];
    if (b.k === 'p' && b.c && prev && prev.k === 'img' && !prev.caption && !/^[1-6]$/.test(b.s)) { prev.caption = clean(b.t); continue; }
    out.push(b);
  }
  return out;
}

// Card builder: merges consecutive paragraphs into one 'p' block.
function makeCards() {
  const cards = [];
  let cur = null;
  return {
    cards,
    get cur() { return cur; },
    start(title, titleEn) { cur = { src: 'book', title: clean(unbold(title)), titleEn: titleEn || '', blocks: [] }; cards.push(cur); return cur; },
    stop() { cur = null; },
    add(block) {
      if (!cur || !block) return;
      const last = cur.blocks[cur.blocks.length - 1];
      if (block.k === 'p' && last && last.k === 'p') last.lines.push(...block.lines);
      else cur.blocks.push(block);
    },
  };
}
const finish = (cards) => cards.filter((c) => c.blocks.length);

// ═════════════════════ WRITING BOOK: NEW EDITION → LEVELS ════════════
// The 2026-11 edition (writing/IELTS_Writing_EnglishWithDan_Ban_Hoc_Vien.docx)
// has no numbered heading styles any more: every heading is "Heading2" and
// sub-headings / bullets are plain paragraphs (fully bold / "● …"). Give them
// back the old book's levels so one parser reads both editions:
//   Task 1  '2' Layout appendix · '3' tests / appendices / other headings ·
//           '4' "N.N." sections (+ Layout "I. …") · '5' bold sub-heading ·
//           '18' bullet
//   Task 2  '2' PHẦN / TYPE / Phần C long headings · '3' A1… / Nhận diện đề /
//           01. … / Lỗi N · '4' bold sub-heading
// "● x" / "**●** x" / "**● x**" → "x" with the bold kept balanced
const dropBullet = (t) => String(t).replace(/^\s*\*\*●\s*\*\*\s*/, '').replace(/^\s*(\*\*)?●\s*/, '$1');
const fullyBold = (t) => /^\*\*[^*]+\*\*:?$/.test(String(t || '').trim());
function normalizeEdition(blocks) {
  if (!blocks.some((b) => b.k === 'p' && b.s === 'Heading2')) return blocks; // old edition
  let task2 = false;
  let layout = false;
  return blocks.map((b) => {
    if (b.k !== 'p') return b;
    const t = unbold(b.t).trim();
    if (b.s === 'Heading2' && /^CÁCH DÙNG SÁCH NÀY$/.test(t)) task2 = true;
    let s = b.s;
    let text = b.t;
    if (!task2) {
      if (b.s === 'Heading2') {
        layout = /DẠNG LAYOUT/.test(t);
        s = layout ? '2' : /^(\d+|D)\.\d+\.\s/.test(t) ? '4' : '3';
      } else if (/^●\s*/.test(t)) {
        s = '18';
        text = dropBullet(b.t);
      } else if (fullyBold(b.t) && t.length < 140 && !/^[▸→]/.test(t)) {
        if (/^Phần 2 — Dịch câu$/i.test(t)) s = '3';
        else if (/^[AB]\.\d+\.\s/.test(t)) s = '4'; // Phụ lục A.1… / B.1…
        else s = layout && /^(I|II|III|IV)\.\s/.test(t) ? '3' : '5';
      }
    } else if (b.s === 'Heading2') {
      s = /^(PHẦN [ABC] —|TYPE 0\d|BẢNG TRA NHANH|BA LỖI NGỮ PHÁP|CHECKLIST BA PHÚT|CÁCH DÙNG SÁCH NÀY|MỤC LỤC|BẢNG TỰ ĐÁNH GIÁ)/.test(t)
        || (/^\d\d\.\s+\S.* – /.test(t) && t === t.toUpperCase()) ? '2' : '3';
    } else if (/^●\s*/.test(t)) {
      s = '18';
      text = dropBullet(b.t);
    } else if (fullyBold(b.t) && t.length < 100 && !/^[▸→]/.test(t)) s = '4';
    return s === b.s && text === b.t ? b : { ...b, s, t: text };
  });
}

// ═════════════════════ WRITING BOOK: TASK 1 ══════════════════════════
const T1_SKIP = /PRACTICE|HOMEWORK|Bài tập|Exercise \d|REVIEW|THỰC HÀNH|Luyện tập trên lớp|^[①②③④]/i;
const T1_SKIP_SUB = /Bài tập|PRACTICE|HOMEWORK|Viết câu mô tả/i;

function parseTask1(blocks) {
  const out = {};
  let lesson = null;
  let skip = false; // inside an excluded section / sub-section
  let C = makeCards();
  const open = (code) => { lesson = code; C = makeCards(); out[code] = C; skip = false; };
  const section = (title) => {
    if (T1_SKIP.test(unbold(title))) { skip = true; C.stop(); return; }
    skip = false; C.start(title);
  };

  for (const b of blocks) {
    if (b.k === 'tbl') {
      const first = unbold((b.rows[0] && b.rows[0][0] || [])[0] || '').trim();
      const m = /^BUỔI (\d+)$/.exec(first);
      if (m) { open('T1-L' + m[1].padStart(2, '0')); continue; }
      if (isBox(b) && /^(MODULE|M O D U L E|P H Ụ\s+L Ụ C)\s+\S/.test(first)) { lesson = null; continue; }
      if (/^🎯\s*Mục tiêu buổi học/.test(first)) continue; // = lesson.objectives
    }
    if (b.k === 'p') {
      const t = unbold(b.t).trim();
      if (b.s === '2' || b.s === '3') {
        if (b.s === '2' && /DẠNG LAYOUT/.test(t)) { open('T1-L18B'); continue; }
        if (/^PHẦN 2 — DỊCH CÂU/i.test(t)) { skip = true; C.stop(); continue; }
        if (lesson === 'T1-L18B' && b.s === '3' && !/BÀI KIỂM TRA/.test(t)) { section(b.t.replace(/\s*\(\d+ phút\)/, '')); continue; }
        // New edition appendices: A (cheat sheet) + B (40 khung câu) = one
        // reference lesson; D (paraphrase chủ thể, tự học) = two lessons.
        // C is a paper progress tracker — the site tracks progress itself.
        if (/^PHỤ LỤC [AB] —/.test(t)) { if (lesson !== 'T1-PLAB') open('T1-PLAB'); C.start(b.t); continue; }
        if (/^NỘI DUNG PHỤ LỤC D/.test(t)) { open('T1-PLD1'); skip = true; continue; }
        if (lesson === 'T1-PLD1' && /^Vì sao phải học/.test(t)) { section(b.t); continue; }
        if (lesson === 'T1-PLD1' && /^PHẦN 1 —/.test(t)) { skip = true; C.stop(); continue; }
        if (/^PHẦN 2 — Paraphrase chủ thể/.test(t)) { open('T1-PLD2'); skip = true; continue; }
        lesson = null; continue;
      }
      if (!lesson) continue;
      if (b.s === '4') { section(b.t); continue; }
      if (b.s === '5') {
        if (!C.cur && !skip) continue;
        if (T1_SKIP_SUB.test(t)) { skip = true; continue; }
        if (C.cur) { skip = false; C.add({ k: 'h', t: clean(b.t) }); }
        continue;
      }
    }
    if (!lesson || skip || !C.cur) continue;
    if (b.k === 'p') { const l = paraLine(b); if (l) C.add({ k: 'p', lines: [l] }); }
    else if (b.k === 'img') C.add(imgOf(b));
    else if (b.k === 'tbl') C.add(isBox(b) ? boxOf(b) : tableOf(b));
  }
  const res = {};
  for (const [code, c] of Object.entries(out)) res[code] = finish(c.cards);
  return res;
}

// ═════════════════════ WRITING BOOK: TASK 2 ══════════════════════════
// Web lessons vs book: L01 = A1 + A2 · L02 = A3 (9 chức năng) · L03 = "Ba chức
// năng quyết định band" · L04 = A4 + Phần B overview · L05–L11 = TYPE 01–07 ·
// L12–L17 = Phần C 01–12 (merged into the hand-written cards) · L18 = bảng tra
// nhanh + 3 lỗi + checklist.
function parseTask2(blocks) {
  const start = blocks.findIndex((b) => b.k === 'p' && b.s === '2' && /^PHẦN A — NỀN TẢNG/.test(unbold(b.t)));
  const out = {};
  const phanC = {}; // '01'..'12' → { examples[[en, vi]], where }
  let lesson = null;
  let C = null;
  let mode = null; // 'A' | 'B' | 'TYPE' | 'C' | 'CEND' | null
  let cNum = null;
  const cardsOf = (code) => (out[code] = out[code] || makeCards());
  const startCard = (code, title) => { lesson = code; C = cardsOf(code); C.start(title); };

  for (let i = start; i < blocks.length; i++) {
    const b = blocks[i];
    const t = b.k === 'p' ? unbold(b.t).trim() : '';
    if (b.k === 'p' && b.s === '2') {
      cNum = null;
      if (/^PHẦN A/.test(t)) { mode = 'A'; lesson = null; C = null; continue; }
      if (/^PHẦN B/.test(t)) { mode = 'B'; startCard('T2-L04', 'Phần B — Bảy dạng đề, hai tầng template'); continue; }
      const ty = /^TYPE 0(\d) — (.+)$/.exec(t);
      if (ty) { mode = 'TYPE'; lesson = 'T2-L' + String(4 + Number(ty[1])).padStart(2, '0'); C = cardsOf(lesson); C.stop(); continue; }
      if (/^PHẦN C/.test(t)) { mode = 'C'; startCard('T2-L12', 'Phần C — Ngữ pháp nâng band: nguyên tắc vàng'); continue; }
      if (/^BẢNG TRA NHANH/.test(t)) { mode = 'CEND'; startCard('T2-L18', t); continue; }
      if (/^BA LỖI NGỮ PHÁP|^CHECKLIST BA PHÚT/.test(t)) { mode = 'CEND'; startCard('T2-L18', t); continue; }
      if (/^\d\d\.\s/.test(t)) { mode = 'CPRACTICE'; lesson = null; C = null; continue; } // translation practice
      mode = null; lesson = null; C = null; continue;
    }
    if (b.k === 'p' && b.s === '3') {
      if (mode === 'A') {
        const code = /^A1|^A2/.test(t) ? 'T2-L01' : /^A3/.test(t) ? 'T2-L02' : /^A4/.test(t) ? 'T2-L04' : null;
        if (code) { startCard(code, b.t); continue; }
      }
      if (mode === 'TYPE') { C.start(b.t); continue; }
      if (mode === 'C') { const m = /^(\d\d)\.\s/.exec(t); if (m) { cNum = m[1]; phanC[cNum] = { examples: [], where: [] }; C.stop(); continue; } }
      if (mode === 'CEND' && C) { C.add({ k: 'h', t: clean(b.t) }); continue; }
    }
    if (b.k === 'p' && b.s === '4') {
      if (mode === 'A' && /^Ba chức năng quyết định band/.test(t)) { startCard('T2-L03', b.t); continue; }
      if (C && C.cur) { C.add({ k: 'h', t: clean(b.t) }); continue; }
    }
    // Phần C short sections → examples + "Dùng ở đâu" for the hand-written cards.
    if (mode === 'C' && cNum) {
      if (b.k === 'p') {
        const line = clean(b.t);
        if (b.s === '' && /^→/.test(unbold(line))) { const ex = phanC[cNum].examples; if (ex.length) ex[ex.length - 1][1] = unbold(line).replace(/^→\s*/, ''); }
        else if (b.s === '' && !hasVi(unbold(line)) && unbold(line).split(' ').length > 6) phanC[cNum].examples.push([line, '']);
      } else if (b.k === 'tbl') {
        const box = boxOf(b);
        if (box && /DÙNG Ở ĐÂU/i.test(box.t)) phanC[cNum].where.push(...box.lines);
      }
      continue;
    }
    // New edition: "PHẦN III · BÀI TẬP LUYỆN DỊCH" cover box ends the theory
    // (the translation sentences are the Phần C lessons' exercises).
    if (b.k === 'tbl' && /^PHẦN III\b/.test(unbold((b.rows[0] && b.rows[0][0] || [])[0] || '').trim())) { mode = null; lesson = null; C = null; continue; }
    if (!C || !C.cur) continue;
    // The English subtitle right under a heading ("The four marking criteria").
    if (b.k === 'p' && b.s === '' && !C.cur.blocks.length && !C.cur.titleEn && !hasVi(t) && t.length < 90) { C.cur.titleEn = t; continue; }
    if (b.k === 'p') {
      const l = paraLine(b);
      if (!l) continue;
      if (/^(I|II|III|IV|V)\. [A-Z]/.test(unbold(l))) C.add({ k: 'h', t: l });
      else C.add({ k: 'p', lines: [l] });
    } else if (b.k === 'img') C.add(imgOf(b));
    else if (b.k === 'tbl') C.add(isBox(b) ? boxOf(b) : tableOf(b));
  }
  const res = {};
  for (const [code, c] of Object.entries(out)) res[code] = finish(c.cards);
  return { cards: res, phanC };
}

// ═════════════════════ SPEAKING BOOK ═════════════════════════════════
const SPK_SKIP_BOX = /^(PRACTICE|SPEAKING TASK|UPGRADE|MY OWN VERSION|EXIT TICKET|HOMEWORK|MINI-DRILL|MODEL)/;
const SPK_OWN_CARD = /^(GRAMMAR FOCUS|PRONUNCIATION FOCUS)/;
const MOCK = { 1: 'SPK-P1-L14', 2: 'SPK-P2-L15', 3: 'SPK-P3-L16' };

function goalCard(C, b) {
  // MỤC TIÊU BUỔI HỌC box: the ☐ goals are lesson.objectives already; keep
  // Target language / Target output / Lỗi thường gặp cần tránh + the ⚠ line.
  const paras = boxParas(b).map(clean).filter(Boolean);
  const groups = [];
  let g = null;
  for (const p of paras) {
    const u = unbold(p).trim();
    if (/^(Target language|Target output|Lỗi thường gặp cần tránh)$/i.test(u)) { g = { k: 'box', tone: toneOf(u), t: u, lines: [] }; groups.push(g); continue; }
    if (/^⚠/.test(u)) { groups.push({ k: 'box', tone: 'warn', t: '', lines: [p] }); g = null; continue; }
    if (g) g.lines.push(p);
  }
  if (!groups.length) return;
  C.start('Ngôn ngữ đích & lỗi cần tránh', 'Target language · Target output · Common mistakes');
  groups.forEach((x) => C.add(x));
}

function parseSpeaking(blocks) {
  const out = {};
  let part = 0;
  let lesson = null;
  let C = null;
  let skip = false; // after a skipped box, until the next heading / kept box
  let pendingPhase = null; // phase intro card, given to the phase's first lesson
  const cardsOf = (code) => (out[code] = out[code] || makeCards());

  for (const b of blocks) {
    const t = b.k === 'p' ? unbold(b.t).trim() : '';
    if (b.k === 'p' && /^[1-4]$/.test(b.s)) {
      if (/^PHẦN I —/.test(t)) part = 1;
      else if (/^PHẦN II —/.test(t)) part = 2;
      else if (/^PHẦN III —/.test(t)) part = 3;
      skip = false;
      if (b.s === '3' && /^PHASE/.test(t)) { pendingPhase = makeCards(); pendingPhase.start(t); lesson = null; C = pendingPhase; continue; }
      const m = /^LESSON (\d+) · (.+)$/.exec(t);
      if (m) {
        lesson = `SPK-P${part}-L${m[1].padStart(2, '0')}`;
        C = cardsOf(lesson); C.stop();
        if (pendingPhase && pendingPhase.cards.length && pendingPhase.cards[0].blocks.length) C.cards.push(...pendingPhase.cards);
        pendingPhase = null;
        continue;
      }
      const ap = /^PHỤ LỤC (\d) — (.+)$/.exec(t);
      if (ap && part && !/Lời kết/i.test(t)) { lesson = MOCK[part]; C = cardsOf(lesson); C.start(t); continue; }
      lesson = null; C = null; pendingPhase = null; continue;
    }
    if (!C) continue;
    if (b.k === 'p' && b.s === '5') {
      skip = false;
      if (!lesson) continue;
      if (/^C\. SPEAKING|MOCK TEST/.test(t)) { C.stop(); skip = /MOCK TEST/.test(t); continue; }
      C.start(t.replace(/\s{2,}(CORE|TUỲ CHỌN.*|VỀ NHÀ.*)$/, ''));
      continue;
    }
    if (b.k === 'tbl') {
      const first = unbold((b.rows[0] && b.rows[0][0] || [])[0] || '').trim();
      const single = isBox(b);
      if (single && /^MỤC TIÊU BUỔI HỌC/.test(first)) { goalCard(C, b); C.stop(); continue; }
      if (single && SPK_SKIP_BOX.test(first)) { skip = true; continue; }
      if (single && SPK_OWN_CARD.test(first)) {
        skip = false;
        const box = boxOf(b);
        if (!box) continue;
        const [topic, ...rest] = box.lines;
        const card = C.start((/^GRAMMAR/.test(first) ? 'Ngữ pháp: ' : 'Phát âm: ') + unbold(topic || ''), /^GRAMMAR/.test(first) ? 'Grammar focus' : 'Pronunciation focus');
        card.blocks.push({ k: 'p', lines: rest });
        C.stop();
        continue;
      }
      if (single) {
        const box = boxOf(b);
        if (!box) continue;
        if (box.t) { skip = false; if (!C.cur) C.start(box.t); }
        if (skip || !C.cur) continue;
        C.add(box);
        continue;
      }
      if (skip || !C.cur) continue;
      C.add(tableOf(b));
      continue;
    }
    if (skip || !C.cur) continue;
    if (b.k === 'p') { const l = paraLine(b); if (l) C.add({ k: 'p', lines: [l] }); }
    else if (b.k === 'img') C.add(imgOf(b));
  }
  const res = {};
  for (const [code, c] of Object.entries(out)) res[code] = finish(c.cards);
  return res;
}

// ═════════════════════ NOUN PHRASE BOOK ══════════════════════════════
// task 2 writing/Noun_Phrase_IELTS_Task_1_Task_2_Teaching_Material.docx feeds
// the "Phụ lục Noun Phrase" lessons of both writing courses. Its headings use
// named styles (Heading1 = PHẦN, Heading2 = numbered section). PRACTICE
// sections are the lessons' exercises; only the teaching sections map here.
const NP_MAP = {
  'KEY MINDSET': 'T2-L19', 'I.1': 'T2-L19', 'I.2': 'T2-L19', 'I.3': 'T2-L19', 'I.4': 'T2-L19',
  'II.1': 'T2-L20', 'II.2': 'T2-L20', 'II.4': 'T2-L20',
  'II.3': 'T2-L21', 'II.5': 'T2-L21', 'II.6': 'T2-L21', 'II.7': 'T2-L21', 'VI.Task 2': 'T2-L21', 'VII': ['T2-L21', 'T1-L09D'],
  'III.1': 'T1-L09B', 'III.2': 'T1-L09B', 'VI.Task 1': ['T1-L09B', 'T1-L09D'],
  'III.3': 'T1-L09C', 'III.4': 'T1-L09C', 'III.5': 'T1-L09C', 'III.6': 'T1-L09C', 'III.7': 'T1-L09C',
  'III.8': 'T1-L09D',
};
function parseNounPhrase(blocks) {
  const sections = []; // { key, title, blocks[] }
  let part = '';
  let cur = null;
  for (const b of blocks) {
    const t = b.k === 'p' ? unbold(b.t).trim() : '';
    if (b.k === 'p' && b.s === 'Heading1') {
      const m = /^PHẦN ([IVX]+) —/.exec(t);
      part = m ? m[1] : t;
      cur = NP_MAP[part] || NP_MAP[t] ? { key: m ? part : t, title: b.t, blocks: [] } : null;
      if (cur) sections.push(cur);
      continue;
    }
    if (b.k === 'p' && b.s === 'Heading2') {
      const n = /^(\d+)\./.exec(t);
      const key = part + '.' + (n ? n[1] : t.replace(/\s+—.*$/, ''));
      cur = NP_MAP[key] ? { key, title: b.t, blocks: [] } : (NP_MAP[part] ? cur : null);
      if (cur && cur.key === key) sections.push(cur);
      continue;
    }
    if (!cur) continue;
    if (b.k === 'p') {
      if (/^Heading\d/.test(b.s)) { cur.blocks.push({ k: 'h', t: clean(b.t) }); continue; }
      const l = clean(b.t);
      if (!l || isBlankLine(l)) continue;
      const line = b.s === 'ListBullet' ? '• ' + l : l;
      const last = cur.blocks[cur.blocks.length - 1];
      if (last && last.k === 'p') last.lines.push(line); else cur.blocks.push({ k: 'p', lines: [line] });
    } else if (b.k === 'tbl') {
      const blk = isBox(b) ? boxOf(b) : tableOf(b);
      if (blk) cur.blocks.push(blk);
    } else if (b.k === 'img') { const im = imgOf(b); if (im) cur.blocks.push(im); }
  }
  const out = {};
  for (const s of sections) {
    if (!s.blocks.length) continue;
    for (const code of [].concat(NP_MAP[s.key])) {
      (out[code] = out[code] || []).push({ src: 'book', title: clean(unbold(s.title)), titleEn: '', blocks: s.blocks });
    }
  }
  return out;
}

// ═════════════════════ write lessons*.json ═══════════════════════════
function lessonFiles(dir) {
  return fs.readdirSync(path.join(DATA, dir)).filter((f) => /^lessons.*\.json$/.test(f)).map((f) => path.join(DATA, dir, f));
}

// Hand-written Phần C cards (T2-L12..L17, 2 each, book order 01..12): add the
// book's examples they lack + its "Dùng ở đâu trong bài" line.
function mergePhanC(lesson, phanC) {
  const n = Number(lesson.code.slice(-2)) - 12; // L12 → 0
  if (n < 0 || n > 5) return;
  const hand = (lesson.theory || []).filter((c) => c.src !== 'book');
  hand.forEach((card, k) => {
    const src = phanC[String(n * 2 + k + 1).padStart(2, '0')];
    if (!src) return;
    const have = new Set((card.examples || []).map((e) => unbold(e.en).toLowerCase().replace(/\W+/g, '')));
    for (const [en, vi] of src.examples) {
      if (!have.has(unbold(en).toLowerCase().replace(/\W+/g, ''))) (card.examples = card.examples || []).push({ en, vi });
    }
    const where = src.where.map((w) => '📍 Dùng ở đâu trong bài (sách): ' + w);
    card.usage = [...where, ...(card.usage || []).filter((u) => !/^📍 Dùng ở đâu trong bài/.test(u))];
  });
}

const dumpAll = {};
function apply(dir, cardsByLesson, { phanC } = {}) {
  Object.assign(dumpAll, cardsByLesson);
  const stats = [];
  const seen = new Set();
  for (const file of lessonFiles(dir)) {
    const raw = fs.readFileSync(file, 'utf8');
    const json = JSON.parse(raw);
    let changed = false;
    for (const l of json.lessons || []) {
      const book = cardsByLesson[l.code];
      if (phanC) mergePhanC(l, phanC);
      if (!book && !phanC) continue;
      const hand = (l.theory || []).filter((c) => c.src !== 'book');
      l.theory = [...(book || []), ...hand];
      if (!l.theory.length) delete l.theory;
      changed = true;
      if (book) { seen.add(l.code); stats.push(`${l.code}: ${book.length} thẻ, ${book.reduce((s, c) => s + c.blocks.length, 0)} khối${hand.length ? ` (+${hand.length} thẻ viết tay)` : ''}`); }
    }
    // Same layout as the hand-kept files (2-space indent, their own EOL) so
    // a re-run only diffs the theory.
    const eol = raw.includes('\r\n') ? '\r\n' : '\n';
    const next = (JSON.stringify(json, null, 2) + '\n').replace(/\n/g, eol);
    if (changed && !dry && next !== raw) fs.writeFileSync(file, next);
  }
  const orphan = Object.keys(cardsByLesson).filter((c) => !seen.has(c));
  return { stats, orphan };
}

function report(label, r) {
  console.log(`\n== ${label}`);
  r.stats.forEach((s) => console.log('  ' + s));
  if (r.orphan.length) console.log('  ⚠ sách có nhưng web không có buổi: ' + r.orphan.join(', '));
}

const wPath = opt('--writing');
const sPath = opt('--speaking');
if (!wPath && !sPath) {
  console.error('Usage: node scripts/bookTheory/buildBookTheory.js --writing wbook.json [--nounphrase npbook.json] --speaking sbook.json [--dry]');
  process.exit(1);
}
if (wPath) {
  const wb = attachCaptions(normalizeEdition(JSON.parse(fs.readFileSync(wPath, 'utf8'))));
  const np = opt('--nounphrase') ? parseNounPhrase(attachCaptions(JSON.parse(fs.readFileSync(opt('--nounphrase'), 'utf8')))) : {};
  const pick = (re) => Object.fromEntries(Object.entries(np).filter(([c]) => re.test(c)));
  report('Task 1 (writingTask1)', apply('writingTask1', { ...parseTask1(wb), ...pick(/^T1-/) }));
  const t2 = parseTask2(wb);
  report('Task 2 (writingTask2)', apply('writingTask2', { ...t2.cards, ...pick(/^T2-/) }, { phanC: t2.phanC }));
}
if (sPath) {
  const sb = attachCaptions(JSON.parse(fs.readFileSync(sPath, 'utf8')));
  report('Speaking (speakingCourse)', apply('speakingCourse', parseSpeaking(sb)));
}
if (missingImages.size) console.log(`\n⚠ ${missingImages.size} ảnh chưa có URL trong bookImages.json (bị bỏ qua): ${[...missingImages].slice(0, 12).join(', ')}${missingImages.size > 12 ? '…' : ''}`);
if (opt('--missing')) fs.writeFileSync(opt('--missing'), JSON.stringify([...missingImages])); // → uploadBookImages.js
if (opt('--dump')) fs.writeFileSync(opt('--dump'), JSON.stringify(dumpAll, null, 1)); // inspect the cards
if (dry) console.log('\n(--dry: không ghi file)');
