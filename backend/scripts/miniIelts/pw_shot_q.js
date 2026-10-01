// Playwright (GET only): open a passage in practice mode and screenshot the question panel around question N.
// Usage: node pw_shot_q.js <passageId> <questionNumber> <out.png>
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const SITE = 'https://ieltsthayha.com';
const [id, n, out] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);
  await page.route('**/api/**', r => (r.request().method() === 'GET' ? r.continue() : r.abort()));
  await page.goto(`${SITE}/reading.html?passageId=${id}&exam=practice`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.questions-inner .question-group', { timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.evaluate(n => {
    const el = [...document.querySelectorAll('#retry-questions-inner *')].find(e => e.children.length === 0 && new RegExp(`^\\s*${n}\\s*$`).test(e.textContent));
    (el || document.body).scrollIntoView({ block: 'start' });
  }, n);
  await page.waitForTimeout(800);
  await page.screenshot({ path: out });
  await browser.close();
})();
