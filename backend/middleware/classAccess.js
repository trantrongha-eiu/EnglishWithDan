'use strict';

// Shared authorization for the teacher class features (attendance +
// assignments). `staffOnly` gates to teacher|admin; `loadOwnedClass` then
// enforces that a teacher may only act on a class they run — `teacherId`
// must equal `req.user._id` — while an admin bypasses that check. Never
// trusts a class id from the request body to decide access; it is always
// re-loaded and checked here. Must run after middleware `auth`.

const ClassGroup = require('../models/ClassGroup');
const ClassEnrollment = require('../models/ClassEnrollment');

const STAFF_ROLES = ['teacher', 'admin'];

function staffOnly(req, res, next) {
  if (!STAFF_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
  }
  next();
}

async function loadOwnedClass(req, res, next) {
  try {
    const cls = await ClassGroup.findById(req.params.classId);
    if (!cls) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });
    if (req.user.role !== 'admin' && !cls.teacherId.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không phụ trách lớp này' });
    }
    req.classGroup = cls;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

// Student-side: resolve the caller's LIVE active enrollment in a class.
// Returns the enrollment doc or null — callers turn null into 403/404 so a
// student can never reach another class's data by editing an id.
async function findActiveEnrollment(studentId, classId) {
  return ClassEnrollment.findOne({ classId, studentId, removedAt: null });
}

function displayName(u) {
  if (!u) return '';
  const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return full || u.username || '';
}

module.exports = { STAFF_ROLES, staffOnly, loadOwnedClass, findActiveEnrollment, displayName };
