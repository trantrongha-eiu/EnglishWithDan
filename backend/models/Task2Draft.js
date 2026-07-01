const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attemptEntrySchema = new Schema({
  questionId:  String,
  userAnswer:  String,
  isCorrect:   Boolean,
  score:       Number,
  modelAnswer: String,
  feedbackVi:  String,
  questionText:String,
  type:        String
}, { _id: false });

const task2DraftSchema = new Schema({
  userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topicId:        { type: String, required: true },
  topicName:      { type: String },
  week:           { type: Number },
  level:          { type: String, default: 'beginner' },
  mode:           { type: String, default: 'practice' },
  questionIds:    [{ type: String }],
  currentIdx:     { type: Number, default: 0 },
  sessionAttempts:[attemptEntrySchema],
  questionStatus: [{ type: String }],
  sessionDone:    { type: Number, default: 0 },
  sessionCorrect: { type: Number, default: 0 },
  savedAt:        { type: Date, default: Date.now }
});

task2DraftSchema.index({ userId: 1, topicId: 1 }, { unique: true });
task2DraftSchema.index({ savedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model('Task2Draft', task2DraftSchema);
