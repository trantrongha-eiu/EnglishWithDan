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

  confidence: { type: String, enum: ['very-confident', 'not-sure', 'guessing'], default: null },

  // "Try Again" — retryResult is always server-computed against this
  // mistake's own frozen correctAnswer, never trusted from the client.
  retryAnswer: { type: String, default: null },
  retryResult: { type: String, enum: ['correct', 'wrong'], default: null },

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
  // a retry attempt, learningPoint.category) are all present — see
  // reviewService.js's REQUIRED_FIELDS_FILLED for the exact check.
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

  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  mistakes: [MistakeSchema],

  startedAt:   { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

AttemptReviewSchema.index({ userId: 1, status: 1, attemptType: 1 });
// Idempotency guard — createReviewIfNeeded() upserts on this key so a
// retried/duplicate submit call can never create two review docs for the
// same attempt.
AttemptReviewSchema.index({ userId: 1, attemptType: 1, attemptId: 1 }, { unique: true });
// Same 3-month retention convention as every other attempt-history model
// (TestAttempt, ListeningAttempt, ReadingPracticeAttempt, ListeningPracticeAttempt
// all use this exact expireAfterSeconds keyed on createdAt).
AttemptReviewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('AttemptReview', AttemptReviewSchema);
