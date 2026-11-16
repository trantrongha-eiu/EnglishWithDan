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
