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
    // svc.getLesson throws AuthorizationError (403, err.code LESSON_LOCKED
    // / TEST_CODE_REQUIRED) when the lesson isn't unlocked yet — an
    // expected, student-facing condition, not a server error.
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message, code: err.code });
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
    await svc.assertLessonUnlocked(req.user._id, ex.lessonCode);
    // req.skipAIGrading: set by the /check route's rate limiter once a
    // student hits it — go straight to the local fallback instead of
    // calling Gemini at all (same pattern as task2Practice's checkLimiter).
    const result = grading.needsAiGrading(ex) && !req.skipAIGrading
      ? await grading.gradeSentenceTransformBatch(ex, answers)
      : grading.gradeObjective(ex, answers);
    await svc.recordSubmission(req.user._id, ex, {
      answers, score: result.score, correctCount: result.correctCount, maxScore: result.maxScore,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message, code: err.code });
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
    await svc.assertLessonUnlocked(req.user._id, ex.lessonCode);

    // The model answer is safe to return now (student has submitted) — the
    // pre-submit payload from wt1Service.sanitizeExercise strips it. Shown
    // under "Xem bài mẫu" in the feedback panel for every writing type.
    const sampleAnswer = (ex.rubric && ex.rubric.sampleAnswer) || '';

    if (ex.type === 'sentence_writing') {
      const result = grading.gradeWritingLocal(ex, arr);
      await svc.recordSubmission(req.user._id, ex, { responses: arr, score: result.score });
      return res.json({ success: true, ...result });
    }

    // paragraph_writing / full_task1 → Gemini. If the AI is overloaded /
    // unavailable, fall back to the same rubric-based local grader that
    // sentence_writing uses (target-structure coverage + word count) rather
    // than 503-ing: the student still gets a provisional score, the model
    // answer, and a recorded submission that counts toward the lesson gate.
    let ai;
    try {
      ai = await grading.gradeWritingAI(ex, arr);
    } catch (aiErr) {
      console.warn('[WT1] AI grading unavailable — grading against the rubric instead:', aiErr.message);
      const local = grading.gradeWritingLocal(ex, arr);
      await svc.recordSubmission(req.user._id, ex, { responses: arr, score: local.score });
      // `aiUnavailable` drives the "AI đang bận — điểm sơ bộ theo rubric"
      // banner in showWritingFeedback (all 3 course pages). `local` already
      // carries score / checklist / sampleAnswer in the same shape
      // sentence_writing returns, so the existing local-feedback branch
      // renders it unchanged.
      return res.json({ success: true, ...local, sampleAnswer, aiUnavailable: true, aiOverloaded: !!aiErr.isOverloaded });
    }
    await svc.recordSubmission(req.user._id, ex, { responses: arr, aiFeedback: ai });
    res.json({ success: true, ...ai, sampleAnswer });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message, code: err.code });
    console.error('[WT1] submitWriting:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi chấm bài' });
  }
};

// Shared by the legacy single-shot path and the per-item path below —
// grades one answer (whole exercise, or one item) with the same
// audio-then-transcript-only-retry fallback both need. Throws the original
// (or retry) error on total failure; callers turn that into a 503.
async function _gradeOneAnswer(questionText, text, part, audio, durationSec) {
  try {
    return await speakingService.gradeSpeaking(questionText, text, part, audio, durationSec);
  } catch (aiErr) {
    // Transcript-only retry is only possible when we actually have a
    // transcript — an audio-only submission has nothing to fall back to.
    if (audio && text && !aiErr.isOverloaded) {
      try { return await speakingService.gradeSpeaking(questionText, text, part, null, durationSec); }
      catch (retryErr) { throw retryErr; }
    }
    throw aiErr;
  }
}

