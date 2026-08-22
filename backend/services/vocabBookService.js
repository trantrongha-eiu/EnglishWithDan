'use strict';

// Extracted from routes/vocabBook.js, verbatim logic.
const mongoose = require('mongoose');
const VocabBook = require('../models/VocabBook');
const VocabUnit = require('../models/VocabUnit');
const VocabActivity = require('../models/VocabActivity');
const { todayVNDate, bonusForAccuracy, reserveDailyStreakBonus, reachedDailyWordThreshold } = require('./streakBonusService');
const VocabPracticeSession = require('../models/VocabPracticeSession');
const { escapeRegex } = require('../utils/strings');
const badgeService = require('./badgeService');

// A dashboard.js practice session reports in batches of 5 answers (see
// _reportSessionStreak()) so the 35-word/day engagement threshold stays
// accurate even for a long session that never reaches a results screen.
// That batching used to ALSO re-run the streak-bonus tier on each batch's
// own 5-word accuracy — once the day's word threshold was crossed mid-
// session, every following batch reserved another bonus on top, letting a
// single long session claim the whole shared +5/day cap by itself
// (reported by students as "học xong ngay lập tức được 5 lửa"). Fixed by
// scoping the bonus tier to the SESSION's own running accuracy (tracked in
// VocabPracticeSession, keyed by the sessionId the frontend generates once
// per startPractice() call and sends with every batch) — a session's total
// contribution is capped at bonusForAccuracy's max (2), same as one
// Reading/Listening submission, no matter how many batches it's reported
// in. Distinct sessions (or callers that don't pass a sessionId at all —
// dashboard-lesson.js's finishLessonQuiz() reports a whole quiz in one
// call, and reading/listening submit once per test) still each get their
// own independent shot at the shared daily cap, exactly as before.
async function reserveStreakBonusForSession(userId, sessionId, wordsAnswered, correctAnswered, batchAccuracy) {
  if (!sessionId) {
    // No session to scope against — same behavior as before this fix.
    return reserveDailyStreakBonus(userId, bonusForAccuracy(batchAccuracy));
  }
  const session = await VocabPracticeSession.findOneAndUpdate(
    { userId, sessionId },
    { $inc: { wordsAnswered, wordsCorrect: correctAnswered }, $setOnInsert: { userId, sessionId } },
    { upsert: true, new: true }
  );
  const sessionAccuracy = session.wordsAnswered > 0 ? session.wordsCorrect / session.wordsAnswered : 0;
  const targetBonus = bonusForAccuracy(sessionAccuracy);
  const rawBonus = Math.max(0, targetBonus - session.bonusGranted);
  if (rawBonus <= 0) return 0;

  const appliedBonus = await reserveDailyStreakBonus(userId, rawBonus);
  if (appliedBonus > 0) {
    await VocabPracticeSession.updateOne({ userId, sessionId }, { $inc: { bonusGranted: appliedBonus } });
  }
  return appliedBonus;
}

// Búa Daniel eligibility: dashboard.js reports a Paraphrase Unit practice
// run in 5-answer batches (_reportSessionStreak()), each carrying the same
// unitId/sessionId — accumulates those batches' word counts on the shared
// VocabPracticeSession doc so completePractice() can tell "answered a batch
// of 5" apart from "answered every word in the unit". Runs unconditionally
// (unlike reserveStreakBonusForSession, gated behind the daily 35-word
// threshold) so a unit's opening batches are never dropped from the total.
async function trackUnitProgress(userId, sessionId, wordsAnswered, correctAnswered) {
  const session = await VocabPracticeSession.findOneAndUpdate(
    { userId, sessionId },
    { $inc: { unitWordsAnswered: wordsAnswered, unitWordsCorrect: correctAnswered }, $setOnInsert: { userId, sessionId } },
    { upsert: true, new: true }
  );
  return { wordsAnswered: session.unitWordsAnswered, wordsCorrect: session.unitWordsCorrect };
}

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

