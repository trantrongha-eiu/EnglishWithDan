'use strict';

// Extracted from routes/task2Practice.js, verbatim logic. The
// correctAnswer-stripping + baseWords + sentenceStructure block was
// byte-identical between /questions/topic/:topicId and /exam — verified
// by direct comparison — so unified into sanitizeQuestionForClient()
// below. autoGrade/keywordMatch/deriveSentenceStructure are untouched.
const Task2Topic = require('../models/Task2Topic');
const Task2Attempt = require('../models/Task2Attempt');
const Task2Template = require('../models/Task2Template');
const Task2Draft = require('../models/Task2Draft');
const { gradeT2Question } = require('./geminiService');
const { levenshtein } = require('../utils/textMatch');

const AI_GRADED_TYPES = new Set(['translation', 'error_correction', 'short_writing', 'paraphrase']);
const AUTO_DERIVE_TYPES = new Set(['translation', 'rearrange', 'error_correction', 'paraphrase']);

function deriveSentenceStructure(q) {
  if (q.sentenceStructure) return q.sentenceStructure;
  if (!AUTO_DERIVE_TYPES.has(q.type)) return null;
  const ans = (q.correctAnswer || q.modelAnswer || '').trim();
  if (!ans) return null;

  if (/^although\b/i.test(ans))    return 'Although + S + V (điều kiện), + S + V (kết quả)';
  if (/^even though\b/i.test(ans)) return 'Even though + S + V (điều kiện), + S + V (kết quả)';
  if (/^despite\b/i.test(ans))     return 'Despite + V-ing / noun phrase, + S + V';
  if (/^in spite of\b/i.test(ans)) return 'In spite of + V-ing / noun phrase, + S + V';
  if (/^while\b/i.test(ans) && /,/.test(ans)) return 'While + S + V (đối lập), + S + V';
  if (/^whereas\b/i.test(ans))     return 'Whereas + S + V (đối lập), + S + V';
  if (/^since\b/i.test(ans) && /,/.test(ans)) return 'Since + S + V (mốc thời gian), + S + has/have + V3';
  if (/^not only\b/i.test(ans))    return 'Not only + auxiliary + S + V, but also + S + V';
  if (/^if\b/i.test(ans))          return 'If + S + V (điều kiện), + S + will/would + V (kết quả)';
  if (/^unless\b/i.test(ans))      return 'Unless + S + V, + S + V';
  if (/^there (is|are|was|were)\b/i.test(ans)) return 'There + is/are + noun + (that/which + V)';
  if (/^it (is|was|seems)\b/i.test(ans) && /\b(that|to)\b/.test(ans)) return 'It + is + adj + that + S + V  /  It + is + adj + to + V';

  if (/\bnot only\b.{1,50}\bbut also\b/i.test(ans)) return 'S + not only + V, but also + V';
  if (/\b(which|who|whom|whose)\b/i.test(ans) && /,/.test(ans)) return 'S + V + O, + which/who + V (mệnh đề quan hệ)';
  if (/\b(should|must|ought to|have to|need to)\b/i.test(ans)) return 'S + should/must + V + O (lời khuyên / bắt buộc)';
  if (/\b(has been|have been|had been)\b/i.test(ans)) return 'S + has/have been + V3 (hoàn thành / bị động hoàn thành)';
  if (/\b(is|are|was|were|can be|could be|should be|will be|may be)\b.{1,40}\bby\b/i.test(ans)) return 'S + is/are + V3 + by + tác nhân (câu bị động)';
  if (/\bbecause\b(?! of)/i.test(ans)) return 'S + V + O, + because + S + V (nguyên nhân)';
  if (/\b(in order to|so as to)\b/i.test(ans)) return 'S + V + in order to + V (mục đích)';

  return 'S + V + O (+ bổ ngữ / trạng ngữ)';
}

function normalize(str) {
  return (str || '').toLowerCase().trim()
    .replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ');
}

