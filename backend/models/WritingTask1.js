const mongoose = require('mongoose');

// Colour-coded sentence roles on a model answer section ("Model answers
// from Daniel"): each `text` is an exact sentence of `content`, wrapped in
// a coloured span by frontend/js/shared/task2-highlight.js. Built by
// scripts/seedTask1DanielSamples.js; a text that no longer matches (content
// edited in admin) is simply not highlighted.
const SampleHighlightSchema = new mongoose.Schema({
  role: { type: String, enum: ['paraphrase', 'overview', 'topic', 'detail', 'compare'], required: true },
  text: { type: String, required: true }
}, { _id: false });

const SampleSectionSchema = new mongoose.Schema({
  title:   { type: String, default: '' },
  content: { type: String, default: '' },
  highlights: { type: [SampleHighlightSchema], default: undefined }
}, { _id: false });

const WritingTask1Schema = new mongoose.Schema({
  imageUrl:     { type: String, default: '' },
  instructions: {
    type: String,
    default: 'You should spend about 20 minutes on this task. Write at least 150 words.'
  },
  prompt:         { type: String, required: true },
  sampleSections: { type: [SampleSectionSchema], default: [] },
  // "Phân tích đề" guide — how to pick overview highlights and structure
  // Body 1/Body 2 for THIS specific chart, band-6.5-appropriate. Same
  // {title, content} shape as sampleSections so the frontend can reuse the
  // exact same rendering/copy-button markup for both panels.
  analysisSections: { type: [SampleSectionSchema], default: [] },
  isActive:       { type: Boolean, default: true },
  // Same prompt entered twice (e.g. the "time spent on websites" chart
  // under two wordings). Points at the copy to keep; homework completion
  // (resourceCompletionService equivalence) treats a submission on either
  // copy as done for the other, since a student browsing the Writing list
  // can't tell which copy the teacher assigned.
  duplicateOf:    { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true });

module.exports = mongoose.model('WritingTask1', WritingTask1Schema);
