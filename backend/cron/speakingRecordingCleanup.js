const cron = require('node-cron');
const speakingRecordingService = require('../services/speakingRecordingService');
const logger = require('../utils/logger');

// Speaking practice recordings (R2 speaking-recordings/) are kept 3 months,
// like the SpeakingAttempt they belong to. The attempt's Mongo TTL can't
// delete the file, so this daily sweep does.
async function runCleanup() {
  try {
    const r = await speakingRecordingService.purgeOld();
    if (r.deleted) logger.info('cron', 'SpeakingRecordingCleanup: deleted expired recordings', r);
  } catch (e) {
    logger.error('cron', 'SpeakingRecordingCleanup run error', { errorMessage: e.message });
  }
}

let task = null;

function start() {
  // 03:45 ICT daily — quiet hours, after ProctorShotCleanup (03:30).
  task = cron.schedule('45 3 * * *', runCleanup, { timezone: 'Asia/Ho_Chi_Minh' });
  logger.startup(`SpeakingRecordingCleanup cron scheduled (03:45 ICT daily, keeps ${speakingRecordingService.RETENTION_DAYS} days)`);
}

function stop() {
  if (task) task.stop();
}

module.exports = { start, stop, runCleanup };
