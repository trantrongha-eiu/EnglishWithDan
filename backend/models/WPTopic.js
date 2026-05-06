const mongoose = require('mongoose');

const wpTopicSchema = new mongoose.Schema({
  key:         { type: String, required: true, unique: true },
  title:       { type: String, required: true },
  titleVi:     { type: String },
  description: { type: String },
  category:    { type: String, default: 'general' },
  levels:      [{ type: String, enum: ['beginner', 'elementary', 'intermediate', 'advanced'] }],
  orderIndex:  { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('WPTopic', wpTopicSchema);
