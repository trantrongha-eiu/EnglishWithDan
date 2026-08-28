'use strict';

// Mandatory post-test Review System — one document per (Reading/Listening
// full-mock-or-practice) attempt that had at least one wrong/skipped
// question. Covers all 4 attempt types (TestAttempt, ReadingPracticeAttempt,
// ListeningAttempt, ListeningPracticeAttempt) via `attemptType` + a plain
// `attemptId` rather than 4 near-duplicate collections — the per-mistake
// shape is identical across skills, only the error taxonomy (see
// constants/errorTaxonomy.js) differs, and that lives outside the schema.
//
// A perfect-score attempt gets NO document at all (see
// reviewService.createReviewIfNeeded) — "nothing to review" is represented
// by absence, not an extra completed-with-zero-mistakes row.
const mongoose = require('mongoose');

const MistakeSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  // Snapshot of the question's `type` at submit time (same raw string
  // backend/services/weaknessService.js already keys on for its per-
  // question-type accuracy breakdown) — frozen here so this collection
  // stays useful even if admin later edits/deletes the source question.
  questionType:  { type: String, default: '' },
  userAnswer:    { type: String, default: '' },
  correctAnswer: { type: String, default: '' },

  // Student-selected (never AI-guessed) — see constants/errorTaxonomy.js.
  // errorCode is resolved server-side from category+reason, never accepted
  // directly from the client.
  errorCategory: { type: String, default: null },
  errorReason:   { type: String, default: null },
  errorCode:     { type: String, default: null },

  // 'left-blank' is not really a confidence LEVEL — it's what the review
  // form records instead when userAnswer was empty (the student never
  // attempted this question), where "how confident were you" has no
  // sensible answer. See review-inline.js's _renderForm().
  confidence: { type: String, enum: ['very-confident', 'not-sure', 'guessing', 'left-blank'], default: null },

  // Free-text fields get the same maxlength convention as other user-note
  // fields elsewhere in this codebase (User.studyMotto/className) — audit
  // finding: these had no length cap at all, so an oversized payload only
  // ever surfaced as a generic 500 from an uncaught ValidationError.
  // reviewService.updateMistake() also checks these explicitly before
  // save() so the client gets a clean 400 with the actual field name.
  evidence:           { type: String, default: '', maxlength: 1000, trim: true }, // short free-text note, not highlighting
  temptingAnswerNote: { type: String, default: '', maxlength: 1000, trim: true }, // "why was my answer tempting?"
  note:               { type: String, default: '', maxlength: 1000, trim: true }, // personal reflection

  learningPoint: {
    category: { type: String, enum: ['vocabulary', 'strategy', 'grammar', 'ielts-trap'], default: null },
    content:  { type: String, default: '', maxlength: 500, trim: true },
  },

  // Set once this mistake's required fields (category/reason, confidence,
  // learningPoint.category) are all present — see reviewService.js's
  // coreFieldsFilled() for the exact check.
  completedAt: { type: Date, default: null },
}, { _id: true });

const AttemptReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Which collection `attemptId` points into — NOT a typed `ref` since it
  // varies by value (TestAttempt / ReadingPracticeAttempt / ListeningAttempt
  // / ListeningPracticeAttempt).
  attemptType: {
    type: String,
    enum: ['reading', 'reading-practice', 'listening', 'listening-practice'],
    required: true,
  },
  attemptId: { type: mongoose.Schema.Types.ObjectId, required: true },

  // 'bypassed' = the student redeemed an admin ReviewBypassCode instead of
  // doing the guided review (see reviewService.redeemBypassCode). Excluded
  // from getPendingReviews' count like 'completed', but never counts as a
  // real review in history.
  status: { type: String, enum: ['pending', 'completed', 'bypassed'], default: 'pending' },
  mistakes: [MistakeSchema],

  // Set alongside status:'bypassed' — which code cleared this one.
  bypassCode:   { type: String, default: null },
  bypassedAt:   { type: Date, default: null },

  startedAt:   { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

AttemptReviewSchema.index({ userId: 1, status: 1, attemptType: 1 });
// BUG-029: reviewService.getReviewHistory() (backs review-history.html)
// filters on {userId, status} — often without attemptType, since that's an
// optional query param — and always sorts by completedAt with skip/limit
// pagination. The index above doesn't cover that sort (attemptType is its
// 3rd field, not completedAt), so later pages forced an in-memory sort
// after only a partial index match. Kept as a separate index rather than
// changing the one above — both shapes are real and independently hit
// (the one above also backs getPendingReviews' {userId,status,attemptType:
// {$in:...}} check, which runs on nearly every page load for the review
// gate itself).
AttemptReviewSchema.index({ userId: 1, status: 1, completedAt: -1 });
// Idempotency guard — createReviewIfNeeded() upserts on this key so a
// retried/duplicate submit call can never create two review docs for the
// same attempt.
AttemptReviewSchema.index({ userId: 1, attemptType: 1, attemptId: 1 }, { unique: true });
// Same 3-month retention convention as every other attempt-history model
// (TestAttempt, ListeningAttempt, ReadingPracticeAttempt, ListeningPracticeAttempt
// all use this exact expireAfterSeconds keyed on createdAt).
AttemptReviewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('AttemptReview', AttemptReviewSchema);
