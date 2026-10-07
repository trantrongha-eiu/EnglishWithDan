'use strict';

const mongoose = require('mongoose');
const attemptHighlightService = require('../services/attemptHighlightService');

// PUT /api/highlights/:kind/:attemptId   body: { highlights }
exports.saveHighlights = async (req, res) => {
  try {
    const { kind, attemptId } = req.params;
    if (!mongoose.isValidObjectId(attemptId)) {
      return res.status(400).json({ success: false, message: 'attemptId không hợp lệ' });
    }
    const status = await attemptHighlightService.saveHighlights(kind, attemptId, req.user._id, req.body && req.body.highlights);
    if (status === 'bad_kind') return res.status(404).json({ success: false, message: 'Route không tồn tại' });
    if (status === 'invalid') return res.status(400).json({ success: false, message: 'Dữ liệu highlight không hợp lệ' });
    if (status === 'too_large') return res.status(413).json({ success: false, message: 'Quá nhiều highlight' });
    if (status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy bài làm' });
    res.json({ success: true });
  } catch (err) {
    console.error('[Attempt highlights]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
