'use strict';
// GET /api/admin/attempt-detail/:skill/:id — what ONE student actually
// answered in one history row, for the skills whose student-facing review
// can't simply be deep-linked (Reading/Listening open reading.html /
// listening.html ?review= / ?practiceReview=; Writing, Speaking and the WT1
// courses have their own admin viewers). `skill` is the row key the
// /admin/recent-attempts feed emits (see routes/admin/stats.js).
//
// Every skill is normalised to one shape so admin-src's AttemptDetailModal
// renders them all the same way:
//   { title, subtitle, summary, items: [{ prompt, answer, correct, correctAnswer, explanation, note }], emptyNote }
// `correct` is true / false / null (not graded per item).

const express = require('express');
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');

const DictationAttempt = require('../../models/DictationAttempt');
const GapFillAttempt = require('../../models/GapFillAttempt');
const AdvSentenceAttempt = require('../../models/AdvSentenceAttempt');
const Task2Attempt = require('../../models/Task2Attempt');
const Task1Attempt = require('../../models/Task1Attempt');
const Task1Exercise = require('../../models/Task1Exercise');
const Task2TemplateAttempt = require('../../models/Task2TemplateAttempt');
const EssentialGrammarAttemptLog = require('../../models/EssentialGrammarAttemptLog');
const VocabularyLessonAttemptLog = require('../../models/VocabularyLessonAttemptLog');
const WritingPracticeAttempt = require('../../models/WritingPracticeAttempt');
const ListeningSection = require('../../models/ListeningSection');
const advSentenceService = require('../../services/advSentenceService');
const task2PracticeService = require('../../services/task2PracticeService');

const router = express.Router();

const pct = (c, t) => (t ? Math.round((c / t) * 100) : 0);
const scoreLine = (c, t) => `${c || 0}/${t || 0} đúng (${pct(c, t)}%)`;

