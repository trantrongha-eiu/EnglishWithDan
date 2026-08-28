'use strict';

const vocabBookService = require('../services/vocabBookService');
const streakBonusService = require('../services/streakBonusService');

function guard(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('[VocabBook] error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
}

exports.listBooks = guard(async (req, res) => {
  const books = await vocabBookService.listBooks(req.user);
  res.json({ success: true, books });
});

exports.reorderBooks = guard(async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ success: false, message: 'Invalid order' });
  await vocabBookService.reorderBooks(req.user._id, order);
  res.json({ success: true });
});

exports.completePractice = guard(async (req, res) => {
  const { wordsAnswered = 0, correctAnswered = 0, unitId = null, unitType = null, sessionId = null } = req.body;
  // Must be a plain string (not e.g. a Mongo query-operator object) — it's
  // used as an exact-match filter value in vocabBookService.
  const safeSessionId = typeof sessionId === 'string' && sessionId ? sessionId.slice(0, 100) : null;
  const result = await vocabBookService.completePractice(req.user, { wordsAnswered, correctAnswered, unitId, unitType, sessionId: safeSessionId });
  if (result.status === 'not_student') return res.json({ success: true });
  if (result.status === 'too_few') return res.json({ success: false, message: 'Cần ít nhất 5 từ để tính streak' });
  res.json({
    success: true,
    streak: result.streak,
    bonusApplied: result.bonusApplied,
    hammerEarned: result.hammerEarned,
    streakHammers: result.streakHammers,
    newlyUnlocked: result.newlyUnlocked,
  });
});

exports.getDueWords = guard(async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
  const words = await vocabBookService.getDueWords(req.user._id, limit);
  res.json({ success: true, words });
});

exports.getVocabStats = guard(async (req, res) => {
  const stats = await vocabBookService.getVocabStats(req.user._id);
  res.json({ success: true, stats });
});

// GET /api/vocabbook/daily-goal — today's vocab word target (scales with
// the student's IELTS target band) + how many they've done so far. Powers
// the "học đủ N từ hôm nay" nudge shown on every page load. Free students
// included — the reminder is universal.
exports.getDailyGoal = guard(async (req, res) => {
  const targetBand = req.user.targetBand || null;
  const target = streakBonusService.dailyWordTargetForBand(targetBand);
  const studied = await streakBonusService.vocabStudiedToday(req.user._id);
  res.json({
    success: true,
    target,
    studied,
    remaining: Math.max(0, target - studied),
    met: studied >= target,
    targetBand,
  });
});

exports.getWeakWords = guard(async (req, res) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const words = await vocabBookService.getWeakWords(req.user._id, limit);
  res.json({ success: true, words });
});

exports.recordPracticeResult = guard(async (req, res) => {
  const correct = req.body.correct === true;
  const result = await vocabBookService.recordPracticeResult(req.params.id, req.params.wordId, req.user._id, correct);
  if (result.status2 === 'book_not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  if (result.status2 === 'word_not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy từ' });
  res.json({ success: true, word: result.word, newlyUnlocked: result.newlyUnlocked });
});

exports.getBook = guard(async (req, res) => {
  const book = await vocabBookService.getBook(req.params.id, req.user._id);
  if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sổ' });
  res.json({ success: true, book });
});

exports.createBook = guard(async (req, res) => {
  const { name, emoji = '📘', color = '#3d8bff' } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ success: false, message: 'Tên sổ không được để trống' });
  }
  const result = await vocabBookService.createBook(req.user._id, { name, emoji, color });
  if (result.status === 'limit_reached') {
    return res.status(400).json({ success: false, message: 'Bạn đã đạt giới hạn 15 sổ từ vựng. Hãy xóa hoặc gộp bớt sổ cũ trước khi tạo mới.' });
  }
  res.status(201).json({ success: true, book: result.book });
});

exports.updateBook = guard(async (req, res) => {
  const book = await vocabBookService.updateBook(req.params.id, req.user._id, req.body);
  if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sổ' });
  res.json({ success: true, book });
});

