'use strict';

// "Viết câu nâng cao" — thin HTTP layer over advSentenceService. Mirrors
// controllers/task2Practice.controller.js.
const svc = require('../services/advSentenceService');

exports.listWeeks = async (req, res) => {
  try {
    res.json({ success: true, weeks: await svc.listWeeks() });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.listGroupsForWeek = async (req, res) => {
  try {
    res.json({ success: true, groups: await svc.listGroupsForWeek(parseInt(req.params.week)) });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const result = await svc.getGroupSentences(req.params.groupId, { includeAnswers: true });
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy nhóm' });
    res.json({ success: true, ...result });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.checkAnswer = async (req, res) => {
  const { groupId, sentenceId, userAnswer } = req.body;
  if (!groupId || !sentenceId || userAnswer === undefined) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
  }
  try {
    const result = await svc.checkAnswer(groupId, sentenceId, userAnswer);
    if (result.status === 'group_not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy nhóm' });
    if (result.status === 'sentence_not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy câu' });
    res.json({
      success: true, isCorrect: result.isCorrect, score: result.score, feedbackVi: result.feedbackVi,
      modelAnswer: result.modelAnswer, targetStructure: result.targetStructure, structureNote: result.structureNote,
    });
  } catch (err) {
    console.error('[AdvSentence] check error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi chấm bài' });
  }
};

exports.getExam = async (req, res) => {
  try {
    const { week = 'all', count = 10 } = req.query;
    const { questions, total } = await svc.getExam({ week, count });
    res.json({ success: true, questions, total });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.submitExam = async (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers) || !answers.length) {
    return res.status(400).json({ success: false, message: 'Không có câu trả lời' });
  }
  try {
    res.json({ success: true, ...(await svc.submitExam(answers)) });
  } catch (err) {
    console.error('[AdvSentence] exam/submit error:', err);
    res.status(500).json({ success: false, message: 'Lỗi chấm bài' });
  }
};

exports.saveAttempt = async (req, res) => {
  try {
    const attempt = await svc.saveAttempt(req.user._id, req.body);
    res.json({ success: true, attempt });
  } catch (err) {
    console.error('[AdvSentence] save-attempt error:', err);
    res.status(500).json({ success: false, message: 'Lỗi lưu kết quả' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    res.json({ success: true, attempts: await svc.getHistory(req.user._id, limit) });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getAttemptDetail = async (req, res) => {
  try {
    const attempt = await svc.getAttemptDetail(req.user._id, req.params.attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy lượt làm' });
    res.json({ success: true, attempt });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.saveDraft = async (req, res) => {
  try {
    // Same guard as task2Practice.controller.saveDraft (audit BUG-026): a
    // missing/non-string groupId used to reach saveDraft()'s
    // deleteMany({ groupId: { $ne: groupId } }) with groupId undefined —
    // that $ne matches every doc, wiping all of the user's drafts.
    const { groupId, sentenceIds, sessionAttempts, sentenceStatus } = req.body;
    if (typeof groupId !== 'string' || !groupId.trim()) {
      return res.status(400).json({ success: false, message: 'Thiếu groupId' });
    }
    for (const [field, value] of [['sentenceIds', sentenceIds], ['sessionAttempts', sessionAttempts], ['sentenceStatus', sentenceStatus]]) {
      if (value !== undefined && !Array.isArray(value)) {
        return res.status(400).json({ success: false, message: `${field} phải là một mảng` });
      }
    }
    await svc.saveDraft(req.user._id, req.body);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi lưu tiến độ' });
  }
};

exports.getDraft = async (req, res) => {
  try {
    const draft = await svc.getDraft(req.user._id, req.params.groupId);
    res.json({ success: true, draft: draft || null });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.deleteDraft = async (req, res) => {
  try {
    await svc.deleteDraft(req.user._id, req.params.groupId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.listDrafts = async (req, res) => {
  try {
    res.json({ success: true, drafts: await svc.listDrafts(req.user._id) });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
