const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  en:      { type: String, required: true },
  answer:  { type: String, default: '' },
  answers: { type: [String], default: undefined },
  vi:      { type: String, default: '' }
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: [itemSchema]
}, { _id: false });

const task2TemplateSchema = new mongoose.Schema({
  typeId:     { type: String, required: true },
  // 'band7' (default) is the original advanced-vocab set; 'band6' is the
  // simpler/more natural set added for students not aiming for 7+. Same
  // typeId is shared across both bands (one type = one set of 7 essay
  // structures) — level is what used to make typeId alone unique.
  level:      { type: String, enum: ['band6', 'band7'], default: 'band7' },
  label:      { type: String, required: true },
  sub:        { type: String, required: true },
  name:       { type: String, required: true },
  sections:   [sectionSchema],
  orderIndex: { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

// Replaces the old single-field `typeId: { unique: true }` — one type now
// has (up to) two documents, one per level, so uniqueness must be scoped to
// the pair.
task2TemplateSchema.index({ typeId: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('Task2Template', task2TemplateSchema);