// POST /api/wt1/submit-speaking — speaking_response exercises. The client
// records a spoken answer (SpeechRecognition transcript + optional audio),
// we band it with speakingService.gradeSpeaking (the same Gemini path the
// standalone Speaking practice uses).
//
// Three request shapes share this one endpoint:
//  - { exerciseCode, transcript, duration } (+ optional multipart 'audio'),
//    no itemIndex — legacy single-shot path: the WHOLE exercise (all items
//    joined into one prompt) is graded and stored as ONE WT1Submission in
//    one call. Still used for single-item exercises (e.g. Part 2 cue
//    cards), where there's nothing to split per-item anyway.
//  - { exerciseCode, itemIndex, transcript, duration } (+ optional audio) —
//    multi-item exercise, one question at a time: grades ONLY that item's
//    prompt and returns the feedback WITHOUT writing anything to the DB yet
//    (see wt1Service.recordSpeakingItem, called below — it persists the
//    already-graded result and reports back once every item is in).
exports.submitSpeaking = async (req, res) => {
  const { exerciseCode, transcript, duration } = req.body;
  const text = String(transcript || '').trim();
  if (!exerciseCode) {
    return res.status(400).json({ success: false, message: 'Thiếu exerciseCode' });
  }
  // A recording with no client speech-to-text (mobile Safari/iOS, in-app
  // webviews) is valid — Gemini transcribes the uploaded audio itself.
  // Only require a "long enough" typed answer when there is NO audio.
  if (!req.file && (text.length < 15 || text.split(/\s+/).filter(Boolean).length < 5)) {
    return res.status(400).json({
      success: false,
      message: text ? 'Bài nói quá ngắn để chấm — hãy nói ít nhất một câu hoàn chỉnh.' : 'Chưa có nội dung — hãy ghi âm hoặc nhập lời thoại.',
    });
  }
  try {
    const ex = await WT1Exercise.findOne({ code: exerciseCode, published: true }).lean();
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    if (ex.type !== 'speaking_response') {
      return res.status(400).json({ success: false, message: 'Bài này không phải bài nói.' });
    }
    await svc.assertLessonUnlocked(req.user._id, ex.lessonCode);

    const items = ex.items || [];
    const part = ex.speakingPart || 1;
    const audio = req.file
      ? speakingService.normalizeAudioForGemini(req.file.buffer, req.file.mimetype)
      : null;
    const durationSec = Number(duration) || 0;

    // itemIndex only makes sense (and is only ever sent by the frontend)
    // for a multi-item exercise — a single-item one always takes the
    // legacy path below, same as before this feature existed.
    const rawIdx = req.body.itemIndex;
    const itemIndex = rawIdx != null && rawIdx !== '' ? parseInt(rawIdx, 10) : null;
    if (items.length > 1 && itemIndex != null) {
      if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= items.length) {
        return res.status(400).json({ success: false, message: 'itemIndex không hợp lệ' });
      }
      const questionText = items[itemIndex].prompt || ex.instruction || ex.title || 'IELTS Speaking practice';
      let feedback;
      try {
        feedback = await _gradeOneAnswer(questionText, text, part, audio, durationSec);
      } catch (aiErr) {
        console.warn('[WT1] speaking item AI grading failed:', aiErr.message);
        const msg = aiErr.isOverloaded ? aiErr.message : 'AI không thể phân tích lúc này. Vui lòng thử lại.';
        return res.status(503).json({ success: false, message: msg });
      }
      const finalText = text || (typeof feedback.transcript === 'string' ? feedback.transcript.trim() : '') || '';

      // No genuine answer detected (silent recording, mic issue, nothing
      // actually said) — confirmed real incident: a student's Band 0.0 on
      // this exact multi-item exercise type traced back to exactly this.
      // Persisting it via recordSpeakingItem would have permanently baked a
      // phantom 0 into this item's slot, dragging down the whole exercise's
      // average with no way to fix it short of restarting from item 0 — so
      // this item is neither recorded nor advanced; the student re-records
      // the SAME item instead. No itemIndex/graded key on this response on
      // purpose, so the client's existing `sd.graded === 'speaking-item'`
      // branch can't mistake it for a real graded step.
      if (feedback.noGenuineAnswer) {
        return res.json({
          success: true, noGenuineAnswer: true, itemIndex,
          message: 'Không phát hiện được nội dung trả lời trong bản ghi — hãy kiểm tra micro và ghi âm lại câu này.',
        });
      }

      const itemPayload = {
        itemIndex, prompt: questionText, transcript: finalText,
        feedback: {
          scores: {
            fluency: feedback.fluency || 0, vocabulary: feedback.vocabulary || 0,
            grammar: feedback.grammar || 0, pronunciation: feedback.pronunciation || 0,
          },
          bandEstimate: feedback.overallBand || 0,
          feedbackVi: feedback.overallFeedback || '',
          corrections: (feedback.mistakes || []).map((m) => ({ original: m.original, corrected: m.corrected, note: m.reason })),
          strengths: feedback.strengths || [],
          improvements: feedback.improvements || [],
        },
      };
      const aggregate = await svc.recordSpeakingItem(req.user._id, ex, itemIndex, itemPayload, items.length);

      if (aggregate) {
        // Last item — mirror the FULL exercise into SpeakingAttempt once,
        // same as the legacy path does (history / monitoring / streak).
        try {
          await speakingService.saveAttempt(req.user, {
            topic: ex.title || '', part,
            questionText: items.map((it) => it.prompt).filter(Boolean).join(' | '),
            transcript: finalText, duration: durationSec, feedback: aggregate,
          });
        } catch (mirrorErr) {
          console.warn('[WT1] speaking attempt mirror failed:', mirrorErr.message);
        }
      }

      return res.json({
        success: true, graded: 'speaking-item', itemIndex, feedback, transcript: finalText,
        isLast: !!aggregate, aggregate: aggregate || undefined,
      });
    }

    // ── Legacy single-shot path (single-item exercises) — unchanged ──
    const questionText = items.map((it) => it.prompt).filter(Boolean).join(' | ')
      || ex.instruction || ex.title || 'IELTS Speaking practice';
    let feedback;
    try {
      feedback = await _gradeOneAnswer(questionText, text, part, audio, durationSec);
    } catch (aiErr) {
      console.warn('[WT1] speaking AI grading failed:', aiErr.message);
      const msg = aiErr.isOverloaded ? aiErr.message : 'AI không thể phân tích lúc này. Vui lòng thử lại.';
      return res.status(503).json({ success: false, message: msg });
    }

    // Audio path: prefer the student's own STT text, else Gemini's own
    // transcription of the recording.
    const finalText = text
      || (typeof feedback.transcript === 'string' ? feedback.transcript.trim() : '')
      || '';

    // Same reasoning as the multi-item branch above: don't record a
    // no-genuine-answer grade as a completed submission — it would mark this
    // (single-item) exercise "done" with a phantom Band 0.0 the student
    // can't distinguish from a real one, and could block lesson progression
    // on a technical mic hiccup rather than an actual weak attempt.
    if (feedback.noGenuineAnswer) {
      return res.json({
        success: true, noGenuineAnswer: true,
        message: 'Không phát hiện được nội dung trả lời trong bản ghi — hãy kiểm tra micro và ghi âm lại.',
      });
    }

    await svc.recordSubmission(req.user._id, ex, {
      responses: [finalText],
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
        topic: ex.title || '', part, questionText, transcript: finalText,
        duration: durationSec, feedback,
      });
    } catch (mirrorErr) {
      console.warn('[WT1] speaking attempt mirror failed:', mirrorErr.message);
    }

    res.json({ success: true, graded: 'speaking', feedback, transcript: finalText });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message, code: err.code });
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

exports.getExerciseHistory = async (req, res) => {
  try {
    const history = await svc.getExerciseHistory(req.user._id, req.params.code, req.query.limit);
    res.json({ success: true, history });
  } catch (err) {
    console.error('[WT1] exercise history:', err.message);
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
