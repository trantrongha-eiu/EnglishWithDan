'use strict';

const examTimetableService = require('../services/examTimetableService');

function guard(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
      console.error('[ExamTimetable] error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
}

exports.getProgress = guard(async (req, res) => {
  const data = await examTimetableService.getProgress(req.user._id);
  res.json({ success: true, ...data });
});

exports.setChecklistItem = guard(async (req, res) => {
  const { key } = req.params;
  const { checked } = req.body;
  const data = await examTimetableService.setChecklistItem(req.user._id, key, checked);
  res.json({ success: true, ...data });
});

exports.addLog = guard(async (req, res) => {
  const { skill, label, week, mistake } = req.body;
  const data = await examTimetableService.addLog(req.user._id, { skill, label, week, mistake });
  res.json({ success: true, ...data });
});

exports.updateLog = guard(async (req, res) => {
  const { logId } = req.params;
  const data = await examTimetableService.updateLog(req.user._id, logId, req.body || {});
  res.json({ success: true, ...data });
});

exports.deleteLog = guard(async (req, res) => {
  const { logId } = req.params;
  const data = await examTimetableService.deleteLog(req.user._id, logId);
  res.json({ success: true, ...data });
});
