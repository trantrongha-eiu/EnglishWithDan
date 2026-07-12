// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * frontend/login.html and frontend/register.html both call a HARDCODED
 * production API URL (https://englishwithdan.onrender.com) directly in
 * their inline <script> — they do NOT call the locally-running backend,
 * and there is no env-based override. That's existing behavior; this spec
 * does not fight it. Practical effect:
 *
 *  - Submitting the login form ALWAYS hits the real production API (or, if
 *    this machine has no outbound network access, the fetch() itself
 *    fails). Either way the page's own catch-block / error-toast path is
 *    exercised, which is exactly what we want to smoke-test here: bogus
 *    credentials never let the user in, and SOME visible error is shown.
 *  - We intentionally do NOT assert on exact wording ("Đăng nhập thất
 *    bại" vs "Lỗi kết nối") since which one fires depends on network
 *    reachability from the test runner, not on anything we're testing.
 *  - We do NOT rely on any seeded account existing — an "invalid login"
 *    is invalid whether or not the account exists.
 */

test.describe('Login page', () => {
  test('renders the login form', async ({ page }) => {
    await page.goto('/login.html');

    await expect(page.locator('#loginForm')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('.btn-login')).toBeVisible();
  });

  test('shows an error toast for an invalid login attempt', async ({ page }) => {
    // Real network round-trip to production (or a failed fetch if this
    // sandbox has no outbound network) — give it more room than the
    // default per-test timeout.
    test.setTimeout(60 * 1000);

    await page.goto('/login.html');

    await page.locator('#email').fill('definitely-not-a-real-user@example.com');
    await page.locator('#password').fill('wrong-password-123');
    await page.locator('.btn-login').click();

    // toast.js appends a `.toast.error` (or `.toast.banned`) node with a
    // `.toast-msg` into a lazily-created #toast-container — see
    // frontend/js/shared/toast.js. Any non-empty error toast text is a
    // pass; we don't assert on wording (see file header comment).
    const errorToast = page.locator('.toast.error .toast-msg, .toast.banned .toast-msg');
    await expect(errorToast.first()).toBeVisible({ timeout: 45 * 1000 });
    await expect(errorToast.first()).not.toHaveText('');

    // The button must re-enable and the form must NOT navigate away —
    // an invalid attempt should never leave the user "half logged in".
    await expect(page).toHaveURL(/login\.html/);
    await expect(page.locator('.btn-login')).toBeEnabled();
  });

  test('required fields block empty submission (HTML5 validation)', async ({ page }) => {
    await page.goto('/login.html');

    await page.locator('.btn-login').click();

    // Native "required" validation keeps the browser on the same page
    // with no navigation and no toast fired.
    await expect(page).toHaveURL(/login\.html/);
    const emailValidity = await page.locator('#email').evaluate((el) => el.validity.valid);
    expect(emailValidity).toBe(false);
  });
});

test.describe('Register page', () => {
  test('renders the registration form', async ({ page }) => {
    await page.goto('/register.html');

    await expect(page.locator('#registerForm')).toBeVisible();
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
    await expect(page.locator('.btn-register')).toBeVisible();
  });

  test('required-field validation prevents an empty submission', async ({ page }) => {
    await page.goto('/register.html');

    await page.locator('.btn-register').click();

    // Nothing filled in -> native `required` on #firstName (first field in
    // the form) should block submission and keep us on register.html.
    await expect(page).toHaveURL(/register\.html/);
    const firstNameValidity = await page.locator('#firstName').evaluate((el) => el.validity.valid);
    expect(firstNameValidity).toBe(false);
  });

  test('client-side validation rejects a too-short password before any network call', async ({ page }) => {
    // This exercises register.html's own pre-submit JS checks (password
    // length, confirm-password match, terms checkbox) which run BEFORE the
    // fetch() to the production API — so this is a pure client-side check,
    // no seeded account or backend reachability required.
    await page.goto('/register.html');

    await page.locator('#firstName').fill('Nguyen');
    await page.locator('#lastName').fill('Van A');
    await page.locator('#username').fill('e2e_test_user');
    await page.locator('#email').fill('e2e-test@example.com');
    await page.locator('#password').fill('short'); // < 8 chars, also fails minlength
    await page.locator('#confirmPassword').fill('short');
    await page.locator('#terms').check();

    await page.locator('.btn-register').click();

    // Either the HTML5 minlength=8 constraint or the inline JS check
    // ("Mật khẩu phải có ít nhất 8 ký tự!") stops submission — either way
    // we must still be on register.html.
    await expect(page).toHaveURL(/register\.html/);
  });
});
