// Screenshot a local HTML file (contact sheets for checking images by eye).
//   node shot.js <file.html> <out.png> [width=1580]
const { chromium } = require('../../../node_modules/playwright');
const path = require('path');
(async () => {
  const [file, out, width] = process.argv.slice(2);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: +width || 1580, height: 600 } });
  await page.goto('file:///' + path.resolve(file).replace(/\\/g, '/'), { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
})();
