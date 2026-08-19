const mongoose = require('mongoose');

// Global cache of AI-generated collocations, one document PER WORD across the
// whole system (not per-user, not per-lesson) — a word is only ever sent to
// Gemini once, ever; every later lookup of the same word by any student is a
// plain DB read. See services/dictionaryCollocationService.js.
const CollocationEntrySchema = new mongoose.Schema({
  phrase:  { type: String, required: true },   // full collocation, e.g. "derive benefits from"
  meaning: { type: String, required: true },   // Vietnamese translation of the collocation
  example: { type: String, default: '' },
}, { _id: false });

const DictionaryCollocationSchema = new mongoose.Schema({
  word: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true,
  },
  collocations: { type: [CollocationEntrySchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('DictionaryCollocation', DictionaryCollocationSchema);