async function completePractice(user, { wordsAnswered, correctAnswered = 0, unitId = null, unitType = null, sessionId = null }) {
  if (user.role !== 'student') return { status: 'not_student' };
  if (wordsAnswered < 5) return { status: 'too_few' };

  // Stamped on every real batch, independent of the streak-threshold gating
  // below — powers nav.js's "haven't studied vocab in N days" nudge, which
  // needs to know about vocab practice specifically even on a day that
  // didn't reach the 35-word streak bar or that had other streak activity
  // (Reading/Listening) masking a real vocab gap in lastActivityDate.
  user.lastVocabStudyDate = new Date();

  // Only counts toward the streak once today's cumulative word-engagement
  // (this call plus any earlier add/update/practice activity today) reaches
  // VOCAB_STREAK_WORD_THRESHOLD — see reachedDailyWordThreshold().
  const qualifiesToday = await reachedDailyWordThreshold(user._id, { wordsStudied: wordsAnswered });

  const accuracy = Math.max(0, Math.min(1, correctAnswered / wordsAnswered));

  // Always called once qualified (even with bonus 0) so lastActivityDate
  // still advances today — a sub-80% session keeps the day-chain alive
  // without growing it. Below the word threshold, skip entirely: today
  // shouldn't count as "studied" yet.
  let appliedBonus = 0;
  if (qualifiesToday) {
    appliedBonus = await reserveStreakBonusForSession(user._id, sessionId, wordsAnswered, correctAnswered, accuracy);
    user.updateStreak(appliedBonus, { allowSameDayStack: true });
  }

  // Búa Daniel: earns 1 hammer only once EVERY word in the Paraphrase
  // Unit's list has been answered across the whole session (accumulated via
  // trackUnitProgress, since dashboard.js reports in 5-answer batches — a
  // single batch's own accuracy used to be enough to award the hammer after
  // as few as 5-6 of a 100-word unit, see the incident this fixed) at a
  // cumulative accuracy of >=90%, and only the first time that unit is
  // ever cleared at that bar.
  let hammerEarned = false;
  if (unitType === 'paraphrase' && unitId && sessionId &&
      !user.hammerAwardedUnits.some(id => id.equals(unitId))) {
    const [cumulative, unit] = await Promise.all([
      trackUnitProgress(user._id, sessionId, wordsAnswered, correctAnswered),
      VocabUnit.findById(unitId).select('words').lean(),
    ]);
    const totalUnitWords = unit ? unit.words.filter(w => w.word && w.meaning).length : Infinity;
    const cumulativeAccuracy = cumulative.wordsAnswered > 0
      ? cumulative.wordsCorrect / cumulative.wordsAnswered : 0;
    if (cumulative.wordsAnswered >= totalUnitWords && cumulativeAccuracy >= 0.9) {
      user.hammerAwardedUnits.push(unitId);
      user.streakHammers += 1;
      hammerEarned = true;
    }
  }

  await user.save();
  // A session completion is exactly "a practice session just finished" —
  // where maxStreak (streak badges) can newly cross a threshold.
  const { newlyUnlocked } = await badgeService.checkAndAwardNewBadges(user._id);
  return {
    status: 'ok',
    streak: user.learningStreak,
    bonusApplied: appliedBonus,
    hammerEarned,
    streakHammers: user.streakHammers,
    newlyUnlocked,
  };
}

// Spaced repetition (Leitner box). 6 boxes (0-5), interval in days per box —
// index = box, so SRS_INTERVAL_DAYS[srsBox] is always the interval that was
// just earned. 'da-thuoc' promotes a box (further out), 'nho-so-so' demotes
// by one but never below box 1 (a "kinda remembered" miss isn't as costly as
// a full miss), 'chua-thuoc' resets to box 0 (due again immediately).
const SRS_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];

function computeSrs(prevBox, status) {
  let srsBox = prevBox || 0;
  if (status === 'da-thuoc') srsBox = Math.min(srsBox + 1, SRS_INTERVAL_DAYS.length - 1);
  else if (status === 'nho-so-so') srsBox = Math.max(srsBox - 1, 1);
  else if (status === 'chua-thuoc') srsBox = 0;

  const now = new Date();
  const nextReviewAt = new Date(now.getTime() + SRS_INTERVAL_DAYS[srsBox] * 24 * 60 * 60 * 1000);
  return { srsBox, nextReviewAt, lastReviewedAt: now };
}

// Derives the student-facing status label from SRS box alone — the single
// source of truth recordPracticeResult() uses so "mastered" always means
// "survived several spaced reviews without a miss", never "got it right
// once". Box 3+ = interval >= 7 days (SRS_INTERVAL_DAYS), i.e. promoted
// through box 0->1->2->3 without a reset in between. Deliberately NOT used
// by updateWord()'s manual status dropdown — a student's own explicit
// self-report stays exactly what they picked; this only governs the
// automatic evidence path from graded practice.
function statusFromBox(box) {
  if (box >= 3) return 'da-thuoc';
  if (box >= 1) return 'nho-so-so';
  return 'chua-thuoc';
}

