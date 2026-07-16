'use strict';

const essentialGrammarService = require('../services/essentialGrammarService');

exports.listLessons = async (req, res) => {
  try {
    // Public (no auth on this route), fixed handbook content — safe to cache briefly.
    res.set('Cache-Control', 'public, max-age=120');
    const lessons = await essentialGrammarService.listLessons();
    res.json({ success: true, lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
