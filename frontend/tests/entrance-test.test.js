/**
 * Test đầu vào student page (js/entrance-test.js) — the parts that only
 * exist client-side: the Speaking Part 2 runner (cue card without sample /
 * hints, 1:10 prep, recording, editable transcript, multipart submit), the
 * full-screen submit overlay that blocks a second submit, and the
 * "đang chờ giáo viên duyệt" result state.
 *
 * The page script is run with an indirect eval against the jsdom window,
 * next to the real api-client.js. Only fetch, AuthService and the browser
 * media APIs jsdom lacks (getUserMedia, MediaRecorder) are faked.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { loadScript } = require('./helpers/loadScript');

const API = 'https://api.test/api';
const ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const PAGE_SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'entrance-test.js'), 'utf8');
const HTML = fs.readFileSync(path.join(__dirname, '..', 'entrance-test.html'), 'utf8');

let routes, calls, recorders;

function respond(body, status = 200) {
  return { status, ok: status >= 200 && status < 300, text: () => Promise.resolve(JSON.stringify(body)) };
}
function route(method, pathRe, reply) {
  routes.unshift({ method, pathRe, reply: typeof reply === 'function' ? reply : () => reply });
}
const flush = () => new Promise(r => setTimeout(r, 0));
async function settle(n = 6) { for (let i = 0; i < n; i++) await flush(); }
const $ = (sel) => document.querySelector(sel);

function attemptAt(section, extra = {}) {
  const now = new Date();
  const later = new Date(now.getTime() + 4 * 60 * 1000);
  return {
    _id: ID, status: 'in-progress', resultStatus: 'IN_PROGRESS', currentSection: section,
    sectionOrder: ['grammar', 'reading', 'listening', 'writing', 'speaking'],
    serverNow: now.toISOString(),
    sections: {
      grammar: { questions: [], answers: [] },
      reading: { passage: {}, answers: [] },
      listening: { section: {}, answers: [] },
      writing: { startedAt: now.toISOString(), sectionExpiresAt: later.toISOString(), prompt: { prompt: 'Describe the chart.' }, writingAnswer: '' },
      speaking: {
        startedAt: now.toISOString(), sectionExpiresAt: later.toISOString(),
        question: { topic: 'A memorable trip', question: 'Describe a memorable trip you took.', cueCard: 'You should say:\n- where you went' },
        transcript: '', prepSec: 70, maxSpeakSec: 120,
      },
    },
    ...extra,
  };
}

beforeAll(() => {
  loadScript('api-client.js');
});

beforeEach(() => {
  routes = [];
  calls = [];
  recorders = [];
  const body = HTML.slice(HTML.indexOf('<body>') + 6, HTML.indexOf('</body>')).replace(/<script[\s\S]*?<\/script>/g, '');
  document.body.innerHTML = body;

  window.fetch = jest.fn((url, opts = {}) => {
    const method = (opts.method || 'GET').toUpperCase();
    calls.push({ url, method, opts });
    const p = url.replace(API, '');
    const r = routes.find(x => x.method === method && x.pathRe.test(p));
    if (!r) return Promise.resolve(respond({ success: true }));
    const out = r.reply(p, opts);
    if (out && typeof out.then === 'function') return out;
    return Promise.resolve(out && typeof out.text === 'function' ? out : respond(out));
  });
  window.AuthService = {
    API,
    isLoggedIn: () => true,
    authHeader: () => ({ Authorization: 'Bearer t' }),
    buildLoginUrl: (n) => '/login.html?next=' + n,
    logout: jest.fn(),
  };
  window.toast = jest.fn();
  window.confirmDialog = (title, msg, onOk) => onOk();
  window.EntranceTestProctor = undefined;

  const track = { stop: jest.fn() };
  navigator.mediaDevices = { getUserMedia: jest.fn(() => Promise.resolve({ getTracks: () => [track] })) };
  window.MediaRecorder = class {
    constructor() { this.state = 'inactive'; this.mimeType = 'audio/webm'; recorders.push(this); }
    start() { this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      this.ondataavailable({ data: new Blob(['voice'], { type: 'audio/webm' }) });
      setTimeout(() => this.onstop && this.onstop(), 0);
    }
  };
  delete window.SpeechRecognition;
  delete window.webkitSpeechRecognition;

  route('GET', /^\/entrance-test$/, { success: true, available: true, totalMinutes: 74, sections: [] });
  route('GET', /^\/entrance-test\/history$/, { success: true, attempts: [] });
  route('POST', /^\/entrance-test\/start$/, { success: true, attemptId: ID });
});

async function bootAt(section) {
  let attempt = attemptAt(section);
  route('GET', new RegExp('^/entrance-test/' + ID + '$'), () => ({ success: true, attempt }));
  window.eval(PAGE_SRC);
  await settle();
  $('#et-start-btn').click();
  await settle();
  return {
    finish() {
      attempt = attemptAt('done', { status: 'completed', currentSection: 'done', resultStatus: 'PENDING_WRITING' });
    },
  };
}

describe('Speaking Part 2', () => {
  test('shows the cue card with no sample answer / vocab hints, and a 1:10 prep countdown', async () => {
    await bootAt('speaking');
    const body = $('#et-section-body').textContent;
    expect(body).toContain('Describe a memorable trip you took.');
    expect(body).toContain('You should say');
    expect(body).not.toMatch(/Sample|câu trả lời mẫu|Gợi ý từ vựng|Hints/i);
    expect($('#et-sp-prep').classList.contains('hidden')).toBe(false);
    expect($('#et-sp-prep-clock').textContent).toMatch(/^1:(10|09)$/);
    expect($('#et-sp-rec-btn').disabled).toBe(true);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled(); // mic asked during prep
  });

  test('record → stop → type/fix transcript → one multipart submit behind the overlay', async () => {
    const page = await bootAt('speaking');
    $('#et-sp-prep-skip').click();
    await settle();
    expect(recorders).toHaveLength(1);
    expect(recorders[0].state).toBe('recording');
    expect($('#et-sp-transcript').readOnly).toBe(true);

    $('#et-sp-rec-btn').click(); // stop
    await settle();
    const ta = $('#et-sp-transcript');
    expect(ta.readOnly).toBe(false);
    expect($('#et-sp-rec-btn').disabled).toBe(true); // one take
    ta.value = 'I went to Da Lat with my family.';
    ta.dispatchEvent(new Event('input', { bubbles: true }));

    let release;
    route('POST', /\/section\/speaking\/submit$/, () => new Promise(r => { release = () => r(respond({ success: true })); }));
    $('#et-submit-btn').click();
    await settle();
    expect($('#et-submit-overlay').classList.contains('hidden')).toBe(false);
    expect(document.querySelector('.et-shell').inert).toBe(true);
    $('#et-submit-btn').click(); // blocked while in flight
    await settle();

    const submits = calls.filter(c => /speaking\/submit$/.test(c.url));
    expect(submits).toHaveLength(1);
    const fd = submits[0].opts.body;
    expect(fd).toBeInstanceOf(FormData);
    expect(fd.get('transcript')).toBe('I went to Da Lat with my family.');
    expect(fd.get('audio')).toBeTruthy();
    expect(submits[0].opts.headers['Content-Type']).toBeUndefined();

    page.finish();
    release();
    await settle(10);
    expect($('#et-submit-overlay').classList.contains('hidden')).toBe(true);
    expect($('#et-done-modal').classList.contains('hidden')).toBe(false);
  });
});

describe('Writing submit', () => {
  test('flushes the pending autosave first and sends only one submit', async () => {
    await bootAt('writing');
    const ta = $('#et-writing-textarea');
    ta.value = 'The chart shows sales.';
    ta.dispatchEvent(new Event('input', { bubbles: true }));

    let release;
    route('POST', /\/section\/writing\/submit$/, () => new Promise(r => { release = () => r(respond({ success: true })); }));
    $('#et-submit-btn').click();
    $('#et-submit-btn').click();
    await settle();
    expect($('#et-submit-overlay').classList.contains('hidden')).toBe(false);
    expect($('#et-submit-title').textContent).toContain('Writing');

    const saves = calls.filter(c => /\/answer$/.test(c.url));
    expect(saves).toHaveLength(1);
    expect(JSON.parse(saves[0].opts.body).writingAnswer).toBe('The chart shows sales.');
    const submitIdx = calls.findIndex(c => /writing\/submit$/.test(c.url));
    expect(submitIdx).toBeGreaterThan(calls.indexOf(saves[0]));
    expect(calls.filter(c => /writing\/submit$/.test(c.url))).toHaveLength(1);
    release();
    await settle();
  });

  test('a failed submit hides the overlay and lets the student retry', async () => {
    await bootAt('writing');
    route('POST', /\/section\/writing\/submit$/, () => respond({ success: false, message: 'boom' }, 500));
    $('#et-submit-btn').click();
    await settle(10);
    expect($('#et-submit-overlay').classList.contains('hidden')).toBe(true);
    expect($('#et-submit-btn').disabled).toBe(false);
    expect(window.toast).toHaveBeenCalledWith('boom', 'error', undefined);
  });
});

describe('result before approval', () => {
  test('shows "đang chờ giáo viên duyệt" and no scores', async () => {
    route('GET', /^\/entrance-test\/history$/, { success: true, attempts: [{ _id: ID, status: 'completed', resultStatus: 'PENDING_REVIEW', overallBand: null, startedAt: new Date().toISOString() }] });
    route('GET', new RegExp('^/entrance-test/' + ID + '/result$'), { success: true, _id: ID, status: 'completed', resultStatus: 'PENDING_REVIEW', pendingReview: true });
    window.eval(PAGE_SRC);
    await settle();
    expect($('#et-history-list').textContent).toContain('Chờ giáo viên duyệt');
    $('.et-history-view').click();
    await settle();
    const txt = $('#et-result-body').textContent;
    expect(txt).toContain('đang chờ giáo viên duyệt');
    expect($('.et-overall-band')).toBeNull();
    expect($('.et-result-card')).toBeNull();
  });
});
