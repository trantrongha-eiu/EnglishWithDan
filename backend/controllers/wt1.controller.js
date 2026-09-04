'use strict';

// HTTP layer for the WT1 course. Objective exercises are graded locally;
// paragraph_writing / full_task1 go through Gemini (rate-limited route).
const WT1Exercise = require('../models/WT1Exercise');
const svc = require('../services/wt1Service');
const grading = require('../services/wt1GradingService');

exports.getOverview = async (req, res) => {
  try {
    res.json({ success: true, ...(await svc.getOverview(req.user._id, req.query.course)) });
  } catch (err) {
    console.error('[WT1] overview:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getLesson = async (req, res) => {
  try {
    const data = await svc.getLesson(req.params.code, req.user._id);
    if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học' });
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('[WT1] lesson:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.check = async (req, res) => {
  const { exerciseCode, answers } = req.body;
  if (!exerciseCode || typeof answers !== 'object' || answers == null) {
    return res.status(400).json({ success: false, message: 'Thiếu exerciseCode hoặc answers' });
  }
  try {
    const ex = await WT1Exercise.findOne({ code: exerciseCode, published: true }).lean();
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    if (!grading.OBJECTIVE_TYPES.has(ex.type)) {
      return res.status(400).json({ success: false, message: 'Bài này không chấm tự động — dùng /submit-writing.' });
    }
    // req.skipAIGrading: set by the /check route's rate limiter once a
    // student hits it — go straight to the local fallback instead of
    // calling Gemini at all (same pattern as task2Practice's checkLimiter).
    const result = grading.needsAiGrading(ex) && !req.skipAIGrading
      ? await grading.gradeSentenceTransformBatch(ex, answers)
      : grading.gradeObjective(ex, answers);
    await svc.recordSubmission(req.user._id, ex, {
      answers, score: result.score, maxScore: result.maxScore,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[WT1] check:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi chấm bài' });
  }
};

exports.submitWriting = async (req, res) => {
  const { exerciseCode, responses } = req.body;
  const arr = Array.isArray(responses) ? responses : (responses != null ? [responses] : []);
  if (!exerciseCode || !arr.length || !arr.some((r) => String(r || '').trim())) {
    return res.status(400).json({ success: false, message: 'Thiếu exerciseCode hoặc nội dung bài viết' });
  }
  try {
    const ex = await WT1Exercise.findOne({ code: exerciseCode, published: true }).lean();
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });

    const WRITING = new Set(['sentence_writing', 'paragraph_writing', 'full_task1']);
    if (!WRITING.has(ex.type)) {
      return res.status(400).json({ success: false, message: 'Bài này chấm tự động — dùng /check.' });
    }

    if (ex.type === 'sentence_writing') {
      const result = grading.gradeWritingLocal(ex, arr);
      await svc.recordSubmission(req.user._id, ex, { responses: arr, score: result.score });
      return res.json({ success: true, ...result });
    }

    // paragraph_writing / full_task1 → Gemini
    let ai;
    try {
      ai = await grading.gradeWritingAI(ex, arr);
    } catch (aiErr) {
      console.warn('[WT1] AI grading failed:', aiErr.message);
      return res.status(503).json({ success: false, message: aiErr.message || 'AI đang quá tải, vui lòng thử lại sau.' });
    }
    await svc.recordSubmission(req.user._id, ex, { responses: arr, aiFeedback: ai });
    res.json({ success: true, ...ai });
  } catch (err) {
    console.error('[WT1] submitWriting:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi chấm bài' });
  }
};

exports.getProgress = async (req, res) => {
  try {
    res.json({ success: true, progress: await svc.getProgress(req.user._id) });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getAttempt = async (req, res) => {
  try {
    const data = await svc.getAttemptDetail(req.user._id, req.params.attemptId);
    if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy lượt làm' });
    res.json({ success: true, ...data });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
