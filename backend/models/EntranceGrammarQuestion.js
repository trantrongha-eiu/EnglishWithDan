const mongoose = require('mongoose');

/**
 * EntranceGrammarQuestion — the Grammar-section question bank for the IELTS
 * Entrance Test. Unlike Reading/Listening/Writing, there is no existing
 * IELTS "Grammar test" content unit in this codebase to point an
 * EntranceTestConfig ID at (see that model's header comment), so Grammar is
 * its own small bank: `isActive` questions sharing a `setKey`, ordered by
 * `order`, are "the" current 25-question fixed set. An admin changes the
 * live set either by editing questions in place or by authoring a new
 * `setKey` and repointing EntranceTestConfig.grammarSetKey at it (keeps the
 * old set around, undisturbed, for anything that already snapshotted it).
 *
 * Answer-checking mirrors the house convention for deterministic grading
 * with accepted-answer arrays + tolerant string matching — see
 * backend/services/wt1GradingService.js (mcq/gap_fill/sentence_transform)
 * and backend/services/advSentenceService.js (VN→EN) — reused directly in
 * entranceTestService.gradeGrammarItem rather than re-invented here.
 */
const OptionSchema = new mongoose.Schema({
  id:   { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false });

const EntranceGrammarQuestionSchema = new mongoose.Schema({
  setKey: { type: String, default: 'default', index: true },
  order:  { type: Number, default: 0 },

  // e.g. "Present Perfect", "Conditionals - Second", "Passive Voice" — used
  // for the post-result "Grammar weaknesses by topic" breakdown
  // (spec §26). Free text rather than an enum: the exact topic list is
  // content, not logic, and easiest to keep that way for future edits.
  topic: { type: String, required: true },

  type: {
    type: String,
    enum: ['mcq', 'gap_fill', 'sentence_transform', 'vn_to_en'],
    required: true,
  },

  // mcq: the question stem. gap_fill: sentence with a blank marker (e.g.
  // "___"). sentence_transform: the sentence to rewrite (optionally with a
  // `starter` hint — kept inside `prompt` as plain text rather than a
  // separate field, this content doesn't need the WT1 exercise system's
  // fuller item shape). vn_to_en: the Vietnamese sentence to translate.
  prompt: { type: String, required: true },

  // mcq only.
  options: { type: [OptionSchema], default: undefined },
  answer:  { type: String }, // mcq: the correct option's `id`

  // gap_fill / sentence_transform / vn_to_en: every accepted phrasing.
  // Required to have at least one entry for those types (validated in the
  // admin service layer, not here, so partial drafts can still be saved).
  accept: { type: [String], default: [] },

  explanation: { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

EntranceGrammarQuestionSchema.index({ setKey: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('EntranceGrammarQuestion', EntranceGrammarQuestionSchema);
