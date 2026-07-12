'use strict';

// Centralizes environment-variable access. Deliberately does NOT throw on
// missing vars — several are already optional-with-graceful-degradation
// today (Google OAuth, AI grading, email all check `if (process.env.X)`
// and disable that feature rather than crash, see server.js's startup log).
// Making any of these fail-fast here would be a startup-behavior change,
// which this phase's brief explicitly rules out. This module only
// centralizes *where* env vars are read from — it doesn't add validation.

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,

  frontendUrl: process.env.FRONTEND_URL || '',
  backendUrl: process.env.BACKEND_URL || '',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  ai: {
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    resendApiKey: process.env.RESEND_API_KEY,
  },
};
