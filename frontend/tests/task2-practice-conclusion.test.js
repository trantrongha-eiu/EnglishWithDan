/**
 * Task 2 practice → step ③ "Tự viết kết bài" (short_writing, js/task2-
 * practice.js: _renderConclusionQuestion / _conclChecks / _conditionalTypes /
 * _conclAsksOpinion / checkSubmitEnabled). The conclusion is no longer a
 * click-to-order drill of the model: the student sees the Band 7 conclusion
 * template and writes their own paragraph, which the server grades with AI.
 */
'use strict';

const fs = require('fs');
const path = require('path');

let t2;

const TPL = [{
  typeId: 'type03', level: 'band7', name: 'Cause – Solution',
  sections: [
    { title: '① Introduction – Mở bài', items: [{ en: 'In recent years, ...', answer: '' }] },
    { title: '② Body 1', items: [] }, { title: '③ Body 2', items: [] },
    { title: '④ Conclusion – Kết bài', items: [
      { en: 'In conclusion, (noun phrase) remains a ___ issue that requires immediate and coordinated action.', answer: 'complex', vi: '→ Tóm lại, ...' },
      { en: 'If governments, organizations, and individuals work ___, this issue can be significantly alleviated.', answer: 'collaboratively' }
    ] }
  ]
}];

const TOPIC_CS = { _id: 't1', essayType: 'cause_solution', prompt: 'What are the causes of this issue, and what solutions can be implemented?', topicName: 'Stress', brainstormHints: [{ side: 'Causes', points: [] }, { side: 'Solutions', points: [] }] };

beforeAll(() => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'task2-practice.js'), 'utf8');
  // eslint-disable-next-line no-eval
  window.eval(code + '\n;window.__t2 = { get state() { return state; }, setTpl(v) { _tplCache = v; } };');
  t2 = window.__t2;
  window.apiFetch = jest.fn(() => Promise.reject(new Error('no network in tests')));
  window.showToast = jest.fn();
});

describe('_conditionalTypes', () => {
  test.each([
    ['If governments invest in counselling, stress levels will fall.', [1]],
    ['Unless action is taken, the problem can only get worse.', [1]],
    ['If more people were aware of the risks, they would change their habits.', [2]],
    ['Were schools to teach coping skills, students could manage stress better.', [2]],
    ['If they had acted earlier, it would have been avoided.', []],
    ['Stress is rising because of work pressure.', []],
  ])('%s → %j', (s, types) => {
    expect([...window._conditionalTypes(s)].sort()).toEqual(types);
  });
});

describe('_conclAsksOpinion', () => {
  test('opinion essay types always ask', () => {
    expect(window._conclAsksOpinion({ essayType: 'agree_disagree', prompt: '' })).toBe(true);
    expect(window._conclAsksOpinion({ essayType: 'discuss_both_views', prompt: '' })).toBe(true);
  });
  test('other types only when the prompt asks', () => {
    expect(window._conclAsksOpinion(TOPIC_CS)).toBe(false);
    expect(window._conclAsksOpinion({ essayType: 'advantages_disadvantages', prompt: 'Do the advantages outweigh the disadvantages?' })).toBe(true);
  });
});

describe('_conclChecks', () => {
  test('a good conclusion ticks start, length and the conditional bonus', () => {
    const text = 'In conclusion, work pressure and social media are the main causes of rising stress. However, if schools and employers provide accessible counselling, public mental well-being will improve significantly over time.';
    const checks = window._conclChecks(text, TOPIC_CS);
    expect(checks.map(c => c.ok)).toEqual([true, true, true]);
    expect(checks[2].label).toBe('Câu điều kiện loại 1');
  });
  test('an opinion check is added when the prompt asks for a view', () => {
    const checks = window._conclChecks('To sum up, it is good.', { essayType: 'agree_disagree', prompt: '' });
    expect(checks.map(c => c.label)).toContain('Nêu ý kiến của bạn');
    expect(checks.find(c => c.label === 'Nêu ý kiến của bạn').ok).toBe(false);
  });
});

