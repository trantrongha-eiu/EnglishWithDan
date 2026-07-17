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
exports.getQuestions = catchAsync(async (req, res) => {
  const { topic, part } = req.query;
  const questions = await speakingService.listQuestions({ topic, part });
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
  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ success: false, message: 'Transcript trống' });
  }

  const partNum = part ? Number(part) : 1;
  const questionText = question || 'General speaking practice';

  let feedback;
  try {
    feedback = await speakingService.gradeSpeaking(questionText, transcript.trim(), partNum);
  } catch (aiErr) {
    console.error('[Speaking] Gemini error:', aiErr.message);
    if (aiErr.isOverloaded) {
      return res.status(503).json({ success: false, message: aiErr.message });
    }
    return res.status(500).json({ success: false, message: 'AI không thể phân tích. Vui lòng thử lại.' });
  }

  await speakingService.saveAttempt(req.user._id, {
    questionId, topic, part: partNum, questionText, transcript, duration, feedback
  });

  res.json({ success: true, feedback });
});

// ── POST /api/speaking/sample-answer ─────────────────────────
// Part 1/2/3 each get their own shape — see buildSampleAnswerPrompt()
// in geminiService.js. Part 2 additionally needs the cue card text.
exports.sampleAnswer = catchAsync(async (req, res) => {
  const { question, part, cueCard } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ success: false, message: 'Thiếu câu hỏi' });
  }

  const partNum = part ? Number(part) : 1;
  if (![1, 2, 3].includes(partNum)) {
    return res.status(400).json({ success: false, message: 'Part không hợp lệ' });
  }

  try {
    const data = await speakingService.getSampleAnswer(question.trim(), partNum, cueCard || '');
    res.json({ success: true, sampleAnswer: data.sampleAnswer });
  } catch (aiErr) {
    console.error('[Speaking] sampleAnswer Gemini error:', aiErr.message);
    if (aiErr.isOverloaded) {
      return res.status(503).json({ success: false, message: aiErr.message });
    }
    return res.status(500).json({ success: false, message: 'AI không thể tạo câu trả lời mẫu. Vui lòng thử lại.' });
  }
});

// ── GET /api/speaking/history ────────────────────────────────
exports.getHistory = catchAsync(async (req, res) => {
  const attempts = await speakingService.getHistory(req.user._id);
  res.json({ success: true, attempts });
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
