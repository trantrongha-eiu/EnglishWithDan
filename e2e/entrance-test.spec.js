// @ts-check
/**
 * Test đầu vào — full student run + admin approval, in a real browser.
 *
 * Self-contained: this spec boots its OWN stack in the Playwright worker —
 * an in-memory MongoDB (mongodb-memory-server), the real backend Express
 * app on a random port, and a static server for frontend/ on :3000 — so it
 * never touches production. The pages hardcode the production API URL
 * (auth-service.js / the admin build), so every request to it is rerouted
 * to the local backend with page.route().
 *
 * NODE_ENV=test keeps the background AI grading off (no Gemini calls) and
 * the Cloudinary upload of the Speaking recording is stubbed. Chromium runs
 * with a fake microphone so the real recording path (getUserMedia +
 * MediaRecorder) is exercised.
 *
 * Run: npm run test:e2e -- entrance-test   (no servers need to be started)
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.join(ROOT, 'frontend');
const PROD_API = 'https://englishwithdan.onrender.com';
const STATIC_PORT = 3000; // an allowed CORS origin in backend/app.js

const breq = (m) => require(require.resolve(m, { paths: [BACKEND] }));

let mongod, apiServer, staticServer, apiBase;
let models, factories;
let student, admin, studentToken, adminToken;

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

async function seedContent() {
  const { EntranceGrammarQuestion, EntranceTestConfig, SpeakingQuestion } = models;
  await EntranceTestConfig.create({ grammarSetKey: 'default', isActive: true });
  await EntranceGrammarQuestion.create([
    { setKey: 'default', order: 1, topic: 'Present Perfect', type: 'mcq', prompt: 'She ___ here since 2020.',
      options: [{ id: 'A', text: 'lives' }, { id: 'B', text: 'has lived' }], answer: 'B' },
    { setKey: 'default', order: 2, topic: 'Present Perfect', type: 'gap_fill', prompt: 'I ___ (finish) my homework.',
      accept: ['have finished'] },
    { setKey: 'default', order: 3, topic: 'Articles', type: 'mcq', prompt: 'I saw ___ elephant.',
      options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'an' }], answer: 'B' },
  ]);
  // Distractors that must never be drawn (wrong part / wrong passage).
  await factories.content.createPassage({ category: 'passage1', title: 'WRONG PASSAGE 1', content: '<p>wrong</p>' });
  await factories.content.createListeningSection({ partNumber: 1, title: 'WRONG PART 1',
    extra: { audioUrl: '/audio-missing.mp3', audioDuration: 300 } });

  await factories.content.createPassage({
    category: 'passage2', title: 'Urban Beekeeping', content: '<p>Bees are <strong>thriving</strong> in cities.</p>',
    questionRange: { start: 14, end: 15 },
    questionGroups: [{ groupType: 'plain', instruction: 'Do the following statements agree with the information?', questions: [
      { questionNumber: 14, type: 'true-false-ng', questionText: 'Bees do well in cities.', correctAnswer: 'True' },
      { questionNumber: 15, type: 'sentence-completion', questionText: 'Bees are ____ in cities.', correctAnswer: 'thriving' },
    ] }],
  });
  await factories.content.createListeningSection({
    partNumber: 3, title: 'Student project discussion',
    questionRange: { start: 21, end: 22 },
    questionGroups: [{ groupType: 'plain', questions: [
      { questionNumber: 21, type: 'multiple-choice', questionText: 'What is the project about?', options: ['Bees', 'Birds', 'Bats'], correctAnswer: 'A' },
      { questionNumber: 22, type: 'fill-blank', questionText: 'They will meet on ____.', correctAnswer: 'Monday' },
    ] }],
    extra: { audioUrl: '/audio-missing.mp3', audioDuration: 420 },
  });
  await factories.content.createWritingTask1({ prompt: 'The chart below shows coffee sales in 2020.', imageUrl: '/img/favicon.svg' });
  await SpeakingQuestion.create({
    topic: 'A memorable trip', part: 2, question: 'Describe a memorable trip you took.',
    cueCard: 'You should say:\n- where you went\n- who you went with\n- and explain why it was memorable',
    sampleAnswer: 'SAMPLE ANSWER SHOULD NEVER SHOW', hints: { vocab: ['HINTWORD'] },
  });
}

test.describe.configure({ mode: 'serial' });
test.use({
  launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] },
  permissions: ['microphone'],
  baseURL: `http://localhost:${STATIC_PORT}`,
});

test.beforeAll(async () => {
  const { MongoMemoryServer } = breq('mongodb-memory-server');
  mongod = await MongoMemoryServer.create();
  // Must be set BEFORE the backend loads dotenv (it never overrides an
  // already-set variable) — this is what keeps the run off production.
  process.env.MONGO_URI = mongod.getUri();
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'e2e-jwt-secret-not-for-production';

  const mongoose = breq('mongoose');
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'entrance_e2e' });
  const app = require(path.join(BACKEND, 'app'));
  // Never upload the fake-mic recording to the real Cloudinary account.
  const cloudinaryService = require(path.join(BACKEND, 'services', 'cloudinaryService'));
  cloudinaryService.uploadBufferStream = async () => ({
    secure_url: 'https://res.cloudinary.com/demo/video/upload/entrance-speaking/e2e.webm', public_id: 'entrance-speaking/e2e',
  });

  models = {
    EntranceGrammarQuestion: require(path.join(BACKEND, 'models', 'EntranceGrammarQuestion')),
    EntranceTestConfig: require(path.join(BACKEND, 'models', 'EntranceTestConfig')),
    EntranceTestAttempt: require(path.join(BACKEND, 'models', 'EntranceTestAttempt')),
    WritingAttempt: require(path.join(BACKEND, 'models', 'WritingAttempt')),
    SpeakingQuestion: require(path.join(BACKEND, 'models', 'SpeakingQuestion')),
    Message: require(path.join(BACKEND, 'models', 'Message')),
  };
  factories = {
    user: require(path.join(BACKEND, 'tests', 'factories', 'userFactory')),
    content: require(path.join(BACKEND, 'tests', 'factories', 'contentFactory')),
  };

  await new Promise((resolve) => { apiServer = app.listen(0, resolve); });
  apiBase = `http://127.0.0.1:${apiServer.address().port}`;
  staticServer = await startStatic();

  await seedContent();
  student = await factories.user.createStudent({ username: 'e2e_student' });
  admin = await factories.user.createAdmin({ username: 'e2e_admin' });
  studentToken = factories.user.signTokenFor(student);
  adminToken = factories.user.signTokenFor(admin);
});

test.afterAll(async () => {
  const mongoose = breq('mongoose');
  await new Promise((r) => (apiServer ? apiServer.close(r) : r()));
  await new Promise((r) => (staticServer ? staticServer.close(r) : r()));
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

// Reroutes the hardcoded production API to the local backend and blocks
// every other external host (fonts/CDNs) so the run is hermetic.
async function wire(page, user, token, { writingSubmitDelayMs = 0 } = {}) {
  const apiCalls = [];
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.startsWith(PROD_API)) {
      const local = apiBase + url.slice(PROD_API.length);
      apiCalls.push(`${route.request().method()} ${url.slice(PROD_API.length)}`);
      if (writingSubmitDelayMs && /\/section\/writing\/submit$/.test(url)) {
        await new Promise((r) => setTimeout(r, writingSubmitDelayMs));
      }
      const resp = await route.fetch({ url: local });
      return route.fulfill({ response: resp });
    }
    if (url.startsWith(`http://localhost:${STATIC_PORT}`)) return route.continue();
    return route.abort();
  });
  await page.addInitScript(([t, u]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', u);
    localStorage.setItem('lastLoginAt', String(Date.now()));
    // nav.js's one-time "streak" announcement for a brand-new account —
    // unrelated to the test, and it would sit over the start button.
    localStorage.setItem('ews_seen_streak35_notice', '1');
  }, [token, JSON.stringify({ _id: String(user._id), username: user.username, role: user.role, email: user.email })]);
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('dialog', (d) => d.accept());
  return { apiCalls, pageErrors };
}

// E2E_SHOTS=<dir> saves screenshots of the key screens for a visual check.
async function shot(page, name) {
  if (process.env.E2E_SHOTS) await page.screenshot({ path: path.join(process.env.E2E_SHOTS, name + '.png'), fullPage: false });
}

async function confirmSubmit(page) {
  await page.locator('#et-submit-btn').click();
  await page.locator('#shared-confirm-ok').click();
}

test('student takes the whole test; admin approves; student sees the result', async ({ page, browser }) => {
  test.setTimeout(180 * 1000);
  const { apiCalls, pageErrors } = await wire(page, student, studentToken, { writingSubmitDelayMs: 1500 });

  // ── Landing ──
  await page.goto('/entrance-test.html');
  await expect(page.locator('#et-structure-table')).toContainText('Speaking');
  await expect(page.locator('#et-structure-table')).toContainText('74 phút');
  await page.locator('#et-start-btn').click();

  // ── Grammar (shuffled order — answer by prompt) ──
  await expect(page.locator('#et-section-title')).toContainText('Grammar');
  const questions = page.locator('.et-question');
  await expect(questions).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    const q = questions.nth(i);
    const prompt = await q.locator('.et-q-prompt').textContent();
    if (/finish/.test(prompt || '')) await q.locator('input[type=text]').fill('have finished');
    else await q.locator('input[type=radio][value=B]').check();
  }
  await page.waitForTimeout(700); // debounced autosave
  await confirmSubmit(page);

  // ── Reading: a Passage 2 ──
  await expect(page.locator('#et-section-title')).toContainText('Reading');
  await expect(page.locator('.et-passage h3')).toHaveText('Urban Beekeeping');
  await expect(page.locator('.et-passage-content strong')).toHaveText('thriving'); // HTML rendered, not escaped
  await page.locator('input[name="q-14"][value="True"]').check();
  await page.locator('input[data-q="15"]').fill('thriving');
  await page.waitForTimeout(700);
  await confirmSubmit(page);

  // ── Listening: a Part 3 section ──
  await expect(page.locator('#et-section-title')).toContainText('Listening');
  await expect(page.locator('.et-listening-layout')).toContainText('What is the project about?');
  await page.locator('input[name="q-21"][value="A"]').check();
  await page.locator('input[data-q="22"]').fill('Monday');
  await page.waitForTimeout(700);
  await confirmSubmit(page);

  // ── Writing: overlay blocks a second submit; exactly one WritingAttempt ──
  await expect(page.locator('#et-section-title')).toContainText('Writing');
  await page.locator('#et-writing-textarea').fill('The chart shows coffee sales in 2020. ' + 'Sales rose steadily. '.repeat(20));
  await page.locator('#et-submit-btn').click();
  await page.locator('#shared-confirm-ok').click();
  await expect(page.locator('#et-submit-overlay')).toBeVisible();
  await expect(page.locator('#et-submit-title')).toContainText('Writing');
  await shot(page, '1-writing-overlay');
  // Try to fire more submits while the first is in flight.
  await page.evaluate(() => { const b = document.getElementById('et-submit-btn'); b.click(); b.click(); });
  await expect(page.locator('#et-section-title')).toContainText('Speaking', { timeout: 15000 });
  await expect(page.locator('#et-submit-overlay')).toBeHidden();
  expect(apiCalls.filter((c) => /\/section\/writing\/submit$/.test(c))).toHaveLength(1);
  expect(await models.WritingAttempt.countDocuments({ userId: student._id })).toBe(1);
  const essayAutosave = apiCalls.filter((c) => /\/answer$/.test(c)).length;
  expect(essayAutosave).toBeGreaterThan(0);

  // ── Speaking: cue card, no sample/hints, prep, fake-mic recording, typed transcript ──
  const body = page.locator('#et-section-body');
  await expect(body).toContainText('Describe a memorable trip you took.');
  await expect(body).toContainText('You should say');
  await expect(body).not.toContainText('SAMPLE ANSWER SHOULD NEVER SHOW');
  await expect(body).not.toContainText('HINTWORD');
  await expect(page.locator('#et-sp-prep')).toBeVisible();
  await expect(page.locator('#et-sp-prep-clock')).toHaveText(/^1:(10|09|08)$/);
  await expect(page.locator('#et-sp-rec-btn')).toBeDisabled();
  await shot(page, '2-speaking-prep');
  await page.locator('#et-sp-prep-skip').click();
  await expect(page.locator('#et-sp-rec-btn')).toHaveClass(/recording/);
  await expect(page.locator('#et-sp-elapsed')).toBeVisible();
  await page.waitForTimeout(2500);
  await shot(page, '3-speaking-recording');
  await page.locator('#et-sp-rec-btn').click(); // stop
  await expect(page.locator('#et-sp-rec-label')).toHaveText('Đã ghi');
  await expect(page.locator('#et-sp-transcript')).toBeEditable();
  await page.locator('#et-sp-transcript').fill('I went to Da Lat with my family last summer and it was wonderful.');
  await shot(page, '4-speaking-done');
  await confirmSubmit(page);

  // ── Done: no scores until the teacher approves ──
  await expect(page.locator('#et-done-modal')).toBeVisible({ timeout: 15000 });
  await page.locator('#et-done-ok').click();
  await expect(page.locator('#et-result-body')).toContainText('đang chờ giáo viên duyệt');
  await expect(page.locator('.et-overall-band')).toHaveCount(0);
  await shot(page, '5-result-pending');

  const attempt = await models.EntranceTestAttempt.findOne({ userId: student._id }).lean();
  expect(attempt.status).toBe('completed');
  expect(attempt.sections.grammar.correctCount).toBe(3);
  expect(attempt.sections.reading.correctCount).toBe(2);
  expect(attempt.sections.listening.correctCount).toBe(2);
  expect(attempt.sections.speaking.audioUrl).toMatch(/entrance-speaking/);
  expect(attempt.sections.speaking.transcript).toMatch(/Da Lat/);
  expect(attempt.sections.speaking.durationSec).toBeGreaterThanOrEqual(2);
  expect(attempt.resultStatus).toBe('PENDING_WRITING');
  expect(pageErrors).toEqual([]);

  // The Writing AI grade lands (the background AI is off under NODE_ENV=test).
  await models.WritingAttempt.updateOne({ userId: student._id }, { $set: { 'aiGrading.task1': { bandScore: 6 }, gradingStatus: 'ai_done' } });

  // ── Admin: review queue → approve ──
  const adminCtx = await browser.newContext({ baseURL: `http://localhost:${STATIC_PORT}` });
  const adminPage = await adminCtx.newPage();
  const adminWire = await wire(adminPage, admin, adminToken);
  await adminPage.goto('/admin/#/entrance-test?tab=attempts');
  const row = adminPage.locator('tr', { hasText: 'e2e_student' });
  await expect(row).toContainText('Chờ duyệt', { timeout: 15000 });
  await row.getByRole('button', { name: 'Duyệt' }).click();
  const modal = adminPage.locator('.modal');
  await expect(modal).toContainText('Speaking Part 2');
  await expect(modal).toContainText('Da Lat');
  await expect(modal.locator('audio')).toHaveAttribute('src', /entrance-speaking/);
  await expect(modal).toContainText('The chart shows coffee sales');
  const selects = modal.locator('select');
  await expect(selects.nth(0)).toHaveValue('6.0'); // Writing = AI suggestion
  await selects.nth(1).selectOption('6.5');        // Speaking — AI off here, set by hand
  await modal.locator('.modal-body').evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await shot(adminPage, '6-admin-approve');
  await modal.locator('textarea').fill('Xếp vào lớp 6.0+');
  await modal.getByRole('button', { name: /Duyệt & gửi kết quả/ }).click();
  await expect(modal).toContainText('Kết quả đã gửi');
  expect(adminWire.pageErrors).toEqual([]);
  await adminCtx.close();

  expect(await models.Message.countDocuments({ toId: student._id })).toBe(1);

  // ── Student now sees the approved result ──
  await page.goto('/entrance-test.html');
  await page.locator('.et-history-view').first().click();
  await expect(page.locator('.et-overall-band')).toBeVisible();
  await expect(page.locator('#et-result-body')).toContainText('Speaking');
  await expect(page.locator('#et-result-body')).toContainText('6.5');
  await expect(page.locator('#et-result-body')).toContainText('Xếp vào lớp 6.0+');
  await shot(page, '7-result-approved');
  expect(pageErrors).toEqual([]);
});
