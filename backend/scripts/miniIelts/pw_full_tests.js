// Playwright check of FIXED full Reading tests in the real exam UI without touching the DB: POST /api/reading/start
// is answered locally with exactly what readingService.startTest() would return for that test (its 3 passages from
// passages.json, answers/explanations stripped); every other non-GET request is aborted. For each test: the exam
// screen opens, shows 3 passage tabs, the question navigator holds questions 1-40, and every passage renders an
// answer control for each of its questions.
// Usage: node pw_full_tests.js [name-regex]      (reads passages.json — run dump_passages.js first)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const mongoose = require('../../node_modules/mongoose');
const SITE = 'https://ieltsthayha.com';
const only = new RegExp(process.argv[2] || '^Actual Mocktest (3[89]|[4-7]\\d)$');
const ps = new Map(require('./passages.json').map(p => [String(p._id), p]));
const strip = p => ({
  _id: p._id, title: p.title, category: p.category, content: p.content, questionRange: p.questionRange,
  questionGroups: (p.questionGroups || []).map(g => ({ ...g, questions: g.questions.map(({ correctAnswer, explanation, ...q }) => q) })),
  questions: [],
});

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const tests = (await mongoose.connection.db.collection('readingtests').find({ isActive: true }).toArray()).filter(t => only.test(t.name))
    .sort((a, b) => a.testNumber - b.testNumber);
  await mongoose.disconnect();

  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);
  let current = null, blocked = 0;
  await page.route('**/api/**', route => {
    const req = route.request();
    if (req.method() === 'GET') return route.continue();
    if (req.url().includes('/api/reading/start') && current) {
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, attemptId: '000000000000000000000000', testName: current.name,
        passages: current.passageIds.map(id => strip(ps.get(String(id)))), duration: 3600, mode: 'practice' }) });
    }
    blocked++; return route.abort();
  });
  page.on('dialog', d => d.dismiss().catch(() => {}));

  let ok = 0;
  for (const t of tests) {
    current = t;
    const problems = [];
    try {
      await page.goto(`${SITE}/reading.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => typeof _doStartExam === 'function', null, { timeout: 30000 });
      await page.evaluate(id => { window.onbeforeunload = null; return _doStartExam(id, 'practice'); }, String(t._id));
      await page.waitForFunction(() => state && state.passages && state.passages.length === 3, null, { timeout: 20000 });
      await page.waitForTimeout(600);
      const res = await page.evaluate(async () => {
        const out = { title: document.getElementById('exam-title')?.textContent || '', nav: [], perPassage: [] };
        out.nav = [...document.querySelectorAll('.q-nav-btn')].map(b => parseInt(b.textContent)).filter(n => !isNaN(n));
        for (let i = 0; i < 3; i++) {
          switchPassage(i);
          await new Promise(r => setTimeout(r, 300));
          const p = state.passages[i];
          const root = document.querySelector('#questions-inner') || document.body;
          const nums = new Set();
          root.querySelectorAll('[data-qnum]').forEach(e => nums.add(+e.dataset.qnum));
          root.querySelectorAll('[onclick]').forEach(e => { const m = e.getAttribute('onclick').match(/^\s*(?:pick\w+|toggle\w*)\((\d+)/); if (m) nums.add(+m[1]); });
          root.querySelectorAll('[data-cluster-start]').forEach(e => { for (let n = +e.dataset.clusterStart; n <= +e.dataset.clusterEnd; n++) nums.add(n); });
          const missing = []; for (let n = p.questionRange.start; n <= p.questionRange.end; n++) if (!nums.has(n)) missing.push(n);
          const passText = [...document.querySelectorAll('.passage-text')].filter(e => e.offsetParent).map(e => e.innerText.length);
          out.perPassage.push({ title: p.title, range: `${p.questionRange.start}-${p.questionRange.end}`, missing, passLen: Math.max(0, ...passText) });
        }
        window.onbeforeunload = null;
        try { clearExamStorage(); } catch (e) { /* ignore */ }
        return out;
      });
      if (res.title.trim() !== t.name) problems.push(`title "${res.title}"`);
      const nav = [...new Set(res.nav)].sort((a, b) => a - b);
      if (nav.length !== 40 || nav[0] !== 1 || nav[39] !== 40) problems.push(`navigator ${nav.length} questions (${nav[0]}…${nav[nav.length - 1]})`);
      res.perPassage.forEach((p, i) => {
        if (p.missing.length) problems.push(`P${i + 1} "${p.title}" no control for Q${p.missing.join(',')}`);
        if (p.passLen < 1500) problems.push(`P${i + 1} passage text short (${p.passLen})`);
      });
    } catch (e) { problems.push(`FAILED: ${String(e.message).split('\n')[0]}`); }
    if (!problems.length) ok++;
    console.log(`${problems.length ? '✗' : '✓'} ${t.name.padEnd(20)} ${t.passageIds.map(id => (ps.get(String(id)) || {}).title || '?').join(' | ').slice(0, 110)} ${problems.join(' ; ')}`);
  }
  console.log(`\n${ok}/${tests.length} full tests open correctly; other non-GET requests blocked: ${blocked} (nothing saved)`);
  await browser.close();
})();
