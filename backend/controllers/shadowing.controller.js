const shadowingService = require('../services/shadowingService');
const catchAsync = require('../middleware/catchAsync');

// ── GET /api/shadowing/lessons ───────────────────────────────
exports.listLessons = catchAsync(async (req, res) => {
  const lessons = await shadowingService.listLessons(req.user._id);
  res.json({ success: true, lessons });
});

// ── GET /api/shadowing/lessons/:slug ─────────────────────────
exports.getLesson = catchAsync(async (req, res) => {
  const lesson = await shadowingService.getLesson(req.params.slug);
  res.json({ success: true, lesson });
});

// ── POST /api/shadowing/lessons/:slug/attempt ────────────────
exports.saveAttempt = catchAsync(async (req, res) => {
  const { mode, answers } = req.body || {};
  const result = await shadowingService.saveAttempt(req.params.slug, { mode, answers }, req.user._id);
  res.json({ success: true, ...result });
});
