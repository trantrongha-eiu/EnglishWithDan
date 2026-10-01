// Preview the Listening practice list with section covers BEFORE deploy: the live site, but listening.html and
// listening-extra.css come from the local working tree and /practice/list gets `thumbnail` added from the dump
// (same transform as listeningService.toCardThumbnail). Read-only. → shots/list_p<part>.png
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const fs = require('fs'), path = require('path');
const SITE = 'https://ieltsthayha.com';
const FE = path.join(__dirname, '..', '..', '..', 'frontend');
const thumbs = new Map(JSON.parse(fs.readFileSync(path.join(__dirname, 'web', 'sections.json'), 'utf8'))
  .map(s => [String(s._id), (s.thumbnailUrl || '').replace(/(res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?!c_fill)/, '$1c_fill,g_auto,w_480,h_240,q_auto,f_auto/')]));

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.route(/\/listening\.html(\?|$)/, r => r.fulfill({ path: path.join(FE, 'listening.html'), contentType: 'text/html' }));
  await page.route(/listening-extra\.css/, r => r.fulfill({ path: path.join(FE, 'css', 'listening-extra.css'), contentType: 'text/css' }));
  await page.route('**/api/listening/practice/list**', async r => {
    const res = await r.fetch(); const j = await res.json();
    (j.sections || []).forEach(s => { s.thumbnail = thumbs.get(String(s._id)) || ''; });
    r.fulfill({ response: res, json: j });
  });
  for (const part of [1, 'actual']) {
    await page.goto(`${SITE}/listening.html?mode=single&part=${part}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.practice-card', { timeout: 30000 });
    await page.waitForTimeout(2500);
    const stat = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.practice-card')];
      const imgs = cards.map(c => c.querySelector('.practice-cover-img'));
      return { cards: cards.length, withImg: imgs.filter(Boolean).length, loaded: imgs.filter(i => i && i.complete && i.naturalWidth).length };
    });
    console.log(`part ${part}:`, stat);
    await page.screenshot({ path: path.join(__dirname, 'shots', `list_p${part}.png`) });
  }
  await browser.close();
})();
