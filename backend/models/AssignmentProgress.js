const mongoose = require('mongoose');

// One document per (assignment × student). Keyed by studentId (NOT
// enrollmentId) so a student removed from a class and later re-added keeps
// the exact same progress. `items` mixes two sources:
//   - auto   : an internal resource the student completed on the site
//              (recomputed from attempt history on every read)
//   - manual : an external/image item the student ticked "done"
// Manual items are the durable truth; auto items are refreshed each read.
const progressItemSchema = new mongoose.Schema({
  resourceItemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Assignment.resources[]._id
  status:         { type: String, enum: ['not_started', 'completed'], default: 'not_started' },
  source:         { type: String, enum: ['auto', 'manual'], required: true },
  completedAt:    { type: Date },
  attemptRef:     { type: String, default: '' }, // the internal attempt _id that satisfied an auto item (audit)
}, { _id: false });

const AssignmentProgressSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  classId:      { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassEnrollment' }, // informational

  items: { type: [progressItemSchema], default: [] },

  completedCount: { type: Number, default: 0 },
  totalCount:     { type: Number, default: 0 },
  firstCompletedAt: { type: Date },
  allCompletedAt:   { type: Date },
  lastRecomputedAt: { type: Date },

  // "Nộp trễ" marker: set the first time the system sees this assignment past
  // its deadline (or archived) while still incomplete. If the student then
  // makes it up, it reads as completed-but-late — 2 late = 1 miss toward the
  // class's warn/fail thresholds (assignmentService.missFlagApplies).
  // missedDeadline = the deadline in force at that moment (null when it was
  // only archived), so a teacher extending the deadline voids the flag.
  missedAt:       { type: Date, default: null },
  missedDeadline: { type: Date, default: null },
}, { timestamps: true });

AssignmentProgressSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
AssignmentProgressSchema.index({ studentId: 1 });
AssignmentProgressSchema.index({ classId: 1 });

AssignmentProgressSchema.plugin(require('../utils/guardAgainstMassDelete'));

module.exports = mongoose.model('AssignmentProgress', AssignmentProgressSchema);
