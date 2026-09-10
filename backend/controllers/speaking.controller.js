const speakingService = require('../services/speakingService');
const catchAsync = require('../middleware/catchAsync');

// ── GET /api/speaking/topics ─────────────────────────────────
exports.getTopics = catchAsync(async (req, res) => {
  const topics = await speakingService.listTopics(req.query.part);
  res.json({ success: true, topics });
});

// ── GET /api/speaking/random ─────────────────────────────────
exports.getRandom = catchAsync(async (req, res) => {
  const { topic, part } = req.query;
  const question = await speakingService.getRandomQuestion({ topic, part });
  if (!question) return res.json({ success: false, message: 'Không có câu hỏi' });
  res.json({ success: true, question });
});

// ── GET /api/speaking/questions ──────────────────────────────
// ?questionId=<id> → single question (used by the full mock test's Speaking
// step, which assigned one specific Part 2 cue card at start).
exports.getQuestions = catchAsync(async (req, res) => {
  const { topic, part, questionId } = req.query;
  if (questionId) {
    const question = await speakingService.getQuestionById(questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    return res.json({ success: true, questions: [question], question });
  }
  const questions = await speakingService.listQuestions({ topic, part, userId: req.user._id });
  res.json({ success: true, questions });
});

// ── POST /api/speaking/analyze ───────────────────────────────
// The AI call and the attempt-save each have their own inner try/catch
// with deliberately different failure behavior (AI failure must fail the
// request; a save failure must NOT — the student still gets their
// feedback even if persisting the attempt fails) — catchAsync's outer
// wrapper only needs to catch anything neither of those two already
// handles.
exports.analyze = catchAsync(async (req, res) => {
  const { transcript, question, questionId, topic, part, duration } = req.body;
  const clientTranscript = typeof transcript === 'string' ? transcript.trim() : '';
  // A recording with NO client speech-to-text (mobile Safari/iOS, in-app
  // webviews, a blocked recognition service) is valid — Gemini transcribes
  // the uploaded audio itself and grades from that. Only reject when there
  // is neither a transcript nor an audio file.
  if (!clientTranscript && !req.file) {
    return res.status(400).json({ success: false, message: 'Chưa có nội dung để phân tích — hãy ghi âm hoặc nhập lời thoại.' });
  }

  const partNum = part ? Number(part) : 1;
  const questionText = question || 'General speaking practice';

  // Optional: the student's real recording (multipart 'audio' field) — lets
  // Gemini grade Pronunciation from what it actually hears instead of a
  // transcript-only estimate, and transcribe when the client had no STT.
  const audio = req.file
    ? speakingService.normalizeAudioForGemini(req.file.buffer, req.file.mimetype)
    : null;

  // Persisted BEFORE grading (status: 'pending') so the submission is
  // visible to the student/admin right away — Part 2/3's longer
  // transcripts are most likely to hit Gemini's JSON-truncation retry
  // (up to ~60s) or fail outright, and previously nothing was saved until
  // grading succeeded, so a slow/failed grade meant the attempt was
  // invisible or silently lost. May be null (never blocks grading below).
  const pendingId = await speakingService.createPendingAttempt(req.user._id, {
    questionId, topic, part: partNum, questionText, transcript: clientTranscript, duration
  });

  let feedback;
  try {
    feedback = await speakingService.gradeSpeaking(questionText, clientTranscript, partNum, audio);
  } catch (aiErr) {
    // If the audio part is what tripped grading up (unsupported container,
    // corrupt blob, size), don't lose the whole grade — retry once
    // transcript-only. Only possible when we actually HAVE a transcript;
    // an audio-only submission has nothing to fall back to.
    if (audio && clientTranscript && !aiErr.isOverloaded) {
      console.warn('[Speaking] audio grading failed, retrying transcript-only:', aiErr.message);
      try {
        feedback = await speakingService.gradeSpeaking(questionText, clientTranscript, partNum, null);
      } catch (retryErr) {
        aiErr = retryErr;
      }
    }
    if (!feedback) {
      console.error('[Speaking] Gemini error:', aiErr.message);
      if (pendingId) await speakingService.markAttemptError(pendingId);
      if (aiErr.isOverloaded) {
        return res.status(503).json({ success: false, message: aiErr.message });
      }
      return res.status(500).json({ success: false, message: 'AI không thể phân tích. Vui lòng thử lại.' });
    }
  }

  // Audio path: prefer the student's own STT text, else the transcription
  // Gemini produced from the recording. This is what gets stored + shown.
  const resolvedTranscript = clientTranscript
    || (feedback && typeof feedback.transcript === 'string' ? feedback.transcript.trim() : '')
    || '';

  const { attemptId, newlyUnlocked } = pendingId
    ? await speakingService.finalizeAttempt(pendingId, feedback, req.user, resolvedTranscript)
    : await speakingService.saveAttempt(req.user, { questionId, topic, part: partNum, questionText, transcript: resolvedTranscript, duration, feedback });

  // `transcript` lets a client that had no local speech-to-text show what
  // was actually said; `attemptId` keys the locally-stored audio recording.
  res.json({ success: true, feedback, attemptId, newlyUnlocked, transcript: resolvedTranscript });
});

// ── POST /api/speaking/mock-submit ───────────────────────────
// The full mock test's Speaking step (step 4/4). Unlike /analyze this NEVER
// requires a transcript and never blocks on Gemini: a student whose browser
// has no SpeechRecognition (Firefox / Safari / iOS) or whose recognition
// service dropped out must still be able to finish the mock. We persist a
// pending SpeakingAttempt (audio, if any, is keyed to it client-side) and
// return its id immediately so shared/mock-test.js can advance(). If a
// transcript did come through, grading runs fire-and-forget so the AI band
// still fills in later via mockTestService.refreshGrades; otherwise the
// teacher enters the band by hand from the admin mock monitor.
exports.mockSubmit = catchAsync(async (req, res) => {
  const { transcript, question, questionId, topic, part, duration } = req.body || {};
  const partNum = part ? Number(part) : 2;
  const questionText = question || 'IELTS Speaking mock';
  const cleanTranscript = typeof transcript === 'string' ? transcript.trim() : '';

  const attemptId = await speakingService.createPendingAttempt(req.user._id, {
    questionId, topic, part: partNum, questionText,
    transcript: cleanTranscript, duration
  });

  // Best-effort async grade — don't await, don't let a failure touch the
  // response. mockTestService picks the band up on the next history read.
  if (attemptId && cleanTranscript) {
    speakingService.gradeSpeaking(questionText, cleanTranscript, partNum)
      .then(fb => speakingService.finalizeAttempt(attemptId, fb, req.user))
      .catch(err => {
        console.error('[Speaking] mock-submit background grade failed:', err.message);
        return speakingService.markAttemptError(attemptId);
      });
  }

  res.json({ success: true, attemptId, graded: !!(attemptId && cleanTranscript) });
});

// ── POST /api/speaking/sample-answer ─────────────────────────
// Part 1/2/3 each get their own shape — see buildSampleAnswerPrompt()
// in geminiService.js. Part 2 additionally needs the cue card text.
// questionId (optional) enables the sample-answer cache in SpeakingQuestion
// — see speakingService.getSampleAnswer for the cache-aside logic.
exports.sampleAnswer = catchAsync(async (req, res) => {
  const { questionId, question, part, cueCard } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ success: false, message: 'Thiếu câu hỏi' });
  }

  const partNum = part ? Number(part) : 1;
  if (![1, 2, 3].includes(partNum)) {
    return res.status(400).json({ success: false, message: 'Part không hợp lệ' });
  }

  try {
    const data = await speakingService.getSampleAnswer(questionId || null, question.trim(), partNum, cueCard || '');
    res.json({ success: true, sampleAnswer: data.sampleAnswer });
  } catch (aiErr) {
    console.error('[Speaking] sampleAnswer Gemini error:', aiErr.message);
    if (aiErr.isOverloaded) {
      return res.status(503).json({ success: false, message: aiErr.message });
    }
    return res.status(500).json({ success: false, message: 'AI không thể tạo câu trả lời mẫu. Vui lòng thử lại.' });
  }
});

