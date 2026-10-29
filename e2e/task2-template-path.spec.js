// @ts-check
/**
 * Task 2 Templates practice path (task2-template.html) — a student walks
 * the whole 5-step path for one essay type in a real browser, and the
 * progress lands in the database.
 *
 * Self-contained like entrance-test.spec.js: in-memory MongoDB, the real
 * backend on a random port, a static server for frontend/ on :3000, and
 * every request to the production API rerouted to the local backend.
 * The sentences come from the full template (frontend/js/task2-generic-
 * templates.js, the "Xem đầy đủ" pop-up); e2e/fixtures/task2-templates.json
 * seeds the DB rows homework is assigned from and the Type 01 guide.
 *
 * The test reads the page's own state (_build / _fade / _run) to know the
 * right answer for each exercise, so it follows whatever the page asks.
 *
 * Run: npm run test:e2e -- task2-template-path
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
const FIXTURE = require('./fixtures/task2-templates.json');

const breq = (m) => require(require.resolve(m, { paths: [BACKEND] }));

let mongod, apiServer, staticServer, apiBase;
let student, studentToken, Progress, Attempt, TemplateModel, teacherToken, classGroup, admin, adminToken;

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
  test.setTimeout(180 * 1000); // first run downloads the MongoDB binary
  const { MongoMemoryServer } = breq('mongodb-memory-server');
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'e2e-jwt-secret-not-for-production';

  const mongoose = breq('mongoose');
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'task2tpl_e2e' });
  const app = require(path.join(BACKEND, 'app'));
  const Task2Template = require(path.join(BACKEND, 'models', 'Task2Template'));
  const Task2TypeGuide = require(path.join(BACKEND, 'models', 'Task2TypeGuide'));
  Progress = require(path.join(BACKEND, 'models', 'Task2TemplateProgress'));
  TemplateModel = Task2Template;
  Attempt = require(path.join(BACKEND, 'models', 'Task2TemplateAttempt'));
  const users = require(path.join(BACKEND, 'tests', 'factories', 'userFactory'));

  await Task2Template.create(FIXTURE.templates);
  await Task2TypeGuide.create(FIXTURE.guides);

  await new Promise((resolve) => { apiServer = app.listen(0, resolve); });
  apiBase = `http://127.0.0.1:${apiServer.address().port}`;
  staticServer = await startStatic();

  student = await users.createPremiumStudent({ username: 'e2e_tpl_student' });
  studentToken = users.signTokenFor(student);
  const classes = require(path.join(BACKEND, 'tests', 'factories', 'classFactory'));
  const teacher = await users.createTeacher({ username: 'e2e_tpl_teacher' });
  teacherToken = users.signTokenFor(teacher);
  admin = await users.createAdmin({ username: 'e2e_tpl_admin' });
  adminToken = users.signTokenFor(admin);
  classGroup = await classes.createClassGroup({ teacher });
  await classes.enrollStudent(classGroup, student);
});

test.afterAll(async () => {
  await new Promise((r) => (apiServer ? apiServer.close(r) : r()));
  await new Promise((r) => (staticServer ? staticServer.close(r) : r()));
  await breq('mongoose').disconnect();
  if (mongod) await mongod.stop();
});

async function wire(page, user = student, token = studentToken) {
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.startsWith(PROD_API)) {
      // A reload can drop a request that is still in flight — ignore that.
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
    localStorage.setItem('ews_onboarding_tour_v1_task2-template.html', '1');
    // The site-wide "today's vocabulary" nudge would sit over the buttons.
    document.addEventListener('DOMContentLoaded', () => {
      const st = document.createElement('style');
      st.textContent = '#nav-vocab-goal-nudge{display:none!important}';
      document.head.appendChild(st);
    });
  }, [token, JSON.stringify({ _id: String(user._id), username: user.username, role: user.role,
    email: user.email, plan: user.plan || 'premium', planExpiresAt: user.planExpiresAt, createdAt: user.createdAt })]);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept());
  return errors;
}

// E2E_SHOTS=<dir> saves screenshots of the key screens for a visual check.
async function shot(page, name) {
  if (process.env.E2E_SHOTS) await page.screenshot({ path: path.join(process.env.E2E_SHOTS, name + '.png'), fullPage: true });
}

const primary = (page) => page.locator('#tpl-content-area .pth-btn--primary').last();

// ① put every paragraph's sentences in order.
async function doWarmup(page) {
  await page.locator('.pth-step.is-current .pth-btn').click();
  await shot(page, '02-structure');
  await page.getByRole('button', { name: /Bắt đầu sắp xếp câu/ }).click();
  for (;;) {
    const order = await page.evaluate(() => paragraphs()[_run.p].sentences.length);
    const pool = await page.evaluate(() => _run.pool.slice());
    if (await page.locator('.pth-pool .pth-sent').count()) {
      for (let k = 0; k < order; k++) {
        // The k-th sentence of the paragraph is pool index k.
        await page.evaluate((k) => wuPick(k), k);
      }
      expect(pool.length).toBe(order);
      await page.getByRole('button', { name: /Kiểm tra/ }).click();
      await expect(page.locator('.pth-fb--good')).toBeVisible();
    }
    const last = await page.evaluate(() => _run.p + 1 >= paragraphs().length);
    await primary(page).click();
    if (last) break;
  }
  await expect(page.locator('.pth-done')).toContainText('Xong phần khung bài');
}

// ③ every stage of every paragraph.
async function doDrill(page) {
  for (let guard = 0; guard < 400; guard++) {
    const state = await page.evaluate(() => ({
      between: _run.between, finished: !!_run.finished,
      kind: _run.between ? null : _run.queue[_run.pos].kind,
    }));
    if (state.finished) {
      const allDone = await page.evaluate(() => paragraphs().every((_, i) => (prog().drillRounds[i] || 0) >= 3));
      if (allDone) break;
      await page.getByRole('button', { name: /Đoạn tiếp theo/ }).click();
      continue;
    }
    if (state.between) { await primary(page).click(); continue; }
    if (process.env.E2E_SHOTS && guard < 40) await shot(page, `04-drill-${String(guard).padStart(2, '0')}-${state.kind}`);
    if (state.kind === 'build') {
      const target = await page.evaluate(() => _build.target.slice());
      for (const t of target) {
        await page.locator('.pth-build-bank .pth-chunk', { hasText: t }).filter({ hasText: new RegExp('^\\s*' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$') }).first().click();
      }
      await expect(page.locator('.pth-build-ans.is-ok')).toBeVisible();
    } else if (state.kind === 'fade') {
      const answers = await page.evaluate(() => [..._fade.host.querySelectorAll('.pth-blank')].map((i) => _fade.toks[+i.dataset.i].core));
      const blanks = page.locator('.pth-blank');
      await expect(blanks.first()).toBeFocused(); // the page focuses it a moment after rendering
      for (let i = 0; i < answers.length; i++) await blanks.nth(i).fill(answers[i]);
      await page.getByRole('button', { name: /Kiểm tra/ }).click();
      await expect(page.locator('#pth-fade-fb .pth-fb--good')).toBeVisible();
    } else {
      // Band 6+ recall: the letter-by-letter drill — type only letters/digits.
      // Placeholders are not typed ("…" in the drill); "agree/disagree" is one word.
      const en = await page.evaluate(() => _recall.answer);
      await page.locator('.wbwd-input').click();
      await page.keyboard.type(en.replace(/[^\p{L}\p{N}]/gu, ''), { delay: 0 });
      await expect(page.locator('#pth-recall-fb .pth-fb--good')).toBeVisible();
    }
    await page.locator('#pth-next').click();
  }
}

test('Band 6+: student walks the whole path for Type 01 and progress is saved', async ({ page }) => {
  test.setTimeout(240 * 1000);
  const errors = await wire(page);
  // The teacher assigns Type 01 (Band 6+) as class homework.
  const tpl = await TemplateModel.findOne({ typeId: 'type01', level: 'band6' }).lean();
  const res = await fetch(`${apiBase}/api/classes/${classGroup._id}/assignments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${teacherToken}` },
    body: JSON.stringify({ title: 'Học template Type 01', resources: [{ kind: 'internal', resourceType: 'task2_template', resourceId: tpl._id }] }),
  });
  expect(res.status).toBe(201);
  const homeworkDone = async () => {
    const r = await fetch(`${apiBase}/api/assignments/mine`, { headers: { Authorization: `Bearer ${studentToken}` } });
    const body = await r.json();
    return body.assignments[0].resources[0].completed;
  };

  await page.goto('/task2-template.html?type=type01');
  await expect(page.locator('.pth-hw')).toContainText('Bài tập về nhà');
  await expect(page.locator('.pth-hw')).toContainText('Học xong cả 5 bước (0/5)');
  await expect(page.locator('.t2-type-tab-btn[data-tpl-type="type01"] .pth-due-badge')).toContainText('📌');

  // Overview: 5 steps, step ① open, the rest locked; old mode tabs gone.
  await expect(page.locator('.pth-step')).toHaveCount(5);
  await expect(page.locator('.pth-step.is-current')).toContainText('Khung bài');
  await expect(page.locator('.pth-step.is-locked')).toHaveCount(4);
  await expect(page.locator('.t2-mode-tab')).toHaveCount(0);
  await shot(page, '01-overview');

  await doWarmup(page);
  await primary(page).click(); // → ② Đọc & nghe
  await expect(page.locator('.pth-read-sent').first()).toBeVisible();
  await shot(page, '03-read');
  await page.getByRole('button', { name: /Tôi đã đọc xong/ }).click();
  await primary(page).click(); // → ③

  await doDrill(page);
  await expect(page.locator('.pth-between')).toContainText('Xong đoạn');
  await primary(page).click(); // → ④ (the last paragraph's card offers the next step)

  // ④ Band 6+: one paragraph at a time; type each one perfectly.
  const nParas = await page.evaluate(() => paragraphs().length);
  for (let i = 0; i < nParas; i++) {
    const text = await page.evaluate((i) => paragraphs()[i].sentences.map((s) => s.en).join(' '), i);
    await page.locator('.pth-asm-in').fill(text);
    await page.getByRole('button', { name: /Kiểm tra đoạn này/ }).click();
    await expect(page.locator('.pth-chip--ok')).toContainText('100%');
    await primary(page).click();
  }
  await expect(page.locator('.pth-score')).toContainText('100%');
  await shot(page, '05-assemble');
  expect(await homeworkDone()).toBe(false); // 100% memorised, but step ⑤ not done yet
  await primary(page).click(); // → ⑤

  // ⑤ write an essay that reuses the template frames, then compare.
  await expect(page.locator('.pth-prompt')).toContainText('Đề bài');
  const areas = page.locator('#tpl-content-area textarea');
  await expect(areas).toHaveCount(nParas);
  for (let i = 0; i < nParas; i++) {
    const text = await page.evaluate((i) => paragraphs()[i].sentences.map((s) => s.en.replace(/\([^()]*\)/g, 'online shopping')).join(' '), i);
    await areas.nth(i).fill(text + ' ' + 'Many people agree with this view in modern society today.'.repeat(2));
  }
  await page.getByRole('button', { name: /Nộp & so với bài mẫu/ }).click();
  await expect(page.locator('.pth-check li.is-ok').first()).toBeVisible();
  await expect(page.locator('.pth-model')).toContainText('Bài mẫu');
  await shot(page, '06-apply');

  // Saved on the server: every step done, mastery recorded, review scheduled.
  await expect.poll(async () => {
    const row = await Progress.findOne({ userId: student._id, level: 'band6', typeId: 'type01' }).lean();
    return row && ['warmup', 'read', 'drill', 'assemble', 'apply'].every((k) => row.steps[k]) && !!row.nextReviewAt;
  }, { timeout: 10000 }).toBe(true);
  const row = await Progress.findOne({ userId: student._id, level: 'band6', typeId: 'type01' }).lean();
  expect(row.assembleBest).toBe(100);
  expect(Object.keys(row.mastery).length).toBeGreaterThan(5);
  expect(row.applyText.length).toBe(nParas);
  const attempt = await Attempt.findOne({ userId: student._id, mode: 'path' }).lean();
  expect(attempt && attempt.correctItems).toBe(attempt && attempt.totalItems);

  // Reload: progress comes back from the server, all 5 steps done.
  await page.goto('/task2-template.html?type=type01');
  await expect(page.locator('.pth-step.is-done')).toHaveCount(5);
  await expect(page.locator('.pth-review')).toBeVisible();
  expect(await homeworkDone()).toBe(true);
  await expect(page.locator('.pth-hw.is-done')).toContainText('Đã đạt bài tập về nhà');
  await shot(page, '07-overview-done');
  await page.setViewportSize({ width: 390, height: 844 });
  await shot(page, '08-mobile-overview');
  await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'dark'); startDrill(1); });
  await shot(page, '09-mobile-dark-drill');
  expect(errors).toEqual([]);
});

test('Band 7+: free-typing recall, timed whole-essay, quick review and mock test', async ({ page }) => {
  test.setTimeout(120 * 1000);
  const errors = await wire(page);
  await page.goto('/task2-template.html?type=type02&level=band7');
  await expect(page.locator('.t2-level-btn.active')).toContainText('Band 7+');
  await expect(page.locator('.pth-step.is-current')).toContainText('Khung bài');

  // Jump to ③ for paragraph 1 (steps are unlocked by the server row).
  await Progress.create({ userId: student._id, level: 'band7', typeId: 'type02', steps: { warmup: new Date(), read: new Date() } });
  await page.reload();
  await page.locator('.pth-step.is-current .pth-btn').click();
  await expect(page.locator('.pth-stage.active')).toContainText('Ghép cụm');
  // Skip to the recall stage of paragraph 1 and check free typing.
  await page.evaluate(() => { _run.stage = 3; _drillSetupStage(); renderDrill(); });
  await expect(page.locator('.wbwd-input')).toHaveCount(0);
  const en = await page.evaluate(() => _recall.s.en);
  await page.locator('#pth-recall-in').fill(en.replace(/\([^()]*\)/g, ''));
  await page.keyboard.press('Enter');
  await expect(page.locator('#pth-recall-fb .pth-fb--good')).toBeVisible();
  await page.locator('#pth-next').click();
  // A wrong answer is graded and the sentence comes back later.
  const before = await page.evaluate(() => _run.queue.length);
  await page.locator('#pth-recall-in').fill('completely wrong words here');
  await page.keyboard.press('Enter');
  await expect(page.locator('#pth-recall-fb .pth-fb--bad')).toBeVisible();
  expect(await page.evaluate(() => _run.queue.length)).toBe(before + 1);

  // ④ Band 7+: all paragraphs on one screen with a timer.
  await page.locator('.pth-back').click();
  await page.evaluate(() => { startAssemble(); });
  await expect(page.locator('#pth-asm-time')).toBeVisible();
  const n = await page.evaluate(() => paragraphs().length);
  await expect(page.locator('.pth-asm-in')).toHaveCount(n);
  await page.locator('.pth-asm-in').first().fill('In recent years this has become a widely discussed issue');
  await page.getByRole('button', { name: /Nộp bài/ }).click();
  await expect(page.locator('.pth-score.is-bad')).toBeVisible(); // well under 70% → not passed
  expect(await page.evaluate(() => stepDone('assemble'))).toBe(false);

  // Quick review once the essay is assembled (force it due).
  await Progress.updateOne({ userId: student._id, level: 'band7', typeId: 'type02' },
    { $set: { 'steps.drill': new Date(), 'steps.assemble': new Date(), nextReviewAt: new Date(Date.now() - 1000) } });
  await page.goto('/task2-template.html?type=type02&level=band7');
  await expect(page.locator('.pth-review.is-due')).toBeVisible();
  await expect(page.locator('.t2-type-tab-btn[data-tpl-type="type02"] .pth-due-badge')).toBeVisible();
  await page.getByRole('button', { name: /Ôn ngay/ }).click();
  for (let i = 0; i < 6; i++) {
    const done = await page.evaluate(() => !!_run.finished);
    if (done) break;
    const s = await page.evaluate(() => _recall.s.en);
    await page.locator('#pth-recall-in').fill(s);
    await page.keyboard.press('Enter');
    await page.locator('#pth-next').click();
  }
  await expect(page.locator('.pth-score')).toContainText('100%');
  await expect.poll(async () => {
    const row = await Progress.findOne({ userId: student._id, level: 'band7', typeId: 'type02' }).lean();
    return row.reviewStage;
  }, { timeout: 10000 }).toBe(1);

  // Mock test: one pass over every sentence, then submit early.
  await page.locator('.pth-back').click();
  await page.locator('#tpl-exam-btn').click();
  await expect(page.locator('#pth-exam-time')).toBeVisible();
  const first = await page.evaluate(() => _recall.s.en);
  await page.locator('#pth-recall-in').fill(first);
  await page.keyboard.press('Enter');
  await page.locator('.t2-exam-exit-btn').click();
  await expect(page.locator('.pth-score')).toBeVisible();
  await expect.poll(async () => Attempt.countDocuments({ userId: student._id, isExam: true })).toBe(1);
  expect(errors).toEqual([]);
});

test('Admin: assigns Band 6+ templates on their own (level filter + pick all)', async ({ page }) => {
  test.setTimeout(90 * 1000);
  const errors = await wire(page, admin, adminToken);
  const Assignment = require(path.join(BACKEND, 'models', 'Assignment'));
  await page.goto(`/admin/#/classes/${classGroup._id}`);
  // The "missing tuition" reminder pops up for the seeded student — dismiss it.
  const later = page.getByRole('button', { name: 'Để sau' });
  await later.click({ timeout: 8000 }).catch(() => {});
  await page.getByRole('button', { name: /📚 Bài tập/ }).click();
  await page.getByRole('button', { name: '+ Tạo bài tập' }).click();
  const modal = page.locator('.modal');
  await modal.locator('input.form-input').first().fill('Template Band 6+');
  await modal.locator('fieldset select').first().selectOption('task2_template');
  // Both bands listed, the level is in every label.
  await expect(modal.getByText('Type 01 – Advantages & Disadvantages (Band 6+)')).toBeVisible();
  await expect(modal.getByText('Type 01 – Advantages & Disadvantages (Band 7+)')).toBeVisible();
  await modal.locator('select[title="Band 6+ và Band 7+ là 2 bài riêng"]').selectOption('band6');
  await expect(modal.getByText(/\(Band 7\+\)/)).toHaveCount(0);
  await shot(page, '10-admin-band-filter');
  await modal.getByRole('button', { name: /Chọn cả 2 dạng Band 6\+/ }).click();
  await modal.getByRole('button', { name: /Giao bài tập/ }).click();
  await expect.poll(async () => (await Assignment.findOne({ title: 'Template Band 6+' }).lean())?.resources?.length || 0).toBe(2);
  const asg = await Assignment.findOne({ title: 'Template Band 6+' }).lean();
  expect(asg.resources.map((r) => r.resourceCode).sort()).toEqual(['type01||band6', 'type02||band6']);
  expect(errors).toEqual([]);
});
