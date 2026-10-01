// Playwright check of the practice REVIEW screen on the live site (teacher "test", every non-GET request aborted →
// nothing is saved). For N random passages: answer ~1/3 correctly, ~1/3 wrongly, leave ~1/3 blank (choose-N
// clusters are answered correctly), press "check" like a student, then verify on the review screen that
//   • the score bar and the question navigator mark every question correct / wrong / skipped as expected;
//   • every question's explanation is rendered exactly once, in question order.
// Screenshots: shots/review_<id>.png.   Usage: TAG=mini-ielts node pw_review.js [N=10] [title-regex]
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const path = require('path');
const SITE = 'https://ieltsthayha.com';
const N = +(process.argv[2] || 10);
const only = process.argv[3] ? new RegExp(process.argv[3], 'i') : null;
let ps = require('./passages.json').filter(p => p.isActive !== false && (!process.env.TAG || (p.tags || []).includes(process.env.TAG)) && (!only || only.test(p.title)));
ps = ps.map(p => [Math.random(), p]).sort((a, b) => a[0] - b[0]).slice(0, N).map(x => x[1]);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);
  let blocked = 0;
  await page.route('**/api/**', route => (route.request().method() === 'GET' ? route.continue() : (blocked++, route.abort())));
  page.on('dialog', d => d.dismiss().catch(() => {}));

  let ok = 0;
  for (const p of ps) {
    const id = String(p._id);
    let problems = [];
    try {
      await page.goto(`${SITE}/reading.html?passageId=${id}&exam=practice`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.questions-inner .question-group', { timeout: 30000 });
      await page.waitForTimeout(500);
      const plan = await page.evaluate(async (id) => {
        const kr = await apiFetch(`/api/reading/practice/answer-key/${id}`);
        const key = kr.answerKey || {};
        const expect = {}, expl = {};
        const qs = state.passages[0].questionGroups.flatMap(g => g.questions);
        const multi = new Set(qs.filter(q => q.type === 'multi-answer-group').map(q => q.questionNumber));
        const wrongFor = (q, k) => {
          const alts = k.split(/\s*\/\s*/).map(s => s.trim().toUpperCase());
          const pick = list => list.find(x => !alts.includes(x.toUpperCase()));
          if (q.type === 'true-false-ng') return pick(['TRUE', 'FALSE', 'NOT GIVEN']);
          if (q.type === 'yes-no-ng') return pick(['YES', 'NO', 'NOT GIVEN']);
          if (q.type === 'matching-headings') return pick(['i', 'ii', 'iii']);
          if (/^[A-L]$/.test(alts[0])) return pick(['A', 'B', 'C']);
          return 'zzzz';
        };
        for (const q of qs) {
          const n = q.questionNumber, k = String(key[n]?.correctAnswer || '');
          expl[n] = String(key[n]?.explanation || '');
          if (multi.has(n) || n % 3 === 2) { state.answers[n] = k.split(/\s*\/\s*/)[0].trim(); expect[n] = 'correct'; }
          else if (n % 3 === 1) { state.answers[n] = wrongFor(q, k); expect[n] = 'wrong'; }
          else { delete state.answers[n]; expect[n] = 'skipped'; }
        }
        // choose-N clusters: same sorted JSON array on every question of the run (as toggleMultiAnswer does)
        for (const g of state.passages[0].questionGroups) {
          const gq = g.questions || [];
          for (let i = 0; i < gq.length; i++) {
            if (gq[i].type !== 'multi-answer-group') continue;
            let j = i; while (j + 1 < gq.length && gq[j + 1].type === 'multi-answer-group') j++;
            const run = gq.slice(i, j + 1).map(q => q.questionNumber);
            const val = JSON.stringify(run.map(n => String(state.answers[n] || '')).filter(Boolean).sort());
            run.forEach(n => { state.answers[n] = val; });
            i = j;
          }
        }
        submitRetry();
        return { expect, expl };
      }, id);
      await page.waitForSelector('#retry-questions-inner .rd-result-bar', { timeout: 15000 });
      await page.waitForTimeout(400);
      const seen = await page.evaluate(() => {
        const nav = {};
        document.querySelectorAll('#retry-q-nav .q-nav-btn').forEach(b => { nav[+b.textContent] = ['correct', 'wrong', 'skipped'].find(c => b.classList.contains(c)); });
        const bar = document.querySelector('#retry-questions-inner .rd-result-bar').innerText;
        const expls = [...document.querySelectorAll('#retry-questions-inner .q-explanation, #retry-questions-inner .rq-inline-expl')].map(e => e.innerText.replace(/\s+/g, ' '));
        return { nav, bar, expls };
      });
      const cnt = { correct: 0, wrong: 0, skipped: 0 };
      for (const [n, e] of Object.entries(plan.expect)) {
        cnt[e]++;
        if (seen.nav[n] !== e) problems.push(`Q${n} nav ${seen.nav[n]} ≠ expected ${e}`);
      }
      const m = seen.bar.match(/Đúng:\s*(\d+)[\s\S]*Sai:\s*(\d+)[\s\S]*Bỏ qua:\s*(\d+)/);
      if (!m || +m[1] !== cnt.correct || +m[2] !== cnt.wrong || +m[3] !== cnt.skipped) problems.push(`bar "${seen.bar.replace(/\s+/g, ' ').slice(0, 80)}" ≠ ${JSON.stringify(cnt)}`);
      // which question does each rendered explanation belong to? (match by the whole explanation text — choose-N
      // questions share their "Dịch:" line, so only the full text is unique)
      const sig = n => plan.expl[n].replace(/\s+/g, ' ').trim();
      const owners = seen.expls.map(t => Object.keys(plan.expl).filter(n => plan.expl[n] && t.includes(sig(n))).map(Number));
      const order = owners.map(o => (o.length === 1 ? o[0] : null));
      if (seen.expls.length !== Object.keys(plan.expect).length) problems.push(`${seen.expls.length} explanations rendered for ${Object.keys(plan.expect).length} questions`);
      if (order.some(o => o === null)) problems.push(`unidentifiable/ambiguous explanation block(s)`);
      for (let i = 1; i < order.length; i++) if (order[i] !== null && order[i - 1] !== null && order[i] <= order[i - 1]) { problems.push(`explanations out of order: Q${order[i - 1]} then Q${order[i]}`); break; }
      await page.screenshot({ path: path.join(__dirname, 'shots', `review_${id}.png`), fullPage: false });
    } catch (e) {
      problems.push(`FAILED: ${String(e.message).split('\n')[0]}`);
    }
    if (!problems.length) ok++;
    console.log(`${problems.length ? '✗' : '✓'} ${p.title.slice(0, 55).padEnd(55)} ${problems.join(' ; ')}`);
  }
  console.log(`\n${ok}/${ps.length} review screens OK; non-GET requests blocked: ${blocked} (nothing saved)`);
  await browser.close();
})();
