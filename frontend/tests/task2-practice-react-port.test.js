/**
 * Task 2 Luyện đề tuần moved to the React app (student-src/src/utils/
 * task2Practice.js). Its rules must give the same answers as the old page
 * (js/task2-practice.js) on every seeded topic: the "Dịch câu" format of each
 * sentence, the blanks and the multiple-choice options, the phrase chunks,
 * the fixed vocab quiz, the conclusion checklist and the guide helpers.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const { topics: SEED } = require(path.join(ROOT, 'backend', 'scripts', 'seedTask2Exercises.js'));
const GUIDES = require(path.join(ROOT, 'backend', 'scripts', 'data', 'task2', 'typeGuides.js'));

let old;
let now;

beforeAll(() => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'task2-practice.js'), 'utf8');
  // eslint-disable-next-line no-eval
  window.eval(code + '\n;window.__t2 = { get state() { return state; }, get pool() { return _drillPool; } };');
  old = window.__t2;

  // The ES module, without its imports (apiFetch is only used by the vocab sync)
  let src = fs.readFileSync(path.join(ROOT, 'student-src', 'src', 'utils', 'task2Practice.js'), 'utf8');
  src = src.replace(/^import .*$/m, 'const apiFetch = () => Promise.reject(new Error("offline"));')
    .replace(/^export (const|function|async function|let) /gm, '$1 ');
  const names = [...src.matchAll(/^(?:const|function|async function|let) (\w+)/gm)].map((m) => m[1]);
  // eslint-disable-next-line no-new-func
  now = new Function(src + '\nreturn {' + names.join(',') + '};')();
});

const clone = (x) => JSON.parse(JSON.stringify(x));
// Same shape the server sends for a topic's practice run
function questionsOf(t) {
  return (t.questions || []).filter((q) => q.isActive !== false).map((q) => {
    const { correctAnswer, modelAnswer, ...rest } = q;
    if (['translation', 'paraphrase'].includes(q.type) && (correctAnswer || modelAnswer)) rest.translationAnswer = correctAnswer || modelAnswer;
    return rest;
  });
}

describe('every seeded topic gets the same drills', () => {
  it.each(SEED.map((t, i) => [i, t.topicName]))('topic %i — %s', (i) => {
    const t = { ...SEED[i], _id: 'topic' + i };
    const a = questionsOf(t);
    const b = clone(a);
    old.state.selectedTopic = t;
    old.state.vocabFor = t._id;
    old.state.vocab = t.vocabularyList;
    window._assignDrillModes(a);
    const pool = now.assignDrillModes(b, t.vocabularyList);
    expect(pool).toEqual(old.pool);
    a.forEach((q, k) => {
      const r = b[k];
      expect([r._mode, r._key]).toEqual([q._mode, q._key]);
      expect(now.drillMode(r)).toBe(window._drillMode(q));
      expect(now.gfBlanks(r)).toEqual(window._gfBlanks(q));
      if (q._mode === 'mcq' && q._key) {
        expect(now.gfOptions(r, pool)).toEqual(window._gfOptions(q));
      }
      if (q.translationAnswer) {
        expect(now.ordChunks(r.translationAnswer)).toEqual(window._ordChunks(q.translationAnswer));
        expect(now.wbwTokenize(r.translationAnswer)).toEqual(window._wbwTokenize(q.translationAnswer));
      }
      expect(now.sentenceParts(r.questionText)).toEqual(window._sentenceParts(q.questionText));
      expect(now.sentenceParts(r.questionText, true)).toEqual(window._sentenceParts(q.questionText, true));
    });
    // The vocab quiz is fixed per topic
    expect(now.buildVocabQuiz(t.vocabularyList, t._id)).toEqual(window._buildVocabQuiz(t.vocabularyList, t._id));
    expect(now.vquizPossible(t.vocabularyList)).toBe(window._vquizPossible(t.vocabularyList));
    // Example sentences: the term is marked in the same place
    t.vocabularyList.forEach((v) => {
      const p = now.termSplit(v.example || '', v.term);
      const html = window._markTermHtml(v.example || '', v.term);
      expect(p ? `${p[0]}<mark class="t2-key">${p[1]}</mark>${p[2]}` : (v.example || '')).toBe(html.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
    });
    expect(now.conclAsksOpinion(t)).toBe(window._conclAsksOpinion(t));
  });
});

describe('the conclusion checklist', () => {
  const t = { essayType: 'agree_disagree', prompt: 'To what extent do you agree?' };
  it.each([
    '',
    'In conclusion, I believe that remote work is beneficial. If companies invest, employees will benefit.',
    'To sum up, both views have merit. Were governments to act, cities would be cleaner.',
    'Overall, it would have been better. Personally, I think so.',
  ])('%s', (text) => {
    expect(now.conclChecks(text, t)).toEqual(window._conclChecks(text, t));
    expect(now.conclChecks(text, { essayType: 'cause_solution', prompt: '' })).toEqual(window._conclChecks(text, { essayType: 'cause_solution', prompt: '' }));
  });
});

describe('the guided-writing helpers', () => {
  it.each(GUIDES.map((g) => [g.typeId, g]))('%s', (_id, g) => {
    expect(now.perBodyChains(g.outline?.perBody)).toEqual(window._perBodyChains(g.outline?.perBody));
    const body1 = g.modelEssay?.sections?.[1];
    if (body1) {
      const html = now.roleSentences(body1.text).map((s) => `<span class="t2-role r-${s.role}"><sup class="t2-role-n">${now.ROLE_NUM[s.role]}</sup>${s.text}</span> `).join('');
      const was = window._roleParagraphHtml(body1.text).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      expect(html).toBe(was);
    }
  });
});

describe('the translate gate', () => {
  it.each([[0, 0, false], [20, 13, false], [20, 14, true], [10, 10, true]])('%i sentences, %i right', (total, right, legacy) => {
    const sentences = Array.from({ length: total }, (_, i) => ({ questionId: 'q' + i, en: 'x', isCorrect: i < right }));
    const lesson = { topicId: 't', status: 'ready', sentences, legacyPassed: legacy };
    old.state.lesson = lesson;
    expect(now.translateProgress(lesson)).toEqual(window.translateProgress('t'));
    expect(now.translateGateMessage(lesson)).toBe(window.translateGateMessage('t'));
  });
});
