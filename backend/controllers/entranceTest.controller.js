'use strict';

const catchAsync = require('../middleware/catchAsync');
const entranceTestService = require('../services/entranceTestService');

// GET /api/entrance-test — landing-page info (fixed structure + availability)
exports.getConfig = catchAsync(async (req, res) => {
  const config = await entranceTestService.getConfig();
  res.json({ success: true, ...config });
});

// POST /api/entrance-test/start
exports.start = catchAsync(async (req, res) => {
  try {
    const result = await entranceTestService.startAttempt(req.user._id);
    res.status(result.resumed ? 200 : 201).json({ success: true, ...result });
  } catch (e) {
    // Proctoring cooldown after a disqualified attempt — same machine-
    // readable shape mockTest.controller.js's own /start uses.
    if (e && e.statusCode === 429 && e.cooldownSeconds != null) {
      return res.status(429).json({
        success: false, code: 'ENTRANCE_TEST_COOLDOWN',
        cooldownSeconds: e.cooldownSeconds, message: e.message,
      });
    }
    throw e;
  }
});

// GET /api/entrance-test/:attemptId
exports.getAttempt = catchAsync(async (req, res) => {
  const attempt = await entranceTestService.getAttemptForClient(req.user._id, req.params.attemptId);
  res.json({ success: true, attempt });
});

// POST /api/entrance-test/:attemptId/answer   body: { section, questionId?, questionNumber?, answer?, writingAnswer? }
// Only the named fields below are ever read out of req.body — a client
// sending band/correctCount/score alongside them is simply ignored.
exports.saveAnswer = catchAsync(async (req, res) => {
  const { section, questionId, questionNumber, answer, writingAnswer } = req.body || {};
  const result = await entranceTestService.saveAnswer(req.user._id, req.params.attemptId, section, {
    questionId, questionNumber, answer, writingAnswer,
  });
  res.json({ success: true, ...result });
});

// POST /api/entrance-test/:attemptId/section/:section/submit
exports.submitSection = catchAsync(async (req, res) => {
  const attempt = await entranceTestService.submitSection(req.user._id, req.params.attemptId, req.params.section);
  res.json({ success: true, attempt });
});

// POST /api/entrance-test/:attemptId/violation   body: { type }
exports.recordViolation = catchAsync(async (req, res) => {
  const { type } = req.body || {};
  const result = await entranceTestService.recordViolation(req.user._id, req.params.attemptId, { type });
  res.json({ success: true, ...result });
});

// GET /api/entrance-test/:attemptId/result
exports.getResult = catchAsync(async (req, res) => {
  const result = await entranceTestService.getResult(req.user._id, req.params.attemptId);
  res.json({ success: true, ...result });
});

// GET /api/entrance-test/history
exports.getHistory = catchAsync(async (req, res) => {
  const data = await entranceTestService.getHistory(req.user._id);
  res.json({ success: true, ...data });
});