function keywordMatch(userAnswer, fallbackKeywords, modelAnswer) {
  const lower = normalize(userAnswer);
  const keywords = fallbackKeywords && fallbackKeywords.length
    ? fallbackKeywords
    : modelAnswer ? normalize(modelAnswer).split(' ').filter(w => w.length > 4) : [];

  if (!keywords.length) return { isCorrect: false, score: 0, feedbackVi: '❌ Câu trả lời chưa đạt yêu cầu. Xem đáp án mẫu để tham khảo.' };

  const matched = keywords.filter(kw => lower.includes(kw.toLowerCase()));
  const ratio = matched.length / keywords.length;
  const score = Math.round(ratio * 100);
  if (ratio >= 0.7) return { isCorrect: true, score, feedbackVi: `✅ Tốt lắm! Câu trả lời có các từ khóa quan trọng.` };
  if (ratio >= 0.4) return { isCorrect: false, score, feedbackVi: `📝 Gần đúng. Thiếu một số từ khóa: ${keywords.filter(k => !lower.includes(k.toLowerCase())).slice(0, 3).join(', ')}.` };
  return { isCorrect: false, score: 0, feedbackVi: `❌ Chưa đạt. Từ khóa cần có: ${keywords.slice(0, 4).join(', ')}.` };
}

function autoGrade(q, userAnswer) {
  const norm = normalize(userAnswer);
  const correct = normalize(q.correctAnswer || '');

  if (['essay_type_recognition', 'topic_sentence'].includes(q.type)) {
    if (q.options && q.options.length) {
      const idx = parseInt(userAnswer, 10);
      const byIndex = !isNaN(idx) && q.options[idx] && normalize(q.options[idx]) === correct;
      const byText = norm === correct;
      const isCorrect = byIndex || byText;
      return {
        isCorrect,
        score: isCorrect ? 100 : 0,
        feedbackVi: isCorrect ? `✅ Chính xác! ${q.explanationVi || ''}` : `❌ Chưa đúng. ${q.explanationVi || ''}`
      };
    }
    const isCorrect = norm === correct;
    return { isCorrect, score: isCorrect ? 100 : 0, feedbackVi: isCorrect ? `✅ Chính xác!` : `❌ Chưa đúng.` };
  }

  if (q.type === 'fill_blank') {
    const isExact = norm === correct;
    const dist = levenshtein(norm, correct);
    const isClose = !isExact && correct.length > 2 && dist <= 1;
    const isCorrect = isExact || isClose;
    return {
      isCorrect, score: isCorrect ? (isExact ? 100 : 90) : 0,
      feedbackVi: isCorrect
        ? `✅ Chính xác! ${q.explanationVi || ''}`
        : `❌ Chưa đúng. Đáp án: "${q.correctAnswer}". ${q.explanationVi || ''}`
    };
  }

  if (q.type === 'rearrange') {
    const isCorrect = norm === correct;
    return {
      isCorrect, score: isCorrect ? 100 : 0,
      feedbackVi: isCorrect ? `✅ Đúng rồi!` : `❌ Thứ tự chưa đúng. Đáp án: "${q.correctAnswer}".`
    };
  }

  return keywordMatch(userAnswer, q.fallbackKeywords, q.modelAnswer);
}

function sanitizeQuestionForClient(q) {
  const { correctAnswer, ...rest } = q; // eslint-disable-line no-unused-vars
  if (q.type === 'rearrange' && (!rest.baseWords || !rest.baseWords.length) && correctAnswer) {
    rest.baseWords = correctAnswer.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
  }
  rest.sentenceStructure = deriveSentenceStructure(q) || undefined;
  return rest;
}

async function listTemplates() {
  return Task2Template.find({ isActive: true }).sort({ orderIndex: 1 }).lean();
}

async function listWeeks() {
  const agg = await Task2Topic.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$week', topicCount: { $sum: 1 }, block: { $first: '$block' } } },
    { $sort: { _id: 1 } }
  ]);
  return agg.map(w => ({ week: w._id, topicCount: w.topicCount, block: w.block }));
}

async function listTopicsForWeek(week) {
  return Task2Topic.find({ week, isActive: true })
    .select('-questions -vocabularyList')
    .sort({ orderIndex: 1 })
    .lean();
}

async function getTopicQuestions(topicId, level) {
  const topic = await Task2Topic.findById(topicId).lean();
  if (!topic) return null;

  let questions = topic.questions || [];
  if (level !== 'all') questions = questions.filter(q => q.level === level);
  questions = questions.sort((a, b) => a.orderIndex - b.orderIndex);

  const safe = questions.map(sanitizeQuestionForClient);
  return { questions: safe, topicName: topic.topicName, topicEmoji: topic.topicEmoji, prompt: topic.prompt, essayType: topic.essayType };
}

