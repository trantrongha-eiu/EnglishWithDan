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
  // BUG-023 — JWT session revocation. Compared against a token's `iat`
  // claim in middleware/auth.js: any token issued strictly before this
  // timestamp is rejected even though it's still cryptographically valid
  // and unexpired. null (the default) means "nothing has ever revoked
  // this user's tokens" — every existing token stays valid, so this is
  // fully backward-compatible with every session issued before this field
  // existed. Set on logout, password change, and password reset — all
  // sessions/devices at once (no per-device session tracking exists in
  // this app), matching how a password change already invalidates
  // sessions everywhere in most real-world apps.
  tokenValidAfter: { type: Date, default: null },
  // Social auth
  googleId:       { type: String, default: '' },
  facebookId:     { type: String, default: '' },
  authProvider:   { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
  // Profile customization
  studyMotto:   { type: String, default: '', maxlength: 80 },
  targetBand:   { type: Number, default: null, min: 4, max: 9 },
  // Study planner (lightweight — see docs/PRODUCT_FEATURE_AUDIT.md): a
  // self-set exam date, purely informational. No scheduling/reminders are
  // derived from it beyond the client-side "days remaining" banner.
  targetExamDate: { type: Date, default: null },
  // ── IELTS Goal + Study Plan (Priority 2B) ──────────────────────────────
  // Reuses targetBand/targetExamDate above rather than duplicating them —
  // goalService.js is the single place that reads/writes all of these.
  // currentBand is deliberately separate from targetBand's schema bound
  // (4-9): the Goal feature enforces a stricter 4.0-7.5 product-scope cap
  // at the application layer (goalService), not here, so this field's DB-
  // level bound stays the same permissive range targetBand already uses.
  currentBand: { type: Number, default: null, min: 4, max: 9 },
  // Distinguishes a student's own self-report from a number the system
  // could derive from practice history — never silently treated the same
  // way. Null until currentBand is ever set. See goalService.getGoal() /
  // getEstimatedPerformance() for how "self_assessed" vs "estimated" stay
  // visibly separate signals, never merged into one silently-authoritative
  // number.
  currentBandSource: { type: String, enum: ['self_assessed', 'estimated', null], default: null },
  weeklyStudyMinutes: { type: Number, default: null, min: 1 },
  // 3-letter weekday codes the student can realistically study on.
  studyDays: { type: [{ type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] }], default: [] },
  preferredSessionMinutes: { type: Number, default: null, min: 5, max: 240 },
  // Free-text class label ("6", "6.5", ...) assigned by admin/teacher —
  // scopes which Vocabulary Lessons a student sees (see
  // vocabularyLessonService.listPublicLessons). Empty = unassigned; an
  // unassigned student still sees every lesson (both class-scoped and
  // unscoped) so nobody is locked out before admin gets around to
  // assigning classes to existing students.
  className:    { type: String, default: '', trim: true, maxlength: 40 },
  // Cumulative count of admin "study reminder" pokes (missing vocab
  // practice / incomplete homework) — see routes/admin/users.js's
  // POST /:id/remind. Once this reaches 3, nav.js shows a persistent
  // warning banner on every page the student visits until an admin resets
  // it back to 0 (POST /:id/reset-reminders).
  studyReminderCount: { type: Number, default: 0 },
  // Same pattern as studyReminderCount above, but for tuition-payment nudges
  // — bumped by tuitionService.sendReminder/sendBulkReminders and
  // cron/tuitionReminder.js's daily auto-remind (previously none of the 3
  // tracked anything, unlike the study-reminder mechanism they were meant to
  // mirror per docs/ADMIN_PANEL_AUDIT.md #1). Auto-resets to 0 the moment the
  // student has no unpaid fees left (tuitionService.updateFee/deleteFee) —
  // unlike study reminders, "caught up" here has an unambiguous signal, so
  // no manual admin reset endpoint is needed.
  tuitionReminderCount: { type: Number, default: 0 },
  // Stats & gamification
  learningStreak:       { type: Number, default: 0 },
  // Highest learningStreak ever reached — learningStreak itself resets to 0
  // on a gap, which would make a "streak" badge (see constants/badges.js)
  // flicker unearned again after any missed day. Kept in sync by the
  // pre('save') hook below instead of at every learningStreak mutation site
  // (updateStreak/useHammerToRestore/applyGiftStreak) so it can't drift out
  // of sync if a future call site is added and forgets to touch it.
  maxLearningStreak:    { type: Number, default: 0 },
  // IDs (constants/badges.js) of achievement badges this student has
  // already been notified about — the "already known" set
  // badgeService.checkAndAwardNewBadges() diffs the live-computed earned
  // set against, so a badge only ever pops up as "newly unlocked" once.
  // Badges themselves stay computed live (see badgeService.js's own
  // comment) — this is just a notification-dedup record, not a second
  // source of truth for whether a badge is earned.
  earnedBadgeIds:       [{ type: String }],
  // Snapshot of learningStreak right before it got reset to 0 by resetIfStale()
  // — powers the "you just lost a streak" mascot state on the dashboard.
  // Cleared back to 0 as soon as the student studies again (updateStreak()).
  previousStreak:       { type: Number, default: 0 },
  lastActivityDate:     { type: Date, default: null },
  // Timestamp of the most recent real vocab-practice batch (see
  // vocabBookService.completePractice) — unlike lastActivityDate above,
  // this is vocab-only (not also bumped by Reading/Listening tests), so
  // nav.js can nudge a student who's fallen behind specifically on vocab
  // even if their overall streak looks fine.
  lastVocabStudyDate:   { type: Date, default: null },
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
  // Subscription plan. Free-plan gating is a single rule now, computed live
  // from `createdAt` (see backend/utils/plan.js's hasFullAccess): full
  // access to everything for the first 24h, then a hard lock everywhere —
  // no more per-feature quotas (the old writingExam/writingPractice daily
  // counters this replaced are gone; --force re-deriving from createdAt
  // needs no migration since every doc already has one via {timestamps:true}).
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
// activity — defaults to 1 (flat, e.g. adding a word). Same-day repeat calls
// are a no-op by default (unchanged from before), UNLESS `allowSameDayStack`
// is set — vocab practice, reading tests, and listening tests all pass an
// accuracy-derived amount (0/1/2, see services/streakBonusService.js) WITH
// allowSameDayStack:true, so several sessions in one day can each add their
// own bonus, up to the shared +5/day cap the caller (reserveDailyStreakBonus)
// already enforced before calling this. `lastActivityDate` always advances on
// a qualifying activity call even when bonus is 0, so a low-accuracy session
// still keeps the day-chain alive without growing it.
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

