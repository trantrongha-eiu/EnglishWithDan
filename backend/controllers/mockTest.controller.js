'use strict';

const catchAsync = require('../middleware/catchAsync');
const mockTestService = require('../services/mockTestService');

// POST /api/mock-test/start
exports.start = catchAsync(async (req, res) => {
  const { resumed, attempt } = await mockTestService.startMockTest(req.user._id);
  res.status(resumed ? 200 : 201).json({ success: true, resumed, attempt });
});

// GET /api/mock-test/current
exports.current = catchAsync(async (req, res) => {
  const attempt = await mockTestService.getCurrent(req.user._id);
  res.json({ success: true, attempt });
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
