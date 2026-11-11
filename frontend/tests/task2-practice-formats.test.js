/**
 * Task 2 practice → "Dịch câu" formats (js/task2-practice.js:
 * _assignDrillModes / _gfBlanks / _gfOptions / gfInit / gfPick /
 * submitPractice). Instead of typing all ~20 sentences word by word, each
 * sentence gets one fixed format: mcq / gap / listen / type, and long
 * sentences are clicked into order. mcq/gap/listen are graded locally.
 */
'use strict';

const fs = require('fs');
const path = require('path');

let t2;

beforeAll(() => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'task2-practice.js'), 'utf8');
  // eslint-disable-next-line no-eval
  window.eval(code + '\n;window.__t2 = { get state() { return state; }, get gf() { return _gf; } };');
  t2 = window.__t2;
  window.apiFetch = jest.fn(() => Promise.reject(new Error('no network in tests')));
  window.showToast = jest.fn();
  window.playOk = jest.fn();
  window.playWrong = jest.fn();
  window.saveDraft = jest.fn();
  window.updateXPStorage = jest.fn();
  window.updateSessionStats = jest.fn();
  window._noteMySentence = jest.fn();
  window._speakSentence = jest.fn();
});

const tr = (i, kw, en, extra = {}) => ({
  _id: 'q' + i, questionId: 'q' + i, type: 'translation', orderIndex: i,
  questionText: `Dịch sang tiếng Anh (dùng từ "${kw}"):\n\n"câu ${i}"`,
  translationAnswer: en, ...extra
});

function topicQuestions() {
  return [
    tr(1, 'online learning', 'Many universities now offer online learning courses.'),
    tr(2, 'flexible schedule', 'Online study provides a flexible schedule for working adults.'),
    tr(3, 'face-to-face interaction', 'Students may miss face-to-face interaction with their teachers.'),
    tr(4, 'learning outcomes', 'Some studies suggest that learning outcomes tend to be lower.'),
    tr(5, 'digital literacy', 'Students need strong digital literacy skills today.'),
    { _id: 'q6', questionId: 'q6', type: 'translation', orderIndex: 6, questionText: 'Dịch câu VÍ DỤ:\n\n"ví dụ"',
      translationAnswer: 'For example, UNESCO reported that at the peak of the pandemic school closures affected more than one and a half billion students around the world.' },
    { _id: 'q7', questionId: 'q7', type: 'short_writing', orderIndex: 7, questionText: 'Viết kết bài', translationAnswer: 'In conclusion, it helps.' },
    { _id: 'q8', questionId: 'q8', type: 'fill_blank', orderIndex: 8, questionText: 'Fill', correctAnswer: 'x' },
  ];
}

function mount(q) {
  document.body.innerHTML = `
    <div id="q-dots"></div>
    <div id="qcard">${window.renderQuestion(q)}</div>
    <button id="submit-btn" disabled></button>
    <div id="checking-loader" class="hidden"><span id="checking-loader-text"></span></div>
    <div id="feedback-card" class="hidden">
      <div id="result-banner"></div><div id="feedback-text"></div>
      <div id="comparison-box"><div id="student-answer-display"></div><div id="model-answer-display"></div></div>
      <div id="explanation-box"><div id="explanation-text"></div></div>
      <div id="t2-countdown-bar"></div>
    </div>`;
  Object.assign(t2.state, {
    questions: [q], questionStatus: ['pending'], currentIdx: 0,
    selectedTopic: { _id: 't1' }, sessionDone: 0, sessionCorrect: 0, sessionAttempts: [],
    autoNext: false, _isSubmitting: false, vocabFor: 't1',
    vocab: [{ term: 'distance education' }, { term: 'blended learning' }, { term: 'virtual classroom' }, { term: 'keep pace with' }],
  });
  window.gfInit();
}

beforeEach(() => { window.showToast.mockClear(); });

describe('_assignDrillModes', () => {
  test('cycles mcq → gap → listen → type; long sentences and short_writing are ordered; other types untouched', () => {
    const qs = topicQuestions();
    t2.state.selectedTopic = { _id: 't1' };
    window._assignDrillModes(qs);
    expect(qs.map(q => window._drillMode(q))).toEqual(['mcq', 'gap', 'listen', 'type', 'mcq', 'order', 'order', null]);
    expect(qs[0]._key.text).toBe('online learning');
  });

  test('the key phrase is found through plural / -ed / -ing endings', () => {
    const q = tr(1, 'interactive platform', 'Interactive platforms such as Zoom make online classes more effective.');
    window._assignDrillModes([q]);
    expect(q._key).toMatchObject({ start: 0, text: 'Interactive platforms' });
  });

  test('a sentence without a key phrase is listened to or typed, never mcq/gap', () => {
    const q = { _id: 'a', type: 'translation', orderIndex: 1, questionText: 'Dịch:\n\n"x"', translationAnswer: 'Governments should invest more money in public transport systems.' };
    window._assignDrillModes([q]);
    expect(q._mode).toBe('listen');
    const blanks = window._gfBlanks(q);
    expect(blanks.length).toBeGreaterThan(0);
    expect(blanks.length).toBeLessThanOrEqual(3);
  });
});

