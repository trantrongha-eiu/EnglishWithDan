const mongoose = require('mongoose');

// One document per continuous vocab-practice session (dashboard.js's
// startPractice() generates a fresh sessionId per call, sent with every
// batched /vocabbook/practice-complete report — see _reportSessionStreak()).
// Tracks how much streak bonus THIS session has already been granted so a
// long session reported in 5-answer batches can't re-claim the bonus tier
// at every batch boundary — see vocabBookService.reserveStreakBonusForSession().
const VocabPracticeSessionSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId:     { type: String, required: true },
  wordsAnswered: { type: Number, default: 0 },
  wordsCorrect:  { type: Number, default: 0 },
  bonusGranted:  { type: Number, default: 0 },
  // Sessions are only ever relevant for a few hours — auto-expire after 24h
  // so this collection doesn't grow unbounded.
  createdAt:     { type: Date, default: Date.now, expires: 86400 },
});

VocabPracticeSessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('VocabPracticeSession', VocabPracticeSessionSchema);
