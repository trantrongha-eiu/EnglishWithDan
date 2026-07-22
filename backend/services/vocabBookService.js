'use strict';

// Extracted from routes/vocabBook.js, verbatim logic.
const VocabBook = require('../models/VocabBook');
const VocabActivity = require('../models/VocabActivity');
const { todayVNDate, bonusForAccuracy, reserveDailyStreakBonus } = require('./streakBonusService');

// Fire-and-forget, không chặn response — cộng dồn activity vào bản ghi ngày hôm nay
// (Vietnam local day — same convention as User.getVNDay/effectiveStreak; using
// the server's raw UTC day here would misfile anything done 00:00–07:00 VN
// time under the previous calendar day).
function logActivity(userId, inc) {
  VocabActivity.findOneAndUpdate(
    { userId, date: todayVNDate() },
    { $inc: inc },
    { upsert: true, new: false }
  ).catch(() => {});
}

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

async function listBooks(user) {
  await ensureDefaultBooks(user._id);
  if (user.role === 'student') logActivity(user._id, { viewCount: 1 });

  const books = await VocabBook.find({ userId: user._id })
    .select('name color emoji isDefault createdAt sortOrder words')
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  return books.map(b => ({
    _id: b._id, name: b.name, color: b.color, emoji: b.emoji, isDefault: b.isDefault,
    totalWords: b.words.length,
    daThucCount: b.words.filter(w => w.status === 'da-thuoc').length,
    nhoSoSoCount: b.words.filter(w => w.status === 'nho-so-so').length,
    chuaThuocCount: b.words.filter(w => w.status === 'chua-thuoc').length,
  }));
}

async function reorderBooks(userId, order) {
  await Promise.all(order.map(({ _id, sortOrder }) =>
    VocabBook.updateOne({ _id, userId }, { $set: { sortOrder } })
  ));
}

async function completePractice(user, { wordsAnswered, correctAnswered = 0, unitId = null, unitType = null }) {
  if (user.role !== 'student') return { status: 'not_student' };
  if (wordsAnswered < 5) return { status: 'too_few' };

  logActivity(user._id, { wordsStudied: wordsAnswered });

  const accuracy = Math.max(0, Math.min(1, correctAnswered / wordsAnswered));
  const rawBonus = bonusForAccuracy(accuracy);
  const appliedBonus = await reserveDailyStreakBonus(user._id, rawBonus);

  // Always called (even with bonus 0) so lastActivityDate still advances
  // today — a sub-80% session keeps the day-chain alive without growing it.
  user.updateStreak(appliedBonus, { allowSameDayStack: true });

  // Búa Daniel: clearing a Paraphrase Unit at >=90% earns 1 hammer, but only
  // the first time that specific unit is ever cleared at that bar.
  let hammerEarned = false;
  if (unitType === 'paraphrase' && unitId && accuracy >= 0.9 &&
      !user.hammerAwardedUnits.some(id => id.equals(unitId))) {
    user.hammerAwardedUnits.push(unitId);
    user.streakHammers += 1;
    hammerEarned = true;
  }

  await user.save();
  return {
    status: 'ok',
    streak: user.learningStreak,
    bonusApplied: appliedBonus,
    hammerEarned,
    streakHammers: user.streakHammers,
  };
}

async function getBook(id, userId) {
  return VocabBook.findOne({ _id: id, userId });
}

async function createBook(userId, { name, emoji = '📘', color = '#3d8bff' }) {
  const bookCount = await VocabBook.countDocuments({ userId });
  if (bookCount >= 15) return { status: 'limit_reached' };

  const book = new VocabBook({ userId, name: name.trim(), emoji, color });
  await book.save();
  return { status: 'ok', book };
}

async function updateBook(id, userId, { name, emoji, color }) {
  const update = {};
  if (name) update.name = name.trim();
  if (emoji) update.emoji = emoji;
  if (color) update.color = color;
  return VocabBook.findOneAndUpdate({ _id: id, userId }, update, { new: true });
}

async function mergeBooks(destId, userId, sourceIds) {
  const dest = await VocabBook.findOne({ _id: destId, userId });
  if (!dest) return { status: 'dest_not_found' };

  const sources = await VocabBook.find({ _id: { $in: sourceIds }, userId, isDefault: false }).lean();
  if (!sources.length) return { status: 'no_valid_sources' };

  const existingWords = new Set(dest.words.map(w => w.word.toLowerCase().trim()));

  let addedCount = 0;
  for (const src of sources) {
    for (const w of src.words) {
      if (dest.words.length >= 300) break;
      const key = w.word.toLowerCase().trim();
      if (!existingWords.has(key)) {
        dest.words.push({
          word: w.word, meaning: w.meaning, example: w.example, phonetic: w.phonetic,
          partOfSpeech: w.partOfSpeech, status: w.status, note: w.note, source: w.source,
          wrongCount: w.wrongCount, savedAt: w.savedAt
        });
        existingWords.add(key);
        addedCount++;
      }
    }
  }

  await dest.save();

  await VocabBook.deleteMany({ _id: { $in: sources.map(s => s._id) }, userId, isDefault: false });

  return { status: 'ok', addedCount, mergedCount: sources.length, book: dest };
}

