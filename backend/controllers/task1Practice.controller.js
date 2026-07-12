'use strict';

const task1PracticeService = require('../services/task1PracticeService');

exports.getMeta = async (req, res) => {
  try {
    const { counts, totalExercises } = await task1PracticeService.getMeta();
    res.json({ success: true, counts, totalExercises });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.listExercises = async (req, res) => {
  try {
    const { level = 'all', skillType = 'all', module: mod = 'all' } = req.query;
    const { exercises, total } = await task1PracticeService.listExercises({ level, skillType, module: mod });
    res.json({ success: true, exercises, total });
  } catch (err) {
    console.error('[Task1] GET /exercises:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.checkAnswer = async (req, res) => {
  const { exerciseId, userAnswer } = req.body;
  if (!exerciseId || userAnswer === undefined)
    return res.status(400).json({ success: false, message: 'Thiếu exerciseId hoặc câu trả lời' });

  try {
    const result = await task1PracticeService.checkAnswer(exerciseId, userAnswer.trim());
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Task1] check error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi khi chấm bài' });
  }
};

exports.getTestQuestions = async (req, res) => {
  try {
    const { level = 'all', count = 10 } = req.query;
    const exercises = await task1PracticeService.getTestQuestions({ level, count });
    res.json({ success: true, exercises });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.checkTest = async (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers) || !answers.length)
    return res.status(400).json({ success: false, message: 'Không có câu trả lời' });

  try {
    const result = await task1PracticeService.checkTest(answers);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Task1] check-test error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.saveBatch = async (req, res) => {
  try {
    const { attempts, sessionId } = req.body;
    if (!Array.isArray(attempts) || !attempts.length)
      return res.json({ success: true, saved: 0 });
    const saved = await task1PracticeService.saveBatch(req.user._id, attempts, sessionId);
    res.json({ success: true, saved });
  } catch (err) {
    console.error('[Task1] save-batch error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const { stats, totalXP } = await task1PracticeService.getProgress(req.user._id);
    res.json({ success: true, stats, totalXP });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
    const attempts = await task1PracticeService.getHistory(req.user._id, limit);
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
