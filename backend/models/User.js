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
  // select:false — schema-level defense-in-depth so a future query that
  // forgets manual `.select('-password')` doesn't leak the bcrypt hash;
  // the 2 call sites that legitimately need it (login, change-password)
  // explicitly opt back in via `.select('+password')`.
  password:   { type: String, default: '', select: false }, // empty for social-only accounts
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
  // Profile customization
  studyMotto:   { type: String, default: '', maxlength: 80 },
  targetBand:   { type: Number, default: null, min: 4, max: 9 },
  // Stats & gamification
  learningStreak:       { type: Number, default: 0 },
  // Snapshot of learningStreak right before it got reset to 0 by resetIfStale()
  // — powers the "you just lost a streak" mascot state on the dashboard.
  // Cleared back to 0 as soon as the student studies again (updateStreak()).
  previousStreak:       { type: Number, default: 0 },
  lastActivityDate:     { type: Date, default: null },
  totalStudyMinutes:    { type: Number, default: 0 },
  // Password reset OTP
  resetOTP:           { type: String, default: '' },
  resetOTPExpires:    { type: Date, default: null },
  resetOTPAttempts:   { type: Number, default: 0 },
  lastSeen:           { type: Date, default: null },
  // Subscription plan
  plan:           { type: String, enum: ['free', 'premium'], default: 'free' },
  planExpiresAt:  { type: Date, default: null },
  planStartedAt:  { type: Date, default: null },
  savedVocab: [SavedVocabSchema]
}, { timestamps: true });

// Admin "new this week"/role-filtered stats query by role sorted by createdAt;
// online-users queries filter by lastSeen — both previously unindexed, forcing
// a full collection scan on the User model.
UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ lastSeen: 1 });

// Trả về ngày theo giờ Việt Nam (UTC+7), lưu dưới dạng UTC midnight
function getVNDay(date) {
  const d = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Cập nhật streak khi user hoạt động
UserSchema.methods.updateStreak = function () {
  // Studying again ends the "just lost a streak" mascot state immediately,
  // whether this continues a streak, restarts one, or is a same-day no-op.
  this.previousStreak = 0;
  const today = getVNDay(new Date());
  if (!this.lastActivityDate) {
    this.learningStreak = 1;
    this.lastActivityDate = today;
    return;
  }
  const lastDay = getVNDay(new Date(this.lastActivityDate));
  const diff = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));
  if (diff === 0) return; // same day
  if (diff === 1) {
    this.learningStreak += 1;
  } else {
    this.learningStreak = 1; // reset streak
  }
  this.lastActivityDate = today;
};

// Kiểm tra và reset streak nếu đã bỏ lỡ >= 2 ngày (dùng khi load trang)
// diff=1 = hôm qua có học, hôm nay chưa → giữ nguyên streak (vẫn còn cơ hội học hôm nay)
// diff>=2 = bỏ lỡ ít nhất 1 ngày hoàn toàn → mất streak, về 0, phải học lại hôm nay mới thành 1
UserSchema.methods.resetIfStale = function () {
  if (!this.lastActivityDate) return false;
  const today = getVNDay(new Date());
  const lastDay = getVNDay(new Date(this.lastActivityDate));
  const diff = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));
  if (diff >= 2) {
    if (this.learningStreak === 0) return false; // already reset, skip redundant save
    this.previousStreak = this.learningStreak;
    this.learningStreak = 0;
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', UserSchema);
