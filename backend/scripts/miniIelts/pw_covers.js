// Playwright check of the Reading practice-list covers on the live site (GET only, nothing saved).
// For each category: counts `thumbnail` in /api/reading/practice/list, opens the list page,
// checks every card image actually loads, and screenshots the list → shots/covers_list_<cat>.png
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const path = require('path');
const SITE = 'https://ieltsthayha.com';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();
  await page.route('**/api/**', r => (r.request().method() === 'GET' || /\/auth\/login/.test(r.request().url()) ? r.continue() : r.abort()));
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);

  let total = 0, withThumb = 0;
  for (const cat of ['passage1', 'passage2', 'passage3']) {
    await page.goto(`${SITE}/reading.html?mode=single&category=${cat}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.practice-card:not(.practice-card-sk)', { timeout: 30000 });
    const api = await page.evaluate(async c => {
      const r = await apiFetch(`/api/reading/practice/list?category=${c}`);
      return (r.passages || []).map(p => ({ title: p.title, thumbnail: p.thumbnail }));
    }, cat);
    const missing = api.filter(p => !p.thumbnail).map(p => p.title);
    total += api.length; withThumb += api.length - missing.length;
    // scroll through so lazy images load, then check every rendered cover
    for (let y = 0; y < 30; y++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(150); }
    await page.waitForTimeout(2500);
    const imgs = await page.evaluate(() => [...document.querySelectorAll('.practice-card')].map(c => {
      const img = c.querySelector('.practice-cover-img');
      return { title: c.querySelector('.practice-card-title')?.textContent, has: !!img, ok: !!img && img.complete && img.naturalWidth > 0 };
    }));
    const broken = imgs.filter(i => i.has && !i.ok).map(i => i.title);
    console.log(`${cat}: API ${api.length - missing.length}/${api.length} with thumbnail; page cards ${imgs.length}, images loaded ${imgs.filter(i => i.ok).length}${broken.length ? `, BROKEN: ${broken.join(' | ')}` : ''}`);
    if (missing.length) console.log(`   no cover (logo): ${missing.join(' | ')}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(__dirname, 'shots', `covers_list_${cat}.png`), fullPage: false });
  }
  console.log(`\nTOTAL ${withThumb}/${total} passages with a cover`);
  await browser.close();
})();
