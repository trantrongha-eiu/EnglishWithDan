const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

// Cloudinary config
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// ── Middleware ────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim().replace(/\/$/, ''))
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport (for Google OAuth if configured)
if (process.env.GOOGLE_CLIENT_ID) {
  try {
    const passport = require('passport');
    app.use(passport.initialize());
  } catch {
    console.warn('[Server] passport not installed, Google OAuth disabled');
  }
}

// ── DB ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas connected');
    console.log('OpenRouter key:', process.env.OPENROUTER_API_KEY ? 'YES ✓' : 'MISSING ✗');
    console.log('Google OAuth:',   process.env.GOOGLE_CLIENT_ID    ? 'YES ✓' : 'disabled');
    console.log('Email:',          process.env.EMAIL_USER           ? 'YES ✓' : 'disabled');
  })
  .catch(err => console.error('MongoDB error:', err));

// ── Root ──────────────────────────────────────────────────────
app.get('/', (_req, res) => res.send('EnglishWithDan API is running 🚀'));

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
app.use('/api/history',  require('./routes/history'));

// ── 404 handler ──────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route không tồn tại' }));

// ── Global error handler ─────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Lỗi server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
