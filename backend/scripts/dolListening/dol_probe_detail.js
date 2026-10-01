// Probe a DOL solution page: log API calls (non-tracking) and save JSON responses to web/probe_*.json.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let n = 0;
  page.on('response', async r => {
    const u = r.url();
    if (!/dolenglish|vcdn|\.mp3|\.m4a|audio/i.test(u) || /page-view|user-interactions|cdn-cgi|_next\/static/.test(u)) return;
    const ct = r.headers()['content-type'] || '';
    console.log(r.status(), r.request().method(), u.slice(0, 200), ct);
    if (ct.includes('json')) { try { fs.writeFileSync(path.join(__dirname, 'web', `probe_${n++}.json`), await r.text()); } catch {} }
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(3000);
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(path.join(__dirname, 'web', 'probe_text.txt'), text);
  console.log('text length', text.length);
  await browser.close();
})();
