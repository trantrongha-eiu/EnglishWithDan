'use strict';

// Admin/teacher accounts are exempt from student-only restrictions: lesson
// locks, the mandatory-review gate and exam proctoring (strikes / voided
// attempts / cooldowns).
const STAFF_ROLES = ['admin', 'teacher'];

function isStaff(user) {
  return !!(user && STAFF_ROLES.includes(user.role));
}

// Same check when only the user id is at hand (services called with userId).
async function isStaffId(userId) {
  if (!userId) return false;
  const User = require('../models/User'); // lazy: models/User is heavy and this file is required early
  return !!(await User.exists({ _id: userId, role: { $in: STAFF_ROLES } }));
}

module.exports = { STAFF_ROLES, isStaff, isStaffId };
