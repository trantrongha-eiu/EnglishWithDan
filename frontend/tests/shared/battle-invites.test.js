/**
 * @jest-environment jsdom
 */
// js/shared/battle-invites.js — the ⚔️ invite popup on every page: shows a
// new invite, never twice, waits during an exam-mode test and reports the
// test on its poll (?act=…) so the inviter is warned.
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '../../js/shared/battle-invites.js'), 'utf8');

let invites = [];
const calls = [];
const tick = async (ms) => {
  jest.advanceTimersByTime(ms);
  for (let i = 0; i < 30; i++) await Promise.resolve();
};

beforeAll(() => {
  jest.useFakeTimers();
  window.AuthService = {
    API: 'http://api', getToken: () => 'tok', getUser: () => ({ role: 'student' }),
    authHeader: () => ({ Authorization: 'Bearer tok' }),
  };
  window.fetch = jest.fn((url, opts = {}) => {
    calls.push({ url, method: opts.method || 'GET' });
    const body = /\/invites/.test(url) ? { success: true, invites } : { success: true };
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
  });
  window.eval(SRC);
});
afterAll(() => jest.useRealTimers());

const card = () => document.getElementById('vbi-card');
const INV = { id: 'b1', kind: 'quiz', stake: 10, game: '10 câu: Nghĩa của từ', fromName: 'An Trần', others: [] };

test('a new invite pops up with "Vào trận ngay"; "Để sau" never shows it again', async () => {
  invites = [INV];
  await tick(2000);
  expect(calls.some((c) => /\/vocab-battle\/invites$/.test(c.url))).toBe(true);
  expect(card()).not.toBeNull();
  expect(card().textContent).toContain('An Trần thách đấu từ vựng với bạn!');
  expect(card().querySelector('.vbi-yes').textContent).toContain('Vào trận ngay (10 🔥)');

  card().querySelector('.vbi-later').click();
  expect(card()).toBeNull();
  await tick(11000);
  expect(card()).toBeNull();
});

test('an exam-mode test holds the popup until it ends, and the poll reports it', async () => {
  invites = [{ ...INV, id: 'b2', stake: 0 }];
  window.EwdActivity.set({ skill: 'reading', mode: 'simulation' });
  await tick(500);
  expect(calls[calls.length - 1].url).toMatch(/\/invites\?act=reading&mode=simulation$/);
  await tick(11000);
  expect(card()).toBeNull();

  window.EwdActivity.set(null);
  await tick(500);
  expect(calls[calls.length - 1].url).toMatch(/\/invites\?act=none$/);
  expect(card()).not.toBeNull();
  expect(card().textContent).toContain('Giao hữu');

  // act=none goes once; later polls say nothing (another tab may be mid-test)
  await tick(11000);
  expect(calls[calls.length - 1].url).toMatch(/\/invites$/);
});

test('"Từ chối" declines on the server', async () => {
  card().querySelector('.vbi-no').click();
  await tick(0);
  expect(calls.some((c) => c.url === 'http://api/vocab-battle/b2/decline' && c.method === 'POST')).toBe(true);
  expect(card()).toBeNull();
});

test('a practice-mode test still shows it; an exam starting hides it for later', async () => {
  invites = [{ ...INV, id: 'b3' }];
  window.EwdActivity.set({ skill: 'listening', mode: 'practice' });
  await tick(500);
  expect(card()).not.toBeNull();
  expect(card().textContent).toContain('tab mới');

  window.EwdActivity.set({ skill: 'listening', mode: 'simulation' });
  expect(card()).toBeNull();
  window.EwdActivity.set(null);
  await tick(500);
  expect(card()).not.toBeNull();
  expect(card().textContent).toContain('An Trần');
});
