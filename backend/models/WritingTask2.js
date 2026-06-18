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
  isActive:       { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('WritingTask2', WritingTask2Schema);
