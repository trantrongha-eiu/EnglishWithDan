'use strict';

// Homework assignments. Teacher routes hang off /api/classes/:classId
// (guarded by staffOnly + loadOwnedClass from middleware/classAccess.js);
// student routes are /api/assignments/* and derive access purely from
// req.user._id + a live ClassEnrollment lookup — never from the request.

const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const ClassEnrollment = require('../models/ClassEnrollment');
const Message = require('../models/Message');
const rcs = require('../services/resourceCompletionService');
const svc = require('../services/assignmentService');
const cloudinaryService = require('../services/cloudinaryService');
const { findActiveEnrollment } = require('../middleware/classAccess');
const logger = require('../utils/logger');

// ── validation of the resources[] payload ─────────────────────────────
async function buildResources(input) {
  if (!Array.isArray(input) || !input.length) {
    return { error: 'Bài tập cần ít nhất một tài nguyên' };
  }
  const out = [];
  for (const r of input) {
    if (r.kind === 'internal') {
      if (!rcs.isValidType(r.resourceType)) return { error: `Loại tài nguyên không hợp lệ: ${r.resourceType}` };
      const ok = await rcs.resourceExists(r.resourceType, r.resourceId || null);
      if (!ok) return { error: `Tài nguyên "${r.resourceType}" không tồn tại` };
      out.push({
        kind: 'internal',
        resourceType: r.resourceType,
        resourceId: r.resourceId || null,
        label: (r.label && String(r.label).slice(0, 200)) || await rcs.labelFor(r.resourceType, r.resourceId),
      });
    } else if (r.kind === 'external') {
      if (!r.url || !/^https?:\/\//i.test(r.url)) return { error: 'Link ngoài phải bắt đầu bằng http(s)://' };
      out.push({
        kind: 'external',
        url: String(r.url).slice(0, 2000),
        title: String(r.title || '').slice(0, 200),
        description: String(r.description || '').slice(0, 1000),
      });
    } else if (r.kind === 'image') {
      const images = Array.isArray(r.images) ? r.images.filter((im) => im && im.url).slice(0, 10) : [];
      if (!images.length) return { error: 'Bài tập ảnh cần ít nhất một ảnh đã upload' };
      out.push({
        kind: 'image',
        images: images.map((im) => ({ url: im.url, publicId: im.publicId || '', width: im.width, height: im.height })),
        title: String(r.title || '').slice(0, 200),
        instruction: String(r.instruction || '').slice(0, 2000),
      });
    } else {
      return { error: `kind không hợp lệ: ${r.kind}` };
    }
  }
  return { resources: out };
}

// ════════════════════ TEACHER ════════════════════

// GET /api/classes/resources/catalog?type=&search=&limit=
exports.getResourceCatalog = async (req, res) => {
  try {
    const { type, search = '', limit } = req.query;
    if (!rcs.isValidType(type)) return res.status(400).json({ success: false, message: 'type không hợp lệ' });
    const items = await rcs.listCatalog(type, search, limit);
    res.json({ success: true, type, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/classes/:classId/assignments
exports.listAssignments = async (req, res) => {
  try {
    const list = await Assignment.find({ classId: req.classGroup._id }).sort({ createdAt: -1 }).lean();
    const enrolledCount = await ClassEnrollment.countDocuments({ classId: req.classGroup._id, removedAt: null });

    // Completion is computed LIVE (not from the AssignmentProgress cache) so
    // the count is right even for an all-internal assignment nobody has
    // ticked. Classes are small (≤ ~8), so a table per assignment is cheap.
    const withCounts = await Promise.all(list.map(async (a) => {
      const rows = await svc.getAssignmentProgressTable(a);
      return {
        ...a,
        resourceCount: a.resources.length,
        completedStudents: rows.filter((r) => !r.removed && r.status === 'completed').length,
      };
    }));

    res.json({ success: true, enrolledCount, assignments: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/classes/:classId/assignments
exports.createAssignment = async (req, res) => {
  try {
    const { title, instruction = '', deadline = null, resources } = req.body;
    if (!title || !String(title).trim()) return res.status(400).json({ success: false, message: 'Tên bài tập là bắt buộc' });
    const built = await buildResources(resources);
    if (built.error) return res.status(400).json({ success: false, message: built.error });

    const assignment = await Assignment.create({
      classId: req.classGroup._id,
      teacherId: req.classGroup.teacherId,
      createdBy: req.user._id,
      title: String(title).trim(),
      instruction: String(instruction).trim(),
      deadline: deadline ? new Date(deadline) : null,
      resources: built.resources,
    });

    // Notify enrolled students in their inbox (decision: inbox for "new
    // assignment" + threshold only — not deadline-soon/overdue).
    const enrollments = await ClassEnrollment.find({ classId: req.classGroup._id, removedAt: null }).select('studentId').lean();
    if (enrollments.length) {
      const dl = assignment.deadline
        ? ` Hạn nộp: ${assignment.deadline.toLocaleDateString('vi-VN')} ${assignment.deadline.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}.`
        : '';
      await Message.insertMany(enrollments.map((e) => ({
        fromId: req.user._id,
        fromName: req.user.username,
        toId: e.studentId,
        subject: `📚 Bài tập mới: ${assignment.title}`,
        body: `Lớp "${req.classGroup.name}" vừa có bài tập mới "${assignment.title}" (${built.resources.length} phần).${dl} Xem trong "Bài tập cần làm" trên trang chủ.`,
        type: 'reminder',
      })));
    }
    logger.security('Assignment created', { actorId: String(req.user._id), classId: String(req.classGroup._id), assignmentId: String(assignment._id) });
    res.status(201).json({ success: true, assignment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/classes/:classId/assignments/:assignmentId
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.assignmentId, classId: req.classGroup._id }).lean();
    if (!assignment) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    const rows = await svc.getAssignmentProgressTable(assignment);
    res.json({ success: true, assignment, rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// PUT /api/classes/:classId/assignments/:assignmentId
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.assignmentId, classId: req.classGroup._id });
    if (!assignment) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    const { title, instruction, deadline, resources, status } = req.body;
    if (title !== undefined) assignment.title = String(title).trim();
    if (instruction !== undefined) assignment.instruction = String(instruction).trim();
    if (deadline !== undefined) assignment.deadline = deadline ? new Date(deadline) : null;
    if (status !== undefined && ['active', 'archived'].includes(status)) assignment.status = status;
    if (resources !== undefined) {
      const built = await buildResources(resources);
      if (built.error) return res.status(400).json({ success: false, message: built.error });
      assignment.resources = built.resources;
    }
    await assignment.save();
    res.json({ success: true, assignment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/classes/:classId/assignments/:assignmentId/archive
exports.setAssignmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'archived'].includes(status)) return res.status(400).json({ success: false, message: 'status phải là active hoặc archived' });
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.assignmentId, classId: req.classGroup._id },
      { status }, { new: true },
    );
    if (!assignment) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/classes/:classId/assignments/images   (multer .array('images'))
exports.uploadAssignmentImages = async (req, res) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ success: false, message: 'Không có ảnh nào' });
    const uploaded = [];
    for (const f of req.files) {
      const dataUri = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
      const r = await cloudinaryService.uploadImage(dataUri, { folder: 'assignments' });
      uploaded.push({ url: r.secure_url, publicId: r.public_id, width: r.width, height: r.height });
    }
    res.json({ success: true, images: uploaded });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi upload ảnh' });
  }
};

// ════════════════════ STUDENT ════════════════════

// GET /api/assignments/mine
exports.myAssignments = async (req, res) => {
  try {
    const data = await svc.getStudentAssignments(req.user._id, new Date(), { persist: true });
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/assignments/mine/summary  (nav.js)
exports.myHomeworkSummary = async (req, res) => {
  try {
    const summary = await svc.getStudentHomeworkSummary(req.user._id);
    res.json({ success: true, ...summary });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/assignments/:assignmentId
exports.getMyAssignment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.assignmentId)) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    const assignment = await Assignment.findById(req.params.assignmentId).lean();
    if (!assignment || assignment.status !== 'active') return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    const enrollment = await findActiveEnrollment(req.user._id, assignment.classId);
    if (!enrollment) return res.status(403).json({ success: false, message: 'Bạn không thuộc lớp của bài tập này' });
    // reuse the aggregate to get this one assignment fully shaped for the student
    const data = await svc.getStudentAssignments(req.user._id);
    const shaped = data.assignments.find((a) => String(a._id) === String(assignment._id));
    res.json({ success: true, assignment: shaped || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/assignments/:assignmentId/items/:itemId/complete   { done }
exports.completeItem = async (req, res) => {
  try {
    const done = req.body.done !== false;
    const r = await svc.markManualItem(req.user._id, req.params.assignmentId, req.params.itemId, done);
    if (r.error) return res.status(r.error).json({ success: false, message: r.message });
    res.json({ success: true, ...r });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
