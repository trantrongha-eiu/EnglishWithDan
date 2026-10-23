'use strict';

// Phụ huynh accounts, managed from the admin Chi tiết học sinh page.
// Only staff create parents (no self-sign-up): a teacher for a student in a
// class they run, an admin for anyone. A parent logs in with their phone
// number (= username); the starting password is that same phone number, so
// the teacher only has to tell them "đăng nhập bằng số điện thoại". Parents are
// not forced to change it; User.mustChangePassword just stays true until they
// do, so the admin panel can show who still uses the phone number.
//
//   GET    /api/admin/users/:id/parents                        list linked parents
//   POST   /api/admin/users/:id/parents                        create-or-link { name, phone, relation, email? }
//   POST   /api/admin/users/:id/parents/:parentId/reset-password  (back to the phone number)
//   DELETE /api/admin/users/:id/parents/:parentId              unlink (account kept)

const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const { staffOnly, displayName } = require('../../middleware/classAccess');
const User = require('../../models/User');
const ParentLink = require('../../models/ParentLink');
const ClassGroup = require('../../models/ClassGroup');
const ClassEnrollment = require('../../models/ClassEnrollment');
const logger = require('../../utils/logger');

const router = express.Router();

const RELATIONS = ['mother', 'father', 'other'];

// "+84 912 345 678" / "0912.345.678" → "0912345678"; null if not a VN mobile.
function normalizePhone(raw) {
  let d = String(raw || '').replace(/[^\d+]/g, '');
  if (d.startsWith('+84')) d = '0' + d.slice(3);
  else if (d.startsWith('84') && d.length === 11) d = '0' + d.slice(2);
  return /^0\d{9}$/.test(d) ? d : null;
}

// Admin: any student. Teacher: only a student with a live enrollment in a
// class they run.
async function canManageStudent(user, studentId) {
  if (user.role === 'admin') return true;
  const enrollments = await ClassEnrollment.find({ studentId, removedAt: null }).select('classId').lean();
  if (!enrollments.length) return false;
  return !!(await ClassGroup.exists({ _id: { $in: enrollments.map((e) => e.classId) }, teacherId: user._id }));
}

