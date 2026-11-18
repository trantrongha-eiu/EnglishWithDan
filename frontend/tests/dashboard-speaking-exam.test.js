/**
 * 🎤 Đăng kí thi Speaking block (js/dashboard-speaking-exam.js) inside a
 * "Lớp học của tôi" class card: hidden when the teacher opened nothing,
 * a "Đăng kí thi" button when there are open slots, the booked slot with
 * its Meet link / address once booked, and the slot-picker popup that only
 * enables "Xác nhận" after a slot AND an allowed format are ticked.
 */
'use strict';

const fs = require('fs');
const path = require('path');

let payload;

beforeAll(() => {
  window.API = 'http://api';
  window.authH = () => ({});
  window.escHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  window.ApiClient = { handleResponse: (r) => r.json() };
  global.fetch = jest.fn(async () => ({ json: async () => payload }));
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'dashboard-speaking-exam.js'), 'utf8')
    .replace(/^'use strict';/, '');
  // eslint-disable-next-line no-eval
  window.eval(`var API = window.API, authH = window.authH, escHtml = window.escHtml;\n${code}`);
});

const base = { success: true, slotMinutes: 25, examMinutes: 15, feedbackMinutes: 10, lockHours: 2 };
const slot = (id, dayKey, startTime, endTime, modes = ['online', 'offline']) => ({ _id: id, dayKey, startTime, endTime, modes, note: '' });

test('nothing opened and no history → no block', async () => {
  payload = { ...base, classes: [{ classId: 'c1', className: 'A', openSlots: [], booking: null, history: [] }] };
  await window.seFetch();
  expect(window.seBlockFor('c1')).toBe('');
  expect(window.seBlockFor('other')).toBe('');
});

test('open slots → register button with the count', async () => {
  payload = { ...base, classes: [{ classId: 'c1', className: 'A', openSlots: [slot('s1', '2026-11-20', '14:00', '14:25'), slot('s2', '2026-11-20', '14:25', '14:50')], booking: null, history: [] }] };
  await window.seFetch();
  const html = window.seBlockFor('c1');
  expect(html).toContain('còn <b>2</b> buổi trống');
  expect(html).toContain("seOpenPicker('c1')");
  expect(html).toContain("15' thi + 10' feedback");
});

test('booked online → shows time + Meet link, cancel button while allowed', async () => {
  payload = { ...base, classes: [{ classId: 'c1', className: 'A', openSlots: [], history: [],
    booking: { _id: 's1', dayKey: '2026-11-20', startTime: '14:00', endTime: '14:25', mode: 'online', meetLink: 'https://meet.google.com/abc', address: '', note: '', canCancel: true } }] };
  await window.seFetch();
  const html = window.seBlockFor('c1');
  expect(html).toContain('T6, 20/11');
  expect(html).toContain('14:00–14:25');
  expect(html).toContain('href="https://meet.google.com/abc"');
  expect(html).toContain("seCancel('s1'");
});

test('a non-http Meet link is never rendered as a link', async () => {
  payload = { ...base, classes: [{ classId: 'c1', className: 'A', openSlots: [], history: [],
    booking: { _id: 's1', dayKey: '2026-11-20', startTime: '14:00', endTime: '14:25', mode: 'online', meetLink: 'javascript:alert(1)', canCancel: false } }] };
  await window.seFetch();
  const html = window.seBlockFor('c1');
  expect(html).not.toContain('javascript:');
  expect(html).not.toContain('seCancel');
});

test('picker: confirm enabled only after a slot and an allowed format are ticked', async () => {
  payload = { ...base, classes: [{ classId: 'c1', className: 'A', teacherName: 'Dan', booking: null, history: [],
    openSlots: [slot('s1', '2026-11-20', '14:00', '14:25', ['online']), slot('s2', '2026-11-21', '09:00', '09:25')] }] };
  await window.seFetch();
  window.seOpenPicker('c1');
  const modal = document.getElementById('se-modal');
  const submit = modal.querySelector('.se-submit');
  expect(modal.querySelectorAll('input[name="se-slot"]')).toHaveLength(2);
  expect(submit.disabled).toBe(true);

  const s1 = modal.querySelector('input[value="s1"]');
  s1.checked = true;
  s1.dispatchEvent(new Event('change', { bubbles: true }));
  // only "online" allowed for s1 → pre-ticked, confirm enabled
  expect([...modal.querySelectorAll('input[name="se-mode"]')].map((i) => i.value)).toEqual(['online']);
  expect(submit.disabled).toBe(false);

  const s2 = modal.querySelector('input[value="s2"]');
  s2.checked = true;
  s2.dispatchEvent(new Event('change', { bubbles: true }));
  expect(modal.querySelectorAll('input[name="se-mode"]')).toHaveLength(2);
  modal.remove();
});

