'use strict';

const recommendationService = require('../services/recommendationService');

exports.getRecommendations = async (req, res) => {
  try {
    const result = await recommendationService.getRecommendations(req.user._id);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Recommendation] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
