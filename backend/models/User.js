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
  // VN-day timestamp of the most recent streak-to-0 reset (whichever of
  // resetIfStale()/updateStreak() detected it first) — powers the 3-day
  // "búa Daniel" (streak-restore hammer) eligibility window.
  streakLostAt:         { type: Date, default: null },
  // Búa Daniel inventory — earned by clearing a Paraphrase Unit at >=90%
  // accuracy (see vocabBookService.completePractice), spent via
  // useHammerToRestore() to undo a streak loss within 3 days.
  streakHammers:        { type: Number, default: 0 },
  // Paraphrase VocabUnits already rewarded with a hammer — each unit only
  // ever grants one, no matter how many times it's re-cleared at >=90%.
  hammerAwardedUnits:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'VocabUnit' }],
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

// Cập nhật streak khi user hoạt động. `bonus` is how much to add for today's
// activity — defaults to 1 (flat, e.g. adding a word, reading/listening
// attempts). Same-day repeat calls are a no-op by default (unchanged from
// before), UNLESS `allowSameDayStack` is set — vocab practice sessions pass
// an accuracy-derived amount (0/1/2) WITH allowSameDayStack:true, so several
// sessions in one day can each add their own bonus, up to whatever daily cap
// the caller (vocabBookService.completePractice) already enforced before
// calling this. `lastActivityDate` always advances on a qualifying activity
// call even when bonus is 0, so a low-accuracy session still keeps the
// day-chain alive without growing it.
UserSchema.methods.updateStreak = function (bonus = 1, { allowSameDayStack = false } = {}) {
  // Studying again ends the "just lost a streak" mascot state immediately,
  // whether this continues a streak, restarts one, or is a same-day no-op.
  this.previousStreak = 0;
  const today = getVNDay(new Date());
  if (!this.lastActivityDate) {
    this.learningStreak = bonus;
    this.lastActivityDate = today;
    return;
  }
  const lastDay = getVNDay(new Date(this.lastActivityDate));
  const diff = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));
  if (diff === 0) {
    if (allowSameDayStack && bonus > 0) this.learningStreak += bonus;
    return; // same day — lastActivityDate already today, nothing else to do
  }
  if (diff === 1) {
    this.learningStreak += bonus;
  } else {
    // A real gap (>=2 days) — the previous streak just died. Snapshot it
    // (mirrors resetIfStale()) before restarting the chain with today's bonus.
    if (this.learningStreak > 0) {
      this.previousStreak = this.learningStreak;
      this.streakLostAt = today;
    }
    this.learningStreak = bonus;
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
    this.streakLostAt = today;
    this.learningStreak = 0;
    return true;
  }
  return false;
};

// Búa Daniel: khôi phục streak vừa mất, chỉ trong vòng 3 ngày kể từ lúc mất.
UserSchema.methods.canUseHammer = function () {
  if (this.streakHammers <= 0) return false;
  if (this.learningStreak !== 0 || this.previousStreak <= 0) return false;
  if (!this.streakLostAt) return false;
  const today = getVNDay(new Date());
  const lostDay = getVNDay(new Date(this.streakLostAt));
  const diff = Math.floor((today - lostDay) / (1000 * 60 * 60 * 24));
  return diff <= 3;
};

UserSchema.methods.useHammerToRestore = function () {
  if (!this.canUseHammer()) return false;
  this.learningStreak = this.previousStreak;
  this.previousStreak = 0;
  this.streakLostAt = null;
  this.streakHammers -= 1;
  // Re-anchor the day-chain to today — otherwise the next resetIfStale()/
  // getStats() call would still see the old stale lastActivityDate, decide
  // the (just-restored) streak is stale all over again, and immediately
  // re-zero it.
  this.lastActivityDate = getVNDay(new Date());
  return true;
};

module.exports = mongoose.model('User', UserSchema);
