const mongoose = require('mongoose');

// Per-student spaced-repetition state for ONE paraphrase item inside a
// Paraphrase VocabUnit.
//
// Unlike notebook words — whose SRS fields (srsBox/nextReviewAt/…) live on
// the embedded VocabBook.words[] subdocument — paraphrase items are embedded
// in VocabUnit.words[] with `_id: false` and are shared by every student, so
// they carry no per-user state of their own. This standalone per-(user,item)
// document is where a student's paraphrase memory schedule lives.
//
// itemKey is a stable sha1 of the item's normalised passage text + question
// paraphrase (see paraphraseSrsService.paraItemKey), so an admin editing the
// item's meaning/explanation — or fixing whitespace/casing — does NOT orphan
// a student's progress. Editing the passage text or the paraphrase itself
// does start a fresh card, which is the correct behaviour (it's a different
// pair to memorise).
const paraphraseProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'VocabUnit', required: true },
  itemKey: { type: String, required: true },

  // Snapshot of the item's text, refreshed on every review submit. Lets the
  // due-review queue render without re-joining VocabUnit; an admin edit to
  // meaning/explanation propagates the next time the student reviews it
  // (same "review renders from a snapshot" model the Reading/Listening
  // reviews already use).
  word: { type: String, default: '' },
  paraphrase: { type: String, default: '' },
  meaning: { type: String, default: '' },
  explanation: { type: String, default: '' },

  srsBox: { type: Number, default: 0 },
  nextReviewAt: { type: Date, default: null },
  lastReviewedAt: { type: Date, default: null },
  timesSeen: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
}, { timestamps: true });

// One progress row per (student, unit, item).
paraphraseProgressSchema.index({ userId: 1, unitId: 1, itemKey: 1 }, { unique: true });
// Drives the "due for review today" queue + count (nav.js daily nudge).
paraphraseProgressSchema.index({ userId: 1, nextReviewAt: 1 });

module.exports = mongoose.model('ParaphraseProgress', paraphraseProgressSchema);
