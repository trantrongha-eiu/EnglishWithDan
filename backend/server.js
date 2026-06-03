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
app.use(express.json({ limit: '20mb' }));
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
  .then(async () => {
    console.log('MongoDB Atlas connected');
    console.log('OpenRouter key:', process.env.OPENROUTER_API_KEY ? 'YES ✓' : 'MISSING ✗');
    console.log('Anthropic key:', process.env.ANTHROPIC_API_KEY  ? 'YES ✓' : 'MISSING ✗ (AI grading disabled)');
    console.log('Google OAuth:',   process.env.GOOGLE_CLIENT_ID    ? 'YES ✓' : 'disabled');
    console.log('Email:',          process.env.EMAIL_USER           ? 'YES ✓' : 'disabled');
    // Auto-seed writing practice exercises if DB is empty
    try {
      const WPExercise = require('./models/WPExercise');
      const count = await WPExercise.countDocuments();
      if (count < 450) {
        console.log(`[Seed] WPExercise has ${count}/450 exercises – running seed...`);
        await require('./scripts/seedWritingPractice').runSeed();
        console.log('[Seed] Done ✓');
      } else {
        console.log(`[Seed] WPExercise already has ${count} exercises – skip`);
      }
    } catch (e) {
      console.error('[Seed] Error:', e.message);
    }
    // Auto-seed Task 1 exercises
    try {
      const Task1Exercise = require('./models/Task1Exercise');
      const { exercises: t1data, runSeed: runTask1Seed } = require('./scripts/seedTask1Exercises');
      const t1count = await Task1Exercise.countDocuments();
      if (t1count < t1data.length) {
        console.log(`[Task1Seed] Has ${t1count}/${t1data.length} – seeding...`);
        await runTask1Seed();
        console.log('[Task1Seed] Done ✓');
      } else {
        console.log(`[Task1Seed] Already has ${t1count} exercises – skip`);
      }
    } catch (e) {
      console.error('[Task1Seed] Error:', e.message);
    }
    // Auto-seed Task 2 topics
    try {
      const Task2Topic = require('./models/Task2Topic');
      const { topics: t2data, runSeed: runTask2Seed } = require('./scripts/seedTask2Exercises');
      const t2count = await Task2Topic.countDocuments();
      const t2topics = await Task2Topic.find({}, 'questions').lean();
      const t2qcount = t2topics.reduce((acc, t) => acc + (t.questions || []).length, 0);
      const t2qExpected = t2data.reduce((acc, t) => acc + (t.questions || []).length, 0);
      if (t2count < t2data.length || t2qcount < t2qExpected) {
        console.log(`[Task2Seed] Has ${t2count}/${t2data.length} topics, ${t2qcount}/${t2qExpected} questions – seeding...`);
        await runTask2Seed();
        console.log('[Task2Seed] Done ✓');
      } else {
        console.log(`[Task2Seed] Already has ${t2count} topics, ${t2qcount} questions – skip`);
      }
    } catch (e) {
      console.error('[Task2Seed] Error:', e.message);
    }
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
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/courses',         require('./routes/courses'));
app.use('/api/writing-practice', require('./routes/writingPractice'));
app.use('/api/task1',           require('./routes/task1Practice'));
app.use('/api/task2',           require('./routes/task2Practice'));
app.use('/api/difficult-words', require('./routes/difficultWords'));

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