const BUILDERS = {
  async 'dictation'(id) {
    const a = await DictationAttempt.findById(id).lean();
    if (!a) return null;
    const section = await ListeningSection.findById(a.sectionId).select('dictationSentences').lean().catch(() => null);
    const sentences = section?.dictationSentences || [];
    return {
      title: a.sectionTitle || `Dictation Part ${a.partNumber || ''}`.trim(),
      subtitle: '🎧 Dictation — chép chính tả từng câu',
      summary: scoreLine(a.correctCount, a.totalSentences),
      items: (a.answers || []).map(x => ({
        prompt: sentences[x.sentenceIndex]?.text || `Câu ${x.sentenceIndex + 1}`,
        answer: `${x.matchedWords || 0}/${x.totalWords || 0} từ khớp`,
        correct: !!x.isCorrect,
      })),
      emptyNote: 'Dictation chỉ lưu số từ khớp mỗi câu, không lưu nguyên văn học sinh gõ.',
    };
  },

  async 'listening-gapfill'(id) {
    const a = await GapFillAttempt.findById(id).lean();
    if (!a) return null;
    const section = await ListeningSection.findById(a.sectionId).select('gapFillAnswers').lean().catch(() => null);
    const key = section?.gapFillAnswers || [];
    const byBlank = new Map((a.answers || []).map(x => [x.blankIndex, x]));
    const total = Math.max(a.totalBlanks || 0, key.length);
    const items = [];
    for (let i = 0; i < total; i++) {
      const x = byBlank.get(i);
      items.push({
        prompt: `Ô trống ${i + 1}`,
        answer: x?.userAnswer || '',
        correct: x ? !!x.isCorrect : false,
        correctAnswer: key[i] || '',
      });
    }
    return {
      title: a.sectionTitle || 'Gap-fill',
      subtitle: '📝 Listening gap-fill',
      summary: scoreLine(a.correctCount, a.totalBlanks),
      items,
    };
  },

  async 'adv-sentence'(id) {
    const own = await AdvSentenceAttempt.findById(id).select('userId').lean();
    if (!own) return null;
    const d = await advSentenceService.getAttemptDetail(own.userId, id);
    if (!d) return null;
    return {
      title: d.groupName || 'Viết câu nâng cao',
      subtitle: `🧩 Viết câu nâng cao${d.week ? ` · Tuần ${d.week}` : ''}${d.sessionType === 'exam' ? ' · Kiểm tra' : ''}`,
      summary: `${scoreLine(d.correctCount, d.totalQuestions)}${d.targetStructure ? ` · Cấu trúc: ${d.targetStructure}` : ''}`,
      items: d.sentences.map(s => ({
        prompt: s.promptVi || `Câu ${s.index}`,
        answer: s.userAnswer,
        correct: s.isCorrect,
        correctAnswer: s.modelAnswer,
        explanation: s.structureNote,
        note: s.score != null ? `Điểm ${s.score}` : '',
      })),
    };
  },

  async 'task2-practice'(id) {
    const own = await Task2Attempt.findById(id).select('userId').lean();
    if (!own) return null;
    const d = await task2PracticeService.getAttemptDetail(own.userId, id);
    if (!d) return null;
    return {
      title: d.topicName || 'Task 2 practice',
      subtitle: `📝 Task 2${d.week ? ` · Tuần ${d.week}` : ''}${d.level ? ` · ${d.level}` : ''}${d.sessionType === 'exam' ? ' · Kiểm tra' : ''}`,
      summary: scoreLine(d.correctCount, d.totalQuestions),
      items: d.questions.map(q => ({
        prompt: q.questionText || `Câu ${q.index}`,
        options: q.options,
        answer: q.userAnswer,
        correct: q.isCorrect,
        correctAnswer: q.modelAnswer,
        explanation: q.explanationVi,
        note: q.score != null ? `Điểm ${q.score}` : '',
      })),
    };
  },

  // The history row is one practice SESSION of per-question docs; its _id
  // is one of them. Siblings share sessionId (older docs: the same hour).
  async 'task1-practice'(id) {
    const first = await Task1Attempt.findById(id).lean();
    if (!first) return null;
    let match;
    if (first.sessionId) match = { userId: first.userId, sessionId: first.sessionId };
    else {
      const start = new Date(first.createdAt); start.setUTCMinutes(0, 0, 0);
      match = { userId: first.userId, sessionId: { $in: [null, ''] }, createdAt: { $gte: start, $lt: new Date(start.getTime() + 3600e3) } };
    }
    const docs = await Task1Attempt.find(match).sort({ createdAt: 1 }).limit(300).lean();
    const exIds = [...new Set(docs.map(d => String(d.exerciseId)).filter(Boolean))];
    const exs = await Task1Exercise.find({ _id: { $in: exIds } }).lean().catch(() => []);
    const exMap = new Map(exs.map(e => [String(e._id), e]));
    const correct = docs.filter(d => d.isCorrect).length;
    return {
      title: 'Task 1 practice',
      subtitle: '📊 Luyện Task 1',
      summary: scoreLine(correct, docs.length),
      items: docs.map(d => {
        const e = exMap.get(String(d.exerciseId)) || {};
        const prompt = [e.instruction, e.questionVi || e.questionEn, e.sentenceWithBlanks].filter(Boolean).join('\n');
        const correctAnswer = e.options?.length && Number.isInteger(e.correctOptionIndex)
          ? e.options[e.correctOptionIndex]
          : (e.primaryAnswer || (e.sampleAnswers || [])[0] || '');
        return {
          prompt: prompt || '(Bài tập đã bị xoá)',
          options: e.options?.length ? e.options : undefined,
          answer: d.userAnswer,
          correct: d.isCorrect == null ? null : !!d.isCorrect,
          correctAnswer,
          explanation: d.feedback || e.explanation || '',
          note: d.score != null ? `Điểm ${d.score}` : '',
        };
      }),
    };
  },

  async 'essential-grammar'(id) {
    const a = await EssentialGrammarAttemptLog.findById(id).populate('lessonId', 'title').lean();
    if (!a) return null;
    const hasAnswers = Array.isArray(a.answers) && a.answers.length;
    return {
      title: a.lessonId?.title || 'Ngữ pháp',
      subtitle: '📘 Ngữ pháp',
      summary: `${scoreLine(a.correct, a.total)}${a.answered != null ? ` · đã trả lời ${a.answered}/${a.total}` : ''}`,
      items: hasAnswers
        ? a.answers.map(x => ({
          prompt: x.question || x.ref,
          answer: x.chosenText || (x.chosen == null ? '' : `Lựa chọn ${x.chosen + 1}`),
          correct: !!x.isCorrect,
          correctAnswer: x.correctText,
        }))
        : (a.wrongQuestions || []).map(q => ({ prompt: q, answer: '', correct: false })),
      emptyNote: hasAnswers ? '' : 'Lượt này được lưu trước khi hệ thống ghi từng câu trả lời — chỉ còn danh sách câu sai.',
    };
  },

  async 'vocabulary-lesson'(id) {
    const a = await VocabularyLessonAttemptLog.findById(id).populate('lessonId', 'title').lean();
    if (!a) return null;
    return {
      title: a.lessonId?.title || 'Từ vựng',
      subtitle: '🗂 Bài từ vựng',
      summary: scoreLine(a.correct, a.total),
      items: (a.wrongWords || []).map(w => ({ prompt: w, answer: '', correct: false })),
      emptyNote: 'Bài từ vựng chỉ lưu các từ học sinh làm sai.',
    };
  },

  async 'task2-template'(id) {
    const a = await Task2TemplateAttempt.findById(id).lean();
    if (!a) return null;
    return {
      title: a.templateName || a.templateType || 'Task 2 Template',
      subtitle: `📚 Task 2 Templates · ${a.mode || ''}${a.level ? ` · ${a.level}` : ''}${a.isExam ? ' · Kiểm tra' : ''}`,
      summary: scoreLine(a.correctItems, a.totalItems),
      items: [],
      emptyNote: 'Dạng bài này chỉ lưu điểm tổng, không lưu từng câu trả lời.',
    };
  },

  async 'writing-practice'(id) {
    const a = await WritingPracticeAttempt.findById(id).lean();
    if (!a) return null;
    return {
      title: a.topic || 'Writing lẻ',
      subtitle: `✍ Writing lẻ · ${a.level || ''}${a.types?.length ? ` · ${a.types.join(', ')}` : ''}`,
      summary: scoreLine(a.correctItems, a.totalItems),
      items: [],
      emptyNote: 'Dạng bài này chỉ lưu điểm tổng, không lưu từng câu trả lời.',
    };
  },
};

router.get('/attempt-detail/:skill/:id', auth, teacherOnly, async (req, res) => {
  try {
    const build = Object.prototype.hasOwnProperty.call(BUILDERS, req.params.skill) && BUILDERS[req.params.skill];
    if (!build) return res.status(400).json({ success: false, message: 'Kỹ năng này không có trang xem chi tiết' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    const detail = await build(req.params.id);
    if (!detail) return res.status(404).json({ success: false, message: 'Không tìm thấy bài làm (có thể đã quá 3 tháng)' });
    res.json({ success: true, detail });
  } catch (err) {
    console.error('[admin attempt-detail]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

router.ATTEMPT_DETAIL_SKILLS = Object.keys(BUILDERS);
module.exports = router;
