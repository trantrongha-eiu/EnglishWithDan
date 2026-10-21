const mongoose = require('mongoose');

// Phụ huynh ↔ học sinh. Its own collection (not an array on User) because
// it's many-to-many: one parent can have several children at the center,
// and a child can have both parents linked. Created/removed only by staff
// (routes/admin/parents.js); read by routes/parent.js, where every
// /children/:childId/* call must find a row here first.
//
// No TTL: this is an account relationship, not practice history (see the
// 90-day retention rule on the attempt models).
const ParentLinkSchema = new mongoose.Schema({
  parentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relation:  { type: String, enum: ['mother', 'father', 'other'], default: 'other' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ParentLinkSchema.index({ parentId: 1, studentId: 1 }, { unique: true });
// "Which parents does this student have" — the admin Chi tiết học sinh panel.
ParentLinkSchema.index({ studentId: 1 });

module.exports = mongoose.model('ParentLink', ParentLinkSchema);
