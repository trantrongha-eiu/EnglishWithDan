'use strict';

const catchAsync = require('../middleware/catchAsync');
const examSimulationService = require('../services/examSimulationService');

// GET /api/exam-simulation/cooldown
// Used by the mode-select popup to grey out / show a live countdown on the
// Simulation option before the student even tries to start one.
exports.cooldown = catchAsync(async (req, res) => {
  const result = await examSimulationService.checkCooldown(req.user._id);
  res.json({ success: true, ...result });
});

// POST /api/exam-simulation/violation
// body: { skill: 'reading'|'listening'|'writing', attemptType: 'full'|'practice', attemptId, type }
// A skill page's exam-proctor.js reported the student leaving the exam
// tab during a live Simulation attempt.
exports.violation = catchAsync(async (req, res) => {
  const { skill, attemptType, attemptId, type } = req.body || {};
  const result = await examSimulationService.recordViolation(req.user._id, { skill, attemptType, attemptId, type });
  res.json({ success: true, ...result });
});
