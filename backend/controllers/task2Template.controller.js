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
  const { templateType, templateName, totalItems, correctItems, mode, isExam, timeTakenSec, level } = req.body;
  if (!templateType || totalItems == null || correctItems == null)
    return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
  await task2TemplateService.saveAttempt({ userId: req.user._id, templateType, templateName, totalItems, correctItems, mode, isExam, timeTakenSec, level });
  res.json({ success: true });
});

exports.getHistory = guard(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 200, 500);
  const attempts = await task2TemplateService.getHistory(req.user._id, limit);
  res.json({ success: true, attempts });
});

// ── Practice-path progress (durable, no TTL) ─────────────────────────
const task2TemplateProgressService = require('../services/task2TemplateProgressService');

exports.getProgress = guard(async (req, res) => {
  const progress = await task2TemplateProgressService.getProgress(req.user._id, req.query.level);
  res.json({ success: true, progress });
});

exports.saveProgress = guard(async (req, res) => {
  const body = req.body || {};
  const progress = await task2TemplateProgressService.saveProgress(req.user._id, body.level, req.params.typeId, body);
  if (!progress) return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
  res.json({ success: true, progress });
});
