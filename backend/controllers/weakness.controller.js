'use strict';

const weaknessService = require('../services/weaknessService');

exports.getWeaknessProfile = async (req, res) => {
  try {
    const profile = await weaknessService.getWeaknessProfile(req.user._id);
    res.json({ success: true, ...profile });
  } catch (err) {
    console.error('[Weakness] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
