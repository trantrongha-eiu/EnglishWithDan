const shadowingService = require('../services/shadowingService');
const catchAsync = require('../middleware/catchAsync');
const contentViewService = require('../services/contentViewService');

// ── GET /api/shadowing/lessons ───────────────────────────────
exports.listLessons = catchAsync(async (req, res) => {
  const lessons = await shadowingService.listLessons(req.user._id);
  res.json({ success: true, lessons });
});

// ── GET /api/shadowing/lessons/:slug ─────────────────────────
exports.getLesson = catchAsync(async (req, res) => {
  const lesson = await shadowingService.getLesson(req.params.slug);
  // Opening the video is what a "shadowing" homework item asks for.
  contentViewService.recordView(req.user._id, 'shadowing', lesson._id).catch(() => {});
  res.json({ success: true, lesson });
});

// ── POST /api/shadowing/lessons/:slug/attempt ────────────────
exports.saveAttempt = catchAsync(async (req, res) => {
  const { mode, answers } = req.body || {};
  const result = await shadowingService.saveAttempt(req.params.slug, { mode, answers }, req.user._id);
  res.json({ success: true, ...result });
});
