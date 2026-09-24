/**
 * Reading Tips → "🎯 Luyện tập" (js/reading-tips-practice.js).
 *
 * The practice UI is a page script (js/, not js/shared/), loaded here the
 * same way as the shared utilities: its source text run with an indirect
 * eval against the jsdom window. Its only outside dependencies are faked:
 * apiFetch (reading-v2.js), AuthService, and the browser APIs jsdom lacks
 * (scrollIntoView, scrollBy, matchMedia). Payload fixtures mirror what
 * GET /api/reading-tips/:lessonKey/practice sends — no answer keys except
 * the worked example's.
 *
 * Covers the frontend side of the spec's test cases (6–10: guided Q1/Q2,
 * nothing revealed before checking, score at the end) plus the loading /
 * empty / error states, browser-only persistence and the Phase 4 polish.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { loadScript } = require('./helpers/loadScript');

const PASSAGE_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const OTHER_ID = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const TF = ['TRUE', 'FALSE', 'NOT GIVEN'].map((key) => ({ key, label: '' }));
const PARAGRAPHS = [
  { i: 0, n: 0, label: '', heading: true, text: 'Frozen food', leadEnd: 0 },
  { i: 1, n: 1, label: 'A', heading: false, text: 'In 1851, railroads first began putting blocks of ice in insulated rail cars to send butter. It worked well.', leadEnd: 91 },
  { i: 2, n: 2, label: 'B', heading: false, text: 'The method spoilt the flavor of the meat. People complained about it.', leadEnd: 41 },
];

const tfngPractice = (passageId = PASSAGE_ID) => ({
  fixed: true, kind: 'questions', questionType: 'tfng', passageId, passageTitle: 'Frozen food', sourceName: 'Cambridge 15 Test 1',
  paragraphs: PARAGRAPHS,
  questions: [
    { questionNumber: 1, text: 'Specially adapted trains carried butter.', input: 'choice', choices: TF, isGuidedExample: true,
      guided: { mode: 'example', keywords: ['butter'], answer: 'TRUE', explanation: '“Specially adapted trains” khớp với “insulated rail cars”.',
        evidence: { paragraphIndex: 1, text: 'In 1851, railroads first began putting blocks of ice in insulated rail cars to send butter.' } } },
    { questionNumber: 2, text: 'The early freezing method affected the taste of meat.', input: 'choice', choices: TF,
      guided: { mode: 'hint', keywords: ['meat'], evidence: { paragraphIndex: 2, text: 'The method spoilt the flavor of the meat.' } } },
    { questionNumber: 3, text: 'Butter was sold abroad.', input: 'choice', choices: TF },
  ],
});

const LESSONS = {
  tfng: { lessonKey: 'true-false-not-given', hasPractice: true },
  ynng: { lessonKey: 'yes-no-not-given', hasPractice: true },
  paraphrase: { lessonKey: 'keyword-to-paraphrase', hasPractice: true },
  workflow: { lessonKey: 'skim-scan-workflow', hasPractice: true },
};

let slot;
let loggedIn;

beforeAll(() => {
  loadScript('utils.js'); // escHtml
  window.eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'reading-tips-practice.js'), 'utf8'));
});

beforeEach(() => {
  localStorage.clear();
  loggedIn = true;
  window.AuthService = {
    isLoggedIn: () => loggedIn,
    getUser: () => ({ _id: 'student1' }),
    buildLoginUrl: (next) => '/login.html?next=' + encodeURIComponent(next),
  };
  window.apiFetch = jest.fn();
  window.confirmDialog = undefined;
  window.openUpgradeModal = jest.fn();
  window.showToast = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
  window.scrollBy = jest.fn();
  window.matchMedia = () => ({ matches: false });
  document.body.innerHTML = '<div id="slot"></div>';
  slot = document.getElementById('slot');
});

afterEach(() => {
  window.RTPractice.mount(null, null); // stops timers, drops the practice
  jest.useRealTimers();
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const panelText = () => $('#rtp-panel').textContent.replace(/\s+/g, ' ').trim();
const click = (sel) => {
  const el = typeof sel === 'string' ? $(sel) : sel;
  if (!el) throw new Error(`nothing matches ${sel}`);
  el.click();
};
const pick = (key) => click(`#rtp-panel [data-act="pick"][data-val="${key}"]`);
const httpError = (status, body, message = `HTTP ${status}`) => Object.assign(new Error(message), { status, body });

async function startWith(lesson, practice) {
  window.apiFetch.mockResolvedValueOnce({ success: true, practice });
  window.RTPractice.mount(lesson, slot);
  click('#rtp-entry-wrap [data-act="start"]');
  await flush();
}

// Resolves the next POST …/practice/check with `result`.
function nextCheck(result) {
  window.apiFetch.mockResolvedValueOnce({ success: true, result });
}

describe('entry card: nothing loads until the student clicks', () => {
  test('supports() only tips that have a practice', () => {
    expect(window.RTPractice.supports(LESSONS.tfng)).toBe(true);
    expect(window.RTPractice.supports({ lessonKey: 'true-false-not-given', hasPractice: false })).toBe(false);
    expect(window.RTPractice.supports({ lessonKey: 'band-6', hasPractice: true })).toBe(false);
    expect(() => window.RTPractice.mount(LESSONS.tfng, null)).not.toThrow();
  });

  test('mount renders the "🎯 Bắt đầu luyện tập" card and fetches nothing', () => {
    window.RTPractice.mount(LESSONS.tfng, slot);
    expect($('.rtp-entry-title').textContent).toBe('Luyện tập True / False / Not Given');
    expect($('#rtp-entry-wrap [data-act="start"]').textContent).toContain('Bắt đầu luyện tập');
    expect($('#rtp-panel').hidden).toBe(true);
    expect(window.apiFetch).not.toHaveBeenCalled();
  });
});

describe('loading / empty / error states', () => {
  function startPending() {
    window.apiFetch.mockReturnValueOnce(new Promise(() => {}));
    window.RTPractice.mount(LESSONS.tfng, slot);
    click('#rtp-entry-wrap [data-act="start"]');
  }

  test('loading: message + disabled button, and a "server waking up" note after 6s', () => {
    jest.useFakeTimers();
    startPending();
    expect(panelText()).toContain('Đang tải bài luyện tập...');
    expect($('#rtp-entry-wrap [data-act="start"]').disabled).toBe(true);
    expect($('.rtp-state-slow').hidden).toBe(true);
    jest.advanceTimersByTime(6000);
    expect($('.rtp-state-slow').hidden).toBe(false);
    expect(window.apiFetch.mock.calls[0][0]).toBe('/api/reading-tips/true-false-not-given/practice');
  });

  test('empty state (CASE 5) with a close button', async () => {
    await startWith(LESSONS.tfng, null);
    expect(panelText()).toContain('Chưa tìm thấy bài luyện tập phù hợp.');
    click('#rtp-panel [data-act="dismiss"]');
    expect($('#rtp-panel').hidden).toBe(true);
  });

  test.each([
    ['server error', httpError(500, { message: 'Internal error' }), 'Máy chủ đang gặp sự cố'],
    ['cold start', Object.assign(new Error('server-cold-start'), { coldStart: true, status: 503 }), 'Máy chủ đang khởi động'],
    ['timeout', Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }), 'phản hồi quá lâu'],
    ['offline', new TypeError('Failed to fetch'), 'Không kết nối được máy chủ'],
    ['rate limit', httpError(429, { message: 'Bạn đang tải nội dung quá nhanh, vui lòng chậm lại.' }), 'Bạn đang tải nội dung quá nhanh'],
  ])('%s → a plain message and "Thử lại", which retries without asking', async (_name, err, text) => {
    window.apiFetch.mockRejectedValueOnce(err);
    window.RTPractice.mount(LESSONS.tfng, slot);
    click('#rtp-entry-wrap [data-act="start"]');
    await flush();
    expect(panelText()).toContain(text);
    expect(panelText()).not.toContain('Internal error');
    window.confirmDialog = jest.fn();
    window.apiFetch.mockResolvedValueOnce({ success: true, practice: tfngPractice() });
    click('#rtp-panel [data-act="start"]');
    await flush();
    expect(window.confirmDialog).not.toHaveBeenCalled();
    expect($('.rtp-intro')).not.toBeNull();
  });

  test('premium required → upgrade button', async () => {
    window.apiFetch.mockRejectedValueOnce(httpError(403, { requiresPremium: true, message: 'Bạn cần nâng cấp lên Premium để luyện tập.' }));
    window.RTPractice.mount(LESSONS.tfng, slot);
    click('#rtp-entry-wrap [data-act="start"]');
    await flush();
    expect(panelText()).toContain('Bạn cần nâng cấp lên Premium để luyện tập.');
    click('#rtp-panel [data-act="upgrade"]');
    expect(window.openUpgradeModal).toHaveBeenCalled();
  });

  test('logged out → login link that comes back to this page, no request', () => {
    loggedIn = false;
    window.RTPractice.mount(LESSONS.tfng, slot);
    click('#rtp-entry-wrap [data-act="start"]');
    const href = $('#rtp-panel a.rtp-btn').getAttribute('href');
    expect(href).toBe('/login.html?next=' + encodeURIComponent(location.pathname + location.search));
    expect(window.apiFetch).not.toHaveBeenCalled();
  });
});

describe('question-type practice: guided Q1/Q2, then alone (spec cases 6–10)', () => {
  async function toQuestion1() {
    await startWith(LESSONS.tfng, tfngPractice());
    expect($('.rtp-intro-title').textContent).toContain('Trước khi làm');
    expect(panelText()).toContain('NOT GIVEN không có nghĩa là “không tìm thấy keyword”');
    click('[data-act="intro-done"]');
  }

  test('CASE 6: Q1 is walked through step by step and shows its answer + explanation at the end, unscored', async () => {
    await toQuestion1();
    expect($('.rtp-mode.example').textContent).toContain('Xem cách làm');
    expect($$('.rtp-gstep')).toHaveLength(1);
    expect($('[data-act="check"]')).toBeNull(); // nothing to submit
    expect($('.correct-ans')).toBeNull();
    expect(panelText()).not.toContain('Đáp án: TRUE');
    click('[data-act="guide-next"]');
    expect($('.rtp-para-target').dataset.pi).toBe('1'); // step 2: where to look
    click('[data-act="guide-next"]');
    // (split into several spans where the keyword is also marked)
    expect($$('.rtp-ev').map((e) => e.textContent).join('')).toBe('In 1851, railroads first began putting blocks of ice in insulated rail cars to send butter.');
    click('[data-act="guide-next"]');
    expect($$('.rtp-gstep')).toHaveLength(4);
    expect(panelText()).toContain('Đáp án: TRUE');
    expect(panelText()).toContain('khớp với “insulated rail cars”');
    expect($('.tfng-opt.correct-ans').textContent).toBe('TRUE');
    expect($('[data-act="guide-next"]')).toBeNull();
    expect($('.rtp-done').textContent).toBe('1/3 đã làm');
  });

  test('CASE 7–9: Q2 gives hints only; the key appears after the server grades the answer', async () => {
    await toQuestion1();
    click('[data-act="next"]');
    expect($('.rtp-mode.hint').textContent).toContain('Câu có gợi ý');
    expect($$('.rtp-hint-line')).toHaveLength(0);
    click('[data-act="hint-more"]');
    expect($('.rtp-hint-line').textContent).toContain('Gợi ý 1 — keyword');
    expect($('.rtp-anchor').textContent).toBe('meat'); // keyword marked in the statement
    expect($('.correct-ans')).toBeNull();
    expect($('[data-act="check"]').disabled).toBe(true);
    pick('FALSE');
    expect($('[data-act="pick"][data-val="FALSE"]').getAttribute('aria-pressed')).toBe('true');
    nextCheck({ questionNumber: 2, isCorrect: false, correctAnswer: 'TRUE', explanation: '“Affected the taste” tương ứng với “spoilt the flavor”.',
      evidence: { paragraphIndex: 2, text: 'The method spoilt the flavor of the meat.' } });
    click('[data-act="check"]');
    await flush();
    const [url, opts] = window.apiFetch.mock.calls[1];
    expect(url).toBe('/api/reading-tips/true-false-not-given/practice/check');
    expect(JSON.parse(opts.body)).toEqual({ passageId: PASSAGE_ID, questionNumber: 2, answer: 'FALSE' });
    expect($('.rtp-feedback .q-correct-ans').textContent).toBe('✗ Chưa đúng — Đáp án: TRUE');
    expect($('.rtp-evidence').textContent).toContain('The method spoilt the flavor of the meat.');
    expect($('.q-explanation').textContent).toContain('spoilt the flavor');
    expect($('.tfng-opt.correct-ans').textContent).toBe('TRUE');
    expect($('.tfng-opt.wrong-ans').textContent).toBe('FALSE');
    expect($('#rtp-live').textContent).toBe('✗ Chưa đúng — Đáp án: TRUE');
  });

  test('CASE 8 + 10: Q3 is "Tự làm"; the score leaves the worked example out; retry and review', async () => {
    await toQuestion1();
    for (let s = 0; s < 3; s++) click('[data-act="guide-next"]');
    click('[data-act="next"]');
    pick('FALSE');
    nextCheck({ questionNumber: 2, isCorrect: false, correctAnswer: 'TRUE', explanation: '', evidence: null });
    click('[data-act="check"]');
    await flush();
    click('[data-act="next"]');
    expect($('.rtp-mode.self').textContent).toContain('Tự làm');
    expect($('.rtp-guided')).toBeNull();
    pick('NOT GIVEN');
    nextCheck({ questionNumber: 3, isCorrect: true, correctAnswer: 'NOT GIVEN', explanation: '', evidence: null });
    click('[data-act="check"]');
    await flush();
    click('[data-act="finish"]');
    expect($('.rtp-result-title').textContent).toBe('Hoàn thành luyện tập True / False / Not Given');
    expect($('.rtp-score').textContent).toBe('1 / 2');
    const rows = $$('.rtp-result-row').map((r) => r.className.replace('rtp-result-row', '').trim());
    expect(rows).toEqual(['example', 'bad', 'ok']);
    expect($('#rtp-live').textContent).toBe('Hoàn thành luyện tập: đúng 1 trên 2 câu.');
    // saved in this browser only, shown on the card
    const saved = JSON.parse(localStorage.getItem('rtp_v1_student1'))['true-false-not-given'];
    expect(saved).toMatchObject({ last: { score: 1, total: 2 }, best: { score: 1, total: 2 }, attempts: 1, finished: true });
    expect($('.rtp-entry-stats').textContent).toContain('Lần gần nhất: 1/2');
    // review → back to Q1 with every answer kept; a result row opens its question
    click('[data-act="review"]');
    expect($('.rtp-progress span').textContent).toBe('Câu 1 / 3');
    click('[data-act="next"]');
    click('[data-act="next"]');
    click('[data-act="finish"]');
    click($$('.rtp-result-row')[1]);
    expect($('.rtp-progress span').textContent).toBe('Câu 2 / 3');
    expect($('.rtp-feedback .q-correct-ans').textContent).toBe('✗ Chưa đúng — Đáp án: TRUE');
    expect(JSON.parse(localStorage.getItem('rtp_v1_student1'))['true-false-not-given'].attempts).toBe(1); // counted once
    // retry → same passage, fresh answers
    click('[data-act="next"]');
    click('[data-act="finish"]');
    click('[data-act="retry"]');
    expect($('.rtp-done').textContent).toBe('0/3 đã làm');
    expect($$('.rtp-gstep')).toHaveLength(1);
  });

  test('a typed answer: Enter checks it; empty answers can\'t be sent', async () => {
    const practice = tfngPractice();
    practice.questionType = 'completion';
    practice.questions = [{ questionNumber: 5, text: 'Ice was carried in rail _____ .', input: 'text', wordLimit: 'ONE WORD ONLY' }];
    await startWith(LESSONS.tfng, practice);
    click('[data-act="intro-done"]');
    const input = $('.rtp-input');
    expect($('[data-act="check"]').disabled).toBe(true);
    input.value = 'cars';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect($('[data-act="check"]').disabled).toBe(false);
    nextCheck({ questionNumber: 5, isCorrect: true, correctAnswer: 'cars', explanation: '', evidence: null });
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await flush();
    expect(JSON.parse(window.apiFetch.mock.calls[1][1].body).answer).toBe('cars');
    expect($('.rtp-input').classList.contains('correct')).toBe(true);
  });
});

describe('browser-only persistence', () => {
  test('an unfinished practice is offered again with its answers', async () => {
    await startWith(LESSONS.tfng, tfngPractice());
    click('[data-act="intro-done"]');
    click('[data-act="next"]');
    pick('TRUE');
    nextCheck({ questionNumber: 2, isCorrect: true, correctAnswer: 'TRUE', explanation: '', evidence: null });
    click('[data-act="check"]');
    await flush();
    // the student opens another tip, then comes back
    window.RTPractice.mount(LESSONS.ynng, slot);
    window.RTPractice.mount(LESSONS.tfng, slot);
    const resume = $('#rtp-entry-wrap [data-act="resume"]');
    expect(resume.textContent).toContain('Tiếp tục bài đang làm (Câu 2/3)');
    click(resume);
    expect($('.rtp-feedback .q-correct-ans').textContent).toBe('✓ Chính xác!');
    expect(window.apiFetch).toHaveBeenCalledTimes(2); // nothing re-fetched
  });

  test('storage that throws never breaks the practice', async () => {
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
    try {
      await startWith(LESSONS.tfng, tfngPractice());
      click('[data-act="intro-done"]');
      expect($('.rtp-mode.example')).not.toBeNull();
    } finally {
      spy.mockRestore();
    }
  });
});

describe('Phase 4 safety and polish', () => {
  test('switching tip while a practice is loading drops the late response', async () => {
    let resolve;
    window.apiFetch.mockReturnValueOnce(new Promise((r) => { resolve = r; }));
    window.RTPractice.mount(LESSONS.tfng, slot);
    click('#rtp-entry-wrap [data-act="start"]');
    window.RTPractice.mount(LESSONS.ynng, slot);
    resolve({ success: true, practice: tfngPractice() });
    await flush();
    expect($('.rtp-entry-title').textContent).toBe('Luyện tập Yes / No / Not Given');
    expect($('#rtp-panel').hidden).toBe(true);
    expect(localStorage.getItem('rtp_v1_student1')).toBeNull();
  });

  test('"Làm lại từ đầu" asks before replacing answered work; cancel keeps it', async () => {
    await startWith(LESSONS.tfng, tfngPractice());
    click('[data-act="intro-done"]');
    click('[data-act="next"]');
    pick('TRUE');
    nextCheck({ questionNumber: 2, isCorrect: true, correctAnswer: 'TRUE', explanation: '', evidence: null });
    click('[data-act="check"]');
    await flush();
    window.confirmDialog = jest.fn();
    click('#rtp-entry-wrap [data-act="start"]');
    expect(window.confirmDialog).toHaveBeenCalledTimes(1);
    expect(window.apiFetch).toHaveBeenCalledTimes(2); // cancelled: no new request
    expect($('.rtp-feedback')).not.toBeNull();
    const onOk = window.confirmDialog.mock.calls[0][2];
    window.apiFetch.mockResolvedValueOnce({ success: true, practice: tfngPractice(OTHER_ID) });
    onOk();
    await flush();
    expect($('.rtp-intro')).not.toBeNull();
  });

  test('"Làm lại từ đầu" reloads the same fixed practice (no ?exclude=); the result screen offers "Làm lại" only', async () => {
    await startWith(LESSONS.tfng, tfngPractice());
    expect($('#rtp-entry-wrap [data-act="start"]').textContent).toContain('Làm lại từ đầu');
    window.apiFetch.mockResolvedValueOnce({ success: true, practice: tfngPractice() });
    click('#rtp-entry-wrap [data-act="start"]'); // nothing answered → no confirm
    await flush();
    expect(window.apiFetch.mock.calls[1][0]).toBe('/api/reading-tips/true-false-not-given/practice');
    expect(document.body.innerHTML).not.toContain('Bài khác');
  });

  test('options work from the keyboard and keep focus (paragraphs: see the workflow test)', async () => {
    await startWith(LESSONS.tfng, tfngPractice());
    click('[data-act="intro-done"]');
    click('[data-act="next"]');
    const opt = $('[data-act="pick"][data-val="NOT GIVEN"]');
    expect(opt.getAttribute('tabindex')).toBe('0');
    expect(opt.getAttribute('role')).toBe('button');
    opt.focus();
    opt.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect($('[data-act="pick"][data-val="NOT GIVEN"]').classList.contains('selected')).toBe(true);
    expect(document.activeElement.dataset.val).toBe('NOT GIVEN'); // focus survives the re-render
  });

  test('on stacked layouts, feedback links back to the passage', async () => {
    await startWith(LESSONS.tfng, tfngPractice());
    click('[data-act="intro-done"]');
    click('[data-act="next"]');
    pick('TRUE');
    nextCheck({ questionNumber: 2, isCorrect: true, correctAnswer: 'TRUE', explanation: '', evidence: { paragraphIndex: 2, text: 'The method spoilt the flavor of the meat.' } });
    click('[data-act="check"]');
    await flush();
    Element.prototype.scrollIntoView.mockClear();
    click('.rtp-evidence [data-act="show-passage"]');
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(Element.prototype.scrollIntoView.mock.instances[0].classList.contains('rtp-passage')).toBe(true);
  });
});

describe('Keyword → Paraphrase', () => {
  const practice = {
    fixed: true, kind: 'paraphrase',
    items: [{ passageId: PASSAGE_ID, questionNumber: 3, pairIndex: 0, passageTitle: 'Frozen food', sourceName: 'Cambridge 15 Test 1',
      question: 'The early freezing method affected the taste of meat.', keyword: 'affected the taste',
      sentence: 'The method spoilt the flavor of the meat.', paragraphLabel: 'B' }],
  };

  test('two taps select the span; the check sends it with its pair index, then the pair is revealed', async () => {
    await startWith(LESSONS.paraphrase, practice);
    expect($('.rtp-pp-question .rtp-anchor').textContent).toBe('affected the taste');
    click('[data-act="tok"][data-ti="2"]'); // "spoilt"
    expect($('.rtp-pp-picked').textContent).toContain('bấm tiếp từ CUỐI');
    expect($('.rtp-tok.anchor').textContent).toBe('spoilt');
    click('[data-act="tok"][data-ti="4"]'); // "flavor"
    expect($('.rtp-pp-picked').textContent).toBe('Bạn chọn: “spoilt the flavor”');
    nextCheck({ questionNumber: 3, isCorrect: true, correctAnswer: 'spoilt the flavor', keyword: 'affected the taste', explanation: '', evidence: { paragraphIndex: 2, text: 'spoilt the flavor' } });
    click('[data-act="check"]');
    await flush();
    expect(JSON.parse(window.apiFetch.mock.calls[1][1].body)).toEqual({ passageId: PASSAGE_ID, questionNumber: 3, answer: 'spoilt the flavor', pairIndex: 0 });
    expect($('.rtp-pair').textContent.replace(/\s+/g, ' ').trim()).toBe('🔁 affected the taste ⇄ spoilt the flavor');
    expect($$('.rtp-tok.ok').map((t) => t.textContent).join(' ')).toBe('spoilt the flavor');
    click('[data-act="finish"]');
    expect($('.rtp-score').textContent).toBe('1 / 1');
  });
});

describe('Quy trình làm bài (7 steps)', () => {
  const practice = {
    fixed: true, kind: 'workflow', passageId: PASSAGE_ID, passageTitle: 'Frozen food', sourceName: 'Cambridge 15 Test 1', paragraphs: PARAGRAPHS,
    main: { questionNumber: 1, kind: 'mcq', text: 'What is the main idea of paragraph B?', listTitle: null, targetParagraph: 2,
      choices: [{ key: 'A', label: 'how ice was sold' }, { key: 'B', label: 'a problem with freezing' }] },
    questions: [
      { questionNumber: 2, questionType: 'tfng', text: 'Trains carried butter in the 1850s.', input: 'choice', choices: TF, wordLimit: null, instruction: null, keywords: ['butter', '1850s'], locationParagraph: 1 },
      { questionNumber: 3, questionType: 'tfng', text: 'The method affected the taste of meat.', input: 'choice', choices: TF, wordLimit: null, instruction: null, keywords: ['meat'], locationParagraph: 2 },
    ],
  };
  const wfNext = () => click('[data-act="wf-next"]');

  async function answerDetail(para, key, isCorrect, { keyboard = false } = {}) {
    click('[data-act="wf-kw"][data-ti="0"]');
    click('[data-act="wf-kw-done"]');
    expect($('.rtp-hint-line').textContent).toContain('Keyword gợi ý');
    click('[data-act="wf-step"][data-step="6"]');
    const paragraph = $(`.rtp-para[data-act="wf-loc"][data-pi="${para}"]`);
    if (keyboard) paragraph.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    else click(paragraph);
    const verdict = $('.rtp-wf-loc .q-correct-ans').textContent;
    click('[data-act="wf-step"][data-step="7"]');
    pick(key);
    nextCheck({ questionNumber: 0, isCorrect, correctAnswer: 'TRUE', explanation: '', evidence: null });
    click('[data-act="check"]');
    await flush();
    return verdict;
  }

  test('title → skim → main idea → questions → keyword → paragraph → answer, then the score', async () => {
    await startWith(LESSONS.workflow, practice);
    expect($('.rtp-wf-step.active').textContent).toContain('Đọc tiêu đề');
    expect($('.rtp-wf-title').textContent).toBe('Frozen food');
    const guess = $('.rtp-wf-guess');
    guess.value = 'về thực phẩm';
    guess.dispatchEvent(new Event('input', { bubbles: true }));
    wfNext();
    expect($('.rtp-wf-step.active').textContent).toContain('Skim các đoạn');
    expect(panelText()).toContain('Dự đoán của bạn ở bước 1: “về thực phẩm”');
    wfNext();
    pick('B');
    nextCheck({ questionNumber: 1, isCorrect: true, correctAnswer: 'B', explanation: '', evidence: null });
    click('[data-act="check"]');
    await flush();
    expect(JSON.parse(window.apiFetch.mock.calls[1][1].body)).toEqual({ passageId: PASSAGE_ID, questionNumber: 1, answer: 'B' });
    wfNext();
    expect($$('.rtp-wf-qlist li')).toHaveLength(2);
    wfNext();
    expect(await answerDetail(1, 'TRUE', true)).toBe('✓ Đúng đoạn!');
    wfNext();
    expect(await answerDetail(1, 'FALSE', false, { keyboard: true })).toBe('✗ Chưa đúng — thông tin nằm ở đoạn B (viền đỏ)');
    expect($('[data-act="wf-next"]').textContent).toBe('Xem kết quả 🎉');
    wfNext();
    expect($('.rtp-score').textContent).toBe('2 / 3');
    expect($('.rtp-result-msg').textContent).toBe('Tìm đúng đoạn chứa thông tin: 1/2 câu');
  });
});
