const mongoose = require('mongoose');

// One resource line inside an assignment. Its own `_id` is the stable key
// that AssignmentProgress.items reference — so editing an assignment's
// resource list never loses a student's completion of the untouched ones.
//
//  - internal: references EXISTING site content by (resourceType, resourceId)
//    — never a copy. Completion is derived from the student's real attempt
//    history (services/resourceCompletionService.js). `label` is a name
//    snapshot for display only.
//  - external: a link the student opens; they tick it done manually.
//  - image: teacher-uploaded image(s) (Cloudinary); ticked done manually.
const assignmentResourceSchema = new mongoose.Schema({
  kind: { type: String, enum: ['internal', 'external', 'image'], required: true },

  // internal
  resourceType: {
    type: String,
    enum: [
      'reading_test', 'listening_test', 'reading_practice', 'listening_practice',
      'dictation', 'writing_exam', 'task2', 'speaking',
      'grammar', 'vocabulary_lesson', 'mock_test', 'task1_lesson',
      'task1_practice', 'task2_practice',
    ],
  },
  resourceId: { type: mongoose.Schema.Types.ObjectId }, // null only for mock_test
  label:      { type: String, default: '' },            // name snapshot at assign time
  // Deep-link key snapshot for types whose student-facing URL isn't keyed by
  // resourceId — task1_lesson links by WT1Lesson.code (re-seeding-safe id),
  // not the Mongo _id stored above. '' for every other type (see
  // resourceCompletionService.deepLinkKeyFor).
  resourceCode: { type: String, default: '' },

  // external
  url:         { type: String, default: '' },
  title:       { type: String, default: '' },
  description: { type: String, default: '' },

  // image
  images:      [{ url: String, publicId: String, width: Number, height: Number }],
  instruction: { type: String, default: '' },
});

const AssignmentSchema = new mongoose.Schema({
  classId:     { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
  teacherId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  title:       { type: String, required: true, trim: true, maxlength: 200 },
  instruction: { type: String, default: '', trim: true, maxlength: 4000 },
  deadline:    { type: Date, default: null }, // null = no deadline

  resources:   { type: [assignmentResourceSchema], default: [] },

  // Assignment-level lifecycle — NEVER auto-deleted. An overdue assignment
  // stays visible; only a teacher archiving it hides it from students.
  status:      { type: String, enum: ['active', 'archived'], default: 'active' },
}, { timestamps: true });

AssignmentSchema.index({ classId: 1, status: 1, createdAt: -1 });
AssignmentSchema.index({ teacherId: 1 });

// Permanent per-class record, no automated backup on this Atlas tier.
AssignmentSchema.plugin(require('../utils/guardAgainstMassDelete'));

module.exports = mongoose.model('Assignment', AssignmentSchema);
