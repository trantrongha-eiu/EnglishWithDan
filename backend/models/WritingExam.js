const mongoose = require('mongoose');

const WritingExamSchema = new mongoose.Schema({
  name: { type: String, required: true },  // "Academic Writing Test 1"

  task1: {
    imageUrl:     { type: String, default: '' },         // Cloudinary / any image URL
    instructions: { type: String, default: 'You should spend about 20 minutes on this task. Write at least 150 words.' },
    prompt:       { type: String, default: '' }          // description / chart description
  },
  task2: {
    instructions: { type: String, default: 'You should spend about 40 minutes on this task. Write at least 250 words.' },
    prompt:       { type: String, default: '' }          // essay question
  },

  duration: { type: Number, default: 60 },   // minutes
  isActive:  { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('WritingExam', WritingExamSchema);
