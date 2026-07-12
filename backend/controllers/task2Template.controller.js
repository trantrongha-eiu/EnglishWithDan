'use strict';

const task2TemplateService = require('../services/task2TemplateService');

function guard(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('[Task2Template] error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
}

exports.saveAttempt = guard(async (req, res) => {
  const { templateType, templateName, totalItems, correctItems } = req.body;
  if (!templateType || totalItems == null || correctItems == null)
    return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
  await task2TemplateService.saveAttempt({ userId: req.user._id, templateType, templateName, totalItems, correctItems });
  res.json({ success: true });
});

exports.getHistory = guard(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 200, 500);
  const attempts = await task2TemplateService.getHistory(req.user._id, limit);
  res.json({ success: true, attempts });
});
