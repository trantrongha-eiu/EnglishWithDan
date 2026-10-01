const cron = require('node-cron');
const proctorShotService = require('../services/proctorShotService');
const { SHOT_RETENTION_DAYS } = require('../services/proctorPolicy');
const logger = require('../utils/logger');

// Proctoring screenshots (Test Simulation, Full Mock Test, Entrance Test —
// see services/proctorShotService.js) are only kept SHOT_RETENTION_DAYS
// (30) so the Cloudinary store doesn't fill up. Daily: delete the expired
// images and drop them from their attempts.
async function runCleanup() {
  try {
    const r = await proctorShotService.purgeOldShots();
    if (r.shots || r.orphans) {
      logger.info('cron', 'ProctorShotCleanup: deleted expired screenshots', r);
    }
  } catch (e) {
    logger.error('cron', 'ProctorShotCleanup run error', { errorMessage: e.message });
  }
}

let task = null;

function start() {
  // 03:30 ICT daily — quiet hours.
  task = cron.schedule('30 3 * * *', runCleanup, { timezone: 'Asia/Ho_Chi_Minh' });
  logger.startup(`ProctorShotCleanup cron scheduled (03:30 ICT daily, keeps ${SHOT_RETENTION_DAYS} days)`);
}

function stop() {
  if (task) task.stop();
}

module.exports = { start, stop, runCleanup };
