'use strict';
// Teacher review queue — "Chấm bài khoá học & Speaking" (admin-src
// pages/SubmissionReviews.jsx). Logic lives in services/teacherReviewService.js.
//
//   GET  /api/admin/submission-reviews?kind=writing|speaking&status=pending|done|all&search=&page=&limit=
//   GET  /api/admin/submission-reviews/counts
//   GET  /api/admin/submission-reviews/:source/:id          source = course | speaking
//   PUT  /api/admin/submission-reviews/:source/:id          { band, scores, note } → saves + messages the student
//   GET  /api/admin/submission-reviews/:source/:id/ai-prompt  prompt + question + answer for an outside AI
//   POST /api/admin/submission-reviews/course/:id/ai-grade  re-run the AI on a course writing submission
//   (writing rows the AI missed at submit are also re-graded every 10 min — cron/courseWritingAutoGrade.js)

const express = require('express');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const auth = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');
const svc = require('../../services/teacherReviewService');

const router = express.Router();

// Same cap as the IELTS Writing "Chấm AI" button (writingGrading.js).
const aiGradeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req.ip),
  handler: (req, res) => res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu chấm AI, vui lòng thử lại sau 15 phút.' }),
  skip: (req) => req.user?.role === 'admin',
});

function fail(res, err) {
  if (err.statusCode && err.statusCode < 500 || err.isOperational) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: err.message });
}

router.get('/submission-reviews', auth, teacherOnly, async (req, res) => {
  try {
    const { kind, status, search, page, limit } = req.query;
    res.json({ success: true, ...(await svc.list({ kind: kind || 'writing', status: status === 'all' ? '' : (status || 'pending'), search, page, limit })) });
  } catch (err) { fail(res, err); }
});

router.get('/submission-reviews/counts', auth, teacherOnly, async (req, res) => {
  try {
    res.json({ success: true, counts: await svc.counts() });
  } catch (err) { fail(res, err); }
});

router.get('/submission-reviews/:source/:id', auth, teacherOnly, async (req, res) => {
  try {
    res.json({ success: true, ...(await svc.getDetail(req.params.source, req.params.id)) });
  } catch (err) { fail(res, err); }
});

// Grading prompt + question + the student's answer, to paste into an
// outside AI (admin "📋 Copy prompt"); its reply is pasted back client-side.
router.get('/submission-reviews/:source/:id/ai-prompt', auth, teacherOnly, async (req, res) => {
  try {
    res.json({ success: true, ...(await svc.externalPrompt(req.params.source, req.params.id)) });
  } catch (err) { fail(res, err); }
});

router.put('/submission-reviews/:source/:id', auth, teacherOnly, async (req, res) => {
  try {
    res.json({ success: true, ...(await svc.submitReview(req.params.source, req.params.id, req.body, req.user)) });
  } catch (err) { fail(res, err); }
});

router.post('/submission-reviews/course/:id/ai-grade', auth, teacherOnly, aiGradeLimiter, async (req, res) => {
  try {
    res.json({ success: true, ...(await svc.aiRegrade(req.params.id)) });
  } catch (err) { fail(res, err); }
});

module.exports = router;
