// @ts-check
/**
 * Affiliate: the ?ref= capture (js/shared/visit-tracker.js), Hồ sơ → Affiliate
 * in the React app (link, bank-QR upload, withdrawal) and the admin payout
 * queue's QR. Built frontend/ is served with the host's rewrites imitated;
 * the API is a mock, production is never touched.
 *
 * Run: npm run test:e2e -- student-app-affiliate
 *      E2E_SHOTS=<dir> saves screenshots.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

const FRONTEND = path.resolve(process.env.E2E_FRONTEND || path.join(__dirname, '..', 'frontend'));
const SHOTS = process.env.E2E_SHOTS || '';

let BASE = ""; // set once the server has a free port
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const qrUrl = () => `${BASE}/img/big_logo.png`;
const NOW = Date.now();
const STUDENT = { _id: 'me1', id: 'me1', username: 'hocvien', firstName: 'An', lastName: 'Trần', role: 'student', plan: 'premium', createdAt: new Date(NOW - 86400000).toISOString() };
const ADMIN = { _id: 'a1', id: 'a1', username: 'admin', firstName: 'Quản', lastName: 'Trị', role: 'admin' };
let server;

// One worker for the file: it owns one static server on PORT
test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    if (p.startsWith('/app/') && !p.startsWith('/app/assets/')) p = '/app/index.html';
    if (p.startsWith('/admin/') && !p.startsWith('/admin/assets/')) p = '/admin/index.html';
    const file = path.join(FRONTEND, p);
    if (!file.startsWith(FRONTEND) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, r));
  BASE = `http://localhost:${server.address().port}`;
});
test.afterAll(() => new Promise((r) => server.close(r)));

const shot = (page, name) => (SHOTS ? page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true }) : null);

function makeAffiliate(s) {
  return {
    success: true,
    code: 'AB7KQ2X',
    settings: { enabled: true, percent: 10, minPayout: 100000 },
    stats: { clicks: 12, signups: 2, buyers: 1, earned: 250000, paid: 0, pending: 0, sales: 2500000, orders: 1, balance: 250000 },
    bank: { bankName: '', bankAccount: '', accountName: '', qrImageUrl: s.qr },
    referrals: [
      { id: 'r1', name: 'Ngu***', joinedAt: new Date(NOW - 5 * 86400000).toISOString(), orders: 1, paid: 2500000, commission: 250000 },
      { id: 'r2', name: 'Bìn***', joinedAt: new Date(NOW - 2 * 86400000).toISOString(), orders: 0, paid: 0, commission: 0 },
    ],
    commissions: [
      { id: 'c1', source: 'tuition', description: 'học phí tháng 11/2026', buyer: 'Ngu***', baseAmount: 2500000, percent: 10, amount: 250000, status: 'earned', cancelReason: '', createdAt: new Date(NOW - 86400000).toISOString() },
    ],
    payouts: s.payouts,
  };
}

async function openStudent(page, url, s, { signedIn = true } = {}) {
  await page.addInitScript(([u, on]) => {
    localStorage.setItem('ews_page_help_seen', '1');
    localStorage.setItem('ews_seen_streak35_notice', '1');
    localStorage.setItem('ews_onboarding_tour_v1_dashboard.html', '1');
    if (!on) return;
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('lastLoginAt', String(Date.now()));
  }, [STUDENT, signedIn]);
  await page.route(/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|maps\.google\.com/, (r) => r.abort());
  await page.route('https://englishwithdan.onrender.com/**', async (route) => {
    const req = route.request();
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    const p = new URL(req.url()).pathname.replace(/^\/api/, '');
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', headers, body: JSON.stringify(body) });
    s.calls.push({ method: req.method(), path: p, contentType: req.headers()['content-type'] || '', body: req.postData() });
    if (p === '/auth/me' || p === '/user/profile') return json({ success: true, user: { ...STUDENT, email: 'an@example.test', hasPassword: true } });
    // The rest of Hồ sơ, in the shapes the real API always answers with
    if (p === '/badges') return json({ success: true, badges: [], earnedCount: 0, totalCount: 0 });
    if (p === '/user/activity-heatmap') return json({ success: true, activity: [] });
    if (p === '/shop') return json({ success: true, items: [], pets: [], flames: 0, danielHammer: { count: 0 }, effects: {} });
    if (p === '/affiliate/me') return json(makeAffiliate(s));
    if (p === '/affiliate/bank-qr' && req.method() === 'POST') { s.qr = qrUrl(); return json({ success: true, qrImageUrl: qrUrl() }); }
    if (p === '/affiliate/bank-qr' && req.method() === 'DELETE') { s.qr = ''; return json({ success: true }); }
    if (p === '/affiliate/payouts') {
      const b = JSON.parse(req.postData() || '{}');
      s.payouts.unshift({ id: 'p1', amount: b.amount, status: 'pending', bankName: b.bankName, bankAccount: b.bankAccount, accountName: b.accountName, qrImageUrl: s.qr, adminNote: '', createdAt: new Date().toISOString() });
      return json({ success: true, message: 'Đã gửi yêu cầu rút tiền.' }, 201);
    }
    if (p === '/affiliate/claim') return json({ success: true, status: 'ok' });
    if (p === '/affiliate/click' || p === '/track/visit') return route.fulfill({ status: 204, headers });
    return json({ success: true });
  });
  await page.goto(BASE + url);
}

test('a referral link is kept, counted once, then claimed after login', async ({ page }) => {
  const s = { qr: '', payouts: [], calls: [] };
  await openStudent(page, '/index.html?ref=ab7kq2x', s, { signedIn: false });
  await expect.poll(() => s.calls.filter((c) => c.path === '/affiliate/click').length).toBe(1);
  expect(JSON.parse(s.calls.find((c) => c.path === '/affiliate/click').body)).toEqual({ code: 'AB7KQ2X' });
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem('ewdRef'))).code).toBe('AB7KQ2X');
  expect(s.calls.some((c) => c.path === '/affiliate/claim')).toBe(false); // not signed in yet

  // Same link again: no second click; then a login → claim, and the code is dropped
  await page.goto(`${BASE}/index.html?ref=AB7KQ2X`);
  await page.evaluate(() => localStorage.setItem('token', 'test-token'));
  await page.goto(`${BASE}/index.html`);
  await expect.poll(() => s.calls.filter((c) => c.path === '/affiliate/claim').length).toBe(1);
  expect(JSON.parse(s.calls.find((c) => c.path === '/affiliate/claim').body)).toEqual({ code: 'AB7KQ2X' });
  await expect.poll(() => page.evaluate(() => localStorage.getItem('ewdRef'))).toBeNull();
  expect(s.calls.filter((c) => c.path === '/affiliate/click').length).toBe(1);
});

for (const [label, viewport] of [['desktop', { width: 1280, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  test(`Giới thiệu bạn bè page: upload a bank QR and withdraw with it (${label})`, async ({ browser }) => {
    const page = await browser.newPage({ viewport });
    const s = { qr: '', payouts: [], calls: [] };
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    // The old Hồ sơ tab link still lands on the page
    await openStudent(page, '/app/profile?tab=affiliate', s);
    await expect(page).toHaveURL(/\/app\/affiliate$/);
    // …and the menu lists it under BXH vocab
    await expect(page.locator('a[href$="app/affiliate"]')).not.toHaveCount(0);

    const tab = page.locator('#affiliatePage');
    await expect(tab.locator('#affLink')).toHaveValue(`${BASE}/?ref=AB7KQ2X`);
    await expect(tab).toContainText('Số dư khả dụng');
    await expect(tab).toContainText('250.000đ');
    await expect(tab).toContainText('Ngu***');
    // Without a QR the typed bank fields are required
    await expect(tab.locator('#affBank')).toHaveAttribute('required', '');
    await shot(page, `affiliate-${label}-before`);

    // No horizontal page scroll on a phone
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

    await tab.locator('.aff-qr input[type=file]').setInputFiles({ name: 'qr.png', mimeType: 'image/png', buffer: fs.readFileSync(path.join(FRONTEND, 'img', 'big_logo.png')) });
    await expect(tab.locator('.aff-qr-img img')).toHaveAttribute('src', qrUrl());
    const up = s.calls.find((c) => c.path === '/affiliate/bank-qr' && c.method === 'POST');
    expect(up.contentType).toMatch(/^multipart\/form-data; boundary=/);
    await expect(tab.locator('#affBank')).not.toHaveAttribute('required', '');
    await expect(tab.getByRole('button', { name: /Đổi ảnh QR/ })).toBeVisible();

    await tab.getByRole('button', { name: /Gửi yêu cầu rút tiền/ }).click();
    await expect.poll(() => s.calls.filter((c) => c.path === '/affiliate/payouts').length).toBe(1);
    expect(JSON.parse(s.calls.find((c) => c.path === '/affiliate/payouts').body).amount).toBe(250000);
    // The reloaded form keeps the QR, and the history row links to it
    await expect(tab).toContainText('Bạn đang có một yêu cầu rút tiền chờ admin chuyển khoản');
    await expect(tab.locator('.aff-qr-img img')).toHaveAttribute('src', qrUrl());
    await expect(tab.locator('.aff-table a[href*="big_logo"]')).toBeVisible();
    await shot(page, `affiliate-${label}-after`);

    // Remove the QR → typed fields required again
    await tab.getByRole('button', { name: /Xóa/ }).click();
    await expect(tab.locator('.aff-qr-empty')).toBeVisible();
    expect(errors).toEqual([]);
    await page.close();
  });
}

test('admin payout queue shows the QR and enlarges it for scanning', async ({ page }) => {
  await page.addInitScript((u) => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('lastLoginAt', String(Date.now()));
  }, ADMIN);
  await page.route(/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/, (r) => r.abort());
  await page.route('https://englishwithdan.onrender.com/**', (route) => {
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    const p = new URL(route.request().url()).pathname.replace(/^\/api/, '');
    let body = { success: true };
    if (/\/(auth\/me|user\/profile)$/.test(p)) body = { success: true, user: ADMIN };
    if (p === '/admin/affiliate/overview') body = { success: true, settings: { enabled: true, percent: 10, minPayout: 100000 }, stats: { referredUsers: 3, sales: 2500000, commissionTotal: 250000, paidOut: 0, pendingPayoutTotal: 250000, pendingPayouts: 1, owed: 250000 } };
    if (p === '/admin/affiliate/payouts') {
      body = { success: true, total: 1, items: [{
        _id: 'p1', amount: 250000, status: 'pending', bankName: '', bankAccount: '', accountName: '', qrImageUrl: qrUrl(), note: '',
        createdAt: new Date().toISOString(), userId: { _id: 'me1', username: 'hocvien', firstName: 'An', lastName: 'Trần', email: 'an@example.test' },
        totals: { earned: 250000, paid: 0, pending: 250000, balance: 0 },
      }] };
    }
    return route.fulfill({ status: 200, contentType: 'application/json', headers, body: JSON.stringify(body) });
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${BASE}/admin/affiliate`);
  const thumb = page.locator('table img[alt="QR nhận tiền"]');
  await expect(thumb).toHaveAttribute('src', qrUrl());
  await expect(page.getByRole('button', { name: /Yêu cầu rút tiền \(1\)/ })).toBeVisible();
  await shot(page, 'affiliate-admin');
  await thumb.click();
  await expect(page.locator('.modal img[alt="QR nhận tiền"]')).toBeVisible();
  await expect(page.locator('.modal')).toContainText('Quét QR');
  await shot(page, 'affiliate-admin-qr');
  expect(errors).toEqual([]);
});
