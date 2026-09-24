/**
 * Listening Tips → "🎧 Luyện tập" (js/listening-tips-practice.js).
 *
 * Loaded like the Reading Tips practice test: the page script's source run
 * with an indirect eval against the jsdom window, next to the real
 * utils.js (escHtml) and api-client.js (ApiClient.handleResponse). Only
 * the network (fetch), AuthService and the browser APIs jsdom lacks
 * (media playback, scrolling, matchMedia) are faked. Payload fixtures
 * mirror GET /api/listening-tips/:lessonKey/practice — no answer key
 * except the worked example's `guide`.
 *
 * Covers the frontend side of the spec's cases 6–14 (guided Q1 / Q2,
 * nothing revealed before checking, score, retry, audio) plus the loading /
 * empty / error states, stale saved practices and browser-only persistence.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { loadScript } = require('./helpers/loadScript');

const SECTION = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const OTHER = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const AUDIO = 'https://res.cloudinary.com/demo/video/upload/club.mp3';
const OTHER_AUDIO = 'https://res.cloudinary.com/demo/video/upload/other.mp3';
const INSTRUCTION = 'Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.';

const formPractice = () => ({
  fixed: true, kind: 'qtype', qtype: 'form', sectionId: SECTION, sectionTitle: 'Holiday club', sourceName: 'Part 1 · Holiday club',
  audioUrl: AUDIO, audioDuration: 240,
  questions: [
    { questionNumber: 1, instruction: INSTRUCTION, segment: { start: 29, end: 47.5 }, mode: 'example', input: 'text',
      text: 'Postcode: _____', context: 'Booking form', wordLimit: 'ONE WORD AND/OR A NUMBER',
      guide: { keywords: ['Postcode'], signals: [], type: 'number', answer: 'BS4 7JN', where: 'Đầu bài.', why: 'Mã bưu điện là BS4 7JN.',
        evidence: { text: 'Please write your postcode, it is BS4 7JN.', speaker: '', start: 40, end: 46 }, traps: [], directions: [] } },
    { questionNumber: 2, instruction: INSTRUCTION, segment: { start: 45, end: 57.5 }, mode: 'guided', input: 'text',
      text: 'Date of trip: _____ June', context: 'Booking form', wordLimit: 'ONE WORD AND/OR A NUMBER',
      coach: { keywords: ['Date', 'trip'], signals: [], predict: true } },
    { questionNumber: 3, instruction: INSTRUCTION, segment: { start: 55, end: 67.5 }, mode: 'solo', input: 'text',
      text: 'Bring a _____', context: 'Booking form', wordLimit: 'ONE WORD AND/OR A NUMBER' },
  ],
});

const LETTERS = ['the lake', 'the forest', 'the food', 'the beach', 'the museum'].map((label, i) => ({ key: String.fromCharCode(65 + i), label }));
const multiPractice = () => ({
  fixed: true, kind: 'qtype', qtype: 'multi', sectionId: SECTION, sectionTitle: 'Holiday club', sourceName: 'Part 3 · Holiday club',
  audioUrl: AUDIO, audioDuration: 240,
  questions: [
    { questionNumber: 21, numbers: [21, 22], pick: 2, input: 'multi', mode: 'example', instruction: 'Choose TWO letters, A–E.',
      text: 'Which TWO sports does Tom play?', segment: { start: 12, end: 40 }, choices: LETTERS,
      sectionId: OTHER, sourceName: 'Part 3 · Sports day', audioUrl: OTHER_AUDIO, audioDuration: 300,
      guide: { keywords: ['sports', 'Tom'], signals: [], type: null, answer: 'A, C', where: '', why: 'Tom chơi A và C.',
        evidence: { text: 'I play at the lake and near the food stalls.', speaker: 'TOM', start: 20, end: 26 }, traps: ['B'], directions: [] } },
    { questionNumber: 11, numbers: [11, 12], pick: 2, input: 'multi', mode: 'guided', instruction: 'Choose TWO letters, A–E.',
      text: 'Which TWO things does the speaker like best?', segment: { start: 130, end: 150 }, choices: LETTERS,
      coach: { keywords: ['things', 'speaker'], signals: [], predict: false } },
    { questionNumber: 13, numbers: [13, 14], pick: 2, input: 'multi', mode: 'solo', instruction: 'Choose TWO letters, A–E.',
      text: 'Which TWO places will they visit?', segment: { start: 150, end: 170 }, choices: LETTERS },
  ],
});

const wordclassPractice = () => ({
  fixed: true, kind: 'wordclass',
  items: [
    { sectionId: SECTION, sourceName: 'Part 1 · Holiday club', questionNumber: 3, text: 'Bring a _____', context: 'Booking form', wordLimit: 'ONE WORD ONLY' },
    { sectionId: SECTION, sourceName: 'Part 1 · Holiday club', questionNumber: 7, text: 'The rooms are very _____', context: '', wordLimit: 'ONE WORD ONLY' },
  ],
});

const LESSONS = {
  form: { lessonKey: 'form-note-table-completion', hasPractice: true },
  multi: { lessonKey: 'multiple-answers', hasPractice: true },
  wordclass: { lessonKey: 'predict-noun-adjective-verb', hasPractice: true },
};

// ── fakes ────────────────────────────────────────────────────────────────

let slot;
let loggedIn;
let routes; // [{ match(url, opts) → bool, reply(url, opts) → { status, body } | Promise(never) }]
let calls;

const respond = ({ status = 200, body = {} }) => ({ status, ok: status >= 200 && status < 300, text: async () => JSON.stringify(body) });
function route(method, pattern, reply) {
  routes.unshift({ match: (url, opts) => (opts.method || 'GET') === method && pattern.test(url), reply });
}
const getPractice = (practice) => route('GET', /\/practice(\?|$)/, () => ({ body: { success: true, practice } }));
const onCheck = (fn) => route('POST', /\/practice\/check$/, (url, opts) => ({ body: { success: true, result: fn(JSON.parse(opts.body)) } }));
const checkBodies = () => calls.filter(c => c.opts.method === 'POST').map(c => JSON.parse(c.opts.body));

const settle = async () => { for (let i = 0; i < 6; i++) await new Promise(r => setTimeout(r, 0)); };
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const text = (sel) => ($(sel) ? $(sel).textContent.replace(/\s+/g, ' ').trim() : '');
function click(sel, i = 0) {
  const el = typeof sel === 'string' ? $$(sel)[i] : sel;
  if (!el) throw new Error(`nothing to click: ${sel} [${i}]`);
  el.click();
}
function type(value) {
  const input = $('#ltp-panel .ltp-input');
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
async function open(lesson, practice) {
  if (practice) getPractice(practice);
  window.LTPractice.mount(lesson, slot);
  click('#ltp-entry-wrap [data-act="start"]');
  await settle();
}
const audio = () => $('audio.ltp-audio');

beforeAll(() => {
  loadScript('utils.js'); // escHtml
  loadScript('api-client.js'); // ApiClient.handleResponse
  window.eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'listening-tips-practice.js'), 'utf8'));
});

beforeEach(() => {
  localStorage.clear();
  loggedIn = true;
  routes = [];
  calls = [];
  window.API = 'https://api.test/api';
  window.fetch = jest.fn((url, opts = {}) => {
    calls.push({ url, opts });
    const r = routes.find(x => x.match(url, opts));
    if (!r) return Promise.reject(new TypeError('Failed to fetch'));
    const out = r.reply(url, opts);
    return out && typeof out.then === 'function' ? out : Promise.resolve(respond(out));
  });
  window.AuthService = {
    isLoggedIn: () => loggedIn,
    getUser: () => ({ _id: 'student1' }),
    authHeader: () => ({ Authorization: 'Bearer t' }),
    buildLoginUrl: (next) => '/login.html?next=' + encodeURIComponent(next),
    logout: jest.fn(),
  };
  window.confirmDialog = undefined;
  window.openUpgradeModal = jest.fn();
  window.showToast = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
  window.scrollBy = jest.fn();
  window.matchMedia = () => ({ matches: false });
  // jsdom has no media playback
  window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
  window.HTMLMediaElement.prototype.pause = jest.fn();
  window.HTMLMediaElement.prototype.load = jest.fn();
  // the module makes its one <audio> once and keeps it: survive the body reset
  const kept = document.querySelector('audio.ltp-audio');
  document.body.innerHTML = '<div id="slot"></div>';
  if (kept) document.body.appendChild(kept);
  slot = document.getElementById('slot');
});

afterEach(() => {
  window.LTPractice.mount(null, null); // stops audio / timers, drops the practice
  jest.useRealTimers();
});

// ── tests ────────────────────────────────────────────────────────────────

describe('entry card: nothing loads until the student clicks', () => {
  test('supports() only tips that have a practice', () => {
    expect(window.LTPractice.supports(LESSONS.form)).toBe(true);
    expect(window.LTPractice.supports({ lessonKey: 'band-5-tips', hasPractice: false })).toBe(false);
    expect(window.LTPractice.supports({ lessonKey: 'not-a-practice', hasPractice: true })).toBe(false);
  });

  test('mount renders the entry card and fetches nothing', () => {
    window.LTPractice.mount(LESSONS.form, slot);
    expect(text('.ltp-entry-title')).toBe('Luyện tập Form / Note / Table Completion');
    expect(text('#ltp-entry-wrap [data-act="start"]')).toContain('Bắt đầu luyện tập');
    expect($('#ltp-panel').hidden).toBe(true);
    expect(window.fetch).not.toHaveBeenCalled();
  });
});

describe('loading / empty / error states', () => {
  test('loading: message + disabled button, and a "server waking up" note after 6s', () => {
    jest.useFakeTimers();
    route('GET', /\/practice/, () => new Promise(() => {}));
    window.LTPractice.mount(LESSONS.form, slot);
    click('#ltp-entry-wrap [data-act="start"]');
    expect(text('#ltp-panel')).toContain('Đang tải bài luyện tập');
    expect($('#ltp-entry-wrap [data-act="start"]').disabled).toBe(true);
    expect($('.ltp-state-slow').hidden).toBe(true);
    jest.advanceTimersByTime(6000);
    expect($('.ltp-state-slow').hidden).toBe(false);
  });

  test('empty state (nothing suitable in the bank) with a close button', async () => {
    await open(LESSONS.form, null);
    getPractice(null);
    click('#ltp-entry-wrap [data-act="start"]');
    await settle();
    expect(text('#ltp-panel')).toContain('Chưa tìm thấy bài luyện tập phù hợp');
    click('[data-act="dismiss"]');
    expect($('#ltp-panel').hidden).toBe(true);
  });

  test.each([
    ['server error', () => ({ status: 500, body: { success: false, message: 'Lỗi server' } }), 'Máy chủ đang gặp sự cố'],
    ['no network', null, 'Không kết nối được máy chủ'],
  ])('%s → a plain message and "Thử lại" that loads again', async (_name, reply, msg) => {
    if (reply) route('GET', /\/practice/, reply);
    window.LTPractice.mount(LESSONS.form, slot);
    click('#ltp-entry-wrap [data-act="start"]');
    await settle();
    expect(text('.ltp-state-error')).toContain(msg);
    getPractice(formPractice());
    click('.ltp-state-error [data-act="start"]');
    await settle();
    expect($('.ltp-intro')).not.toBeNull();
  });

  test('premium required → upgrade button', async () => {
    route('GET', /\/practice/, () => ({ status: 403, body: { success: false, requiresPremium: true, message: 'Cần Premium.' } }));
    await open(LESSONS.form);
    expect(text('#ltp-panel')).toContain('Cần Premium.');
    click('[data-act="upgrade"]');
    expect(window.openUpgradeModal).toHaveBeenCalled();
  });

  test('logged out → login link that comes back here, no request', () => {
    loggedIn = false;
    window.LTPractice.mount(LESSONS.form, slot);
    click('#ltp-entry-wrap [data-act="start"]');
    expect($('#ltp-panel a.ltp-btn').getAttribute('href')).toMatch(/^\/login\.html\?next=/);
    expect(window.fetch).not.toHaveBeenCalled();
  });
});

describe('question types: Q1 I DO → Q2 WE DO → Q3+ YOU DO (spec cases 6–13)', () => {
  const grade = (b) => ({
    2: { questionNumber: 2, isCorrect: b.answer === '5', correctAnswer: '5th/5', explanation: 'Ngày 5 tháng 6.',
      evidence: { text: 'The trip is on the 5th of June.', speaker: '', start: 50, end: 56 }, diagnosis: null,
      category: 'date', prediction: b.prediction || null, predictionCorrect: b.prediction ? b.prediction === 'date' : null },
    3: { questionNumber: 3, isCorrect: false, correctAnswer: 'raincoat', explanation: '', evidence: { text: 'You need to bring a raincoat.', start: 60, end: 66 },
      diagnosis: { kind: 'spelling', note: 'Sai chính tả.' }, category: 'word', prediction: null, predictionCorrect: null },
  }[b.questionNumber]);

  test('intro, then the worked example: six steps one at a time, its answer only at step 5, no check request, not scored', async () => {
    onCheck(grade);
    await open(LESSONS.form, formPractice());
    expect($('.ltp-flow')).not.toBeNull(); // Câu 1 xem mẫu · Câu 2 làm cùng · từ câu 3 tự làm
    click('[data-act="intro-done"]');
    expect($('.ltp-mode.ex')).not.toBeNull();
    expect($$('.ltp-gstep')).toHaveLength(0);
    expect($('#ltp-panel .ltp-input, #ltp-panel [data-act="check"]')).toBeNull();
    for (let k = 1; k <= 4; k++) click('[data-act="ex-next"]');
    expect(text('.ltp-gstep.current')).toContain('Please write your postcode'); // step 4: the line of the transcript
    expect($('.ltp-answer')).toBeNull(); // …the answer itself comes at step 5
    click('[data-act="ex-next"]');
    expect(text('.ltp-gstep.current')).toContain('Đáp án');
    expect(text('.ltp-gstep.current .ltp-answer')).toBe('BS4 7JN');
    click('[data-act="ex-next"]');
    expect(text('.ltp-gstep.current')).toContain('Mã bưu điện là BS4 7JN.');
    expect($('[data-act="ex-next"]')).toBeNull();
    expect(text('.ltp-done')).toBe('1/3 đã làm');
    expect(checkBodies()).toHaveLength(0);
    expect(text('#ltp-live')).toContain('Bước 6');
  });

  test('Q2 together: highlight → suggested keywords → predict → listen → answer; the verdict and the type come from the check', async () => {
    onCheck(grade);
    await open(LESSONS.form, formPractice());
    click('[data-act="intro-done"]');
    click('[data-act="next"]');
    expect($('.ltp-mode.we')).not.toBeNull();
    expect($('#ltp-panel .ltp-input, #ltp-panel .ltp-player')).toBeNull();
    expect($('[data-act="kw-done"]').disabled).toBe(true);
    click('.ltp-tok[data-act="kw"]', 0); // "Date"
    click('[data-act="kw-done"]');
    expect(text('.ltp-kwfb')).toContain('Date');
    expect($('[data-act="g-next"]').disabled).toBe(true); // predict first
    click('.ltp-type[data-val="date"]');
    click('[data-act="g-next"]');
    expect($('.ltp-gstep.current .ltp-player')).not.toBeNull();
    click('[data-act="g-next"]');
    expect($('[data-act="check"]').disabled).toBe(true);
    type('5');
    expect($('[data-act="check"]').disabled).toBe(false);
    expect(text('#ltp-panel')).not.toContain('5th');
    click('[data-act="check"]');
    await settle();
    expect(checkBodies()).toEqual([{ sectionId: SECTION, questionNumber: 2, answer: '5', prediction: 'date' }]);
    expect(text('.ltp-verdict')).toContain('Chính xác');
    expect(text('.ltp-predres')).toContain('✓');
    expect(text('.ltp-evidence')).toContain('The trip is on the 5th of June.');
  });

  test('Q3 alone (Enter checks); the score leaves the example out; review and retry', async () => {
    onCheck(grade);
    await open(LESSONS.form, formPractice());
    click('[data-act="intro-done"]');
    for (let k = 0; k < 6; k++) click('[data-act="ex-next"]');
    click('[data-act="next"]');
    click('.ltp-tok[data-act="kw"]', 0);
    click('[data-act="kw-done"]');
    click('.ltp-type[data-val="number"]');
    click('[data-act="g-next"]');
    click('[data-act="g-next"]');
    type('4');
    click('[data-act="check"]');
    await settle();
    expect(text('.ltp-predres')).toContain('thực tế là');
    click('[data-act="next"]');
    expect($('.ltp-mode.you')).not.toBeNull();
    expect($$('.ltp-gstep')).toHaveLength(0);
    type('rainkoat');
    $('#ltp-panel .ltp-input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
    expect(checkBodies()[1]).toEqual({ sectionId: SECTION, questionNumber: 3, answer: 'rainkoat' });
    expect(text('.ltp-feedback')).toContain('raincoat');
    expect(text('.ltp-diag')).toContain('Sai chính tả.');
    click('[data-act="finish"]');
    expect(text('.ltp-score')).toBe('0 / 2');
    expect($$('.ltp-result-row.ex')).toHaveLength(1);
    click('[data-act="review"]');
    expect($$('.ltp-gstep')).toHaveLength(6); // the example as it was left
    click('[data-act="next"]');
    click('[data-act="next"]');
    click('[data-act="finish"]');
    expect(text('.ltp-score')).toBe('0 / 2'); // counted once
    click('[data-act="retry"]');
    expect($$('.ltp-gstep')).toHaveLength(0);
    expect(text('.ltp-done')).toBe('0/3 đã làm');
  });

  test('"choose TWO" done together: highlighted words never use up the letters (regression)', async () => {
    onCheck(() => ({ questionNumber: 11, isCorrect: true, correctCount: 2, total: 2, correctAnswer: 'A, B', perQuestion: [], explanation: '', evidence: null }));
    await open(LESSONS.multi, multiPractice());
    click('[data-act="intro-done"]');
    for (let k = 0; k < 6; k++) click('[data-act="ex-next"]');
    expect($$('.ltp-opt.correct-ans').map(e => e.textContent.trim()[0])).toEqual(['A', 'C']); // shown, never pickable
    expect($('[data-act="mpick"]')).toBeNull();
    click('[data-act="next"]');
    click('.ltp-tok[data-act="kw"]', 1);
    click('.ltp-tok[data-act="kw"]', 3);
    click('[data-act="kw-done"]');
    click('[data-act="g-next"]'); // no type to predict for letters
    click('[data-act="g-next"]');
    click('[data-act="mpick"][data-val="B"]');
    click('[data-act="mpick"][data-val="A"]');
    click('[data-act="mpick"][data-val="D"]'); // a third is refused
    expect($$('.ltp-opt.selected')).toHaveLength(2);
    click('[data-act="check"]');
    await settle();
    expect(checkBodies()).toEqual([{ sectionId: SECTION, questionNumber: 11, answer: '["A","B"]' }]);
    expect(text('.ltp-verdict')).toContain('Chính xác');
  });
});

describe('audio (spec case 14)', () => {
  test('each question plays its own stretch; a borrowed example plays its own section', async () => {
    await open(LESSONS.multi, multiPractice());
    click('[data-act="intro-done"]');
    for (let k = 0; k < 3; k++) click('[data-act="ex-next"]');
    click('.ltp-gstep.current [data-act="play"]');
    expect(audio().getAttribute('src')).toBe(OTHER_AUDIO);
    audio().dispatchEvent(new Event('loadedmetadata'));
    expect(audio().currentTime).toBe(12);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  test('a failed load says so, and ▶ tries again (reloads the file)', async () => {
    await open(LESSONS.form, formPractice());
    click('[data-act="intro-done"]');
    for (let k = 0; k < 3; k++) click('[data-act="ex-next"]');
    click('.ltp-gstep.current [data-act="play"]');
    const loads = window.HTMLMediaElement.prototype.load.mock.calls.length;
    audio().dispatchEvent(new Event('error'));
    expect(text('.ltp-gstep.current .ltp-time')).toContain('Không phát được audio');
    click('.ltp-gstep.current [data-act="play"]');
    expect(window.HTMLMediaElement.prototype.load.mock.calls.length).toBe(loads + 1);
  });

  test('a stalled download says the network is slow', async () => {
    await open(LESSONS.form, formPractice());
    click('[data-act="intro-done"]');
    for (let k = 0; k < 3; k++) click('[data-act="ex-next"]');
    jest.useFakeTimers();
    click('.ltp-gstep.current [data-act="play"]');
    jest.advanceTimersByTime(15000);
    expect(text('.ltp-gstep.current .ltp-time')).toContain('Mạng chậm');
  });
});

describe('prediction tips: text only', () => {
  test('no audio; the prediction is what gets checked; the reveal shows why and the real answer', async () => {
    onCheck((b) => ({ questionNumber: b.questionNumber, isCorrect: b.prediction === 'noun', prediction: b.prediction, category: 'noun',
      reason: 'Sau "a" là danh từ số ít.', signal: 'a', correctAnswer: 'raincoat', explanation: '', evidence: { text: 'You need to bring a raincoat.', speaker: '' } }));
    await open(LESSONS.wordclass, wordclassPractice());
    expect($('#ltp-panel .ltp-player')).toBeNull();
    expect($('[data-act="check"]').disabled).toBe(true);
    click('.ltp-type[data-val="noun"]');
    click('[data-act="check"]');
    await settle();
    expect(checkBodies()).toEqual([{ sectionId: SECTION, questionNumber: 3, prediction: 'noun' }]);
    expect(text('.ltp-feedback')).toContain('Đáp án trong đề');
    expect(text('.ltp-feedback')).toContain('raincoat');
    expect($('.ltp-sig')).not.toBeNull(); // the signal word marked in the question
  });
});

describe('errors while practising', () => {
  test('a saved practice whose section changed: an in-place notice and a fresh practice, not a toast loop', async () => {
    route('POST', /\/practice\/check$/, () => ({ status: 400, body: { success: false, code: 'NOT_IN_PRACTICE', message: 'Câu hỏi này không thuộc bài luyện tập.' } }));
    await open(LESSONS.form, formPractice());
    click('[data-act="intro-done"]');
    click('[data-act="next"]');
    click('[data-act="next"]');
    type('coat');
    click('[data-act="check"]');
    await settle();
    expect(text('.ltp-stale')).toContain('không chấm được nữa');
    expect(window.showToast).not.toHaveBeenCalled();
    getPractice(formPractice());
    click('.ltp-stale [data-act="start"]');
    await settle();
    expect($('.ltp-intro')).not.toBeNull();
  });

  test('a passing server error keeps the answer and lets the student check again', async () => {
    route('POST', /\/practice\/check$/, () => ({ status: 500, body: { success: false, message: 'Lỗi server' } }));
    await open(LESSONS.wordclass, wordclassPractice());
    click('.ltp-type[data-val="verb"]');
    click('[data-act="check"]');
    await settle();
    expect(window.showToast).toHaveBeenCalledWith(expect.stringContaining('Máy chủ'), 'error');
    expect($('[data-act="check"]').disabled).toBe(false);
    expect($('.ltp-type.on').dataset.val).toBe('verb');
  });
});

describe('browser-only persistence', () => {
  test('an unfinished practice is offered again where it was left (example steps included)', async () => {
    await open(LESSONS.form, formPractice());
    click('[data-act="intro-done"]');
    for (let k = 0; k < 3; k++) click('[data-act="ex-next"]');
    window.LTPractice.mount(LESSONS.form, slot); // leaving and coming back
    expect(text('#ltp-entry-wrap [data-act="resume"]')).toContain('Tiếp tục bài đang làm (Câu 1/3)');
    click('#ltp-entry-wrap [data-act="resume"]');
    expect($$('.ltp-gstep')).toHaveLength(3);
    expect(window.fetch).toHaveBeenCalledTimes(1);
  });

  test('"Làm lại từ đầu" asks before throwing away work, then reloads the same fixed practice (no ?exclude=)', async () => {
    await open(LESSONS.form, formPractice());
    click('[data-act="intro-done"]');
    for (let k = 0; k < 3; k++) click('[data-act="ex-next"]');
    expect(text('#ltp-entry-wrap [data-act="start"]')).toContain('Làm lại từ đầu');
    window.confirm = jest.fn(() => false);
    click('#ltp-entry-wrap [data-act="start"]');
    expect(window.confirm).toHaveBeenCalled();
    expect(window.fetch).toHaveBeenCalledTimes(1);
    window.confirm = jest.fn(() => true);
    click('#ltp-entry-wrap [data-act="start"]');
    await settle();
    expect(calls[1].url).toMatch(/\/practice$/);
  });

  test('a practice saved before practices were fixed is not resumed', async () => {
    localStorage.setItem('ltp_v1_student1', JSON.stringify({ [LESSONS.form.lessonKey]: {
      practice: { ...formPractice(), fixed: undefined }, answers: formPractice().questions.map(() => ({ value: '', result: null })),
      idx: 1, savedAt: Date.now(), last: { score: 2, total: 3 },
    } }));
    window.LTPractice.mount(LESSONS.form, slot);
    expect($('#ltp-entry-wrap [data-act="resume"]')).toBeNull();
    expect(text('#ltp-entry-wrap')).toContain('2/3'); // the scores are kept
  });

  test('storage that throws never breaks the practice', async () => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('QuotaExceeded'); };
    try {
      await open(LESSONS.form, formPractice());
      click('[data-act="intro-done"]');
      click('[data-act="ex-next"]');
      expect($$('.ltp-gstep')).toHaveLength(1);
    } finally {
      Storage.prototype.setItem = setItem;
    }
  });
});