// ── POST /api/speaking/hints ──────────────────────────────────
// Vocab/idea hints derived from the sample answer — a lighter-touch nudge
// than the full "Sample Answer" reveal. Same request shape/validation as
// sampleAnswer above; see speakingService.getSpeakingHints for the
// cache-aside logic (never returns the sample-answer text itself).
exports.hints = catchAsync(async (req, res) => {
  const { questionId, question, part, cueCard } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ success: false, message: 'Thiếu câu hỏi' });
  }

  const partNum = part ? Number(part) : 1;
  if (![1, 2, 3].includes(partNum)) {
    return res.status(400).json({ success: false, message: 'Part không hợp lệ' });
  }

  try {
    const data = await speakingService.getSpeakingHints(questionId || null, question.trim(), partNum, cueCard || '');
    res.json({ success: true, hints: data.hints });
  } catch (aiErr) {
    console.error('[Speaking] hints Gemini error:', aiErr.message);
    if (aiErr.isOverloaded) {
      return res.status(503).json({ success: false, message: aiErr.message });
    }
    return res.status(500).json({ success: false, message: 'AI không thể tạo gợi ý. Vui lòng thử lại.' });
  }
});

// ── POST /api/speaking/improve ────────────────────────────────
// Stage 2 of the analysis split — rewrites the student's OWN transcript at
// Band 7-8. Opt-in only (the "Improve my answer" button); never called from
// the automatic analyze flow, so it never adds latency/cost to every
// recording, only to the ones a student actually wants to see improved.
exports.improveAnswer = catchAsync(async (req, res) => {
  const { question, part, transcript } = req.body;
  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ success: false, message: 'Transcript trống' });
  }

  const partNum = part ? Number(part) : 1;
  if (![1, 2, 3].includes(partNum)) {
    return res.status(400).json({ success: false, message: 'Part không hợp lệ' });
  }

  try {
    const data = await speakingService.getImprovedAnswer(question || 'General speaking practice', partNum, transcript.trim());
    res.json({ success: true, improvedAnswer: data.improvedAnswer });
  } catch (aiErr) {
    console.error('[Speaking] improveAnswer Gemini error:', aiErr.message);
    if (aiErr.isOverloaded) {
      return res.status(503).json({ success: false, message: aiErr.message });
    }
    return res.status(500).json({ success: false, message: 'AI không thể cải thiện câu trả lời. Vui lòng thử lại.' });
  }
});

