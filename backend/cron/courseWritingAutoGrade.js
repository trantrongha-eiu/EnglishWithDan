const cron = require('node-cron');
const logger = require('../utils/logger');
const { autoRegradePending } = require('../services/teacherReviewService');

// Course writing (paragraph_writing / full_task1) submitted while Gemini was
// busy only got the rubric fallback — "AI lỗi/bận" in admin "Chấm bài khoá
// học & Speaking". Every 10 minutes, re-run the AI on a few of them (same
// prompt as on submit: question + stimulus + charts + rubric), like
// cron/writingAutoGrade.js does for the IELTS Writing tests. See
// teacherReviewService.autoRegradePending.
let task = null;

function start() {
  task = cron.schedule('*/10 * * * *', () => {
    autoRegradePending().catch(err => logger.error('cron', 'CourseWritingAutoGrade tick failed', { errorMessage: err.message }));
  });
  logger.startup('CourseWritingAutoGrade cron scheduled (every 10 minutes)');
}

function stop() {
  if (task) task.stop();
}

module.exports = { start, stop };
