// scripts/mindset/buildMindset.js — Mindset unit files → seed JSON
//
//   node scripts/mindset/buildMindset.js m0      # scripts/mindset/m0/*.js → scripts/data/mindset0/
//
// Then:  node scripts/seedMindsetMedia.js mindset0   (audio/images → R2, passages/sections → DB)
//        node scripts/seedCourse.js mindset0         (course / units / lessons / exercises)
//
// Unit file (scripts/mindset/<level>/uNN.js) exports
//   { n, title, titleVi, pages, outcomes[], lessons: { <key>: lesson }, passages[], sections[] }
// lesson = { title?, objectives[], theory[], keyLanguage[], images[], links[], vocab[[w, m, ex]],
//            ex[] (dsl.js exercises), minutes }
// Lesson keys, in this order, become the unit's lessons; the 5 skill lessons save
// their vocab into Sổ 1..5 in turn (same as the printed books):
//   vocab → Sổ 1 · reading → Sổ 2 · writing → Sổ 3 · listening → Sổ 4 · speaking → Sổ 5
'use strict';

const fs = require('fs');
const path = require('path');

const LEVELS = {
  m0: { src: 'm0', out: 'mindset0', prefix: 'M0', course: 'MINDSET-0' },
  m1: { src: 'm1', out: 'mindset1', prefix: 'M1', course: 'MINDSET-1' },
  m2: { src: 'm2', out: 'mindset2', prefix: 'M2', course: 'MINDSET-2' },
};

const KEYS = [
  { key: 'vocab',     icon: '🔤', label: 'Từ vựng & Khởi động', slot: 1 },
  { key: 'reading',   icon: '📖', label: 'Reading',             slot: 2 },
  { key: 'grammar',   icon: '🧩', label: 'Ngữ pháp' },
  { key: 'writing',   icon: '✍️', label: 'Writing',             slot: 3 },
  { key: 'listening', icon: '🎧', label: 'Listening',           slot: 4 },
  { key: 'speaking',  icon: '🗣️', label: 'Speaking',            slot: 5 },
  { key: 'review',    icon: '📝', label: 'Ôn tập cuối Unit' },
];

const OBJECTIVE = new Set(['mcq', 'gap_fill', 'error_correction', 'word_form', 'categorize', 'matching', 'ordering', 'sentence_transform']);
const pad = (n) => String(n).padStart(2, '0');

function buildUnit(lv, u) {
  const mod = `${lv.prefix}-U${pad(u.n)}`;
  const module = {
    code: mod, order: u.n,
    title: `Unit ${u.n} · ${u.titleVi}`,
    titleEn: `UNIT ${pad(u.n)}: ${u.title.toUpperCase()}${u.pages ? ' — sách tr. ' + u.pages : ''}`,
    outcomes: u.outcomes || [],
  };
  const lessons = [];
  const exercises = [];
  let order = 0;
  for (const k of KEYS) {
    const l = u.lessons[k.key];
    if (!l) continue;
    order++;
    const code = `${mod}-L${order}`;
    const exs = (l.ex || []).map((e, i) => {
      const objective = OBJECTIVE.has(e.type);
      return {
        code: `${code}-E${pad(i + 1)}`, lessonCode: code, order: i + 1,
        autoGrade: objective, points: e.points || (objective ? (e.items || []).length : 10),
        source: 'original', difficulty: 1,
        ...e,
      };
    });
    const nObj = exs.filter((e) => OBJECTIVE.has(e.type)).length;
    const nOpen = exs.length - nObj;
    if (!exs.length) throw new Error(`${code}: lesson không có bài tập (gate sẽ khoá các buổi sau)`);
    const lesson = {
      code, moduleCode: mod, order,
      title: `${k.icon} ${l.title || k.label}`,
      titleEn: l.titleEn || '',
      durationMinutes: l.minutes || 45,
      objectives: l.objectives || [],
      keyLanguage: l.keyLanguage || [],
      theory: l.theory || [],
      gate: {
        requireObjectiveCompletion: nObj > 0,
        minObjectiveScorePercent: nObj > 0 ? 70 : 0,
        minWritingSubmissions: Math.min(1, nOpen),
      },
      published: true,
      exerciseCount: exs.length,
      totalPoints: exs.reduce((s, e) => s + (e.points || 0), 0),
    };
    if (l.images && l.images.length) {
      lesson.images = l.images.map((im) => (typeof im === 'string' ? { url: im.split('|')[0], caption: im.split('|')[1] || '' } : im));
    }
    if (l.links && l.links.length) {
      lesson.practiceLinks = l.links.map((p) => {
        if (p.grammar) return { kind: 'grammar', title: p.title, note: p.note || '', url: '/essential-grammar.html?lesson=' + p.grammar };
        return { ref: p.ref, kind: p.ref.split(':')[0], title: p.title, note: p.note || '' };
      });
    }
    // l.slot overrides the per-skill default (Mindset 1/2 print "Sổ N" per unit pair).
    const slot = l.slot || k.slot;
    if (slot && l.vocab && l.vocab.length) {
      lesson.vocabSave = {
        slot,
        title: `Unit ${u.n} · ${l.title || k.label} — ${l.vocab.length} từ/cụm từ`,
        words: l.vocab.map(([word, meaning, example]) => ({ word, meaning, example: example || '' })),
      };
    } else if (l.vocab && l.vocab.length) {
      throw new Error(`${code}: buổi này không có Sổ — thêm slot: N hoặc chuyển từ sang buổi có Sổ`);
    }
    lessons.push(lesson);
    exercises.push(...exs);
  }
  for (const k of Object.keys(u.lessons)) if (!KEYS.some((x) => x.key === k)) throw new Error(`Unit ${u.n}: lesson key lạ "${k}"`);

  const passages = (u.passages || []).map((p) => ({ ...p, courseRef: p.courseRef || p.ref, ref: undefined }));
  const sections = (u.sections || []).map((s) => ({ ...s, courseRef: s.courseRef || s.ref, ref: undefined }));
  return { module, lessons, exercises, passages, sections };
}

function main() {
  const key = process.argv[2];
  const lv = LEVELS[key];
  if (!lv) { console.error('Usage: node scripts/mindset/buildMindset.js <' + Object.keys(LEVELS).join('|') + '>'); process.exit(1); }
  const srcDir = path.join(__dirname, lv.src);
  const outDir = path.join(__dirname, '..', 'data', lv.out);
  fs.mkdirSync(outDir, { recursive: true });
  const course = require(path.join(srcDir, 'course.js'));
  const units = fs.readdirSync(srcDir).filter((f) => /^u\d+\.js$/.test(f)).sort();
  let first = true;
  for (const f of units) {
    const u = require(path.join(srcDir, f));
    const b = buildUnit(lv, u);
    const tag = 'u' + pad(u.n);
    const write = (name, obj) => fs.writeFileSync(path.join(outDir, name), JSON.stringify(obj, null, 1) + '\n');
    write(`lessons-${tag}.json`, { ...(first ? { course: { ...course, code: lv.course } } : {}), modules: [b.module], lessons: b.lessons });
    write(`exercises-${tag}.json`, { exercises: b.exercises });
    write(`practice-${tag}.json`, { passages: b.passages, sections: b.sections });
    console.log(`  ${tag}: ${b.lessons.length} buổi · ${b.exercises.length} bài · ${b.passages.length} reading · ${b.sections.length} listening · ` +
      b.lessons.filter((l) => l.vocabSave).map((l) => `Sổ${l.vocabSave.slot}:${l.vocabSave.words.length}`).join(' '));
    first = false;
  }
  console.log(`→ ${outDir}`);
}

main();
