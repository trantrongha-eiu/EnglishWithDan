const cron = require('node-cron');
const logger = require('../utils/logger');
const { processDueJobs } = require('../services/speakingGradeQueueService');

// Retries Speaking answers whose AI grading failed at submit time (AI
// overloaded) — see services/speakingGradeQueueService.js. Every minute:
// a job's own backoff (1, 2, 5, 10 … minutes) decides when it is due, so a
// tick with nothing due is one cheap indexed query.
let task = null;

function start() {
  task = cron.schedule('* * * * *', () => {
    processDueJobs().catch(err => logger.error('cron', 'SpeakingGradeQueue tick failed', { errorMessage: err.message }));
  });
  logger.startup('SpeakingGradeQueue cron scheduled (every minute)');
}

function stop() {
  if (task) task.stop();
}

module.exports = { start, stop };
