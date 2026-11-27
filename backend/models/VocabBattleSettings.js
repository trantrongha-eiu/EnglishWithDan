const mongoose = require('mongoose');

// ⚔️ Đấu trường từ vựng — admin /vocab-battle → "Cài đặt" (singleton).
// Every field is optional: unset = the default in constants/vocabBattle.js.
// services/vocabBattleSettings.js validates and applies it on top of those
// constants.
const VocabBattleSettingsSchema = new mongoose.Schema({
  _singleton: { type: String, default: 'main', unique: true },
  enabled:          { type: Boolean },
  disabledTypes:    { type: [String], default: undefined },
  disabledSources:  { type: [String], default: undefined },
  limits:           { type: mongoose.Schema.Types.Mixed },       // { synonym: 15, … } seconds per question
  minStake:         { type: Number },
  maxStake:         { type: Number },
  maxOpen:          { type: Number },
  inviteHours:      { type: Number },
  friendlyWinFlames: { type: Number },
  friendlyDailyWins: { type: Number },
  speedBonus:       { type: Number },
  chainBankBonus:   { type: Number },
  chainSurvivorBonus: { type: Number },
  botFailBase:      { type: Number },                            // Lulu 🤖 miss chance, %
  botFailPerWord:   { type: Number },                            // + % per word played
  blockedWords:     { type: [String], default: undefined },      // Nối chữ
}, { timestamps: true, minimize: false });

VocabBattleSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ _singleton: 'main' });
  if (!doc) {
    try { doc = await this.create({ _singleton: 'main' }); }
    catch (err) {
      if (err && err.code === 11000) doc = await this.findOne({ _singleton: 'main' });
      else throw err;
    }
  }
  return doc;
};

module.exports = mongoose.model('VocabBattleSettings', VocabBattleSettingsSchema);
