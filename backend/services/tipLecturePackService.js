'use strict';

// "Tài liệu in" for the Tips pages (admin/teacher only): one Markdown file
// per tip that a teacher hands to another AI (ChatGPT, Gemini, Claude…) to
// turn into a printable lesson handout for class. The file holds
//   A. the AI prompt (what to write, in which order, and the rules — above
//      all: never change a question or an answer key),
//   B. the tip's own content (the strategy write-up students read online),
//   C. for Reading/Listening, the tip's fixed practice (see FIXED_PRACTICE in
//      the practice services) WITH its answer key, explanations and
//      evidence — the key comes from the practice's own checkAnswer(), the
//      exact grading students get, so the handout can't drift from the site.

const ReadingTip = require('../models/ReadingTip');
const ListeningTip = require('../models/ListeningTip');
const WritingTip = require('../models/WritingTip');
const SpeakingTip = require('../models/SpeakingTip');
const ListeningSection = require('../models/ListeningSection');
const readingPractice = require('./readingTipPracticeService');
const listeningPractice = require('./listeningTipPracticeService');

const SKILLS = {
  reading: { label: 'Reading', model: ReadingTip, practice: readingPractice },
  listening: { label: 'Listening', model: ListeningTip, practice: listeningPractice },
  writing: { label: 'Writing', model: WritingTip, practice: null },
  speaking: { label: 'Speaking', model: SpeakingTip, practice: null },
};

const PAGE_BREAK = '--- NGẮT TRANG ---';

// ── Markdown helpers ────────────────────────────────────────────────────

const clean = (s) => String(s == null ? '' : s).replace(/\r/g, '').trim();
const oneLine = (s) => clean(s).replace(/\s*\n\s*/g, ' ');
const cell = (s) => oneLine(s).replace(/\|/g, '\\|');
const quote = (s) => clean(s).split('\n').map(l => `> ${l}`).join('\n');

