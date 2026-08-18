'use strict';

const searchService = require('../services/searchService');

exports.search = async (req, res) => {
  try {
    const results = await searchService.search(req.query.q, req.user);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
