const mongoose = require('mongoose');

const SavedVocabSchema = new mongoose.Schema({
  word:    { type: String, required: true },
  meaning: { type: String, default: '' },
  example: { type: String, default: '' },
  savedAt: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  firstName: { type: String, default: '' },
  lastName:  { type: String, default: '' },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  isBanned: { type: Boolean, default: false },
  savedVocab: [SavedVocabSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);