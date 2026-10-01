// Playwright (GET only, every non-GET aborted): does /api/reading/tests list every active full test, and does the
// full-test list on reading.html show them? Screenshot: shots/tests_list.png.  Usage: node pw_tests_list.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const SITE = 'https://ieltsthayha.com';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);
  await page.route('**/api/**', r => (r.request().method() === 'GET' ? r.continue() : r.abort()));
  await page.goto(`${SITE}/reading.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const out = await page.evaluate(async () => {
    const r = await apiFetch('/api/reading/tests');
    const tests = r.tests || r.data || r;
    const names = (Array.isArray(tests) ? tests : []).map(t => t.name);
    const text = document.body.innerText;
    return { count: names.length, last: names.slice(-5), shown: ['Actual Mocktest 38', 'Actual Mocktest 76'].map(n => [n, text.includes(n)]) };
  });
  console.log(JSON.stringify(out));
  await page.screenshot({ path: require('path').join(__dirname, 'shots', 'tests_list.png'), fullPage: false });
  await browser.close();
})();
