const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Resume-able in-progress session for "Viết câu nâng cao". Mirrors
// Task2Draft.js — the most recent drafts per user are kept (see
// advSentenceService.saveDraft). 30-day TTL on savedAt.
const attemptEntrySchema = new Schema({
  sentenceId:  String,
  userAnswer:  String,
  isCorrect:   Boolean,
  score:       Number,
  modelAnswer: String,
  feedbackVi:  String,
  promptVi:    String,
}, { _id: false });

const advSentenceDraftSchema = new Schema({
  userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  groupId:        { type: String, required: true },
  groupName:      { type: String },
  week:           { type: Number },
  mode:           { type: String, enum: ['practice', 'exam'], default: 'practice' },
  sentenceIds:    [{ type: String }],
  currentIdx:     { type: Number, default: 0 },
  sessionAttempts:[attemptEntrySchema],
  sentenceStatus: [{ type: String }],
  sessionDone:    { type: Number, default: 0 },
  sessionCorrect: { type: Number, default: 0 },
  savedAt:        { type: Date, default: Date.now },
});

advSentenceDraftSchema.index({ userId: 1, groupId: 1 }, { unique: true });
// See Task2Draft.js — changing this does NOT retro-update the live index;
// run scripts/bumpDraftTtl.js.
advSentenceDraftSchema.index({ savedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('AdvSentenceDraft', advSentenceDraftSchema);
