'use strict';

const mongoose = require('mongoose');
const listeningTipService = require('../services/listeningTipService');
const listeningTipPracticeService = require('../services/listeningTipPracticeService');

exports.listLessons = async (req, res) => {
  try {
    // Public (no auth on this route), fixed content — safe to cache briefly.
    res.set('Cache-Control', 'public, max-age=120');
    const lessons = (await listeningTipService.listLessons())
      .map(l => ({ ...l, hasPractice: listeningTipPracticeService.hasPractice(l.lessonKey) }));
    res.json({ success: true, lessons });
  } catch (err) {
    console.error('[Listening tips lessons]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ?exclude=id,id… — the sections of the student's last practices (kept in
// their browser); anything that isn't an ObjectId is ignored.
function parseExclude(raw) {
  if (typeof raw !== 'string') return [];
  const ids = raw.split(',').map(s => s.trim()).filter(s => /^[a-f\d]{24}$/i.test(s));
  return [...new Set(ids)].slice(0, 10);
}

// GET /api/listening-tips/:lessonKey/practice — a fresh mini-practice built
// from existing Listening sections (no answer key in the payload).
exports.getPractice = async (req, res) => {
  try {
    const result = await listeningTipPracticeService.getPractice(req.params.lessonKey, { exclude: parseExclude(req.query.exclude) });
    if (result.status === 'no_practice') {
      return res.status(404).json({ success: false, code: 'NO_PRACTICE', message: 'Bài này chưa có phần luyện tập.' });
    }
    // Randomised per request — never let a cache hand out the same one.
    res.set('Cache-Control', 'no-store');
    if (!result.practice) {
      return res.json({ success: true, tip: result.tip, practice: null, message: 'Chưa tìm thấy bài luyện tập phù hợp.' });
    }
    res.json({ success: true, tip: result.tip, practice: result.practice });
  } catch (err) {
    console.error('[Listening tips practice]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const isInt = (v) => v != null && Number.isInteger(Number(v));

// POST /api/listening-tips/:lessonKey/practice/check
// body: { sectionId, questionNumber, answer, prediction? }        — a gap
//     | { item: 'audio', sectionId, sentenceIndex, answer }         — a heard sentence → symbol
//     | { item: 'meaning', symbol, answer }                         — a symbol → meaning
exports.checkPracticeAnswer = async (req, res) => {
  try {
    const body = req.body || {};
    const { item, sectionId, questionNumber, sentenceIndex, answer, prediction, symbol } = body;
    if ((answer != null && typeof answer !== 'string') || (prediction != null && typeof prediction !== 'string')
      || (symbol != null && typeof symbol !== 'string')) {
      return res.status(400).json({ success: false, message: 'Đáp án không hợp lệ' });
    }
    const valid = item === 'meaning' ? typeof symbol === 'string'
      : item === 'audio' ? mongoose.isValidObjectId(sectionId) && isInt(sentenceIndex)
        : item == null && mongoose.isValidObjectId(sectionId) && isInt(questionNumber);
    if (!valid) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });

    const result = await listeningTipPracticeService.checkAnswer(req.params.lessonKey, {
      item, sectionId, questionNumber, sentenceIndex, answer, prediction, symbol,
    });
    if (result.status === 'no_practice') {
      return res.status(404).json({ success: false, code: 'NO_PRACTICE', message: 'Bài này chưa có phần luyện tập.' });
    }
    if (result.status === 'not_found') {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài nghe' });
    }
    if (result.status === 'not_in_practice') {
      return res.status(400).json({ success: false, code: 'NOT_IN_PRACTICE', message: 'Câu hỏi này không thuộc bài luyện tập.' });
    }
    res.json({ success: true, result: result.result });
  } catch (err) {
    console.error('[Listening tips practice check]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
