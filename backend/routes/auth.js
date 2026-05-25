const router    = require('express').Router();
const rateLimit = require('express-rate-limit');
const authCtrl  = require('../controllers/auth.controller');

// ── Rate limiters ─────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.' }
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ.' }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.' }
});

// ── Local auth ────────────────────────────────────────────────
router.post('/register', (_req, res) => {
  res.status(403).json({ success: false, message: 'Đăng ký tài khoản đã tạm dừng. Vui lòng liên hệ thầy Daniel Hà để được tạo tài khoản.' });
});
router.post('/login',           loginLimiter,  authCtrl.login);
router.post('/forgot-password', forgotLimiter, authCtrl.forgotPassword);
router.post('/verify-otp',      otpLimiter,    authCtrl.verifyOTP);
router.post('/reset-password',  otpLimiter,    authCtrl.resetPassword);

// ── Google OAuth (requires passport-google-oauth20 to be installed) ──
// Enabled only when GOOGLE_CLIENT_ID is configured in .env
if (process.env.GOOGLE_CLIENT_ID) {
  try {
    const passport = require('passport');
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    const User = require('../models/User');

    passport.use(new GoogleStrategy({
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // Check if email already exists → link account
          const email = profile.emails?.[0]?.value;
          user = email ? await User.findOne({ email }) : null;

          if (user) {
            user.googleId = profile.id;
            user.authProvider = 'google';
            if (!user.avatar) user.avatar = profile.photos?.[0]?.value || '';
          } else {
            // Create new user
            const base = (profile.displayName || 'user').toLowerCase().replace(/\s+/g, '');
            let username = base;
            let i = 1;
            while (await User.findOne({ username })) { username = `${base}${i++}`; }

            user = new User({
              googleId:     profile.id,
              email:        email || `${profile.id}@google.oauth`,
              username,
              firstName:    profile.name?.givenName  || '',
              lastName:     profile.name?.familyName || '',
              avatar:       profile.photos?.[0]?.value || '',
              authProvider: 'google'
            });
          }
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }));

    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser(async (id, done) => {
      try { done(null, await User.findById(id)); }
      catch (e) { done(e, null); }
    });

    router.get('/google',
      passport.authenticate('google', { scope: ['profile', 'email'], session: false })
    );
    router.get('/google/callback',
      passport.authenticate('google', { session: false, failureRedirect: '/login.html?error=google_failed' }),
      authCtrl.googleCallback
    );
  } catch (e) {
    console.warn('[Auth] passport-google-oauth20 not installed. Google login disabled.');
  }
} else {
  // Stub routes when not configured
  router.get('/google',          (req, res) => res.status(503).json({ success: false, message: 'Google OAuth chưa được cấu hình' }));
  router.get('/google/callback', (req, res) => res.redirect('/login.html?error=not_configured'));
}

module.exports = router;