async function getVocabulary(topicId) {
  const topic = await Task2Topic.findById(topicId).select('vocabularyList topicName').lean();
  if (!topic) return null;
  return { vocabularyList: topic.vocabularyList || [], topicName: topic.topicName };
}

async function checkAnswer(topicId, questionId, userAnswer) {
  const topic = await Task2Topic.findById(topicId).lean();
  if (!topic) return { status: 'topic_not_found' };

  const q = (topic.questions || []).find(q => q._id.toString() === questionId || q.questionId === questionId);
  if (!q) return { status: 'question_not_found' };

  const trimmed = (userAnswer || '').trim();
  let result;
  let aiGraded = false;

  if (AI_GRADED_TYPES.has(q.type) && trimmed.length >= 3) {
    try {
      result = await gradeT2Question({
        type: q.type,
        questionText: q.questionText,
        modelAnswer: q.modelAnswer || q.correctAnswer || '',
        userAnswer: trimmed
      });
      aiGraded = true;
    } catch (aiErr) {
      console.warn('[Task2/check] Gemini failed, falling back to keyword:', aiErr.message);
      result = autoGrade(q, trimmed);
    }
  } else {
    result = autoGrade(q, trimmed);
  }

  return {
    status: 'ok',
    isCorrect: result.isCorrect,
    score: result.score,
    feedbackVi: result.feedbackVi,
    modelAnswer: q.modelAnswer || q.correctAnswer || '',
    explanationVi: q.explanationVi || '',
    explanationEn: q.explanationEn || '',
    aiGraded
  };
}

async function getExam({ week = 'all', level = 'all', count = 10 }) {
  const topicFilter = { isActive: true };
  if (week !== 'all') topicFilter.week = parseInt(week);

  const topics = await Task2Topic.find(topicFilter).lean();

  let allQ = [];
  topics.forEach(t => {
    let qs = (t.questions || []);
    if (level !== 'all') qs = qs.filter(q => q.level === level);
    qs.forEach(q => allQ.push({ ...q, topicId: t._id, topicName: t.topicName, prompt: t.prompt, essayType: t.essayType }));
  });

  for (let i = allQ.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQ[i], allQ[j]] = [allQ[j], allQ[i]];
  }
  const selected = allQ.slice(0, parseInt(count));
  const safe = selected.map(sanitizeQuestionForClient);
  return { questions: safe, total: safe.length };
}

async function submitExam(answers) {
  const results = [];
  let correct = 0;

  const topicIds = [...new Set(answers.map(a => a.topicId))];
  const topics = await Task2Topic.find({ _id: { $in: topicIds } }).lean();
  const topicMap = Object.fromEntries(topics.map(t => [t._id.toString(), t]));

  for (const { topicId, questionId, userAnswer } of answers) {
    const topic = topicMap[topicId];
    if (!topic) { results.push({ questionId, error: 'topic not found' }); continue; }
    const q = (topic.questions || []).find(q => q._id.toString() === questionId || q.questionId === questionId);
    if (!q) { results.push({ questionId, error: 'question not found' }); continue; }

    const check = autoGrade(q, (userAnswer || '').trim());
    if (check.isCorrect) correct++;

    results.push({
      questionId,
      questionId2: q.questionId,
      topicName: topic.topicName,
      type: q.type,
      level: q.level,
      questionText: q.questionText,
      userAnswer: userAnswer || '',
      modelAnswer: q.modelAnswer || q.correctAnswer || '',
      isCorrect: check.isCorrect,
      score: check.score,
      explanationVi: q.explanationVi || '',
      feedbackVi: check.feedbackVi
    });
  }

  const total = results.filter(r => !r.error).length;
  return { results, correct, total, score: total > 0 ? Math.round((correct / total) * 100) : 0 };
}