async function deleteBook(id, userId) {
  const book = await VocabBook.findOne({ _id: id, userId });
  if (!book) return { status: 'not_found' };
  if (book.isDefault) return { status: 'is_default' };
  await book.deleteOne();
  return { status: 'ok' };
}

async function addWord(bookId, user, { word, meaning, example, phonetic, partOfSpeech, source, note }) {
  const book = await VocabBook.findOne({ _id: bookId, userId: user._id });
  if (!book) return { status: 'not_found' };

  if (book.words.length >= 300) return { status: 'limit_reached', bookName: book.name };

  const duplicate = book.words.find(w => w.word.toLowerCase() === word.toLowerCase().trim());
  if (duplicate) return { status: 'duplicate' };

  book.words.push({ word: word.trim(), meaning, example, phonetic, partOfSpeech, source, note });
  await book.save();

  if (user.role === 'student') {
    logActivity(user._id, { wordsAdded: 1 });
    user.updateStreak();
    await user.save();
  }

  return { status: 'ok', bookName: book.name, word: book.words[book.words.length - 1] };
}

async function updateWord(bookId, wordId, userId, user, { status, note, word, meaning, example, phonetic, partOfSpeech, wrongCount }) {
  const book = await VocabBook.findOne({ _id: bookId, userId });
  if (!book) return { status2: 'book_not_found' };

  const wordDoc = book.words.id(wordId);
  if (!wordDoc) return { status2: 'word_not_found' };

  const hadStatusChange = status !== undefined && status !== wordDoc.status;
  if (status !== undefined) wordDoc.status = status;
  if (note !== undefined) wordDoc.note = note;
  if (word !== undefined) wordDoc.word = word.trim();
  if (meaning !== undefined) wordDoc.meaning = meaning;
  if (example !== undefined) wordDoc.example = example;
  if (phonetic !== undefined) wordDoc.phonetic = phonetic;
  if (partOfSpeech !== undefined) wordDoc.partOfSpeech = partOfSpeech;
  if (wrongCount !== undefined) wordDoc.wrongCount = Math.max(0, Number(wrongCount) || 0);

  await book.save();

  if (hadStatusChange && user.role === 'student') {
    logActivity(user._id, { wordsStudied: 1 });
    user.updateStreak();
    await user.save();
  }

  return { status2: 'ok', word: wordDoc };
}

async function deleteWord(bookId, wordId, userId) {
  const book = await VocabBook.findOne({ _id: bookId, userId });
  if (!book) return { status: 'not_found' };
  book.words = book.words.filter(w => w._id.toString() !== wordId);
  await book.save();
  return { status: 'ok' };
}

async function bulkAddWords(bookId, user, words) {
  const book = await VocabBook.findOne({ _id: bookId, userId: user._id });
  if (!book) return { status: 'not_found' };

  const existingWords = new Set(book.words.map(w => w.word.toLowerCase().trim()));
  let addedCount = 0;
  let skippedDup = 0;
  let skippedLimit = 0;

  for (const item of words) {
    const wordTrimmed = (item.word || '').trim();
    if (!wordTrimmed) continue;

    if (book.words.length >= 300) { skippedLimit++; continue; }

    const key = wordTrimmed.toLowerCase();
    if (existingWords.has(key)) { skippedDup++; continue; }

    book.words.push({
      word: wordTrimmed,
      meaning: (item.meaning || '').trim(),
      example: (item.example || '').trim(),
      phonetic: (item.phonetic || '').trim(),
      partOfSpeech: (item.partOfSpeech || '').trim(),
      source: 'bulk-import',
      note: ''
    });
    existingWords.add(key);
    addedCount++;
  }

  if (addedCount > 0) {
    await book.save();
    if (user.role === 'student') {
      logActivity(user._id, { wordsAdded: addedCount });
      user.updateStreak();
      await user.save();
    }
  }

  return { status: 'ok', addedCount, skippedDup, skippedLimit };
}

async function deleteWords(bookId, userId, wordIds) {
  const book = await VocabBook.findOne({ _id: bookId, userId });
  if (!book) return { status: 'not_found' };
  book.words = book.words.filter(w => !wordIds.includes(w._id.toString()));
  await book.save();
  return { status: 'ok' };
}

module.exports = {
  listBooks, reorderBooks, completePractice, getBook, createBook, updateBook,
  mergeBooks, deleteBook, addWord, updateWord, deleteWord, bulkAddWords, deleteWords,
};
