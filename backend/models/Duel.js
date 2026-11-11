const mongoose = require('mongoose');

// ⚔️ Thách đấu (services/duelService.js, rules in constants/shop.js): two
// players stake the same 🔥 from their ví lửa. Both stakes are held here
// (taken from the wallets up front) until the duel is refunded or paid out.
//
//   pending   — challenger paid, waiting for the opponent (until expiresAt)
//   active    — both paid; runs from acceptance to the end of VN day endDay
//   done      — settled: winnerId took 2 × stake (null = tie, both refunded)
//   declined / cancelled / expired — challenger refunded
//
// Scores are the daily-capped 🔥 tally (VocabActivity.streakBonusEarned)
// from startDay to endDay, minus what each had already earned on startDay
// when the duel began (baseC / baseO).
const DuelSchema = new mongoose.Schema({
  challengerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challengerName: { type: String, required: true },
  opponentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opponentName:   { type: String, required: true },
  stake:          { type: Number, required: true },
  status:         { type: String, enum: ['pending', 'active', 'done', 'declined', 'cancelled', 'expired'], default: 'pending' },
  expiresAt:      { type: Date, required: true },
  startDay:       { type: Date, default: null },
  endDay:         { type: Date, default: null },
  baseC:          { type: Number, default: 0 },
  baseO:          { type: Number, default: 0 },
  scoreC:         { type: Number, default: 0 },
  scoreO:         { type: Number, default: 0 },
  winnerId:       { type: mongoose.Schema.Types.ObjectId, default: null },
  settledAt:      { type: Date, default: null },
}, { timestamps: true });

DuelSchema.index({ challengerId: 1, status: 1 });
DuelSchema.index({ opponentId: 1, status: 1 });
DuelSchema.index({ status: 1, expiresAt: 1 });
DuelSchema.index({ status: 1, endDay: 1 });
// Retention (3 months, like all practice history). A duel is over within
// ~3 days, so this only ever removes finished ones.
DuelSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Duel', DuelSchema);
