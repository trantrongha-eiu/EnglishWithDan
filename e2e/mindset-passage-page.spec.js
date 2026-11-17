// @ts-check
/**
 * Mindset passage pages (course-engine renderPassagePage): exercises that
 * read the same text are done on ONE page — the text on the left (tabs when
 * there are two), every exercise stacked on the right, one "Kiểm tra tất cả"
 * that grades each exercise under its own code.
 *
 * Self-contained like task2-template-path.spec.js: in-memory MongoDB seeded
 * with MINDSET-2 by the real seed scripts (seedMindsetMedia.js only reuses
 * the R2 URLs cached in media.json — nothing is uploaded), the real backend
 * on a random port, a static server for frontend/ on :3000, and every
 * request to the production API rerouted to the local backend.
 *
 * Run: npm run test:e2e -- mindset-passage-page
 *      E2E_SHOTS=<dir> also saves screenshots for a visual check.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.join(ROOT, 'frontend');
const PROD_API = 'https://englishwithdan.onrender.com';
const STATIC_PORT = 3000;
const SHOTS = process.env.E2E_SHOTS || '';

const breq = (m) => require(require.resolve(m, { paths: [BACKEND] }));

let mongod, apiServer, staticServer, apiBase, student, studentToken, Submission;

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

// The authored key of one built exercise (scripts/data/mindset2).
function builtExercise(code) {
  const dir = path.join(BACKEND, 'scripts', 'data', 'mindset2');
  for (const f of fs.readdirSync(dir).filter((x) => /^exercises-/.test(x))) {
    const e = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).exercises.find((x) => x.code === code);
    if (e) return e;
  }
  throw new Error('no exercise ' + code);
}

test.describe.configure({ mode: 'serial' });
test.use({ baseURL: `http://localhost:${STATIC_PORT}` });

test.beforeAll(async () => {
  test.setTimeout(240 * 1000);
  const { MongoMemoryServer } = breq('mongodb-memory-server');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri('mindset_e2e');
  process.env.MONGO_URI = uri;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'e2e-jwt-secret-not-for-production';

  const env = { ...process.env, MONGO_URI: uri };
  execFileSync(process.execPath, ['scripts/seedMindsetMedia.js', 'mindset2'], { cwd: BACKEND, env, stdio: 'pipe' });
  execFileSync(process.execPath, ['scripts/seedCourse.js', 'mindset2'], { cwd: BACKEND, env, stdio: 'pipe' });

  const mongoose = breq('mongoose');
  await mongoose.connect(uri);
  const app = require(path.join(BACKEND, 'app'));
  Submission = require(path.join(BACKEND, 'models', 'WT1Submission'));
  const users = require(path.join(BACKEND, 'tests', 'factories', 'userFactory'));

  await new Promise((resolve) => { apiServer = app.listen(0, resolve); });
  apiBase = `http://127.0.0.1:${apiServer.address().port}`;
  staticServer = await startStatic();
  student = await users.createPremiumStudent({ username: 'e2e_mindset_student' });
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
    if (url.startsWith(`http://localhost:${STATIC_PORT}`)) return route.continue();
    return route.abort();
  });
  await page.addInitScript(([t, u]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', u);
    localStorage.setItem('lastLoginAt', String(Date.now()));
    localStorage.setItem('ews_seen_streak35_notice', '1');
    localStorage.setItem('ews_onboarding_tour_v1_mindset-2.html', '1');
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

// Pointer drag (course-engine's Dnd listens to pointer events).
async function drag(page, from, to) {
  // the sticky "Kiểm tra" button covers the bottom of the viewport
  await to.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  const a = await from.boundingBox();
  const b = await to.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 5, a.y + a.height / 2 + 5);
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 });
  await page.mouse.up();
}

test('M2 U5 Reading: Ex. 5,11 + Ex. 6–7 on one page, two text tabs, one check', async ({ page }) => {
  const errors = await wire(page);
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('/mindset-2.html?lesson=M2-U05-L2');

  // lesson list: the two exercises sit in one step box
  const box = page.locator('.ms-page');
  await expect(box).toHaveCount(1);
  await expect(box.locator('.t1-ex-card')).toHaveCount(2);
  await expect(box.locator('.ms-page-h')).toContainText('Successful entrepreneurs + Business ideas of the future');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'm2u05-lesson.png'), fullPage: true });

  // open the second card → the page opens at its first part
  await box.locator('.t1-ex-card').nth(1).click();
  await expect(page.locator('.ce-grp-ex')).toHaveCount(2);
  await expect(page).toHaveURL(/ex=M2-U05-L2-E01/);
  const tabs = page.locator('.ce-ptab');
  await expect(tabs).toHaveCount(2);
  await expect(page.locator('.ce-ptext[data-t="0"]')).toBeVisible();
  await tabs.nth(1).click();
  await expect(page.locator('.ce-ptext[data-t="1"]')).toBeVisible();
  await expect(page.locator('.ce-ptext[data-t="0"]')).toBeHidden();

  // Part 1 — mcq
  const e1 = builtExercise('M2-U05-L2-E01');
  for (const it of e1.items) await page.locator(`input[name="mc-${e1.code}-${it.id}"][value="${it.answer}"]`).check();
  // Part 2 — matching: drag each answer chip onto its row
  const e2 = builtExercise('M2-U05-L2-E02');
  const sec2 = page.locator('.ce-grp-ex[data-i="1"]');
  for (const it of e2.items) {
    const chip = sec2.locator('.t1-match-pool .t1-chip').filter({ hasText: it.right }).first();
    await chip.scrollIntoViewIfNeeded();
    await drag(page, chip, sec2.locator(`.t1-drop[data-item="${it.id}"]`));
  }
  await expect(sec2.locator('.t1-drop .t1-chip')).toHaveCount(e2.items.length);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'm2u05-page-filled.png'), fullPage: true });

  await page.locator('#t1-submit').click();
  const fb = page.locator('#t1-fb');
  await expect(fb).toBeVisible();
  await expect(fb.locator('.t1-fb-score')).toHaveText('100%');
  await expect(page.locator('.ce-grp-fb')).toHaveCount(2);
  await expect(page.locator('.ce-grp-fb').first()).toContainText('2 / 2');
  // the next step in the book is the Reading test (Ex. 8)
  await expect(page.locator('#t1-next')).toContainText('Reading');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'm2u05-page-checked.png'), fullPage: true });

  const subs = await Submission.find({ userId: student._id }).lean();
  const byCode = Object.fromEntries(subs.map((s) => [s.exerciseCode, s.score]));
  expect(byCode['M2-U05-L2-E01']).toBe(100);
  expect(byCode['M2-U05-L2-E02']).toBe(100);
  expect(errors).toEqual([]);
});

test('single-passage exercise still works on its own page', async ({ page }) => {
  const errors = await wire(page);
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('/mindset-2.html?lesson=M2-U05-L2&ex=M2-U05-L2-E04');
  await expect(page.locator('.ce-grp-ex')).toHaveCount(0);
  await expect(page.locator('.ce-pass-left .t1-passage')).toBeVisible();
  const ex = builtExercise('M2-U05-L2-E04');
  for (const it of ex.items) {
    const chip = page.locator('#t1-right-pool .t1-chip').filter({ hasText: it.right }).first();
    await drag(page, chip, page.locator(`.t1-drop[data-item="${it.id}"]`));
  }
  await page.locator('#t1-submit').click();
  await expect(page.locator('#t1-fb .t1-fb-score')).toHaveText('100%');
  expect(errors).toEqual([]);
});

test('M2 U2 Reading: two pages split by a Reading test, each part graded on its own', async ({ page }) => {
  const errors = await wire(page);
  await page.setViewportSize({ width: 1400, height: 1100 });
  // two pages split by the Reading test at step 3: Ali (Ex. 4–5) and Serena (Ex. 8)
  await page.goto('/mindset-2.html?lesson=M2-U02-L2');
  await expect(page.locator('.ms-page')).toHaveCount(2);
  await page.locator('.ms-page').nth(0).locator('.t1-ex-card').first().click();
  await expect(page.locator('.ce-grp-ex')).toHaveCount(2);
  // answer nothing in part 2 → it scores 0, part 1 graded separately
  const e1 = builtExercise('M2-U02-L2-E01');
  for (const it of e1.items) await page.locator(`input[name="mc-${e1.code}-${it.id}"][value="${it.answer}"]`).check();
  await page.locator('#t1-submit').click();
  await expect(page.locator('#t1-fb')).toBeVisible();
  await expect(page.locator('.ce-grp-fb').nth(0)).toContainText('100%');
  await expect(page.locator('.ce-grp-fb').nth(1)).toContainText('0%');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'm2u02-partial.png'), fullPage: true });
  // "Tiếp theo" leaves the page (to the Reading test between the two pages)
  await page.locator('#t1-next').click();
  await expect(page).toHaveURL(/reading\.html|mindset-2\.html/);
  expect(errors).toEqual([]);
});

// ── book-order navigation (mindset-course.js nextStep / afterTask / lessonStart)
async function passageIdOf(courseRef) {
  const Passage = require(path.join(BACKEND, 'models', 'Passage'));
  const p = await Passage.findOne({ courseRef }).select('_id').lean();
  return String(p._id);
}

test('"Bài tiếp theo" goes to the next Reading test even when it is already passed', async ({ page }) => {
  const Attempt = require(path.join(BACKEND, 'models', 'ReadingPracticeAttempt'));
  await Attempt.create({ userId: student._id, passageId: await passageIdOf('M2-U05-R1'), correctCount: 5, totalQuestions: 5, status: 'completed' });
  const errors = await wire(page);
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('/mindset-2.html?lesson=M2-U05-L2&ex=M2-U05-L2-E01');
  const e1 = builtExercise('M2-U05-L2-E01');
  for (const it of e1.items) await page.locator(`input[name="mc-${e1.code}-${it.id}"][value="${it.answer}"]`).check();
  await page.locator('#t1-submit').click();
  await expect(page.locator('#t1-next')).toContainText('Reading');
  await page.locator('#t1-next').click();
  await expect(page).toHaveURL(/\/reading\.html\?passageId=/);
  const back = decodeURIComponent(new URL(page.url()).searchParams.get('returnTo'));
  expect(back).toBe('/mindset-2.html?lesson=M2-U05-L2&after=' + await passageIdOf('M2-U05-R1'));
  expect(errors).toEqual([]);
});

test('back from a test: the next exercise opens; two tests in a row go straight on', async ({ page }) => {
  const errors = await wire(page);
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('/mindset-2.html?lesson=M2-U05-L2&after=' + await passageIdOf('M2-U05-R1'));
  await expect(page).toHaveURL(/ex=M2-U05-L2-E03/);
  await expect(page.locator('.cx-task-t')).toContainText('Ex. 9');

  // M2 U7: "The university campus" (Ex. 13) and "The typewriter" (Ex. 15) sit
  // side by side → straight on to the typewriter test
  await page.goto('/mindset-2.html?lesson=M2-U07-L2&after=' + await passageIdOf('M2-U07-R2'));
  const typewriter = await passageIdOf('M2-U07-R3');
  await expect(page).toHaveURL((u) => u.pathname === '/reading.html' && u.searchParams.get('passageId') === typewriter);
  // its result screen says "Bài tiếp theo" (mid-test: "Về khóa học")
  expect(await page.evaluate(() => window.CourseReturn.exitLabel(null, true))).toContain('Bài tiếp theo');
  expect(await page.evaluate(() => window.CourseReturn.exitLabel())).toContain('Về khóa học');
  expect(errors).toEqual([]);
});

test('"Bắt đầu" opens the Reading test when the book starts the lesson with it', async ({ page }) => {
  const errors = await wire(page);
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto('/mindset-2.html?lesson=M2-U03-L2');
  await page.locator('#cx-start').click();
  await expect(page).toHaveURL(/\/reading\.html\?passageId=/);
  expect(errors).toEqual([]);
});
