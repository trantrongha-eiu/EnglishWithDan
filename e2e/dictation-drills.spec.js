// @ts-check
/**
 * /app/dictation (React, student-src/src/pages/Dictation.jsx; old links
 * dictation.html redirect there) — the sentence player, the "Đánh vần tên /
 * Số dài & mã số" drills (per-item clips on R2) and a Listening section.
 *
 * What the page promises the student:
 *   - the answer (and whatever gives it away) shows only once a sentence is
 *     typed right; a wrong try shows marks, never the right word
 *   - a drill needs the name / number exact — capital letter of a name
 *     included — while digit grouping and hyphens don't matter
 *   - a section sentence is done from 80% of its words; only a perfect
 *     sentence moves on by itself
 *   - "Hỏi Lulu" gives the meaning / a few letters, 3 asks per sentence
 *   - leaving saves the attempt
 *
 * Self-contained like mindset-passage-page.spec.js: in-memory MongoDB seeded
 * with the real drills (scripts/data/dictationDrills.json) + one Listening
 * section, the real backend on a random port, a static server for frontend/,
 * the production API rerouted to it. Clip audio streams from R2
 * (media.ieltsthayha.com) — needs network.
 *
 * Run: npx playwright test e2e/dictation-drills.spec.js --workers=1
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
// The real backend's CORS allows http://localhost:3000 only
const STATIC_PORT = 3000;
const BASE = `http://localhost:${STATIC_PORT}`;
const SHOTS = process.env.E2E_SHOTS || '';

const breq = (m) => require(require.resolve(m, { paths: [BACKEND] }));
const drills = require(path.join(BACKEND, 'scripts', 'data', 'dictationDrills.json'));

const S1 = 'Good morning, how can I help you?';
const S2 = 'I would like to book a room.';
const VI1 = 'Chào buổi sáng, tôi có thể giúp gì cho bạn?';
const VI2 = 'Tôi muốn đặt một phòng.';

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
      // The host's rewrite: every /app path is the React app
      if (p.startsWith('/app/') && !p.startsWith('/app/assets/')) p = '/app/index.html';
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
test.use({ baseURL: BASE });

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
  const clip = drills[0].items[1]; // a real R2 file (a clip of its own: 0 → end)
  const mid = Math.round(clip.end * 50) / 100;
  section = await createListeningSection({
    title: 'E2E Part 1 — Hotel booking', extra: {
      audioUrl: clip.audioUrl, transcript: `${S1}\n${S2}`,
      dictationSentences: [
        { text: S1, start: clip.start, end: mid },
        { text: S2, start: mid, end: clip.end },
      ],
      // the meanings are stored already: no AI call
      dictationVi: [{ text: S1, vi: VI1 }, { text: S2, vi: VI2 }],
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
    if (url.startsWith(BASE) || url.startsWith('https://media.ieltsthayha.com/') || url.startsWith('https://cdnjs.cloudflare.com/') || /fonts.(googleapis|gstatic).com/.test(url)) return route.continue();
    return route.abort();
  });
  await page.addInitScript(([t, u]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', u);
    localStorage.setItem('lastLoginAt', String(Date.now()));
    localStorage.setItem('ews_seen_streak35_notice', '1');
    localStorage.setItem('ews_page_help_seen', '1');
    localStorage.setItem('ews_onboarding_tour_v1_dashboard.html', '1');
    localStorage.setItem('ews_onboarding_tour_v1_dictation.html', '1');
    document.addEventListener('DOMContentLoaded', () => {
      const st = document.createElement('style');
      st.textContent = '#nav-vocab-goal-nudge,#pcw-root,.nav-corner-dock,#ews-pet-layer,.ews-mascot-dock{display:none!important}';
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
const counter = (page) => page.locator('.dict-counter');
const answer = async (page, text) => {
  await page.locator('#dict-input').fill(text);
  await page.locator('#dict-input').press('Enter');
};

test('spelling drill: chips, wrong → marks only, missing capital, right → answer + auto-next, Lulu, transcript tab, audio, saved', async ({ page }) => {
  const errors = await wire(page);
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto('/app/dictation');

  const spellCount = drills.filter((d) => d.category === 'spelling').length;
  await expect(page.locator('.dict-chip[data-part="drill-spelling"] .n')).toHaveText(`(${spellCount})`);
  await page.locator('.dict-chip[data-part="drill-spelling"]').click();
  await expect(page.locator('#dict-grid .dict-card')).toHaveCount(spellCount);
  await shot(page, 'list-spelling.png');

  const d = drills[0];
  const n = d.items.length;
  await page.locator('#dict-grid .dict-card', { hasText: d.title }).click();
  await expect(page.locator('#screen-practice')).toBeVisible();
  await expect(page.locator('#dict-section-title')).toHaveText(d.title);
  await expect(counter(page)).toHaveText(`Câu 1/${n}`);
  await expect(page).toHaveURL(/\/app\/dictation\?drill=spelling-1/);

  // wrong letter: Incorrect + the typed word marked, the right one never shown
  const ans = d.items[0].answer;
  const wrong = ans.slice(0, 2) + (ans[2] === 'x' ? 'y' : 'x') + ans.slice(3);
  await answer(page, wrong);
  await expect(page.locator('#dict-status')).toContainText('Incorrect');
  await expect(page.locator('#dict-diff .dx-bad')).toHaveText(wrong);
  await expect(page.locator('#dict-diff .dx-fix')).toHaveCount(0);
  await expect(page.locator('#dict-reveal')).toBeEmpty();
  await expect(page.locator('#dict-pane-dictation')).not.toContainText(ans);
  await expect(page.locator('#dict-skip-btn')).toBeVisible();
  await shot(page, 'drill-incorrect.png');

  // right letters, no capital: still wrong (IELTS marks "amyes" wrong) + the Caps Lock tip
  await answer(page, ans.toLowerCase());
  await expect(page.locator('#dict-status')).toContainText('viết hoa chữ cái đầu');
  await expect(page.locator('#dict-caps-tip')).toBeVisible();
  await expect(page.locator('#dict-reveal')).toBeEmpty();
  await expect(page.locator('.dict-num-btn[data-i="0"]')).not.toHaveClass(/done/);

  // right → Correct, the answer + the clip's sentence shown, auto-next to 2
  await answer(page, ans);
  await expect(page.locator('#dict-status')).toContainText('Correct!');
  await expect(page.locator('.dict-reveal-answer')).toHaveText(ans);
  await expect(page.locator('.dict-correct-en')).toHaveText(d.items[0].text);
  await shot(page, 'drill-correct.png');
  await expect(counter(page)).toHaveText(`Câu 2/${n}`, { timeout: 5000 });
  await expect(page.locator('.dict-num-btn[data-i="0"]')).toHaveClass(/done/);
  await expect(page.locator('#dict-session-score')).toHaveText(`1/${n} ✓`);

  // 🍊 Hỏi Lulu on a drill: the first letter(s), the rest masked; 3 asks
  const ans2 = d.items[1].answer;
  await expect(page.locator('#dict-lulu-btn')).toContainText('(3)');
  await page.locator('#dict-lulu-btn').click();
  await expect(page.locator('#dict-lulu-btn')).toContainText('(2)');
  const mask = page.locator('#dict-lulu-hint .dx-lulu-mask');
  await expect(mask).toContainText(ans2[0]);
  await expect(mask).toContainText('_');
  await expect(mask).not.toHaveText(ans2);

  // full transcript tab: done sentences show, the rest stay locked; a click opens one
  await page.locator('.dx-tab[data-tab="transcript"]').click();
  const rows = page.locator('#dict-transcript-list li');
  await expect(rows).toHaveCount(n);
  await expect(rows.nth(0)).toHaveClass(/done/);
  await expect(rows.nth(0)).toContainText(ans);
  await expect(rows.nth(1)).toHaveClass(/locked/);
  await expect(rows.nth(1)).not.toContainText(ans2);
  await rows.nth(4).click();
  await expect(page.locator('#dict-pane-dictation')).toBeVisible();
  await expect(counter(page)).toHaveText(`Câu 5/${n}`);

  // the clip really plays from its start and stops by its end
  // (opening it may already have auto-played it; replay always restarts from the start)
  const it = d.items[4];
  await page.locator('.dict-restart-btn').click();
  await expect.poll(() => page.evaluate(() => document.getElementById('dict-audio').currentTime), { timeout: 20000 })
    .toBeGreaterThan(it.start + 0.3);
  await expect.poll(() => page.evaluate(() => document.getElementById('dict-audio').paused), { timeout: 20000 }).toBe(true);
  const t = await page.evaluate(() => document.getElementById('dict-audio').currentTime);
  expect(t).toBeLessThan(it.end + 0.6);

  // back → the list again, and the session is saved with the drill
  await page.locator('.dict-back-btn').click();
  await expect(page.locator('#screen-list')).toBeVisible();
  await expect(page).toHaveURL(/\/app\/dictation$/);
  await expect.poll(async () => DictationAttempt.countDocuments({ userId: student._id, drillId: { $exists: true } })).toBe(1);
  expect(errors).toEqual([]);
});

test('numbers drill via the old dictation.html link: digit grouping and hyphens do not matter', async ({ page }) => {
  const errors = await wire(page);
  await page.setViewportSize({ width: 1360, height: 900 });
  const d = drills.find((x) => x.slug.startsWith('phone'));
  const spaced = d.items.findIndex((x) => /^\d[\d ]+\d$/.test(x.answer) && x.answer.includes(' '));
  const hyphen = d.items.findIndex((x) => /^\d[\d-]+\d$/.test(x.answer) && x.answer.includes('-'));
  expect(spaced).toBeGreaterThanOrEqual(0);
  expect(hyphen).toBeGreaterThanOrEqual(0);

  await page.goto(`/dictation.html?drill=${d.slug}`);
  await expect(page).toHaveURL(new RegExp(`/app/dictation\\?drill=${d.slug}$`));
  await expect(page.locator('#dict-section-title')).toHaveText(d.title);
  await expect(page.locator('#dict-prompt')).toContainText('con số');

  for (const k of [spaced, hyphen]) {
    await page.locator(`.dict-num-btn[data-i="${k}"]`).click();
    await expect(counter(page)).toHaveText(`Câu ${k + 1}/${d.items.length}`);
    await answer(page, d.items[k].answer.replace(/[ -]/g, ''));
    await expect(page.locator('#dict-status')).toContainText('Correct!');
    await expect(page.locator('.dict-reveal-answer')).toHaveText(d.items[k].answer);
  }
  expect(errors).toEqual([]);
});

test('Listening section: 80% to pass, meaning via Lulu, no auto-next below 100%, transcript after all done, phone layout', async ({ page }) => {
  const errors = await wire(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const meanings = page.waitForResponse((r) => r.url().includes(`/dictation/section/${section._id}/translations`));
  await page.goto(`/app/dictation?sectionId=${section._id}`);
  await expect(page.locator('#dict-section-title')).toHaveText('E2E Part 1 — Hotel booking');
  await expect(counter(page)).toHaveText('Câu 1/2');
  await meanings;

  // 2 of 7 words: Incorrect, the missing words are gaps — not the words
  await answer(page, 'good morning');
  await expect(page.locator('#dict-status')).toContainText('Incorrect');
  await expect(page.locator('#dict-score')).toContainText('2/7');
  await expect(page.locator('#dict-diff .dx-ok')).toHaveCount(2);
  await expect(page.locator('#dict-diff .dx-miss')).toHaveCount(5);
  await expect(page.locator('#dict-diff .dx-miss').first()).toHaveText('＿＿');
  await expect(page.locator('#dict-pane-dictation')).not.toContainText('help you');

  // 🍊 the first ask of a sentence = its Vietnamese meaning
  await page.locator('#dict-lulu-btn').click();
  await expect(page.locator('#dict-lulu-hint')).toContainText(VI1);
  await expect(page.locator('#dict-lulu-btn')).toContainText('(2)');

  // 6 of 7 (86%) passes: the sentence is done and shown with its meaning, but
  // only a perfect one moves on by itself
  await answer(page, 'good morning how can i help');
  await expect(page.locator('#dict-status')).toContainText('Đạt 86%');
  await expect(page.locator('.dict-correct-en')).toHaveText(S1);
  await expect(page.locator('#dict-vi')).toContainText(VI1);
  await expect(page.locator('#dict-diff .dx-miss')).toHaveText('you?');
  await expect(page.locator('#dict-next-sentence-btn')).toBeVisible();
  await expect(page.locator('#dict-session-score')).toHaveText('1/2 ✓');
  await page.waitForTimeout(2000);
  await expect(counter(page)).toHaveText('Câu 1/2');

  // the plain transcript = every answer: locked until the whole section is done
  await page.locator('#dict-full summary').click();
  await expect(page.locator('#dict-full-text')).toContainText('Transcript hiện khi');
  await expect(page.locator('#dict-full-text')).not.toContainText(S2);

  await page.locator('#dict-next-sentence-btn').click();
  await expect(counter(page)).toHaveText('Câu 2/2');
  await answer(page, S2);
  await expect(page.locator('#dict-status')).toContainText('Correct!');
  await expect(page.locator('#dict-summary')).toBeVisible();
  await expect(page.locator('#dict-full-text p')).toHaveCount(2);
  await expect(page.locator('#dict-full-text')).toContainText(S2);

  // finishing saves at once
  await expect.poll(async () => DictationAttempt.countDocuments({ userId: student._id, sectionId: section._id })).toBe(1);

  // no horizontal scroll at phone width
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await shot(page, 'section-phone.png');
  expect(errors).toEqual([]);
});
