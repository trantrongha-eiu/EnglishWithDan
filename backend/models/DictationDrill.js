/**
 * backend/models/DictationDrill.js
 * "Đánh vần tên & số dài" lessons on dictation.html: ~10 short clips of the
 * site's OWN Listening audio (standalone sections + full tests) where a
 * speaker spells a name or says a phone number / postcode / price / big
 * number. Each item is its own short mp3 (only the name + spelling / the
 * number + any read-back; start = 0, end = its length), so one lesson mixes
 * clips from many recordings; the student types only `answer` (what an IELTS
 * answer sheet wants), `text` is what the clip says, shown afterwards.
 *
 * Built by scripts/dictationDrills/buildDictationDrills.js + cutClips.py (finds,
 * cuts and verifies each clip), seeded by scripts/seedDictationDrills.js
 * (upsert key: slug).
 */
const mongoose = require('mongoose');

const DrillItemSchema = new mongoose.Schema({
  kind:        { type: String, default: '' }, // spell | phone | code | postcode | address | price | number
  answer:      { type: String, required: true },
  text:        { type: String, required: true },
  audioUrl:    { type: String, required: true },
  start:       { type: Number, required: true },
  end:         { type: Number, required: true },
  sourceType:  { type: String, enum: ['section', 'test'], default: 'section' },
  sourceId:    { type: String, default: '' },
  sourceTitle: { type: String, default: '' },
  partNumber:  { type: Number, default: 1 },
}, { _id: false });

const DictationDrillSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true, trim: true },
  title:       { type: String, required: true },
  category:    { type: String, enum: ['spelling', 'numbers'], required: true },
  order:       { type: Number, default: 0 },
  items:       { type: [DrillItemSchema], default: [] },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('DictationDrill', DictationDrillSchema);