async function loadStudent(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'ID học sinh không hợp lệ' });
    const student = await User.findById(id).select('role username firstName lastName').lean();
    if (!student || student.role !== 'student') return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
    if (!(await canManageStudent(req.user, student._id))) {
      return res.status(403).json({ success: false, message: 'Bạn chỉ quản lý được phụ huynh của học sinh trong lớp mình' });
    }
    req.student = student;
    next();
  } catch (err) {
    logger.error('admin', 'Parent management request failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

function shapeParent(p, link) {
  return {
    _id: p._id,
    name: displayName(p),
    phone: p.username,
    email: /@parent\.invalid$/.test(p.email || '') ? '' : (p.email || ''),
    relation: link?.relation || 'other',
    mustChangePassword: !!p.mustChangePassword,
    lastSeen: p.lastSeen || null,
    linkedAt: link?.createdAt || null,
  };
}

const PARENT_FIELDS = 'username email firstName lastName mustChangePassword lastSeen';

router.get('/users/:id/parents', auth, staffOnly, loadStudent, async (req, res) => {
  try {
    const links = await ParentLink.find({ studentId: req.student._id }).sort({ createdAt: 1 }).lean();
    const parents = await User.find({ _id: { $in: links.map((l) => l.parentId) } }).select(PARENT_FIELDS).lean();
    const pMap = new Map(parents.map((p) => [String(p._id), p]));
    res.json({
      success: true,
      parents: links.filter((l) => pMap.has(String(l.parentId))).map((l) => shapeParent(pMap.get(String(l.parentId)), l)),
    });
  } catch (err) {
    logger.error('admin', 'Parent management request failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Create a parent account, or — when the phone already belongs to a parent
// (a sibling at the same center) — just link that account to this student.
router.post('/users/:id/parents', auth, staffOnly, loadStudent, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim().slice(0, 80);
    const phone = normalizePhone(req.body.phone);
    const relation = RELATIONS.includes(req.body.relation) ? req.body.relation : 'other';
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!phone) return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ (VD: 0912345678)' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
    }

    let parent = await User.findOne({ username: phone }).select(`${PARENT_FIELDS} role`);
    let password = null;
    let created = false;
    if (parent) {
      if (parent.role !== 'parent') {
        return res.status(409).json({ success: false, message: 'Số điện thoại này đã được dùng cho một tài khoản khác (không phải phụ huynh).' });
      }
    } else {
      if (!name) return res.status(400).json({ success: false, message: 'Vui lòng nhập tên phụ huynh' });
      if (email && await User.exists({ email })) {
        return res.status(409).json({ success: false, message: 'Email này đã được dùng cho tài khoản khác' });
      }
      password = phone;
      parent = await User.create({
        username: phone,
        email: email || `parent-${phone}@parent.invalid`,
        password: await bcrypt.hash(password, 10),
        firstName: name,
        lastName: '',
        role: 'parent',
        emailVerified: true,
        mustChangePassword: true,
      });
      created = true;
    }

    const existing = await ParentLink.findOne({ parentId: parent._id, studentId: req.student._id }).lean();
    if (existing) return res.status(409).json({ success: false, message: 'Phụ huynh này đã được liên kết với học sinh' });
    const link = await ParentLink.create({ parentId: parent._id, studentId: req.student._id, relation, createdBy: req.user._id });

    logger.info('admin', 'Parent linked', { parentId: String(parent._id), studentId: String(req.student._id), by: String(req.user._id), created });
    res.status(created ? 201 : 200).json({
      success: true,
      created,
      parent: shapeParent(parent, link),
      // The starting password (= phone); null when we only linked an
      // existing account, whose password we don't touch.
      tempPassword: password,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Số điện thoại hoặc email đã tồn tại' });
    }
    logger.error('admin', 'Parent create failed', { errorMessage: err && err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

async function loadLinkedParent(req, res, next) {
  try {
    const { parentId } = req.params;
    if (!mongoose.isValidObjectId(parentId)) return res.status(404).json({ success: false, message: 'Không tìm thấy phụ huynh' });
    const link = await ParentLink.findOne({ parentId, studentId: req.student._id });
    if (!link) return res.status(404).json({ success: false, message: 'Không tìm thấy phụ huynh' });
    req.parentLink = link;
    next();
  } catch (err) {
    logger.error('admin', 'Parent management request failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

router.post('/users/:id/parents/:parentId/reset-password', auth, staffOnly, loadStudent, loadLinkedParent, async (req, res) => {
  try {
    const parent = await User.findById(req.parentLink.parentId).select('role username');
    if (!parent || parent.role !== 'parent') return res.status(404).json({ success: false, message: 'Không tìm thấy phụ huynh' });
    // Back to the phone number, same as a fresh account.
    const password = parent.username;
    parent.password = await bcrypt.hash(password, 10);
    parent.mustChangePassword = true;
    // Old sessions (e.g. a lost phone) stop working.
    parent.tokenValidAfter = new Date();
    await parent.save();
    logger.info('admin', 'Parent password reset', { parentId: String(parent._id), by: String(req.user._id) });
    res.json({ success: true, tempPassword: password });
  } catch (err) {
    logger.error('admin', 'Parent management request failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Unlink only — the account stays (it may have other children linked); a
// parent with no links left just sees an empty list.
router.delete('/users/:id/parents/:parentId', auth, staffOnly, loadStudent, loadLinkedParent, async (req, res) => {
  try {
    await ParentLink.deleteOne({ _id: req.parentLink._id });
    logger.info('admin', 'Parent unlinked', { parentId: String(req.parentLink.parentId), studentId: String(req.student._id), by: String(req.user._id) });
    res.json({ success: true });
  } catch (err) {
    logger.error('admin', 'Parent management request failed', { errorMessage: err.message });
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
