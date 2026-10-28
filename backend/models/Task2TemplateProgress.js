const mongoose = require('mongoose');

// Progress through the Task 2 Templates practice path (task2-template.html):
// one row per student × level × essay type. This is durable progress, so it
// has NO TTL — the 90-day history lives in Task2TemplateAttempt instead.
//
// Path steps: warmup (paragraph order) → read → drill (per paragraph:
// build → fade → recall) → assemble (whole essay from memory) → apply (write
// a real essay, compared with the model essay). Spaced review starts once
// `assemble` is done.
const task2TemplateProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level:  { type: String, enum: ['band6', 'band7'], required: true },
  typeId: { type: String, required: true },

  // When each step was first completed (null = not yet).
  steps: {
    warmup:   { type: Date, default: null },
    read:     { type: Date, default: null },
    drill:    { type: Date, default: null },
    assemble: { type: Date, default: null },
    apply:    { type: Date, default: null },
  },

  // Step 3 — rounds finished per paragraph (0..3: build, fade, recall).
  drillRounds: { type: [Number], default: [] },

  // How well each sentence is known, 0..5, keyed "si-ii" (section-item).
  mastery: { type: Map, of: Number, default: {} },

  warmupScore:  { type: Number, default: 0 },  // % first-try correct
  assembleBest: { type: Number, default: 0 },  // best whole-essay recall %

  // Step 5 — the student's own essay, one string per paragraph.
  applyText: { type: [String], default: [] },

  // Spaced review: stage 0..4 → next review after 1/3/7/14/30 days.
  reviewStage:  { type: Number, default: 0 },
  nextReviewAt: { type: Date, default: null },
  lastReviewAt: { type: Date, default: null },
}, { timestamps: true });

task2TemplateProgressSchema.index({ userId: 1, level: 1, typeId: 1 }, { unique: true });

module.exports = mongoose.model('Task2TemplateProgress', task2TemplateProgressSchema);
