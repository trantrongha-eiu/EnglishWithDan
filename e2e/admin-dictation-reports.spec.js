// @ts-check
/**
 * Admin "Báo lỗi Dictation" (/admin/dictation-reports): the report queue,
 * fixing a reported sentence (text + timing) from its dialog, dismissing,
 * and the Cấu hình dialog (on/off, reasons). Built frontend/ is served with
 * the host's rewrites imitated; the API is a mock, production is never touched.
 *
 * Run: npx playwright test e2e/admin-dictation-reports.spec.js
 *      E2E_SHOTS=<dir> saves screenshots.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

const FRONTEND = path.resolve(process.env.E2E_FRONTEND || path.join(__dirname, '..', 'frontend'));
const SHOTS = process.env.E2E_SHOTS || '';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.wav': 'audio/wav' };
const ADMIN = { _id: 'a1', id: 'a1', username: 'admin', firstName: 'Quản', lastName: 'Trị', role: 'admin' };
let BASE = '';
let server;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/test-audio.wav') { // 6 s of silence
      const rate = 8000; const n = rate * 6; const b = Buffer.alloc(44 + n);
      b.write('RIFF', 0); b.writeUInt32LE(36 + n, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
      b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate, 28); b.writeUInt16LE(1, 32); b.writeUInt16LE(8, 34); b.write('data', 36); b.writeUInt32LE(n, 40); b.fill(128, 44);
      res.writeHead(200, { 'Content-Type': 'audio/wav' }); res.end(b); return;
    }
    if (p.endsWith('/')) p += 'index.html';
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

function makeState() {
  const audio = `${BASE}/test-audio.wav`;
  return {
    settings: { enabled: true, thankOnFix: true, reasons: [{ key: 'wrong_text', label: 'Đáp án sai chữ' }, { key: 'cut_audio', label: 'Audio bị cắt' }, { key: 'other', label: 'Lỗi khác' }] },
    reports: [
      { _id: 'r1', kind: 'section', targetId: 's1', sectionId: 's1', lessonTitle: 'Cam 18 Test 1 Part 1', sentenceIndex: 1, userName: 'An Trần',
        sentenceText: 'The tour starts at ten.', start: 2, end: 4, reason: 'wrong_text', reasonLabel: 'Đáp án sai chữ', note: 'audio nói eleven',
        typedText: 'The tour starts at eleven.', status: 'open', sameOpen: 2, createdAt: new Date().toISOString(),
        current: { text: 'The tour starts at ten.', start: 2, end: 4, audioUrl: audio, answer: '' } },
      { _id: 'r2', kind: 'drill', targetId: 'd1', drillId: 'd1', drillSlug: 'spelling-1', lessonTitle: 'Spelling · Set 1', sentenceIndex: 0, userName: 'Bình',
        sentenceText: "It's K-E-O-G-H.", answer: 'Keogh', start: 0, end: 3, reason: 'cut_audio', reasonLabel: 'Audio bị cắt', note: '',
        status: 'open', sameOpen: 1, createdAt: new Date().toISOString(),
        current: { text: "It's K-E-O-G-H.", start: 0, end: 3, audioUrl: audio, answer: 'Keogh' } },
    ],
    sentence: {
      kind: 'section', targetId: 's1', title: 'Cam 18 Test 1 Part 1', index: 1, total: 3,
      sentence: { text: 'The tour starts at ten.', start: 2, end: 4, audioUrl: audio, answer: '' },
      prev: { text: 'Good morning.', start: 0, end: 2, audioUrl: audio }, next: { text: 'Bring a hat.', start: 4, end: 6, audioUrl: audio },
    },
  };
}

async function openAdmin(page, state) {
  const log = [];
  await page.addInitScript((u) => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('lastLoginAt', String(Date.now()));
  }, ADMIN);
  await page.route(/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/, (r) => r.abort());
  await page.route('https://englishwithdan.onrender.com/**', (route) => {
    const req = route.request();
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    const u = new URL(req.url());
    const p = u.pathname.replace(/^\/api/, '');
    if (req.method() !== 'GET') log.push(`${req.method()} ${p} ${req.postData() || ''}`);
    let body = { success: true };
    if (/\/(auth\/me|user\/profile)$/.test(p)) body = { success: true, user: ADMIN };
    if (p === '/admin/sidebar-badges') body = { success: true, onlineUsers: [], dictationReports: state.reports.filter((r) => r.status === 'open').length };
    if (p === '/admin/dictation-reports' && req.method() === 'GET') {
      const status = u.searchParams.get('status') || 'open';
      const rows = state.reports.filter((r) => status === 'all' || r.status === status);
      const counts = { open: 0, fixed: 0, dismissed: 0 };
      state.reports.forEach((r) => { counts[r.status] += 1; });
      body = { success: true, reports: rows, total: rows.length, page: 1, limit: 30, counts, settings: state.settings };
    }
    if (p === '/admin/dictation-reports/settings' && req.method() === 'PUT') {
      const b = req.postDataJSON();
      state.settings = { ...state.settings, ...b, reasons: b.reasons.map((r, i) => ({ key: r.key || `new_${i}`, label: r.label })) };
      body = { success: true, settings: state.settings };
    }
    let m = p.match(/^\/admin\/dictation-reports\/sentence\/(\w+)\/(\w+)\/(\d+)$/);
    if (m && req.method() === 'GET') body = { success: true, ...state.sentence };
    if (m && req.method() === 'PUT') {
      state.reports.forEach((r) => { if (r.targetId === m[2]) r.status = 'fixed'; });
      body = { success: true, closed: 2, sentence: req.postDataJSON() };
    }
    m = p.match(/^\/admin\/dictation-reports\/(\w+)$/);
    if (m && req.method() === 'PATCH') {
      const r = state.reports.find((x) => x._id === m[1]);
      r.status = req.postDataJSON().status;
      body = { success: true, updated: 1 };
    }
    return route.fulfill({ status: 200, contentType: 'application/json', headers, body: JSON.stringify(body) });
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${BASE}/admin/dictation-reports`);
  return { log, errors };
}

test('the queue lists open reports with the sentence now; the sidebar shows the count', async ({ page }) => {
  const { errors } = await openAdmin(page, makeState());
  const rows = page.locator('table tbody tr');
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toContainText('Cam 18 Test 1 Part 1');
  await expect(rows.first()).toContainText('câu 2');
  await expect(rows.first()).toContainText('“audio nói eleven”');
  await expect(rows.first()).toContainText('2 HS báo câu này');
  await expect(rows.nth(1)).toContainText('Keogh — ');
  await expect(page.locator('.inner-tab.active')).toContainText('Chờ xử lý (2)');
  await expect(page.locator('a[href="/admin/dictation-reports"], a[href$="/dictation-reports"]').first()).toContainText('2');
  await shot(page, 'dictation-reports-admin');
  expect(errors).toEqual([]);
});

test('a report opens its sentence: re-time + fix the text, save closes the reports', async ({ page }) => {
  const state = makeState();
  const { log, errors } = await openAdmin(page, state);
  await page.locator('table tbody tr').first().getByRole('button', { name: 'Xem & sửa' }).click();
  const dlg = page.getByRole('dialog');
  await expect(dlg).toContainText('Học sinh đã gõ: The tour starts at eleven.');
  await expect(dlg).toContainText('+1 báo lỗi khác cùng câu');
  await expect(dlg).toContainText('“Good morning.”');
  await expect(dlg).toContainText('“Bring a hat.”');
  const save = dlg.getByRole('button', { name: /Lưu & đóng báo lỗi/ });
  await expect(save).toBeDisabled();
  await dlg.getByLabel('Câu đáp án').fill('The tour starts at eleven.');
  await dlg.getByRole('button', { name: '+.1' }).nth(1).click(); // end 4 → 4.1
  await dlg.getByRole('button', { name: '−.1' }).first().click(); // start 2 → 1.9
  await expect(dlg).toContainText('dài 2.20 s');
  await dlg.getByPlaceholder(/chỉnh lại mốc/).fill('retimed');
  await shot(page, 'dictation-reports-fix');
  await save.click();
  await expect(dlg).toBeHidden();
  const put = log.find((l) => l.startsWith('PUT /admin/dictation-reports/sentence/section/s1/1'));
  expect(JSON.parse(put.slice(put.indexOf('{')))).toEqual({ text: 'The tour starts at eleven.', start: 1.9, end: 4.1, answer: '', adminNote: 'retimed' });
  await expect(page.locator('table tbody tr')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('dismiss from the row; Cấu hình turns the button off and edits the reasons', async ({ page }) => {
  const state = makeState();
  const { log } = await openAdmin(page, state);
  await page.locator('table tbody tr').nth(1).getByRole('button', { name: 'Bỏ qua' }).click();
  await expect(page.locator('table tbody tr')).toHaveCount(1);
  expect(log.find((l) => l.startsWith('PATCH /admin/dictation-reports/r2'))).toContain('"status":"dismissed","sameSentence":true');

  await page.getByRole('button', { name: '⚙️ Cấu hình' }).click();
  const dlg = page.getByRole('dialog');
  await dlg.locator('label.switch', { hasText: 'Hiện nút' }).click();
  await expect(dlg.getByLabel('Bật nút báo lỗi')).not.toBeChecked();
  await dlg.getByLabel('Lý do 2', { exact: true }).fill('Audio bị cắt đầu/cuối');
  await dlg.getByRole('button', { name: '＋ Thêm lý do' }).click();
  await dlg.getByLabel('Lý do 4', { exact: true }).fill('Thiếu từ');
  await shot(page, 'dictation-reports-settings');
  await dlg.getByRole('button', { name: 'Lưu cấu hình' }).click();
  await expect(dlg).toBeHidden();
  const put = log.find((l) => l.startsWith('PUT /admin/dictation-reports/settings'));
  expect(JSON.parse(put.slice(put.indexOf('{')))).toEqual({
    enabled: false, thankOnFix: true,
    reasons: [{ key: 'wrong_text', label: 'Đáp án sai chữ' }, { key: 'cut_audio', label: 'Audio bị cắt đầu/cuối' }, { key: 'other', label: 'Lỗi khác' }, { key: '', label: 'Thiếu từ' }],
  });
  await expect(page.locator('.hint-box').first()).toContainText('Nút báo lỗi đang tắt');
});
