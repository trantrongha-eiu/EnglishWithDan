// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Smoke test: the core public marketing pages load, render visible
 * content (navbar + a top-level heading), and don't throw a JS console
 * error or an uncaught page error. This is intentionally shallow — it is
 * NOT asserting on copy, layout, or business logic, just "the page isn't
 * broken/blank."
 *
 * Pages under test (confirmed to exist under frontend/*.html):
 *   index.html, courses.html, about.html, contact.html
 *
 * Some of these pages fetch data from an external API on load
 * (courses.html -> GET {API}/courses) and fall back to static content on
 * failure (see the try/catch in courses.html's loadCoursesFromAPI()), so
 * these tests do NOT require the backend to be running — a network
 * failure there is swallowed by the page itself, not surfaced as a
 * console error.
 *
 * KNOWN PRE-EXISTING FINDING (discovered while writing this spec, left
 * unfixed per this pass's "don't touch source files" scope): index.html
 * hard-codes <img> tags for six course-thumbnail files that do not exist
 * in frontend/img/ — course-starter.jpg, course-3to6.jpg, course-6to7.jpg,
 * course-speaking.jpg, course-comm.jpg, course-business.jpg (courses.html
 * references the same filenames but renders them dynamically post-load
 * with an onerror fallback, so it's less consistently affected). Each
 * missing image makes Chromium itself emit a
 * "Failed to load resource: the server responded with a status of 404"
 * console message — that's a genuine broken-asset bug, but it is resource
 * loading noise, not an application script error, so we deliberately
 * don't fail this smoke suite on it (see the filter below). A real fix
 * would be adding the missing files under frontend/img/ or removing the
 * dead references — out of scope here.
 */

const PAGES = ['/index.html', '/courses.html', '/about.html', '/contact.html'];

// Browser-generated "resource failed to load" notices (broken <img>/<link>/
// fetch targets) surface via page.on('console') exactly like a real
// console.error() call from application code, but they're not a script
// bug — see the KNOWN PRE-EXISTING FINDING note above. We filter these out
// so this suite catches actual JS errors without being noisy about known,
// out-of-scope missing assets.
const isResourceLoadNoise = (text) => /Failed to load resource/i.test(text);

for (const path of PAGES) {
  test(`${path} loads without console/page errors and renders visible content`, async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isResourceLoadNoise(msg.text())) consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      pageErrors.push(String(err));
    });

    const response = await page.goto(path);
    expect(response, `no response for ${path}`).not.toBeNull();
    expect(response.status(), `unexpected HTTP status for ${path}`).toBeLessThan(400);

    // Not a blank/broken screen: the shared navbar and a top-level heading
    // are present on every one of these public pages.
    await expect(page.locator('#navbar')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(0);

    expect(consoleErrors, `console.error() calls on ${path}:\n${consoleErrors.join('\n')}`).toEqual([]);
    expect(pageErrors, `uncaught exceptions on ${path}:\n${pageErrors.join('\n')}`).toEqual([]);
  });
}
