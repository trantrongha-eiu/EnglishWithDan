// @ts-check
/**
 * Speaking Part 2 · 7 câu chuyện gốc in the React app (/app/speaking-part2)
 * against its old static page (speaking-part2.html?legacy=1).
 *
 * The API is a stateful mock built from the real content
 * (backend/data/speakingPart2.js, speakingPart2Full.js); production is never
 * touched. Each screen is opened both ways with the same data, then compared:
 * the text, the box and main styles of every element, and what each action
 * sends to the server.
 *
 * Run: npx playwright test e2e/student-app-part2.spec.js --workers=1
 *      E2E_FRONTEND=<dir> serves another build, E2E_SHOTS=<dir> saves screenshots.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.resolve(process.env.E2E_FRONTEND || path.join(ROOT, 'frontend'));
const SHOTS = process.env.E2E_SHOTS || '';
const PORT = 3139;
const BASE = `http://localhost:${PORT}`;
const DATA = require(path.join(ROOT, 'backend', 'data', 'speakingPart2.js'));
const FULL = require(path.join(ROOT, 'backend', 'data', 'speakingPart2Full.js'));

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
};
let server;

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    // The host's rewrite: every /app path is the app
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
const PEOPLE = DATA.stories[0];
const fKeys = (si) => PEOPLE.fixed[si].s.map((_, j) => `f${si}.${j}`);
const allVocab = (st) => st.vocab.map((_, i) => `v${i}`);

// Mrs Hoa: read, all vocab but the last, frames 1–2 learnt (FIXED 0 and 1), one WHY sentence;
// Đà Nẵng: just read and spoken once
function progressWorked() {
  const learnt = [...fKeys(0), ...fKeys(1), ...fKeys(2)];
  return {
    people: {
      read: true, ok: [...allVocab(PEOPLE).slice(0, -1), ...learnt, 'w0.0'],
      shadow: Object.fromEntries([...learnt.map((k) => [k, 90]), ['w0.0', 75], ['w1.0', 40]]), speak: 0, best: { vocab: 60 },
    },
    places: { read: true, ok: [], shadow: {}, speak: 1, best: {} },
  };
}

function summaryOf(st) {
  return {
    id: st.id, no: st.no, group: st.group, emoji: st.emoji, color: st.color, title: st.title,
    rootQ: st.rootQ, borrow: st.borrow, skeleton: st.skeleton, remember: { topics: st.remember.topics }, why: st.why.map((w) => ({ q: w.q, vi: w.vi })),
  };
}

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
    // No microphone; speech-to-text hears the sentence on screen, read back perfectly
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('no', 'NotAllowedError'));
    function FakeSR() {
      const self = this;
      self.start = () => setTimeout(() => {
        const said = Object.assign([{ transcript: window.__said || document.getElementById('sp2-sh-sent').textContent }], { isFinal: true });
        self.onresult && self.onresult({ results: [said] });
      }, 50);
      self.stop = () => {};
    }
    window.SpeechRecognition = FakeSR;
    window.webkitSpeechRecognition = FakeSR;
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
    if (p.startsWith('/speaking-part2') && req.method() !== 'GET') log.push(`${req.method()} ${p} ${req.postData() || ''}`);
    if (p === '/speaking-part2/content') {
      if (state.failContent) return json({ success: false, message: 'Lỗi' }, 500);
      return user.plan === 'free'
        ? json({ success: true, locked: true, version: DATA.version, howTo: DATA.howTo, logic: DATA.logic, stories: DATA.stories.map(summaryOf) })
        : json({ success: true, locked: false, version: DATA.version, howTo: DATA.howTo, logic: DATA.logic, stories: DATA.stories });
    }
    if (p === '/speaking-part2/progress') return json({ success: true, progress: state.progress || {} });
    let m = p.match(/^\/speaking-part2\/progress\/(\w+)$/);
    if (m) return json({ success: true });
    m = p.match(/^\/speaking-part2\/full\/(\w+)$/);
    if (m) return json({ success: true, full: FULL[m[1]] });
    if (p === '/speaking-part2/transcribe') return json({ success: true, transcript: 'hello' });
    if (p === '/assignments/mine') return json({ success: true, assignments: [] });
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
      if (el.closest('.lh-mascot, .t2-coach-lulu, .lr-mascot') && !el.matches('.lh-mascot, .t2-coach-lulu, .lr-mascot')) continue;
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
    const looks = (e) => (/^(button|input)\./.test(e.k) ? e.css.split('|').slice(0, -2).join('|') : e.css);
    if (looks(x) !== looks(y)) out.push(`#${i} ${x.k} css ${x.css} vs ${y.css}`);
  }
  return out;
}

const text = async (page, sel) => (await page.locator(sel).innerText()).replace(/\s+/g, ' ').replace(/\b(Lulu|Lumi) \S+ /g, 'Lulu ').trim();

// ── steps used on both versions ──
const homeReady = async (p) => { await p.locator('.sp2-group').nth(6).waitFor(); };
const storyReady = async (p) => { await p.locator('#sp2-step-speak').waitFor(); await p.locator('.t2-coach-lulu svg').first().waitFor({ state: 'attached' }); };
const settle = (p) => p.evaluate(() => new Promise((done) => {
  let last = -1;
  const timer = setInterval(() => { if (window.scrollY === last) { clearInterval(timer); done(); } last = window.scrollY; }, 150);
}));
const typeAnswer = (p, answer) => p.locator('#sp2-wbw [data-role="input"]').pressSequentially(answer.replace(/[^A-Za-z0-9]/g, ''), { delay: 10 });
async function startVocab(p) {
  await p.locator('#sp2-step-vocab .t2-actions .t2-primary').click();
  await p.locator('#sp2-wbw [data-role="input"]').waitFor();
}
async function startShadow(p, frame = 0) {
  await p.locator(`#sp2-frame-${frame} .sp2-rung-btns .t2-primary`).first().click();
  await p.locator('#sp2-sh-sent').waitFor();
}
async function shadowTake(p) {
  await p.locator('#sp2-sh-rec').click();
  await p.locator('#sp2-sh-score.show').waitFor({ timeout: 8000 });
}
const lastVocab = PEOPLE.vocab[PEOPLE.vocab.length - 1];

const PAGES = {
  home: { legacy: '/speaking-part2.html?legacy=1', app: '/app/speaking-part2', root: '#app', ready: homeReady },
  homeWorked: {
    legacy: '/speaking-part2.html?legacy=1', app: '/app/speaking-part2', root: '#app', patch: (s) => { s.progress = progressWorked(); },
    ready: async (p) => { await homeReady(p); await p.locator('#sp2-finder').fill('a person who helped you'); await p.locator('.sp2-finder-row').first().waitFor(); },
  },
  homeNone: {
    legacy: '/speaking-part2.html?legacy=1', app: '/app/speaking-part2', root: '#app',
    ready: async (p) => { await homeReady(p); await p.locator('#sp2-finder').fill('football stadium'); await p.locator('.sp2-finder-none').waitFor(); },
  },
  homeLocked: {
    legacy: '/speaking-part2.html?legacy=1', app: '/app/speaking-part2', root: '#app', patch: (s) => { s.user = FREE; },
    ready: async (p) => { await homeReady(p); await p.locator('#premium-promo-banner').waitFor(); },
  },
  loadFailed: {
    legacy: '/speaking-part2.html?legacy=1', app: '/app/speaking-part2', root: '#app', patch: (s) => { s.failContent = true; },
    ready: async (p) => { await p.locator('#sp2-retry').waitFor(); },
  },
  story: { legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#app', ready: storyReady },
  storyWorked: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#app', patch: (s) => { s.progress = progressWorked(); },
    ready: storyReady,
  },
  storyVariant: {
    legacy: '/speaking-part2.html?legacy=1&story=people&variant=2', app: '/app/speaking-part2?story=people&variant=2', root: '#app', patch: (s) => { s.progress = progressWorked(); },
    ready: async (p) => { await storyReady(p); await p.waitForTimeout(300); await settle(p); },
  },
  storyLetters: {
    legacy: '/speaking-part2.html?legacy=1&story=places', app: '/app/speaking-part2?story=places', root: '#sp2-step-speak',
    ready: async (p) => {
      await storyReady(p);
      await p.locator('.sp2-seg button').nth(1).click();
      await p.locator('#sp2-variant').selectOption('1');
      await p.locator('.sp2-asm.is-letters').waitFor();
    },
  },
  storySkeleton: {
    legacy: '/speaking-part2.html?legacy=1&story=objects', app: '/app/speaking-part2?story=objects', root: '#sp2-step-speak',
    ready: async (p) => { await storyReady(p); await p.locator('.sp2-seg button').nth(2).click(); await p.locator('.sp2-skel').waitFor(); },
  },
  storyNoVi: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#sp2-step-read',
    ready: async (p) => {
      await storyReady(p);
      await p.locator('#sp2-step-read .t2-pill-toggle').click();
      await p.locator('#sp2-step-read .sp2-vchip').nth(1).click();
      await expect(p.locator('#sp2-step-read .sp2-vi')).toHaveCount(0);
    },
  },
  spokenOnce: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#sp2-step-speak',
    ready: async (p) => {
      await storyReady(p);
      await p.locator('#sp2-timer .t2-primary').click();
      await p.locator('.sp2-timer-box.is-talk').waitFor();
      await p.locator('#sp2-timer .t2-secondary').click();
      await p.locator('.sp2-timer-res').waitFor();
    },
  },
  vocabQuestion: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#app',
    ready: async (p) => { await storyReady(p); await startVocab(p); },
  },
  vocabRight: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#app',
    ready: async (p) => {
      await storyReady(p); await startVocab(p);
      await typeAnswer(p, PEOPLE.vocab[0][4]);
      await p.locator('#sp2-fb .wp-result-correct').waitFor();
    },
  },
  // (the new page counts the sentence that comes back at once, the old one from the next question)
  vocabWrong: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#app',
    drop: '.wp-exercise-meta, .t2-q-dots, .wp-progress-bar-wrap',
    ready: async (p) => {
      await storyReady(p); await startVocab(p);
      await p.locator('#sp2-wbw [data-role="input"]').pressSequentially('qqq', { delay: 350 });
      await p.locator('#sp2-fb .wp-result-wrong').waitFor();
    },
  },
  vocabRequeued: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#app',
    ready: async (p) => {
      await storyReady(p); await startVocab(p);
      await p.locator('#sp2-wbw [data-role="input"]').pressSequentially('qqq', { delay: 350 });
      await p.locator('#sp2-fb .wp-next-btn').click();
      await p.locator('.t2-q-dot.t2-dot-err').waitFor();
    },
  },
  vocabDone: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#app', patch: (s) => { s.progress = progressWorked(); },
    ready: async (p) => {
      await storyReady(p); await startVocab(p);
      await typeAnswer(p, lastVocab[4]);
      await p.locator('#sp2-fb .wp-next-btn').click();
      await p.locator('.sp2-done .t2-done-score').waitFor();
    },
  },
  quit: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '.t2-quit-box',
    ready: async (p) => { await storyReady(p); await startVocab(p); await p.locator('.t2-back-btn').click(); await p.locator('.t2-quit-box').waitFor(); },
  },
  shadow: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#app',
    ready: async (p) => { await storyReady(p); await startShadow(p); await p.locator('#sp2-sh-steps li.is-on').waitFor(); },
  },
  // (the new page shows the new best score at once, the old one when the sentence is opened again)
  shadowScored: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#app', drop: '.sp2-sh-best',
    ready: async (p) => { await storyReady(p); await startShadow(p); await shadowTake(p); },
  },
  shadowRestored: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#app', patch: (s) => { s.progress = progressWorked(); },
    ready: async (p) => {
      await storyReady(p); await startShadow(p, 3); await shadowTake(p);
      await p.locator('.sp2-sh-nav .t2-primary').click();
      await p.locator('#sp2-sh-steps li.is-on').waitFor();
      await p.locator('.sp2-sh-nav .t2-secondary').click();
      await p.locator('#sp2-sh-score.show').waitFor();
    },
  },
  shadowMasked: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#app',
    ready: async (p) => {
      await storyReady(p); await startShadow(p);
      await p.locator('.sp2-sh-pill').first().click();
      await p.locator('.sp2-sh-pill').nth(1).click();
      await p.locator('#sp2-sh-sent.is-masked').waitFor();
      await p.locator('.sp2-sh-helpbtn').click();
    },
  },
  shadowDone: {
    legacy: '/speaking-part2.html?legacy=1&story=people', app: '/app/speaking-part2?story=people', root: '#app', patch: (s) => { s.progress = progressWorked(); },
    ready: async (p) => {
      await storyReady(p); await startShadow(p, 3);
      await shadowTake(p);
      for (let i = 0; i < 30 && !(await p.locator('.sp2-shlist').count()); i++) await p.locator('.sp2-sh-nav .t2-primary').click();
      await p.locator('.sp2-shlist').waitFor();
    },
  },
  full: {
    legacy: '/speaking-part2.html?legacy=1', app: '/app/speaking-part2', root: '.sp2-full-dlg',
    ready: async (p) => { await homeReady(p); await p.locator('.sp2-full-btn').nth(1).click(); await p.locator('.sp2-full-body .sp2-full-p').first().waitFor(); },
  },
};

async function compare(browser, name, label, { viewport = { width: 1280, height: 900 }, patch = () => {} } = {}) {
  const cfg = PAGES[name];
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
    const print = await fingerprint(page, cfg.root);
    const words = await text(page, cfg.root);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `sp2-${name}-${label}-${tag}.png`.replace(/\s+/g, '-')), fullPage: true });
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

// ── what each action sends ──
async function readAndVocab(page, log) {
  await storyReady(page);
  await page.locator('#sp2-step-read .t2-actions .t2-primary').click();
  await expect.poll(() => log.length, { timeout: 5000 }).toBe(1);
  await startVocab(page);
  await typeAnswer(page, PEOPLE.vocab[0][4]);
  await page.locator('#sp2-fb .wp-result-correct').waitFor();
  await expect.poll(() => log.length, { timeout: 5000 }).toBe(2);
}
async function shadowFlow(page, log) {
  await storyReady(page);
  await startShadow(page);
  await shadowTake(page);
  await expect.poll(() => log.length, { timeout: 5000 }).toBe(1);
  await page.locator('.t2-back-btn').click();
  await page.locator('#sp2-step-learn').waitFor();
}
async function spokenFlow(page, log) {
  await storyReady(page);
  await page.locator('#sp2-timer .t2-primary').click();
  await page.locator('.sp2-timer-box.is-talk').waitFor();
  // a minute and more of talk counts
  await page.evaluate(() => { const n = Date.now; Date.now = () => n() + 70000; });
  await page.locator('#sp2-timer .t2-secondary').click();
  await page.locator('.sp2-timer-res').waitFor();
  await expect.poll(() => log.length, { timeout: 5000 }).toBe(1);
}
// Progress made offline in this browser goes up on the next visit
async function offlineFlow(page, log) {
  await homeReady(page);
  await expect.poll(() => log.length, { timeout: 5000 }).toBe(1);
}
const FLOWS = {
  readAndVocab: { url: 'story=people', flow: readAndVocab },
  shadow: { url: 'story=people', flow: shadowFlow, patch: (s) => { s.progress = progressWorked(); } },
  spoken: { url: 'story=places', flow: spokenFlow },
  offline: {
    url: '', flow: offlineFlow,
    init: () => localStorage.setItem('sp2_progress:me1', JSON.stringify({ _v: 3, people: { read: 1, ok: { v0: 1 }, shadow: { 'f0.0': 80 }, speak: 0, best: {} } })),
  },
};
for (const [name, f] of Object.entries(FLOWS)) {
  test(`${name}: every action sends the same requests as the old page`, async ({ browser }) => {
    const go = async (url) => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await ctx.newPage();
      if (f.init) await page.addInitScript(f.init);
      const state = {};
      f.patch?.(state);
      const { log, errors } = await open(page, url, state);
      await f.flow(page, log);
      await ctx.close();
      return { log, errors };
    };
    const old = await go('/speaking-part2.html?legacy=1' + (f.url ? '&' + f.url : ''));
    const now = await go('/app/speaking-part2' + (f.url ? '?' + f.url : ''));
    expect(now.errors).toEqual([]);
    expect(now.log).toEqual(old.log);
  });
}

test.describe('inside the React app', () => {
  test('the old address forwards with its story and cue card', async ({ page }) => {
    await open(page, '/speaking-part2.html?story=places&variant=1');
    await page.waitForURL('**/app/speaking-part2?story=places&variant=1');
    await page.locator('#sp2-step-learn').waitFor();
    await expect(page.locator('#sp2-step-read .sp2-vchip.is-on')).toHaveText(new RegExp(DATA.stories[1].why[1].q.slice(0, 12)));
  });

  test('a finder result opens its story on the cue card, Back returns home with the text', async ({ page }) => {
    await open(page, '/app/speaking-part2');
    await homeReady(page);
    await page.locator('#sp2-finder').fill('a person who helped you');
    const row = page.locator('.sp2-finder-row').first();
    await row.click();
    await page.locator('#sp2-step-learn').waitFor();
    expect(page.url()).toContain('?story=people');
    await page.goBack();
    await homeReady(page);
    await expect(page.locator('#sp2-finder')).toHaveValue('a person who helped you');
  });

  test('Back in the middle of Dịch asks first; Tiếp tục stays, Dừng lại leaves', async ({ page }) => {
    await open(page, '/app/speaking-part2');
    await homeReady(page);
    await page.locator('.t2w-sess').first().click();
    await storyReady(page);
    await startVocab(page);
    await page.goBack();
    await page.locator('.t2-quit-box').waitFor();
    await page.locator('#t2-quit-continue-btn').click();
    await expect(page.locator('.t2-quit-box')).toHaveCount(0);
    await expect(page.locator('#sp2-wbw')).toBeVisible();
    await page.goBack();
    await page.locator('#t2-quit-leave-btn').click();
    await homeReady(page);
  });

  test('pager, crumb and copy link move between stories in place', async ({ page }) => {
    await open(page, '/app/speaking-part2?story=people');
    await storyReady(page);
    await page.locator('.sp2-pager .t2-secondary').last().click();
    await expect(page.locator('.t2-hub-title')).toHaveText(DATA.stories[1].title);
    await page.locator('.t2-nav-crumb span').click();
    await homeReady(page);
    expect(new URL(page.url()).search).toBe('');
  });

  test('without Premium a story link shows the list and asks to upgrade', async ({ page }) => {
    await open(page, '/app/speaking-part2?story=people', { user: FREE });
    await page.locator('#premium-promo-banner').waitFor();
    await expect(page.locator('#um-overlay')).toBeVisible();
    expect(new URL(page.url()).searchParams.get('story')).toBe('people');
    await page.locator('#um-close').click();
    await expect(page.locator('#um-overlay')).toBeHidden();
    // a story card and "Xem full bài mẫu" ask again; nothing opens
    await page.locator('.sp2-full-btn').first().click();
    await expect(page.locator('#um-overlay')).toBeVisible();
    await expect(page.locator('.sp2-full-dlg')).toHaveCount(0);
  });

  test('the guide, menu and activity tracker know the page', async ({ page }) => {
    await open(page, '/app/speaking-part2');
    await homeReady(page);
    expect(await page.evaluate(() => document.title)).toBe('Speaking Part 2 · 7 câu chuyện gốc – EnglishWithDan');
    await expect(page.locator('a[href="/app/speaking-part2"]').first()).toBeAttached();
  });
});
