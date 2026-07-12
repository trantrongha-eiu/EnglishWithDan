'use strict';

// Registers the Google OAuth strategy with passport. Extracted from
// routes/auth.js's inline setup block, unchanged — including the
// try/catch fallback for when passport-google-oauth20 isn't installed.
// Returns the configured passport instance, or null if the library is
// missing (caller falls back to the "not configured" routes either way).
const config = require('./index');

function configureGooglePassport() {
  try {
    const passport = require('passport');
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    const User = require('../models/User');
    const authService = require('../services/authService');

    passport.use(new GoogleStrategy({
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: `${config.backendUrl || 'http://localhost:5000'}/api/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.findOrCreateGoogleUser(profile);
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }));

    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser(async (id, done) => {
      try { done(null, await User.findById(id).select('-resetOTP -resetOTPExpires')); }
      catch (e) { done(e, null); }
    });

    return passport;
  } catch (e) {
    console.warn('[Auth] passport-google-oauth20 not installed. Google login disabled.');
    return null;
  }
}

module.exports = { configureGooglePassport };
