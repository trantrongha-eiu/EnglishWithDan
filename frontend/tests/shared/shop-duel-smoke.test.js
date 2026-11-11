/**
 * @jest-environment jsdom
 */
// Smoke test for the ⚔️ Thách đấu board (js/shared/duel.js) and the 🎁 on
// the walking linh thú (js/shared/pets.js): both render from API data and
// react to clicks without throwing.
const fs = require('fs');
const path = require('path');

const load = (rel) => {
  // eslint-disable-next-line no-new-func
  new Function(fs.readFileSync(path.join(__dirname, '..', '..', rel), 'utf8'))();
};
const flush = () => new Promise(r => setTimeout(r, 0));

function mockFetch(routes) {
  const calls = [];
  global.fetch = jest.fn((url, opts = {}) => {
    const key = (opts.method || 'GET') + ' ' + url.replace(/^.*\/api/, '');
    calls.push(key);
    const body = routes[key] || { success: false };
    return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
  });
  return calls;
}

beforeEach(() => {
  document.body.innerHTML = '';
  document.body.className = 'has-global-nav';
  delete window.Duel;
  delete window.Pets;
  window.showToast = jest.fn();
  window.AuthService = {
    API: 'http://x/api', authHeader: () => ({}), isLoggedIn: () => true,
    getUser: () => ({ id: 'u1', role: 'student' }),
  };
  window.matchMedia = () => ({ matches: true }); // reduced motion: no rAF loop
  localStorage.clear();
});

const later = new Date(Date.now() + 5 * 3600e3).toISOString();

test('duel board renders incoming, waiting, live and past duels', async () => {
  const calls = mockFetch({
    'GET /shop/duels': {
      success: true,
      rules: { min: 5, max: 100, maxOpen: 3, pendingHours: 24 },
      open: [
        { id: 'd1', status: 'pending', role: 'opponent', rival: { id: 'a', name: 'An' }, stake: 20, pot: 40, myScore: 0, rivalScore: 0, expiresAt: later },
        { id: 'd2', status: 'pending', role: 'challenger', rival: { id: 'b', name: 'Bình' }, stake: 10, pot: 20, myScore: 0, rivalScore: 0, expiresAt: later },
        { id: 'd3', status: 'active', role: 'challenger', rival: { id: 'c', name: 'Chi' }, stake: 15, pot: 30, myScore: 4, rivalScore: 2, endsAt: later },
      ],
      recent: [
        { id: 'd4', status: 'done', result: 'win', role: 'opponent', rival: { id: 'd', name: 'Dũng' }, stake: 5, pot: 10, myScore: 6, rivalScore: 3 },
        { id: 'd5', status: 'declined', role: 'opponent', rival: { id: 'e', name: 'Em' }, stake: 5, pot: 10, myScore: 0, rivalScore: 0 },
      ],
    },
    'POST /shop/duels/d2/cancel': { success: true, wallet: 50 },
  });
  load('js/shared/duel.js');
  const el = document.createElement('div');
  document.body.appendChild(el);
  window.Duel.mount(el, { wallet: 50 });
  await flush(); await flush();

  expect(el.querySelector('[data-duel-accept="d1"]')).not.toBeNull();
  expect(el.querySelector('[data-duel-cancel="d2"]')).not.toBeNull();
  expect(el.querySelector('.duel-card--live.is-lead')).not.toBeNull();
  expect(el.textContent).toContain('dẫn trước 2');
  expect(el.textContent).toContain('Bạn đã từ chối');
  expect(el.querySelector('[data-duel-new]').disabled).toBe(true); // 3 open = the cap

  el.querySelector('[data-duel-cancel="d2"]').click();
  await flush(); await flush();
  expect(calls).toContain('POST /shop/duels/d2/cancel');
});

test('challenge dialog with a fixed rival sends the stake', async () => {
  const calls = mockFetch({ 'POST /shop/duels': { success: true, wallet: 30 } });
  load('js/shared/duel.js');
  window.Duel.challenge({ id: 'r1', name: 'Rival' }, { wallet: 40 });
  const dlg = document.querySelector('.duel-modal');
  expect(dlg.querySelector('[data-ok]').textContent).toContain('Rival');
  dlg.querySelector('[data-set="20"]').click();
  expect(dlg.querySelector('.duel-pot').textContent).toContain('40');
  dlg.querySelector('[data-ok]').click();
  await flush(); await flush();
  expect(calls).toContain('POST /shop/duels');
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ toId: 'r1', stake: 20 });
  expect(document.querySelector('.duel-modal')).toBeNull();
});

test('the walking pet carries a 🎁 when ready and opens it on click', async () => {
  const calls = mockFetch({
    'GET /shop/pet': { success: true, activePet: 'meo', gift: 'ready' },
    'POST /shop/pet-gift': { success: true, flames: 3, item: { key: 'cake', name: 'Bánh Kem Úp Mặt', emoji: '🎂', qty: 1 }, wallet: 13, petId: 'meo' },
  });
  const opened = jest.fn();
  document.addEventListener('ews:pet-gift', opened);
  load('js/shared/pets.js');
  await flush(); await flush();
  const pet = document.querySelector('.ews-pet');
  expect(pet).not.toBeNull();
  expect(pet.classList.contains('has-gift')).toBe(true);

  pet.click();
  await flush(); await flush();
  expect(calls).toContain('POST /shop/pet-gift');
  expect(pet.classList.contains('has-gift')).toBe(false);
  expect(document.querySelector('.ews-pet-bubble').textContent).toContain('+3 🔥');
  expect(opened).toHaveBeenCalled();
  expect(JSON.parse(localStorage.getItem('ews-pet-v1'))).toMatchObject({ id: 'meo', u: 'u1', gift: 'claimed' });
});
