// Repro: double-click lookup on the listening bài-lẻ review transcript (prod site, read-only:
// every non-GET API call is aborted). node backend/scripts/_pw_dict_review.js <sectionId> <practice|simulation> [siteBase]
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const { chromium } = require('../../node_modules/playwright');
const SITE = process.argv[4] || 'https://ieltsthayha.com';
const [sectionId, mode] = process.argv.slice(2);
const SHOT = process.env.SHOT_DIR || '.';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
  page.on('pageerror', (e) => console.log('pageerror', String(e)));
  page.on('dialog', (d) => d.accept());
  if (process.env.LOCAL_LISTENING) {
    await page.route('**/listening.html*', (r) => r.fulfill({ contentType: 'text/html', body: require('fs').readFileSync(process.env.LOCAL_LISTENING, 'utf8') }));
  }
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);
  // read-only from here: block writes (except dictionary 3rd-party GETs which are GET anyway)
  await page.route('**/api/**', (r) => (r.request().method() === 'GET' ? r.continue() : (
    /practice\/start|simulation/.test(r.request().url())
      ? r.fulfill({ json: { success: true, attemptId: '000000000000000000000000' } })
      : r.fulfill({ json: { success: true } }))));
  await page.goto(`${SITE}/listening.html?sectionId=${sectionId}&exam=${mode}`);
  await page.waitForTimeout(3000);
  // exam-mode popup → pick the mode
  const skip = await page.$('text=Bỏ qua');
  if (skip) { await skip.click().catch(() => {}); await page.waitForTimeout(800); }
  const btn = await page.$(mode === 'practice' ? 'button:has-text("Bắt đầu Luyện tập")' : 'button:has-text("Simulation"), button:has-text("Bắt đầu thi")');
  console.log('mode btn', !!btn);
  if (btn) { await btn.click().catch((e) => console.log('click err', e.message)); await page.waitForTimeout(4000); }
  const skip2 = await page.$('text=Bỏ qua');
  if (skip2) { await skip2.click().catch(() => {}); await page.waitForTimeout(800); }
  await page.screenshot({ path: `${SHOT}/dict_1_${mode}.png` });
  // submit
  await page.evaluate(() => { window.confirm = () => true; });
  const ok = await page.evaluate(() => { if (typeof submitLTPractice === 'function') { submitLTPractice(); return true; } return false; });
  console.log('submit fn', ok);
  await page.waitForTimeout(3000);
  // confirm modal if any
  for (const sel of ['button:has-text("Nộp bài")', 'button:has-text("Xác nhận")', 'button:has-text("Nộp")']) {
    const b = await page.$(`.modal:not(.hidden) ${sel}, .confirm-dialog ${sel}`);
    if (b) { await b.click().catch(() => {}); await page.waitForTimeout(2000); }
  }
  const state = await page.evaluate(() => ({
    submitted: window.isLtPracticeSubmitted && window.isLtPracticeSubmitted(),
    active: window.isLtPracticeActive && window.isLtPracticeActive(),
    tool: (typeof state !== 'undefined') ? state.tool : null,
    hasTranscript: !!document.querySelector('#lt-practice-transcript-body p'),
    title: document.getElementById('lt-practice-title') && document.getElementById('lt-practice-title').textContent,
  }));
  console.log('state', JSON.stringify(state));
  if (process.env.FORCE_SIM) console.log('forced sim', await page.evaluate(() => { try { _ltPracticeMode = 'simulation'; return _ltPracticeMode; } catch (e) { return 'ERR ' + e.message; } }));
  const p = await page.$('#lt-practice-transcript-body p');
  if (p) {
    const box = await p.boundingBox();
    await page.mouse.dblclick(box.x + 30, box.y + 10);
    await page.waitForTimeout(2500);
  }
  const popup = await page.evaluate(() => {
    const el = document.getElementById('dict-popup');
    return el && { cls: el.className, word: (document.getElementById('dict-word') || {}).textContent, sel: String(window.getSelection()) };
  });
  console.log('popup', JSON.stringify(popup));
  await page.screenshot({ path: `${SHOT}/dict_2_${mode}.png` });
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