function mmss(sec) {
  if (sec == null || !Number.isFinite(Number(sec))) return '';
  const s = Math.max(0, Math.round(Number(sec)));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function table(headers, rows) {
  if (!headers.length) return '';
  return [
    `| ${headers.map(cell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(r => `| ${headers.map((_, i) => cell(r[i])).join(' | ')} |`),
  ].join('\n');
}

// The tip's content blocks (same block types for all four skills).
function blockMarkdown(block) {
  const d = block.data;
  switch (block.type) {
    case 'overview':
      return `### Tổng quan\n\n${clean(d)}`;
    case 'summary':
      return `### Tóm tắt\n\n${clean(d)}`;
    case 'steps':
      return `### Quy trình\n\n${(d || []).map((s, i) => `${i + 1}. **${oneLine(s.title)}** — ${oneLine(s.description)}`).join('\n')}`;
    case 'list':
      return `${d.title ? `### ${oneLine(d.title)}\n\n` : ''}${(d.items || []).map(t => `- ${oneLine(t)}`).join('\n')}`;
    case 'callout':
      return quote(`${d.title ? `**${oneLine(d.title)}**\n` : ''}${clean(d.text)}`);
    case 'table':
      return `${d.title ? `**${oneLine(d.title)}**\n\n` : ''}${table(d.headers || [], d.rows || [])}`;
    case 'example':
      return `### Ví dụ minh hoạ\n\n${(d || []).map((ex) => {
        const rows = [];
        if (ex.label) rows.push(`**${oneLine(ex.label)}**`);
        if (ex.passage) rows.push(`- *Passage / Audio:* ${oneLine(ex.passage)}`);
        if (ex.statement) rows.push(`- *Statement / Question:* ${oneLine(ex.statement)}`);
        (ex.lines || []).forEach(l => rows.push(`- *${oneLine(l.tag)}:* ${oneLine(l.text)}`));
        if (ex.note) rows.push(`- *Ghi chú:* ${oneLine(ex.note)}`);
        return rows.join('\n');
      }).join('\n\n')}`;
    default:
      return '';
  }
}

function tipMarkdown(tip) {
  const parts = [];
  if (tip.summary) parts.push(`*${oneLine(tip.summary)}*`);
  (tip.blocks || []).forEach(b => { const md = blockMarkdown(b); if (md) parts.push(md); });
  return parts.join('\n\n');
}

// ── Answer keys (the practice's own grading reveals them) ───────────────

// A throwaway answer: checkAnswer grades it and returns the key, the
// explanation and the evidence, exactly as a student's check would.
const PROBE_PREDICTION = { wordclass: 'noun', infotype: 'name', form: 'singular' };

async function revealListening(lessonKey, practice, it) {
  const body = {
    sectionId: it.sectionId || practice.sectionId,
    questionNumber: it.questionNumber,
    sentenceIndex: it.sentenceIndex,
    item: it.type,
    symbol: it.symbol,
    answer: it.input === 'multi' ? '["A"]' : '—',
    prediction: PROBE_PREDICTION[practice.kind] || 'word',
  };
  const r = await listeningPractice.checkAnswer(lessonKey, body);
  return r.status === 'ok' ? r.result : null;
}

async function revealReading(lessonKey, practice, it) {
  const r = await readingPractice.checkAnswer(lessonKey, {
    passageId: it.passageId || practice.passageId, questionNumber: it.questionNumber, pairIndex: it.pairIndex, answer: '—',
  });
  return r.status === 'ok' ? r.result : null;
}

function keyBlock(result, extra = []) {
  if (!result) return '- **Đáp án:** (không lấy được — kiểm tra lại câu này trên web)';
  const lines = [`- **Đáp án:** ${oneLine(result.correctAnswer)}`, ...extra];
  const ev = result.evidence;
  if (ev && ev.text) {
    const who = ev.speaker ? `${ev.speaker}: ` : '';
    const at = ev.start != null ? ` _(audio ${mmss(ev.start)}–${mmss(ev.end)})_` : '';
    lines.push(`- **Dẫn chứng:** “${who}${oneLine(ev.text)}”${at}`);
  }
  if (result.explanation) lines.push(`- **Giải thích (lời giải của đề):** ${oneLine(result.explanation)}`);
  return lines.join('\n');
}

const choicesMd = (choices) => (choices || []).filter(c => c && (c.label || c.key))
  .map(c => `   ${c.key}. ${oneLine(c.label)}`).join('\n');

// ── Reading practice → Markdown ─────────────────────────────────────────

function paragraphsMd(paragraphs) {
  return (paragraphs || []).map((p) => {
    const tag = p.label ? `**${p.label}** ` : p.n ? `**[${p.n}]** ` : '';
    return `${p.heading ? `**${oneLine(p.heading)}**\n\n` : ''}${tag}${oneLine(p.text)}`;
  }).join('\n\n');
}

async function readingPracticeMd(lessonKey, pr) {
  const out = [];
  const keys = [];
  if (pr.kind === 'skimming') {
    out.push('Mỗi câu kèm đoạn văn cần đọc lướt (skim).');
    let n = 0;
    for (const it of pr.items) {
      n++;
      out.push(`#### Câu ${n} — ${oneLine(it.passageTitle)} (${oneLine(it.sourceName)}), ${it.targetLabel}\n\n${paragraphsMd(it.paragraphs)}\n\n**${oneLine(it.question.text)}**\n${(it.question.options || []).map((o, i) => `   ${String.fromCharCode(65 + i)}. ${oneLine(o)}`).join('\n')}`);
      keys.push(`**Câu ${n}**\n${keyBlock(await revealReading(lessonKey, pr, it))}`);
    }
  } else if (pr.kind === 'paraphrase') {
    out.push('Mỗi câu: tìm trong câu của bài đọc cụm từ có nghĩa tương đương với keyword của câu hỏi.');
    let n = 0;
    for (const it of pr.items) {
      n++;
      out.push(`#### Câu ${n} — ${oneLine(it.passageTitle)} (${oneLine(it.sourceName)}), đoạn ${it.paragraphLabel}\n\n- **Câu hỏi (câu ${it.questionNumber} trong đề):** ${oneLine(it.question)}\n- **Keyword:** ${oneLine(it.keyword)}\n- **Câu trong bài đọc:** ${oneLine(it.sentence)}`);
      keys.push(`**Câu ${n}** — keyword “${oneLine(it.keyword)}”\n${keyBlock(await revealReading(lessonKey, pr, it))}`);
    }
  } else {
    out.push(`**Bài đọc: ${oneLine(pr.passageTitle)}** (${oneLine(pr.sourceName)})\n\n${paragraphsMd(pr.paragraphs)}`);
    const qs = [];
    if (pr.main) qs.push({ ...pr.main, input: 'choice', isMain: true });
    qs.push(...(pr.questions || []));
    let lastInstruction = '';
    const qMd = [];
    for (const q of qs) {
      if (q.instruction && q.instruction !== lastInstruction) { qMd.push(`*${oneLine(q.instruction)}*`); lastInstruction = q.instruction; }
      if (q.listTitle) qMd.push(`**${oneLine(q.listTitle)}**`);
      const limit = q.wordLimit ? ` _(${q.wordLimit})_` : '';
      const opts = q.choices && q.choices.some(c => c.label) ? `\n${choicesMd(q.choices)}` : q.choices ? `   (${q.choices.map(c => c.key).join(' / ')})` : '';
      qMd.push(`**${q.questionNumber}.** ${oneLine(q.text)}${limit}${opts}${q.isMain ? '  _(câu ý chính — bước skim)_' : ''}`);
      const extra = [];
      if (q.isGuidedExample) extra.push('- _Trên web đây là câu ví dụ mẫu (I do)._');
      if (q.locationParagraph != null) extra.push(`- **Vị trí thông tin:** đoạn ${q.locationParagraph}`);
      if (q.keywords && q.keywords.length) extra.push(`- **Keyword gợi ý:** ${q.keywords.join(', ')}`);
      if (q.anchors && q.anchors.length) extra.push(`- **Từ neo để scan:** ${q.anchors.join(', ')}`);
      keys.push(`**${q.questionNumber}.**\n${keyBlock(await revealReading(lessonKey, pr, q), extra)}`);
    }
    out.push(`**Câu hỏi**\n\n${qMd.join('\n\n')}`);
  }
  return { questions: out.join('\n\n'), keys: keys.join('\n\n') };
}

// ── Listening practice → Markdown ───────────────────────────────────────

const PREDICT_LABEL = {
  proper: 'Tên riêng', date: 'Ngày / thứ / tháng', time: 'Giờ', price: 'Giá tiền', number: 'Số / mã số', word: 'Từ vựng',
  noun: 'Danh từ', adjective: 'Tính từ', verb: 'Động từ', name: 'Tên người', place: 'Địa điểm',
  singular: 'Danh từ số ít', plural: 'Danh từ số nhiều', uncountable: 'Không đếm được', ving: 'V-ing', phrase: 'Cụm 2–3 từ',
};

function gapLine(it) {
  const ctx = it.context ? `_${oneLine(it.context)}_ — ` : '';
  const limit = it.wordLimit ? ` _(${it.wordLimit})_` : '';
  return `${ctx}${oneLine(it.text)}${limit}`;
}

async function listeningPracticeMd(lessonKey, pr) {
  const out = [];
  const keys = [];
  const audioOf = (it) => it.audioUrl || pr.audioUrl;
  const segment = (seg) => (seg ? ` — audio ${mmss(seg.start)}–${mmss(seg.end)}` : '');

  if (pr.kind === 'symbols') {
    let n = 0;
    for (const it of pr.items) {
      n++;
      if (it.type === 'meaning') {
        out.push(`**${n}.** Ký hiệu **${it.symbol}** dùng để ghi nhanh ý gì?\n${it.options.map((o, i) => `   ${String.fromCharCode(65 + i)}. ${o}`).join('\n')}`);
      } else {
        out.push(`**${n}.** Nghe câu (${oneLine(it.sourceName)}${segment(it.segment)}; audio: ${audioOf(it)}) và chọn ký hiệu ghi nhanh ý của câu: ${it.options.join('   ')}`);
      }
      const r = await revealListening(lessonKey, pr, it);
      keys.push(`**${n}.**\n${keyBlock(r, r && r.meaning ? [`- **Nghĩa:** ${r.meaning}`] : [])}`);
    }
  } else if (['wordclass', 'infotype', 'form'].includes(pr.kind)) {
    out.push('Không cần nghe: đọc câu, dự đoán loại đáp án trước khi xem đáp án thật.');
    let n = 0;
    for (const it of pr.items) {
      n++;
      out.push(`**${n}.** ${gapLine(it)}  _(${oneLine(it.sourceName)}, câu ${it.questionNumber})_`);
      const r = await revealListening(lessonKey, pr, it);
      const extra = r ? [`- **Loại đáp án:** ${PREDICT_LABEL[r.category] || r.category}${r.reason ? ` — ${oneLine(r.reason)}` : ''}`] : [];
      keys.push(`**${n}.**\n${keyBlock(r, extra)}`);
    }
  } else if (pr.kind === 'keywords') {
    let n = 0;
    for (const it of pr.items) {
      n++;
      out.push(`**${n}.** ${gapLine(it)}  _(${oneLine(it.sourceName)}, câu ${it.questionNumber}${segment(it.segment)}; audio: ${audioOf(it)})_`);
      const extra = [`- **Keyword gợi ý:** ${(it.keywords || []).join(', ')}${it.signals && it.signals.length ? ` · tín hiệu loại đáp án: ${it.signals.join(', ')}` : ''}`];
      keys.push(`**${n}.**\n${keyBlock(await revealListening(lessonKey, pr, it), extra)}`);
    }
  } else {
    // one section: preview / workflow / question types
    out.push(`**Bài nghe:** ${oneLine(pr.sourceName)} — audio: ${pr.audioUrl}${pr.segment ? ` (đoạn dùng: ${mmss(pr.segment.start)}–${mmss(pr.segment.end)})` : ''}`);
    if (pr.instruction) out.push(`*${oneLine(pr.instruction)}*`);
    if (pr.prepSeconds) out.push(`_Cho học viên ${pr.prepSeconds} giây đọc trước câu hỏi rồi mới phát audio._`);
    let lastInstruction = pr.instruction || '';
    let mapShown = false;
    for (const q of pr.questions) {
      const own = q.sectionId && q.sectionId !== pr.sectionId;
      if (q.instruction && q.instruction !== lastInstruction) { out.push(`*${oneLine(q.instruction)}*`); lastInstruction = q.instruction; }
      if (q.imageUrl && !mapShown) { out.push(`![Bản đồ / sơ đồ](${q.imageUrl})`); mapShown = true; }
      if (q.listTitle) out.push(`**${oneLine(q.listTitle)}**`);
      const num = q.numbers && q.numbers.length > 1 ? `${q.numbers[0]}–${q.numbers[q.numbers.length - 1]}` : q.questionNumber;
      const text = q.input === 'text' || q.text && q.text.includes('_____') ? gapLine(q) : oneLine(q.text);
      const where = own ? ` _(câu mẫu lấy từ ${oneLine(q.sourceName)}; audio: ${q.audioUrl})_` : '';
      const opts = q.choices && q.choices.some(c => c.label) ? `\n${choicesMd(q.choices)}` : q.choices ? `   (${q.choices.map(c => c.key).join(' / ')})` : '';
      out.push(`**${num}.** ${text}${segment(q.segment)}${where}${opts}`);
      const extra = [];
      if (q.mode === 'example') extra.push('- _Trên web đây là câu ví dụ mẫu (I do)._');
      if (q.keywords && q.keywords.length) extra.push(`- **Keyword gợi ý:** ${q.keywords.join(', ')}`);
      keys.push(`**${num}.**\n${keyBlock(await revealListening(lessonKey, pr, q), extra)}`);
    }
  }
  return { questions: out.join('\n\n'), keys: keys.join('\n\n') };
}

// Full transcripts of the sections a practice uses (one-section practices,
// or at most three sources), for the "phát transcript sau khi chữa" appendix.
async function transcriptsMd(pr) {
  const ids = [...new Set([pr.sectionId, ...((pr.questions || pr.items || []).map(i => i.sectionId))].filter(Boolean))];
  if (!ids.length || ids.length > 3) return '';
  const secs = await ListeningSection.find({ _id: { $in: ids } }).select('title partNumber transcript audioUrl').lean();
  return secs.filter(s => clean(s.transcript)).map(s =>
    `### Transcript — Part ${s.partNumber} · ${oneLine(s.title)}\n\nAudio: ${s.audioUrl}\n\n${clean(s.transcript)}`).join('\n\n');
}

// ── The prompt ──────────────────────────────────────────────────────────

function buildPrompt({ skill, tip, hasPractice }) {
  const S = SKILLS[skill].label;
  const listening = skill === 'listening';
  const steps = [
    '1. **Trang bìa ngắn:** tên bài, kỹ năng, thời lượng gợi ý (60–90 phút), 3–4 mục tiêu dạng "Sau buổi học, học viên có thể…".',
    '2. **Khởi động (5–10 phút):** 1–2 câu hỏi hoặc hoạt động dẫn vào chủ đề.',
    '3. **Lý thuyết cốt lõi:** viết lại súc tích từ PHẦN B — giải thích bằng tiếng Việt, giữ nguyên thuật ngữ và ví dụ tiếng Anh; dùng bảng hoặc sơ đồ các bước khi phù hợp.',
  ];
  if (hasPractice) {
    steps.push(
      '4. **Làm mẫu (I do):** giáo viên làm mẫu câu đầu tiên của PHẦN C từng bước (keyword → vị trí → câu dẫn chứng → đáp án), đúng kỹ thuật của bài.',
      '5. **Làm cùng (We do):** câu thứ hai, kèm 2–3 câu hỏi gợi mở giáo viên hỏi cả lớp.',
      `6. **PHIẾU BÀI TẬP HỌC VIÊN** (trang riêng — học viên chỉ nhận trang này): chép NGUYÊN VĂN đề ở PHẦN C${listening ? ' (instruction, câu hỏi, lựa chọn, bản đồ nếu có)' : ' (bài đọc, instruction, câu hỏi, lựa chọn)'}, có chỗ trống để ghi đáp án, KHÔNG in đáp án.`,
      '7. **ĐÁP ÁN & GIẢI THÍCH cho giáo viên** (trang riêng): đáp án, trích dẫn bằng chứng, giải thích ngắn bằng tiếng Việt, bẫy hay gặp.',
    );
  } else {
    steps.push(
      '4. **Ví dụ mẫu:** lấy các ví dụ trong PHẦN B, phân tích từng bước như giáo viên giảng trên bảng.',
      '5. **PHIẾU BÀI TẬP HỌC VIÊN** (trang riêng): bài này chưa có bài tập đề thật, nên hãy soạn 1 phiếu bài tập ngắn (6–10 câu) bám sát lý thuyết, đặt tiêu đề "Bài tập (AI soạn — giáo viên duyệt trước khi dùng)".',
      '6. **ĐÁP ÁN / BÀI MẪU cho giáo viên** (trang riêng) cho phiếu bài tập trên.',
    );
  }
  steps.push(`${steps.length + 1}. **Ghi chú cho giáo viên:** phân bổ thời gian từng phần, lỗi học viên hay mắc, bài tập về nhà gợi ý.`);
  if (listening && hasPractice) {
    steps.push(`${steps.length + 1}. **Hướng dẫn phát audio:** bảng gồm câu hỏi — link audio — mốc thời gian (mm:ss) để giáo viên tua đúng đoạn trên lớp; transcript (Phụ lục của PHẦN C) để phát cho học viên SAU khi chữa bài.`);
  }
  const rules = [
    hasPractice
      ? `- Câu hỏi, ${listening ? 'transcript, mốc thời gian audio' : 'đoạn văn'} và ĐÁP ÁN lấy NGUYÊN VĂN từ PHẦN C — không sửa, không bịa, không đổi đáp án. Nếu thấy chỗ nghi sai, ghi chú "[cần kiểm tra]" thay vì tự sửa.`
      : '- Lý thuyết và ví dụ lấy từ PHẦN B; không thêm thông tin sai về bài thi IELTS.',
    '- Nếu muốn thêm bài tập tự soạn, đặt trong mục riêng "Bài tập bổ sung (AI soạn — giáo viên duyệt trước khi dùng)" và kèm đáp án.',
    `- Trình bày để in đen trắng khổ A4: tiêu đề rõ, đánh số, bảng kẻ ô, không dùng màu làm thông tin duy nhất; đánh dấu ngắt trang bằng dòng "${PAGE_BREAK}".`,
    '- Ngôn ngữ: phần giảng bằng tiếng Việt; đề bài, ví dụ, đáp án giữ tiếng Anh.',
    '- Xuất kết quả dạng file Word (.docx) nếu bạn tạo được file; nếu không, xuất Markdown chuẩn (tiêu đề #, bảng |) để giáo viên dán vào Word / Google Docs.',
  ];
  return [
    'Bạn là giáo viên IELTS giàu kinh nghiệm, đang soạn TÀI LIỆU BÀI GIẢNG IN để dạy trực tiếp trên lớp cho học viên Việt Nam (band mục tiêu 5.0–7.0).',
    '',
    `Chủ đề: IELTS ${S} — ${oneLine(tip.title)} (${oneLine(tip.category)})`,
    `Dữ liệu nguồn: PHẦN B (nội dung bài học)${hasPractice ? ' và PHẦN C (bài luyện tập đề thật kèm đáp án chuẩn)' : ''} trong file đính kèm / bên dưới prompt này.`,
    '',
    'Hãy soạn MỘT file bài giảng hoàn chỉnh gồm các phần theo đúng thứ tự:',
    ...steps,
    '',
    'Quy tắc bắt buộc:',
    ...rules,
  ].join('\n');
}

// ── Public API ──────────────────────────────────────────────────────────

async function listTips() {
  const out = [];
  for (const [skill, s] of Object.entries(SKILLS)) {
    const tips = await s.model.find({ isActive: true }).sort({ orderIndex: 1 }).select('category lessonKey title icon').lean();
    out.push({
      skill,
      label: s.label,
      tips: tips.map(t => ({
        lessonKey: t.lessonKey, title: t.title, category: t.category, icon: t.icon || '',
        hasPractice: !!(s.practice && s.practice.hasPractice(t.lessonKey)),
      })),
    });
  }
  return out;
}

function slug(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 60) || 'tip';
}

