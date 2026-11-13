// scripts/mindset/verifyMindset.js — offline check of a built Mindset course
//
//   node scripts/mindset/verifyMindset.js mindset1 [u03]
//
// Uses the site's REAL graders (no DB, no server):
//   • every objective course exercise: its own key → 100%, a wrong answer → < 100%
//     (wt1GradingService.gradeObjective); gap_fill "____" count = blanks
//   • every Reading passage / Listening section: first accepted answer of each
//     question → correct (readingService.gradeGroups / listeningService
//     gradeQuestionGroups); __Qn__ placeholders match the question numbers;
//     MCQ / matching letters exist among the options; explanations present
//   • course exercise titles carry a book reference "(Ex. N)" / "(G&V Ex. N)" /
//     "Lead-in" / "Exam skills" so grep-audits against the Answer Key work
'use strict';

const fs = require('fs');
const path = require('path');
const { gradeObjective } = require('../../services/wt1GradingService');
const { gradeGroups } = require('../../services/readingService');
const { gradeQuestionGroups } = require('../../services/listeningService');

const dir = process.argv[2] || 'mindset1';
const only = process.argv[3] || '';
const DATA = path.join(__dirname, '..', 'data', dir);
const OBJ = new Set(['mcq', 'gap_fill', 'error_correction', 'word_form', 'categorize', 'matching', 'ordering', 'sentence_transform']);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const tags = fs.readdirSync(DATA).filter((f) => /^exercises-u\d+\.json$/.test(f)).map((f) => f.slice(10, 13)).filter((t) => !only || t === only).sort();

const errs = [];
const err = (m) => errs.push(m);
const warn = []; // exercises without a book number (extra practice, not in the book)
let nEx = 0; let nQ = 0;

function key(ex) {
  const a = {};
  for (const it of ex.items) {
    if (ex.type === 'mcq') a[it.id] = it.answer;
    else if (ex.type === 'gap_fill') a[it.id] = it.blanks.map((b) => b.accept[0]);
    else if (ex.type === 'categorize') a[it.id] = it.category;
    else if (ex.type === 'matching') a[it.id] = it.right;
    else if (ex.type === 'ordering') a[it.id] = it.answer;
    else a[it.id] = it.answer;
  }
  return a;
}
function wrong(ex) {
  const a = {};
  for (const it of ex.items) {
    if (ex.type === 'mcq') a[it.id] = (it.options.find((o) => o.id !== it.answer) || {}).id;
    else if (ex.type === 'gap_fill') a[it.id] = it.blanks.map(() => 'zzqx');
    else if (ex.type === 'categorize') a[it.id] = (ex.categories.find((c) => c.id !== it.category) || {}).id;
    else if (ex.type === 'ordering') a[it.id] = ['zzqx'];
    else a[it.id] = 'zzqx';
  }
  return a;
}

