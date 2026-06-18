const mongoose = require('mongoose');

const SampleSectionSchema = new mongoose.Schema({
  title:   { type: String, default: '' },
  content: { type: String, default: '' }
}, { _id: false });

const WritingTask1Schema = new mongoose.Schema({
  imageUrl:     { type: String, default: '' },
  instructions: {
    type: String,
    default: 'You should spend about 20 minutes on this task. Write at least 150 words.'
  },
  prompt:         { type: String, required: true },
  sampleSections: { type: [SampleSectionSchema], default: [] },
  isActive:       { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('WritingTask1', WritingTask1Schema);
