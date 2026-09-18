/**
 * The 7-week timetable widget on reading-listening-strategy.html is an
 * inline <script>, not a js/shared/*.js module (it owns page-specific
 * markup that doesn't belong in a reusable file) — so unlike the rest of
 * tests/shared/, this test extracts that one <script> block straight out
 * of the real .html file and runs it against a minimal fixture DOM. That
 * keeps the test honest about what's actually shipped (no separate copy
 * of the logic to drift out of sync) while staying independent of the
 * page's other ~15 unrelated <script src> includes (nav.js, auth.js, …).
 */
const fs = require('fs');
const path = require('path');

function extractWidgetScript() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'reading-listening-strategy.html'), 'utf8');
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const widget = blocks.find((b) => b.includes('TIMETABLE_WEEKS'));
  if (!widget) throw new Error('7-week timetable <script> block not found in reading-listening-strategy.html');
  return widget;
}

function mountFixture() {
  document.body.innerHTML = `
    <div class="tt-progress-row">
      <span id="tt-progress-txt"></span>
      <div class="tt-progress-track"><div class="tt-progress-fill" id="tt-progress-fill"></div></div>
    </div>
    <div class="tt-stats">
      <div id="tt-stat-sessions">0</div>
      <div id="tt-stat-tests">0</div>
      <div id="tt-stat-reviewed">0</div>
    </div>
    <div id="tt-weeks"></div>
    <form id="tt-log-form">
      <select id="tt-log-skill">
        <option value="reading">Reading</option>
        <option value="listening">Listening</option>
        <option value="writing">Writing</option>
        <option value="speaking">Speaking</option>
        <option value="full">Full Mock</option>
      </select>
      <select id="tt-log-week"><option value="">Tuần?</option><option value="1">W1</option></select>
      <input type="text" id="tt-log-label">
      <input type="text" id="tt-log-mistake">
      <button type="submit">Thêm</button>
    </form>
    <table><tbody id="tt-log-tbody"></tbody></table>
  `;
}

async function flush(n) {
  n = n || 6;
  for (let i = 0; i < n; i++) await Promise.resolve();
}

function emptyState() {
  return { success: true, checklist: {}, testLogs: [], stats: { totalChecked: 0, totalItems: 42, totalLogs: 0, totalReviewed: 0 } };
}

