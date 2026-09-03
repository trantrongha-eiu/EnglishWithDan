const mongoose = require('mongoose');

// Attendance policy for one class. Embedded (not a separate collection) —
// every read of a class already needs it, and it's edited only via the
// class's own PUT. Defaults encode the rules the owner asked for:
//   - "Vắng có phép hay không cũng tính là vắng" → excusedCountsAsAbsence: true
//   - "2 lần đi trễ = 1 buổi vắng"               → lateToAbsenceRatio: 2
//   - "Không hard-code 2 buổi" — warnThreshold is just the default, and the
//     fail limit (maxAbsencesAllowed) is a per-class number, not a constant.
const attendancePolicySchema = new mongoose.Schema({
  // Nghỉ (absence-equivalent) quá con số này → học viên bị chuyển "failed"
  // khi failOnExceed bật.
  maxAbsencesAllowed:     { type: Number, default: 3, min: 0 },
  // Nghỉ >= con số này → "warning" + banner cảnh báo khi học viên đăng nhập.
  warnThreshold:          { type: Number, default: 2, min: 0 },
  // Vắng có phép có tính vào giới hạn nghỉ không. Mặc định CÓ (theo yêu cầu).
  excusedCountsAsAbsence: { type: Boolean, default: true },
  // Mỗi lần "late" cộng 1/ratio vào absence-equivalent. 2 = 2 lần trễ ~ 1 buổi vắng.
  lateToAbsenceRatio:     { type: Number, default: 2, min: 1 },
  // Đến muộn quá số phút này thì tính "late" — chỉ để tham chiếu cho giáo viên,
  // hệ thống không tự suy ra trạng thái từ đây.
  lateThresholdMinutes:   { type: Number, default: 15, min: 0 },
  // Tự động chuyển "failed" khi vượt maxAbsencesAllowed.
  failOnExceed:           { type: Boolean, default: true },
}, { _id: false });

const ClassGroupSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true, maxlength: 120 },
  // Optional link to the marketing Course catalog; courseName is the plain-text
  // fallback (same pattern as TuitionFee.courseName) so a class can name its
  // course without a catalog entry existing.
  courseId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  courseName: { type: String, default: '', trim: true, maxlength: 160 },
  // Giáo viên phụ trách. Mọi thao tác trên lớp chỉ chính teacherId này (hoặc
  // admin) được phép — xem middleware loadOwnedClass trong controller.
  teacherId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  startDate:       { type: Date },
  endDate:         { type: Date },
  durationMonths:  { type: Number, min: 0 },
  totalSessions:   { type: Number, min: 1 },
  sessionsPerWeek:  { type: Number, min: 0 },
  sessionsPerMonth: { type: Number, min: 0 },

  policy: { type: attendancePolicySchema, default: () => ({}) },

  status: { type: String, enum: ['active', 'archived'], default: 'active' },
}, { timestamps: true });

// GET /api/classes for a teacher filters { teacherId, status }.
ClassGroupSchema.index({ teacherId: 1, status: 1 });

module.exports = mongoose.model('ClassGroup', ClassGroupSchema);
