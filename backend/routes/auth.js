const router   = require('express').Router();
const authCtrl = require('../controllers/auth.controller');

// ── Local auth ────────────────────────────────────────────────
router.post('/register', authCtrl.register);
router.post('/login',           authCtrl.login);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/verify-otp',      authCtrl.verifyOTP);
router.post('/reset-password',  authCtrl.resetPassword);

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
          const email = profile.emails?.[0]?.value;
          user = email ? await User.findOne({ email }) : null;

          if (user) {
            user.googleId = profile.id;
            user.authProvider = 'google';
            if (!user.avatar) user.avatar = profile.photos?.[0]?.value || '';
          } else {
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
  router.get('/google',          (req, res) => res.status(503).json({ success: false, message: 'Google OAuth chưa được cấu hình' }));
  router.get('/google/callback', (req, res) => res.redirect('/login.html?error=not_configured'));
}

module.exports = router;
