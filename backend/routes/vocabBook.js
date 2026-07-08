const express        = require('express');
const router         = express.Router();
const VocabBook      = require('../models/VocabBook');
const VocabActivity  = require('../models/VocabActivity');
const auth           = require('../middleware/auth');

// ── Helper: cộng dồn activity vào bản ghi ngày hôm nay (UTC) ──────────────
function logActivity(userId, inc) {
  const now  = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  // fire-and-forget, không chặn response
  VocabActivity.findOneAndUpdate(
    { userId, date },
    { $inc: inc },
    { upsert: true, new: false }
  ).catch(() => {}); // bỏ qua lỗi ghi log
}

// ── Helper: tạo 5 sổ mặc định khi user mới ─────────────────────────────────
async function ensureDefaultBooks(userId) {
  const count = await VocabBook.countDocuments({ userId });
  if (count > 0) return;

  const defaults = [
    { name: 'Sổ 1', emoji: '📘', color: '#3d8bff' },
    { name: 'Sổ 2', emoji: '📗', color: '#34d399' },
    { name: 'Sổ 3', emoji: '📙', color: '#f59e0b' },
    { name: 'Sổ 4', emoji: '📕', color: '#e53935' },
    { name: 'Sổ 5', emoji: '📓', color: '#a78bfa' },
  ];

  await VocabBook.insertMany(
    defaults.map(d => ({ ...d, userId, isDefault: true, words: [] }))
  );
}

