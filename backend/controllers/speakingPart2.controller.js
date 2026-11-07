'use strict';

const svc = require('../services/speakingPart2Service');

exports.getContent = async (req, res) => {
  try {
    res.json({ success: true, ...svc.getContent(req.user) });
  } catch (err) {
    console.error('[SpeakingPart2] content error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getProgress = async (req, res) => {
  try {
    res.json({ success: true, progress: await svc.getProgress(req.user._id) });
  } catch (err) {
    console.error('[SpeakingPart2] progress error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.saveProgress = async (req, res) => {
  try {
    const progress = await svc.saveProgress(req.user._id, req.params.storyId, req.body);
    res.json({ success: true, progress });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    console.error('[SpeakingPart2] save error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
