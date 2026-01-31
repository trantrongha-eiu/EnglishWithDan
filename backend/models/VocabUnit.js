const mongoose = require("mongoose");

const WordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  example: { type: String },
  audioUrl: { type: String },        // cho listening
  level: { type: String },           // A2, B1, B2
  difficulty: { type: Number, default: 1 } // cho spaced repetition
});

const VocabUnitSchema = new mongoose.Schema({
  unitNumber: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  words: [WordSchema]
}, { timestamps: true });

module.exports = mongoose.model("VocabUnit", VocabUnitSchema);
