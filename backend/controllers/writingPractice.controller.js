'use strict';

// Preserves each original route's own status codes / message shapes,
// including two admin routes that return a bare { success:false } with
// no message on error/forbidden — that's the original behavior, not an
// oversight here.
const writingPracticeService = require('../services/writingPracticeService');

exports.listExercises = async (req, res) => {
  try {
    const { level, topic, type, limit = 100, skip = 0 } = req.query;
    const { exercises, total } = await writingPracticeService.listExercises({ level, topic, type, limit, skip });
    res.json({ success: true, exercises, total });
  } catch (err) {
    console.error('[WP] GET /exercises:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getTestQuestions = async (req, res) => {
  try {
    const { level, count = 10 } = req.query;
    const { exercises, total } = await writingPracticeService.getTestQuestions({ level, count });
    res.json({ success: true, exercises, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getMeta = async (req, res) => {
  try {
    // Public (no auth on this route), rarely-changing — safe to cache briefly.
    res.set('Cache-Control', 'public, max-age=120');
    const { levels, topics, counts, totalExercises } = await writingPracticeService.getMeta();
    res.json({ success: true, levels, topics, counts, totalExercises });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.listTopics = async (req, res) => {
  try {
    // Public (no auth on this route), rarely-changing — safe to cache briefly.
    res.set('Cache-Control', 'public, max-age=120');
    const topics = await writingPracticeService.listTopics();
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.checkAnswer = async (req, res) => {
  const { exerciseId, userAnswer } = req.body;
  if (!exerciseId || !userAnswer?.trim())
    return res.status(400).json({ success: false, message: 'Thiếu exerciseId hoặc câu trả lời' });

  try {
    const result = await writingPracticeService.checkAnswer(exerciseId, userAnswer.trim());
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[WP] check error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi khi chấm bài. Vui lòng thử lại.' });
  }
};

exports.checkTest = async (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers) || !answers.length)
    return res.status(400).json({ success: false, message: 'Không có câu trả lời' });

  try {
    const result = await writingPracticeService.checkTest(answers);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[WP] check-test error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.saveBatch = async (req, res) => {
  try {
    const { attempts } = req.body;
    if (!Array.isArray(attempts) || !attempts.length)
      return res.status(400).json({ success: false, message: 'Không có dữ liệu' });
    const saved = await writingPracticeService.saveBatch(req.user._id, attempts);
    res.json({ success: true, saved });
  } catch (err) {
    console.error('[WP] save-batch error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.saveSingle = async (req, res) => {
  try {
    const { exerciseId, userAnswer, xpEarned } = req.body;
    const saved = await writingPracticeService.saveSingle(req.user._id, { exerciseId, userAnswer, xpEarned });
    if (!saved) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    res.json({ success: true });
  } catch (err) {
    console.error('[WP] save error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
    const attempts = await writingPracticeService.getHistory(req.user._id, limit);
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getMyStats = async (req, res) => {
  try {
    const { totalXP, totalDone, byLevel } = await writingPracticeService.getMyStats(req.user._id);
    res.json({ success: true, totalXP, totalDone, byLevel });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.adminBulkAddExercises = async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ success: false });
    const { exercises } = req.body;
    if (!Array.isArray(exercises) || !exercises.length)
      return res.status(400).json({ success: false });
    const created = await writingPracticeService.adminBulkAddExercises(exercises);
    res.json({ success: true, created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.adminSoftDeleteExercise = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    await writingPracticeService.adminSoftDeleteExercise(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
