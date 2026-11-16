'use strict';
// Admin side of task2-practice.html ("Task 2 Luyện đề tuần"): one Task2Topic
// = one Buổi (numbered in week, orderIndex order over the active topics),
// with its nested questions, vocabulary and brainstorm hints.
//
// Step ③ "Dịch câu" since 2026-11-16 = sentences of "Bài mẫu từ Daniel" (the
// WritingTask2 model essay of the same prompt), tagged "MỞ BÀI · / THÂN BÀI 1 ·
// / THÂN BÀI 2 ·" in questionText, + one "Tự viết kết bài" (short_writing).
// The sentence sets they replaced stay in the doc with isActive:false.
// Built by scripts/seedTask2SampleSentences.js from data/task2/sampleSentences.js.

const express = require('express');
const mongoose = require('mongoose');
const auth    = require('../../middleware/auth');
const { teacherOnly, escapeRegex } = require('./_shared');

const Task2Topic = require('../../models/Task2Topic');
const WritingTask2 = require('../../models/WritingTask2');
const Task2Attempt = require('../../models/Task2Attempt');
const Task2LessonWork = require('../../models/Task2LessonWork');
const Task2VocabProgress = require('../../models/Task2VocabProgress');
const Task2Draft = require('../../models/Task2Draft');
const User = require('../../models/User');

const router = express.Router();

const STEP3_TYPES = new Set(['translation', 'paraphrase', 'short_writing']);
const SECTION_RE = [['intro', /^MỞ BÀI\b/], ['body1', /^THÂN BÀI 1\b/], ['body2', /^THÂN BÀI 2\b/]];
function sectionOf(q) {
  if (q.type === 'short_writing') return 'conclusion';
  for (const [k, re] of SECTION_RE) if (re.test(q.questionText || '')) return k;
  return null;
}

// Per-topic question counts for the list row.
function questionStats(questions) {
  const qs = questions || [];
  const on = qs.filter(q => q.isActive !== false);
  const step3 = on.filter(q => STEP3_TYPES.has(q.type));
  return {
    questionCount: qs.length,
    activeCount: on.length,
    retiredCount: qs.length - on.length,
    step3Count: step3.filter(q => q.type !== 'short_writing').length,
    fromSample: step3.filter(q => ['intro', 'body1', 'body2'].includes(sectionOf(q))).length,
    hasConclusion: step3.some(q => q.type === 'short_writing'),
    levels: on.map(q => q.level),
  };
}

// topicId → Buổi number (course order over the ACTIVE topics, like the
// student page's /api/task2/sessions).
async function sessionNumbers() {
  const list = await Task2Topic.find({ isActive: true }).select('_id').sort({ week: 1, orderIndex: 1 }).lean();
  return new Map(list.map((t, i) => [String(t._id), i + 1]));
}

