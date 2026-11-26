const mongoose = require('mongoose');

// ⚔️ Nối chữ — English words checked against an online dictionary
// (Wiktionary / dictionaryapi.dev). Lulu 🤖 only ever plays these, and a
// player's word is accepted when it is here, in ENABLE or taught on the site.
// Filled by scripts/seedChainWords.js (data/vocabBattle/chainWords.json);
// vocabBattleBank falls back to that JSON when the collection is empty.
const ChainWordSchema = new mongoose.Schema({
  w:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  first:      { type: String, required: true, index: true }, // w[0]
  len:        { type: Number, required: true },
  pos:        { type: String, default: '' },                  // noun, verb … (first entry)
  def:        { type: String, default: '' },                  // short English definition
  source:     { type: String, default: 'wiktionary' },
  verifiedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('ChainWord', ChainWordSchema);