// ══════════════════════════════════════════════════════
// GET /api/vocabbook/  – lấy tất cả sổ của user (kèm số từ)
// ══════════════════════════════════════════════════════
router.get('/', auth, async (req, res) => {
  try {
    await ensureDefaultBooks(req.user._id);
    // Chỉ log view cho student (không log khi admin/teacher xem)
    if (req.user.role === 'student') logActivity(req.user._id, { viewCount: 1 });

    const books = await VocabBook.find({ userId: req.user._id })
      .select('name color emoji isDefault createdAt sortOrder words')
      .sort({ sortOrder: 1, createdAt: 1 });

    // Thêm thống kê nhỏ mà không load toàn bộ words
    const result = books.map(b => ({
      _id:       b._id,
      name:      b.name,
      color:     b.color,
      emoji:     b.emoji,
      isDefault: b.isDefault,
      totalWords:    b.words.length,
      daThucCount:   b.words.filter(w => w.status === 'da-thuoc').length,
      nhoSoSoCount:  b.words.filter(w => w.status === 'nho-so-so').length,
      chuaThuocCount:b.words.filter(w => w.status === 'chua-thuoc').length,
    }));

    res.json({ success: true, books: result });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════
// PUT /api/vocabbook/reorder  – lưu thứ tự sổ sau khi kéo thả
// Body: { order: [{ _id, sortOrder }] }
// ══════════════════════════════════════════════════════
router.put('/reorder', auth, async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ success: false, message: 'Invalid order' });
    await Promise.all(order.map(({ _id, sortOrder }) =>
      VocabBook.updateOne({ _id, userId: req.user._id }, { $set: { sortOrder } })
    ));
    res.json({ success: true });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════
// POST /api/vocabbook/practice-complete
// Ghi nhận hoàn thành buổi luyện tập (>= 5 từ) → cập nhật streak
// Body: { wordsAnswered: Number }
// ══════════════════════════════════════════════════════
router.post('/practice-complete', auth, async (req, res) => {
  try {
    const { wordsAnswered = 0 } = req.body;
    if (req.user.role !== 'student') return res.json({ success: true });
    if (wordsAnswered < 5) return res.json({ success: false, message: 'Cần ít nhất 5 từ để tính streak' });

    logActivity(req.user._id, { wordsStudied: wordsAnswered });
    req.user.updateStreak();
    await req.user.save();

    res.json({ success: true, streak: req.user.learningStreak });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════
// GET /api/vocabbook/:id  – lấy chi tiết 1 sổ (có words)
// ══════════════════════════════════════════════════════
router.get('/:id', auth, async (req, res) => {
  try {
    const book = await VocabBook.findOne({
      _id: req.params.id, userId: req.user._id
    });
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sổ' });
    res.json({ success: true, book });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════
// POST /api/vocabbook/  – tạo sổ mới
// Body: { name, emoji, color }
// ══════════════════════════════════════════════════════
router.post('/', auth, async (req, res) => {
  try {
    const { name, emoji = '📘', color = '#3d8bff' } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Tên sổ không được để trống' });
    }
    const bookCount = await VocabBook.countDocuments({ userId: req.user._id });
    if (bookCount >= 15) {
      return res.status(400).json({ success: false, message: 'Bạn đã đạt giới hạn 15 sổ từ vựng. Hãy xóa hoặc gộp bớt sổ cũ trước khi tạo mới.' });
    }
    const book = new VocabBook({ userId: req.user._id, name: name.trim(), emoji, color });
    await book.save();
    res.status(201).json({ success: true, book });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════
// PUT /api/vocabbook/:id  – đổi tên / emoji / màu sổ
// ══════════════════════════════════════════════════════
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, emoji, color } = req.body;
    const update = {};
    if (name)  update.name  = name.trim();
    if (emoji) update.emoji = emoji;
    if (color) update.color = color;

    const book = await VocabBook.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      update,
      { new: true }
    );
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sổ' });
    res.json({ success: true, book });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════
// POST /api/vocabbook/:id/merge  – gộp nhiều sổ vào sổ này
// Body: { sourceIds: [id1, id2, ...] }  (chỉ sổ không phải default)
// ══════════════════════════════════════════════════════
router.post('/:id/merge', auth, async (req, res) => {
  try {
    const { sourceIds = [] } = req.body;
    if (!sourceIds.length) {
      return res.status(400).json({ success: false, message: 'Chưa chọn sổ nào để gộp' });
    }

    const dest = await VocabBook.findOne({ _id: req.params.id, userId: req.user._id });
    if (!dest) return res.status(404).json({ success: false, message: 'Không tìm thấy sổ đích' });

    // Chỉ lấy sổ nguồn không phải default và thuộc user
    const sources = await VocabBook.find({
      _id: { $in: sourceIds },
      userId: req.user._id,
      isDefault: false
    });
    if (!sources.length) {
      return res.status(400).json({ success: false, message: 'Không có sổ hợp lệ để gộp' });
    }

    // Build set từ đã có trong sổ đích (chống trùng)
    const existingWords = new Set(dest.words.map(w => w.word.toLowerCase().trim()));

    let addedCount = 0;
    for (const src of sources) {
      for (const w of src.words) {
        if (dest.words.length >= 300) break;
        const key = w.word.toLowerCase().trim();
        if (!existingWords.has(key)) {
          dest.words.push({
            word:         w.word,
            meaning:      w.meaning,
            example:      w.example,
            phonetic:     w.phonetic,
            partOfSpeech: w.partOfSpeech,
            status:       w.status,
            note:         w.note,
            source:       w.source,
            wrongCount:   w.wrongCount,
            savedAt:      w.savedAt
          });
          existingWords.add(key);
          addedCount++;
        }
      }
    }

    await dest.save();

    // Xóa các sổ nguồn (chỉ xóa sổ không phải default)
    await VocabBook.deleteMany({
      _id: { $in: sources.map(s => s._id) },
      userId: req.user._id,
      isDefault: false
    });

    res.json({ success: true, addedCount, mergedCount: sources.length, book: dest });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════
// DELETE /api/vocabbook/:id  – xoá sổ (không xoá sổ default)
// ══════════════════════════════════════════════════════
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await VocabBook.findOne({ _id: req.params.id, userId: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    if (book.isDefault) {
      return res.status(400).json({ success: false, message: 'Không thể xoá sổ mặc định' });
    }
    await book.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════
// POST /api/vocabbook/:id/words  – thêm từ vào sổ
// Body: { word, meaning, example, phonetic, partOfSpeech, source }
// ══════════════════════════════════════════════════════
router.post('/:id/words', auth, async (req, res) => {
  try {
    const { word, meaning, example, phonetic, partOfSpeech, source, note } = req.body;
    if (!word?.trim()) {
      return res.status(400).json({ success: false, message: 'Thiếu từ vựng' });
    }

    const book = await VocabBook.findOne({ _id: req.params.id, userId: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sổ' });

    if (book.words.length >= 300) {
      return res.status(400).json({ success: false, message: `Sổ "${book.name}" đã đạt giới hạn 300 từ. Hãy tạo sổ mới hoặc xóa bớt từ cũ.` });
    }

    // Tránh trùng lặp trong cùng sổ
    const duplicate = book.words.find(w => w.word.toLowerCase() === word.toLowerCase().trim());
    if (duplicate) {
      return res.json({ success: false, message: `"${word}" đã có trong sổ này` });
    }

    book.words.push({ word: word.trim(), meaning, example, phonetic, partOfSpeech, source, note });
    await book.save();

    if (req.user.role === 'student') {
      logActivity(req.user._id, { wordsAdded: 1 });
      req.user.updateStreak();
      await req.user.save();
    }

    res.status(201).json({
      success: true,
      message: `Đã lưu "${word}" vào "${book.name}"`,
      word:    book.words[book.words.length - 1]
    });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════
// PATCH /api/vocabbook/:id/words/:wordId  – cập nhật trạng thái / ghi chú / nội dung từ
// Body: { status?, note?, word?, meaning?, example?, phonetic?, partOfSpeech? }
// ══════════════════════════════════════════════════════
router.patch('/:id/words/:wordId', auth, async (req, res) => {
  try {
    const { status, note, word, meaning, example, phonetic, partOfSpeech, wrongCount } = req.body;
    const book = await VocabBook.findOne({ _id: req.params.id, userId: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    const wordDoc = book.words.id(req.params.wordId);
    if (!wordDoc) return res.status(404).json({ success: false, message: 'Không tìm thấy từ' });

    const hadStatusChange = status !== undefined && status !== wordDoc.status;
    if (status      !== undefined) wordDoc.status      = status;
    if (note        !== undefined) wordDoc.note        = note;
    if (word        !== undefined) wordDoc.word        = word.trim();
    if (meaning     !== undefined) wordDoc.meaning     = meaning;
    if (example     !== undefined) wordDoc.example     = example;
    if (phonetic    !== undefined) wordDoc.phonetic    = phonetic;
    if (partOfSpeech !== undefined) wordDoc.partOfSpeech = partOfSpeech;
    if (wrongCount  !== undefined) wordDoc.wrongCount  = Math.max(0, Number(wrongCount) || 0);

    await book.save();

    // Chỉ tính "ôn từ" khi thực sự đổi trạng thái học
    if (hadStatusChange && req.user.role === 'student') {
      logActivity(req.user._id, { wordsStudied: 1 });
      req.user.updateStreak();
      await req.user.save();
    }

    res.json({ success: true, word: wordDoc });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════
// DELETE /api/vocabbook/:id/words/:wordId  – xoá 1 từ
// ══════════════════════════════════════════════════════
router.delete('/:id/words/:wordId', auth, async (req, res) => {
  try {
    const book = await VocabBook.findOne({ _id: req.params.id, userId: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    book.words = book.words.filter(w => w._id.toString() !== req.params.wordId);
    await book.save();
    res.json({ success: true });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════
// POST /api/vocabbook/:id/words/bulk  – thêm nhiều từ cùng lúc
// Body: { words: [{word, meaning, example, phonetic, partOfSpeech}] }
// ══════════════════════════════════════════════════════
router.post('/:id/words/bulk', auth, async (req, res) => {
  try {
    const { words } = req.body;
    if (!Array.isArray(words) || !words.length) {
      return res.status(400).json({ success: false, message: 'Danh sách từ không hợp lệ' });
    }

    const book = await VocabBook.findOne({ _id: req.params.id, userId: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sổ' });

    const existingWords = new Set(book.words.map(w => w.word.toLowerCase().trim()));
    let addedCount  = 0;
    let skippedDup  = 0;
    let skippedLimit = 0;

    for (const item of words) {
      const wordTrimmed = (item.word || '').trim();
      if (!wordTrimmed) continue;

      if (book.words.length >= 300) { skippedLimit++; continue; }

      const key = wordTrimmed.toLowerCase();
      if (existingWords.has(key)) { skippedDup++; continue; }

      book.words.push({
        word:         wordTrimmed,
        meaning:      (item.meaning      || '').trim(),
        example:      (item.example      || '').trim(),
        phonetic:     (item.phonetic     || '').trim(),
        partOfSpeech: (item.partOfSpeech || '').trim(),
        source: 'bulk-import',
        note: ''
      });
      existingWords.add(key);
      addedCount++;
    }

    if (addedCount > 0) {
      await book.save();
      if (req.user.role === 'student') {
        logActivity(req.user._id, { wordsAdded: addedCount });
        req.user.updateStreak();
        await req.user.save();
      }
    }

    const parts = [`Đã thêm ${addedCount} từ`];
    if (skippedDup   > 0) parts.push(`${skippedDup} từ trùng`);
    if (skippedLimit > 0) parts.push(`${skippedLimit} từ vượt giới hạn 300`);
    res.json({ success: true, addedCount, skippedDup, skippedLimit, message: parts.join(' · ') });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ══════════════════════════════════════════════════════
// DELETE /api/vocabbook/:id/words  – xoá nhiều từ cùng lúc
// Body: { wordIds: [...] }
// ══════════════════════════════════════════════════════
router.delete('/:id/words', auth, async (req, res) => {
  try {
    const { wordIds = [] } = req.body;
    const book = await VocabBook.findOne({ _id: req.params.id, userId: req.user._id });
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    book.words = book.words.filter(w => !wordIds.includes(w._id.toString()));
    await book.save();
    res.json({ success: true, message: `Đã xoá ${wordIds.length} từ` });
  } catch (err) {
    console.error('[VocabBook] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;