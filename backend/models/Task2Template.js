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
  typeId:     { type: String, required: true, unique: true },
  label:      { type: String, required: true },
  sub:        { type: String, required: true },
  name:       { type: String, required: true },
  sections:   [sectionSchema],
  orderIndex: { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Task2Template', task2TemplateSchema);