// Records ONE piece of learning evidence from a graded practice answer
// (Flashcard/Quiz/Listen/Translate/Mixed/Review-due — see dashboard.js's
// _syncPracticeEvidence(), the single call site every practice mode
// ultimately funnels through). Reuses computeSrs()'s existing Leitner
// movement rules instead of a second SRS implementation:
//   - correct: same box-promotion computeSrs() already does for a manual
//     'da-thuoc' — promotes ONE level, does not jump straight to mastered.
//   - wrong: same reset-to-0 computeSrs() already does for 'chua-thuoc'.
// status is then re-derived from the resulting box via statusFromBox() —
// "repeated correct answers" is what earns mastery, never a single answer.
async function recordPracticeResult(bookId, wordId, userId, correct) {
  const book = await VocabBook.findOne({ _id: bookId, userId });
  if (!book) return { status2: 'book_not_found' };

  const wordDoc = book.words.id(wordId);
  if (!wordDoc) return { status2: 'word_not_found' };

  const wasMastered = wordDoc.status === 'da-thuoc';

  if (correct) {
    wordDoc.correctCount = (wordDoc.correctCount || 0) + 1;
  } else {
    wordDoc.wrongCount = (wordDoc.wrongCount || 0) + 1;
  }
  const srs = computeSrs(wordDoc.srsBox, correct ? 'da-thuoc' : 'chua-thuoc');
  wordDoc.srsBox = srs.srsBox;
  wordDoc.nextReviewAt = srs.nextReviewAt;
  wordDoc.lastReviewedAt = srs.lastReviewedAt;
  wordDoc.status = statusFromBox(wordDoc.srsBox);

  await book.save();

  // Only worth a badge check when this specific call is what pushed the
  // word INTO mastery — recordPracticeResult fires once per answer, so an
  // unconditional full recompute on every call (most of which can't have
  // moved vocabMastered at all) would be wasteful.
  let newlyUnlocked = [];
  if (!wasMastered && wordDoc.status === 'da-thuoc') {
    newlyUnlocked = (await badgeService.checkAndAwardNewBadges(userId)).newlyUnlocked;
  }
  return { status2: 'ok', word: wordDoc, newlyUnlocked };
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

  // The frontend's own merge picker already excludes the destination book
  // from the source checklist, but that's client-side UX only — without
  // this, a request that included destId in sourceIds (a future frontend
  // regression, or a direct/replayed API call) would merge the book into
  // itself (a no-op, since its own words are already in existingWords
  // below) and then get caught by the unconditional deleteMany() at the
  // end, deleting the very book it was just merged into.
  const destIdStr = destId.toString();
  const filteredSourceIds = sourceIds.filter(id => id.toString() !== destIdStr);
  const sources = await VocabBook.find({ _id: { $in: filteredSourceIds }, userId, isDefault: false }).lean();
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
          wrongCount: w.wrongCount, correctCount: w.correctCount, savedAt: w.savedAt, collocations: w.collocations || [],
          srsBox: w.srsBox, nextReviewAt: w.nextReviewAt, lastReviewedAt: w.lastReviewedAt,
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

// Client-supplied collocation list (dictionary popup / VocabularyLesson
// carry-over) — cap both item count and per-item length so a malformed or
// abusive payload can't bloat a word subdocument.
const MAX_COLLOCATIONS_PER_WORD = 10;
function sanitizeCollocations(raw) {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map(c => String(c || '').trim().slice(0, 100))
    .filter(Boolean)
    .slice(0, MAX_COLLOCATIONS_PER_WORD);
}

async function addWord(bookId, user, { word, meaning, example, phonetic, partOfSpeech, source, note, collocations }) {
  const trimmed = word.trim();

  // Ownership + soft cap check first (a small residual race on the 300-word
  // cap specifically is unchanged from before and out of scope here — the
  // fix below targets the duplicate race, which is what actually happened
  // in production, see incident: "tolerant" saved twice 165ms apart).
  const book = await VocabBook.findOne({ _id: bookId, userId: user._id }).select('name words');
  if (!book) return { status: 'not_found' };
  if (book.words.length >= 300) return { status: 'limit_reached', bookName: book.name };

  // Atomic check-and-insert: the "no case-insensitive match already exists"
  // condition lives in the FILTER of this single findOneAndUpdate, so MongoDB
  // evaluates it against the document's latest state at write time — not a
  // snapshot from an earlier .find() read. Two requests racing to save the
  // same word can no longer both pass a stale duplicate check before either
  // commits; the second one's filter simply fails to match once the first
  // has landed, and it falls through to the 'duplicate' branch below.
  const dupPattern = new RegExp(`^${escapeRegex(trimmed)}$`, 'i');
  const newWord = { word: trimmed, meaning, example, phonetic, partOfSpeech, source, note, collocations: sanitizeCollocations(collocations) || [] };
  const updated = await VocabBook.findOneAndUpdate(
    { _id: bookId, userId: user._id, words: { $not: { $elemMatch: { word: dupPattern } } } },
    { $push: { words: newWord } },
    { new: true }
  ).select('name words');

  if (!updated) return { status: 'duplicate' };

  if (user.role === 'student') {
    if (await reachedDailyWordThreshold(user._id, { wordsAdded: 1 })) {
      user.updateStreak();
      await user.save();
    }
  }

  return { status: 'ok', bookName: updated.name, word: updated.words[updated.words.length - 1] };
}

async function updateWord(bookId, wordId, userId, user, { status, note, word, meaning, example, phonetic, partOfSpeech, wrongCount, collocations }) {
  const book = await VocabBook.findOne({ _id: bookId, userId });
  if (!book) return { status2: 'book_not_found' };

  const wordDoc = book.words.id(wordId);
  if (!wordDoc) return { status2: 'word_not_found' };

  const hadStatusChange = status !== undefined && status !== wordDoc.status;
  if (status !== undefined) {
    wordDoc.status = status;
    // Server computes the SRS schedule — never trust a client-supplied
    // srsBox/nextReviewAt (see updateWord's caller list: PATCH accepts an
    // arbitrary body today, and this is the one part of it that must stay
    // server-authoritative).
    const srs = computeSrs(wordDoc.srsBox, status);
    wordDoc.srsBox = srs.srsBox;
    wordDoc.nextReviewAt = srs.nextReviewAt;
    wordDoc.lastReviewedAt = srs.lastReviewedAt;
  }
  if (note !== undefined) wordDoc.note = note;
  if (word !== undefined) {
    // addWord() rejects a case-insensitive duplicate on create, but editing
    // an EXISTING word's text to match another word already in the same
    // book was never checked — the edit-word modal (dashboard.js's
    // saveEditWord()) does expose the word-text field, so this was a real,
    // reachable way to end up with two entries for the same word.
    const trimmed = word.trim();
    const wordIdStr = wordId.toString();
    const dup = book.words.find(w => w._id.toString() !== wordIdStr && w.word.toLowerCase() === trimmed.toLowerCase());
    if (dup) return { status2: 'duplicate' };
    wordDoc.word = trimmed;
  }
  if (meaning !== undefined) wordDoc.meaning = meaning;
  if (example !== undefined) wordDoc.example = example;
  if (phonetic !== undefined) wordDoc.phonetic = phonetic;
  if (partOfSpeech !== undefined) wordDoc.partOfSpeech = partOfSpeech;
  if (wrongCount !== undefined) wordDoc.wrongCount = Math.max(0, Number(wrongCount) || 0);
  if (collocations !== undefined) wordDoc.collocations = sanitizeCollocations(collocations) || [];

  await book.save();

  if (hadStatusChange && user.role === 'student') {
    if (await reachedDailyWordThreshold(user._id, { wordsStudied: 1 })) {
      user.updateStreak();
      await user.save();
    }
  }

  // Only worth a badge check when this manual status edit is what pushed
  // the word INTO mastery (mirrors recordPracticeResult's same guard).
  let newlyUnlocked = [];
  if (hadStatusChange && wordDoc.status === 'da-thuoc') {
    newlyUnlocked = (await badgeService.checkAndAwardNewBadges(userId)).newlyUnlocked;
  }
  return { status2: 'ok', word: wordDoc, newlyUnlocked };
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
      note: '',
      collocations: sanitizeCollocations(item.collocations) || [],
    });
    existingWords.add(key);
    addedCount++;
  }

  if (addedCount > 0) {
    await book.save();
    if (user.role === 'student') {
      if (await reachedDailyWordThreshold(user._id, { wordsAdded: addedCount })) {
        user.updateStreak();
        await user.save();
      }
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

// Words due for review "today": nextReviewAt in the past, OR never reviewed
// at all (a freshly-saved word should show up in the queue right away).
// $unwind across a user's books' embedded word arrays — capped at 300
// words/book x 15 books/user max, comfortably small for this per-request
// aggregation (see docs/PRODUCT_FEATURE_AUDIT.md's SRS phase for why no
// dedicated index was added: revisit only if that cap assumption changes).
async function getDueWords(userId, limit = 30) {
  const now = new Date();
  return VocabBook.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$words' },
    { $match: { $or: [{ 'words.nextReviewAt': { $lte: now } }, { 'words.nextReviewAt': null }] } },
    { $sort: { 'words.nextReviewAt': 1 } },
    { $limit: limit },
    { $project: { _id: 0, bookId: '$_id', bookName: '$name', word: '$words' } },
  ]);
}

