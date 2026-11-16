'use strict';

// js/mindset-course.js — a Mindset lesson in book order (debug pass
// 2026-11-16): Reading/Listening tests slotted between the exercises, each
// book picture next to the exercise that uses it, and "Bài tiếp theo" going
// to the test that comes next in the book instead of skipping it.
const fs = require('fs');
const path = require('path');

function loadCfg() {
  document.body.setAttribute('data-mindset-level', '1');
  delete window.SPEAKING_COURSE_OVERRIDE;
  window.eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'mindset-course.js'), 'utf8'));
  return window.SPEAKING_COURSE_OVERRIDE({});
}

const exercises = [
  { code: 'M1-U01-L2-E01', title: 'Finding information (Ex. 4)' },
  { code: 'M1-U01-L2-E02', title: 'Identifying the key words (Ex. 5)' },
  { code: 'M1-U01-L2-E03', title: 'Scanning a text (Ex. 6)' },
  { code: 'M1-U01-L2-E04', title: 'Correct the answers (Ex. 8)' },
];
const reading = (title, step, result) => ({ kind: 'reading', title, step, url: '/reading.html?passageId=p1', result });
function lesson(links, images) {
  return { code: 'M1-U01-L2', practiceLinks: links, images: images || [] };
}
const cards = exercises.map((e) => '<div class="t1-ex-card" data-code="' + e.code + '"></div>');

function stepsOf(html) {
  const box = document.createElement('div');
  box.innerHTML = html;
  return [...box.children].filter((n) => n.matches('.ms-step, .ms-step-imgs')).map((n) => {
    if (n.matches('.ms-step-imgs')) return 'img:' + n.querySelector('figcaption').textContent;
    const card = n.querySelector('.t1-ex-card');
    return n.querySelector('.ms-step-n').textContent + ':' + (card ? card.dataset.code : 'task ' + n.querySelector('.ms-task-body b').textContent);
  });
}

test('tests sit at their book step; every lesson gets numbered steps', () => {
  const cfg = loadCfg();
  const l = lesson([reading('Blood is thicker than water (Ex. 5–8)', 2), reading('Exam skills (Ex. 12)', 4), { kind: 'grammar', title: 'G', url: '/g' }]);
  expect(stepsOf(cfg.lessonList(l, cards, exercises))).toEqual([
    '1:M1-U01-L2-E01', '2:M1-U01-L2-E02', '3:task Blood is thicker than water (Ex. 5–8)',
    '4:M1-U01-L2-E03', '5:M1-U01-L2-E04', '6:task Exam skills (Ex. 12)',
  ]);
  // no tests at all → still numbered, in order
  expect(stepsOf(cfg.lessonList(lesson([]), cards, exercises))).toEqual([
    '1:M1-U01-L2-E01', '2:M1-U01-L2-E02', '3:M1-U01-L2-E03', '4:M1-U01-L2-E04',
  ]);
});

test('an "Ex. N" picture goes right before exercise N; Lead-in pictures stay on top', () => {
  const cfg = loadCfg();
  const l = lesson([], [
    { url: 'a.jpg', caption: 'Lead-in (p. 8): pictures' },
    { url: 'b.jpg', caption: 'Ex. 4 (p. 9): first exercise' },
    { url: 'c.jpg', caption: 'Ex. 6 (p. 10): the map' },
  ]);
  E_STATE(cfg, exercises);
  expect(stepsOf(cfg.lessonList(l, cards, exercises))).toEqual([
    '1:M1-U01-L2-E01', '2:M1-U01-L2-E02', 'img:Ex. 6 (p. 10): the map', '3:M1-U01-L2-E03', '4:M1-U01-L2-E04',
  ]);
  const top = cfg.lessonExtra(l);
  expect(top).toContain('a.jpg');
  expect(top).toContain('b.jpg'); // its exercise is step 1 anyway
  expect(top).not.toContain('c.jpg');
});

// lessonExtra reads the engine's current exercises (set up in cfg.setup)
function E_STATE(cfg, exs) {
  cfg.setup({ state: { exercises: exs } });
}

test('"Bài tiếp theo" goes to the unpassed test between two exercises, then back to the next exercise', () => {
  const cfg = loadCfg();
  const l = lesson([reading('Blood is thicker than water (Ex. 5–8)', 2), reading('Exam skills (Ex. 12)', 4)]);
  expect(cfg.nextStep(l, 0, exercises)).toBeNull();
  const nx = cfg.nextStep(l, 1, exercises);
  expect(nx.label).toBe('Tiếp theo: bài Reading “Blood is thicker than water”');
  const back = decodeURIComponent(nx.href.split('returnTo=')[1]);
  expect(back).toBe('/mindset-1.html?lesson=M1-U01-L2&ex=M1-U01-L2-E03');
  // the end-of-lesson screen leads to the Exam skills test
  expect(cfg.lessonDoneNext(l, exercises).label).toContain('Exam skills');
});

test('a passed test is not forced again; two tests in a row come back to the step list', () => {
  const cfg = loadCfg();
  const passed = lesson([reading('Blood (Ex. 5)', 2, { total: 7, correct: 6, percent: 86 })]);
  expect(cfg.nextStep(passed, 1, exercises)).toBeNull();
  const two = lesson([reading('One (Ex. 5)', 2), reading('Two (Ex. 5)', 2)]);
  const back = decodeURIComponent(cfg.nextStep(two, 1, exercises).href.split('returnTo=')[1]);
  expect(back).toBe('/mindset-1.html?lesson=M1-U01-L2');
});
