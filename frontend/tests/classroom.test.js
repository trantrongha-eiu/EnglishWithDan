/**
 * 🏫 Lớp học page (js/classroom.js + the shared dashboard renderers): a student
 * in no class gets the "contact the teacher" screen, a load failure never reads
 * as "no class", and an enrolled student sees the class with its tabs.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const today = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
const dayAt = (n) => new Date(Date.parse(`${today}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const session = (id, n, dayKey, extra = {}) => ({
  _id: id, ordinal: n, sessionNumber: n, dayKey, week: 1, startTime: '19:30', topic: '', type: 'regular', status: 'scheduled', mark: null, ...extra,
});
const klass = (extra = {}) => ({
  classId: 'c1', className: 'IELTS <A>', courseName: 'Foundation', teacherName: 'Dan', status: 'active', statusReason: '',
  classSize: 12, startTime: '19:30', heldSessions: 1, attendanceRate: 100, absenceEquivalent: 0, maxAbsencesAllowed: 3,
  absentExcused: 0, absentUnexcused: 0, lateCount: 0, remainingAbsences: 3, excusedCountsAsAbsence: true, lateToAbsenceRatio: 2,
  homeworkMissedCount: 0, homeworkFailThreshold: 8, homeworkWarnThreshold: 4, homeworkRemaining: 7,
  attendanceLevel: 'ok', homeworkLevel: 'ok', missedAssignments: [], lateAssignments: [],
  progress: { today, phase: 'ongoing', percent: 10, currentSessionOrdinal: 1, totalSessions: 10, weekSessions: [] },
  sessions: [
    session('a', 1, dayAt(-7), { status: 'held', mark: 'late', week: 1, topic: 'Unit <1>' }),
    session('b', 2, today, { week: 2 }),
    session('c', 3, dayAt(7), { week: 3, status: 'cancelled', ordinal: null }),
  ],
  ...extra,
});

let routes;

function json(body, ok = true) {
  return { ok, status: ok ? 200 : 500, json: async () => body };
}

beforeAll(() => {
  window.escHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  window.AuthService = { API: 'http://api', authHeader: () => ({}) };
  window.ApiClient = { handleResponse: async (r) => { if (!r.ok) throw new Error('fail'); return r.json(); } };
  window.scrollTo = () => {};
  global.fetch = jest.fn(async (url) => {
    const key = Object.keys(routes).find((k) => String(url).endsWith(k));
    return key ? routes[key]() : json({}, false);
  });
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8').replace(/^'use strict';/, '');
  // One global scope, like the page's <script> tags.
  // eslint-disable-next-line no-eval
  window.eval(`var escHtml = window.escHtml;\n${read('dashboard-homework.js')}\n${read('dashboard-classinfo.js')}\n${read('dashboard-speaking-exam.js')}\n${read('classroom.js')}`);
});

async function open(search = '') {
  document.body.innerHTML = '<div id="crRoot"></div>';
  window.history.replaceState(null, '', `/classroom.html${search}`);
  Object.assign(window.ClassroomPage.crState, { classes: [], classId: null, tab: 'overview', painted: false });
  const q = new URLSearchParams(search);
  if (q.get('tab')) window.ClassroomPage.crState.tab = q.get('tab');
  window.crTestBind();
  await window.ClassroomPage.crLoad();
  return document.getElementById('crRoot');
}

beforeAll(() => {
  // crInit's listeners attach to #crRoot, which each test re-creates.
  window.crTestBind = () => window.eval('crBind()');
});

beforeEach(() => {
  routes = {
    '/classes/my/classroom': () => json({ success: true, hasClasses: true, classes: [klass()] }),
    '/classes/my/checkin': () => json({ classes: [] }),
    '/assignments/mine': () => json({ hasClasses: true, assignments: [
      { _id: 'h1', classId: 'c1', title: 'Bài của lớp', className: 'IELTS <A>', status: 'not_started', done: 0, total: 1, resources: [] },
      { _id: 'h2', classId: 'other', title: 'Bài lớp khác', className: 'B', status: 'not_started', done: 0, total: 1, resources: [] },
    ] }),
    '/classes/my/speaking-exam': () => json({ examMinutes: 15, feedbackMinutes: 10, slotMinutes: 25, lockHours: 2, classes: [
      { classId: 'c1', className: 'IELTS <A>', booking: null, history: [], openSlots: [{ _id: 's1', dayKey: dayAt(2), startTime: '14:00', endTime: '14:25', modes: ['online'], note: '' }] },
    ] }),
  };
});

test('no class → contact the teacher, with Zalo and phone links', async () => {
  routes['/classes/my/classroom'] = () => json({ success: true, hasClasses: false, classes: [] });
  const root = await open();
  expect(root.textContent).toContain('Bạn chưa có lớp học');
  expect(root.textContent).toContain('liên hệ giáo viên');
  expect(root.querySelector('a[href="https://zalo.me/0914769618"]')).not.toBeNull();
  expect(root.querySelector('a[href="tel:0914769618"]')).not.toBeNull();
  expect(root.querySelector('.cr-tabs')).toBeNull();
});

test('a failed load offers a retry and never says the student has no class', async () => {
  routes['/classes/my/classroom'] = () => json({}, false);
  const root = await open();
  expect(root.textContent).toContain('Không tải được');
  expect(root.textContent).not.toContain('chưa có lớp');
  expect(root.querySelector('[data-retry]')).not.toBeNull();
});

test('enrolled → class header (escaped) and the four tabs', async () => {
  const root = await open();
  expect(root.querySelector('h1').textContent).toBe('IELTS <A>');
  expect(root.querySelector('h1').innerHTML).toContain('&lt;A&gt;');
  expect(root.textContent).toContain('GV Dan');
  expect(root.textContent).toContain('Vào học 19:30');
  expect([...root.querySelectorAll('.cr-tab')].map((b) => b.getAttribute('data-tab'))).toEqual(['overview', 'schedule', 'homework', 'speaking']);
  expect(root.querySelector('[data-tab="homework"] em').textContent).toBe('1');
  expect(root.querySelector('[data-tab="speaking"] em').textContent).toBe('1');
});

test('schedule tab: my mark, today, cancelled; past weeks fold away', async () => {
  const root = await open('?tab=schedule');
  const rows = [...root.querySelectorAll('.cr-sess')];
  expect(rows).toHaveLength(3);
  expect(root.querySelector('.cr-past .cr-sess').textContent).toContain('Đi trễ');
  expect(root.querySelector('.cr-past').innerHTML).toContain('Unit &lt;1&gt;');
  expect(root.querySelector('.cr-sess--now').textContent).toContain('Hôm nay');
  expect(root.querySelector('.cr-sess--off').textContent).toContain('Đã hủy');
});

test('homework tab shows only this class; a click switches tab and updates the URL', async () => {
  const root = await open();
  root.querySelector('[data-tab="homework"]').click();
  expect(root.textContent).toContain('Bài của lớp');
  expect(root.textContent).not.toContain('Bài lớp khác');
  expect(window.location.search).toBe('?tab=homework');
});

test('speaking tab offers booking; when that API fails the rest of the page still works', async () => {
  let root = await open('?tab=speaking');
  expect(root.querySelector('[onclick^="seOpenPicker"]')).not.toBeNull();
  routes['/classes/my/speaking-exam'] = () => json({}, false);
  root = await open('?tab=speaking');
  expect(root.textContent).toContain('Chưa tải được lịch thi');
  expect(root.querySelector('h1')).not.toBeNull();
});
