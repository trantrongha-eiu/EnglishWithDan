const mongoose = require('mongoose');

const wpLessonSchema = new mongoose.Schema({
  topicKey:    { type: String, required: true },
  title:       { type: String, required: true },
  titleVi:     { type: String },
  lessonType:  { type: String, enum: ['sentence', 'paragraph', 'essay'], default: 'sentence' },
  grammarFocus: { type: String },
  level:       { type: String, enum: ['beginner', 'elementary', 'intermediate', 'advanced'], required: true },
  difficulty:  { type: Number, default: 1 },
  orderIndex:  { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('WPLesson', wpLessonSchema);
