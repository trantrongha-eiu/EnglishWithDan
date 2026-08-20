'use strict';

const learningService = require('../services/learningService');

exports.getTodayLearning = async (req, res) => {
  try {
    const today = await learningService.getTodayLearning(req.user._id);
    res.json({ success: true, ...today });
  } catch (err) {
    console.error('[Learning] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