// ── POST /api/speaking/:attemptId/retry ──────────────────────
// Re-grades a stuck ('pending', normally already swept to 'error' by
// attemptTimeoutSweep.js) or failed ('error') attempt against its own
// stored transcript — no new recording needed. Refuses to touch an
// already-'analyzed' attempt.
exports.retry = catchAsync(async (req, res) => {
  try {
    const result = await speakingService.retryGrading(req.params.attemptId, req.user);
    if (result.status === 'not_found') {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lượt làm bài' });
    }
    if (result.status === 'already_analyzed') {
      return res.status(409).json({ success: false, message: 'Bài này đã được chấm điểm' });
    }
    res.json({ success: true, feedback: result.feedback, attemptId: result.attemptId });
  } catch (aiErr) {
    console.error('[Speaking] retry Gemini error:', aiErr.message);
    if (aiErr.isOverloaded) {
      return res.status(503).json({ success: false, message: aiErr.message });
    }
    return res.status(500).json({ success: false, message: 'AI không thể phân tích. Vui lòng thử lại.' });
  }
});

// ── GET /api/speaking/history ────────────────────────────────
exports.getHistory = catchAsync(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 30, 1), 200);
  const { attempts, total } = await speakingService.getHistory(req.user._id, limit);
  res.json({ success: true, attempts, total, hasMore: attempts.length < total });
});

// ── GET /api/speaking/materials ──────────────────────────────
exports.getMaterials = catchAsync(async (req, res) => {
  const { quarter, topic } = req.query;
  const materials = await speakingService.listMaterials({ quarter, topic });
  res.json({ success: true, materials });
});

// ── GET /api/speaking/material-filters ──────────────────────
exports.getMaterialFilters = catchAsync(async (req, res) => {
  const { quarters, topics } = await speakingService.getMaterialFilters();
  res.json({ success: true, quarters, topics });
});
