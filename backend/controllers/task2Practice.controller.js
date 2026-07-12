'use strict';

const task2PracticeService = require('../services/task2PracticeService');

exports.listTemplates = async (req, res) => {
  try {
    const templates = await task2PracticeService.listTemplates();
    res.json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.listWeeks = async (req, res) => {
  try {
    const weeks = await task2PracticeService.listWeeks();
    res.json({ success: true, weeks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.listTopicsForWeek = async (req, res) => {
  try {
    const topics = await task2PracticeService.listTopicsForWeek(parseInt(req.params.week));
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getTopicQuestions = async (req, res) => {
  try {
    const { level = 'all' } = req.query;
    const result = await task2PracticeService.getTopicQuestions(req.params.topicId, level);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getVocabulary = async (req, res) => {
  try {
    const result = await task2PracticeService.getVocabulary(req.params.topicId);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.checkAnswer = async (req, res) => {
  const { topicId, questionId, userAnswer } = req.body;
  if (!topicId || !questionId || userAnswer === undefined)
    return res.status(400).json({ success: false, message: 'Thiếu thông tin' });

  try {
    const result = await task2PracticeService.checkAnswer(topicId, questionId, userAnswer);
    if (result.status === 'topic_not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    if (result.status === 'question_not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    res.json({
      success: true, isCorrect: result.isCorrect, score: result.score, feedbackVi: result.feedbackVi,
      modelAnswer: result.modelAnswer, explanationVi: result.explanationVi, explanationEn: result.explanationEn,
      aiGraded: result.aiGraded
    });
  } catch (err) {
    console.error('[Task2] check error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi chấm bài' });
  }
};

exports.getExam = async (req, res) => {
  try {
    const { week = 'all', level = 'all', count = 10 } = req.query;
    const { questions, total } = await task2PracticeService.getExam({ week, level, count });
    res.json({ success: true, questions, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.submitExam = async (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers) || !answers.length)
    return res.status(400).json({ success: false, message: 'Không có câu trả lời' });

  try {
    const result = await task2PracticeService.submitExam(answers);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Task2] exam/submit error:', err);
    res.status(500).json({ success: false, message: 'Lỗi chấm bài' });
  }
};

exports.saveAttempt = async (req, res) => {
  try {
    const attempt = await task2PracticeService.saveAttempt(req.user._id, req.body);
    res.json({ success: true, attempt });
  } catch (err) {
    console.error('[Task2] save-attempt error:', err);
    res.status(500).json({ success: false, message: 'Lỗi lưu kết quả' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const attempts = await task2PracticeService.getHistory(req.user._id, limit);
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const stats = await task2PracticeService.getProgress(req.user._id);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getWrongQuestions = async (req, res) => {
  try {
    const wrongIds = await task2PracticeService.getWrongQuestions(req.user._id, req.params.topicId);
    res.json({ success: true, wrongIds });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.saveDraft = async (req, res) => {
  try {
    await task2PracticeService.saveDraft(req.user._id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lưu tiến độ' });
  }
};

exports.getDraft = async (req, res) => {
  try {
    const draft = await task2PracticeService.getDraft(req.user._id, req.params.topicId);
    res.json({ success: true, draft: draft || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.deleteDraft = async (req, res) => {
  try {
    await task2PracticeService.deleteDraft(req.user._id, req.params.topicId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.listDrafts = async (req, res) => {
  try {
    const drafts = await task2PracticeService.listDrafts(req.user._id);
    res.json({ success: true, drafts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
