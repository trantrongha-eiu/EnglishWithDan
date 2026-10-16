const mongoose = require('mongoose');

// Global cache of AI phrase lookups for the "Tra từ vựng" panel on the
// Writing screens (Việt→Anh / Anh→Việt), one document PER (direction,
// normalized query) across the whole system — a query is only ever sent to
// the AI once; every later lookup by any student is a plain indexed DB read.
// Same generate-once-cache-forever pattern as DictionaryCollocation /
// DictionaryExample. See services/dictionaryPhraseService.js.
//
// `phrase` is '' when the AI judged the query meaningless (typo / gibberish)
// — that negative result is cached too, so it isn't re-sent every time.
const PhraseExampleSchema = new mongoose.Schema({
  en:        { type: String, required: true },  // full English sentence
  highlight: { type: String, default: '' },     // exact substring of `en` to bold
  vi:        { type: String, default: '' },     // short Vietnamese gloss of `highlight`
}, { _id: false });

const DictionaryPhraseSchema = new mongoose.Schema({
  key:          { type: String, required: true, unique: true }, // `${dir}:${query}`
  dir:          { type: String, required: true, enum: ['vi-en', 'en-vi'] },
  query:        { type: String, required: true },
  phrase:       { type: String, default: '' },  // English phrase (both directions)
  meaning:      { type: String, default: '' },  // Vietnamese meaning
  alternatives: { type: [String], default: [] }, // English equivalents
  examples:     { type: [PhraseExampleSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('DictionaryPhrase', DictionaryPhraseSchema);
