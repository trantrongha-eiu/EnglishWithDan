// @ts-check
/**
 * BXH vocab, Cửa hàng lửa and Hộp thư in the React app (/app/#/leaderboard,
 * /shop, /inbox) against their old static pages (?legacy=1).
 *
 * The API is a stateful mock (production is never touched). Each page is
 * opened both ways with the same data, then compared: the text, the box and
 * main styles of every element, and what each user action sends to the server.
 *
 * Run: npm run test:e2e -- student-app-social
 *      E2E_FRONTEND=<dir> serves another build, E2E_SHOTS=<dir> saves screenshots.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.resolve(process.env.E2E_FRONTEND || path.join(ROOT, 'frontend'));
const SHOTS = process.env.E2E_SHOTS || '';
const PORT = 3137;
const BASE = `http://localhost:${PORT}`;
const { ITEMS, PETS } = require(path.join(ROOT, 'backend', 'constants', 'shop.js'));

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
};
let server;

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(FRONTEND, p);
    if (!file.startsWith(FRONTEND) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(PORT, r));
});
test.afterAll(() => new Promise((r) => server.close(r)));

const NOW = Date.now();
const inHours = (h) => new Date(NOW + h * 3600000).toISOString();
const USER = { _id: 'me1', id: 'me1', username: 'hocvien', firstName: 'An', lastName: 'Trần', role: 'student', plan: 'premium' };

function makeState() {
  const owned = { cake: 2, lens: 1, towel: 1, iceShield: 2 };
  return {
    wallet: 200,
    owned,
    pets: new Set(['meo']),
    gift: 'ready',
    failBuy: false,
    messages: Array.from({ length: 60 }, (_, i) => ({
      _id: `m${i}`,
      subject: i === 3 ? '' : `Tin nhắn số ${i}`,
      body: `Nội dung tin ${i}. `.repeat(i === 0 ? 12 : 2).trim(),
      fromName: i % 5 === 4 ? '' : 'Thầy Dan',
      isBroadcast: i === 1,
      isRead: i > 2 && i !== 55,
      createdAt: new Date(NOW - [0.5, 30, 300, 2000, 20000][i % 5] * 60000).toISOString(),
      giftClaimed: false,
      ...(i === 0 ? { giftHammers: 2, giftStreakDays: 3 } : {}),
      ...(i === 2 ? { giftItem: { key: 'cake', name: 'Bánh Kem Úp Mặt', emoji: '🎂', qty: 2 }, giftPet: { id: 'shiba', name: 'Shiba Lì Xì' } } : {}),
    })),
    mustRead: 0,
    unreadCount: 3,
    duels: {
      success: true,
      rules: { min: 5, max: 100, maxOpen: 3, pendingHours: 24 },
      open: [
        { id: 'd1', status: 'pending', role: 'opponent', stake: 10, pot: 20, rival: { name: 'Bình' }, expiresAt: inHours(5.5) },
        { id: 'd2', status: 'pending', role: 'challenger', stake: 15, pot: 30, rival: { name: 'Chi' }, expiresAt: inHours(3.5) },
      ],
      recent: [{ id: 'd3', status: 'done', result: 'win', myScore: 8, rivalScore: 3, stake: 5, pot: 10, rival: { name: 'Dũng' } }],
    },
  };
}

function shopBody(s) {
  return {
    success: true,
    wallet: s.wallet,
    streak: 12,
    items: ITEMS.map((i) => ({ ...i, owned: s.owned[i.key] || 0 })),
    pets: PETS.map((p) => ({ ...p, owned: s.pets.has(p.id) })),
    activePet: 'meo',
    pet: { id: 'meo', name: 'Mèo Quýt', skill: { icon: '🍀', name: 'Thần Tài', text: 'Thêm quà mỗi ngày' }, gift: s.gift, guard: { max: 2, used: 1, reflect: false } },
    effects: {
      hope: { base: 3, quota: 10, penalty: 5 },
      crownUntil: inHours(47.5), invisibleUntil: inHours(3.5), cakedUntil: inHours(0.4), cakedBy: 'Bình',
    },
    ...(s.shopPatch || {}),
  };
}

function board(kind, limit) {
  const total = kind === 'streak' ? 35 : 12;
  const rows = Array.from({ length: Math.min(limit, total) }, (_, i) => {
    const base = { name: `Học viên ${i + 1}`, avatar: '' };
    const decor = i === 0 ? { crown: true, pet: 'meo' } : i === 1 ? { cakedBy: 'Chi' } : {};
    if (kind === 'quiz') return { ...base, ...decor, userId: `q${i}`, score: 99 - i, timeSpent: 60 + i };
    if (i === 2) return { ...base, _id: `u${i}`, streak: null, hidden: true };
    return { ...base, ...decor, _id: `u${i}`, streak: 40 - i, revealed: i === 3 };
  });
  const me = kind === 'streak'
    ? { rank: 40, total: 45, streak: 2, nextStreak: 3 }
    : { rank: 2, total: 12, score: 98, attempts: 7, timeSpent: 61, nextScore: 99 };
  return { success: true, leaderboard: rows, total, me };
}

async function open(page, url, state = makeState()) {
  const log = [];
  await page.addInitScript(([u, theme]) => {
    if (theme) localStorage.setItem('theme', theme);
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('lastLoginAt', String(Date.now()));
    localStorage.setItem('ews_seen_streak35_notice', '1');
    localStorage.setItem('ews_page_help_seen', '1');
    localStorage.setItem('ews_onboarding_tour_v1_dashboard.html', '1');
  }, [USER, state.theme || '']);
  await page.route(/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|media\.ieltsthayha\.com/, (r) => r.abort());
  await page.route('https://englishwithdan.onrender.com/**', (route) => {
    const req = route.request();
    const u = new URL(req.url());
    const p = u.pathname.replace(/^\/api/, '');
    const json = (body, status = 200) => route.fulfill({
      status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body),
    });
    if (req.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    }
    if (req.method() !== 'GET' && !p.startsWith('/activity') && !p.includes('visit')) {
      log.push(`${req.method()} ${p} ${req.postData() || ''}`);
    }
    const limit = Number(u.searchParams.get('limit') || 10);
    const boardReply = (kind) => (state.failBoards
      ? json({ success: false, message: 'Lỗi máy chủ' }, 500)
      : json({ ...board(kind, limit), ...(state.boardPatch?.[kind] || {}) }));
    if (p === '/user/streak-leaderboard') return boardReply('streak');
    if (p === '/vocabulary-lessons/leaderboard') return boardReply('quiz');
    if (p === '/shop' && req.method() === 'GET') return state.failShop ? json({ success: false }, 500) : json(shopBody(state));
    if (p === '/shop/duels' && req.method() === 'GET') return json(state.duels);
    if (p === '/goals') return json({ success: true, goal: { hasGoal: true } });
    if (p === '/learning/today') return json({ success: true, hasGoal: true, tasks: [] });
    if (p === '/shop/gift-recipients') return json({ success: true, users: [{ _id: 'u9', name: 'Giang', username: 'giang' }] });
    if (p === '/shop/feed') return json({ success: true, feed: [], announce: [] });
    if (p === '/shop/pet') return json({ success: true, pet: null, activePet: '' });
    if (p === '/shop/buy') {
      const b = req.postDataJSON();
      if (state.failBuy) return json({ success: false, message: 'Ví không đủ lửa' }, 400);
      if (b.kind === 'pet') { state.pets.add(b.key); state.wallet -= PETS.find((x) => x.id === b.key).price; return json({ success: true, activePet: b.key }); }
      state.owned[b.key] = (state.owned[b.key] || 0) + b.qty;
      state.wallet -= ITEMS.find((x) => x.key === b.key).price * b.qty;
      return json({ success: true });
    }
    if (p === '/shop/pet-gift') { state.gift = 'claimed'; state.wallet += 4; return json({ success: true, petName: 'Mèo Quýt', flames: 4 }); }
    if (p === '/shop/cake') { state.owned.cake -= 1; return json({ success: true, outcome: 'hit' }); }
    if (p === '/shop/lens') { state.owned.lens -= 1; return json({ success: true }); }
    if (p === '/shop/duels') return json({ success: true });
    if (/^\/shop\/duels\/d\d\/decline$/.test(p)) { state.duels.open = state.duels.open.filter((d) => !p.includes(d.id)); return json({ success: true }); }
    if (/^\/user\/peer\/[^/]+\/profile$/.test(p)) return json({ success: true, profile: { name: 'Bạn học', username: 'ban', streak: 3, badges: [] } });
    if (p === '/user/messages/unread-count') return json({ success: true, count: state.unreadCount, mustReadCount: state.mustRead });
    if (p === '/user/messages/must-read') return json({ success: true, messages: state.messages.filter((m) => m._id === 'm55') });
    if (p === '/user/messages') {
      if (state.failInbox) return json({ success: false, message: 'Lỗi máy chủ' }, 500);
      const pg = Number(u.searchParams.get('page') || 1);
      return json({ success: true, total: state.messages.length, messages: state.messages.slice((pg - 1) * limit, pg * limit) });
    }
    let m = p.match(/^\/user\/messages\/(m\d+)\/read$/);
    if (m) { state.messages.find((x) => x._id === m[1]).isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); return json({ success: true }); }
    m = p.match(/^\/user\/messages\/(m\d+)\/reply$/);
    if (m) return json({ success: true });
    m = p.match(/^\/user\/messages\/(m\d+)\/claim$/);
    if (m) {
      const x = state.messages.find((y) => y._id === m[1]);
      if (x.giftClaimed) return json({ success: false, message: 'Đã nhận' }, 409);
      x.giftClaimed = true;
      return json({ success: true, giftHammers: x.giftHammers, giftStreakDays: x.giftStreakDays, item: x.giftItem ? { ...x.giftItem } : null, pet: x.giftPet || null, activePet: 'shiba' });
    }
    m = p.match(/^\/user\/messages\/(m\d+)$/);
    if (m && req.method() === 'DELETE') { state.messages = state.messages.filter((x) => x._id !== m[1]); return json({ success: true }); }
    return json({ success: true });
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + url);
  await page.addStyleTag({ content: 'body{margin:0} *,*::before,*::after{animation:none!important;transition:none!important} #pcw-root,.nav-corner-dock,#ews-pet-layer,.ews-mascot-dock{display:none!important}' });
  return { log, errors, state };
}

// Every visible element under `sel`: its box (relative to the root) and looks
function fingerprint(page, sel) {
  return page.evaluate((s) => {
    const root = document.querySelector(s);
    const base = root.getBoundingClientRect();
    const out = [{ k: 'ROOT', box: [base.width, base.x].map(Math.round) }];
    const PROPS = ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'borderTopWidth', 'borderTopLeftRadius', 'display', 'textAlign', 'paddingLeft', 'paddingTop'];
    for (const el of root.querySelectorAll('*')) {
      if (el.closest('.lh-mascot, .vlb-lulu, .ews-pet, .vlb-top-lulu, .pet-badge') && !el.matches('.lh-mascot, .vlb-lulu, .ews-pet, .vlb-top-lulu')) continue;
      if (el.closest('svg')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'contents' || cs.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      out.push({
        k: `${el.tagName.toLowerCase()}.${[...el.classList].sort().join('.')}`,
        box: [r.x - base.x, r.y - base.y, r.width, r.height].map(Math.round),
        css: PROPS.map((p) => cs[p]).join('|'),
      });
    }
    return out;
  }, sel);
}

function diffPrints(a, b) {
  const out = [];
  if (a.length !== b.length) out.push(`element count ${a.length} (old) vs ${b.length} (new)`);
  for (let i = 0; i < Math.min(a.length, b.length) && out.length < 12; i++) {
    const x = a[i]; const y = b[i];
    if (x.k !== y.k) { out.push(`#${i} ${x.k} vs ${y.k}`); break; }
    if (x.box.some((v, j) => Math.abs(v - y.box[j]) > 2)) out.push(`#${i} ${x.k} box ${x.box} vs ${y.box}`);
    // Fixed-size steppers: the browser's default padding can't show (same box)
    const looks = (e) => (/^(button|input)\./.test(e.k) ? e.css.split('|').slice(0, -2).join('|') : e.css);
    if (looks(x) !== looks(y)) out.push(`#${i} ${x.k} css ${x.css} vs ${y.css}`);
  }
  return out;
}

// (Lulu or Lumi speaks at random, with a random emoji)
const text = async (page, sel) => (await page.locator(sel).innerText()).replace(/\s+/g, ' ').replace(/\b(Lulu|Lumi) \S+ /g, 'Lulu ').trim();
const toastSeen = (page, t) => expect(page.locator('.toast-msg', { hasText: t }).first()).toBeVisible();
const petsReady = (page) => page.waitForFunction(() => !!window.Pets);

const PAGES = {
  leaderboard: {
    legacy: '/vocab-leaderboard.html?legacy=1', app: '/app/#/leaderboard', root: '.vlb-shell',
    ready: async (p) => {
      await petsReady(p);
      await p.locator('#dan-lb-list .dan-lb-row').nth(9).waitFor();
      await p.locator('#quiz-lb-list .dan-lb-row').nth(9).waitFor();
      await p.locator('.vlb-duel-btn').first().waitFor();
      await p.locator('#vlb-lulu > *').first().waitFor();
      await p.locator('.pet-badge, .dan-lb-row .ews-pet-badge, .dan-lb-row svg').first().waitFor();
    },
  },
  shop: {
    legacy: '/shop.html?legacy=1', app: '/app/#/shop', root: '.shop-shell',
    ready: async (p) => {
      await petsReady(p);
      await p.locator('#shop-items h3').first().waitFor();
      await p.locator('#shop-susano h3').first().waitFor();
      await p.locator('#shop-duels .duel-intro').waitFor();
      await p.locator('#shop-pets svg').first().waitFor();
    },
  },
  inbox: {
    legacy: '/inbox.html?legacy=1', app: '/app/#/inbox', root: '.inbox-layout',
    ready: async (p) => {
      await petsReady(p);
      await p.locator('.msg-item').nth(49).waitFor();
      await p.locator('.msg-item[data-id="m2"]').click();
      await p.locator('#replyText').waitFor();
      await p.locator('.gift-pet-art svg').waitFor();
    },
  },
};

async function compare(browser, name, label, { viewport = { width: 1280, height: 900 }, patch = () => {}, ready, root } = {}) {
  const cfg = { ...PAGES[name], root: root || PAGES[name].root };
  const snap = async (url, tag) => {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const state = makeState();
    patch(state);
    const { errors } = await open(page, url, state);
    await (ready || cfg.ready)(page);
    const print = await fingerprint(page, cfg.root);
    const words = await text(page, cfg.root);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${name}-${label}-${tag}.png`.replace(/\s+/g, '-')), fullPage: true });
    await ctx.close();
    return { print, words, errors };
  };
  const old = await snap(cfg.legacy, 'old');
  const now = await snap(cfg.app, 'new');
  expect(now.errors).toEqual([]);
  let at = 0;
  while (at < old.words.length && old.words[at] === now.words[at]) at += 1;
  expect(now.words.slice(Math.max(0, at - 40), at + 60)).toBe(old.words.slice(Math.max(0, at - 40), at + 60));
  expect(diffPrints(old.print, now.print)).toEqual([]);
}

for (const name of Object.keys(PAGES)) {
  test(`${name} looks the same as the old page (desktop)`, ({ browser }) => compare(browser, name, 'desktop'));
  test(`${name} looks the same as the old page (phone)`, ({ browser }) => compare(browser, name, 'phone', { viewport: { width: 390, height: 844 } }));
  test(`${name} looks the same as the old page (dark)`, ({ browser }) => compare(browser, name, 'dark', { patch: (s) => { s.theme = 'dark'; } }));
}

const shopReady = async (p) => {
  await petsReady(p);
  await p.locator('#shop-items h3').first().waitFor();
  await p.locator('#shop-pets svg').first().waitFor();
  await p.locator('#shop-duels .duel-intro').waitFor();
};
const boardsReady = async (p) => {
  await petsReady(p);
  await p.locator('#dan-lb-list[aria-busy]').waitFor({ state: 'detached' });
  await p.locator('#quiz-lb-list[aria-busy]').waitFor({ state: 'detached' });
  await p.locator('#vlb-lulu > *').first().waitFor();
};
const inboxReady = (sel) => (p) => p.locator(sel).first().waitFor();

const VARIANTS = [
  ['shop', 'new student who won the hammer bet', shopReady, (s) => {
    s.pets = new Set();
    s.shopPatch = { pet: null, activePet: '', effects: { hopeLast: { day: '2026-11-17', success: true, base: 12 } } };
  }],
  ['shop', 'pet at home, lost bet, caked without a towel', shopReady, (s) => {
    s.owned.towel = 0;
    s.shopPatch = { pet: null, activePet: '', effects: { hopeLast: { day: '2026-11-16', success: false, base: 2, penalty: 5 }, cakedUntil: inHours(5.5) } };
  }],
  ['shop', 'gift not earned yet, quota reached', shopReady, (s) => {
    s.gift = null;
    s.wallet = 3;
    s.shopPatch = { effects: { hope: { base: 12, quota: 10, penalty: 5 } } };
  }],
  ['shop', 'load failed', (p) => p.locator('#shop-items .shop-empty').waitFor(), (s) => { s.failShop = true; }],
  ['leaderboard', 'first place, nobody on the quiz board', boardsReady, (s) => {
    s.boardPatch = {
      streak: { me: { rank: 1, total: 45, streak: 40, hidden: true } },
      quiz: { leaderboard: [], total: 0, me: { rank: null, total: 0 } },
    };
  }],
  ['leaderboard', 'staff account shape, no shop', boardsReady, (s) => {
    s.failShop = true;
    s.boardPatch = { streak: { me: null }, quiz: { me: null } };
  }],
  ['leaderboard', 'tied with the rank above', boardsReady, (s) => {
    s.boardPatch = {
      streak: { me: { rank: 7, total: 45, streak: 34 } },
      quiz: { me: { rank: 5, total: 12, score: 95, attempts: 3, timeSpent: 70, nextScore: 95 } },
    };
  }],
  ['leaderboard', 'boards failed', (p) => p.locator('#quiz-lb-list .dan-lb-empty').waitFor(), (s) => { s.failBoards = true; }],
  ['inbox', 'empty', inboxReady('.empty-state'), (s) => { s.messages = []; }],
  ['inbox', 'load failed', inboxReady('.empty-state p:has-text("Lỗi máy chủ")'), (s) => { s.failInbox = true; }],
  ['inbox', 'claimed gift in a broadcast', async (p) => {
    await p.locator('.msg-item[data-id="m1"]').click();
    await p.locator('.gift-claimed-label').waitFor();
  }, (s) => { Object.assign(s.messages[1], { giftHammers: 1, giftClaimed: true }); }],
];

for (const [name, label, ready, patch] of VARIANTS) {
  test(`${name} matches the old page: ${label}`, ({ browser }) => compare(browser, name, label, { ready, patch }));
}

for (const theme of ['light', 'dark']) {
  const patch = (s) => { s.theme = theme; };
  test(`buy dialog matches the old page (${theme})`, ({ browser }) => compare(browser, 'shop', `buy dialog ${theme}`, {
    patch,
    root: '.shop-qty-modal',
    ready: async (p) => { await shopReady(p); await p.locator('[data-buy="cake"]').click(); await p.locator('.shop-qty-input').waitFor(); },
  }));
  test(`duel dialog from the shop matches the old page (${theme})`, ({ browser }) => compare(browser, 'shop', `duel dialog ${theme}`, {
    patch,
    root: '.duel-modal',
    ready: async (p) => { await shopReady(p); await p.locator('[data-duel-new]').click(); await p.locator('.duel-modal [data-pick="u9"]').waitFor(); },
  }));
  test(`duel dialog from the board matches the old page (${theme})`, ({ browser }) => compare(browser, 'leaderboard', `duel dialog ${theme}`, {
    patch,
    root: '.duel-modal',
    ready: async (p) => { await PAGES.leaderboard.ready(p); await p.locator('[data-duel="u5"]').click(); await p.locator('.duel-modal [data-ok]').waitFor(); },
  }));
}

async function leaderboardFlow(page, log) {
  await PAGES.leaderboard.ready(page);
  await expect(page.locator('#dan-lb-list .dan-lb-row')).toHaveCount(11); // top 10 + my pinned row
  await expect(page.locator('.vlb-more[data-more="streak"]')).toContainText('+20');
  await page.locator('.vlb-more[data-more="streak"]').click();
  await expect(page.locator('#dan-lb-list .dan-lb-row')).toHaveCount(31);
  await expect(page.locator('.vlb-more[data-more="streak"]')).toContainText('+5');

  await page.locator('#dan-lb-list .dan-lb-row').nth(4).locator('.dan-lb-name').click();
  await expect(page.locator('#modal-peer-profile')).toBeVisible();
  await page.evaluate(() => window.closePeerProfile());

  // 🎂 / 🔍 / ⚔️ must not open the row's profile
  await page.locator('[data-cake="u0"]').click();
  await expect(page.locator('#shared-confirm-modal')).toBeVisible();
  await expect(page.locator('#modal-peer-profile')).toBeHidden();
  await page.locator('#shared-confirm-ok').click();
  await toastSeen(page, 'dính đầy kem');
  await expect(page.locator('.vlb-shop-bits')).toContainText('Bạn có 1 🎂');
  await expect(page.locator('#dan-lb-list .dan-lb-row')).toHaveCount(31); // "Xem thêm" survives the refresh

  await page.locator('[data-lens="u2"]').click();
  await page.locator('#shared-confirm-ok').click();
  await toastSeen(page, 'đã rách');
  await expect(page.locator('[data-lens]')).toHaveCount(0);

  await page.locator('[data-duel="u5"]').click();
  await expect(page.locator('.duel-modal')).toBeVisible();
  await expect(page.locator('#modal-peer-profile')).toBeHidden();
  await page.locator('.duel-modal [data-set="20"]').click();
  await page.locator('.duel-modal [data-ok]').click();
  await toastSeen(page, 'Đã gửi lời thách');
  await expect(page.locator('.duel-modal')).toHaveCount(0);
  expect(log).toHaveLength(3);
}

async function shopFlow(page, log, state) {
  await PAGES.shop.ready(page);
  await expect(page.locator('[data-buy="iceShield"]')).toBeDisabled();
  await expect(page.locator('[data-buy="iceShield"]')).toHaveText('Đã đầy');

  const dlg = page.locator('.shop-qty-modal');
  await page.locator('[data-buy="cake"]').click();
  await expect(dlg.locator('.shop-qty-input')).toBeFocused();
  await expect(dlg.locator('[data-step="-1"]')).toBeDisabled();
  await dlg.locator('[data-step="1"]').click();
  await expect(dlg.locator('.shop-qty-total')).toContainText('2 × 🔥 10 = 🔥 20');
  await dlg.locator('[data-set="10"]').click();
  await expect(dlg.locator('[data-ok]')).toHaveText('Mua 10 · 🔥 100');
  await dlg.locator('.shop-qty-input').fill('500');
  await expect(dlg.locator('[data-ok]')).toHaveText('Mua 20 · 🔥 200');
  await page.keyboard.press('Escape');
  await expect(dlg).toHaveCount(0);

  await page.locator('[data-buy="cake"]').click();
  await dlg.locator('.shop-qty-input').fill('3');
  await page.keyboard.press('Enter');
  await toastSeen(page, 'Đã mua 3 Bánh Kem');
  await expect(page.locator('#shop-wallet-value')).toHaveText('170');

  await page.locator('[data-buy-pet="shiba"]').click();
  await expect(page.locator('#shared-confirm-title')).toContainText('Shiba');
  await page.locator('#shared-confirm-ok').click();
  await toastSeen(page, 'đã về nhà với bạn');
  await expect(page.locator('#shop-wallet-value')).toHaveText('140');

  await page.locator('[data-pet-gift]').click();
  await toastSeen(page, 'mang về +4');
  await expect(page.locator('.shop-gift-done')).toBeVisible();

  state.failBuy = true;
  await page.locator('[data-buy="towel"]').click();
  await dlg.locator('[data-ok]').click();
  await toastSeen(page, 'Ví không đủ lửa');
  state.failBuy = false;

  await page.locator('[data-duel-decline="d1"]').click();
  await toastSeen(page, 'Đã từ chối');
  await expect(page.locator('[data-duel-decline]')).toHaveCount(0);

  await page.locator('[data-duel-new]').click();
  await page.locator('.duel-modal [data-pick="u9"]').click();
  await page.locator('.duel-modal [data-ok]').click();
  await toastSeen(page, 'Đã gửi lời thách');
  expect(log).toHaveLength(6);
}

async function inboxFlow(page, log) {
  await page.locator('.msg-item').nth(49).waitFor();
  await expect(page.locator('#unreadBadge')).toHaveText('3');
  await page.locator('.msg-item[data-id="m0"]').click();
  await expect(page.locator('.detail-subject')).toHaveText('Tin nhắn số 0');
  await expect(page.locator('#unreadBadge')).toHaveText('2');
  await expect(page.locator('.msg-item[data-id="m0"]')).toHaveClass(/selected/);
  await expect(page.locator('.msg-item[data-id="m0"] .dot-unread')).toHaveCount(0);

  await page.locator('#replySendBtn').click();
  await expect(page.locator('#replyText')).toBeFocused();
  await page.locator('#replyText').fill('Em cảm ơn thầy');
  await page.locator('#replySendBtn').click();
  await toastSeen(page, 'Đã gửi phản hồi');
  await expect(page.locator('#replyText')).toHaveValue('');

  await page.locator('#claimGiftBtn').click();
  await toastSeen(page, 'Đã nhận quà: 2 búa, 3 lửa');
  await expect(page.locator('.gift-claimed-label')).toBeVisible();

  await page.locator('.msg-item[data-id="m2"]').click();
  await expect(page.locator('.detail-subject')).toHaveText('Tin nhắn số 2');
  await page.locator('.detail-actions .btn-danger').click();
  await expect(page.locator('#shared-confirm-msg')).toContainText('còn quà chưa nhận');
  await page.locator('#shared-confirm-ok').click();
  await expect(page.locator('.msg-item[data-id="m2"]')).toHaveCount(0);
  await expect(page.locator('.detail-placeholder')).toBeVisible();

  await expect(page.locator('#loadMoreBtn')).toContainText('Xem thêm (49/59)');
  await page.locator('#loadMoreBtn').click();
  // the delete shifted the server's pages by one, as on the old page
  await expect(page.locator('.msg-item')).toHaveCount(58);
  expect(log.length).toBe(5);
}

const FLOWS = { leaderboard: leaderboardFlow, shop: shopFlow, inbox: inboxFlow };

for (const [name, flow] of Object.entries(FLOWS)) {
  test(`${name}: every action sends the same requests as the old page`, async ({ browser }) => {
    const run = async (url) => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await ctx.newPage();
      const { log, state, errors } = await open(page, url);
      await flow(page, log, state);
      await ctx.close();
      return { log, errors };
    };
    const old = await run(PAGES[name].legacy);
    const now = await run(PAGES[name].app);
    expect(now.errors).toEqual([]);
    expect(now.log).toEqual(old.log);
  });
}

test.describe('inside the React app', () => {
  test.beforeEach(({ page }) => page.setViewportSize({ width: 1280, height: 900 }));

  for (const [from, to] of [
    ['/vocab-leaderboard.html', '/app/#/leaderboard'], ['/shop.html', '/app/#/shop'],
    ['/inbox.html', '/app/#/inbox'], ['/inbox.html?msg=m7', '/app/#/inbox?msg=m7'],
  ]) {
    test(`${from} forwards to ${to}`, async ({ page }) => {
      await open(page, from);
      await page.waitForURL(BASE + to);
    });
  }

  test('?msg= finds a message on a later page and marks it read', async ({ page }) => {
    const { log } = await open(page, '/app/#/inbox?msg=m55');
    await expect(page.locator('.detail-subject')).toHaveText('Tin nhắn số 55');
    await expect(page.locator('.msg-item[data-id="m55"]')).toHaveClass(/selected/);
    expect(log).toEqual(['PATCH /user/messages/m55/read ']);
  });

  test('moves between pages without a reload; each page stylesheet leaves with it', async ({ page }) => {
    await open(page, '/app/#/shop');
    await PAGES.shop.ready(page);
    await page.evaluate(() => { window.__sameDocument = true; });
    await expect(page.locator('.nav-dropdown > a[href="/app/#/leaderboard"]')).toHaveClass(/active/);
    await page.locator('.shop-wallet-side a').click();
    await PAGES.leaderboard.ready(page);
    await expect(page).toHaveTitle(/BXH Vocab/);
    await page.locator('a[href="/app/#/inbox"]').first().click();
    await page.locator('.msg-item').first().waitFor();
    await expect(page).toHaveTitle(/Hộp thư/);
    expect(await page.evaluate(() => [...document.querySelectorAll('link[href*="/css/"]')].some((l) => /css\/(shop|vocab-leaderboard|entrance-test)\.css/.test(l.href)))).toBe(false);
    await page.evaluate(() => { location.hash = '#/classroom'; });
    await page.waitForFunction(() => !document.querySelector('.inbox-layout'));
    expect(await page.evaluate(() => [...document.querySelectorAll('link[href*="/css/"]')].some((l) => /css\/(inbox|pf-pages)\.css/.test(l.href)))).toBe(false);
    expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
  });

  test('leaving the shop stops the duel board and closes its dialog', async ({ page }) => {
    await open(page, '/app/#/shop');
    await PAGES.shop.ready(page);
    await page.locator('[data-duel-new]').click();
    await expect(page.locator('.duel-modal')).toBeVisible();
    await page.evaluate(() => { location.hash = '#/classroom'; });
    await expect(page.locator('.duel-modal')).toHaveCount(0);
    let calls = 0;
    page.on('request', (r) => { if (r.url().endsWith('/shop/duels')) calls += 1; });
    await page.evaluate(() => window.Duel.reload());
    await page.waitForTimeout(200);
    expect(calls).toBe(0);
  });

  test('reading a message refreshes the nav badge at once', async ({ page }) => {
    await open(page, '/app/#/inbox');
    await expect(page.locator('#navInboxBadge')).toHaveText('3');
    await page.locator('.msg-item[data-id="m0"]').click();
    await expect(page.locator('#navInboxBadge')).toHaveText('2');
  });

  test('must-read popup: never on the inbox; its link opens the message in place', async ({ page }) => {
    const state = makeState();
    state.mustRead = 1;
    await open(page, '/app/#/inbox', state);
    await page.locator('.msg-item').first().waitFor();
    await page.waitForTimeout(600);
    await expect(page.locator('#nav-mustread-overlay')).toHaveCount(0);

    await page.evaluate(() => { location.hash = '#/classroom'; });
    await page.evaluate(() => window.refreshInboxBadge());
    await expect(page.locator('#nav-mustread-overlay')).toBeVisible();
    await page.evaluate(() => { window.__sameDocument = true; });
    await page.locator('#nav-mustread-overlay a').first().click();
    await expect(page.locator('#nav-mustread-overlay')).toHaveCount(0);
    await expect(page.locator('.detail-subject')).toHaveText('Tin nhắn số 55');
    expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
  });

  test('page guide and activity tracking know the route', async ({ page }) => {
    await open(page, '/app/#/shop');
    await PAGES.shop.ready(page);
    await page.locator('#globalHelpBtn').click();
    await page.waitForFunction(() => !!window.PageHelp);
    expect(await page.evaluate(() => window.PageHelp.pageKey())).toBe('shop.html');
    await page.evaluate(() => { window.PageHelp.close(); location.hash = '#/leaderboard'; });
    await page.waitForFunction(() => window.PageHelp.pageKey() === 'vocab-leaderboard.html');
  });

  test('on a phone an opened message comes into view, and Back returns to its row', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/app/#/inbox');
    await page.locator('.msg-item[data-id="m20"]').click();
    await expect(page.locator('.detail-subject')).toBeInViewport();
    await page.locator('.mobile-back-btn').click();
    await expect(page.locator('.msg-item[data-id="m20"]')).toBeInViewport();
  });

  test('the account dock belongs to the vocab home only', async ({ page }) => {
    const errors = (await open(page, '/app/#/shop')).errors;
    await PAGES.shop.ready(page);
    const dock = () => page.evaluate(() => ({
      shown: document.getElementById('navCornerDock').style.display !== 'none',
      cls: document.body.classList.contains('has-corner-dock'),
    }));
    expect(await dock()).toEqual({ shown: false, cls: false });
    await page.locator('.nav-dropdown > a[href="/app/#/dashboard"]').click();
    await page.locator('.dash-vocab-hero').waitFor();
    expect(await dock()).toEqual({ shown: true, cls: true });
    await page.locator('.dash-vocab-hero-lb').evaluate((a) => a.click()); // a popup may cover it
    await PAGES.leaderboard.ready(page);
    expect(await dock()).toEqual({ shown: false, cls: false });
    expect(errors).toEqual([]);
  });

  test('a failed load offers a retry', async ({ page }) => {
    await open(page, '/app/#/shop', { ...makeState(), failShop: true });
    await expect(page.locator('#shop-items .shop-empty')).toContainText('Không tải được cửa hàng');
    await expect(page.locator('#shop-duels .shop-empty')).toBeVisible();
  });
});
