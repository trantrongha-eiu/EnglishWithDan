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

exports.getFull = (req, res) => {
  const full = svc.getFull(req.params.storyId);
  if (!full) return res.status(404).json({ success: false, message: 'Không tìm thấy câu chuyện' });
  res.json({ success: true, full });
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

// POST /transcribe — one shadowing take → text. The audio is not kept: a
// shadowing take is graded on the spot against the sentence, nothing for a
// teacher to review.
exports.transcribe = async (req, res) => {
  if (!req.file || !req.file.buffer || !req.file.buffer.length) {
    return res.status(400).json({ success: false, message: 'Không có bản ghi âm.' });
  }
  try {
    const audio = require('../services/speakingService').normalizeAudioForGemini(req.file.buffer, req.file.mimetype);
    const transcript = await require('../services/groqService').transcribeSpeechGroq(audio, { timeoutMs: 20000 });
    res.json({ success: true, transcript });
  } catch (err) {
    console.warn('[SpeakingPart2] transcribe failed:', err.message);
    res.status(502).json({ success: false, message: 'Máy chấm đang bận — thử lại sau vài giây nhé.' });
  }
};