async function saveAttempt(userId, body) {
  const { sessionType, week, topicId, topicName, level, questionsAttempted, totalQuestions, correctCount } = body;

  // Re-grade server-side against the real topic questions instead of
  // trusting client-supplied isCorrect/score/correctCount/totalQuestions —
  // these feed teacher-facing attempt history and progress stats
  // (security audit finding). Deterministic question types are re-checked
  // via autoGrade(), same as submitExam(); AI-graded types (translation/
  // error_correction/short_writing/paraphrase) are not re-run through
  // Gemini here (cost/non-determinism), so their isCorrect/score are
  // coerced to safe types but not independently re-verified — every
  // question is still confirmed to be a real question on the given topic,
  // closing the "claim an inflated correctCount/totalQuestions" vector.
  const topic = topicId ? await Task2Topic.findById(topicId).lean() : null;
  const qMap = topic ? Object.fromEntries((topic.questions || []).map(q => [(q._id ? q._id.toString() : q.questionId), q])) : {};

  const verified = (questionsAttempted || []).map(qa => {
    const q = qMap[qa.questionId];
    if (!q) return null; // not a real question on this topic — drop it
    let isCorrect, score;
    if (AI_GRADED_TYPES.has(q.type)) {
      isCorrect = qa.isCorrect === true;
      score = Number.isFinite(qa.score) ? Math.max(0, Math.min(100, qa.score)) : (isCorrect ? 100 : 0);
    } else {
      const check = autoGrade(q, (qa.userAnswer || '').trim());
      isCorrect = check.isCorrect;
      score = check.score;
    }
    return {
      questionId: qa.questionId,
      userAnswer: qa.userAnswer || '',
      isCorrect,
      score,
      timeSpentSeconds: Number.isFinite(qa.timeSpentSeconds) ? qa.timeSpentSeconds : undefined
    };
  }).filter(Boolean);

  const verifiedTotal = topic ? verified.length : (Number.isFinite(totalQuestions) ? totalQuestions : 0);
  const verifiedCorrect = topic ? verified.filter(v => v.isCorrect).length : (Number.isFinite(correctCount) ? correctCount : 0);
  const score = verifiedTotal > 0 ? Math.round((verifiedCorrect / verifiedTotal) * 100) : 0;

  const attempt = new Task2Attempt({
    userId, sessionType, week, topicId, topicName, level,
    questionsAttempted: topic ? verified : (questionsAttempted || []),
    totalQuestions: verifiedTotal, correctCount: verifiedCorrect, scorePercentage: score
  });
  await attempt.save();
  return attempt;
}

async function getHistory(userId, limit) {
  return Task2Attempt.find({ userId })
    .sort({ completedAt: -1 })
    .limit(limit)
    .select('topicName week level correctCount totalQuestions scorePercentage completedAt sessionType')
    .lean();
}

async function getProgress(userId) {
  return Task2Attempt.aggregate([
    { $match: { userId } },
    { $group: {
      _id: '$week',
      attempts: { $sum: 1 },
      avgScore: { $avg: '$scorePercentage' },
      lastAttempt: { $max: '$createdAt' }
    } },
    { $sort: { _id: 1 } }
  ]);
}

async function getWrongQuestions(userId, topicId) {
  const attempts = await Task2Attempt.find({ userId, topicId }).sort({ createdAt: 1 }).lean();
  if (!attempts.length) return [];

  const latestResult = {};
  for (const attempt of attempts) {
    for (const qa of (attempt.questionsAttempted || [])) {
      if (qa.questionId) latestResult[qa.questionId] = qa.isCorrect;
    }
  }
  return Object.entries(latestResult).filter(([, ok]) => !ok).map(([id]) => id);
}

async function saveDraft(userId, body) {
  const { topicId, topicName, week, level, mode, questionIds, currentIdx, sessionAttempts, questionStatus, sessionDone, sessionCorrect } = body;
  // Enforce max-1 draft: delete any drafts for other topics before saving
  await Task2Draft.deleteMany({ userId, topicId: { $ne: topicId } });
  await Task2Draft.findOneAndUpdate(
    { userId, topicId },
    { topicId, topicName, week, level, mode, questionIds, currentIdx, sessionAttempts, questionStatus, sessionDone, sessionCorrect, savedAt: new Date() },
    { upsert: true, new: true }
  );
}

async function getDraft(userId, topicId) {
  return Task2Draft.findOne({ userId, topicId }).lean();
}

async function deleteDraft(userId, topicId) {
  await Task2Draft.deleteOne({ userId, topicId });
}

async function listDrafts(userId) {
  return Task2Draft.find({ userId })
    .select('topicId topicName week currentIdx questionIds savedAt')
    .lean();
}

module.exports = {
  listTemplates, listWeeks, listTopicsForWeek, getTopicQuestions, getVocabulary,
  checkAnswer, getExam, submitExam, saveAttempt, getHistory, getProgress, getWrongQuestions,
  saveDraft, getDraft, deleteDraft, listDrafts,
};
