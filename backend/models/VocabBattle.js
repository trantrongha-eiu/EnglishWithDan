const mongoose = require('mongoose');

// ⚔️ Đấu trường từ vựng (services/vocabBattleService.js, rules in
// constants/vocabBattle.js). One room = a host + 1–3 invited students.
//
//   kind 'quiz'  — everyone answers the SAME question set (synonyms,
//                  antonyms, meanings, nối từ, ghép câu, nghe & điền, …),
//                  each at their own pace before expiresAt: live if they
//                  play at once, or "async" (B plays A's set later).
//   kind 'chain' — Nối chữ: turn-based, the next word starts with the last
//                  letter of the previous one; live, the host starts it.
//
//   status open      — inviting (quiz: joined players can already play;
//                      chain: lobby)
//          playing   — chain game running
//          done      — settled (winnerIds, players[].reward)
//          cancelled — nobody to play against / host cancelled: stakes refunded
//
// Every write goes through vocabBattleService.mutate(): a full replace that
// is conditional on `rev`, so two tabs, two players or a sweep can never
// apply a move — or pay out — twice. Stakes (🔥 from the ví lửa) leave the
// wallet BEFORE the write that records them as `paid`, and are refunded if
// that write loses.
const PlayerSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:       { type: String, default: '' },
  avatar:     { type: String, default: '' },
  bot:        { type: Boolean, default: false }, // Lulu 🤖, the solo Nối chữ opponent
  state:      { type: String, enum: ['invited', 'joined', 'declined', 'left'], default: 'invited' },
  paid:       { type: Number, default: 0 },     // 🔥 held on the room
  joinedAt:   { type: Date, default: null },
  seenAt:     { type: Date, default: null },    // last poll (lobby "online" dot)
  note:       { type: String, default: '' },    // 'moved' = went into another room while a Nối chữ lobby waited
  // quiz run
  idx:        { type: Number, default: 0 },     // next question
  qAt:        { type: Date, default: null },    // when question idx was served
  answers:    { type: [mongoose.Schema.Types.Mixed], default: [] }, // { frac, pts, ms, given, timeout }
  finishedAt: { type: Date, default: null },
  // both kinds
  score:      { type: Number, default: 0 },
  correct:    { type: Number, default: 0 },
  // chain
  lives:      { type: Number, default: 0 },
  out:        { type: Boolean, default: false },
  // settlement
  rank:       { type: Number, default: 0 },
  reward:     { type: Number, default: 0 },     // 🔥 credited at the end (pot share / friendly win / refund)
}, { _id: false });

const VocabBattleSchema = new mongoose.Schema({
  hostId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind:      { type: String, enum: ['quiz', 'chain'], required: true },
  // Chơi một mình: no opponents (chain: vs the bot), no stake, no 🔥 — the
  // score only feeds the player's personal best per game.
  solo:      { type: Boolean, default: false },
  stake:     { type: Number, default: 0 },
  config: {
    types:       { type: [String], default: [] },
    count:       { type: Number, default: 10 },
    source:      { type: String, default: 'all' },
    lessonId:    { type: String, default: '' },
    lessonTitle: { type: String, default: '' },
    turnSeconds: { type: Number, default: 15 },
    lives:       { type: Number, default: 2 },
  },
  players:   { type: [PlayerSchema], default: [] },
  memberIds: [{ type: mongoose.Schema.Types.ObjectId }],   // every player's userId (index)
  // Server-only: answers included. Stripped before anything reaches a client.
  questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
  status:    { type: String, enum: ['open', 'playing', 'done', 'cancelled'], default: 'open' },
  expiresAt: { type: Date, required: true },
  startedAt: { type: Date, default: null },
  endedAt:   { type: Date, default: null },
  chain: {
    words:    { type: [mongoose.Schema.Types.Mixed], default: [] }, // { w, by, pts, bank, at }
    turn:     { type: Number, default: 0 },     // index into players
    letter:   { type: String, default: '' },
    deadline: { type: Date, default: null },
  },
  winnerIds: [{ type: mongoose.Schema.Types.ObjectId }],
  pot:       { type: Number, default: 0 },
  rewardDay: { type: Date, default: null },     // VN day of the friendly-win reward (daily cap)
  // A finished trận thách đấu where everyone really played (≥ half the
  // questions / ≥ 1 word): only these count on the Đấu trường BXH
  // (services/vocabBattleLeaderboard.js).
  rated:     { type: Boolean, default: false },
  rev:       { type: Number, default: 0 },
}, { timestamps: true, minimize: false });

VocabBattleSchema.index({ memberIds: 1, status: 1, updatedAt: -1 });
VocabBattleSchema.index({ status: 1, expiresAt: 1 });
VocabBattleSchema.index({ rewardDay: 1, winnerIds: 1 });
VocabBattleSchema.index({ status: 1, endedAt: -1 });             // BXH Đấu trường
// Retention (3 months, like all practice history)
VocabBattleSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('VocabBattle', VocabBattleSchema);
