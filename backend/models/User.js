const mongoose = require('mongoose');

const SavedVocabSchema = new mongoose.Schema({
  word:    { type: String, required: true },
  meaning: { type: String, default: '' },
  example: { type: String, default: '' },
  savedAt: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, default: '' }, // empty for social-only accounts
  firstName:  { type: String, default: '' },
  lastName:   { type: String, default: '' },
  bio:        { type: String, default: '' },
  avatar:     { type: String, default: '' }, // URL ảnh đại diện
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  isBanned:       { type: Boolean, default: false },
  banReason:      { type: String, default: '' },
  // Social auth
  googleId:       { type: String, default: '' },
  facebookId:     { type: String, default: '' },
  authProvider:   { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
  // Stats & gamification
  learningStreak:       { type: Number, default: 0 },
  lastActivityDate:     { type: Date, default: null },
  totalStudyMinutes:    { type: Number, default: 0 },
  // Password reset OTP
  resetOTP:           { type: String, default: '' },
  resetOTPExpires:    { type: Date, default: null },
  savedVocab: [SavedVocabSchema]
}, { timestamps: true });

// Cập nhật streak khi user hoạt động
UserSchema.methods.updateStreak = function () {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!this.lastActivityDate) {
    this.learningStreak = 1;
    this.lastActivityDate = today;
    return;
  }
  const last = new Date(this.lastActivityDate);
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const diff = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));
  if (diff === 0) return; // same day
  if (diff === 1) {
    this.learningStreak += 1;
  } else {
    this.learningStreak = 1; // reset streak
  }
  this.lastActivityDate = today;
};

module.exports = mongoose.model('User', UserSchema);
