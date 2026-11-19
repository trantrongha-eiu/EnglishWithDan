// @ts-check
/**
 * The pages moved to the React app, against the REAL backend (in-memory
 * MongoDB) instead of a mock, so a wrong guess about an API's answer shows up.
 * The microphone is Chromium's fake device: recording and "Giọng của tôi" are
 * real, only the speech-to-text is stubbed.
 *
 * Run: npm run test:e2e -- student-app-live-api
 *      E2E_REAL_YT=1 uses the real YouTube player (needs network).
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.resolve(process.env.E2E_FRONTEND || path.join(ROOT, 'frontend'));
const PROD_API = 'https://englishwithdan.onrender.com';
const PORT = 3000; // an origin the backend's CORS list accepts
const BASE = `http://localhost:${PORT}`;
const REAL_YT = !!process.env.E2E_REAL_YT;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
};

const breq = (m) => require(require.resolve(m, { paths: [BACKEND] }));
const model = (name) => require(path.join(BACKEND, 'models', name));
const lessonData = require(path.join(BACKEND, 'scripts', 'data', 'shadowingLessons.json'))[0];

const FAKE_YOUTUBE = `
window.__yt = [];
window.YT = { PlayerState: { PLAYING: 1, PAUSED: 2 }, Player: function (el, o) {
  var frame = document.createElement('iframe');
  frame.id = 'yt-player';
  el.replaceWith(frame);
  var self = this, timer = null;
  self.t = o.playerVars.start;
  self.getCurrentTime = function () { return self.t; };
  self.seekTo = function (t) { self.t = t; };
  self.setPlaybackRate = function () {};
  self.playVideo = function () { clearInterval(timer); timer = setInterval(function () { self.t += 0.5; }, 50); o.events.onStateChange({ data: 1 }); };
  self.pauseVideo = function () { clearInterval(timer); o.events.onStateChange({ data: 2 }); };
  self.destroy = function () { clearInterval(timer); frame.remove(); };
  self.unloadModule = function () {};
  window.__yt.push(self);
  setTimeout(function () { o.events.onReady(); }, 0);
} };
if (window.onYouTubeIframeAPIReady) window.onYouTubeIframeAPIReady();`;

let mongod, apiServer, staticServer, apiBase, student, token, paidFee, unpaidFee;

test.describe.configure({ mode: 'serial' });
test.use({
  permissions: ['microphone'],
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] },
});

test.beforeAll(async () => {
  test.setTimeout(240 * 1000);
  const { MongoMemoryServer } = breq('mongodb-memory-server');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri('student_app_e2e');
  process.env.MONGO_URI = uri;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'e2e-jwt-secret-not-for-production';
  const mongoose = breq('mongoose');
  await mongoose.connect(uri);
  const app = require(path.join(BACKEND, 'app'));
  const users = require(path.join(BACKEND, 'tests', 'factories', 'userFactory'));
  student = await users.createPremiumStudent({ username: 'e2e_app_student' });
  token = users.signTokenFor(student);

  const TuitionFee = model('TuitionFee');
  const now = new Date();
  unpaidFee = await TuitionFee.create({ studentId: student._id, feeType: 'monthly', month: now.getMonth() + 1, year: now.getFullYear(), amount: 1500000, note: 'Đợt 1' });
  paidFee = await TuitionFee.create({ studentId: student._id, feeType: 'course', courseName: 'IELTS 7.0', amount: 6000000, isPaid: true, paidDate: now });
  await model('TuitionSettings').create({ bankName: 'Vietcombank', accountName: 'TRAN VAN A', bankAccount: '0123456789', paymentNote: 'Ghi họ tên\nvà tháng' });

  const oid = () => new mongoose.Types.ObjectId();
  await model('AttemptReview').create(Array.from({ length: 12 }, (_, i) => ({
    userId: student._id, attemptType: i % 2 ? 'listening' : 'reading', attemptId: oid(), status: 'completed', completedAt: now,
    mistakes: [{ questionNumber: i + 1, questionType: 'Matching', errorCategory: 'vocabulary', errorReason: 'Không biết từ' }],
  })));
  await model('MockTestAttempt').collection.insertOne({
    userId: student._id, status: 'in-progress', createdAt: now, updatedAt: now, progress: 'reading', bundle: {},
    steps: { listening: { attemptId: oid(), band: 7 }, reading: {}, writing: {}, speaking: {} },
  });
  await model('ShadowingLesson').create({ ...lessonData, segmentCount: lessonData.segments.length, isPublished: true });

  await new Promise((resolve) => { apiServer = app.listen(0, resolve); });
  apiBase = `http://127.0.0.1:${apiServer.address().port}`;
  staticServer = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.startsWith('/app/') && !p.startsWith('/app/assets/')) p = '/app/index.html';
    const file = path.join(FRONTEND, p);
    if (!file.startsWith(FRONTEND) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => staticServer.listen(PORT, r));
});

test.afterAll(async () => {
  await new Promise((r) => (apiServer ? apiServer.close(r) : r()));
  await new Promise((r) => (staticServer ? staticServer.close(r) : r()));
  await breq('mongoose').disconnect();
  if (mongod) await mongod.stop();
});

async function wire(page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.startsWith(PROD_API)) {
      try {
        const resp = await route.fetch({ url: apiBase + url.slice(PROD_API.length) });
        return await route.fulfill({ response: resp });
      } catch (e) {
        if (/disposed|closed|Target page/i.test(String(e && e.message))) return undefined;
        throw e;
      }
    }
    if (url === 'https://www.youtube.com/iframe_api' && !REAL_YT) return route.fulfill({ contentType: 'application/javascript', body: FAKE_YOUTUBE });
    if (REAL_YT && /youtube\.com|ytimg\.com|googlevideo\.com|ggpht\.com|google\.com|gstatic\.com/.test(url)) return route.continue();
    if (url.startsWith(BASE) || url.startsWith('blob:') || url.startsWith('data:')) return route.continue();
    return route.abort();
  });
  await page.addInitScript(([t, u]) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', u);
    localStorage.setItem('lastLoginAt', String(Date.now()));
    localStorage.setItem('ews_seen_streak35_notice', '1');
    localStorage.setItem('ews_page_help_seen', '1');
    localStorage.setItem('ews_onboarding_tour_v1_dashboard.html', '1');
    // Reads the sentence on screen back, perfectly
    window.SpeechRecognition = function () {
      const self = this;
      self.start = () => setTimeout(() => {
        const said = Object.assign([{ transcript: document.getElementById('sh-sentence').textContent }], { isFinal: true });
        self.onresult({ results: [said] });
      }, 700);
      self.stop = () => {};
    };
  }, [token, JSON.stringify({ _id: String(student._id), id: String(student._id), username: student.username, role: 'student', email: student.email, plan: 'premium', createdAt: student.createdAt })]);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

test('tuition: real fees, and the transfer note reaches the server', async ({ page }) => {
  const errors = await wire(page);
  await page.goto(`${BASE}/app/tuition`);
  await expect(page.locator(`#fcard-${unpaidFee._id}`)).toContainText('Đợt 1');
  await expect(page.locator('.bank-account-num')).toContainText('0123456789');
  await expect(page.locator('#paymentNoteBody br')).toHaveCount(1);
  await page.locator(`#nbtn-${unpaidFee._id}`).click();
  await expect(page.locator(`#fcard-${unpaidFee._id} .status-notified`)).toBeVisible();
  await expect.poll(async () => (await model('TuitionFee').findById(unpaidFee._id).lean()).studentNotified).toBe(true);
  await page.locator('.paid-toggle').click();
  await expect(page.locator(`#fcard-${paidFee._id} .status-paid`)).toBeVisible();
  expect(errors).toEqual([]);
  // Otherwise the "due" reminder popup covers the next pages
  await model('TuitionFee').updateMany({ studentId: student._id }, { isPaid: true });
});

test('review history: real pages, filter and the mock test tab', async ({ page }) => {
  const errors = await wire(page);
  await page.goto(`${BASE}/app/review-history`);
  await expect(page.locator('#rhList .rh-item')).toHaveCount(10);
  await expect(page.locator('#rhPageLabel')).toHaveText('Trang 1/2');
  await page.locator('#rhNextBtn').click();
  await expect(page.locator('#rhList .rh-item')).toHaveCount(2);
  await page.locator('#rhFilterType').selectOption('reading');
  await expect(page.locator('#rhList .rh-item')).toHaveCount(6);
  await page.locator('#rhTabMock').click();
  await expect(page.locator('#mockList .mt-chip.done')).toHaveText('Listening: 7.0');
  await expect(page.locator('#mockList a', { hasText: 'Tiếp tục thi thử' })).toHaveAttribute('href', '/mock-test.html');
  expect(errors).toEqual([]);
});

test('goal tab in Hồ sơ: saved on the server and shown in the sidebar', async ({ page }) => {
  const errors = await wire(page);
  await page.goto(`${BASE}/app/profile`);
  await page.locator('.tab-btn[data-tab="goal"]').click();
  await expect(page.locator('#today-content')).not.toHaveClass(/goal-loading/);
  await page.selectOption('#f-current', '5');
  await page.selectOption('#f-target', '6.5');
  await page.fill('#f-exam', '2031-03-10');
  await page.fill('#f-weekly', '180');
  await page.fill('#f-session', '60');
  for (const d of ['mon', 'wed', 'fri']) await page.locator(`.goal-day-chip[data-day="${d}"]`).click();
  await page.click('#goal-save-btn');
  await expect(page.locator('#goal-msg')).toHaveText('Đã lưu!');
  await expect(page.locator('#targetBandDisplay')).toHaveText('6.5');
  await expect(page.locator('#summary-stats .goal-stat')).toHaveCount(6);
  await expect(page.locator('#plan-content .plan-day').first()).toBeVisible({ timeout: 15000 });
  const saved = await model('User').findById(student._id).lean();
  expect(saved).toMatchObject({ targetBand: 6.5, currentBand: 5, weeklyStudyMinutes: 180, studyDays: ['mon', 'wed', 'fri'] });
  expect(errors).toEqual([]);
});

test('shadowing: record, hear yourself, score saved and shown on the card', async ({ page }) => {
  test.setTimeout(90 * 1000);
  const errors = await wire(page);
  await page.goto(`${BASE}/app/shadowing`);
  const card = page.locator(`.sh-card[data-slug="${lessonData.slug}"]`);
  await card.click();
  await page.locator('.sh-choice[data-mode="shadowing"]').click();
  await page.locator('iframe#yt-player').waitFor({ state: 'attached', timeout: 30000 });
  if (REAL_YT) {
    await expect(page.locator('iframe#yt-player')).toHaveAttribute('src', new RegExp(lessonData.youtubeId));
    await expect(page.locator('#sh-play')).toContainText('Dừng', { timeout: 30000 });
    await expect(page.locator('#sh-play')).toContainText('Nghe', { timeout: 30000 });
  }
  await page.locator('#sh-rec').click();
  await expect(page.locator('#sh-score')).toContainText('100%', { timeout: 10000 });
  await expect(page.locator('#sh-mine')).toBeEnabled({ timeout: 5000 });
  await page.locator('#sh-mine').click();
  await page.click('.sh-back');
  await expect.poll(() => model('ShadowingAttempt').countDocuments({ userId: student._id })).toBe(1);
  await expect(card.locator('.sh-pill', { hasText: '%' })).toBeVisible();
  // A second opening gets a new player and the mode picker again
  await card.click();
  await expect(page.locator('#sh-chooser')).toBeVisible();
  await page.locator('iframe#yt-player').waitFor({ state: 'attached', timeout: 30000 });
  await expect(page).toHaveURL(new RegExp(`lesson=${lessonData.slug}`));
  expect(errors).toEqual([]);
});
