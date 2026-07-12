// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Root Playwright config for EnglishWithDan E2E smoke tests (Phase 10).
 *
 * ── What must be running BEFORE `npm run test:e2e` ─────────────────────
 * This repo has no existing dev-server script for the vanilla-JS public
 * frontend (frontend/*.html is plain static files, no build step), so
 * `webServer` is intentionally left UNCONFIGURED below rather than guessing
 * a startup command that might not match how this app is actually served.
 * To run the suite locally, start these yourself, in separate terminals:
 *
 *   1. Static file server for frontend/, on port 3000 (matches the default
 *      baseURL below), e.g.:
 *        npx http-server frontend -p 3000
 *      NOTE: prefer http-server over `npx serve` here — `serve` rewrites
 *      /login.html -> /login (clean URLs) by default, which breaks the
 *      `.html`-suffixed URL assertions in these specs and doesn't match
 *      how the app's own code (window.location.href = '/login.html...')
 *      expects to be addressed. http-server serves paths as-is.
 *      This also serves the built admin SPA, since admin-src/vite.config.js
 *      builds it to frontend/admin/ (base: '/admin/') — so frontend/admin/
 *      index.html is reachable at http://localhost:3000/admin/ once you've
 *      run `cd admin-src && npm run build` at least once.
 *
 *   2. Backend API, on port 5000 (its default — see backend/server.js):
 *        cd backend && npm start
 *      NOTE: e2e/auth.spec.js does NOT actually depend on this being up —
 *      frontend/login.html and register.html both call the hardcoded
 *      production API (https://englishwithdan.onrender.com) directly, not
 *      a local backend (see comments in auth.spec.js). The backend is only
 *      listed here for completeness / future specs that may need it.
 *
 *   3. (Optional) admin-src Vite dev server, if you'd rather test against
 *      that instead of the static build:
 *        cd admin-src && npm run dev
 *      Vite's default port is 5173 — set E2E_ADMIN_BASE_URL if you use this
 *      instead of the frontend/admin/ static build (see admin-login.spec.js).
 *
 * Then, from the repo root:
 *   npm install
 *   npx playwright install chromium   (first time only)
 *   npm run test:e2e
 *
 * Override the base URL for a differently-configured environment with:
 *   E2E_BASE_URL=http://localhost:3000 npm run test:e2e
 */
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // webServer intentionally omitted — see comment block above.
});
