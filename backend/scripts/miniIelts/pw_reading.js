// Playwright debug pass over every Reading passage on the live site, as teacher "test".
// Opens each passage in PRACTICE mode (GET-only: /practice/by-id + /practice/answer-key; nothing is saved)
// and checks what the student actually sees.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const fs = require('fs');
const path = require('path');
const S = __dirname;
const SITE = 'https://ieltsthayha.com';
const ps = require('./passages.json').filter(p => p.isActive !== false);
const only = process.argv[2] ? new RegExp(process.argv[2], 'i') : null;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation({ timeout: 30000 }).catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);
  console.log('after login:', page.url());

  const results = [];
  for (const p of ps) {
    if (only && !only.test(p.title)) continue;
    consoleErrors.length = 0;
    const id = String(p._id);
    const url = `${SITE}/reading.html?passageId=${id}&exam=practice`;
    let r = { id, title: p.title, tests: p.tests, problems: [] };
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.questions-inner .question-group', { timeout: 30000 });
      await page.waitForTimeout(400);
      const out = await page.evaluate(async ({ id, start, end }) => {
        const root = document.querySelector('.question-group').closest('.questions-inner') || document.body;
        const problems = [];
        const nums = new Set();
        root.querySelectorAll('[data-qnum]').forEach(e => nums.add(+e.dataset.qnum));
        root.querySelectorAll('[onclick]').forEach(e => { const m = e.getAttribute('onclick').match(/^\s*(?:pick\w+|toggle\w*)\((\d+)/); if (m) nums.add(+m[1]); });
        root.querySelectorAll('[data-cluster-start]').forEach(e => { for (let n = +e.dataset.clusterStart; n <= +e.dataset.clusterEnd; n++) nums.add(n); });
        const missing = []; for (let n = start; n <= end; n++) if (!nums.has(n)) missing.push(n);
        if (missing.length) problems.push(`no answer control for Q${missing.join(',')}`);
        const extra = [...nums].filter(n => n < start || n > end);
        if (extra.length) problems.push(`controls outside range: ${extra}`);
        // order of question badges in the DOM
        const badges = [...root.querySelectorAll('.q-badge, .rq-q-badge, .match-q-num')].map(e => parseInt(e.textContent)).filter(n => !isNaN(n));
        for (let i = 1; i < badges.length; i++) if (badges[i] < badges[i - 1]) { problems.push(`badge order ${badges.slice(Math.max(0, i - 3), i + 2).join('→')}`); break; }
        const text = root.innerText;
        const bad = text.match(/\[Q\d+\]|__Q\d*_*|Chưa có word bank|Chưa có dữ liệu[^\n]*/g);
        if (bad) problems.push(`leftover markup: ${[...new Set(bad)].join(' ')}`);
        // answer key vs rendered choices
        const kr = await apiFetch(`/api/reading/practice/answer-key/${id}`);
        const key = kr.answerKey || {};
        const alts = s => String(s || '').split(/\s*\/\s*/).map(x => x.trim().toLowerCase()).filter(Boolean);
        for (let n = start; n <= end; n++) {
          const k = key[n]?.correctAnswer;
          if (!k || !String(k).trim()) { problems.push(`Q${n} empty key`); continue; }
          const tf = [...root.querySelectorAll(`[onclick^="pickTFNG(${n},"]`)].map(e => e.getAttribute('onclick').match(/'([^']+)'/)[1].toLowerCase());
          if (tf.length && !alts(k).some(a => tf.includes(a))) problems.push(`Q${n} key "${k}" not in ${tf}`);
          const mc = [...root.querySelectorAll(`[onclick^="pickMC(${n},"]`)].map(e => e.getAttribute('onclick').match(/'([^']+)'/)[1].toLowerCase());
          if (mc.length && !alts(k).some(a => mc.includes(a))) problems.push(`Q${n} MC key "${k}" not in ${mc}`);
          const dz = root.querySelector(`.drop-zone[data-qnum="${n}"]`);
          if (dz) {
            const gid = dz.dataset.groupid;
            const chips = [...root.querySelectorAll(`.drag-chip[data-groupid="${gid}"]`)].map(c => c.dataset.value.trim().toLowerCase());
            if (!chips.length) problems.push(`Q${n} drop zone with no chips`);
            else if (!alts(k).some(a => chips.includes(a))) problems.push(`Q${n} key "${k}" not among chips [${chips.join('|')}]`);
          }
          const cl = [...root.querySelectorAll('[data-cluster-start]')].find(e => n >= +e.dataset.clusterStart && n <= +e.dataset.clusterEnd);
          if (cl) {
            const opts = [...cl.querySelectorAll('.cb-letter')].map(e => e.textContent.trim().toLowerCase());
            if (opts.length && !alts(k).some(a => opts.includes(a))) problems.push(`Q${n} multi key "${k}" not in ${opts}`);
          }
        }
        const texts=[...document.querySelectorAll('.passage-text')].filter(e=>e.offsetParent);const title='';
        const passLen = Math.max(0,...texts.map(e=>e.innerText.length));
        return { problems, controls: nums.size, title, passLen };
      }, { id, start: p.questionRange.start, end: p.questionRange.end });
      r = { ...r, ...out };
      if (out.passLen < 1500) r.problems.push(`passage text short (${out.passLen} chars)`);
      if (consoleErrors.length) r.problems.push(`console errors: ${consoleErrors.slice(0, 2).join(' | ').slice(0, 200)}`);
      if (r.problems.length) await page.screenshot({ path: path.join(S, 'shots', `${id}.png`), fullPage: false });
    } catch (e) {
      r.problems.push(`FAILED: ${String(e.message).split('\n')[0]}`);
      await page.screenshot({ path: path.join(S, 'shots', `${id}.png`) }).catch(() => {});
    }
    results.push(r);
    console.log(`${r.problems.length ? '✗' : '✓'} ${p.title.slice(0, 55).padEnd(55)} ${p.questionRange.start}-${p.questionRange.end} ctl=${r.controls ?? '?'} ${r.problems.join(' ; ')}`);
  }
  fs.writeFileSync(path.join(S, 'pw_results.json'), JSON.stringify(results, null, 2));
  console.log(`\n${results.filter(r => !r.problems.length).length}/${results.length} OK`);
  await browser.close();
})();
