// @ts-check
/**
 * Chiến lược luyện đề in the React app (/app/reading-listening-strategy)
 * against its old static page (reading-listening-strategy.html?legacy=1).
 *
 * The API is a mock of /api/exam-timetable that answers like
 * backend/services/examTimetableService.js; production is never touched.
 * Each screen is opened both ways with the same data and compared: the
 * text, the box and main styles of every element, and what each action sends.
 *
 * Run: npx playwright test e2e/student-app-strategy.spec.js --workers=1
 *      E2E_FRONTEND=<dir> serves another build, E2E_SHOTS=<dir> saves screenshots.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.resolve(process.env.E2E_FRONTEND || path.join(ROOT, 'frontend'));
const SHOTS = process.env.E2E_SHOTS || '';
const PORT = 3142 + 100 * Number(process.env.TEST_PARALLEL_INDEX || 0);
const BASE = `http://localhost:${PORT}`;
const APP = '/app/reading-listening-strategy';
const OLD = '/reading-listening-strategy.html?legacy=1';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
};
let server;
test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    if (p.startsWith('/app/') && !p.startsWith('/app/assets/')) p = '/app/index.html';
    const file = path.join(FRONTEND, p);
    if (!file.startsWith(FRONTEND) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(PORT, r));
});
test.afterAll(() => new Promise((r) => server.close(r)));

// ── mock data ──
const USER = { _id: 'me1', id: 'me1', username: 'hocvien', firstName: 'An', lastName: 'Trần', role: 'student', plan: 'premium' };
const LOGS = [
  { id: 'l1', skill: 'reading', label: 'Cambridge 18 Test 2', week: 2, date: '2026-11-20T09:00:00.000Z', reviewed: true, mistake: 'T/F/NG nhầm NOT GIVEN' },
  { id: 'l2', skill: 'listening', label: '', week: null, date: '2026-11-18T09:00:00.000Z', reviewed: false, mistake: '' },
  { id: 'l3', skill: 'full', label: 'Mock tuần 1', week: 1, date: '2026-11-15T09:00:00.000Z', reviewed: false, mistake: 'Distractor Section 2' },
];
const worked = (s) => {
  s.checklist = { 'w1-class1': true, 'w1-class2': true, 'w1-class3': true, 'w1-home1': true, 'w1-home2': true, 'w1-home3': true, 'w2-class1': true, 'w3-home2': true, 'b7-w1-class1': true };
  s.logs = LOGS.map((l) => ({ ...l }));
};

function serialize(s) {
  const checklist = { ...s.checklist };
  return {
    success: true,
    checklist,
    testLogs: s.logs.slice().sort((a, b) => new Date(b.date) - new Date(a.date)),
    stats: { totalChecked: Object.values(checklist).filter(Boolean).length, totalItems: 42, totalLogs: s.logs.length, totalReviewed: s.logs.filter((l) => l.reviewed).length },
  };
}

async function open(page, url, state = {}) {
  const log = [];
  const s = { checklist: {}, logs: [], seq: 0, ...state };
  await page.addInitScript(([u, theme, band]) => {
    Math.random = () => 0;
    if (theme) localStorage.setItem('theme', theme);
    if (band) localStorage.setItem('tt_band', band);
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('lastLoginAt', String(Date.now()));
    localStorage.setItem('ews_seen_streak35_notice', '1');
    localStorage.setItem('ews_page_help_seen', '1');
    localStorage.setItem('ews_onboarding_tour_v1_dashboard.html', '1');
    window.__go = (route) => { history.pushState(null, '', '/app' + route); window.dispatchEvent(new PopStateEvent('popstate')); };
  }, [USER, s.theme || '', s.band || '']);
  await page.route(/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|media\.ieltsthayha\.com/, (r) => r.abort());
  await page.route('https://englishwithdan.onrender.com/**', (route) => {
    const req = route.request();
    const p = new URL(req.url()).pathname.replace(/^\/api/, '');
    const m = req.method();
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });
    if (m === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    if (!p.startsWith('/exam-timetable')) return json({ success: true });
    const body = () => { try { return JSON.parse(req.postData() || '{}'); } catch { return {}; } };
    log.push(`${m} ${p} ${req.postData() || ''}`.trim());
    const q = p.slice('/exam-timetable'.length);
    if (s.fail && (m !== 'GET' || s.fail === 'all')) return json({ success: false, message: 'Lỗi server' }, 500);
    if (q === '' && m === 'GET') return json(serialize(s));
    let mm;
    if ((mm = q.match(/^\/checklist\/(.+)$/)) && m === 'PUT') { s.checklist[decodeURIComponent(mm[1])] = !!body().checked; return json(serialize(s)); }
    if (q === '/logs' && m === 'POST') {
      const b = body();
      s.seq += 1;
      s.logs.push({ id: 'n' + s.seq, skill: b.skill, label: b.label || '', week: b.week == null || b.week === '' ? null : Number(b.week), date: `2026-11-2${s.seq + 1}T09:00:00.000Z`, reviewed: false, mistake: b.mistake || '' });
      return json(serialize(s));
    }
    if ((mm = q.match(/^\/logs\/(.+)$/))) {
      const i = s.logs.findIndex((l) => l.id === mm[1]);
      if (m === 'PATCH') Object.assign(s.logs[i], { reviewed: !!body().reviewed });
      if (m === 'DELETE') s.logs.splice(i, 1);
      return json(serialize(s));
    }
    return json({ success: false }, 404);
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + url);
  await page.addStyleTag({ content: 'body{margin:0} html{scroll-behavior:auto!important} *,*::before,*::after{animation:none!important;transition:none!important} #pcw-root,.nav-corner-dock,#ews-pet-layer,.ews-mascot-dock,.ask-lulu-bubble,#nav-vocab-goal-nudge{display:none!important}' });
  return { log, errors, s };
}

function fingerprint(page, sel) {
  return page.evaluate((q) => {
    const root = document.querySelector(q);
    const base = root.getBoundingClientRect();
    const out = [{ k: 'ROOT', box: [base.width, base.x].map(Math.round) }];
    const PROPS = ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'borderTopWidth', 'borderTopLeftRadius', 'display', 'textAlign', 'paddingLeft', 'paddingTop'];
    for (const el of root.querySelectorAll('*')) {
      if (el.closest('.lh-mascot') && !el.matches('.lh-mascot')) continue;
      if (el.closest('svg')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'contents' || cs.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      out.push({ k: `${el.tagName.toLowerCase()}.${[...el.classList].sort().join('.')}`, box: [r.x - base.x, r.y - base.y, r.width, r.height].map(Math.round), css: PROPS.map((p) => cs[p]).join('|') });
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
    if (x.css !== y.css) out.push(`#${i} ${x.k} css ${x.css} vs ${y.css}`);
  }
  return out;
}
const text = async (page, sel) => (await page.locator(sel).innerText()).replace(/\s+/g, ' ').trim();

const ready = async (p) => {
  await p.locator('.tt-week').first().waitFor();
  await p.locator('.st-hero .lh-mascot').waitFor();
};
const loaded = async (p) => { await ready(p); await p.locator('#tt-progress-txt', { hasText: '%' }).waitFor(); };
const PAGES = {
  fresh: { ready: loaded },
  worked: { patch: worked, ready: async (p) => { await loaded(p); await p.locator('#tt-log-tbody tr[data-log-id]').first().waitFor(); } },
  band7: { patch: (s) => { worked(s); s.band = '7.0'; }, ready: async (p) => { await loaded(p); await p.locator('#tt-log-tbody tr[data-log-id]').first().waitFor(); } },
  bandSwitched: { patch: worked, ready: async (p) => { await loaded(p); await p.locator('.tt-band-btn[data-band="7.0"]').click(); await p.locator('.tt-band-btn.active[data-band="7.0"]').waitFor(); } },
  weeksOpen: {
    patch: worked,
    ready: async (p) => { await loaded(p); await p.locator('#tt-week-1 > summary').click(); for (const n of [2, 5, 7]) await p.locator(`#tt-week-${n} > summary`).click(); await p.locator('#tt-week-7[open]').waitFor(); },
  },
  // Not signed in / server down: the plan, without saved progress
  offline: { patch: (s) => { s.fail = 'all'; }, ready: async (p) => { await ready(p); await p.waitForTimeout(400); } },
  mobileToc: { phoneOnly: true, ready: async (p) => { await loaded(p); await p.locator('.st-mob-toc > summary').click(); await p.locator('.st-mob-toc[open]').waitFor(); } },
};

async function compare(browser, name, label, { viewport = { width: 1280, height: 900 }, patch = () => {} } = {}) {
  test.setTimeout(120 * 1000);
  const cfg = PAGES[name];
  const snap = async (url, tag) => {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce', locale: 'vi-VN' });
    const page = await ctx.newPage();
    const state = {};
    cfg.patch?.(state);
    patch(state);
    const { errors } = await open(page, url, state);
    await cfg.ready(page);
    await page.mouse.move(0, 0);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(500);
    await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
    const print = await fingerprint(page, '.st-layout');
    const words = await text(page, '.st-layout');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `strat-${name}-${label}-${tag}.png`), fullPage: true });
    await ctx.close();
    return { print, words, errors };
  };
  const old = await snap(OLD, 'old');
  const now = await snap(APP, 'new');
  expect(now.errors).toEqual([]);
  let at = 0;
  while (at < old.words.length && old.words[at] === now.words[at]) at += 1;
  expect(now.words.slice(Math.max(0, at - 40), at + 60)).toBe(old.words.slice(Math.max(0, at - 40), at + 60));
  expect(diffPrints(old.print, now.print)).toEqual([]);
}

const PHONE = { width: 390, height: 844 };
for (const [name, cfg] of Object.entries(PAGES)) {
  if (!cfg.phoneOnly) test(`${name} looks the same as the old page (desktop)`, ({ browser }) => compare(browser, name, 'desktop'));
  test(`${name} looks the same as the old page (phone)`, ({ browser }) => compare(browser, name, 'phone', { viewport: PHONE }));
  test(`${name} looks the same as the old page (dark)`, ({ browser }) => compare(browser, name, 'dark', { viewport: cfg.phoneOnly ? PHONE : undefined, patch: (s) => { s.theme = 'dark'; } }));
}

// ── what each action sends ──
const FLOWS = {
  checklist: {
    patch: worked,
    flow: async (p, log) => {
      await loaded(p);
      await p.locator('[data-tt-check="w1-class1"]').uncheck();
      await expect(p.locator('#tt-week-1 .tt-week-count')).toHaveText('5/6');
      await p.locator('#tt-week-2 > summary').click();
      await p.locator('[data-tt-check="w2-home3"]').check();
      await expect(p.locator('#tt-progress-txt')).toHaveText('8/42 buổi (19%)');
      await expect.poll(() => log.length).toBe(3);
    },
  },
  band7Checklist: {
    patch: worked,
    flow: async (p, log) => {
      await loaded(p);
      await p.locator('.tt-band-btn[data-band="7.0"]').click();
      await expect(p.locator('#tt-progress-txt')).toHaveText('1/42 buổi (2%)');
      await p.locator('[data-tt-check="b7-w1-class2"]').check();
      await expect(p.locator('#tt-progress-txt')).toHaveText('2/42 buổi (5%)');
      await expect.poll(() => log.length).toBe(2);
      expect(await p.evaluate(() => localStorage.getItem('tt_band'))).toBe('7.0');
    },
  },
  addLog: {
    flow: async (p, log) => {
      await loaded(p);
      await p.locator('#tt-log-skill').selectOption('listening');
      await p.locator('#tt-log-week').selectOption('3');
      await p.locator('#tt-log-label').fill('  Cambridge 19 Test 1 ');
      await p.locator('#tt-log-mistake').fill('Spelling');
      await p.locator('#tt-log-form button[type="submit"]').click();
      await p.locator('#tt-log-tbody tr[data-log-id="n1"]').waitFor();
      await expect(p.locator('#tt-log-label')).toHaveValue('');
      await expect(p.locator('#tt-log-mistake')).toHaveValue('');
      await expect(p.locator('#tt-log-week')).toHaveValue('');
      await expect(p.locator('#tt-log-skill')).toHaveValue('listening');
      await expect(p.locator('#tt-stat-tests')).toHaveText('1');
      // an empty one too: only the skill is needed
      await p.locator('#tt-log-form button[type="submit"]').click();
      await p.locator('#tt-log-tbody tr[data-log-id="n2"]').waitFor();
      await expect.poll(() => log.length).toBe(3);
    },
  },
  reviewAndDelete: {
    patch: worked,
    flow: async (p, log) => {
      await loaded(p);
      await p.locator('#tt-log-tbody tr[data-log-id]').first().waitFor();
      await p.locator('[data-log-reviewed="l2"]').check();
      await expect(p.locator('#tt-stat-reviewed')).toHaveText('2');
      await p.locator('[data-log-del="l3"]').click();
      await expect(p.locator('#tt-log-tbody tr[data-log-id="l3"]')).toHaveCount(0);
      await expect(p.locator('#tt-stat-tests')).toHaveText('2');
      await expect.poll(() => log.length).toBe(3);
    },
  },
};
for (const [name, f] of Object.entries(FLOWS)) {
  test(`${name}: every action sends the same requests as the old page`, async ({ browser }) => {
    test.setTimeout(120 * 1000);
    const go = async (url) => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'vi-VN' });
      const page = await ctx.newPage();
      const state = {};
      f.patch?.(state);
      const { log, errors } = await open(page, url, state);
      await f.flow(page, log);
      await page.waitForTimeout(300);
      await ctx.close();
      return { log, errors };
    };
    const old = await go(OLD);
    const now = await go(APP);
    expect(now.errors).toEqual([]);
    expect(now.log).toEqual(old.log);
  });
}

test.describe('inside the React app', () => {
  test('the old address forwards, keeping its #section, and opens there', async ({ page }) => {
    await open(page, '/reading-listening-strategy.html#sec-listen');
    await page.waitForURL(`${BASE}${APP}#sec-listen`);
    await ready(page);
    await expect.poll(() => page.locator('#sec-listen').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(120);
    await expect(page.locator('.st-sidebar a.active')).toHaveAttribute('href', '#sec-listen');
  });

  test('the menu opens the page in place and marks it; the table of contents scrolls without leaving', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, '/app/tuition');
    await page.locator('#debtBanner').waitFor();
    await page.evaluate(() => { window.__sameDocument = true; });
    const link = page.locator(`.nav-dropdown a[href="${APP}"]`).first();
    await expect(link).toHaveCount(1);
    await page.evaluate((href) => { document.querySelector(`.nav-dropdown a[href="${href}"]`).click(); }, APP);
    await ready(page);
    await expect(page).toHaveTitle('Chiến lược luyện đề – EnglishWithDan');
    await expect(page.locator(`.nav-dropdown a[href="${APP}"]`).first()).toHaveClass(/active/);
    await page.locator('.st-sidebar a[href="#sec-books"]').click();
    await expect(page).toHaveURL(`${BASE}${APP}#sec-books`);
    await expect.poll(() => page.locator('#sec-books').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(120);
    await expect(page.locator('.st-sidebar a.active')).toHaveAttribute('href', '#sec-books');
    expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
    // its stylesheet leaves with it
    await page.evaluate(() => { window.__go('/classroom'); });
    await page.waitForFunction(() => !document.querySelector('.st-layout'));
    expect(await page.evaluate(() => [...document.querySelectorAll('link[href*="/css/"]')].some((l) => /reading-listening-strategy\.css/.test(l.href)))).toBe(false);
  });

  test('phone: picking a section closes the fold-out table of contents', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await open(page, APP);
    await loaded(page);
    await page.locator('.st-mob-toc > summary').click();
    await page.locator('.st-mob-toc a[href="#sec-phase"]').click();
    await expect(page.locator('.st-mob-toc')).not.toHaveAttribute('open', '');
    await expect.poll(() => page.locator('#sec-phase').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(140);
  });

  test('a save that fails puts the tick back and says so', async ({ page }) => {
    const { s } = await open(page, APP, { fail: 'write' });
    await loaded(page);
    await page.locator('[data-tt-check="w1-class2"]').check();
    await expect(page.locator('.toast, #toast-container, .ews-toast').filter({ hasText: 'Không lưu được' }).first()).toBeVisible();
    await expect(page.locator('[data-tt-check="w1-class2"]')).not.toBeChecked();
    await expect(page.locator('#tt-progress-txt')).toHaveText('0/42 buổi (0%)');
    expect(s.checklist).toEqual({});
  });
});
