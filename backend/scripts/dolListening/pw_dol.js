// Playwright check of DOL drafts in the real listening.html practice screen (live site, teacher "test").
// Nothing is written: /practice/by-id and /practice/answer-key are answered from the local draft,
// /practice/save is aborted. Per section: every question has an answer control, then the correct
// answers are entered (through the page's own handlers) and the page must grade 10/10.
//   node pw_dol.js <dolId …>        screenshots → web/shots/<id>.png
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const fs = require('fs'), path = require('path');
const SITE = 'https://ieltsthayha.com';
const W = f => path.join(__dirname, 'web', f);
fs.mkdirSync(W('shots'), { recursive: true });
const ids = process.argv.slice(2);
// LIVE=1: use the imported DB sections through the real API (must be active), no route stubs
const LIVE = !!process.env.LIVE;
const imported = LIVE ? JSON.parse(fs.readFileSync(W('imported.json'), 'utf8')) : {};

const strip = o => Array.isArray(o) ? o.map(strip) : (o && typeof o === 'object')
  ? Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [k, strip(v)])) : o;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);

  let cur = null;
  if (!LIVE) await page.route('**/api/listening/practice/by-id/**', r => r.fulfill({ json: { success: true, section: cur.pub } }));
  if (!LIVE) await page.route('**/api/listening/practice/answer-key/**', r => {
    const k = {};
    cur.draft.questionGroups.forEach(g => g.questions.forEach(q => { k[q.questionNumber] = { correctAnswer: q.correctAnswer, explanation: q.explanation || '' }; }));
    r.fulfill({ json: { success: true, answerKey: k } });
  });
  await page.route('**/api/listening/practice/save', r => r.fulfill({ json: { success: true, attemptId: null } }));
  await page.route('**/api/listening/practice/start-simulation', r => r.abort());
  await page.route('**/__dolmap/**', r => r.fulfill({ path: W('maps/' + r.request().url().split('/__dolmap/')[1]) }));

  const results = [];
  for (const id of ids) {
    errors.length = 0;
    const draft = JSON.parse(fs.readFileSync(W(`draft/${id}.json`), 'utf8'));
    draft.questionGroups.forEach((g, gi) => {
      if (!g._mapSource) return;
      const png = `${id}_${gi}.png`;
      if (!fs.existsSync(W('maps/' + png))) require('child_process').execFileSync('py', [path.join(__dirname, 'dol_mapimg.py'), W(`draft/${id}.json`), String(gi), W('maps/' + png)]);
      g.imageUrl = 'data:image/png;base64,' + fs.readFileSync(W('maps/' + png)).toString('base64');
    });
    const pub = strip(draft);
    pub._id = LIVE ? imported[id] : '000000000000000000000000'.slice(0, 24 - id.length) + id;
    pub.audioUrl = draft._audio;
    pub.questionGroups.forEach(g => g.questions.forEach(q => { q.correctAnswer = ''; q.explanation = ''; }));
    cur = { draft, pub };
    const r = { id, title: draft.title, problems: [] };
    try {
      await page.goto(`${SITE}/listening.html?sectionId=${pub._id}&part=${draft.partNumber}&exam=practice`, { waitUntil: 'domcontentloaded' });
      // exam-mode popup → "Luyện tập"
      const btn = page.locator('.ems-option, [data-mode="practice"], button:has-text("Luyện tập")').first();
      await btn.waitFor({ timeout: 15000 }).then(() => btn.click()).catch(() => {});
      await page.waitForSelector('.question-group', { timeout: 30000 });
      await page.waitForTimeout(600);
      const { start, end } = draft.questionRange;
      for (const img of await page.$$('.question-group img')) { await img.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); }
      await page.waitForFunction(() => [...document.querySelectorAll('.question-group img')].every(i => i.complete), null, { timeout: 15000 }).catch(() => {});
      const seen = await page.evaluate(() => {
        const nums = new Set();
        document.querySelectorAll('[data-qnum]').forEach(e => nums.add(+e.dataset.qnum));
        document.querySelectorAll('[data-cluster]').forEach(e => nums.add(+e.dataset.cluster));
        document.querySelectorAll('[onclick*="toggleMultiAnswer"]').forEach(e => { const m = e.getAttribute('onclick').match(/toggleMultiAnswer\((\d+),\s*'\w',\s*(\d+),\s*(\d+)/); if (m) for (let n = +m[1]; n <= +m[3]; n++) nums.add(n); });
        document.querySelectorAll('input[id^="fi-"]').forEach(e => nums.add(+e.id.slice(3)));
        const imgs = [...document.querySelectorAll('.question-group img')].map(i => i.naturalWidth);
        return { nums: [...nums], imgs, raw: [...document.querySelectorAll('.question-group')].map(g => g.innerText).join('\n') };
      });
      const missing = [];
      for (let n = start; n <= end; n++) if (!seen.nums.includes(n)) missing.push(n);
      if (missing.length) r.problems.push('no control for Q' + missing.join(','));
      if (seen.imgs.some(w => !w)) r.problems.push('broken image');
      if (/__Q\d+__|\[Q\d+\]|undefined|null/.test(seen.raw)) r.problems.push('raw placeholder/undefined in text');
      await page.screenshot({ path: W(`shots/${id}.png`), fullPage: false });
      // enter the key through the page's handlers
      await page.evaluate(groups => {
        for (const g of groups) {
          // consecutive multi-answer questions with the same options form one cluster (as rendered)
          const clusters = [];
          for (const q of g.questions) {
            if (q.type !== 'multi-answer-group') continue;
            const c = clusters[clusters.length - 1];
            if (c && JSON.stringify(c[0].options) === JSON.stringify(q.options) && c[c.length - 1].questionNumber === q.questionNumber - 1) c.push(q);
            else clusters.push([q]);
          }
          for (const c of clusters) {
            const first = c[0].questionNumber, last = c[c.length - 1].questionNumber;
            c.forEach(q => toggleMultiAnswer(first, q.correctAnswer, c.length, last));
          }
          for (const q of g.questions) {
            if (q.type === 'multi-answer-group') continue;
            const v = q.correctAnswer.split('/')[0];
            if (q.type === 'multiple-choice') pickRadio(q.questionNumber, v);
            else { state.answers[q.questionNumber] = v; const el = document.getElementById('fi-' + q.questionNumber); if (el) { el.value = v; el.dispatchEvent(new Event('input')); } }
          }
        }
      }, draft.questionGroups);
      await page.evaluate(() => _doSubmitLTPractice());
      await page.waitForTimeout(1500);
      const score = await page.evaluate(() => {
        const t = document.body.innerText.match(/(\d+)\s*\/\s*(\d+)/g) || [];
        return t.slice(0, 6).join(' ');
      });
      r.score = score;
      if (!new RegExp(`\\b${end - start + 1}\\s*/\\s*${end - start + 1}\\b`).test(score)) r.problems.push('grade not full: ' + score);
      await page.screenshot({ path: W(`shots/${id}_review.png`), fullPage: false });
    } catch (e) { r.problems.push('ERR ' + e.message.split('\n')[0]); }
    if (errors.length) r.problems.push('page errors: ' + errors.slice(0, 2).join(' | '));
    results.push(r);
    console.log(`${r.problems.length ? '✗' : '✓'} ${id} ${r.title}${r.problems.length ? '\n   ' + r.problems.join('\n   ') : ''}`);
  }
  fs.writeFileSync(W('pw_results.json'), JSON.stringify(results, null, 1));
  await browser.close();
})();
