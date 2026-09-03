const cron = require('node-cron');
const ClassGroup = require('../models/ClassGroup');
const ClassEnrollment = require('../models/ClassEnrollment');
const Message = require('../models/Message');
const User = require('../models/User');
const assignmentService = require('../services/assignmentService');
const logger = require('../utils/logger');

const RENOTIFY_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

// Deadline-soon / overdue are surfaced live on the student dashboard, not
// pushed. This cron only sends the ONE escalation the product wants in the
// inbox: "you've missed homework past this class's threshold" — at most once
// a week while the student stays over the line.
async function runSweep(now = new Date()) {
  try {
    const classes = await ClassGroup.find({ status: 'active' }).select('_id name teacherId').lean();
    if (!classes.length) return;

    const teachers = await User.find({ _id: { $in: classes.map((c) => c.teacherId) } }).select('username').lean();
    const teacherMap = new Map(teachers.map((t) => [String(t._id), t]));

    let sent = 0;
    for (const cls of classes) {
      const enrollments = await ClassEnrollment.find({ classId: cls._id, removedAt: null, status: { $in: ['active', 'warning', 'failed'] } });
      for (const enr of enrollments) {
        const { homeworkWarning } = await assignmentService.getStudentAssignments(enr.studentId, now);
        // only nag for THIS class (match by id, not name — names aren't unique)
        const overForThisClass = homeworkWarning && String(homeworkWarning.classId) === String(cls._id);
        if (!overForThisClass) continue;

        const last = enr.homeworkWarnNotifiedAt ? enr.homeworkWarnNotifiedAt.getTime() : 0;
        if (now.getTime() - last < RENOTIFY_AFTER_MS) continue;

        const teacher = teacherMap.get(String(cls.teacherId));
        await Message.create({
          fromId: cls.teacherId,
          fromName: teacher?.username || 'Giáo viên',
          toId: enr.studentId,
          subject: '⚠️ Nhắc nhở hoàn thành bài tập',
          body: `Bạn đang có ${homeworkWarning.missedCount} buổi chưa hoàn thành đầy đủ bài tập ở lớp "${cls.name}" ` +
            `(ngưỡng cảnh báo: ${homeworkWarning.threshold}). Vui lòng hoàn thành homework đúng hạn để theo kịp tiến độ lớp học.`,
          type: 'reminder',
        });
        enr.homeworkWarnNotifiedAt = now;
        await enr.save();
        sent += 1;
      }
    }
    logger.info('cron', 'AssignmentSweep: done', { classes: classes.length, remindersSent: sent });
  } catch (e) {
    logger.error('cron', 'AssignmentSweep run error', { errorMessage: e.message });
  }
}

let task = null;

function start() {
  // 02:30 ICT daily — just after the attendance sweep.
  task = cron.schedule('30 2 * * *', () => runSweep(), { timezone: 'Asia/Ho_Chi_Minh' });
  logger.startup('AssignmentSweep cron scheduled (02:30 ICT daily)');
}

function stop() {
  if (task) task.stop();
}

module.exports = { start, stop, runSweep };