// A word gotten wrong this many times or more counts as "weak" — matches
// the existing ">= 3" convention dashboard.js's "Ôn lại từ hay sai" button
// already uses (frontend/js/dashboard.js's renderBookContent/hardBtn and
// retryWrongWords), so this stat and that button always agree on the same
// number. Distinct from (and not required to match) the separate
// DifficultWord feature, which tracks a different, cross-source wrong-word
// list with its own semantics.
const WEAK_WRONG_COUNT_THRESHOLD = 3;

// "My Vocabulary" dashboard totals — summed across ALL of a user's books in
// one aggregation pass (unlike listBooks(), which returns PER-BOOK counts
// and fetches every book's full words[] into JS to compute them). Used by
// the vocab home screen's stat tiles (Saved/To review/Weak/Mastered).
async function getVocabStats(userId) {
  const now = new Date();
  const [result] = await VocabBook.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$words' },
    { $group: {
        _id: null,
        totalWords: { $sum: 1 },
        mastered:   { $sum: { $cond: [{ $eq: ['$words.status', 'da-thuoc'] }, 1, 0] } },
        reviewing:  { $sum: { $cond: [{ $eq: ['$words.status', 'nho-so-so'] }, 1, 0] } },
        notYet:     { $sum: { $cond: [{ $eq: ['$words.status', 'chua-thuoc'] }, 1, 0] } },
        weak:       { $sum: { $cond: [{ $gte: ['$words.wrongCount', WEAK_WRONG_COUNT_THRESHOLD] }, 1, 0] } },
        dueToday:   { $sum: { $cond: [{ $or: [{ $lte: ['$words.nextReviewAt', now] }, { $eq: ['$words.nextReviewAt', null] }] }, 1, 0] } },
      } },
    { $project: { _id: 0, totalWords: 1, mastered: 1, reviewing: 1, notYet: 1, weak: 1, dueToday: 1 } },
  ]);
  return result || { totalWords: 0, mastered: 0, reviewing: 0, notYet: 0, weak: 0, dueToday: 0 };
}

