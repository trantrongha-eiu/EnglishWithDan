'use strict';

const mongoose = require('mongoose');

// Per-essay-type reference material shown on the Task 2 Templates page
// (recognising the question, outline, 6+→7+ upgrade table, useful language,
// a full Band 7+ model essay, common mistakes). One doc per essay type;
// `typeId` matches Task2Template.typeId (type01..type07). Seeded from
// scripts/data/task2/typeGuides.js via scripts/seedTask2TypeGuides.js.
const usefulSchema = new mongoose.Schema({
  label: { type: String, required: true },
  lines: { type: [String], default: [] },
}, { _id: false });

const essaySectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false });

const task2TypeGuideSchema = new mongoose.Schema({
  typeId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  nameVi: { type: String, default: '' },
  orderIndex: { type: Number, default: 0 },

  recognise: {
    stems: { type: [String], default: [] },
    note: { type: String, default: '' },
  },
  outline: {
    flow: { type: String, default: '' },
    perBody: { type: String, default: '' },
  },
  // each pair is [band6 sentence, band7 sentence]
  upgradePairs: { type: [[String]], default: [] },
  usefulLanguage: { type: [usefulSchema], default: [] },
  modelEssay: {
    prompt: { type: String, default: '' },
    wordCount: { type: String, default: '' },
    sections: { type: [essaySectionSchema], default: [] },
  },
  mistakes: { type: [String], default: [] },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Task2TypeGuide', task2TypeGuideSchema);
