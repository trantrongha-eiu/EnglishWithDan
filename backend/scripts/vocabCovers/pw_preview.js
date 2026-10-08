/* global document, innerWidth */
// Preview the Vocab Topics grid with covers BEFORE deploy: the live dashboard, but dashboard-browse.js and
// dashboard.css come from the local working tree and /api/vocabulary-lessons gets `thumbnail` added from the DB
// (same transform as listPublicLessons). Read-only. → shots/topics.png (+ topics_dark.png, topics_mobile.png)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const path = require('path');
const mongoose = require('mongoose');
const { toCardThumbnail } = require('../../utils/cardThumbnail');
const SITE = 'https://ieltsthayha.com';
const FE = path.join(__dirname, '..', '..', '..', 'frontend');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const thumbs = new Map((await mongoose.connection.collection('vocabularylessons').find({}).project({ thumbnailUrl: 1 }).toArray())
    .map(l => [String(l._id), toCardThumbnail(l.thumbnailUrl)]));
  await mongoose.disconnect();
  const browser = await chromium.launch();
  for (const [name, vp, theme] of [['topics', { width: 1500, height: 1000 }, 'light'], ['topics_dark', { width: 1500, height: 1000 }, 'dark'], ['topics_mobile', { width: 390, height: 900 }, 'light']]) {
    const ctx = await browser.newContext({ viewport: vp, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    await page.goto(`${SITE}/login.html`);
    await page.fill('#email', process.env.PW_TEST_USER);
    await page.fill('#password', process.env.PW_TEST_PASS);
    await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
    await page.route(/dashboard-browse\.js/, r => r.fulfill({ path: path.join(FE, 'js', 'dashboard-browse.js'), contentType: 'application/javascript' }));
    await page.route(/css\/dashboard\.css/, r => r.fulfill({ path: path.join(FE, 'css', 'dashboard.css'), contentType: 'text/css' }));
    await page.route(/\/api\/vocabulary-lessons(\?|$)/, async r => {
      const res = await r.fetch(); const j = await res.json();
      (j.lessons || []).forEach(l => { l.thumbnail = thumbs.get(String(l._id)) || ''; });
      r.fulfill({ response: res, json: j });
    });
    await page.goto(`${SITE}/dashboard.html`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(t => { try { localStorage.setItem('theme', t); } catch { /* private mode */ } document.documentElement.setAttribute('data-theme', t); }, theme);
    await page.waitForTimeout(2500);
    await page.evaluate(() => document.getElementById('practiceTabVocab')?.click());
    await page.waitForSelector('.pb-card--cover', { timeout: 30000 });
    await page.evaluate(() => document.querySelector('.pb-group:last-child')?.scrollIntoView());
    await page.waitForTimeout(3000);
    const stat = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('.pb-card-cover img')];
      return { cards: document.querySelectorAll('.pb-card--cover').length, imgs: imgs.length, loaded: imgs.filter(i => i.complete && i.naturalWidth).length, hscroll: document.documentElement.scrollWidth > innerWidth };
    });
    console.log(name, stat);
    await page.screenshot({ path: path.join(__dirname, 'shots', `${name}.png`) });
    await ctx.close();
  }
  await browser.close();
})();
