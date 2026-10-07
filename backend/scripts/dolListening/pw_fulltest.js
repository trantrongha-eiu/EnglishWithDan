// Check full tests built by build_full_tests.js (hidden or live): server-side grading with the key gives
// 40/40 (listeningService.gradeQuestionGroups), audio URL answers, and the real listening.html exam screen
// renders an answer control for every question of all 4 parts with images loaded. /start is answered
// from the DB doc (same public shape as listeningService.startTest), /submit is aborted — nothing written.
//   node pw_fulltest.js "<test name>" …        screenshots → web/shots/full_<n>_p<k>.png
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');
const ListeningTest = require('../../models/ListeningTest');
const { gradeQuestionGroups } = require('../../services/listeningService');
const SITE = 'https://ieltsthayha.com';
const W = f => path.join(__dirname, 'web', f);
const names = process.argv.slice(2);

const publicShape = t => ({
  _id: String(t._id), attemptId: null, name: t.name, audioUrl: t.audioUrl, audioDuration: t.audioDuration, mode: 'practice',
  sections: t.sections.map(s => ({
    partNumber: s.partNumber, title: s.title, description: s.description, questionRange: s.questionRange,
    questionGroups: s.questionGroups.map(g => ({
      ...g, questions: g.questions.map(({ correctAnswer, explanation, ...q }) => q), // eslint-disable-line no-unused-vars
    })),
  })),
});

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const tests = await ListeningTest.find({ name: { $in: names } }).lean();
  await mongoose.disconnect();
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);
  let cur = null;
  await page.route('**/api/listening/tests/*/start*', r => r.fulfill({ json: { success: true, test: cur } }));
  await page.route('**/api/listening/tests/*/submit', r => r.abort());

  for (const name of names) {
    const t = tests.find(x => x.name === name);
    if (!t) { console.log(`✗ ${name}: not found`); continue; }
    errors.length = 0;
    const problems = [];
    // 1. grading with the key
    const key = {};
    t.sections.forEach(s => s.questionGroups.forEach(g => g.questions.forEach(q => { key[q.questionNumber] = String(q.correctAnswer).split('/')[0]; })));
    // "Choose TWO" clusters are submitted as one JSON letter-set on every question of the cluster (as the page does)
    t.sections.forEach(s => s.questionGroups.forEach(g => {
      const clusters = [];
      for (const q of g.questions) {
        if (q.type !== 'multi-answer-group') continue;
        const c = clusters[clusters.length - 1];
        if (c && JSON.stringify(c[0].options) === JSON.stringify(q.options) && c[c.length - 1].questionNumber === q.questionNumber - 1) c.push(q); else clusters.push([q]);
      }
      for (const c of clusters) { const set = JSON.stringify(c.map(q => q.correctAnswer)); c.forEach(q => { key[q.questionNumber] = set; }); }
    }));
    const g = gradeQuestionGroups(t.sections.flatMap(s => s.questionGroups), n => key[n] || '');
    if (g.correct !== 40) problems.push(`grade ${g.correct}/40`);
    // 2. audio
    const a = await fetch(t.audioUrl, { method: 'HEAD' });
    if (a.status !== 200) problems.push(`audio ${a.status}`);
    // 3. exam screen
    cur = publicShape(t);
    try {
      // let the page finish its own list render first — otherwise it switches back to the list after we start
      await page.goto(`${SITE}/listening.html`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => typeof startTest === 'function', null, { timeout: 30000 });
      await page.locator('text=Bỏ qua').first().click({ timeout: 3000 }).catch(() => {});
      await page.evaluate(id => startTest(id, 'practice'), String(t._id));
      await page.waitForSelector('#screen-exam.active .question-group', { timeout: 30000 });
      await page.evaluate(() => { const o = document.getElementById('audio-start-overlay'); if (o) o.classList.add('hidden'); });
      const seen = new Set();
      for (let p = 0; p < 4; p++) {
        await page.evaluate(i => renderPartQuestions(i), p);
        const wantImg = t.sections[p].questionGroups.some(g => g.imageUrl);
        await page.waitForTimeout(500);
        for (const img of await page.$$('.question-group img')) { await img.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(250); }
        await page.waitForFunction(() => [...document.querySelectorAll('.question-group img')].every(i => i.complete), null, { timeout: 15000 }).catch(() => {});
        const r = await page.evaluate(() => {
          const nums = new Set();
          document.querySelectorAll('[data-qnum]').forEach(e => nums.add(+e.dataset.qnum));
          document.querySelectorAll('[data-cluster]').forEach(e => nums.add(+e.dataset.cluster));
          document.querySelectorAll('[onclick*="toggleMultiAnswer"]').forEach(e => { const m = e.getAttribute('onclick').match(/toggleMultiAnswer\((\d+),\s*'\w',\s*(\d+),\s*(\d+)/); if (m) for (let n = +m[1]; n <= +m[3]; n++) nums.add(n); });
          document.querySelectorAll('input[id^="fi-"]').forEach(e => nums.add(+e.id.slice(3)));
          return { nums: [...nums], imgs: [...document.querySelectorAll('.question-group img')].filter(i => i.offsetParent).map(i => i.naturalWidth), raw: [...document.querySelectorAll('.question-group')].map(x => x.innerText).join('\n') };
        });
        r.nums.forEach(n => seen.add(n));
        if (r.imgs.some(w => !w)) problems.push(`P${p + 1} broken image`);
        if (wantImg && !r.imgs.some(w => w > 0)) problems.push(`P${p + 1} map image not shown`);
        if (/__Q\d+__|\bundefined\b/.test(r.raw)) problems.push(`P${p + 1} raw placeholder/undefined`);
        await page.screenshot({ path: W(`shots/full_${name.replace(/\W+/g, '_')}_p${p + 1}.png`) });
      }
      const missing = []; for (let n = 1; n <= 40; n++) if (!seen.has(n)) missing.push(n);
      if (missing.length) problems.push('no control for Q' + missing.join(','));
      const src = await page.evaluate(() => document.querySelector('audio') && document.querySelector('audio').src);
      if (src !== t.audioUrl) problems.push('audio not loaded in player');
    } catch (e) { problems.push('ERR ' + e.message.split('\n')[0]); }
    if (errors.length) problems.push('page errors: ' + errors.slice(0, 2).join(' | '));
    console.log(`${problems.length ? '✗' : '✓'} ${name} (${t.isActive ? 'live' : 'hidden'}) grade ${g.correct}/40${problems.length ? '\n   ' + problems.join('\n   ') : ''}`);
  }
  await browser.close();
})();