exports.mergeBooks = guard(async (req, res) => {
  const { sourceIds = [] } = req.body;
  if (!sourceIds.length) {
    return res.status(400).json({ success: false, message: 'Chưa chọn sổ nào để gộp' });
  }
  const result = await vocabBookService.mergeBooks(req.params.id, req.user._id, sourceIds);
  if (result.status === 'dest_not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy sổ đích' });
  if (result.status === 'no_valid_sources') return res.status(400).json({ success: false, message: 'Không có sổ hợp lệ để gộp' });
  res.json({ success: true, addedCount: result.addedCount, mergedCount: result.mergedCount, book: result.book });
});

exports.deleteBook = guard(async (req, res) => {
  const result = await vocabBookService.deleteBook(req.params.id, req.user._id);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  if (result.status === 'is_default') return res.status(400).json({ success: false, message: 'Không thể xoá sổ mặc định' });
  res.json({ success: true });
});

exports.addWord = guard(async (req, res) => {
  const { word } = req.body;
  if (!word?.trim()) {
    return res.status(400).json({ success: false, message: 'Thiếu từ vựng' });
  }
  const result = await vocabBookService.addWord(req.params.id, req.user, req.body);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy sổ' });
  if (result.status === 'limit_reached') {
    return res.status(400).json({ success: false, message: `Sổ "${result.bookName}" đã đạt giới hạn 300 từ. Hãy tạo sổ mới hoặc xóa bớt từ cũ.` });
  }
  if (result.status === 'duplicate') return res.json({ success: false, message: `"${word}" đã có trong sổ này` });
  res.status(201).json({ success: true, message: `Đã lưu "${word}" vào "${result.bookName}"`, word: result.word });
});

exports.updateWord = guard(async (req, res) => {
  const result = await vocabBookService.updateWord(req.params.id, req.params.wordId, req.user._id, req.user, req.body);
  if (result.status2 === 'book_not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  if (result.status2 === 'word_not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy từ' });
  if (result.status2 === 'duplicate') return res.status(409).json({ success: false, message: 'Từ này đã có trong sổ' });
  res.json({ success: true, word: result.word, newlyUnlocked: result.newlyUnlocked });
});

exports.deleteWord = guard(async (req, res) => {
  const result = await vocabBookService.deleteWord(req.params.id, req.params.wordId, req.user._id);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  res.json({ success: true });
});

exports.bulkAddWords = guard(async (req, res) => {
  const { words } = req.body;
  if (!Array.isArray(words) || !words.length) {
    return res.status(400).json({ success: false, message: 'Danh sách từ không hợp lệ' });
  }
  const result = await vocabBookService.bulkAddWords(req.params.id, req.user, words);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy sổ' });

  const parts = [`Đã thêm ${result.addedCount} từ`];
  if (result.skippedDup > 0) parts.push(`${result.skippedDup} từ trùng`);
  if (result.skippedLimit > 0) parts.push(`${result.skippedLimit} từ vượt giới hạn 300`);
  res.json({ success: true, addedCount: result.addedCount, skippedDup: result.skippedDup, skippedLimit: result.skippedLimit, message: parts.join(' · ') });
});

exports.deleteWords = guard(async (req, res) => {
  // wordIds:null (not just undefined) used to reach vocabBookService's
  // wordIds.includes(...) filter and throw — the `= []` default only ever
  // fires for undefined, not an explicit null (audit finding BUG-019). Any
  // non-array, or an array with a non-string entry, is rejected the same
  // way; an array containing a malformed/non-ObjectId string is left alone
  // — the filter below just won't match it against any real word, a
  // harmless no-op, not a crash risk.
  const { wordIds } = req.body;
  if (wordIds !== undefined && (!Array.isArray(wordIds) || wordIds.some(id => typeof id !== 'string'))) {
    return res.status(400).json({ success: false, message: 'wordIds phải là một mảng chuỗi ID' });
  }
  const safeWordIds = wordIds || [];
  const result = await vocabBookService.deleteWords(req.params.id, req.user._id, safeWordIds);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  res.json({ success: true, message: `Đã xoá ${safeWordIds.length} từ` });
});
