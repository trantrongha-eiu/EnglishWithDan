// @ts-check
/**
 * The admin app's addresses have no "#": /admin/users, not /admin/#/users.
 * Served from the built frontend/admin with the host's rewrite imitated; the
 * API is mocked, production is never touched.
 *
 * Run: npm run test:e2e -- admin-clean-urls
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

const FRONTEND = path.resolve(process.env.E2E_FRONTEND || path.join(__dirname, '..', 'frontend'));
const PORT = 3138 + 100 * Number(process.env.TEST_PARALLEL_INDEX || 0); // one static server per worker
const BASE = `http://localhost:${PORT}`;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const ADMIN = { _id: 'a1', id: 'a1', username: 'admin', firstName: 'Quản', lastName: 'Trị', role: 'admin' };
let server;

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    if (p.startsWith('/admin/') && !p.startsWith('/admin/assets/')) p = '/admin/index.html';
    const file = path.join(FRONTEND, p);
    if (!file.startsWith(FRONTEND) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(PORT, r));
});
test.afterAll(() => new Promise((r) => server.close(r)));

async function open(page, url, { signedIn = true } = {}) {
  await page.addInitScript(([u, on]) => {
    if (!on) return;
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('lastLoginAt', String(Date.now()));
  }, [ADMIN, signedIn]);
  await page.route(/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/, (r) => r.abort());
  await page.route('https://englishwithdan.onrender.com/**', (route) => {
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    const p = new URL(route.request().url()).pathname;
    const body = /\/(auth\/me|user\/profile)$/.test(p) ? { success: true, user: ADMIN } : { success: true };
    return route.fulfill({ status: 200, contentType: 'application/json', headers, body: JSON.stringify(body) });
  });
  await page.goto(BASE + url);
}

for (const [from, to] of [
  ['/admin/#/users', '/admin/users'],
  ['/admin/#/monitoring?tab=online', '/admin/monitoring?tab=online'],
]) {
  test(`the old address ${from} becomes ${to}`, async ({ page }) => {
    await open(page, from);
    await page.waitForURL(BASE + to);
    await expect(page.locator('.admin-shell')).toBeVisible();
  });
}

test('the menu changes the address without "#", and a reload stays on the page', async ({ page }) => {
  await open(page, '/admin/');
  await page.locator('.admin-shell').waitFor();
  await page.evaluate(() => { window.__sameDocument = true; });
  const link = page.locator('.admin-shell a[href^="/admin/"]:not([href="/admin/"]):not([href="/admin/dashboard"])').first();
  const href = await link.getAttribute('href');
  await link.evaluate((a) => a.click());
  await page.waitForURL(BASE + href);
  expect(page.url()).not.toContain('#');
  expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
  await page.reload();
  await page.locator('.admin-shell').waitFor();
  expect(page.url()).toBe(BASE + href);
});

test('signed out: login remembers the admin page that was open', async ({ page }) => {
  await open(page, '/admin/users?page=2', { signedIn: false });
  await page.waitForURL(/\/login\.html\?next=/);
  expect(new URL(page.url()).searchParams.get('next')).toBe('/admin/users?page=2');
});
