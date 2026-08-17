'use strict';

const listeningTipService = require('../services/listeningTipService');

exports.listLessons = async (req, res) => {
  try {
    // Public (no auth on this route), fixed content — safe to cache briefly.
    res.set('Cache-Control', 'public, max-age=120');
    const lessons = await listeningTipService.listLessons();
    res.json({ success: true, lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
