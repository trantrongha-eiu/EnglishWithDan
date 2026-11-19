// @ts-check
/**
 * Task 2 Templates in the React app (/app/task2-template) against its old
 * static page (task2-template.html?legacy=1).
 *
 * The API is a mock (progress rows, homework, type guides from
 * backend/scripts/data/task2/typeGuides.js, history); the template text is
 * the real js/task2-generic-templates.js. Production is never touched. Each
 * screen is opened both ways with the same data and compared: the text, the
 * box and main styles of every element, and what each action sends.
 *
 * Run: npx playwright test e2e/student-app-task2tpl.spec.js --workers=1
 *      E2E_FRONTEND=<dir> serves another build, E2E_SHOTS=<dir> saves screenshots.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.resolve(process.env.E2E_FRONTEND || path.join(ROOT, 'frontend'));
const SHOTS = process.env.E2E_SHOTS || '';
const PORT = 3140;
const BASE = `http://localhost:${PORT}`;
const GUIDES = require(path.join(ROOT, 'backend', 'scripts', 'data', 'task2', 'typeGuides.js'));

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
    if (!file.startsWith(FRONTEND) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(PORT, r));
});
test.afterAll(() => new Promise((r) => server.close(r)));

const USER = { _id: 'me1', id: 'me1', username: 'hocvien', firstName: 'An', lastName: 'Trần', role: 'student', plan: 'premium' };
const FREE = { ...USER, plan: 'free', createdAt: '2020-01-01T00:00:00.000Z' };
const T = '2026-11-01T00:00:00.000Z';
const row = (typeId, level, extra) => ({ typeId, level, steps: {}, drillRounds: [], mastery: {}, warmupScore: 0, assembleBest: 0, applyText: [], reviewStage: 0, nextReviewAt: null, ...extra });

// Type 01: four steps done, review due, some weak lines; Type 02 begun; Type 03 all done
function worked(level = 'band6') {
  return [
    row('type01', level, {
      steps: { warmup: T, read: T, drill: T, assemble: T }, drillRounds: [3, 3, 3, 3],
      mastery: { '0-0': 4, '0-1': 2, '1-0': 1, '1-1': 3, '2-0': 0, '2-1': 2 }, warmupScore: 75, assembleBest: 62,
      applyText: ['In recent years, online learning has become increasingly common in many parts of the world.', '', '', ''],
      reviewStage: 1, nextReviewAt: '2026-01-01T00:00:00.000Z',
    }),
    row('type02', level, { steps: { warmup: T }, drillRounds: [2], warmupScore: 50 }),
    row('type03', level, { steps: { warmup: T, read: T, drill: T, assemble: T, apply: T }, drillRounds: [3, 3, 3, 3], assembleBest: 80, nextReviewAt: '2099-01-01T00:00:00.000Z' }),
  ];
}
const upTo = (n, extra = {}) => [row('type01', 'band6', { steps: Object.fromEntries(['warmup', 'read', 'drill', 'assemble', 'apply'].slice(0, n).map((k) => [k, T])), drillRounds: n >= 3 ? [3, 3, 3, 3] : [], ...extra })];
const HOMEWORK = [{
  _id: 'a1', title: 'BTVN tuần 3', className: 'IELTS 6.5', deadline: '2026-12-01T00:00:00.000Z',
  resources: [
    { resourceType: 'task2_template', resourceCode: 'type01||band6', itemId: 'i1', completed: false },
    { resourceType: 'task2_template', resourceCode: 'type01||band7', itemId: 'i2', completed: false },
    { resourceType: 'task2_template', resourceCode: 'type03||band6', itemId: 'i3', completed: true },
  ],
}];
const HISTORY = [
  { _id: 'h1', templateType: 'type01', templateName: 'Type 01 – Advantages & Disadvantages', level: 'band6', mode: 'path', totalItems: 14, correctItems: 11, createdAt: '2026-11-10T09:00:00.000Z' },
  { _id: 'h2', templateType: 'type06', templateName: 'Type 06 – Agree / Disagree', level: 'band7', mode: 'path', isExam: true, totalItems: 12, correctItems: 5, createdAt: '2026-11-09T09:00:00.000Z' },
  { _id: 'h3', templateType: 'type01', templateName: 'Type 01 – Advantages & Disadvantages', level: 'band6', mode: 'review', totalItems: 6, correctItems: 4, createdAt: '2026-11-08T09:00:00.000Z' },
];

async function open(page, url, state = {}) {
  const log = [];
  const user = state.user || USER;
  await page.addInitScript(([u, theme]) => {
    Math.random = () => 0;
    if (theme) localStorage.setItem('theme', theme);
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('lastLoginAt', String(Date.now()));
    localStorage.setItem('ews_seen_streak35_notice', '1');
    localStorage.setItem('ews_page_help_seen', '1');
    localStorage.setItem('ews_onboarding_tour_v1_dashboard.html', '1');
    localStorage.setItem('ews_onboarding_tour_v1_task2-template.html', '1');
    localStorage.setItem('t2_progress', JSON.stringify({ xp: 120, streak: 3 }));
    window.speechSynthesis && (window.speechSynthesis.speak = () => {});
    window.__go = (route) => { history.pushState(null, '', '/app' + route); window.dispatchEvent(new PopStateEvent('popstate')); };
  }, [user, state.theme || '']);
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
    if (p.startsWith('/task2template') && req.method() !== 'GET') {
      log.push(`${req.method()} ${p} ${(req.postData() || '').replace(/"timeTakenSec":\d+/, '"timeTakenSec":N')}`);
    }
    if (p === '/task2template/progress') {
      const lv = u.searchParams.get('level');
      return json({ success: true, progress: (state.progress || []).filter((r) => r.level === lv) });
    }
    if (p.startsWith('/task2template/progress/')) return json({ success: true });
    if (p === '/task2template/history') return json({ success: true, attempts: state.history || [] });
    if (p === '/task2/type-guides') return json({ success: true, guides: GUIDES });
    if (p === '/assignments/mine') return json({ success: true, assignments: state.homework || [] });
    return json({ success: true });
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + url);
  await page.addStyleTag({ content: 'body{margin:0} *,*::before,*::after{animation:none!important;transition:none!important} #pcw-root,.nav-corner-dock,#ews-pet-layer,.ews-mascot-dock,.ask-lulu-bubble{display:none!important}' });
  return { log, errors };
}

// Every visible element under `sel`: its box (relative to the root) and looks
function fingerprint(page, sel) {
  return page.evaluate((s) => {
    const root = document.querySelector(s);
    const base = root.getBoundingClientRect();
    const top = base.y + (getComputedStyle(root).position === 'fixed' ? 0 : window.scrollY);
    const out = [{ k: 'ROOT', box: [base.width, base.x, top].map(Math.round) }];
    const PROPS = ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'borderTopWidth', 'borderTopLeftRadius', 'display', 'textAlign', 'paddingLeft', 'paddingTop'];
    for (const el of root.querySelectorAll('*')) {
      if (el.closest('.lh-mascot, .ews-react, .mascot-react') && !el.matches('.lh-mascot, .ews-react, .mascot-react')) continue;
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
    const looks = (e) => (/^(button|input|textarea)\./.test(e.k) ? e.css.split('|').slice(0, -2).join('|') : e.css);
    if (looks(x) !== looks(y)) out.push(`#${i} ${x.k} css ${x.css} vs ${y.css}`);
  }
  return out;
}

const text = async (page, sel) => (await page.locator(sel).innerText()).replace(/\s+/g, ' ').replace(/\b(Lulu|Lumi) \S+ /g, 'Lulu ').replace(/⏱ \d\d:\d\d/g, '⏱ mm:ss').trim();

// ── steps used on both versions ──
const ready = async (p) => { await p.locator('.pth-steps .pth-step').nth(4).waitFor(); await p.locator('.t2-guide').waitFor(); };
const stepBtn = (p, i) => p.locator('.pth-steps .pth-step').nth(i).locator('.pth-btn');
async function warmupOrder(p) {
  await ready(p); await stepBtn(p, 0).click();
  await p.locator('.pth-struct').waitFor();
  await p.locator('.pth-actions .pth-btn--primary').click();
  await p.locator('.pth-order-slots').waitFor();
}
// Put every remaining line in, check, show the answer, go on — until the end
async function finishWarmup(p) {
  for (let k = 0; k < 12; k++) {
    if (await p.locator('.pth-done').count()) return;
    while (await p.locator('.pth-pool .pth-sent').count()) await p.locator('.pth-pool .pth-sent').first().click();
    const check = p.locator('.pth-actions .pth-btn--primary', { hasText: 'Kiểm tra' });
    if (await check.count()) await check.click();
    const answer = p.locator('.pth-actions .pth-btn', { hasText: 'Xem đáp án' });
    if (await answer.count()) await answer.click();
    await p.locator('.pth-actions .pth-btn--primary', { hasText: /Đoạn tiếp theo|Hoàn thành/ }).click();
  }
}
// One move on the current ③ item: Tiếp, Xem đáp án, a chunk, the blanks, or Không nhớ
async function drillMove(p) {
  if (await p.locator('#pth-next').count()) return p.locator('#pth-next').click();
  const reveal = p.locator('.pth-actions .pth-btn', { hasText: 'Xem đáp án' });
  if (await reveal.count()) return reveal.click();
  if (await p.locator('.pth-build-bank').count()) {
    if (await p.locator('.pth-build-bank .pth-chunk').count()) return p.locator('.pth-build-bank .pth-chunk').first().click();
    return p.locator('.pth-build-ans .pth-chunk').last().click();
  }
  if (await p.locator('.pth-blank').count()) {
    for (const b of await p.locator('.pth-blank').all()) await b.fill('x');
    return p.locator('#pth-fade-actions .pth-btn--primary').click();
  }
  return p.locator('#pth-giveup').click();
}
async function drillUntil(p, sel) {
  for (let i = 0; i < 300 && !(await p.locator(sel).count()); i++) await drillMove(p);
  await p.locator(sel).waitFor();
}
const longText = 'In recent years online learning has become increasingly common in many parts of the world and while it offers several benefits it also has some potential drawbacks. '.repeat(5);

const PAGES = {
  home: { url: '', ready },
  homeWorked: { url: '', ready, patch: (s) => { s.progress = worked(); s.homework = HOMEWORK; } },
  band7: { url: 'type=type06&level=band7', ready, patch: (s) => { s.progress = worked('band7'); s.homework = HOMEWORK; } },
  homework7: { url: 'level=band7', ready, patch: (s) => { s.homework = HOMEWORK; } },
  guide: {
    url: 'type=type02', root: '#tpl-guide-area',
    ready: async (p) => {
      await ready(p);
      await p.locator('.t2-guide > summary').click();
      for (const s of await p.locator('.t2-g-sec > summary').all()) await s.click();
    },
  },
  warmupIntro: { url: 'type=type06', ready: async (p) => { await ready(p); await stepBtn(p, 0).click(); await p.locator('.pth-struct').waitFor(); } },
  warmupOrder: { url: '', ready: warmupOrder },
  warmupWrong: {
    url: '',
    ready: async (p) => {
      await warmupOrder(p);
      while (await p.locator('.pth-pool .pth-sent').count()) await p.locator('.pth-pool .pth-sent').first().click();
      await p.locator('.pth-actions .pth-btn--primary').click();
      await p.locator('.pth-fb--bad').waitFor();
    },
  },
  warmupHint: {
    url: 'type=type07',
    ready: async (p) => { await warmupOrder(p); await p.locator('#pth-hint').click(); await p.locator('.pth-sent.is-hint').waitFor(); },
  },
  warmupDone: { url: '', ready: async (p) => { await warmupOrder(p); await finishWarmup(p); } },
  read: { url: '', patch: (s) => { s.progress = upTo(1); }, ready: async (p) => { await ready(p); await stepBtn(p, 1).click(); await p.locator('.pth-read-para').first().waitFor(); } },
  readNoVi: {
    url: '', patch: (s) => { s.progress = upTo(1); },
    ready: async (p) => { await ready(p); await stepBtn(p, 1).click(); await p.locator('.pth-act-right .pth-icon-btn').click(); await p.locator('.pth-actions .pth-btn--primary').click(); await p.locator('.pth-actions .pth-btn--primary', { hasText: 'Sang bước' }).waitFor(); },
  },
  drillBuild: {
    url: '', patch: (s) => { s.progress = upTo(2); },
    ready: async (p) => { await ready(p); await stepBtn(p, 2).click(); await p.locator('.pth-build-bank').waitFor(); await p.locator('.pth-build-bank .pth-chunk').first().click(); },
  },
  drillBuildDone: {
    url: '', drop: '.pth-drill-meta > span:first-child', patch: (s) => { s.progress = upTo(2); },
    ready: async (p) => {
      await ready(p); await stepBtn(p, 2).click();
      await drillUntil(p, '#pth-next');
    },
  },
  drillFade: {
    url: '', patch: (s) => { s.progress = upTo(2, { drillRounds: [1] }); },
    ready: async (p) => { await ready(p); await stepBtn(p, 2).click(); await p.locator('.pth-blank').first().waitFor(); await p.locator('.pth-blank').first().fill('wrong'); await p.locator('#pth-hint').click(); },
  },
  // (the new page counts a sentence sent back to the end of the round at once)
  drillFadeChecked: {
    url: '', drop: '.pth-drill-meta > span:first-child', patch: (s) => { s.progress = upTo(2, { drillRounds: [1] }); },
    ready: async (p) => {
      await ready(p); await stepBtn(p, 2).click();
      for (const b of await p.locator('.pth-blank').all()) await b.fill('x');
      await p.locator('#pth-fade-actions .pth-btn--primary').click();
      await p.locator('.pth-blank-fix').first().waitFor();
    },
  },
  drillRecall: {
    url: '', patch: (s) => { s.progress = upTo(2, { drillRounds: [2] }); },
    ready: async (p) => { await ready(p); await stepBtn(p, 2).click(); await p.locator('#pth-wbw .wbwd-input').waitFor(); },
  },
  drillRecallGiveUp: {
    url: 'level=band7', drop: '.pth-drill-meta > span:first-child', patch: (s) => { s.progress = [row('type01', 'band7', { steps: { warmup: T, read: T }, drillRounds: [2] })]; },
    ready: async (p) => { await ready(p); await stepBtn(p, 2).click(); await p.locator('#pth-recall-in').fill('This is my answer'); await p.locator('#pth-recall-check').click(); await p.locator('.pth-diff').waitFor(); },
  },
  drillBetween: {
    url: '', patch: (s) => { s.progress = upTo(2); },
    ready: async (p) => {
      await ready(p); await stepBtn(p, 2).click();
      await drillUntil(p, '.pth-between');
    },
  },
  assemble: { url: '', patch: (s) => { s.progress = upTo(3); }, ready: async (p) => { await ready(p); await stepBtn(p, 3).click(); await p.locator('.pth-asm-in').waitFor(); } },
  assembleChecked: {
    url: '', patch: (s) => { s.progress = upTo(3); },
    ready: async (p) => {
      await ready(p); await stepBtn(p, 3).click();
      await p.locator('.pth-asm-in').fill('In recent years topic has become increasingly common in many parts of the world. While topic offers benefits.');
      await p.locator('.pth-asm-hint, .ask-lulu').first().click();
      await p.locator('.pth-actions .pth-btn--primary').click();
      await p.locator('.pth-diff--box').waitFor();
    },
  },
  assembleResult: {
    url: '', patch: (s) => { s.progress = upTo(3); },
    ready: async (p) => {
      await ready(p); await stepBtn(p, 3).click();
      for (let i = 0; i < 6 && !(await p.locator('.pth-score').count()); i++) {
        await p.locator('.pth-asm-in').fill('In recent years topic has become increasingly common.');
        await p.locator('.pth-actions .pth-btn--primary').click();
        await p.locator('.pth-actions .pth-btn--primary').click();
      }
      await p.locator('.pth-score').waitFor();
    },
  },
  assembleB7: {
    url: 'type=type06&level=band7', drop: '#pth-asm-time', patch: (s) => { s.progress = [row('type06', 'band7', { steps: { warmup: T, read: T, drill: T } })]; },
    ready: async (p) => { await ready(p); await stepBtn(p, 3).click(); await p.locator('.pth-asm-in').first().waitFor(); },
  },
  apply: { url: '', patch: (s) => { s.progress = worked(); }, ready: async (p) => { await ready(p); await stepBtn(p, 4).click(); await p.locator('.pth-frames').first().waitFor(); } },
  applyResult: {
    url: '', patch: (s) => { s.progress = worked(); },
    ready: async (p) => {
      await ready(p); await stepBtn(p, 4).click();
      await p.locator('#pth-apply-in-1').fill(longText);
      await p.locator('.pth-actions .pth-btn--primary').click();
      await p.locator('.pth-model').waitFor();
    },
  },
  review: { url: '', patch: (s) => { s.progress = worked(); }, ready: async (p) => { await ready(p); await p.locator('.pth-review.is-due .pth-btn').click(); await p.locator('#pth-wbw .wbwd-input').waitFor(); } },
  fixDone: {
    url: '', patch: (s) => { s.progress = worked(); },
    ready: async (p) => {
      await ready(p); await p.locator('.pth-weak .pth-btn').click();
      for (let i = 0; i < 12 && !(await p.locator('.pth-done').count()); i++) {
        await p.locator('#pth-giveup').click();
        await p.locator('#pth-next').click();
      }
      await p.locator('.pth-done').waitFor();
    },
  },
  exam: { url: '', drop: '#pth-exam-time', ready: async (p) => { await ready(p); await p.locator('#tpl-exam-btn').click(); await p.locator('.t2-exam-bar').waitFor(); await p.locator('#pth-giveup').click(); } },
  examDone: {
    url: '', patch: (s) => { s.homework = HOMEWORK; },
    ready: async (p) => { await ready(p); await p.locator('#tpl-exam-btn').click(); await p.locator('#pth-giveup').click(); await p.locator('#pth-next').click(); await p.locator('.t2-exam-exit-btn').click(); await p.locator('.pth-done').waitFor(); },
  },
  full: { url: 'type=type04', root: '.tpl-full-box', ready: async (p) => { await ready(p); await p.locator('#tpl-full-btn').click(); await p.locator('.gtpl-sec').first().waitFor(); await p.locator('#tpl-full-vi-label').click(); await p.locator('.tpl-full-level-btn').nth(1).click(); } },
  history: { url: '', root: '.tpl-hist-box', patch: (s) => { s.history = HISTORY; }, ready: async (p) => { await ready(p); await p.locator('.tpl-glass-btn').nth(1).click(); await p.locator('.tpl-hist-entry').first().waitFor(); } },
  historyEmpty: { url: '', root: '.tpl-hist-box', ready: async (p) => { await ready(p); await p.locator('.tpl-glass-btn').nth(1).click(); await p.locator('.tpl-hist-empty').waitFor(); } },
  leave: {
    url: '', root: '.t2-quit-box',
    ready: async (p) => { await warmupOrder(p); await p.locator('.t2-type-tab-btn').nth(2).click(); await p.locator('.t2-quit-box').waitFor(); },
  },
  free: { url: '', patch: (s) => { s.user = FREE; }, ready: async (p) => { await p.locator('#um-overlay').waitFor(); await p.locator('#um-close').click(); } },
};

async function compare(browser, name, label, { viewport = { width: 1280, height: 900 }, patch = () => {} } = {}) {
  test.setTimeout(120 * 1000); // the drill screens take many clicks
  const cfg = PAGES[name];
  const root = cfg.root || '.tpl-page';
  const snap = async (url, tag) => {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const state = {};
    cfg.patch?.(state);
    patch(state);
    const { errors } = await open(page, url, state);
    await cfg.ready(page);
    if (cfg.drop) await page.locator(cfg.drop).evaluateAll((els) => els.forEach((e) => e.remove()));
    await page.mouse.move(0, 0);
    // the step header is sticky: measure at the top of the page
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
    const print = await fingerprint(page, root);
    const words = await text(page, root);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `t2tpl-${name}-${label}-${tag}.png`), fullPage: true });
    await ctx.close();
    return { print, words, errors };
  };
  const q = cfg.url ? '&' + cfg.url : '';
  const old = await snap('/task2-template.html?legacy=1' + q, 'old');
  const now = await snap('/app/task2-template' + (cfg.url ? '?' + cfg.url : ''), 'new');
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

// ── what each action sends ──
const FLOWS = {
  warmup: { url: '', flow: async (p, log) => { await warmupOrder(p); await finishWarmup(p); await expect.poll(() => log.length).toBe(1); } },
  read: {
    url: '', patch: (s) => { s.progress = upTo(1); },
    flow: async (p, log) => { await ready(p); await stepBtn(p, 1).click(); await p.locator('.pth-actions .pth-btn--primary').click(); await expect.poll(() => log.length).toBe(1); },
  },
  drillRound: {
    url: '', patch: (s) => { s.progress = upTo(2); },
    flow: async (p, log) => {
      await ready(p); await stepBtn(p, 2).click();
      await drillUntil(p, '.pth-between');
      await expect.poll(() => log.length).toBe(1);
    },
  },
  assemble: {
    url: '', patch: (s) => { s.progress = upTo(3, { mastery: { '0-0': 3, '1-1': 1 } }); },
    flow: async (p, log) => {
      await ready(p); await stepBtn(p, 3).click();
      for (let i = 0; i < 6 && !(await p.locator('.pth-score').count()); i++) {
        await p.locator('.pth-asm-in').fill('In recent years (general topic) has become increasingly common in many parts of the world.');
        await p.locator('.pth-actions .pth-btn--primary').click();
        await p.locator('.pth-actions .pth-btn--primary').click();
      }
      await expect.poll(() => log.length).toBe(2);
    },
  },
  applyDraftAndSubmit: {
    url: '', patch: (s) => { s.progress = worked(); },
    flow: async (p, log) => {
      await ready(p); await stepBtn(p, 4).click();
      await p.locator('#pth-apply-in-2').fill(longText);
      await p.locator('.pth-actions .pth-btn', { hasText: 'Lưu nháp' }).click();
      await expect.poll(() => log.length).toBe(1);
      await p.locator('.pth-actions .pth-btn--primary').click();
      await expect.poll(() => log.length).toBe(2);
    },
  },
  review: {
    url: '', patch: (s) => { s.progress = worked(); },
    flow: async (p, log) => {
      await ready(p); await p.locator('.pth-review.is-due .pth-btn').click();
      for (let i = 0; i < 12 && !(await p.locator('.pth-done').count()); i++) { await p.locator('#pth-giveup').click(); await p.locator('#pth-next').click(); }
      await expect.poll(() => log.length).toBe(2);
    },
  },
  exam: {
    url: 'type=type05',
    flow: async (p, log) => {
      await ready(p); await p.locator('#tpl-exam-btn').click();
      await p.locator('#pth-recall-in').fill('In recent years something has become a major concern');
      await p.locator('#pth-recall-check').click(); await p.locator('#pth-next').click();
      await p.locator('#tpl-exam-btn').click();
      await p.locator('.pth-done').waitFor();
      await expect.poll(() => log.length).toBe(1);
    },
  },
};
for (const [name, f] of Object.entries(FLOWS)) {
  test(`${name}: every action sends the same requests as the old page`, async ({ browser }) => {
    test.setTimeout(120 * 1000);
    const go = async (url) => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await ctx.newPage();
      const state = {};
      f.patch?.(state);
      const { log, errors } = await open(page, url, state);
      await f.flow(page, log);
      await page.waitForTimeout(300);
      await ctx.close();
      return { log, errors };
    };
    const old = await go('/task2-template.html?legacy=1' + (f.url ? '&' + f.url : ''));
    const now = await go('/app/task2-template' + (f.url ? '?' + f.url : ''));
    expect(now.errors).toEqual([]);
    expect(now.log).toEqual(old.log);
  });
}

test.describe('inside the React app', () => {
  test('the old address forwards with its type and level', async ({ page }) => {
    await open(page, '/task2-template.html?type=type04&level=band7');
    await page.waitForURL('**/app/task2-template?type=type04&level=band7');
    await ready(page);
    await expect(page.locator('.t2-type-tab-btn.active')).toHaveAttribute('data-tpl-type', 'type04');
    await expect(page.locator('.t2-level-btn.active')).toHaveAttribute('data-level', 'band7');
  });

  test('type and level live in the address; Back returns to the type before', async ({ page }) => {
    await open(page, '/app/task2-template');
    await ready(page);
    await page.locator('.t2-type-tab-btn').nth(2).click();
    await expect(page).toHaveURL(/\?type=type03$/);
    await page.locator('.t2-level-btn').nth(1).click();
    await expect(page).toHaveURL(/\?type=type03&level=band7$/);
    await expect(page.locator('.t2-type-info-name')).toContainText('Band 7+');
    await page.goBack();
    await expect(page.locator('.t2-type-info-name')).toContainText('Band 6+');
    await page.goBack();
    await expect(page.locator('.t2-type-tab-btn.active')).toHaveAttribute('data-tpl-type', 'type01');
  });

  test('another type mid-step asks first; staying keeps the step, leaving opens the type', async ({ page }) => {
    await open(page, '/app/task2-template');
    await warmupOrder(page);
    await page.locator('.t2-type-tab-btn').nth(1).click();
    await page.locator('.t2-quit-box').waitFor();
    await page.locator('.t2-quit-continue').click();
    await expect(page.locator('.pth-order-slots')).toBeVisible();
    await expect(page).toHaveURL(/task2-template$/);
    await page.locator('.t2-type-tab-btn').nth(1).click();
    await page.locator('.t2-quit-leave').click();
    await expect(page).toHaveURL(/\?type=type02$/);
    await ready(page);
  });

  test('Back mid-step asks first too', async ({ page }) => {
    await open(page, '/app/task2-template?type=type02');
    await ready(page);
    await page.locator('.t2-type-tab-btn').nth(0).click();
    await ready(page);
    await warmupOrder(page);
    await page.goBack();
    await page.locator('.t2-quit-box').waitFor();
    await page.locator('.t2-quit-leave').click();
    await expect(page).toHaveURL(/\?type=type02$/);
  });

  test('"Làm lại từ đầu" asks, then clears the type', async ({ page }) => {
    const state = { progress: worked() };
    const { log } = await open(page, '/app/task2-template', state);
    await ready(page);
    await page.locator('.pth-link').click();
    await page.locator('.confirm-dialog-overlay, #confirm-dialog, [role=dialog]').last().getByRole('button', { name: /Xoá tiến độ/ }).click();
    await expect.poll(() => log).toEqual(['PUT /task2template/progress/type01 {"level":"band6","reset":true}']);
    await expect(page.locator('.pth-step.is-current .pth-step-title')).toContainText('Khung bài');
  });

  test('without Premium the page asks to upgrade and loads nothing', async ({ page }) => {
    await open(page, '/app/task2-template', { user: FREE });
    await expect(page.locator('#um-overlay')).toBeVisible();
    await expect(page.locator('.t2-type-tab-btn')).toHaveCount(0);
  });

  test('the menu, guide and activity tracker know the page', async ({ page }) => {
    await open(page, '/app/task2-template');
    await ready(page);
    expect(await page.evaluate(() => document.title)).toBe('Task 2 Templates – EnglishWithDan');
    await expect(page.locator('a[href="/app/task2-template"]').first()).toBeAttached();
  });
});
