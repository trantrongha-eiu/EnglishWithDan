// Check what an anonymous visitor actually sees for answers / explanations on a DOL solution page.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto(process.argv[2], { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(2000);
  const btn = page.getByText('Giải thích chi tiết theo Linear').first();
  await btn.scrollIntoViewIfNeeded();
  await page.screenshot({ path: __dirname + '/web/pw_before.png' });
  await btn.click().catch(e => console.log('click fail', e.message));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: __dirname + '/web/pw_after.png' });
  const t = await page.evaluate(() => document.body.innerText);
  const i = t.indexOf('Question 1');
  console.log(t.slice(i, i + 1500));
  await browser.close();
})();
