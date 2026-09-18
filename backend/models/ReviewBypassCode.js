'use strict';

// A code an admin/teacher hands a student to unlock something they can't
// unlock themselves. Two purposes share this one model/admin page
// (/review-bypass) — a teacher only has to remember one place to issue
// codes from — distinguished by `kind`:
//
//  - 'review-bypass' (default, the original purpose): skip the mandatory
//    post-test Review gate (backend/middleware/requireReviewComplete.js,
//    MAX_PENDING_REVIEWS). Redeeming one (POST /api/review/bypass) marks
//    every one of that student's *pending* AttemptReviews as 'bypassed',
//    which drops the pending count to 0 and unblocks new Reading/Listening
//    tests. The reviews stay on record (status 'bypassed', with
//    bypassCode) so a teacher can still see they were skipped. The 4-skill
//    full mock test is NOT affected either way — it opts out of the review
//    gate on its own (requireReviewComplete.js checks the caller has a
//    real in-progress MockTestAttempt on the current skill step).
//
//  - 'wt1-test-unlock': opens ONE specific `isTest` lesson (`targetLessonCode`)
//    in the WT1-stack courses (Task 1/2 Writing, Speaking) for the
//    redeeming student — see wt1Service.assertLessonUnlocked /
//    getUnlockedTestLessonCodes. Unlike review-bypass, redeeming this kind
//    touches no other collection: "has this student redeemed a
//    wt1-test-unlock code for lesson X" is answered by querying this
//    collection directly, so there's nothing to keep in sync elsewhere.
const mongoose = require('mongoose');

const ReviewBypassCodeSchema = new mongoose.Schema({
  code:  { type: String, required: true, unique: true, uppercase: true, trim: true },
  label: { type: String, default: '', trim: true, maxlength: 120 }, // admin note, e.g. "Lớp A2 – tuần 3"

  kind: { type: String, enum: ['review-bypass', 'wt1-test-unlock'], default: 'review-bypass', index: true },
  // 'wt1-test-unlock' only — the WT1Lesson.code (an isTest:true lesson)
  // this code opens. Not used, and left null, for 'review-bypass' codes,
  // which clear a student's whole pending-review backlog regardless of
  // which lesson/attempt it came from.
  targetLessonCode: { type: String, default: null },

  // 0 = unlimited. Otherwise the code stops working once usedCount reaches it.
  maxUses:   { type: Number, default: 1, min: 0 },
  usedCount: { type: Number, default: 0, min: 0 },

  // One redemption per student is always enforced regardless of maxUses.
  redemptions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    at:     { type: Date, default: Date.now },
    cleared:{ type: Number, default: 0 }, // how many pending reviews it cleared (review-bypass only)
  }],

  active:    { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ReviewBypassCodeSchema.index({ active: 1, createdAt: -1 });
// wt1Service.getUnlockedTestLessonCodes's exact query shape.
ReviewBypassCodeSchema.index({ kind: 1, targetLessonCode: 1, 'redemptions.userId': 1 });

// True when the code can still be redeemed by *someone new* right now.
ReviewBypassCodeSchema.methods.isRedeemable = function () {
  if (!this.active) return false;
  if (this.expiresAt && this.expiresAt.getTime() < Date.now()) return false;
  if (this.maxUses > 0 && this.usedCount >= this.maxUses) return false;
  return true;
};

module.exports = mongoose.model('ReviewBypassCode', ReviewBypassCodeSchema);
