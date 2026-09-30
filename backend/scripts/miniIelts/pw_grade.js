// End-to-end grading check on the live site: open each passage in PRACTICE mode as teacher "test", fill every
// question with the answer key (first "/" alternative — what a student would type/pick), press the real
// "check" flow (submitRetry) and read the grading result from the /practice/save request body.
// Every non-GET request is ABORTED, so no attempt is ever saved.  Expect correct === total for every passage.
// Usage: TAG=mini-ielts node pw_grade.js [title-regex]      (reads passages.json — run dump_passages.js first)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const SITE = 'https://ieltsthayha.com';
const ps = require(process.env.PS_FILE || './passages.json').filter(p => p.isActive !== false);
const only = process.argv[2] ? new RegExp(process.argv[2], 'i') : null;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);

  let saved = null, blocked = 0;
  await page.route('**/api/**', route => {
    const req = route.request();
    if (req.method() === 'GET') return route.continue();
    blocked++;
    if (req.url().includes('/practice/save')) { try { saved = JSON.parse(req.postData() || '{}'); } catch { saved = {}; } }
    return route.abort();
  });
  page.on('dialog', d => d.dismiss().catch(() => {}));

  let ok = 0, n = 0;
  for (const p of ps) {
    if (only && !only.test(p.title)) continue;
    if (process.env.TAG && !(p.tags || []).includes(process.env.TAG)) continue;
    n++; saved = null;
    const id = String(p._id);
    let line;
    try {
      await page.goto(`${SITE}/reading.html?passageId=${id}&exam=practice`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.questions-inner .question-group', { timeout: 30000 });
      await page.waitForTimeout(500);
      const filled = await page.evaluate(async (id) => {
        const kr = await apiFetch(`/api/reading/practice/answer-key/${id}`);
        const key = kr.answerKey || {};
        let count = 0;
        for (const [num, v] of Object.entries(key)) {
          const k = String(v.correctAnswer || '');
          state.answers[num] = k.startsWith('[') ? k : k.split(/\s*\/\s*/)[0].trim();
          count++;
        }
        // "Choose TWO/THREE letters" clusters: the UI (toggleMultiAnswer) stores the same sorted JSON array of
        // every picked letter on each question of a run of consecutive multi-answer-group questions
        for (const g of state.passages[0].questionGroups || []) {
          const qs = g.questions || [];
          for (let i = 0; i < qs.length; i++) {
            if (qs[i].type !== 'multi-answer-group') continue;
            let j = i; while (j + 1 < qs.length && qs[j + 1].type === 'multi-answer-group') j++;
            const run = qs.slice(i, j + 1).map(q => q.questionNumber);
            const val = JSON.stringify(run.map(n => String(state.answers[n] || '').trim()).filter(Boolean).sort());
            run.forEach(n => { state.answers[n] = val; });
            i = j;
          }
        }
        submitRetry();
        return count;
      }, id);
      for (let i = 0; i < 40 && !saved; i++) await page.waitForTimeout(250);
      if (!saved) line = `✗ ${p.title.slice(0, 55).padEnd(55)} no grading result (filled ${filled})`;
      else {
        const total = (saved.answers || []).length;
        const wrong = (saved.answers || []).filter(a => !a.isCorrect).map(a => `Q${a.questionNumber} "${a.userAnswer}" vs "${a.correctAnswer}"`);
        const good = saved.correctCount === total && total === filled && !wrong.length;
        if (good) ok++;
        line = `${good ? '✓' : '✗'} ${p.title.slice(0, 55).padEnd(55)} ${saved.correctCount}/${total}${wrong.length ? '  ' + wrong.join(' | ') : ''}`;
      }
    } catch (e) {
      line = `✗ ${p.title.slice(0, 55).padEnd(55)} ${String(e.message).split('\n')[0]}`;
    }
    console.log(line);
  }
  console.log(`\n${ok}/${n} graded 100% with the answer key; non-GET requests blocked: ${blocked} (nothing saved)`);
  await browser.close();
})();