for (const tag of tags) {
  const { exercises } = read(`exercises-${tag}.json`);
  const L = read(`lessons-${tag}.json`);
  const P = read(`practice-${tag}.json`);
  for (const ex of exercises) {
    if (!/\bEx\. \d|Lead-in|Exam skills|\bTIPS?\b/i.test(ex.title)) warn.push(`${ex.code}: "${ex.title}"`);
    if (/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(ex.title + ' ' + (ex.instruction || ''))) err(`${ex.code}: đề có tiếng Việt: "${ex.title}" / "${ex.instruction}"`);
    if (!OBJ.has(ex.type)) continue;
    nEx++;
    if (!(ex.items || []).length) { err(`${ex.code}: không có item`); continue; }
    if (ex.type === 'gap_fill') {
      for (const it of ex.items) {
        const n = (String(it.prompt).match(/_{3,}/g) || []).length;
        if (n !== it.blanks.length) err(`${ex.code} ${it.id}: ${n} chỗ trống "____" nhưng ${it.blanks.length} đáp án — "${it.prompt.slice(0, 60)}"`);
        if (it.blanks.some((b) => !b.accept.length)) err(`${ex.code} ${it.id}: blank không có đáp án`);
      }
    }
    if (ex.type === 'mcq') for (const it of ex.items) if (!it.options.some((o) => o.id === it.answer)) err(`${ex.code} ${it.id}: đáp án ${it.answer} không có trong options`);
    if (ex.type === 'categorize') for (const it of ex.items) if (!ex.categories.some((c) => c.id === it.category)) err(`${ex.code} ${it.id}: nhóm ${it.category} không tồn tại`);
    const ok = gradeObjective(ex, key(ex));
    const pct = ok.percent != null ? ok.percent : ok.score;
    if (pct !== 100) err(`${ex.code}: đáp án của chính bài chỉ được ${pct}%`);
    const bad = gradeObjective(ex, wrong(ex));
    const pb = bad.percent != null ? bad.percent : bad.score;
    if (pb === 100) err(`${ex.code}: đáp án sai vẫn được 100%`);
  }

  const refs = new Set([...P.passages.map((p) => 'reading:' + (p.courseRef)), ...P.sections.map((s) => 'listening:' + s.courseRef)]);
  const linked = new Set();
  for (const l of L.lessons) for (const p of l.practiceLinks || []) if (p.ref) { linked.add(p.ref); if (!refs.has(p.ref)) err(`${l.code}: link ${p.ref} không có trong practice-${tag}.json`); }
  for (const r of refs) if (!linked.has(r)) err(`${tag}: ${r} không được buổi nào link tới`);

  const checkGroups = (owner, groups, grader) => {
    const nums = [];
    for (const g of groups) {
      const qn = (g.questions || []).map((q) => q.questionNumber);
      nums.push(...qn);
      const txt = JSON.stringify(g.noteConfig || '') + JSON.stringify(g.tableConfig || '') + JSON.stringify(g.summaryConfig || '');
      const ph = [...txt.matchAll(/__Q(\d+)__/g)].map((m) => Number(m[1]));
      if (['note-form', 'table', 'summary-completion'].includes(g.groupType)) {
        const a = [...ph].sort((x, y) => x - y).join(','); const b = [...qn].sort((x, y) => x - y).join(',');
        if (a !== b) err(`${owner} ${g.groupTitle}: __Qn__ (${a}) ≠ câu hỏi (${b})`);
      }
      for (const q of g.questions || []) {
        nQ++;
        if (!q.explanation) err(`${owner} Q${q.questionNumber}: thiếu giải thích`);
        if (q.type === 'multiple-choice' && !(q.options || [])[q.correctAnswer.charCodeAt(0) - 65]) err(`${owner} Q${q.questionNumber}: đáp án ${q.correctAnswer} ngoài options`);
        if (g.groupType === 'matching-options' && !(g.matchingOptions || [])[q.correctAnswer.charCodeAt(0) - 65]) err(`${owner} Q${q.questionNumber}: đáp án ${q.correctAnswer} ngoài danh sách A–`);
        if (g.groupType === 'matching-headings' && !g.headingsConfig.headings.some((h) => h.numeral === q.correctAnswer)) err(`${owner} Q${q.questionNumber}: heading ${q.correctAnswer} không có`);
        if (g.groupType === 'sentence-endings' && !g.endingsConfig.endings.some((h) => h.letter === q.correctAnswer)) err(`${owner} Q${q.questionNumber}: ending ${q.correctAnswer} không có`);
      }
    }
    if (new Set(nums).size !== nums.length) err(`${owner}: trùng số câu hỏi`);
    const ans = {};
    for (const g of groups) {
      for (const q of g.questions || []) {
        if (q.type === 'multi-answer-group') {
          // the UI writes the cluster's whole selection to every question of it
          const cluster = g.questions.filter((x) => x.type === q.type && x.questionText === q.questionText);
          if (cluster.length !== q.checkboxCount) err(`${owner} Q${q.questionNumber}: checkboxCount ${q.checkboxCount} ≠ ${cluster.length} câu`);
          if (!(q.options || [])[q.correctAnswer.charCodeAt(0) - 65]) err(`${owner} Q${q.questionNumber}: đáp án ${q.correctAnswer} ngoài options`);
          ans[q.questionNumber] = JSON.stringify(cluster.map((x) => x.correctAnswer));
        } else ans[q.questionNumber] = String(q.correctAnswer).split(/\s*\/\s*/)[0];
      }
    }
    const r = grader(groups, ans);
    if (r !== nums.length) err(`${owner}: đáp án của chính bài chỉ đúng ${r}/${nums.length}`);
  };
  for (const p of P.passages) checkGroups(p.courseRef, p.questionGroups, (g, a) => gradeGroups(g, a).correctCount);
  for (const s of P.sections) checkGroups(s.courseRef, s.questionGroups, (g, a) => gradeQuestionGroups(g, (n) => a[n] || '').correct);
}

console.log(`${dir}${only ? ' ' + only : ''}: ${tags.length} unit · ${nEx} bài tự chấm · ${nQ} câu Reading/Listening`);
if (warn.length) console.log('ℹ️  ' + warn.length + ' bài không có số bài sách (bài luyện thêm):\n' + warn.map((w) => '  · ' + w).join('\n'));
if (errs.length) { console.log('\n❌ ' + errs.length + ' lỗi:\n' + errs.map((e) => '  - ' + e).join('\n')); process.exit(1); }
console.log('✅ tất cả 100% với đáp án của chính nó');
