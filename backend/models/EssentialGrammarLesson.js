const mongoose = require('mongoose');

// Each lesson's body is an ordered list of typed blocks (Notion/Gutenberg-style)
// instead of raw HTML/Markdown, so the frontend can render, reorder, or reuse
// (flashcards/quiz/AI review) the same content without touching stored data.
const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'overview', 'formula', 'usage', 'signal_words', 'examples', 'image',
      'common_mistakes', 'ielts_tips', 'comparison', 'practice_exercises', 'quiz', 'summary'
    ]
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const essentialGrammarLessonSchema = new mongoose.Schema({
  category:   { type: String, required: true },
  lessonKey:  { type: String, required: true },
  title:      { type: String, required: true },
  icon:       { type: String, default: '📘' },
  summary:    { type: String, default: '' },
  blocks:     [blockSchema],
  orderIndex: { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

essentialGrammarLessonSchema.index({ category: 1, lessonKey: 1 }, { unique: true });
essentialGrammarLessonSchema.index({ isActive: 1, orderIndex: 1 });

module.exports = mongoose.model('EssentialGrammarLesson', essentialGrammarLessonSchema);
