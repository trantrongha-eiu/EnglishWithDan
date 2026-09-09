'use strict';

// HTTP layer for the WT1 course. Objective exercises are graded locally;
// paragraph_writing / full_task1 go through Gemini (rate-limited route).
const WT1Exercise = require('../models/WT1Exercise');
const svc = require('../services/wt1Service');
const grading = require('../services/wt1GradingService');
const speakingService = require('../services/speakingService');

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

// POST /api/wt1/submit-speaking — speaking_response exercises. The client
// records a spoken answer (SpeechRecognition transcript + optional audio),
// we band it with speakingService.gradeSpeaking (the same Gemini path the
// standalone Speaking practice uses), store a WT1Submission so it counts
// toward the lesson gate, and also save a SpeakingAttempt so the answer
// shows in Speaking history / admin monitoring and keeps the streak alive.
exports.submitSpeaking = async (req, res) => {
  const { exerciseCode, transcript, duration } = req.body;
  const text = String(transcript || '').trim();
  if (!exerciseCode || !text) {
    return res.status(400).json({ success: false, message: 'Thiếu exerciseCode hoặc nội dung bài nói' });
  }
  if (text.length < 15 || text.split(/\s+/).filter(Boolean).length < 5) {
    return res.status(400).json({ success: false, message: 'Bài nói quá ngắn để chấm — hãy nói ít nhất một câu hoàn chỉnh.' });
  }
  try {
    const ex = await WT1Exercise.findOne({ code: exerciseCode, published: true }).lean();
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    if (ex.type !== 'speaking_response') {
      return res.status(400).json({ success: false, message: 'Bài này không phải bài nói.' });
    }

    const questionText = (ex.items || []).map((it) => it.prompt).filter(Boolean).join(' | ')
      || ex.instruction || ex.title || 'IELTS Speaking practice';
    const part = ex.speakingPart || 1;

    // Optional recording (multipart 'audio') → Pronunciation graded from
    // real audio; see routes/wt1.js optionalAudio.
    const audio = req.file
      ? speakingService.normalizeAudioForGemini(req.file.buffer, req.file.mimetype)
      : null;

    let feedback;
    try {
      feedback = await speakingService.gradeSpeaking(questionText, text, part, audio);
    } catch (aiErr) {
      if (audio && !aiErr.isOverloaded) {
        console.warn('[WT1] audio speaking grading failed, retrying transcript-only:', aiErr.message);
        try { feedback = await speakingService.gradeSpeaking(questionText, text, part, null); }
        catch (retryErr) { aiErr = retryErr; }
      }
      if (!feedback) {
        console.warn('[WT1] speaking AI grading failed:', aiErr.message);
        const msg = aiErr.isOverloaded ? aiErr.message : 'AI không thể phân tích lúc này. Vui lòng thử lại.';
        return res.status(503).json({ success: false, message: msg });
      }
    }

    await svc.recordSubmission(req.user._id, ex, {
      responses: [text],
      aiFeedback: {
        model: 'gemini',
        scores: {
          fluency: feedback.fluency || 0, vocabulary: feedback.vocabulary || 0,
          grammar: feedback.grammar || 0, pronunciation: feedback.pronunciation || 0,
        },
        bandEstimate: feedback.overallBand || 0,
        feedbackVi: feedback.overallFeedback || '',
        corrections: (feedback.mistakes || []).map((m) => ({
          original: m.original, corrected: m.corrected, note: m.reason,
        })),
      },
    });

    // Best-effort: mirror into SpeakingAttempt (history / monitoring / streak).
    try {
      await speakingService.saveAttempt(req.user, {
        topic: ex.title || '', part, questionText, transcript: text,
        duration: Number(duration) || 0, feedback,
      });
    } catch (mirrorErr) {
      console.warn('[WT1] speaking attempt mirror failed:', mirrorErr.message);
    }

    res.json({ success: true, graded: 'speaking', feedback });
  } catch (err) {
    console.error('[WT1] submitSpeaking:', err.message);
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
