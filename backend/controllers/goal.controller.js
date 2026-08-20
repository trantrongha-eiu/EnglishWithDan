'use strict';

const goalService = require('../services/goalService');

exports.getGoal = async (req, res) => {
  try {
    const goal = await goalService.getGoal(req.user._id);
    res.json({ success: true, goal });
  } catch (err) {
    console.error('[Goal] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { currentBand, targetBand, examDate, weeklyStudyMinutes, studyDays, preferredSessionMinutes } = req.body;
    const result = await goalService.updateGoal(req.user._id, {
      currentBand, targetBand, examDate, weeklyStudyMinutes, studyDays, preferredSessionMinutes,
    });
    if (result.status === 'invalid') {
      return res.status(400).json({ success: false, message: result.errors[0], errors: result.errors });
    }
    res.json({ success: true, goal: result.goal });
  } catch (err) {
    console.error('[Goal] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Distinct from getGoal()'s currentBand (self-assessed) — see §5. Never
// merged into the same field/response as the goal itself.
exports.getEstimatedPerformance = async (req, res) => {
  try {
    const estimate = await goalService.getEstimatedPerformance(req.user._id);
    res.json({ success: true, ...estimate });
  } catch (err) {
    console.error('[Goal] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
