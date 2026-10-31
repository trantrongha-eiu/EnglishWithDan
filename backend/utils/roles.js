'use strict';

// Admin/teacher accounts are exempt from student-only restrictions: lesson
// locks, the mandatory-review gate and exam proctoring (strikes / voided
// attempts / cooldowns).
const STAFF_ROLES = ['admin', 'teacher'];

function isStaff(user) {
  return !!(user && STAFF_ROLES.includes(user.role));
}

module.exports = { STAFF_ROLES, isStaff };
