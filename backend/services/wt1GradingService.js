'use strict';

// Grading for the WT1 course (WT1Exercise). 8 objective types are graded
// locally here; the two full-essay types (paragraph_writing / full_task1)
// go through geminiService.checkEssay; sentence_writing is graded locally
// against its rubric. Reuses the shared normalize/levenshtein helpers.
const { levenshtein } = require('../utils/textMatch');
const geminiService = require('./geminiService');

function normalize(str) {
  return String(str == null ? '' : str)
    .toLowerCase()
    .replace(/[.,!?;:'"()‘’“”–—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// near-equal for a single blank / short answer
function fuzzyEqual(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (Math.max(x.length, y.length) > 3 && levenshtein(x, y) <= 1) return true;
  return false;
}

function ratio(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return 0;
  return 1 - levenshtein(x, y) / Math.max(x.length, y.length, 1);
}

function contentWords(s) {
  return normalize(s).split(' ').filter((w) => w.length > 3);
}

const OBJECTIVE_TYPES = new Set([
  'mcq', 'gap_fill', 'error_correction', 'word_form',
  'categorize', 'matching', 'ordering', 'sentence_transform',
]);
const AI_TYPES = new Set(['paragraph_writing', 'full_task1']);

// ── objective grading ─────────────────────────────────────────────────
// `answers` is keyed by item id. Shapes per type:
//   mcq:               { q1: "A" }
//   gap_fill:          { q1: ["amount"] }              (one string per ____ marker)
//   error_correction:  { q1: "The number ... was ..." }
//   word_form:         { q1: "rose" }
//   categorize:        { q1: "amount" }               (category id)
//   matching:          { q1: "r3" }                   (chosen right-side id)
//   ordering:          { q1: ["b","a","c"] }          (token strings, reordered)
//   sentence_transform:{ q1: "..." }
function gradeObjective(exercise, answers = {}) {
  const items = exercise.items || [];
  const out = [];
  let got = 0;

  for (const it of items) {
    const a = answers[it.id];
    let correct = false;
    let correctAnswer = '';

    switch (exercise.type) {
      case 'mcq': {
        const opt = (it.options || []).find((o) => o.id === it.answer);
        correctAnswer = opt ? `${it.answer}. ${opt.text}` : String(it.answer || '');
        correct = a != null && String(a) === String(it.answer);
        break;
      }
      case 'gap_fill': {
        const blanks = it.blanks || [];
        const arr = Array.isArray(a) ? a : [a];
        correctAnswer = blanks.map((b) => (b.accept || [])[0] || '').join(' | ');
        correct = blanks.length > 0 && blanks.every((b, k) =>
          (b.accept || []).some((acc) => fuzzyEqual(arr[k], acc)));
        break;
      }
      case 'error_correction': {
        correctAnswer = it.answer || '';
        const cands = [it.answer, ...(it.accept || [])].filter(Boolean);
        correct = cands.some((c) => normalize(a) === normalize(c) || ratio(a, c) >= 0.92);
        break;
      }
      case 'word_form': {
        const cands = [it.answer, ...(it.accept || [])].filter(Boolean);
        correctAnswer = it.answer || cands[0] || '';
        correct = cands.some((c) => fuzzyEqual(a, c));
        break;
      }
      case 'categorize': {
        const cat = (exercise.categories || []).find((c) => c.id === it.category);
        correctAnswer = cat ? cat.label : String(it.category || '');
        correct = a != null && String(a) === String(it.category);
        break;
      }
      case 'matching': {
        // items carry the correct pairing in order; the right column is
        // shuffled client-side and sends back the chosen right-side text.
        correctAnswer = it.right || '';
        correct = a != null && normalize(a) === normalize(it.right);
        break;
      }
      case 'ordering': {
        const want = (it.answer || []).map(normalize);
        const gotArr = (Array.isArray(a) ? a : []).map(normalize);
        correctAnswer = (it.answer || []).join(' → ');
        correct = want.length > 0 && want.length === gotArr.length &&
          want.every((w, i) => w === gotArr[i]);
        break;
      }
      case 'sentence_transform': {
        // Most items carry `sampleAnswers`, but a few were authored in the
        // error_correction/word_form shape (`answer` + `accept`) — accept
        // either so a mis-shaped item isn't graded against an empty key
        // (which marked every submission wrong — e.g. T1-L04-E03).
        const samples = [
          ...(it.sampleAnswers || []),
          ...(it.answer ? [it.answer] : []),
          ...(it.accept || []),
        ].filter(Boolean);
        correctAnswer = samples[0] || '';
        const best = samples.reduce((m, s) => Math.max(m, ratio(a, s)), 0);
        if (best >= 0.85) correct = true;
        else {
          // keyword coverage of the closest sample
          const cw = contentWords(correctAnswer);
          const u = normalize(a);
          const cov = cw.length ? cw.filter((w) => u.includes(w)).length / cw.length : 0;
          correct = cw.length > 0 && cov >= 0.8;
        }
        break;
      }
      default:
        break;
    }

    if (correct) got += 1;
    out.push({ id: it.id, correct, correctAnswer, explanation: it.explanation || '' });
  }

  const maxScore = items.length;
  return {
    score: maxScore ? Math.round((got / maxScore) * 100) : 0,
    correctCount: got,
    maxScore,
    items: out,
  };
}

// ── AI batch grading for open-ended sentence_transform exercises ───────
// Content authors already mark a free-composition sentence_transform
// exercise (e.g. "viết một câu hoàn chỉnh cho mỗi gợi ý, dùng cấu trúc
// yêu cầu" — many valid phrasings) with autoGrade:false, vs. the narrower
// one-answer translation drills left autoGrade:true/unset — that flag was
// authored with intent but silently ignored by /check (BUG-091: every
// sentence_transform exercise, autoGrade flag or not, went through the
// exact-ish Levenshtein/keyword check above, which a free-composition
// answer can legitimately fail while being completely correct). Honour it:
// autoGrade:false routes through Gemini (batched, all items in the
// exercise in one call — the runner always submits them together), same
// "grade fairly by meaning, not exact wording" grading Task 2's weekly
// Dịch câu practice already uses (task2PracticeService/gradeT2Question).
function needsAiGrading(exercise) {
  return exercise.type === 'sentence_transform' && exercise.autoGrade === false;
}

async function gradeSentenceTransformBatch(exercise, answers = {}) {
  const items = exercise.items || [];
  // The frontend now guides most students through an exact-copy typing
  // drill (WbwDrill — see writing-task1.html/writing-task2-course.html)
  // rather than free composition, so most submissions already match
  // sampleAnswers exactly/near-exactly. Run the fast local check FIRST and
  // only spend a Gemini call on the items it actually rejects — a
  // genuinely different phrasing, or free-typed text that bypassed the
  // drill. The common case (drill completed) never leaves the server at
  // all: no latency, no API cost, for a verdict AI would reach anyway.
  const local = gradeObjective(exercise, answers);
  const disputedIds = new Set(local.items.filter((r) => !r.correct).map((r) => r.id));
  if (!disputedIds.size) return { ...local, aiGraded: false };
  const disputed = items.filter((it) => disputedIds.has(it.id));

  try {
    const batchInput = disputed.map((it) => ({
      id: it.id, prompt: it.prompt, cue: it.cue,
      sampleAnswers: it.sampleAnswers, userAnswer: String(answers[it.id] || ''),
    }));
    const graded = await geminiService.gradeSentenceBatch(batchInput);
    const byId = new Map(graded.map((g) => [g.id, g]));
    let got = 0;
    const out = items.map((it) => {
      if (!disputedIds.has(it.id)) {
        const row = local.items.find((r) => r.id === it.id);
        got += 1; // only non-disputed (i.e. locally correct) items reach here
        return row;
      }
      const g = byId.get(it.id);
      const correct = !!(g && g.isCorrect);
      if (correct) got += 1;
      return {
        id: it.id,
        correct,
        correctAnswer: (it.sampleAnswers || [])[0] || '',
        explanation: (g && g.feedbackVi) || it.explanation || '',
      };
    });
    const maxScore = items.length;
    return {
      score: maxScore ? Math.round((got / maxScore) * 100) : 0,
      correctCount: got,
      maxScore,
      items: out,
      aiGraded: true,
    };
  } catch (err) {
    // Gemini unavailable/timeout/quota/malformed response — a student must
    // never be blocked from checking their work over an AI hiccup. Fall
    // back to the local verdict (the disputed items stay marked wrong,
    // same as before AI grading existed at all).
    return { ...local, aiGraded: false, aiError: err.message };
  }
}

// ── local grading for sentence_writing (rubric-based, no AI) ───────────
function gradeWritingLocal(exercise, responses = []) {
  const text = (Array.isArray(responses) ? responses : [responses]).join('\n').trim();
  const norm = normalize(text);
  const rubric = exercise.rubric || {};
  const words = text.split(/\s+/).filter(Boolean).length;

  const targets = [...(rubric.targetStructures || []), ...(rubric.targetVocab || [])];
  const used = targets.filter((t) => {
    const key = normalize(t).split(/[\s/|]+/).filter((w) => w.length > 3).slice(0, 2).join(' ');
    return key && norm.includes(key);
  });
  const mustUse = rubric.mustUse || Math.min(3, targets.length);
  const enoughWords = !rubric.minWords || words >= rubric.minWords;

  let score = 0;
  if (targets.length) score += Math.round((Math.min(used.length, mustUse) / mustUse) * 60);
  else score += 40;
  if (enoughWords) score += 25;
  if (words > 0) score += 15;
  score = Math.min(100, score);

  const checklist = [
    { label: `Đủ độ dài (${rubric.minWords || '—'} từ)`, ok: enoughWords, detail: `${words} từ` },
    { label: `Dùng ≥ ${mustUse} cấu trúc/từ mục tiêu`, ok: used.length >= mustUse, detail: `${used.length} phát hiện được` },
    ...(rubric.checklist || []).map((c) => ({ label: c, ok: null })),
  ];
  return {
    graded: 'local',
    score,
    isCorrect: score >= 60,
    feedbackVi: score >= 80 ? '✅ Bài viết đạt yêu cầu — bám sát rubric.'
      : score >= 60 ? '📝 Tạm ổn — còn thiếu một vài cấu trúc/từ mục tiêu, xem checklist.'
        : '❌ Chưa đạt — đọc lại rubric và bổ sung các cấu trúc mục tiêu.',
    checklist,
    sampleAnswer: rubric.sampleAnswer || '',
  };
}

// ── AI grading for paragraph_writing / full_task1 ─────────────────────
const IMG_RE = /^https?:\/\/\S+\.(png|jpe?g|webp|gif)(\?\S*)?$/i;
const MAX_IMAGES = 4;
const SAMPLE_MAX = 5000;

// Chart images the student wrote about: stimulus.imageUrl plus image links
// sitting in a table stimulus (e.g. "Graph 1 | <topic> | <chart url>" rows —
// a homework covering several charts). Capped so one call stays small.
function exerciseImageUrls(exercise) {
  const st = exercise.stimulus || {};
  const urls = [];
  if (st.imageUrl) urls.push(st.imageUrl);
  for (const row of st.rows || []) {
    for (const cell of row || []) if (IMG_RE.test(String(cell || '').trim())) urls.push(String(cell).trim());
  }
  return [...new Set(urls)].slice(0, MAX_IMAGES);
}

// The question exactly as the student saw it: title, instruction, stimulus
// (caption / text / table — image links replaced by "[ảnh n]"), sub-prompts.
// Before this the grader only got `instruction`, so e.g. "write the Body
// paragraphs for the 4 graphs of Buổi 9" reached the AI without the 4 graphs.
function questionText(exercise) {
  const st = exercise.stimulus || {};
  const urls = exerciseImageUrls(exercise);
  const lines = [];
  if (exercise.title) lines.push(`Tên bài: ${exercise.title}`);
  if (exercise.instruction) lines.push(`Đề bài / yêu cầu: ${exercise.instruction}`);
  if (st.caption) lines.push(`Tư liệu: ${st.caption}`);
  if (st.text) lines.push(String(st.text).trim());
  if (st.headers && st.headers.length) lines.push(st.headers.join(' | '));
  for (const row of st.rows || []) {
    lines.push((row || []).map((c) => {
      const u = String(c || '').trim();
      if (!IMG_RE.test(u)) return u;
      const n = urls.indexOf(u);
      return n >= 0 ? `[ảnh ${n + 1}]` : '[ảnh]';
    }).filter(Boolean).join(' | '));
  }
  if (st.note) lines.push(`Ghi chú: ${st.note}`);
  const prompts = (exercise.items || []).map((it) => it.prompt).filter(Boolean);
  if (prompts.length) lines.push('Các câu hỏi:\n' + prompts.map((q, i) => `${i + 1}. ${q}`).join('\n'));
  if (exercise.wordBank && exercise.wordBank.length) lines.push(`Từ gợi ý: ${exercise.wordBank.join(', ')}`);
  return lines.filter(Boolean).join('\n');
}

// The student's answer, one block per answer box, labelled with the
// question/chart it belongs to when the counts line up.
function formatResponses(exercise, responses = []) {
  const arr = (Array.isArray(responses) ? responses : [responses]).map((r) => String(r || '').trim());
  if (arr.length <= 1) return arr.join('').trim();
  const prompts = (exercise.items || []).map((it) => it.prompt).filter(Boolean);
  const rows = (exercise.stimulus && exercise.stimulus.rows) || [];
  const labelOf = (i) => {
    if (prompts.length === arr.length) return prompts[i];
    if (rows.length === arr.length) return (rows[i] || []).filter((c) => !IMG_RE.test(String(c || '').trim())).slice(0, 2).join(' — ');
    return '';
  };
  return arr.map((r, i) => {
    const label = labelOf(i);
    return `[Ô ${i + 1}${label ? ` — ${label}` : ''}]\n${r || '(bỏ trống)'}`;
  }).join('\n\n');
}

const JSON_SHAPE =
  '{"scores":{"taskAchievement":<0-9>,"coherence":<0-9>,"lexical":<0-9>,"grammar":<0-9>},' +
  '"overallBand":<0-9, bội số của 0.5>,' +
  '"feedbackVi":"<nhận xét tiếng Việt 3–5 câu: làm tốt gì, cần sửa gì, theo đúng yêu cầu đề>",' +
  '"corrections":[{"original":"<cụm sai trích nguyên văn>","corrected":"<cách sửa>","note":"<giải thích ngắn tiếng Việt>"}],' +
  '"usedStructures":["<cấu trúc/từ mục tiêu đã dùng>"],"missingStructures":["<cấu trúc/từ mục tiêu còn thiếu>"],' +
  '"sentenceFeedback":[{"sentence":"<câu>","comment":"<nhận xét tiếng Việt>"}]}';

function buildAiPrompt(exercise) {
  const r = exercise.rubric || {};
  const lines = [
    'Bạn là giáo viên IELTS Writing chấm một bài tập trong giáo trình. Chấm bài làm của học sinh theo ĐÚNG đề dưới đây.',
    '\n=== ĐỀ BÀI ===',
    questionText(exercise),
  ];
  const imgs = exerciseImageUrls(exercise);
  if (imgs.length) lines.push(`\nĐính kèm ${imgs.length} ảnh biểu đồ (theo thứ tự [ảnh 1]…[ảnh ${imgs.length}]) — đối chiếu số liệu học sinh viết với ảnh.`);
  lines.push('\n=== TIÊU CHÍ ===');
  if (r.minWords) lines.push(`Độ dài mục tiêu: ≥ ${r.minWords} từ${r.maxWords ? ` (≤ ${r.maxWords})` : ''}.`);
  if (r.targetStructures && r.targetStructures.length) {
    lines.push(`Cấu trúc mục tiêu cần xuất hiện (ít nhất ${r.mustUse || 3}): ${r.targetStructures.join('; ')}.`);
  }
  if (r.checklist && r.checklist.length) {
    lines.push(`Yêu cầu cụ thể:\n- ${r.checklist.join('\n- ')}`);
  }
  if (exercise.type === 'full_task1') {
    lines.push('Đây là một bài IELTS Writing Task 1 hoàn chỉnh — chấm theo 4 tiêu chí (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy), mỗi tiêu chí 0–9.');
  } else {
    lines.push('Đây là bài luyện MỘT PHẦN của bài viết — chấm theo 4 tiêu chí IELTS (0–9) nhưng CHỈ đánh giá phần đề yêu cầu: không trừ điểm vì thiếu phần đề không yêu cầu (VD đề chỉ yêu cầu Body thì không trừ vì thiếu Introduction/Overview), bỏ qua mục checklist không áp dụng cho phần này. Nếu có nhiều ô/biểu đồ, xét từng ô rồi cho một band chung.');
  }
  if (r.commonErrors && r.commonErrors.length) {
    lines.push(`Đối chiếu với các lỗi hay gặp: ${r.commonErrors.join('; ')}.`);
  }
  if (r.bandFocus && r.bandFocus.length) {
    lines.push(`Trình độ người học: ${r.bandFocus.join(', ')} — chấm theo band descriptors nhưng nhận xét phù hợp trình độ này.`);
  }
  if (r.sampleAnswer) {
    const sample = String(r.sampleAnswer);
    lines.push(`\n=== BÀI MẪU (chỉ để đối chiếu ý/số liệu — KHÔNG bắt học sinh viết giống) ===\n${sample.length > SAMPLE_MAX ? `${sample.slice(0, SAMPLE_MAX)} …` : sample}`);
  }
  // checkEssay's system instruction only says "respond in JSON" — without the
  // shape spelled out the model invents its own keys and gradeWritingAI below
  // reads nulls (no bands, no feedback, no corrections on screen).
  lines.push(`\nTrả về DUY NHẤT một object JSON đúng cấu trúc sau:\n${JSON_SHAPE}`);
  return lines.filter(Boolean).join('\n');
}

// Gemini's JSON (or one pasted from an outside AI) → the aiFeedback shape
// WT1Submission stores; tolerates a few alternative key names.
function normalizeAiResult(raw, model = 'gemini') {
  const scores = raw.scores || raw.bandScores || {};
  const band = raw.overallBand ?? raw.bandEstimate ?? raw.overall ?? null;
  return {
    graded: 'ai',
    model,
    scores: {
      taskAchievement: scores.taskAchievement ?? scores.task ?? scores.ta ?? null,
      coherence: scores.coherence ?? scores.cc ?? null,
      lexical: scores.lexical ?? scores.lr ?? null,
      grammar: scores.grammar ?? scores.gra ?? null,
    },
    bandEstimate: band,
    feedbackVi: raw.feedbackVi || raw.overallFeedback || raw.feedback || '',
    corrections: Array.isArray(raw.corrections) ? raw.corrections : [],
    usedStructures: Array.isArray(raw.usedStructures) ? raw.usedStructures : [],
    missingStructures: Array.isArray(raw.missingStructures) ? raw.missingStructures : [],
  };
}

async function gradeWritingAI(exercise, responses = []) {
  const imgs = exerciseImageUrls(exercise);
  const raw = await geminiService.checkEssay(
    buildAiPrompt(exercise), formatResponses(exercise, responses),
    imgs.length > 1 ? imgs : (imgs[0] || undefined),
  );
  return normalizeAiResult(raw, 'gemini');
}

// Everything an outside AI (ChatGPT, Claude…) needs to grade the same
// submission — the admin "📋 Copy prompt" button. Chart links are listed
// since a pasted prompt can't carry the image files.
function buildExternalPrompt(exercise, responses = []) {
  const imgs = exerciseImageUrls(exercise);
  return [
    buildAiPrompt(exercise),
    imgs.length ? `\nLink ảnh biểu đồ:\n${imgs.map((u, i) => `[ảnh ${i + 1}] ${u}`).join('\n')}` : '',
    `\n**Bài làm của học sinh:**\n<<<STUDENT_ESSAY_START>>>\n${formatResponses(exercise, responses)}\n<<<STUDENT_ESSAY_END>>>`,
  ].filter(Boolean).join('\n');
}

module.exports = {
  OBJECTIVE_TYPES, AI_TYPES,
  normalize, fuzzyEqual, ratio,
  gradeObjective, needsAiGrading, gradeSentenceTransformBatch,
  gradeWritingLocal, gradeWritingAI, buildAiPrompt,
  buildExternalPrompt, normalizeAiResult, exerciseImageUrls, formatResponses, questionText,
};