// null when the skill / tip doesn't exist (or is hidden).
async function buildPack(skill, lessonKey) {
  const s = SKILLS[skill];
  if (!s) return null;
  const tip = await s.model.findOne({ lessonKey, isActive: true }).lean();
  if (!tip) return null;

  let practiceMd = '';
  let hasPractice = false;
  if (s.practice && s.practice.hasPractice(lessonKey)) {
    const r = await s.practice.getPractice(lessonKey);
    const pr = r.status === 'ok' ? r.practice : null;
    if (pr) {
      hasPractice = true;
      const { questions, keys } = skill === 'reading' ? await readingPracticeMd(lessonKey, pr) : await listeningPracticeMd(lessonKey, pr);
      const transcripts = skill === 'listening' ? await transcriptsMd(pr) : '';
      practiceMd = [
        '## PHẦN C — BÀI LUYỆN TẬP (đề thật, giống bài luyện tập trên web)',
        '### C1. Đề bài (phát cho học viên)',
        questions,
        PAGE_BREAK,
        '### C2. Đáp án & giải thích (dành cho giáo viên)',
        keys,
        transcripts ? `${PAGE_BREAK}\n\n### C3. Phụ lục — transcript\n\n${transcripts}` : '',
      ].filter(Boolean).join('\n\n');
    }
  }

  const prompt = buildPrompt({ skill, tip, hasPractice });
  const date = new Date().toISOString().slice(0, 10);
  const markdown = [
    `# IELTS ${s.label} Tips — ${oneLine(tip.title)}`,
    `_Tài liệu nguồn để soạn bài giảng in · ${oneLine(tip.category)} · xuất ngày ${date}_`,
    '## PHẦN A — PROMPT CHO AI (dán cả file này, hoặc đính kèm file và dán phần prompt)',
    ['```text', prompt, '```'].join('\n'),
    '## PHẦN B — NỘI DUNG BÀI HỌC (bài Tips trên web)',
    tipMarkdown(tip),
    practiceMd,
  ].filter(Boolean).join('\n\n') + '\n';

  return {
    skill,
    lessonKey,
    title: tip.title,
    hasPractice,
    filename: `bai-giang-${skill}-${slug(lessonKey)}.md`,
    prompt,
    markdown,
  };
}

module.exports = { SKILLS, listTips, buildPack, tipMarkdown, _internals: { blockMarkdown, buildPrompt, mmss, table } };
