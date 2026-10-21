const mongoose = require('mongoose');

// One alert for a parent about one child — vắng học, bài tập quá hạn, học
// phí tới hạn. Written by services/parentNotifyService.js; read on
// parent.html (GET /api/parent/notifications).
//
// `key` names the real-world event (e.g. "absence:<sessionId>",
// "hw:<assignmentId>", "fee-due:<feeId>"), unique per parent: the same event
// seen again — a re-saved attendance sheet, the next daily sweep — never
// alerts twice.
const ParentNotificationSchema = new mongoose.Schema({
  parentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind:      { type: String, enum: ['absence', 'homework_overdue', 'tuition_due', 'tuition_reminder'], required: true },
  key:       { type: String, required: true },
  title:     { type: String, required: true },
  body:      { type: String, default: '' },
  readAt:    { type: Date, default: null },
  emailedAt: { type: Date, default: null },
}, { timestamps: true });

ParentNotificationSchema.index({ parentId: 1, key: 1 }, { unique: true });
// The parent's bell: newest first.
ParentNotificationSchema.index({ parentId: 1, createdAt: -1 });
// Practice-history retention rule: 3 months.
ParentNotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ParentNotification', ParentNotificationSchema);