test('picker: one chip per day, only the chosen day\'s times show, grouped by part of day', async () => {
  payload = { ...base, classes: [{ classId: 'c1', className: 'A', booking: null, history: [],
    openSlots: [slot('s1', '2026-11-20', '09:00', '09:25'), slot('s2', '2026-11-20', '19:00', '19:25'), slot('s3', '2026-11-21', '14:00', '14:25')] }] };
  await window.seFetch();
  window.seOpenPicker('c1');
  const modal = document.getElementById('se-modal');
  const chips = [...modal.querySelectorAll('.se-daychip')];
  expect(chips.map((c) => c.getAttribute('data-day'))).toEqual(['2026-11-20', '2026-11-21']);
  const visible = () => [...modal.querySelectorAll('.se-day:not([hidden]) input')].map((i) => i.value);
  expect(visible()).toEqual(['s1', 's2']);
  expect([...modal.querySelectorAll('.se-day:not([hidden]) .se-day-title')].map((t) => t.textContent)).toEqual(['Sáng', 'Tối']);
  chips[1].click();
  expect(visible()).toEqual(['s3']);
  expect(chips[1].getAttribute('aria-pressed')).toBe('true');
  modal.remove();
});

test('booked with other open slots → "Đổi buổi"; the swap sends replaceBooking and keeps the format', async () => {
  const booking = { _id: 'b1', dayKey: '2026-11-20', startTime: '14:00', endTime: '14:25', mode: 'offline', address: 'HN', note: '', canCancel: true };
  payload = { ...base, classes: [{ classId: 'c1', className: 'A', history: [], booking, openSlots: [slot('s9', '2026-11-22', '09:00', '09:25')] }] };
  await window.seFetch();
  expect(window.seBlockFor('c1')).toContain("seOpenPicker('c1', true)");

  window.seOpenPicker('c1', true);
  const modal = document.getElementById('se-modal');
  expect(modal.textContent).toContain('Buổi hiện tại');
  const s9 = modal.querySelector('input[value="s9"]');
  s9.checked = true;
  s9.dispatchEvent(new Event('change', { bubbles: true }));
  expect(modal.querySelector('input[name="se-mode"]:checked').value).toBe('offline');
  expect(modal.querySelector('.se-summary').textContent).toContain('09:00–09:25');

  global.fetch.mockClear();
  payload = { success: true };
  modal.querySelector('.se-submit').click();
  await new Promise((r) => setTimeout(r));
  const [url, opts] = global.fetch.mock.calls[0];
  expect(url).toBe('http://api/classes/my/speaking-exam/s9/book');
  expect(JSON.parse(opts.body)).toEqual({ mode: 'offline', replaceBooking: true });
  expect(document.getElementById('se-modal')).toBeNull();
});

test('exam history lists each result with band and escaped feedback', async () => {
  payload = { ...base, classes: [{ classId: 'c1', className: 'A', booking: null, openSlots: [], history: [
    { dayKey: '2026-11-10', startTime: '09:00', endTime: '09:25', result: 'done', band: 6.5, feedbackNote: 'Tốt <b>' },
    { dayKey: '2026-11-03', startTime: '09:00', endTime: '09:25', result: 'no_show' },
    { dayKey: '2026-11-01', startTime: '09:00', endTime: '09:25', result: '' },
  ] }] };
  await window.seFetch();
  const html = window.seHistoryFor('c1');
  expect(html).toContain('Band 6.5');
  expect(html).toContain('Tốt &lt;b&gt;');
  expect(html).toContain('Vắng thi');
  expect(html).toContain('Chờ giáo viên ghi kết quả');
  expect(window.seHistoryFor('nope')).toBe('');
});