// Cross-book weak-word list for the dashboard's Weakness card / "Từ yếu"
// tile — same wrongCount>=3 threshold getVocabStats() already counts by,
// now returning the actual words (not just a count) so the frontend can
// launch a practice session without fetching all of a user's books/words
// just to filter client-side. $sort+$limit BEFORE $project keeps this a
// single small aggregation regardless of how many books/words a user has.
async function getWeakWords(userId, limit = 20) {
  return VocabBook.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$words' },
    { $match: { 'words.wrongCount': { $gte: WEAK_WRONG_COUNT_THRESHOLD } } },
    { $sort: { 'words.wrongCount': -1 } },
    { $limit: limit },
    { $project: {
        _id: 0,
        bookId: '$_id',
        bookName: '$name',
        word: {
          _id: '$words._id', word: '$words.word', meaning: '$words.meaning',
          wrongCount: '$words.wrongCount', status: '$words.status', srsBox: '$words.srsBox',
        },
      } },
  ]);
}

module.exports = {
  listBooks, reorderBooks, completePractice, getBook, createBook, updateBook,
  mergeBooks, deleteBook, addWord, updateWord, deleteWord, bulkAddWords, deleteWords,
  getDueWords, getVocabStats, getWeakWords, recordPracticeResult, statusFromBox,
};
