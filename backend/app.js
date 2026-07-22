// Express app construction — split out of server.js so tests (Supertest)
// can import a fully-configured app without triggering a real Mongo
// connection, auto-seed scripts, cron jobs, or a listening HTTP server.
// server.js remains the production entry point: it requires this file,
// then handles Mongo connect/seed/cron/listen exactly as before.
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const mongoSanitize = require('./middleware/mongoSanitize');
const errorHandler  = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Render terminates TLS and proxies at a single edge hop — trust exactly
// that one hop's X-Forwarded-For entry so req.ip reflects the real client,
// not Render's internal proxy address. Without this, every IP-keyed
// rate limiter (login/register/OTP, the public contact form) collapses
// onto one shared bucket for the entire site (security audit finding).
// MUST be a numeric hop count, never `true` — `true` trusts every hop
// including client-supplied X-Forwarded-For entries, which would let an
// attacker spoof a fresh IP per request and bypass rate limiting entirely.
app.set('trust proxy', 1);

// ── Middleware ────────────────────────────────────────────────
// Always-allowed origins: production custom domain (+ www) and local dev
// servers. FRONTEND_URL can add more (e.g. a staging domain) as a
// comma-separated list — it extends this list, it does not replace it.
const DEFAULT_ALLOWED_ORIGINS = [
  'https://ieltsthayha.com',
  'https://www.ieltsthayha.com',
  'http://localhost:3000',
  'http://localhost:5173'
];
const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim().replace(/\/$/, ''))
  : [];
const allowedOrigins = [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins])];

// crossOriginResourcePolicy: 'same-origin' (Helmet's default) blocks the
// browser from using cross-origin fetch responses independently of CORS —
// this API is deliberately called from a different origin (the frontend),
// so it must opt in to cross-origin.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: (origin, callback) => {
    // No literal '*' match: with credentials:true, wildcard origins must
    // never be honored (the cors package would otherwise reflect back
    // whatever Origin header the caller sent).
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.security('CORS: rejected origin', { origin, allowedOrigins });
      // cors calls next(err) internally for a rejected origin, which would
      // otherwise reach errorHandler.js and log this same event a second
      // time (production-readiness audit finding) — mark it so that
      // handler can skip its own logging for this specific error.
      const corsErr = new Error('Not allowed by CORS');
      corsErr.alreadyLogged = true;
      callback(corsErr);
    }
  },
  credentials: true
}));
app.use(require('compression')());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize);

// Passport (for Google OAuth if configured)
if (process.env.GOOGLE_CLIENT_ID) {
  try {
    const passport = require('passport');
    app.use(passport.initialize());
  } catch {
    console.warn('[Server] passport not installed, Google OAuth disabled');
  }
}

// ── Root ──────────────────────────────────────────────────────
app.get('/', (_req, res) => res.send('EnglishWithDan API is running 🚀'));

// ── Health / readiness / liveness (Phase 11) ────────────────────
// Unauthenticated, outside /api/* — infra-level, not part of the API
// surface. See routes/health.js for what each endpoint checks.
app.use('/health', require('./routes/health'));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/user',     require('./routes/user'));
app.use('/api/vocab',    require('./routes/vocab'));
app.use('/api/vocabbook',require('./routes/vocabBook'));
app.use('/api/reading',  require('./routes/reading'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/listening',require('./routes/listening'));
app.use('/api/writing',  require('./routes/writing'));
app.use('/api/speaking', require('./routes/speaking'));
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/track',    require('./routes/track'));
app.use('/api/courses',         require('./routes/courses'));
app.use('/api/writing-practice', require('./routes/writingPractice'));
app.use('/api/task1',           require('./routes/task1Practice'));
app.use('/api/task2',           require('./routes/task2Practice'));
app.use('/api/task2template',   require('./routes/task2Template'));
app.use('/api/essential-grammar', require('./routes/essentialGrammar'));
app.use('/api/difficult-words', require('./routes/difficultWords'));
app.use('/api/tuition',        require('./routes/tuition'));
app.use('/api/upgrade',        require('./routes/upgrade'));

// ── 404 handler ──────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route không tồn tại' }));

// ── Global error handler ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
