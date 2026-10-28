// Repro: double-click lookup on the listening bài-lẻ review transcript (prod site, read-only:
// every non-GET API call is stubbed). node backend/scripts/_pw_dict_review.js <sectionId> <practice|simulation> [siteBase]
// Env: LOCAL_FE=1 (test this checkout's frontend), ESC=1 (press Esc before the double-click).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const { chromium } = require('../../node_modules/playwright');
const SITE = process.argv[4] || 'https://ieltsthayha.com';
const [sectionId, mode] = process.argv.slice(2);
const SHOT = process.env.SHOT_DIR || '.';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({
    viewport: { width: 1400, height: 900 },
    // the API's bot guard 403s HeadlessChrome/Playwright user agents
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  })).newPage();
  page.on('pageerror', (e) => console.log('pageerror', String(e)));
  page.on('dialog', (d) => d.accept());
  // LOCAL_FE=1: serve listening.html + js/css from this checkout instead of prod
  if (process.env.LOCAL_FE) {
    const fs = require('fs');
    const root = require('path').join(__dirname, '..', '..', 'frontend');
    await page.route(/\/(listening\.html|js\/[^?]*\.js|css\/[^?]*\.css)/, (r) => {
      const p = new URL(r.request().url()).pathname;
      const f = root + p;
      if (!fs.existsSync(f)) return r.continue();
      const type = p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : 'application/javascript';
      return r.fulfill({ contentType: type, body: fs.readFileSync(f, 'utf8') });
    });
  }
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);
  // skip the first-visit page tour (its tip box sits above the book picker)
  await page.evaluate(() => localStorage.setItem('ews_onboarding_tour_v1_listening.html', '1'));
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
  // dismiss the first-visit page tour + post-submit reminder so they don't eat the click
  for (let i = 0; i < 4; i++) {
    const s = await page.$('text=Bỏ qua');
    if (s && await s.isVisible()) { await s.click().catch(() => {}); await page.waitForTimeout(500); }
  }
  await page.evaluate(() => window.closePostSubmitReminder && window.closePostSubmitReminder());
  await page.waitForTimeout(500);
  // ESC=1: Esc switches the Tra từ tool off — lookup must still work on the review
  if (process.env.ESC) { await page.keyboard.press('Escape'); await page.waitForTimeout(300); }
  const p = await page.$('#lt-practice-transcript-body p');
  if (p) {
    const box = await p.boundingBox();
    console.log('under click', await page.evaluate(([x, y]) => {
      const el = document.elementFromPoint(x, y);
      return el && (el.tagName + '#' + el.id + '.' + el.className);
    }, [box.x + 30, box.y + 10]));
    await page.mouse.dblclick(box.x + 30, box.y + 10);
    await page.waitForTimeout(2500);
  }
  const popup = await page.evaluate(() => {
    const el = document.getElementById('dict-popup');
    return el && { cls: el.className, word: (document.getElementById('dict-word') || {}).textContent, sel: String(window.getSelection()) };
  });
  console.log('popup', JSON.stringify(popup));
  await page.screenshot({ path: `${SHOT}/dict_2_${mode}.png` });
  // "Lưu từ" → book picker → pick the first book (the POST is stubbed above)
  await page.waitForTimeout(3000); // popup re-renders as each dictionary source lands
  const saveBtn = await page.$('#dict-popup:not(.hidden) .dict-save-btn');
  if (saveBtn) {
    await saveBtn.click().catch((e) => console.log('save click err', e.message.split('\n')[0]));
    await page.waitForTimeout(2500);
    const picker = await page.evaluate(() => {
      const m = document.getElementById('dict-vocab-modal');
      if (!m) return null;
      const r = m.getBoundingClientRect();
      const item = m.querySelector('.vb-pick-item');
      const ir = item && item.getBoundingClientRect();
      const top = ir && document.elementFromPoint(ir.x + ir.width / 2, ir.y + ir.height / 2);
      return {
        cls: m.className, display: getComputedStyle(m).display, z: getComputedStyle(m).zIndex,
        parent: m.parentElement && m.parentElement.id, size: [r.width, r.height],
        list: (document.getElementById('dict-vocab-book-list') || {}).textContent?.slice(0, 120),
        itemOnTop: top ? (item.contains(top) ? 'yes' : top.tagName + '#' + top.id + '.' + top.className) : null,
      };
    });
    console.log('picker', JSON.stringify(picker));
    await page.screenshot({ path: `${SHOT}/dict_3_${mode}.png` });
    const item = await page.$('#dict-vocab-modal .vb-pick-item');
    if (item) {
      await item.click().catch((e) => console.log('pick click err', e.message.split('\n')[0]));
      await page.waitForTimeout(1500);
      console.log('after pick', await page.evaluate(() => ({
        modal: document.getElementById('dict-vocab-modal').className,
        toast: Array.from(document.querySelectorAll('[class*=toast]')).map((t) => t.textContent.trim()).filter(Boolean).slice(-2),
      })));
    }
  } else console.log('no save button');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
