/* global document, innerWidth */
// Preview the Writing Task 2 prompt list with covers BEFORE deploy: the live writing page, but writing.js and
// writing.css come from the local working tree and /api/writing/practice/tasks gets `thumbnail` added from the DB
// (same transform as listPracticeTasks). Read-only. → shots/list.png (+ list_dark.png, list_mobile.png)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const path = require('path');
const mongoose = require('mongoose');
const { toCardThumbnail } = require('../../utils/cardThumbnail');
const SITE = 'https://ieltsthayha.com';
const FE = path.join(__dirname, '..', '..', '..', 'frontend');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const thumbs = new Map((await require('../../models/WritingTask2').find({}).select('thumbnailUrl').lean())
    .map(t => [String(t._id), toCardThumbnail(t.thumbnailUrl)]));
  await mongoose.disconnect();
  const browser = await chromium.launch();
  for (const [name, vp, theme] of [['list', { width: 1500, height: 1000 }, 'light'], ['list_dark', { width: 1500, height: 1000 }, 'dark'], ['list_mobile', { width: 390, height: 900 }, 'light']]) {
    const ctx = await browser.newContext({ viewport: vp, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    await page.goto(`${SITE}/login.html`);
    await page.fill('#email', process.env.PW_TEST_USER);
    await page.fill('#password', process.env.PW_TEST_PASS);
    await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
    await page.route(/\/js\/writing\.js/, r => r.fulfill({ path: path.join(FE, 'js', 'writing.js'), contentType: 'application/javascript' }));
    await page.route(/\/writing\.css/, r => r.fulfill({ path: path.join(FE, 'writing.css'), contentType: 'text/css' }));
    await page.route('**/api/writing/practice/tasks**', async r => {
      const res = await r.fetch(); const j = await res.json();
      (j.tasks || []).forEach(t => { t.thumbnail = thumbs.get(String(t._id)) || ''; });
      r.fulfill({ response: res, json: j });
    });
    await page.addInitScript(t => { try { localStorage.setItem('theme', t); } catch { /* private mode */ } }, theme);
    await page.goto(`${SITE}/writing.html?taskType=2`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.wt-task-card--cover', { timeout: 30000 });
    await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    await page.waitForTimeout(3500);
    const stat = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('.wt-task-card-cover img')];
      return { cards: document.querySelectorAll('.wt-task-card--cover').length, imgs: imgs.length, loaded: imgs.filter(i => i.complete && i.naturalWidth).length, hscroll: document.documentElement.scrollWidth > innerWidth };
    });
    console.log(name, stat);
    await page.screenshot({ path: path.join(__dirname, 'shots', `${name}.png`) });
    await ctx.close();
  }
  await browser.close();
})();