describe('_gfBlanks (listen)', () => {
  test('includes the key phrase, at most 3 blanks, none touching another or the first word', () => {
    const q = tr(3, 'face-to-face interaction', 'Students may miss face-to-face interaction with their teachers and classmates.', { _mode: 'listen' });
    window._assignDrillModes([q]); q._mode = 'listen';
    const b = window._gfBlanks(q);
    expect(b.map(x => x.text)).toContain('face-to-face interaction');
    expect(b.length).toBeLessThanOrEqual(3);
    b.forEach(x => expect(x.start).toBeGreaterThan(0));
    for (let i = 1; i < b.length; i++) expect(b[i].start).toBeGreaterThan(b[i - 1].end + 1);
  });
});

describe('gap', () => {
  function startGap() {
    const qs = topicQuestions();
    t2.state.selectedTopic = { _id: 't1' };
    window._assignDrillModes(qs);
    const q = qs[1];
    expect(q._mode).toBe('gap');
    mount(q);
    return q;
  }
  const fill = v => { const i = document.querySelector('.t2-gf-in'); i.value = v; i.dispatchEvent(new Event('input')); };

  test('shows a first-letter hint and grades a right fill (any case) as correct with the full model sentence', async () => {
    const q = startGap();
    expect(document.querySelector('.t2-gf-in').placeholder).toBe('f_______ s_______');
    fill('Flexible Schedule');
    await window.submitPractice();
    const a = t2.state.sessionAttempts[0];
    expect(a).toMatchObject({ isCorrect: true, userAnswer: q.translationAnswer });
    expect(window.apiFetch).not.toHaveBeenCalledWith('/api/task2/check', expect.anything());
  });

  test('two wrong checks keep the question open; the third fails it and requeues it', async () => {
    startGap();
    for (let i = 1; i <= 2; i++) {
      fill('flexible timetable');
      await window.submitPractice();
      expect(t2.state.questionStatus[0]).toBe('pending');
      expect(document.querySelector('.t2-gf-in').classList.contains('is-wrong')).toBe(true);
    }
    fill('flexible timetable');
    await window.submitPractice();
    expect(t2.state.questionStatus[0]).toBe('wrong');
    expect(t2.state.sessionAttempts[0].isCorrect).toBe(false);
    expect(t2.state.questions).toHaveLength(2);
    expect(t2.state.questions[1]._isRepeat).toBe(true);
  });
});

describe('mcq', () => {
  function startMcq() {
    const qs = topicQuestions();
    t2.state.selectedTopic = { _id: 't1' };
    t2.state.vocabFor = 't1';
    t2.state.vocab = [{ term: 'distance education' }, { term: 'blended learning' }, { term: 'virtual classroom' }, { term: 'keep pace with' }];
    window._assignDrillModes(qs);
    const q = qs[0];
    expect(q._mode).toBe('mcq');
    mount(q);
    return q;
  }

  test('4 options, the same for every student, one right, no preposition-ending fragments', () => {
    const q = startMcq();
    const a = window._gfOptions(q).map(o => o.text);
    const b = window._gfOptions(q).map(o => o.text);
    expect(a).toEqual(b);
    expect(a).toHaveLength(4);
    expect(window._gfOptions(q).filter(o => o.ok)).toHaveLength(1);
    expect(a).not.toContain('keep pace with');
  });

  test('picking submits at once; a wrong pick comes back later as a gap (typed) question', async () => {
    startMcq();
    const wrongIdx = t2.gf.options.findIndex(o => !o.ok);
    window.gfPick(wrongIdx);
    await new Promise(r => setTimeout(r, 0));
    expect(t2.state.questionStatus[0]).toBe('wrong');
    expect(t2.state.questions[1]._mode).toBe('gap');
  });

  test('a right pick is correct', async () => {
    startMcq();
    window.gfPick(t2.gf.options.findIndex(o => o.ok));
    await new Promise(r => setTimeout(r, 0));
    expect(t2.state.questionStatus[0]).toBe('correct');
  });
});

describe('guided writing colours', () => {
  test('sentences are tagged Ý chính → Giải thích → Kết quả → Ví dụ', () => {
    const html = window._roleParagraphHtml('One major advantage is speed. This is mainly because trains are fast. As a result, people save time. For example, the Tokyo line is quick.');
    expect([...html.matchAll(/r-(\w+)/g)].map(m => m[1])).toEqual(['main', 'why', 'result', 'ex']);
  });
});
