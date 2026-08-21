const cron           = require('node-cron');
const TestAttempt     = require('../models/TestAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const logger = require('../utils/logger');

// Audit finding: a Reading/Listening attempt that's started but never
// submitted (tab closed, browser crash, student gives up) stays
// status:'in-progress' forever — invisible in every history/admin view
// (all of them filter status:'completed') and with no way to ever reach
// the 'timeout' state the schema already reserves for it. This sweep is
// DB hygiene / admin-visibility only, not exam-integrity enforcement —
// submitTest() already re-checks status:'in-progress' independently, so a
// late submit racing the sweep just fails closed (attempt not found) the
// same way a double-submit already does.
//
// Reading's exam duration is a fixed 3600s (readingService.startTest).
// Listening varies by test but is always well under that. One shared
// generous window keeps the sweep simple rather than needing a per-test
// duration lookup.
const STALE_AFTER_MS = 2 * 60 * 60 * 1000; // 2 hours

// Speaking's grading is synchronous within a single HTTP request (unlike
// Reading/Listening's exam-duration model) — a 'pending' row normally
// resolves in well under a minute. It only stays 'pending' if the request
// that created it never got to finish (server restart/deploy mid-grade —
// see server.js's 10s force-kill window vs Gemini's up-to-~60s worst case).
// A much shorter window than Reading/Listening's, so students see a
// definitive "failed, please retry" state quickly rather than an
// indefinite "still grading" that will never resolve on its own.
const SPEAKING_STALE_AFTER_MS = 10 * 60 * 1000; // 10 minutes

async function sweepStaleAttempts() {
  const cutoff = new Date(Date.now() - STALE_AFTER_MS);
  const speakingCutoff = new Date(Date.now() - SPEAKING_STALE_AFTER_MS);
  try {
    const [reading, listening, speaking] = await Promise.all([
      TestAttempt.updateMany(
        { status: 'in-progress', startTime: { $lt: cutoff } },
        { $set: { status: 'timeout', endTime: new Date() } }
      ),
      ListeningAttempt.updateMany(
        { status: 'in-progress', startTime: { $lt: cutoff } },
        { $set: { status: 'timeout', submittedAt: new Date() } }
      ),
      SpeakingAttempt.updateMany(
        { status: 'pending', createdAt: { $lt: speakingCutoff } },
        { $set: { status: 'error' } }
      ),
    ]);
    if (reading.modifiedCount || listening.modifiedCount || speaking.modifiedCount) {
      logger.info('cron', 'AttemptTimeoutSweep: marked stale attempts', {
        readingTimedOut: reading.modifiedCount,
        listeningTimedOut: listening.modifiedCount,
        speakingErrored: speaking.modifiedCount,
      });
    }
  } catch (e) {
    logger.error('cron', 'AttemptTimeoutSweep run error', { errorMessage: e.message });
  }
}

let task = null;

function start() {
  task = cron.schedule('*/30 * * * *', sweepStaleAttempts);
  logger.startup('AttemptTimeoutSweep cron scheduled (every 30 min)');
}

function stop() {
  if (task) task.stop();
}

module.exports = { start, stop, sweepStaleAttempts };
