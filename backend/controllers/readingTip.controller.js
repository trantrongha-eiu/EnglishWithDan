'use strict';

const mongoose = require('mongoose');
const readingTipService = require('../services/readingTipService');
const readingTipPracticeService = require('../services/readingTipPracticeService');

exports.listLessons = async (req, res) => {
  try {
    // Public (no auth on this route), fixed content — safe to cache briefly.
    res.set('Cache-Control', 'public, max-age=120');
    const lessons = (await readingTipService.listLessons())
      .map(l => ({ ...l, hasPractice: readingTipPracticeService.hasPractice(l.lessonKey) }));
    res.json({ success: true, lessons });
  } catch (err) {
    console.error('[Reading tips lessons]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/reading-tips/:lessonKey/practice — a fresh mini-practice built
// from existing passages (no answer key in the payload).
exports.getPractice = async (req, res) => {
  try {
    const result = await readingTipPracticeService.getPractice(req.params.lessonKey);
    if (result.status === 'no_practice') {
      return res.status(404).json({ success: false, code: 'NO_PRACTICE', message: 'Bài này chưa có phần luyện tập.' });
    }
    // Randomised per request — never let a cache hand two students (or two
    // attempts) the same response.
    res.set('Cache-Control', 'no-store');
    if (!result.practice) {
      return res.json({ success: true, tip: result.tip, practice: null, message: 'Chưa tìm thấy bài luyện tập phù hợp.' });
    }
    res.json({ success: true, tip: result.tip, practice: result.practice });
  } catch (err) {
    console.error('[Reading tips practice]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/reading-tips/:lessonKey/practice/check
// body: { passageId, questionNumber, answer, pairIndex? } — pairIndex picks
// the paraphrase pair within a question (Keyword → Paraphrase practice).
exports.checkPracticeAnswer = async (req, res) => {
  try {
    const { passageId, questionNumber, answer, pairIndex } = req.body || {};
    if (!mongoose.isValidObjectId(passageId) || !Number.isInteger(Number(questionNumber))) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
    }
    if ((answer != null && typeof answer !== 'string') || (pairIndex != null && !Number.isInteger(Number(pairIndex)))) {
      return res.status(400).json({ success: false, message: 'Đáp án không hợp lệ' });
    }
    const result = await readingTipPracticeService.checkAnswer(req.params.lessonKey, { passageId, questionNumber, answer, pairIndex });
    if (result.status === 'no_practice') {
      return res.status(404).json({ success: false, code: 'NO_PRACTICE', message: 'Bài này chưa có phần luyện tập.' });
    }
    if (result.status === 'not_found') {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài đọc' });
    }
    if (result.status === 'not_in_practice') {
      return res.status(400).json({ success: false, code: 'NOT_IN_PRACTICE', message: 'Câu hỏi này không thuộc bài luyện tập.' });
    }
    res.json({ success: true, result: result.result });
  } catch (err) {
    console.error('[Reading tips practice check]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
