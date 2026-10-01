// Probe tuhoc.dolenglish.vn listing pagination: log the XHR/fetch calls the page makes.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const seen = [];
  page.on('request', r => {
    const t = r.resourceType();
    if (t === 'xhr' || t === 'fetch') seen.push(r.method() + ' ' + r.url() + (r.postData() ? '  BODY ' + r.postData().slice(0, 400) : ''));
  });
  await page.goto('https://tuhoc.dolenglish.vn/luyen-thi-ielts/ielts-listening-practice?page=1', { waitUntil: 'networkidle' });
  console.log('--- after load'); seen.splice(0).forEach(s => console.log(s));
  const links = await page.$$eval('a', as => as.map(a => a.textContent.trim() + ' -> ' + a.getAttribute('href')).filter(s => /page=/.test(s)));
  console.log(links.join('\n'));
  const two = page.locator('a[href*="page=2"]').first();
  await two.click();
  await page.waitForTimeout(4000);
  console.log('--- after click page 2'); seen.splice(0).forEach(s => console.log(s));
  const names = await page.$$eval('a[href*="ielts-listening-practice-"]', as => as.map(a => a.getAttribute('href')));
  console.log([...new Set(names)].slice(0, 20).join('\n'));
  await browser.close();
})();