describe('7-week timetable widget (reading-listening-strategy.html)', () => {
  let widgetScript;
  let fetchMock;

  beforeAll(() => {
    widgetScript = extractWidgetScript();
  });

  beforeEach(() => {
    mountFixture();
    window.AuthService = { requirePageAuth: () => true, API: 'http://api.test', getToken: () => 'tok' };
    window.showToast = jest.fn();
    fetchMock = jest.fn();
    window.fetch = fetchMock;
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    delete window.AuthService;
  });

  async function runWidget(initialState) {
    fetchMock.mockResolvedValueOnce({ json: async () => initialState || emptyState() });
    // eslint-disable-next-line no-eval
    eval(widgetScript);
    // flush the init() microtask chain (fetch -> .json() -> render)
    await flush();
  }

  test('renders all 7 weeks with 6 sessions each (42 total) from an empty state', async () => {
    await runWidget();
    expect(document.querySelectorAll('.tt-week')).toHaveLength(7);
    expect(document.querySelectorAll('.tt-session')).toHaveLength(42);
    expect(document.getElementById('tt-progress-txt').textContent).toContain('0/42');
  });

  test('week 1 opens by default, others start closed', async () => {
    await runWidget();
    expect(document.getElementById('tt-week-1').hasAttribute('open')).toBe(true);
    expect(document.getElementById('tt-week-3').hasAttribute('open')).toBe(false);
  });

  test('hydrates checked state and stats from the fetched progress', async () => {
    const state = emptyState();
    state.checklist = { 'w2-class1': true, 'w2-home3': true };
    state.stats = { totalChecked: 2, totalItems: 42, totalLogs: 0, totalReviewed: 0 };
    await runWidget(state);

    const cb = document.querySelector('[data-tt-check="w2-class1"]');
    expect(cb.checked).toBe(true);
    expect(document.querySelector('#tt-week-2 .tt-week-count').textContent).toBe('2/6');
    expect(document.getElementById('tt-stat-sessions').textContent).toBe('2');
  });

  test('checking a session box PUTs the checklist endpoint and updates the week badge without collapsing it', async () => {
    await runWidget();
    const week3 = document.getElementById('tt-week-3');
    week3.setAttribute('open', ''); // simulate the student having it open

    fetchMock.mockResolvedValueOnce({
      json: async () => {
        const s = emptyState();
        s.checklist = { 'w3-class1': true };
        s.stats.totalChecked = 1;
        return s;
      },
    });

    const cb = document.querySelector('[data-tt-check="w3-class1"]');
    cb.checked = true;
    cb.dispatchEvent(new window.Event('change'));
    await flush();

    const [url, opts] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    expect(url).toBe('http://api.test/exam-timetable/checklist/w3-class1');
    expect(opts.method).toBe('PUT');
    expect(JSON.parse(opts.body)).toEqual({ checked: true });

    // week 3 must still be open — a full DOM rebuild would have reset it
    expect(week3.hasAttribute('open')).toBe(true);
    expect(document.querySelector('#tt-week-3 .tt-week-count').textContent).toBe('1/6');
  });

  test('a failed checklist PUT reverts the checkbox instead of leaving a false "saved" state', async () => {
    await runWidget();
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const cb = document.querySelector('[data-tt-check="w1-class1"]');
    cb.checked = true;
    cb.dispatchEvent(new window.Event('change'));
    await flush();

    expect(cb.checked).toBe(false);
    expect(window.showToast).toHaveBeenCalled();
  });

  test('submitting the log form POSTs the new entry and renders it in the table', async () => {
    await runWidget();
    fetchMock.mockResolvedValueOnce({
      json: async () => {
        const s = emptyState();
        s.testLogs = [{ id: 'log1', skill: 'reading', label: 'Cam 18 Test 1', week: 1, date: new Date().toISOString(), reviewed: false, mistake: 'T/F/NG' }];
        s.stats.totalLogs = 1;
        return s;
      },
    });

    document.getElementById('tt-log-skill').value = 'reading';
    document.getElementById('tt-log-week').value = '1';
    document.getElementById('tt-log-label').value = 'Cam 18 Test 1';
    document.getElementById('tt-log-mistake').value = 'T/F/NG';
    document.getElementById('tt-log-form').dispatchEvent(new window.Event('submit', { cancelable: true }));
    await flush();

    const [url, opts] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    expect(url).toBe('http://api.test/exam-timetable/logs');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ skill: 'reading', week: '1', label: 'Cam 18 Test 1', mistake: 'T/F/NG' });

    const rows = document.querySelectorAll('#tt-log-tbody tr');
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('Cam 18 Test 1');
    expect(document.getElementById('tt-log-label').value).toBe(''); // form cleared
  });

  test('deleting a log entry removes its row', async () => {
    const state = emptyState();
    state.testLogs = [{ id: 'log1', skill: 'writing', label: 'Essay 1', week: null, date: new Date().toISOString(), reviewed: false, mistake: '' }];
    state.stats.totalLogs = 1;
    await runWidget(state);

    expect(document.querySelectorAll('#tt-log-tbody tr')).toHaveLength(1);

    fetchMock.mockResolvedValueOnce({ json: async () => emptyState() });
    document.querySelector('[data-log-del="log1"]').dispatchEvent(new window.Event('click', { bubbles: true }));
    await flush();

    const [url, opts] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    expect(url).toBe('http://api.test/exam-timetable/logs/log1');
    expect(opts.method).toBe('DELETE');
    expect(document.querySelectorAll('#tt-log-tbody tr')).toHaveLength(1); // back to the "empty" placeholder row
    expect(document.getElementById('tt-log-tbody').textContent).toContain('Chưa có đề nào');
  });

  test('does nothing when AuthService.requirePageAuth is unavailable (logged-out shell)', async () => {
    delete window.AuthService;
    // eslint-disable-next-line no-eval
    eval(widgetScript);
    await Promise.resolve();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(document.querySelectorAll('.tt-week')).toHaveLength(0);
  });
});
