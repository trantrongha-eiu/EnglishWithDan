'use strict';

const catchAsync = require('../middleware/catchAsync');
const mockTestService = require('../services/mockTestService');

// POST /api/mock-test/start
exports.start = catchAsync(async (req, res) => {
  try {
    const { resumed, attempt } = await mockTestService.startMockTest(req.user._id);
    res.status(resumed ? 200 : 201).json({ success: true, resumed, attempt });
  } catch (e) {
    // Proctoring cooldown after a disqualified run — surface a machine-
    // readable code + the remaining seconds so the dashboard can explain it.
    if (e && e.statusCode === 429 && e.cooldownSeconds != null) {
      return res.status(429).json({
        success: false, code: 'MOCK_COOLDOWN',
        cooldownSeconds: e.cooldownSeconds, message: e.message
      });
    }
    throw e;
  }
});

// GET /api/mock-test/current
exports.current = catchAsync(async (req, res) => {
  const attempt = await mockTestService.getCurrent(req.user._id);
  res.json({ success: true, attempt });
});

// DELETE /api/mock-test/current — discard the still-open run so the student
// can start a fresh mock test from the dashboard.
exports.abandon = catchAsync(async (req, res) => {
  const result = await mockTestService.abandonCurrent(req.user._id);
  res.json({ success: true, ...result });
});

// POST /api/mock-test/:id/violation   body: { type, skill }
// The exam tab reported a tab-switch / focus-loss / close attempt.
exports.violation = catchAsync(async (req, res) => {
  const { type, skill } = req.body || {};
  const result = await mockTestService.recordViolation(req.user._id, req.params.id, { type, skill });
  res.json({ success: true, ...result });
});

// POST /api/mock-test/:id/advance   body: { skill, attemptId }
exports.advance = catchAsync(async (req, res) => {
  const { skill, attemptId } = req.body || {};
  const { attempt, nav } = await mockTestService.advance(req.user._id, req.params.id, { skill, attemptId });
  res.json({ success: true, attempt, nav });
});

// GET /api/mock-test/history?page=&limit=
exports.history = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const data = await mockTestService.getHistory(req.user._id, { page, limit });
  res.json({ success: true, ...data });
});

// GET /api/mock-test/history/:id
exports.historyDetail = catchAsync(async (req, res) => {
  const attempt = await mockTestService.getHistoryDetail(req.user._id, req.params.id);
  if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi thử' });
  res.json({ success: true, attempt });
});
