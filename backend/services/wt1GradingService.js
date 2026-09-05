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
        // shuffled client-side and sends back the chosen right-item id.
        correctAnswer = it.right || '';
        correct = a != null && normalize(a) === normalize(it.right) || String(a) === String(it.id);
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
        const samples = it.sampleAnswers || [];
        correctAnswer = samples[0] || '';
        const best = samples.reduce((m, s) => Math.max(m, ratio(a, s)), 0);
        if (best >= 0.85) correct = true;
        else {
          // keyword coverage of the closest sample
          const cw = contentWords(correctAnswer);
          const u = normalize(a);
          const cov = cw.length ? cw.filter((w) => u.includes(w)).length / cw.length : 0;
          correct = cov >= 0.8;
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
function buildAiPrompt(exercise) {
  const r = exercise.rubric || {};
  const lines = [exercise.instruction || ''];
  if (r.targetStructures && r.targetStructures.length) {
    lines.push(`\nCấu trúc mục tiêu cần xuất hiện (ít nhất ${r.mustUse || 3}): ${r.targetStructures.join('; ')}.`);
  }
  if (r.checklist && r.checklist.length) {
    lines.push(`\nYêu cầu cụ thể:\n- ${r.checklist.join('\n- ')}`);
  }
  if (exercise.type === 'full_task1') {
    lines.push('\nĐây là một bài IELTS Writing Task 1 hoàn chỉnh — chấm theo 4 tiêu chí (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy), mỗi tiêu chí 0–9.');
  }
  if (r.commonErrors && r.commonErrors.length) {
    lines.push(`\nĐối chiếu với các lỗi hay gặp: ${r.commonErrors.join('; ')}.`);
  }
  return lines.filter(Boolean).join('\n');
}

async function gradeWritingAI(exercise, responses = []) {
  const essay = (Array.isArray(responses) ? responses : [responses]).join('\n\n').trim();
  const prompt = buildAiPrompt(exercise);
  const imageUrl = exercise.stimulus && exercise.stimulus.imageUrl;
  const raw = await geminiService.checkEssay(prompt, essay, imageUrl || undefined);

  // checkEssay returns the writing-grader JSON; normalise a few field names.
  const scores = raw.scores || raw.bandScores || {};
  const band = raw.overallBand ?? raw.bandEstimate ?? raw.overall ?? null;
  return {
    graded: 'ai',
    model: 'gemini',
    scores: {
      taskAchievement: scores.taskAchievement ?? scores.task ?? scores.ta ?? null,
      coherence: scores.coherence ?? scores.cc ?? null,
      lexical: scores.lexical ?? scores.lr ?? null,
      grammar: scores.grammar ?? scores.gra ?? null,
    },
    bandEstimate: band,
    feedbackVi: raw.feedbackVi || raw.overallFeedback || raw.feedback || '',
    corrections: raw.corrections || [],
    usedStructures: raw.usedStructures || [],
    missingStructures: raw.missingStructures || [],
  };
}

module.exports = {
  OBJECTIVE_TYPES, AI_TYPES,
  normalize, fuzzyEqual, ratio,
  gradeObjective, needsAiGrading, gradeSentenceTransformBatch,
  gradeWritingLocal, gradeWritingAI, buildAiPrompt,
};
