'use strict';

// "Viết câu nâng cao" — service layer. Shape mirrors
// services/task2PracticeService.js (weeks → groups → per-sentence practice
// + exam + drafts + history) but every exercise is a single format
// (Vietnamese → English translation of one grammar structure), so there is
// NO AI grading and no question-type branching — grading is a local
// normalize + exact/near-match + keyword-coverage check.

const mongoose = require('mongoose');
const SentenceStructureGroup = require('../models/SentenceStructureGroup');
const AdvSentenceAttempt = require('../models/AdvSentenceAttempt');
const AdvSentenceDraft = require('../models/AdvSentenceDraft');
const { levenshtein, buildAnswerHint } = require('../utils/textMatch');

// ── grading ───────────────────────────────────────────────────────────
function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[.,!?;:'"()‘’“”–—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Grade one translation. The model answer is only ONE natural phrasing
// (teacher's note), so a grammatically-sound near-variant still counts:
// exact/alt → near-match by edit-distance ratio → keyword coverage.
function gradeTranslation(userAnswer, answerEn, altAnswers = []) {
  const u = normalize(userAnswer);
  if (!u) return { isCorrect: false, score: 0, feedbackVi: '❌ Bạn chưa nhập câu trả lời.' };

  const targets = [answerEn, ...(altAnswers || [])].map(normalize).filter(Boolean);
  if (targets.includes(u)) {
    return { isCorrect: true, score: 100, feedbackVi: '✅ Chính xác!' };
  }

  let best = 0;
  for (const t of targets) {
    const ratio = 1 - levenshtein(u, t) / Math.max(u.length, t.length, 1);
    if (ratio > best) best = ratio;
  }
  if (best >= 0.9) {
    return { isCorrect: true, score: Math.round(best * 100), feedbackVi: '✅ Rất tốt — gần như trùng khớp đáp án mẫu.' };
  }
  if (best >= 0.75) {
    return { isCorrect: true, score: Math.round(best * 100), feedbackVi: '✅ Đúng ý — diễn đạt hơi khác đáp án mẫu, đối chiếu để câu tự nhiên hơn.' };
  }

  const answerWords = normalize(answerEn).split(' ').filter((w) => w.length > 3);
  const covered = answerWords.filter((w) => u.includes(w)).length;
  const cov = answerWords.length ? covered / answerWords.length : 0;
  const score = Math.round(cov * 60);
  if (cov >= 0.6) {
    return { isCorrect: false, score, feedbackVi: '📝 Gần đúng — đủ từ khoá nhưng cấu trúc/diễn đạt chưa khớp. So với đáp án mẫu.' };
  }
  return { isCorrect: false, score, feedbackVi: '❌ Chưa đạt. Đối chiếu đáp án mẫu và cấu trúc mục tiêu.' };
}

// ── client sanitization ───────────────────────────────────────────────
// Strip answerEn/altAnswers. In the practice flow (includeAnswers) ship
// the exact answer as `translationAnswer` for the word-by-word typing
// drill + a letter-pattern hint — same relaxed rule as
// task2PracticeService.sanitizeQuestionForClient (see
// memory/task2_practice_dich_cau_wbw.md). Exam mode passes
// includeAnswers:false so it stays answer-free.
function sanitizeSentenceForClient(s, { includeAnswers = true } = {}) {
  const { answerEn, altAnswers, ...rest } = s;
  if (includeAnswers && answerEn) {
    rest.translationAnswer = answerEn;
    const hint = buildAnswerHint(answerEn);
    rest.answerWordCount = hint.wordCount;
    rest.answerLetterHint = hint.pattern;
  }
  return rest;
}

// ── reads ─────────────────────────────────────────────────────────────
async function listWeeks() {
  const agg = await SentenceStructureGroup.aggregate([
    { $match: { isActive: true } },
    { $group: {
      _id: '$week',
      groupCount: { $sum: 1 },
      sentenceCount: { $sum: { $size: { $ifNull: ['$sentences', []] } } },
      names: { $push: { order: '$order', nameVi: '$nameVi' } },
    } },
    { $sort: { _id: 1 } },
  ]);
  return agg.map((w) => ({
    week: w._id,
    groupCount: w.groupCount,
    sentenceCount: w.sentenceCount,
    groupNames: (w.names || []).sort((a, b) => a.order - b.order).map((n) => n.nameVi),
  }));
}

async function listGroupsForWeek(week) {
  const groups = await SentenceStructureGroup.find({ week, isActive: true })
    .sort({ order: 1 })
    .lean();
  return groups.map((g) => ({
    _id: g._id,
    code: g.code,
    order: g.order,
    week: g.week,
    slotInWeek: g.slotInWeek,
    nameVi: g.nameVi,
    nameEn: g.nameEn,
    emoji: g.emoji,
    targetStructure: g.targetStructure,
    sentenceCount: (g.sentences || []).length,
  }));
}

async function getGroupSentences(groupId, { includeAnswers = true } = {}) {
  if (!mongoose.isValidObjectId(groupId)) return null;
  const group = await SentenceStructureGroup.findById(groupId).lean();
  if (!group) return null;
  const sentences = (group.sentences || [])
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((s) => sanitizeSentenceForClient(s, { includeAnswers }));
  return {
    group: {
      _id: group._id, code: group.code, week: group.week, order: group.order,
      nameVi: group.nameVi, nameEn: group.nameEn, emoji: group.emoji,
      targetStructure: group.targetStructure,
    },
    sentences,
  };
}

// ── practice check (local, no AI) ─────────────────────────────────────
async function checkAnswer(groupId, sentenceId, userAnswer) {
  if (!mongoose.isValidObjectId(groupId)) return { status: 'group_not_found' };
  const group = await SentenceStructureGroup.findById(groupId).lean();
  if (!group) return { status: 'group_not_found' };
  const s = (group.sentences || []).find((x) => String(x._id) === String(sentenceId));
  if (!s) return { status: 'sentence_not_found' };

  const result = gradeTranslation(userAnswer, s.answerEn, s.altAnswers);
  return {
    status: 'ok',
    isCorrect: result.isCorrect,
    score: result.score,
    feedbackVi: result.feedbackVi,
    modelAnswer: s.answerEn || '',
    targetStructure: group.targetStructure || '',
    structureNote: s.structureNote || '',
  };
}

// ── exam ──────────────────────────────────────────────────────────────
async function getExam({ week = 'all', count = 10 }) {
  const filter = { isActive: true };
  if (week !== 'all' && !Number.isNaN(parseInt(week))) filter.week = parseInt(week);
  const groups = await SentenceStructureGroup.find(filter).lean();

  const all = [];
  for (const g of groups) {
    for (const s of (g.sentences || [])) {
      all.push({ ...s, groupId: g._id, groupName: g.nameVi, week: g.week, targetStructure: g.targetStructure });
    }
  }
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const n = parseInt(count) || 10;
  const selected = all.slice(0, Math.max(1, Math.min(n, 50)));
  const questions = selected.map((s) => {
    const safe = sanitizeSentenceForClient(s, { includeAnswers: false });
    safe.groupId = s.groupId;
    safe.groupName = s.groupName;
    safe.week = s.week;
    safe.targetStructure = s.targetStructure;
    return safe;
  });
  return { questions, total: questions.length };
}

async function submitExam(answers) {
  const groupIds = [...new Set(answers.map((a) => a.groupId).filter((x) => mongoose.isValidObjectId(x)))];
  const groups = await SentenceStructureGroup.find({ _id: { $in: groupIds } }).lean();
  const gMap = Object.fromEntries(groups.map((g) => [String(g._id), g]));

  const results = [];
  let correct = 0;
  for (const { groupId, sentenceId, userAnswer } of answers) {
    const g = gMap[String(groupId)];
    const s = g && (g.sentences || []).find((x) => String(x._id) === String(sentenceId));
    if (!s) { results.push({ sentenceId, error: 'not found' }); continue; }
    const check = gradeTranslation(userAnswer, s.answerEn, s.altAnswers);
    if (check.isCorrect) correct++;
    results.push({
      sentenceId,
      groupName: g.nameVi,
      promptVi: s.promptVi,
      structureNote: s.structureNote || '',
      userAnswer: userAnswer || '',
      modelAnswer: s.answerEn || '',
      isCorrect: check.isCorrect,
      score: check.score,
      feedbackVi: check.feedbackVi,
    });
  }
  const total = results.filter((r) => !r.error).length;
  return { results, correct, total, score: total ? Math.round((correct / total) * 100) : 0 };
}

// ── save attempt (server-side re-grade) ───────────────────────────────
async function saveAttempt(userId, body) {
  const { sessionType, week, groupId, groupName, sentencesAttempted, totalQuestions, correctCount } = body;

  const group = mongoose.isValidObjectId(groupId)
    ? await SentenceStructureGroup.findById(groupId).lean()
    : null;
  const sMap = {};
  if (group) for (const s of (group.sentences || [])) sMap[String(s._id)] = s;

  const verified = (sentencesAttempted || []).map((qa) => {
    const s = sMap[qa.sentenceId];
    if (!s) return null; // not a real sentence in this group — drop it
    const check = gradeTranslation(qa.userAnswer || '', s.answerEn, s.altAnswers);
    return {
      sentenceId: qa.sentenceId,
      userAnswer: qa.userAnswer || '',
      isCorrect: check.isCorrect,
      score: check.score,
      timeSpentSeconds: Number.isFinite(qa.timeSpentSeconds) ? qa.timeSpentSeconds : undefined,
    };
  }).filter(Boolean);

  const verifiedTotal = group ? verified.length : (Number.isFinite(totalQuestions) ? totalQuestions : 0);
  const verifiedCorrect = group ? verified.filter((v) => v.isCorrect).length : (Number.isFinite(correctCount) ? correctCount : 0);
  const score = verifiedTotal > 0 ? Math.round((verifiedCorrect / verifiedTotal) * 100) : 0;

  const attempt = new AdvSentenceAttempt({
    userId,
    sessionType: sessionType === 'exam' ? 'exam' : 'practice',
    week: Number.isFinite(week) ? week : (group ? group.week : undefined),
    groupId: group ? group._id : undefined,
    groupName: groupName || (group ? group.nameVi : ''),
    sentencesAttempted: group ? verified : (sentencesAttempted || []),
    totalQuestions: verifiedTotal,
    correctCount: verifiedCorrect,
    scorePercentage: score,
  });
  await attempt.save();
  return attempt;
}

async function getHistory(userId, limit) {
  return AdvSentenceAttempt.find({ userId })
    .sort({ completedAt: -1 })
    .limit(limit)
    .select('groupName week correctCount totalQuestions scorePercentage completedAt sessionType')
    .lean();
}

// One saved attempt, each answered sentence joined back to the group bank
// for the review layout. Scoped to {_id, userId}.
async function getAttemptDetail(userId, attemptId) {
  if (!mongoose.isValidObjectId(attemptId)) return null;
  const attempt = await AdvSentenceAttempt.findOne({ _id: attemptId, userId }).lean();
  if (!attempt) return null;

  const sMap = {};
  let targetStructure = '';
  if (attempt.groupId) {
    const group = await SentenceStructureGroup.findById(attempt.groupId).lean();
    targetStructure = group?.targetStructure || '';
    for (const s of (group?.sentences || [])) sMap[String(s._id)] = s;
  }

  const sentences = (attempt.sentencesAttempted || []).map((qa, i) => {
    const s = sMap[qa.sentenceId] || {};
    return {
      index: i + 1,
      sentenceId: qa.sentenceId,
      promptVi: s.promptVi || '',
      structureNote: s.structureNote || '',
      userAnswer: qa.userAnswer || '',
      isCorrect: qa.isCorrect === true,
      score: Number.isFinite(qa.score) ? qa.score : null,
      timeSpentSeconds: Number.isFinite(qa.timeSpentSeconds) ? qa.timeSpentSeconds : null,
      modelAnswer: s.answerEn || '',
    };
  });

  return {
    _id: attempt._id,
    groupName: attempt.groupName || '',
    week: attempt.week || null,
    sessionType: attempt.sessionType || 'practice',
    targetStructure,
    correctCount: attempt.correctCount || 0,
    totalQuestions: attempt.totalQuestions || 0,
    scorePercentage: attempt.scorePercentage || 0,
    completedAt: attempt.completedAt || attempt.createdAt,
    sentences,
  };
}

// ── drafts ────────────────────────────────────────────────────────────
async function saveDraft(userId, body) {
  const { groupId, groupName, week, mode, sentenceIds, currentIdx, sessionAttempts, sentenceStatus, sessionDone, sessionCorrect } = body;
  // Enforce max-1 draft: drop drafts for the user's OTHER groups first.
  await AdvSentenceDraft.deleteMany({ userId, groupId: { $ne: groupId } });
  await AdvSentenceDraft.findOneAndUpdate(
    { userId, groupId },
    { groupId, groupName, week, mode, sentenceIds, currentIdx, sessionAttempts, sentenceStatus, sessionDone, sessionCorrect, savedAt: new Date() },
    { upsert: true, new: true },
  );
}

async function getDraft(userId, groupId) {
  return AdvSentenceDraft.findOne({ userId, groupId }).lean();
}

async function deleteDraft(userId, groupId) {
  await AdvSentenceDraft.deleteOne({ userId, groupId });
}

async function listDrafts(userId) {
  return AdvSentenceDraft.find({ userId })
    .select('groupId groupName week currentIdx sentenceIds savedAt')
    .lean();
}

module.exports = {
  normalize, gradeTranslation, sanitizeSentenceForClient,
  listWeeks, listGroupsForWeek, getGroupSentences,
  checkAnswer, getExam, submitExam,
  saveAttempt, getHistory, getAttemptDetail,
  saveDraft, getDraft, deleteDraft, listDrafts,
};
