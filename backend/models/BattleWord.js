const mongoose = require('mongoose');

// ⚔️ Đấu trường từ vựng — words that exist only for the game (the rest of
// the bank is read live from Vocab Topics, Task 2, Paraphrase… — see
// services/vocabBattleBank.js). Edited on admin /vocab-battle → "Kho từ".
//
//   kind 'picture' — "Nhìn hình đoán từ": a picture (Fluent Emoji, MIT) +
//                    the word; source "Từ có hình ảnh"
//                    (scripts/vocabBattlePictures → seedBattleWords.js)
//   kind 'dict'    — Từ điển mở: common words the site doesn't teach,
//                    meaning from Vietnamese Wiktionary picked by
//                    scripts/vocabBattleDict; source "Từ điển mở"
//
// `set` groups words into a word set (wrong options come from the same set
// first); `setTitle` is what the create form shows. `near` = words of the
// set that look alike (never offered as a wrong option for this one).
// `ant` = a clear opposite → extra "Trái nghĩa" questions.
// `origin`: wiktionary (meaning from the dictionary), ai (no dictionary
// gloss said the common meaning — worth a look), fluent (picture list),
// admin (added on the admin page). `edited` = an admin changed it: the seed
// script never overwrites it again.
const BattleWordSchema = new mongoose.Schema({
  kind:     { type: String, enum: ['picture', 'dict'], required: true },
  word:     { type: String, required: true, trim: true, maxlength: 80 },
  meaning:  { type: String, required: true, trim: true, maxlength: 120 },
  pos:      { type: String, default: '', maxlength: 10 },        // n, v, adj, adv…
  set:      { type: String, required: true, trim: true, maxlength: 60 },
  setTitle: { type: String, default: '', trim: true, maxlength: 120 },
  imageUrl: { type: String, default: '' },
  example:  { type: String, default: '', maxlength: 300 },
  near:     { type: [String], default: [] },
  ant:      { type: String, default: '', maxlength: 60 },
  origin:   { type: String, enum: ['wiktionary', 'ai', 'fluent', 'admin'], default: 'admin' },
  hidden:   { type: Boolean, default: false },
  edited:   { type: Boolean, default: false },
}, { timestamps: true });

BattleWordSchema.index({ kind: 1, word: 1 }, { unique: true });
BattleWordSchema.index({ set: 1, word: 1 });

module.exports = mongoose.model('BattleWord', BattleWordSchema);
