// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * admin-src is a React SPA (HashRouter) with NO dedicated in-app login
 * page/route (see admin-src/src/App.jsx — every route is wrapped in
 * <ProtectedRoute>, and there's no /login route defined at all). Instead,
 * admin-src/src/routes/ProtectedRoute.jsx does:
 *
 *   window.location.href = '/login.html?next=' + encodeURIComponent('/admin/' + hash)
 *
 * i.e. an unauthenticated visit to ANY admin-src route hard-redirects to
 * the *public* site's shared frontend/login.html, with a `next=` param to
 * bounce back after a real login. So "the admin SPA's login page renders"
 * in practice means: verifying that redirect happens and lands on a
 * working login form — which is what this spec checks.
 *
 * This assumes the admin build (admin-src/vite.config.js -> outDir
 * '../frontend/admin', base '/admin/') is being served from the SAME
 * static server/origin as the rest of frontend/ (baseURL in
 * playwright.config.js), since ProtectedRoute's redirect uses a
 * root-relative path ('/login.html') that only resolves correctly that
 * way. Run `cd admin-src && npm run build` at least once before this spec
 * if frontend/admin/ doesn't already contain a build.
 *
 * If you'd rather test against the Vite dev server directly
 * (`cd admin-src && npm run dev`, default port 5173) instead of the
 * static build, override with E2E_ADMIN_BASE_URL and adjust accordingly —
 * not wired up by default since vite.config.js sets base: '/admin/', which
 * the dev server does NOT serve at that sub-path the same way the static
 * build does, and guessing that behavior wrong felt worse than leaving it
 * manual.
 *
 * A spec asserting successful admin login + landing on the Dashboard would
 * need a seeded admin/teacher account (role: 'admin' or 'teacher' per
 * AuthContext.jsx's isAdmin/isTeacher) and is out of scope here — see
 * e2e/README.md.
 */

test('unauthenticated visit to the admin SPA redirects to the shared login page', async ({ page }) => {
  await page.goto('/admin/');

  // ProtectedRoute redirects via window.location.href — wait for that
  // navigation to actually land rather than racing it.
  await page.waitForURL(/\/login\.html(\?.*)?$/, { timeout: 10 * 1000 });

  expect(page.url()).toContain('/login.html');
  // The redirect-back target should be preserved so a real login can
  // bounce the admin straight back into /admin/.
  expect(page.url()).toContain('next=');

  await expect(page.locator('#loginForm')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
});

// Needs a seeded teacher/admin account (see AuthContext.jsx: isAdmin =
// user.role === 'admin', isTeacher = role === 'admin' || 'teacher') to
// exercise a real login -> /admin/#/dashboard redirect. No such fixture
// exists in this pass (see e2e/README.md) — left as fixme rather than
// silently skipped so it stays visible in test reports.
test.fixme(
  'a logged-in teacher/admin lands on the admin Dashboard',
  async () => {
    // 1. POST valid teacher/admin creds via the API (or fill+submit
    //    frontend/login.html) to obtain a real session.
    // 2. Navigate to /admin/ and assert the Dashboard (not a login
    //    redirect) renders, e.g. via a Dashboard-only heading/selector.
  }
);
