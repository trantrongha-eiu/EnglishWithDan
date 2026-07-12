const mongoose = require('mongoose');
require('dotenv').config();
const logger = require('./utils/logger');

// Cloudinary config
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// App construction (middleware, CORS, routes, error handler) lives in
// app.js so tests can import it directly without triggering the Mongo
// connect/seed/cron/listen side effects below (see app.js's header comment).
const app = require('./app');
const tuitionCron = require('./cron/tuitionReminder');

// ── Process-level safety nets (Phase 11) ────────────────────────
// An uncaught exception leaves the process in an unknown state — log it
// with full detail, then exit so the platform (Render) restarts a clean
// process, rather than continuing to serve requests from a possibly
// corrupted state.
process.on('uncaughtException', (err) => {
  // errorMessage (not "message") avoids silently overwriting the log
  // entry's own top-level `message` field via object spread in logger.js.
  logger.error('process', 'Uncaught exception — exiting for a clean restart', {
    errorMessage: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// An unhandled promise rejection reaching this point means some async
// codepath is missing a .catch()/try-catch — genuinely worth knowing
// about, but NOT treated as fatal like uncaughtException: this codebase
// has a number of pre-existing, intentional fire-and-forget
// `.catch(console.error)` patterns (e.g. auth.js's lastSeen update), and
// making every unhandled rejection fatal risks turning a previously-
// harmless one into a production crash loop. Log it for visibility and
// keep serving.
process.on('unhandledRejection', (reason) => {
  logger.error('process', 'Unhandled promise rejection', {
    errorMessage: reason?.message || String(reason),
    stack: reason?.stack,
  });
});

// ── DB ────────────────────────────────────────────────────────
// Runtime connection-state visibility — the previous version only logged
// the initial connect attempt's outcome; a mid-run disconnect or driver
// error afterward went completely unlogged. These fire for the lifetime
// of the process, not just at startup.
mongoose.connection.on('error', (err) => {
  logger.dbError('MongoDB connection error', { errorMessage: err.message });
});
mongoose.connection.on('disconnected', () => {
  logger.dbError('MongoDB disconnected');
});
mongoose.connection.on('reconnected', () => {
  logger.db('MongoDB reconnected');
});

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    logger.db('MongoDB Atlas connected');
    logger.startup('Integration config loaded', {
      openRouterKey: !!process.env.OPENROUTER_API_KEY,
      anthropicKey: !!process.env.ANTHROPIC_API_KEY,
      googleOAuth: !!process.env.GOOGLE_CLIENT_ID,
      email: !!process.env.EMAIL_USER,
    });
    // Auto-seed writing practice exercises if DB is empty
    try {
      const WPExercise = require('./models/WPExercise');
      const count = await WPExercise.countDocuments();
      if (count < 450) {
        logger.startup(`WPExercise has ${count}/450 exercises – running seed...`);
        await require('./scripts/seedWritingPractice').runSeed();
        logger.startup('WPExercise seed done');
      } else {
        logger.startup(`WPExercise already has ${count} exercises – skip`);
      }
    } catch (e) {
      logger.error('startup', 'WPExercise seed error', { errorMessage: e.message });
    }
    // Auto-seed Task 1 exercises
    try {
      const Task1Exercise = require('./models/Task1Exercise');
      const { exercises: t1data, runSeed: runTask1Seed, runUpdate: runTask1Update } = require('./scripts/seedTask1Exercises');
      const t1count = await Task1Exercise.countDocuments();
      if (t1count < t1data.length) {
        logger.startup(`Task1Exercise has ${t1count}/${t1data.length} – seeding...`);
        await runTask1Seed();
        logger.startup('Task1Exercise seed done');
      } else {
        logger.startup(`Task1Exercise already has ${t1count} exercises – updating core 36...`);
        await runTask1Update();
      }
    } catch (e) {
      logger.error('startup', 'Task1Exercise seed error', { errorMessage: e.message });
    }
    // Auto-seed Task 2 topics (always run – replaceOne+upsert is idempotent)
    try {
      const { runSeed: runTask2Seed } = require('./scripts/seedTask2Exercises');
      logger.startup('Task2Topic seeding...');
      await runTask2Seed();
      logger.startup('Task2Topic seed done');
    } catch (e) {
      logger.error('startup', 'Task2Topic seed error', { errorMessage: e.message });
    }
    // Start tuition auto-reminder cron
    try {
      tuitionCron.start();
    } catch (e) {
      logger.error('startup', 'TuitionCron failed to start', { errorMessage: e.message });
    }
  })
  .catch(err => logger.error('startup', 'MongoDB initial connection failed', { errorMessage: err.message }));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => logger.startup(`Server running on port ${PORT}`));

// ── Graceful shutdown (Phase 11) ────────────────────────────────
// Render sends SIGTERM on every deploy, restart, and manual scale event —
// without this, in-flight requests get dropped mid-response instead of
// completing, and the Mongo connection/cron timer are torn down abruptly
// rather than cleanly.
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return; // ignore a second signal while already shutting down
  shuttingDown = true;
  logger.shutdown(`Received ${signal}, shutting down gracefully...`);

  tuitionCron.stop();

  server.close(async () => {
    logger.shutdown('HTTP server closed (no longer accepting new connections)');
    try {
      await mongoose.connection.close(false);
      logger.shutdown('MongoDB connection closed');
    } catch (e) {
      logger.error('shutdown', 'Error closing MongoDB connection', { errorMessage: e.message });
    }
    process.exit(0);
  });

  // Safety net — if something hangs (a stuck connection, a slow in-flight
  // request), don't let the process hang forever; force-exit after a
  // grace period. .unref() so this timer itself never keeps the process
  // alive if shutdown completes normally first.
  setTimeout(() => {
    logger.error('shutdown', 'Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