// Admin compensation gift ("lửa") sent via inbox message — not tied to the
// hammer's 3-day restore window. If the streak is currently in the "just
// lost it" state (previousStreak snapshot present, learningStreak at 0),
// the gift restores that snapshot plus the bonus; otherwise it just adds
// on top of whatever streak the student already has. Re-anchors
// lastActivityDate to today for the same reason useHammerToRestore() does —
// otherwise resetIfStale() would immediately wipe the gifted days again.
UserSchema.methods.applyGiftStreak = function (days) {
  if (!days || days <= 0) return;
  if (this.previousStreak > 0 && this.learningStreak === 0) {
    this.learningStreak = this.previousStreak + days;
    this.previousStreak = 0;
    this.streakLostAt = null;
  } else {
    this.learningStreak += days;
  }
  this.lastActivityDate = getVNDay(new Date());
};

// Mongoose 9 no longer passes a next() callback to pre-save hooks —
// synchronous middleware just returns (or throws) directly.
UserSchema.pre('save', function () {
  if (this.isModified('learningStreak') && this.learningStreak > this.maxLearningStreak) {
    this.maxLearningStreak = this.learningStreak;
  }
});

UserSchema.plugin(require('../utils/guardAgainstMassDelete'));

module.exports = mongoose.model('User', UserSchema);
