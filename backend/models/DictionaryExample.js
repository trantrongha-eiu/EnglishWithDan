const mongoose = require('mongoose');

// Global cache of AI-generated example sentences, one document PER WORD
// across the whole system (not per-user) — a word is only ever sent to the
// AI once, ever; every later lookup by any student is a plain indexed DB
// read. Same generate-once-cache-forever pattern as DictionaryCollocation /
// SpeakingQuestion.sampleAnswer. See services/dictionaryExampleService.js.
//
// `example` is '' when the AI judged "${word}" not to be a real English
// word (or genuinely un-exemplifiable) — that negative result is cached too,
// so a typo isn't re-sent on every bulk import.
const DictionaryExampleSchema = new mongoose.Schema({
  word: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true,
  },
  example: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('DictionaryExample', DictionaryExampleSchema);
