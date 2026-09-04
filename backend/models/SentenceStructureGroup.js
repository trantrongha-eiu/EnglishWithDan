const mongoose = require('mongoose');

// "Viết câu nâng cao" — 12 band-raising grammar structures, 2 per "week"
// (6 weeks), each holding a short bank of Vietnamese→English translation
// sentences. This is a fourth "sentence exercise" system alongside
// Task2Topic.questions / Task1Exercise / WPExercise, but deliberately
// simpler: every sentence here is the same format (translate the Vietnamese
// prompt, one target grammar structure), so there is no per-sentence `type`.
// See docs/EXERCISE_SYSTEMS.md for the placement rule.
const advSentenceSchema = new mongoose.Schema({
  order:         { type: Number, default: 0 },        // position within the group
  promptVi:      { type: String, required: true },     // the Vietnamese sentence to translate
  answerEn:      { type: String, default: '' },        // one Band-7+ model translation (not the only right answer)
  altAnswers:    [{ type: String }],                   // extra accepted phrasings, checked before the fuzzy match
  hintWords:     [{ type: String }],                   // "Hint:" vocab / fixed phrases (revealed ≤3 at a time)
  structureNote: { type: String, default: '' },        // optional sub-label, e.g. "A. Present Simple" for group 12
}, { _id: true });

const sentenceStructureGroupSchema = new mongoose.Schema({
  // Stable slug used as the seed's upsert key ('complex-sentences', ...).
  code:            { type: String, required: true, unique: true },
  order:           { type: Number, required: true, min: 1, max: 12 },
  week:            { type: Number, required: true, min: 1, max: 6 },
  slotInWeek:      { type: Number, required: true, min: 1, max: 2 },
  nameVi:          { type: String, required: true },   // "Câu phức"
  nameEn:          { type: String, required: true },   // "Complex Sentences"
  emoji:           { type: String, default: '✍️' },
  // The "Cấu trúc cần dùng" line from the worksheet — shown as a reminder
  // on the practice screen (hidden in the "Không gợi ý" mode).
  targetStructure: { type: String, default: '' },
  sentences:       [advSentenceSchema],
  isActive:        { type: Boolean, default: true },
}, { timestamps: true });

// Matches listGroupsForWeek()/listWeeks()/getExam()'s query+sort shape.
sentenceStructureGroupSchema.index({ isActive: 1, week: 1, order: 1 });

module.exports = mongoose.model('SentenceStructureGroup', sentenceStructureGroupSchema);
