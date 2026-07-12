const router   = require('express').Router();
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const authCtrl = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const config = require('../config');
const { configureGooglePassport } = require('../config/passport');
const logger = require('../utils/logger');

// ── Brute-force protection ──────────────────────────────────
// Keyed by IP + the account identifier being targeted, so one attacker can't
// spray many accounts from one IP, and one IP isn't fully blocked just because
// several legitimate users share it (e.g. an office network).
// ipKeyGenerator normalizes IPv6 addresses (required by express-rate-limit v8+).
const keyByIpAndIdentifier = req =>
  `${ipKeyGenerator(req.ip)}:${(req.body?.email || req.body?.username || '').toLowerCase()}`;

const authLimiter = (max) => rateLimit({
  windowMs: 15 * 60 * 1000,
  max,
  keyGenerator: keyByIpAndIdentifier,
  standardHeaders: true,
  legacyHeaders: false,
  // Rate-limit hits were previously silent — "rate-limit monitoring" had
  // no actual signal to monitor (production-readiness audit finding).
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.' });
  }
});

const loginLimiter          = authLimiter(10);
const registerLimiter       = authLimiter(5);
const forgotPasswordLimiter = authLimiter(5);
const verifyOtpLimiter      = authLimiter(10);
const resetPasswordLimiter  = authLimiter(10);

// ── Local auth ────────────────────────────────────────────────
router.post('/register', registerLimiter, authCtrl.register);
router.post('/login',           loginLimiter,          authCtrl.login);
router.post('/forgot-password', forgotPasswordLimiter, authCtrl.forgotPassword);
router.post('/verify-otp',      verifyOtpLimiter,       authCtrl.verifyOTP);
router.post('/reset-password',  resetPasswordLimiter,   authCtrl.resetPassword);

router.get('/me', auth, authCtrl.me);

// ── Google OAuth (requires passport-google-oauth20 to be installed) ──
// Enabled only when GOOGLE_CLIENT_ID is configured in .env
function registerGoogleFallbackRoutes() {
  router.get('/google',          (req, res) => res.status(503).json({ success: false, message: 'Google OAuth chưa được cấu hình' }));
  router.get('/google/callback', (req, res) => res.redirect('/login.html?error=not_configured'));
}

if (config.google.clientId) {
  const passport = configureGooglePassport();
  if (passport) {
    router.get('/google', authCtrl.startGoogleAuth);
    router.get('/google/callback',
      authCtrl.verifyOAuthState,
      passport.authenticate('google', { session: false, failureRedirect: '/login.html?error=google_failed' }),
      authCtrl.googleCallback
    );
  } else {
    registerGoogleFallbackRoutes();
  }
} else {
  registerGoogleFallbackRoutes();
}

module.exports = router;
