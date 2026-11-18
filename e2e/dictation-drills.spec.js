// @ts-check
/**
 * dictation.html — the dailydictation-style player and the "Đánh vần tên /
 * Số dài & mã số" drills (clips of the site's own Listening audio).
 *
 * Self-contained like mindset-passage-page.spec.js: in-memory MongoDB seeded
 * with the real drills (scripts/data/dictationDrills.json) + one Listening
 * section, the real backend on a random port, a static server for frontend/
 * on :3000, the production API rerouted to it. Clip audio streams from R2
 * (media.ieltsthayha.com) — needs network.
 *
 * Run: npm run test:e2e -- dictation-drills
 *      E2E_SHOTS=<dir> also saves screenshots.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.join(ROOT, 'frontend');
const PROD_API = 'https://englishwithdan.onrender.com';
const STATIC_PORT = 3000;
const SHOTS = process.env.E2E_SHOTS || '';

const breq = (m) => require(require.resolve(m, { paths: [BACKEND] }));
const drills = require(path.join(BACKEND, 'scripts', 'data', 'dictationDrills.json'));

let mongod, apiServer, staticServer, apiBase, student, studentToken, section, DictationAttempt;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

function startStatic() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const file = path.join(FRONTEND, p);
      if (!file.startsWith(FRONTEND) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('not found'); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(STATIC_PORT, () => resolve(srv));
  });
}

test.describe.configure({ mode: 'serial' });
test.use({ baseURL: `http://localhost:${STATIC_PORT}` });

test.beforeAll(async () => {
  test.setTimeout(240 * 1000);
  const { MongoMemoryServer } = breq('mongodb-memory-server');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri('dictation_e2e');
  process.env.MONGO_URI = uri;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'e2e-jwt-secret-not-for-production';

  const mongoose = breq('mongoose');
  await mongoose.connect(uri);
  const app = require(path.join(BACKEND, 'app'));
  await require(path.join(BACKEND, 'scripts', 'seedDictationDrills')).runSeed();
  DictationAttempt = require(path.join(BACKEND, 'models', 'DictationAttempt'));
  const { createListeningSection } = require(path.join(BACKEND, 'tests', 'factories', 'contentFactory'));
  const clip = drills[0].items[1]; // a real R2 file
  section = await createListeningSection({
    title: 'E2E Part 1 — Hotel booking', extra: {
      audioUrl: clip.audioUrl, transcript: 'Good morning, how can I help you?\nI would like to book a room.',
      dictationSentences: [
        { text: 'Good morning, how can I help you?', start: clip.start, end: clip.end },
        { text: 'I would like to book a room.', start: clip.end, end: clip.end + 2 },
      ],
    },
  });
  const users = require(path.join(BACKEND, 'tests', 'factories', 'userFactory'));
  await new Promise((resolve) => { apiServer = app.listen(0, resolve); });
  apiBase = `http://127.0.0.1:${apiServer.address().port}`;
  staticServer = await startStatic();
  student = await users.createPremiumStudent({ username: 'e2e_dictation_student' });
  studentToken = users.signTokenFor(student);
});

test.afterAll(async () => {
  await new Promise((r) => (apiServer ? apiServer.close(r) : r()));
  await new Promise((r) => (staticServer ? staticServer.close(r) : r()));
  await breq('mongoose').disconnect();
  if (mongod) await mongod.stop();
});

async function wire(page) {
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.startsWith(PROD_API)) {
      try {
        const resp = await route.fetch({ url: apiBase + url.slice(PROD_API.length) });
        return await route.fulfill({ response: resp });
      } catch (e) {
        if (/disposed|closed|Target page/i.test(String(e && e.message))) return;
        throw e;
      }
    }
    if (url.startsWith(`http://localhost:${STATIC_PORT}`) || url.startsWith('https://media.ieltsthayha.com/') || url.startsWith('https://cdnjs.cloudflare.com/') || /fonts.(googleapis|gstatic).com/.test(url)) return route.continue();
    return route.abort();
  });
  await page.addInitScript(([t, u]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', u);
    localStorage.setItem('lastLoginAt', String(Date.now()));
    localStorage.setItem('ews_seen_streak35_notice', '1');
    localStorage.setItem('ews_onboarding_tour_v1_dictation.html', '1');
    document.addEventListener('DOMContentLoaded', () => {
      const st = document.createElement('style');
      st.textContent = '#nav-vocab-goal-nudge{display:none!important}';
      document.head.appendChild(st);
    });
  }, [studentToken, JSON.stringify({ _id: String(student._id), username: student.username, role: student.role,
    email: student.email, plan: 'premium', planExpiresAt: student.planExpiresAt, createdAt: student.createdAt })]);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept());
  return errors;
}

const shot = (page, name) => SHOTS && page.screenshot({ path: path.join(SHOTS, name), fullPage: true });

test('drill: chips, wrong → masked hint, right → Correct + auto-next, transcript tab, full answer, audio', async ({ page }) => {
  const errors = await wire(page);
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto('/dictation.html');

  const spellCount = drills.filter((d) => d.category === 'spelling').length;
  await expect(page.locator('.dict-chip[data-part="drill-spelling"] .n')).toHaveText(`(${spellCount})`);
  await page.locator('.dict-chip[data-part="drill-spelling"]').click();
  await expect(page.locator('#dict-grid .dict-card')).toHaveCount(spellCount);
  await shot(page, 'list-spelling.png');

  const d = drills[0];
  await page.locator('#dict-grid .dict-card', { hasText: d.title }).click();
  await expect(page.locator('#screen-practice')).toBeVisible();
  await expect(page.locator('#dict-section-title')).toHaveText(d.title);
  await expect(page.locator('.dict-counter')).toHaveText(`1 / ${d.items.length}`);
  await expect(page).toHaveURL(/drill=spelling-1/);

  // wrong spelling: Incorrect + one masked word revealed with the wrong letter marked
  const ans = d.items[0].answer;
  const wrong = ans.slice(0, 2) + (ans[2] === 'x' ? 'y' : 'x') + ans.slice(3);
  await page.locator('#dict-input').fill(wrong);
  await page.locator('#dict-input').press('Enter');
  await expect(page.locator('#dict-status')).toContainText('Incorrect');
  await expect(page.locator('#dict-mask .m-show')).toHaveText(ans.split(' ')[0]);
  await expect(page.locator('#dict-mask .m-err')).toHaveCount(1);
  await shot(page, 'drill-incorrect.png');

  // right (case-insensitive) → Correct, answer revealed, auto-next to 2
  await page.locator('#dict-input').fill(ans.toLowerCase());
  await page.locator('#dict-input').press('Enter');
  await expect(page.locator('#dict-status')).toContainText('Correct!');
  await expect(page.locator('.dict-reveal-answer')).toHaveText(ans);
  await shot(page, 'drill-correct.png');
  await expect(page.locator('.dict-counter')).toHaveText(`2 / ${d.items.length}`, { timeout: 5000 });
  await expect(page.locator('.dict-num-btn[data-i="0"]')).toHaveClass(/done/);

  // full transcript tab lists every clip; clicking one jumps back to it
  await page.locator('.dx-tab[data-tab="transcript"]').click();
  await expect(page.locator('#dict-transcript-list li')).toHaveCount(d.items.length);
  await page.locator('#dict-transcript-list li').nth(4).click();
  await expect(page.locator('#dict-pane-dictation')).toBeVisible();
  await expect(page.locator('.dict-counter')).toHaveText(`5 / ${d.items.length}`);

  // show full answer
  await page.locator('#opt-show-full').check();
  await expect(page.locator('.dict-reveal-answer')).toHaveText(d.items[4].answer);

  // the clip really plays from its start and stops by its end
  // (jumping to it already auto-played it; replay always restarts from the clip start)
  await page.locator('.dict-restart-btn').click();
  await expect.poll(() => page.evaluate(() => document.getElementById('dict-audio').currentTime), { timeout: 20000 })
    .toBeGreaterThan(d.items[4].start + 0.3);
  await expect.poll(() => page.evaluate(() => document.getElementById('dict-audio').paused), { timeout: 20000 }).toBe(true);
  const t = await page.evaluate(() => document.getElementById('dict-audio').currentTime);
  expect(t).toBeLessThan(d.items[4].end + 0.6);

  // back → the session is saved with the drill
  await page.locator('.dict-back-btn').click();
  await expect(page.locator('#screen-list')).toBeVisible();
  await expect.poll(async () => DictationAttempt.countDocuments({ userId: student._id, drillId: { $exists: true } })).toBe(1);
  expect(errors).toEqual([]);
});

test('numbers drill: digit grouping and spacing do not matter', async ({ page }) => {
  const errors = await wire(page);
  await page.setViewportSize({ width: 1360, height: 900 });
  const d = drills.find((x) => x.slug.startsWith('phone'));
  const k = d.items.findIndex((x) => /^\d[\d ]+\d$/.test(x.answer) && x.answer.includes(' '));
  await page.goto(`/dictation.html?drill=${d.slug}`);
  await expect(page.locator('#dict-section-title')).toHaveText(d.title);
  await page.locator(`.dict-num-btn[data-i="${k}"]`).click();
  await page.locator('#dict-input').fill(d.items[k].answer.replace(/ /g, ''));
  await page.locator('#dict-input').press('Enter');
  await expect(page.locator('#dict-status')).toContainText('Correct!');
  expect(errors).toEqual([]);
});

test('Listening section: whole-sentence dictation, full audio panel, phone layout', async ({ page }) => {
  const errors = await wire(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/dictation.html?sectionId=${section._id}`);
  await expect(page.locator('#dict-section-title')).toHaveText('E2E Part 1 — Hotel booking');
  await page.locator('#dict-input').fill('good morning how can i help');
  await page.locator('#dict-input').press('Enter');
  await expect(page.locator('#dict-status')).toContainText('Incorrect');
  // "Show answer immediately" (default on) reveals the first missing word…
  await expect(page.locator('#dict-mask .m-show')).toHaveText('you?');
  // …off: it stays masked
  await page.locator('#opt-show-answer').uncheck();
  await expect(page.locator('#dict-mask')).toHaveText('Good morning, how can I help ***?');
  await page.locator('#dict-input').fill('Good morning, how can I help you?');
  await page.locator('#dict-input').press('Enter');
  await expect(page.locator('#dict-status')).toContainText('Correct!');
  await page.locator('#dict-full summary').click();
  await expect(page.locator('#dict-full-text p')).toHaveCount(2);
  // no horizontal scroll at phone width
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await shot(page, 'section-phone.png');
  expect(errors).toEqual([]);
});
