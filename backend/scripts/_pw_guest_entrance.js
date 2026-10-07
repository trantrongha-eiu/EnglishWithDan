// LOCAL e2e for the no-login Entrance Test (needs _local_entrance_server.js on :3000).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const { chromium } = require('../../node_modules/playwright');
const fs = require('fs');
const path = require('path');
const BASE = 'http://localhost:3000';
const SHOT = process.env.SHOT_DIR || '.';
const shot = (page, n) => page.screenshot({ path: path.join(SHOT, `guest_${n}.png`) });
const ok = (c, m) => console.log(`${c ? 'PASS' : 'FAIL'} ${m}`);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 860 } });
  // point the site at the local API
  await ctx.route('**/js/shared/auth-service.js*', async (r) => {
    const body = fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'js', 'shared', 'auth-service.js'), 'utf8')
      .replace("'https://englishwithdan.onrender.com/api'", "'http://localhost:3000/api'");
    r.fulfill({ contentType: 'application/javascript', body });
  });
  // fake "share entire screen" so the proctor gate passes headless
  await ctx.addInitScript(() => {
    if (!navigator.mediaDevices) return;
    navigator.mediaDevices.getDisplayMedia = async () => {
      const c = document.createElement('canvas'); c.width = 320; c.height = 200;
      const s = c.captureStream(1);
      const t = s.getVideoTracks()[0];
      t.getSettings = () => ({ displaySurface: 'monitor', width: 320, height: 200 });
      return s;
    };
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('dialog', (d) => d.accept());

  // 1. home page card
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(1200);
  ok(await page.isVisible('.et-hero-card'), 'home: Test đầu vào card visible');
  ok(await page.isVisible('.et-nav-pill'), 'home: navbar pill visible');
  await shot(page, '1_home');
  await page.click('.et-hero-card', { force: true });
  await page.waitForTimeout(2500);
  ok(page.url() === BASE + '/test-dau-vao', `address bar shows /test-dau-vao (${page.url()})`);
  ok(await page.isVisible('#et-guest-card'), 'visitor sees the name + phone form');
  ok(!(await page.isVisible('#et-start-btn')), 'start button hidden until registered');
  ok((await page.textContent('#et-structure-table')).includes('Grammar'), 'structure table loads without login');
  await shot(page, '2_form');

  // 2. validation + register
  await page.fill('#et-guest-name', 'Nguyễn Văn An');
  await page.fill('#et-guest-phone', '123');
  await page.click('#et-guest-submit');
  ok(await page.isVisible('#et-guest-error'), 'bad phone → inline error');
  await page.fill('#et-guest-phone', '0912 345 678');
  await page.click('#et-guest-submit');
  await page.waitForTimeout(1500);
  ok(await page.isVisible('#et-candidate-bar'), 'candidate bar after register');
  ok((await page.textContent('#et-candidate-bar')).includes('0912345678'), 'candidate bar shows phone');
  ok(await page.isVisible('#et-start-btn'), 'start button visible');
  const navShown = await page.evaluate(() => { const n = document.getElementById('globalTopNav'); return !!n && n.style.display !== 'none'; });
  ok(!navShown, 'no site nav for a guest');
  await shot(page, '3_registered');

  // 3. guest kept out of the rest of the site
  await page.goto(BASE + '/dashboard.html');
  await page.waitForTimeout(1500);
  ok(/entrance-test|test-dau-vao/.test(page.url()), `guest on /dashboard.html is sent back (${page.url()})`);
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(800);
  ok(/index\.html/.test(page.url()), 'guest can still open the home page (no dashboard bounce)');

  // 4. clean result URL route
  await page.goto(BASE + '/test-dau-vao/ket-qua/0123456789abcdef01234567');
  await page.waitForTimeout(2500);
  ok(/result=0123456789abcdef01234567/.test(page.url()), `clean result URL routed (${page.url()})`);

  // 5. run the test
  await page.goto(BASE + '/test-dau-vao');
  await page.waitForTimeout(1500);
  await page.click('#et-start-btn');
  await page.waitForTimeout(2500);
  const share = await page.$('#ews-pc-go');
  if (share) { await share.click(); await page.waitForTimeout(2500); }
  // proctor intro modal(s) may ask to confirm
  for (const t of ['Bắt đầu', 'Tôi đã hiểu', 'Đồng ý', 'Tiếp tục']) {
    const b = await page.$(`.modal-overlay:not(.hidden) button:has-text("${t}"), .ep-modal button:has-text("${t}")`);
    if (b) { await b.click().catch(() => {}); await page.waitForTimeout(1200); }
  }
  ok(await page.isVisible('#et-runner'), 'runner visible (attempt started)');
  ok((await page.textContent('#et-section-title')).toLowerCase().includes('grammar'), 'grammar section first');
  await shot(page, '4_grammar');
  const submitSection = async () => {
    await page.click('#et-submit-btn');
    await page.waitForTimeout(800);
    const c = await page.$('.modal-overlay:not(.hidden) .btn-primary, .confirm-dialog .btn-primary, [data-confirm-ok]');
    if (c) await c.click().catch(() => {});
    await page.waitForTimeout(3000);
  };
  await submitSection();
  ok((await page.textContent('#et-section-title')).toLowerCase().includes('reading'), 'reading section next');
  await page.waitForTimeout(3000);
  const rf = page.frame({ url: /reading\.html\?embed=entrance/ });
  ok(!!rf, 'reading iframe present');
  if (rf) {
    const rUrl = rf.url();
    ok(/reading\.html/.test(rUrl), `reading iframe stayed on reading.html (${rUrl})`);
    ok(await rf.$('input, textarea, select') != null, 'reading questions rendered inside the iframe');
  }
  await shot(page, '5_reading');
  await submitSection();
  await page.waitForTimeout(3000);
  const lf = page.frame({ url: /listening\.html\?embed=entrance/ });
  ok(!!lf, 'listening iframe present');
  if (lf) ok(await lf.$('#lt-practice-questions-inner input, #lt-practice-questions-inner select') != null, 'listening questions rendered inside the iframe');
  await shot(page, '6_listening');
  console.log('page errors:', errors.length ? errors.slice(0, 5) : 'none');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
