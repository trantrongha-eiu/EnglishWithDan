# E2E Tests (Playwright) — Phase 10

Smoke/critical-path tests only, not exhaustive coverage.

## Covered

- **auth.spec.js** — login.html and register.html render their forms;
  invalid login shows a visible error toast and never navigates away;
  empty/too-short submissions are blocked client-side (HTML5 `required`/
  `minlength` + register.html's own pre-submit checks). No seeded account
  needed — "invalid" doesn't require the account to exist.
- **navigation.spec.js** — index, courses, about, contact.html each load
  (HTTP < 400), show the shared navbar + an `<h1>`, and produce zero
  `console.error`/uncaught-exception events.
- **admin-login.spec.js** — an unauthenticated visit to the admin SPA
  (`/admin/`) redirects to the shared `login.html?next=...` and that page's
  form renders. admin-src has no separate login route of its own —
  `ProtectedRoute.jsx` hard-redirects here.

## Intentionally skipped / fixme

- `admin-login.spec.js` has a `test.fixme` for "logged-in teacher/admin
  reaches the Dashboard" — needs a seeded teacher/admin account (`role:
  'admin'|'teacher'`), which is out of scope for this pass.
- No spec asserts a *successful* login/registration end-to-end, since that
  needs a seeded, known-good account/credentials in a real database.
- `login.html`/`register.html` call a **hardcoded production API**
  (`https://englishwithdan.onrender.com`), not a local backend — see the
  comment header in `auth.spec.js`. The "invalid login" test therefore
  exercises real network/production behavior (or the page's own
  connection-failure path if offline), not a locally seeded response.

## Running locally

1. `npm install` (repo root) then `npx playwright install chromium` (first time).
2. Serve `frontend/` statically on port 3000, e.g.: `npx http-server frontend -p 3000`
   (use http-server, not `npx serve`, which rewrites `.html` URLs by default
   and breaks the `.html`-suffixed URL assertions here — see
   `playwright.config.js`. The admin SPA build already lives at
   `frontend/admin/`, served from the same origin — run
   `cd admin-src && npm run build` first if it's missing).
3. (Optional, not required by these specs) backend on :5000: `cd backend && npm start`.
4. `npm run test:e2e` (or `npm run test:e2e:ui` for the interactive runner).

Override the target with `E2E_BASE_URL=http://localhost:3000 npm run test:e2e`.
