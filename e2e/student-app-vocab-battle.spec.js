// @ts-check
/**
 * ⚔️ Đấu trường từ vựng (/app/vocab-battle) against the REAL backend
 * (in-memory MongoDB): two students in two browsers — a quiz with a stake
 * (every question kind, the host answers right, the rival wrong) and a live
 * Nối chữ game.
 *
 * Run: npm run test:e2e -- student-app-vocab-battle
 *      E2E_SHOTS=<dir> saves screenshots.
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
const SHOTS = process.env.E2E_SHOTS || '';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.webp': 'image/webp',
};
const breq = (m) => require(require.resolve(m, { paths: [BACKEND] }));
const model = (name) => require(path.join(BACKEND, 'models', name));

const WORDS = [
  ['environment', 'môi trường', 'We must protect the environment for our children.'],
  ['pollution', 'sự ô nhiễm', 'Air pollution is a serious problem in big cities.'],
  ['recycle', 'tái chế', 'Many people recycle plastic bottles every week.'],
  ['renewable energy', 'năng lượng tái tạo', 'The country invests heavily in renewable energy today.'],
  ['deforestation', 'nạn phá rừng', 'Deforestation destroys the homes of many animals.'],
  ['climate change', 'biến đổi khí hậu', 'Climate change affects farmers all over the world.'],
  ['endangered', 'bị đe dọa tuyệt chủng', 'Tigers are an endangered species in Asia.'],
  ['sustainable', 'bền vững', 'We need a sustainable plan for the future.'],
  ['habitat', 'môi trường sống', 'The forest is a natural habitat for birds.'],
  ['emission', 'khí thải', 'Every car produces some emission when it runs.'],
  ['conservation', 'sự bảo tồn', 'Wildlife conservation needs money and time.'],
  ['drought', 'hạn hán', 'The long drought killed most of the crops.'],
];

let mongod, apiServer, staticServer, apiBase, an, binh;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  test.setTimeout(240 * 1000);
  const { MongoMemoryServer } = breq('mongodb-memory-server');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri('vocab_battle_e2e');
  process.env.MONGO_URI = uri;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'e2e-jwt-secret-not-for-production';
  const mongoose = breq('mongoose');
  await mongoose.connect(uri);
  const app = require(path.join(BACKEND, 'app'));
  const users = require(path.join(BACKEND, 'tests', 'factories', 'userFactory'));
  const extra = { flameWallet: 50, flameWalletGranted: true, className: 'IELTS K1' };
  an = await users.createPremiumStudent({ username: 'e2e_an', extra: { ...extra, firstName: 'An', lastName: 'Trần' } });
  binh = await users.createPremiumStudent({ username: 'e2e_binh', extra: { ...extra, firstName: 'Bình', lastName: 'Lê' } });
  const teacher = await users.createTeacher();
  await model('VocabularyLesson').create({
    title: 'Environment', published: true, createdBy: teacher._id,
    words: WORDS.map(([word, meaning, example]) => ({ word, meaning, example, imageUrl: `${BASE}/img/big_logo.png` })),
  });
  await model('VocabUnit').create({
    unitNumber: 901, title: 'Paraphrase 1',
    words: [
      ['reluctant to trust', 'unwilling to trust'], ['basic premise', 'main idea'], ['ingrained in culture', 'deeply rooted'],
      ['a canteen for troops', 'a canteen for soldiers'], ['widely available', 'easy to find'], ['rapid growth', 'fast expansion'],
    ].map(([word, paraphrase]) => ({ type: 'paraphrase', word, paraphrase, meaning: 'nghĩa' })),
  });

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

async function open(browser, user, viewport = { width: 1280, height: 900 }) {
  const users = require(path.join(BACKEND, 'tests', 'factories', 'userFactory'));
  const page = await browser.newPage({ viewport });
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.startsWith(PROD_API)) {
      try {
        return await route.fulfill({ response: await route.fetch({ url: apiBase + url.slice(PROD_API.length) }) });
      } catch (e) {
        if (/disposed|closed|Target page/i.test(String(e && e.message))) return undefined;
        throw e;
      }
    }
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
    localStorage.setItem('wp_sound', 'off');
    // No audio device in CI
    window.speechSynthesis = { speak() {}, cancel() {}, getVoices: () => [] };
  }, [users.signTokenFor(user), JSON.stringify({ _id: String(user._id), id: String(user._id), username: user.username, role: 'student', plan: 'premium', firstName: user.firstName, createdAt: user.createdAt })]);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  if (process.env.E2E_STACK) {
    page.on('response', (r) => { if (r.status() >= 400 || /javascript/.test(r.headers()['content-type'] || '') === false && r.request().resourceType() === 'script') console.log('RESP', r.status(), r.url()); });
    page.on('console', (m) => { if (m.type() === 'error' || /WINERR/.test(m.text())) console.log('CONSOLE', m.text(), JSON.stringify(m.location())); });
    await page.addInitScript(() => window.addEventListener('error', (e) => console.log('WINERR', e.message, e.filename, e.lineno, e.colno, location.pathname)));
  }
  return { page, errors };
}

const shot = (page, name) => (SHOTS ? page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true }) : null);

// Answers whatever question is on screen — right (from the stored question) or wrong
async function answerCurrent(page, battleId, right) {
  const b = await model('VocabBattle').findById(battleId).lean();
  const me = b.players.find((p) => String(p.userId) === String(right ? an._id : binh._id));
  const q = b.questions[me.idx];
  const card = page.locator('.vb-q');
  await expect(card).toBeVisible();
  if (q.options) {
    const i = right ? q.answer : (q.answer + 1) % q.options.length;
    await card.locator('.vb-opt').nth(i).click();
  } else if (q.type === 'match') {
    for (let i = 0; i < q.left.length; i++) {
      await card.locator('.vb-match-col').first().locator('.vb-mitem').nth(i).click();
      const r = right ? q.answer[i] : q.answer[(i + 1) % q.answer.length];
      await card.locator('.vb-match-col').nth(1).locator('.vb-mitem').nth(r).click();
    }
    await card.getByRole('button', { name: 'Nộp bài' }).click();
  } else if (q.type === 'order') {
    const used = new Set();
    const order = right
      ? q.answerText.split(' ').map((tok) => { const i = q.tokens.findIndex((t, k) => t === tok && !used.has(k)); used.add(i); return i; })
      : q.tokens.map((_, i) => i).reverse();
    for (const i of order) await card.locator('.vb-bank .vb-tok').nth(i).click();
    await card.getByRole('button', { name: 'Nộp bài' }).click();
  } else {
    await card.locator('input').fill(right ? q.answer : 'zzz');
    await card.locator('input').press('Enter');
  }
  await expect(page.locator('.vb-feedback')).toBeVisible();
  if (SHOTS && right && me.idx < 8) await shot(page, `quiz-${me.idx}-${q.type}`);
  await expect(page.locator('.vb-feedback')).toHaveClass(right ? /ok/ : /bad|part/);
}

async function playRun(page, battleId, right, total) {
  await page.getByRole('button', { name: /Bắt đầu|Làm tiếp/ }).click();
  for (let i = 0; i < total; i++) {
    await expect(page.locator('.vb-run-count')).toHaveText(`Câu ${i + 1}/${total}`, { timeout: 8000 });
    await answerCurrent(page, battleId, right);
  }
}

test('quiz with a stake: create, accept, both play, the right answers win the pot', async ({ browser }) => {
  test.setTimeout(180 * 1000);
  const A = await open(browser, an);
  await A.page.goto(`${BASE}/app/vocab-battle`);
  await expect(A.page.locator('.vb-hero')).toContainText('Đấu trường từ vựng');
  await expect(A.page.locator('.vb-wallet')).toContainText('50');
  await shot(A.page, 'hub-empty');

  await expect(A.page.locator('.vb-game')).toHaveCount(10);
  await A.page.locator('.vb-game--mix').getByRole('button', { name: '⚔️ Mời bạn' }).click();
  const modal = A.page.locator('.modal-box');
  await expect(modal.locator('.vb-person')).toHaveCount(1); // the classmate
  await expect(modal.locator('.vb-person')).toContainText('Bình');
  await expect(modal.locator('.vb-tag')).toContainText('cùng lớp');
  await modal.locator('.vb-person').click();
  await modal.getByRole('button', { name: '10', exact: true }).click();
  await modal.getByRole('button', { name: '10 🔥' }).click();
  await shot(A.page, 'create');
  await modal.getByRole('button', { name: /Gửi lời thách đấu/ }).click();
  await expect(A.page).toHaveURL(/\/app\/vocab-battle\/[0-9a-f]{24}$/);
  const id = A.page.url().split('/').pop();
  const stored = await model('VocabBattle').findById(id).lean();
  expect(new Set(stored.questions.map((q) => q.type)).size).toBe(8);
  await expect(A.page.locator('.vb-board')).toContainText('chưa nhận lời');
  await shot(A.page, 'room-waiting');

  // An plays first (async), every answer right
  await playRun(A.page, id, true, 10);
  await expect(A.page.locator('.vb-panel--wait')).toContainText('Bạn đã xong');
  await expect(A.page.locator('.vb-review')).toContainText('đúng 10/10');

  // Bình sees the invite on the hub, accepts, answers everything wrong
  const B = await open(browser, binh, { width: 390, height: 844 });
  await B.page.goto(`${BASE}/app/vocab-battle`);
  await expect(B.page.locator('.vb-card--invite')).toContainText('An Trần');
  await shot(B.page, 'hub-invite-phone');
  await B.page.getByRole('button', { name: /Nhận lời \(10 🔥\)/ }).click();
  await expect(B.page).toHaveURL(new RegExp(`${id}$`));
  await playRun(B.page, id, false, 10);
  await expect(B.page.locator('.vb-result')).toContainText('Trận đấu kết thúc');
  await shot(B.page, 'result-lose-phone');

  // An's room flips to the win (poll)
  await expect(A.page.locator('.vb-result')).toContainText('Bạn thắng rồi', { timeout: 10000 });
  await expect(A.page.locator('.vb-result')).toContainText('20 🔥');
  await shot(A.page, 'result-win');
  expect((await model('User').findById(an._id).lean()).flameWallet).toBe(60);
  expect((await model('User').findById(binh._id).lean()).flameWallet).toBe(40);

  // Save the missed words to a book
  const saveBtn = B.page.getByRole('button', { name: '📒 Lưu vào sổ' });
  await expect(saveBtn).toBeEnabled();
  await saveBtn.click();
  await expect.poll(async () => {
    const books = await model('VocabBook').find({ userId: binh._id }).lean();
    return books.reduce((n, bk) => n + bk.words.length, 0);
  }).toBeGreaterThan(5);

  expect(A.errors).toEqual([]);
  expect(B.errors).toEqual([]);
  await A.page.close();
  await B.page.close();
});

test('Nối chữ: lobby, start, words in turn, a bad word is refused', async ({ browser }) => {
  test.setTimeout(120 * 1000);
  const A = await open(browser, an);
  await A.page.goto(`${BASE}/app/vocab-battle`);
  await A.page.locator('.vb-game--chain').getByRole('button', { name: '⚔️ Mời bạn' }).click();
  const modal = A.page.locator('.modal-box');
  await modal.locator('.vb-person').click();
  await modal.getByRole('button', { name: '30s' }).click();
  await modal.getByRole('button', { name: /Gửi lời thách đấu/ }).click();
  await expect(A.page.locator('.vb-lobby')).toBeVisible();
  const id = A.page.url().split('/').pop();
  await expect(A.page.getByRole('button', { name: /Bắt đầu \(1 người\)/ })).toBeDisabled();

  const B = await open(browser, binh);
  await B.page.goto(`${BASE}/app/vocab-battle/${id}`);
  await B.page.getByRole('button', { name: 'Vào phòng' }).click();
  await expect(B.page.locator('.vb-lobby')).toContainText('Đợi chủ phòng');
  await expect(A.page.getByRole('button', { name: /Bắt đầu \(2 người\)/ })).toBeEnabled({ timeout: 8000 });
  await shot(A.page, 'chain-lobby');
  await A.page.getByRole('button', { name: /Bắt đầu/ }).click();

  const bank = require(path.join(BACKEND, 'services', 'vocabBattleBank'));
  const dict = [...bank._internal.englishWords()];
  const used = new Set();
  const wordFor = (letter) => { const w = dict.find((x) => x[0] === letter && x.length >= 5 && !used.has(x)); used.add(w); return w; };

  await expect(A.page.locator('.vb-chain-turn')).toContainText('Lượt của bạn');
  let letter = (await A.page.locator('.vb-chain-letter b').textContent()).trim().toLowerCase();
  await A.page.locator('.vb-chain-stage input').fill('zzqx');
  await A.page.locator('.vb-chain-stage input').press('Enter');
  await expect(A.page.locator('.vb-chain-stage .vb-form-err')).toBeVisible();
  const w1 = wordFor(letter);
  await A.page.locator('.vb-chain-stage input').fill(w1);
  await A.page.locator('.vb-chain-stage input').press('Enter');
  await expect(A.page.locator('.vb-chain-turn')).toContainText('Lượt của Bình');

  await expect(B.page.locator('.vb-chain-turn')).toContainText('Lượt của bạn', { timeout: 8000 });
  letter = w1.slice(-1);
  const w2 = wordFor(letter);
  await B.page.locator('.vb-chain-stage input').fill(w2);
  await B.page.locator('.vb-chain-stage input').press('Enter');
  await expect(B.page.locator('.vb-chain-words')).toContainText(w2);
  await expect(A.page.locator('.vb-chain-words')).toContainText(w2, { timeout: 8000 });
  await shot(A.page, 'chain-playing');

  expect(A.errors).toEqual([]);
  expect(B.errors).toEqual([]);
  await A.page.close();
  await B.page.close();
});

test('chơi một mình: a quiz starts straight away and sets a record; Nối chữ alone is vs Lulu 🤖', async ({ browser }) => {
  test.setTimeout(120 * 1000);
  const A = await open(browser, an, { width: 390, height: 844 });
  await A.page.goto(`${BASE}/app/vocab-battle`);
  await shot(A.page, 'hub-games-phone');
  await A.page.locator('.vb-game--antonym').getByRole('button', { name: '🎯 Chơi một mình' }).click();
  const modal = A.page.locator('.modal-box');
  await expect(modal.locator('.vb-person')).toHaveCount(0); // no opponents, no stake
  await modal.getByRole('button', { name: '5', exact: true }).click();
  await shot(A.page, 'solo-create-phone');
  await modal.getByRole('button', { name: '🎯 Bắt đầu chơi' }).click();
  await expect(A.page).toHaveURL(/\/app\/vocab-battle\/[0-9a-f]{24}$/);
  const id = A.page.url().split('/').pop();
  for (let i = 0; i < 5; i++) {
    await expect(A.page.locator('.vb-run-count')).toHaveText(`Câu ${i + 1}/5`, { timeout: 8000 });
    await answerCurrent(A.page, id, true);
  }
  await expect(A.page.locator('.vb-result')).toContainText('đúng 5/5');
  await expect(A.page.locator('.vb-result')).toContainText('Kỷ lục đầu tiên');
  await shot(A.page, 'solo-result-phone');
  await A.page.getByRole('button', { name: '🔁 Chơi lại' }).click();
  await expect(A.page.locator('.vb-run-count')).toHaveText('Câu 1/5', { timeout: 8000 });
  await A.page.goto(`${BASE}/app/vocab-battle`);
  await expect(A.page.locator('.vb-game--antonym .vb-game-best')).toContainText('Kỷ lục');

  await A.page.locator('.vb-game--chain').getByRole('button', { name: '🎯 Chơi một mình' }).click();
  await A.page.locator('.modal-box').getByRole('button', { name: '🤖 Đấu với Lulu' }).click();
  await expect(A.page.locator('.vb-chain-turn')).toContainText('Lượt của bạn');
  const letter = (await A.page.locator('.vb-chain-letter b').textContent()).trim().toLowerCase();
  const bank = require(path.join(BACKEND, 'services', 'vocabBattleBank'));
  const w1 = [...bank._internal.englishWords()].find((x) => x[0] === letter && x.length >= 5);
  await A.page.locator('.vb-chain-stage input').fill(w1);
  await A.page.locator('.vb-chain-stage input').press('Enter');
  await expect(A.page.locator('.vb-chain-turn')).toContainText('Lulu');
  // Lulu answers on its own (or misses) and the turn comes back
  await expect(A.page.locator('.vb-chain-turn')).toContainText('Lượt của bạn', { timeout: 10000 });
  await expect(A.page.locator('.vb-chain-words .vb-cw')).toHaveCount(3);
  await shot(A.page, 'solo-chain-phone');
  expect(A.errors).toEqual([]);
  await A.page.close();
});

test('🏆 BXH Đấu trường: hero stats, both boards, ⚔️ from a row pre-picks the rival', async ({ browser }) => {
  test.setTimeout(90 * 1000);
  const A = await open(browser, an, { width: 390, height: 844 });
  await A.page.goto(`${BASE}/app/vocab-battle`);
  // An won the staked quiz vs Bình (test 1): 1 counted win, #1 this week
  await expect(A.page.locator('.vb-hero-stats')).toContainText('1');
  await expect(A.page.locator('.vb-hero-stats')).toContainText('#1');
  await A.page.locator('.vb-tabs').getByRole('tab', { name: /Bảng xếp hạng/ }).click();
  await expect(A.page).toHaveURL(/tab=rank/);
  const rows = A.page.locator('.vb-rank-row');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText('(bạn)');
  await expect(rows.nth(0)).toContainText('🏆 1');
  await expect(A.page.locator('.vb-rivals')).toContainText('1 thắng');
  await shot(A.page, 'rank-pvp-phone');

  // 🎯 Kỷ lục: An's Trái nghĩa record (test 3)
  await A.page.getByRole('tab', { name: /Kỷ lục một mình/ }).click();
  await A.page.locator('.vb-rank-games').getByRole('button', { name: /Trái nghĩa/ }).click();
  await expect(A.page.locator('.vb-rank-row')).toHaveCount(1);
  await expect(A.page.locator('.vb-rank-row')).toContainText('⭐');
  await shot(A.page, 'rank-solo-phone');

  // ⚔️ on Bình's row → the games, Bình already picked in the modal
  await A.page.getByRole('tab', { name: /Vua thách đấu/ }).click();
  // the site's daily-goal card (a student closes it) sits over the rows on a phone
  await A.page.evaluate(() => document.getElementById('nav-vocab-goal-nudge')?.remove());
  const duel = A.page.locator('.vb-rank-row').nth(1).locator('.vb-rank-duel');
  await duel.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await duel.click();
  await expect(A.page.locator('.vb-target')).toContainText('Bình');
  await A.page.locator('.vb-game--meaning').getByRole('button', { name: /Thách/ }).click();
  await expect(A.page.locator('.modal-box .vb-picked')).toContainText('Bình');
  await shot(A.page, 'rank-challenge-phone');
  expect(A.errors).toEqual([]);
  await A.page.close();
});