describe('_renderConclusionQuestion', () => {
  beforeEach(() => {
    Object.assign(t2.state, {
      selectedTopic: TOPIC_CS, currentMode: 'practice', currentIdx: 0,
      lesson: { topicId: 't1', status: 'ready', sentences: [{ questionId: 'q9', type: 'short_writing', en: 'In conclusion, earlier draft.', isCorrect: false }], sections: { intro: '', body1: 'Body one text.', body2: '', conclusion: '' } },
      brainstorm: { topicId: 't1', notes: ['work pressure', ''], open: true, hintOpen: false },
    });
    t2.setTpl(TPL);
  });

  test('shows the Band 7 conclusion frames, the hints and the previous draft — never the model', () => {
    const q = { _id: 'q9', questionId: 'q9', type: 'short_writing', questionText: 'Tự viết ĐOẠN KẾT BÀI', translationAnswer: 'SECRET MODEL' };
    t2.state.questions = [q];
    const html = window.renderQuestion(q);
    document.body.innerHTML = `<div id="qcard">${html}</div><button id="submit-btn" disabled></button>`;
    const tpl = document.getElementById('t2-concl-tpl');
    expect(tpl.querySelectorAll('li')).toHaveLength(2);
    expect(tpl.textContent).toContain('remains a complex issue');
    expect(tpl.querySelector('mark').textContent).toBe('(noun phrase)');
    expect(document.querySelector('.t2-concl-hints').textContent).toMatch(/câu điều kiện loại 1 hoặc 2/);
    expect(document.querySelector('.t2-concl-hints').textContent).toMatch(/không hỏi ý kiến/);
    expect(document.querySelector('.t2-concl-mine').textContent).toContain('Body one text.');
    expect(document.getElementById('answer-box').value).toBe('In conclusion, earlier draft.');
    expect(html).not.toContain('SECRET MODEL');
    expect(document.getElementById('t2-ord')).toBeNull();
    expect(window._drillMode(q)).toBe('write');
  });

  test('Kiểm tra unlocks only from 15 words', () => {
    const q = { _id: 'q9', questionId: 'q9', type: 'short_writing', questionText: 'x' };
    t2.state.questions = [q];
    document.body.innerHTML = `<div id="qcard">${window.renderQuestion(q)}</div><button id="submit-btn" disabled></button>`;
    const ta = document.getElementById('answer-box');
    ta.value = 'In conclusion, too short.';
    window.onConclInput(ta);
    expect(document.getElementById('submit-btn').disabled).toBe(true);
    ta.value = 'In conclusion, work pressure and social media are the main causes, and counselling at school would help a great deal.';
    window.onConclInput(ta);
    expect(document.getElementById('submit-btn').disabled).toBe(false);
    expect(document.getElementById('t2-concl-checks').textContent).toMatch(/In conclusion/);
  });
});

describe('sentences taken from Daniel\'s model essay', () => {
  const S = (id, head, en, ok, type = 'translation') => ({ questionId: id, type, questionText: `${head} · Dịch câu trong bài mẫu:\n\n"vi ${id}"`, model: en, en: ok == null ? '' : en, isCorrect: ok });

  test('translateProgress: legacyPassed keeps writing open even with the new set unfinished', () => {
    t2.state.lesson = { topicId: 't1', status: 'ready', sections: {}, legacyPassed: true,
      sentences: [S('a', 'MỞ BÀI', 'A.', null), S('b', 'THÂN BÀI 1', 'B.', null)] };
    expect(window.translateProgress('t1')).toMatchObject({ passed: true, need: 0, legacy: true });
    t2.state.lesson.legacyPassed = false;
    expect(window.translateProgress('t1')).toMatchObject({ passed: false, need: 2 });
  });

  test('the writer lists them per paragraph (Mở bài / Thân bài 1 / Thân bài 2 / Kết bài)', () => {
    t2.state.selectedTopic = TOPIC_CS;
    t2.state.lesson = { topicId: 't1', status: 'ready', sections: {}, sentences: [
      S('a', 'MỞ BÀI', 'Intro one.', true), S('b', 'THÂN BÀI 1', 'Body one.', true),
      S('c', 'THÂN BÀI 2', 'Body two.', null), S('d', 'x', 'In conclusion, mine.', true, 'short_writing')] };
    t2.state.compose = { phase: 'class', tab: 'sentences', revealed: {} };
    document.body.innerHTML = window._refSentences();
    expect([...document.querySelectorAll('.t2c-group')].map(g => g.textContent)).toEqual(['Mở bài', 'Thân bài 1', 'Thân bài 2', 'Kết bài bạn tự viết']);
  });
});
