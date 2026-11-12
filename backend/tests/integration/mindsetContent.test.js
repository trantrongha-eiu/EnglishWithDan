// Whole-course content sweep for Mindset 0 as a real student would see it:
// every lesson of all 10 units is loaded from the built seed data
// (scripts/data/mindset0), then walked in order through the public API —
//   1. the lesson opens (gate passed by finishing the previous lesson),
//   2. no exercise leaks its answer key before submission,
//   3. a wrong submission is graded 0 and every item shows the correct
//      answer (what the page renders after "Kiểm tra"),
//   4. the book's own key scores 100% — which also unlocks the next lesson.
// Writing / speaking exercises are AI-graded; their submissions are inserted
// directly so the gate (≥1 written/spoken answer) opens without Gemini.
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../../app');
const { createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const WT1Course = require('../../models/WT1Course');
const WT1Module = require('../../models/WT1Module');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Exercise = require('../../models/WT1Exercise');
const WT1Submission = require('../../models/WT1Submission');
const { OBJECTIVE_TYPES } = require('../../services/wt1GradingService');

jest.setTimeout(240000);

const DIR = path.join(__dirname, '../../scripts/data/mindset0');
const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
const units = [];
for (let u = 1; u <= 10; u++) {
  const tag = `u${String(u).padStart(2, '0')}`;
  const L = read(`lessons-${tag}.json`);
  const E = read(`exercises-${tag}.json`);
  units.push({ L, exercises: Array.isArray(E) ? E : E.exercises });
}

function correctAnswers(ex) {
  const a = {};
  for (const it of ex.items) {
    switch (ex.type) {
      case 'mcq': a[it.id] = it.answer; break;
      case 'gap_fill': a[it.id] = it.blanks.map((b) => b.accept[0]); break;
      case 'categorize': a[it.id] = it.category; break;
      case 'matching': a[it.id] = it.right; break;
      case 'ordering': a[it.id] = it.answer; break;
      default: a[it.id] = it.answer;
    }
  }
  return a;
}

function wrongAnswers(ex) {
  const a = {};
  for (const it of ex.items) {
    switch (ex.type) {
      case 'mcq': a[it.id] = it.options.find((o) => o.id !== it.answer).id; break;
      case 'gap_fill': a[it.id] = it.blanks.map(() => 'zzqx'); break;
      case 'categorize': a[it.id] = ex.categories.find((c) => c.id !== it.category).id; break;
      case 'ordering': a[it.id] = ['zzqx']; break;
      default: a[it.id] = 'zzqx';
    }
  }
  return a;
}

// Fields that would give the answer away before submission.
function leaks(ex) {
  const out = [];
  for (const it of ex.items || []) {
    if (ex.type === 'mcq' && it.answer != null) out.push(`${it.id}.answer`);
    if (ex.type === 'gap_fill' && (it.blanks || []).some((b) => b.accept)) out.push(`${it.id}.blanks.accept`);
    if (ex.type === 'categorize' && it.category != null) out.push(`${it.id}.category`);
    if (ex.type === 'ordering' && it.answer != null) out.push(`${it.id}.answer`);
    if (ex.type === 'error_correction' && it.answer != null) out.push(`${it.id}.answer`);
    if (ex.type === 'matching' && it.right != null) out.push(`${it.id}.right`);
  }
  return out;
}

beforeEach(async () => {
  const { course } = units[0].L;
  await WT1Course.create({ ...course, code: 'MINDSET-0' });
  for (const { L, exercises } of units) {
    await WT1Module.insertMany(L.modules.map((m) => ({ ...m, courseCode: 'MINDSET-0' })));
    // practiceLinks[].ref is resolved against Passage/ListeningSection by
    // seedCourse — irrelevant here, give them a plain url.
    await WT1Lesson.insertMany(L.lessons.map((l) => ({
      ...l, published: true,
      practiceLinks: (l.practiceLinks || []).map(({ ref, ...p }) => ({ ...p, url: p.url || '/x' })),
    })));
    await WT1Exercise.insertMany(exercises.map((e) => ({ ...e, published: true })));
  }
});

test('a student can open, do and get marked + shown the answers for every Mindset 0 exercise', async () => {
  const student = await createPremiumStudent();
  const auth = { Authorization: `Bearer ${signTokenFor(student)}` };
  const problems = [];
  let checked = 0;

  for (const { L, exercises } of units) {
    for (const lesson of [...L.lessons].sort((a, b) => a.order - b.order)) {
      const res = await request(app).get(`/api/wt1/lesson/${lesson.code}`).set(auth);
      if (res.status !== 200) { problems.push(`${lesson.code}: lesson ${res.status} ${res.body.message || ''}`); continue; }
      const shown = new Map((res.body.exercises || res.body.lesson?.exercises || []).map((e) => [e.code, e]));
      const mine = exercises.filter((e) => e.lessonCode === lesson.code);

      for (const ex of mine) {
        const seen = shown.get(ex.code);
        if (!seen) { problems.push(`${ex.code}: not in lesson payload`); continue; }

        if (!OBJECTIVE_TYPES.has(ex.type)) {
          await WT1Submission.create({
            userId: student._id, exerciseCode: ex.code, lessonCode: ex.lessonCode, attempt: 1,
            status: 'graded', score: 80, maxScore: 100, responses: ['test answer'],
          });
          continue;
        }

        const leak = leaks(seen);
        if (leak.length) problems.push(`${ex.code}: answer key sent before submission (${leak.join(', ')})`);

        const wrong = await request(app).post('/api/wt1/check').set(auth).send({ exerciseCode: ex.code, answers: wrongAnswers(ex) });
        if (wrong.status !== 200) problems.push(`${ex.code}: wrong-check ${wrong.status} ${wrong.body.message || ''}`);
        else {
          if (wrong.body.correctCount !== 0) problems.push(`${ex.code}: wrong answers scored ${wrong.body.correctCount}/${wrong.body.maxScore}`);
          const noKey = (wrong.body.items || []).filter((r) => !String(r.correctAnswer || '').trim()).map((r) => r.id);
          if (noKey.length || (wrong.body.items || []).length !== ex.items.length) problems.push(`${ex.code}: correct answer not shown for ${noKey.join(',') || 'some items'}`);
        }

        const right = await request(app).post('/api/wt1/check').set(auth).send({ exerciseCode: ex.code, answers: correctAnswers(ex) });
        if (right.status !== 200 || right.body.score !== 100) problems.push(`${ex.code}: book key scored ${right.body.score} (${right.status})`);
        checked++;
      }
    }
  }

  expect(problems).toEqual([]);
  expect(checked).toBe(units.reduce((n, u) => n + u.exercises.filter((e) => OBJECTIVE_TYPES.has(e.type)).length, 0));
});
