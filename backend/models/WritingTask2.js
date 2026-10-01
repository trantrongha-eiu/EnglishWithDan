const mongoose = require('mongoose');

const SampleSectionSchema = new mongoose.Schema({
  title:   { type: String, default: '' },
  content: { type: String, default: '' }
}, { _id: false });

const WritingTask2Schema = new mongoose.Schema({
  instructions: {
    type: String,
    default: 'You should spend about 40 minutes on this task. Write at least 250 words.'
  },
  prompt:         { type: String, required: true },
  sampleSections: { type: [SampleSectionSchema], default: [] },
  // "Phân tích đề" guide — essay type, which stance/argument to pick, and
  // how to split Body 1/Body 2, band-6.5-appropriate. Same {title, content}
  // shape as WritingTask1's analysisSections/sampleSections.
  analysisSections: { type: [SampleSectionSchema], default: [] },
  isActive:       { type: Boolean, default: true },
  // Same prompt entered twice (e.g. the "time spent on websites" chart
  // under two wordings). Points at the copy to keep; homework completion
  // (resourceCompletionService equivalence) treats a submission on either
  // copy as done for the other, since a student browsing the Writing list
  // can't tell which copy the teacher assigned.
  duplicateOf:    { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true });

module.exports = mongoose.model('WritingTask2', WritingTask2Schema);