const normPrompt = s => (s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[."'’,\s]+$/g, '').trim();
async function sampleFor(topic) {
  if (topic.writingTask2Id) {
    const w = await WritingTask2.findById(topic.writingTask2Id).select('prompt sampleSections').lean();
    if (w) return w;
  }
  const key = normPrompt(topic.prompt);
  if (!key) return null;
  const all = await WritingTask2.find({}).select('prompt sampleSections').lean();
  return all.find(w => normPrompt(w.prompt) === key) || null;
}

const TOPIC_FIELDS = ['week', 'block', 'topicName', 'topicEmoji', 'essayType', 'prompt', 'writingTask2Id',
  'hintAdvantages', 'hintDisadvantages', 'brainstormHints', 'vocabularyList', 'orderIndex', 'isActive'];
const QUESTION_FIELDS = ['questionId', 'level', 'type', 'questionText', 'options', 'baseWords', 'correctAnswer',
  'promptVi', 'explanationVi', 'explanationEn', 'modelAnswer', 'fallbackKeywords', 'sentenceStructure',
  'orderIndex', 'isActive'];
function pick(body, fields) {
  const out = {};
  for (const k of fields) if (body && body[k] !== undefined) out[k] = body[k];
  return out;
}
const badId = (res, msg) => res.status(404).json({ success: false, message: msg });

// ══════════════════════════════════════════════════
// TASK 2 TOPICS CRUD
// ══════════════════════════════════════════════════

// GET /api/admin/task2/topics  ?week=&essayType=&active=true|false&search=&page=&limit=
// List rows carry counts only (no questions); the panel fetches /:id.
router.get('/task2/topics', auth, teacherOnly, async (req, res) => {
  try {
    const { week = 'all', essayType = 'all', active = 'all', search = '', page = 1, limit = 20 } = req.query;
    const query = {};
    if (week !== 'all' && Number.isFinite(parseInt(week, 10))) query.week = parseInt(week, 10);
    if (essayType !== 'all' && essayType) query.essayType = String(essayType);
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;
    if (search) {
      const rx = { $regex: escapeRegex(String(search).slice(0, 100)), $options: 'i' };
      query.$or = [{ topicName: rx }, { prompt: rx }];
    }

    const lim = Math.min(Math.max(Number(limit) || 20, 1), 5000);
    const pg = Math.max(Number(page) || 1, 1);
    const [docs, total, nums] = await Promise.all([
      Task2Topic.find(query)
        .select('topicName topicEmoji week essayType isActive orderIndex writingTask2Id vocabularyList.term questions.type questions.level questions.isActive questions.questionText')
        .sort({ week: 1, orderIndex: 1 }).skip((pg - 1) * lim).limit(lim).lean(),
      Task2Topic.countDocuments(query),
      sessionNumbers(),
    ]);
    const topics = docs.map(t => {
      const { questions, vocabularyList, ...rest } = t;
      return {
        ...rest,
        session: nums.get(String(t._id)) || null,
        vocabCount: (vocabularyList || []).length,
        ...questionStats(questions),
      };
    });
    res.json({ success: true, topics, total, page: pg, totalPages: Math.ceil(total / lim) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/task2/topics/:id — the whole topic + its Buổi number + the
// Daniel sample essay step ③ is built from (null when none matches).
router.get('/task2/topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return badId(res, 'Không tìm thấy topic');
    const topic = await Task2Topic.findById(req.params.id).lean();
    if (!topic) return badId(res, 'Không tìm thấy topic');
    const [nums, sample] = await Promise.all([sessionNumbers(), sampleFor(topic)]);
    res.json({
      success: true,
      topic: { ...topic, session: nums.get(String(topic._id)) || null },
      sample: sample ? { _id: sample._id, sections: (sample.sampleSections || []).map(s => ({ title: s.title, content: s.content })) } : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/task2/topics/:id/students — every student who touched this
// Buổi (last 90 days): step ① vocab, ③ sentences, ④⑤ essay, practice runs.
router.get('/task2/topics/:id/students', auth, teacherOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return badId(res, 'Không tìm thấy topic');
    const topic = await Task2Topic.findById(req.params.id).select('questions vocabularyList.term').lean();
    if (!topic) return badId(res, 'Không tìm thấy topic');
    const topicId = topic._id;

    const [works, vocab, attempts, drafts] = await Promise.all([
      Task2LessonWork.find({ topicId }).select('userId sections submittedAt sentences brainstorm updatedAt').lean(),
      Task2VocabProgress.find({ topicId }).select('userId savedTerms quizBest updatedAt').lean(),
      Task2Attempt.find({ topicId }).select('userId sessionType scorePercentage correctCount totalQuestions questionsAttempted completedAt').lean(),
      Task2Draft.find({ topicId: String(topicId) }).select('userId sessionAttempts savedAt').lean(),
    ]);

    // Current step ③ sentence ids (what the student page counts for the ≥70% gate).
    const step3 = (topic.questions || []).filter(q => q.isActive !== false && STEP3_TYPES.has(q.type));
    const idsOf = q => [q.questionId, String(q._id)].filter(Boolean);
    const vocabTotal = new Set((topic.vocabularyList || []).map(v => v.term)).size;

    const rows = new Map();
    const row = uid => {
      const k = String(uid);
      if (!rows.has(k)) rows.set(k, { userId: k, vocabSaved: 0, quizBest: null, sentences: new Map(), sections: null, submittedAt: null, brainstorm: 0, runs: 0, bestScore: null, last: null });
      return rows.get(k);
    };
    const seen = (r, d) => { if (d && (!r.last || d > r.last)) r.last = d; };
    const take = (r, qa) => {
      if (!qa || !qa.questionId || typeof qa.userAnswer !== 'string' || !qa.userAnswer.trim()) return;
      const prev = r.sentences.get(qa.questionId);
      if (prev && prev.isCorrect && !qa.isCorrect) return;
      r.sentences.set(qa.questionId, { en: qa.userAnswer.trim(), isCorrect: !!qa.isCorrect });
    };

    for (const v of vocab) { const r = row(v.userId); r.vocabSaved = (v.savedTerms || []).length; r.quizBest = v.quizBest ?? null; seen(r, v.updatedAt); }
    for (const a of attempts) {
      const r = row(a.userId);
      (a.questionsAttempted || []).forEach(qa => take(r, qa));
      if (a.sessionType !== 'exam' && a.totalQuestions > 0) {
        r.runs++;
        r.bestScore = Math.max(r.bestScore ?? 0, a.scorePercentage || 0);
      }
      seen(r, a.completedAt);
    }
    for (const w of works) {
      const r = row(w.userId);
      for (const [qid, s] of Object.entries(w.sentences || {})) take(r, { questionId: qid, userAnswer: s.en, isCorrect: s.isCorrect });
      r.sections = w.sections || null;
      r.submittedAt = w.submittedAt || null;
      r.brainstorm = (w.brainstorm || []).filter(s => (s || '').trim()).length;
      seen(r, w.updatedAt);
    }
    for (const d of drafts) { const r = row(d.userId); (d.sessionAttempts || []).forEach(qa => take(r, qa)); seen(r, d.savedAt); }

    const users = await User.find({ _id: { $in: [...rows.keys()] } }).select('username email firstName lastName').lean();
    const names = new Map(users.map(u => [String(u._id), [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || u.email || '']));
    const words = s => (String(s || '').trim() ? String(s).trim().split(/\s+/).length : 0);

    const students = [...rows.values()].map(r => {
      const answers = step3.map(q => { for (const id of idsOf(q)) { const s = r.sentences.get(id); if (s) return s; } return null; });
      const sec = r.sections || {};
      return {
        userId: r.userId,
        name: names.get(r.userId) || '(đã xoá)',
        vocabSaved: r.vocabSaved, vocabTotal, quizBest: r.quizBest,
        brainstorm: r.brainstorm,
        step3Total: step3.length,
        step3Done: answers.filter(Boolean).length,
        step3Correct: answers.filter(a => a && a.isCorrect).length,
        words: { intro: words(sec.intro), body1: words(sec.body1), body2: words(sec.body2), conclusion: words(sec.conclusion) },
        submittedAt: r.submittedAt,
        runs: r.runs, bestScore: r.bestScore,
        last: r.last,
      };
    }).sort((a, b) => new Date(b.last || 0) - new Date(a.last || 0));

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/task2/topics/:id/students/:userId — one student's step ③
// answers (their English for each current sentence) + their essay.
router.get('/task2/topics/:id/students/:userId', auth, teacherOnly, async (req, res) => {
  try {
    const { id, userId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) return badId(res, 'Không tìm thấy');
    const topic = await Task2Topic.findById(id).select('questions').lean();
    if (!topic) return badId(res, 'Không tìm thấy topic');
    const [work, attempts, draft] = await Promise.all([
      Task2LessonWork.findOne({ topicId: id, userId }).select('sections sentences brainstorm submittedAt').lean(),
      Task2Attempt.find({ topicId: id, userId }).select('questionsAttempted').sort({ completedAt: 1, _id: 1 }).lean(),
      Task2Draft.findOne({ topicId: id, userId }).select('sessionAttempts').lean(),
    ]);
    const best = new Map();
    const take = qa => {
      if (!qa || !qa.questionId || typeof qa.userAnswer !== 'string' || !qa.userAnswer.trim()) return;
      const prev = best.get(qa.questionId);
      if (prev && prev.isCorrect && !qa.isCorrect) return;
      best.set(qa.questionId, { en: qa.userAnswer.trim(), isCorrect: !!qa.isCorrect });
    };
    attempts.forEach(a => (a.questionsAttempted || []).forEach(take));
    Object.entries((work && work.sentences) || {}).forEach(([qid, s]) => take({ questionId: qid, userAnswer: s.en, isCorrect: s.isCorrect }));
    ((draft && draft.sessionAttempts) || []).forEach(take);

    const sentences = (topic.questions || [])
      .filter(q => q.isActive !== false && STEP3_TYPES.has(q.type))
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .map(q => {
        const mine = best.get(q.questionId) || best.get(String(q._id)) || null;
        return { questionId: q.questionId || String(q._id), section: sectionOf(q), type: q.type, model: q.correctAnswer || q.modelAnswer || '', en: mine ? mine.en : '', isCorrect: mine ? mine.isCorrect : null };
      });
    res.json({
      success: true,
      sentences,
      sections: (work && work.sections) || null,
      brainstorm: (work && work.brainstorm) || [],
      submittedAt: (work && work.submittedAt) || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task2/topics
router.post('/task2/topics', auth, teacherOnly, async (req, res) => {
  try {
    const topic = new Task2Topic(pick(req.body, TOPIC_FIELDS));
    await topic.save();
    res.status(201).json({ success: true, topic });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/task2/topics/:id — topic fields only; questions are managed
// through the /questions routes below (a `questions` key is ignored).
router.put('/task2/topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return badId(res, 'Không tìm thấy topic');
    const topic = await Task2Topic.findByIdAndUpdate(req.params.id, pick(req.body, TOPIC_FIELDS), { returnDocument: 'after', runValidators: true });
    if (!topic) return badId(res, 'Không tìm thấy topic');
    res.json({ success: true, topic });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task2/topics/:id
router.delete('/task2/topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return badId(res, 'Không tìm thấy topic');
    const topic = await Task2Topic.findByIdAndDelete(req.params.id);
    if (!topic) return badId(res, 'Không tìm thấy topic');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task2/topics/:id/questions
router.post('/task2/topics/:id/questions', auth, teacherOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return badId(res, 'Không tìm thấy topic');
    const topic = await Task2Topic.findByIdAndUpdate(
      req.params.id,
      { $push: { questions: pick(req.body, QUESTION_FIELDS) } },
      { returnDocument: 'after', runValidators: true }
    );
    if (!topic) return badId(res, 'Không tìm thấy topic');
    const q = topic.questions[topic.questions.length - 1];
    res.status(201).json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/task2/topics/:topicId/questions/:qid — set on the subdoc
// and save, so enum / required validators run (the old positional $set
// skipped them and also accepted any key, _id included).
router.put('/task2/topics/:topicId/questions/:qid', auth, teacherOnly, async (req, res) => {
  try {
    const { topicId, qid } = req.params;
    if (!mongoose.isValidObjectId(topicId) || !mongoose.isValidObjectId(qid)) return badId(res, 'Không tìm thấy câu hỏi');
    const topic = await Task2Topic.findById(topicId);
    const q = topic && topic.questions.id(qid);
    if (!q) return badId(res, 'Không tìm thấy câu hỏi');
    q.set(pick(req.body, QUESTION_FIELDS));
    await topic.save();
    res.json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task2/topics/:topicId/questions/:qid
router.delete('/task2/topics/:topicId/questions/:qid', auth, teacherOnly, async (req, res) => {
  try {
    const { topicId, qid } = req.params;
    if (!mongoose.isValidObjectId(topicId) || !mongoose.isValidObjectId(qid)) return badId(res, 'Không tìm thấy topic');
    const topic = await Task2Topic.findByIdAndUpdate(
      topicId,
      { $pull: { questions: { _id: qid } } },
      { returnDocument: 'after' }
    );
    if (!topic) return badId(res, 'Không tìm thấy topic');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// The former `/reseed-task2-week12` route was removed (2026-08-26 curriculum
// restructure — week 12 no longer means the topics it was written for), and
// POST /api/admin/fix-task1-context was removed 2026-11-16: it re-added the
// "data context" box to Task 1 Grammar Q15/Q16 by orderIndex alone, undoing
// the Bộ 1 rebuild (scripts/rebuildTask1GrammarSet1.js).

module.exports = router;
module.exports._test = { sectionOf, questionStats };
