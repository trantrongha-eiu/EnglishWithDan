'use strict';

const studyPlanService = require('../services/studyPlanService');

exports.getCurrentPlan = async (req, res) => {
  try {
    const plan = await studyPlanService.getStudyPlan(req.user._id);
    res.json({ success: true, ...plan });
  } catch (err) {
    console.error('[StudyPlan] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
