const cron = require('node-cron');
const ClassGroup = require('../models/ClassGroup');
const { refreshClass } = require('../services/classAttendanceService');
const logger = require('../utils/logger');

// Attendance stats are refreshed synchronously whenever a mark or a session
// changes, but a scheduled session with a date that quietly rolls into the
// past does NOT trigger any write — so without this sweep an enrollment could
// sit at "active" a day after it should have flipped to "warning"/"failed"
// once that session's absence started counting. Runs once a day and recomputes
// every active class.
async function runSweep() {
  try {
    const classes = await ClassGroup.find({ status: 'active' }).select('_id').lean();
    for (const c of classes) {
      try {
        await refreshClass(c._id);
      } catch (e) {
        logger.error('cron', 'ClassAttendanceSweep: class refresh failed', { classId: String(c._id), errorMessage: e.message });
      }
    }
    logger.info('cron', 'ClassAttendanceSweep: done', { classes: classes.length });
  } catch (e) {
    logger.error('cron', 'ClassAttendanceSweep run error', { errorMessage: e.message });
  }
}

let task = null;

function start() {
  // 02:15 ICT daily — after midnight so "today" has fully advanced.
  task = cron.schedule('15 2 * * *', runSweep, { timezone: 'Asia/Ho_Chi_Minh' });
  logger.startup('ClassAttendanceSweep cron scheduled (02:15 ICT daily)');
}

function stop() {
  if (task) task.stop();
}

module.exports = { start, stop, runSweep };
