// Google sign-up from register.html (?mode=register) creates the account
// but issues no session: the callback sends the student to login.html.
// A normal Google login still goes to auth-callback.html with a token.
jest.mock('passport', () => ({ authenticate: jest.fn() }));
jest.mock('../../../services/authService', () => ({
  completeGoogleLogin: jest.fn(async () => ({ token: 'jwt123', user: { id: 'u1' } })),
}));
jest.mock('../../../services/shopService', () => ({ announceLogin: jest.fn(async () => {}) }));

const passport = require('passport');
const authService = require('../../../services/authService');
const ctrl = require('../../../controllers/auth.controller');

function startAndCaptureState(query) {
  let state;
  passport.authenticate.mockImplementation((name, opts) => { state = opts.state; return () => {}; });
  const res = { setHeader: jest.fn() };
  ctrl.startGoogleAuth({ query }, res, () => {});
  return state;
}
// googleCallback is async (completeGoogleLogin claims a device slot).
async function callback(state) {
  const res = { redirect: jest.fn() };
  await ctrl.googleCallback({ user: { isBanned: false }, query: { state } }, res);
  return res.redirect.mock.calls[0][0];
}

beforeEach(() => jest.clearAllMocks());

test('mode=register → login.html?registered=google, no token issued', async () => {
  const url = await callback(startAndCaptureState({ mode: 'register' }));
  expect(url).toMatch(/\/login\.html\?registered=google$/);
  expect(url).not.toMatch(/token=/);
  expect(authService.completeGoogleLogin).not.toHaveBeenCalled();
});

test('mode=register keeps a safe next param', async () => {
  const url = await callback(startAndCaptureState({ mode: 'register', next: '/dashboard.html' }));
  expect(url).toMatch(/\/login\.html\?registered=google&next=%2Fdashboard\.html$/);
});

test('normal login → auth-callback.html with token and next', async () => {
  const url = await callback(startAndCaptureState({ next: '/dashboard.html' }));
  expect(url).toMatch(/\/auth-callback\.html\?token=jwt123&user=.+&next=%2Fdashboard\.html$/);
  expect(authService.completeGoogleLogin).toHaveBeenCalledTimes(1);
});

test('banned user is still blocked on sign-up', async () => {
  const state = startAndCaptureState({ mode: 'register' });
  const res = { redirect: jest.fn() };
  await ctrl.googleCallback({ user: { isBanned: true }, query: { state } }, res);
  expect(res.redirect.mock.calls[0][0]).toMatch(/login\.html\?error=banned$/);
});
