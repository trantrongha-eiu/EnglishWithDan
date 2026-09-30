// Teacher-side pass: open every passage's "📝 Câu hỏi" modal in the admin SPA and read the
// QuestionGroupBuilder summary/warnings. All non-GET API calls are aborted, so nothing can be saved.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const fs = require('fs');
const path = require('path');
const S = __dirname;
const SITE = 'https://ieltsthayha.com';
const ps = require('./passages.json');
const only = process.argv[2] ? new RegExp(process.argv[2], 'i') : null;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto(`${SITE}/login.html`);
  await page.fill('#email', process.env.PW_TEST_USER);
  await page.fill('#password', process.env.PW_TEST_PASS);
  await Promise.all([page.waitForNavigation().catch(() => {}), page.click('#loginForm button[type=submit]')]);
  await page.waitForTimeout(1500);
  // hard read-only guard from here on
  let blocked = 0;
  await page.route('**/api/**', route => {
    if (route.request().method() !== 'GET') { blocked++; return route.abort(); }
    return route.continue();
  });

  const out = [];
  for (const p of ps) {
    if (only && !only.test(p.title)) continue;
    if (process.env.TAG && !(p.tags || []).includes(process.env.TAG)) continue;
    const id = String(p._id);
    const r = { id, title: p.title, tests: p.tests };
    try {
      await page.goto("about:blank");
      await page.goto(`${SITE}/admin/#/passages?editQuestions=${id}`);
      await page.waitForSelector('.modal', { timeout: 30000 });
      await page.waitForFunction(() => /Tổng:\s*\d+/.test(document.querySelector('.modal')?.innerText || ''), null, { timeout: 30000 });
      const txt = await page.$eval('.modal', e => e.innerText);
      r.modalTitle = (txt.match(/Câu hỏi — ([^\n]*)/) || [])[1] || '';
      if (r.modalTitle.trim() !== p.title.trim()) r.error = 'modal shows other passage: ' + r.modalTitle;
      r.summary = (txt.match(/Tổng:[^\n]*(\n[^\n]*Phạm vi[^\n]*)?/) || [''])[0].replace(/\s+/g, ' ');
      r.warn = /Có cảnh báo|Có lỗi cần sửa|Cần kiểm tra lại/.test(txt);
      if (r.warn) {
        r.details = txt.split('\n').filter(l => /Câu \d+|Nhóm \d+|trùng|thiếu|Thiếu/i.test(l)).slice(0, 12);
        await page.screenshot({ path: path.join(S, 'shots', `admin_${id}.png`) });
      }
    } catch (e) {
      r.error = String(e.message).split('\n')[0];
    }
    out.push(r);
    console.log(`${r.warn || r.error ? '✗' : '✓'} ${p.title.slice(0, 50).padEnd(50)} ${r.summary || ''} ${r.error || ''} ${r.details ? r.details.join(' | ') : ''}`);
  }
  fs.writeFileSync(path.join(S, 'pw_admin.json'), JSON.stringify(out, null, 2));
  console.log(`\n${out.filter(r => !r.warn && !r.error).length}/${out.length} without warnings; blocked non-GET requests: ${blocked}`);
  await browser.close();
})();
