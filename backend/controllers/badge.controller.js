'use strict';

const badgeService = require('../services/badgeService');

exports.getBadges = async (req, res) => {
  try {
    const result = await badgeService.getBadges(req.user._id);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Badges] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
