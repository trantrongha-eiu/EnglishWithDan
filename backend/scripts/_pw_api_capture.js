// List every /api call a page makes on load (logged in as the PW test user). Read-only: non-GET aborted.
// node backend/scripts/_pw_api_capture.js /entrance-test.html /reading.html?embed=entrance ...
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const { chromium } = require('../../node_modules/playwright');
const SITE = process.env.SITE || 'https://ieltsthayha.com';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);
  const seen = new Map();
  page.on('request', (r) => {
    const u = r.url();
    if (!/\/api\//.test(u)) return;
    const k = `${r.method()} ${u.replace(/^.*?\/api/, '/api').replace(/[0-9a-f]{24}/g, ':id').replace(/\?.*$/, '')}`;
    seen.set(k, (seen.get(k) || 0) + 1);
  });
  await page.route('**/api/**', (r) => (r.request().method() === 'GET' ? r.continue() : r.abort()));
  for (const p of process.argv.slice(2)) {
    seen.clear();
    await page.goto(SITE + p);
    await page.waitForTimeout(6000);
    console.log(`\n== ${p}`);
    [...seen.keys()].sort().forEach((k) => console.log('  ', k));
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
