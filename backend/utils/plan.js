'use strict';

// Stacks `months` of premium on top of the user's remaining time if their plan
// hasn't expired yet, otherwise starts counting from now. Used by both the
// direct admin plan-grant endpoint and the upgrade-request approval endpoint
// so the two can't drift out of sync (see commit c88b1a2).
function computePlanExpiry(currentExpiresAt, months) {
  const now = new Date();
  const baseDate = (currentExpiresAt && currentExpiresAt > now) ? currentExpiresAt : now;
  return new Date(baseDate.getTime() + months * 30 * 24 * 3600 * 1000);
}

module.exports = { computePlanExpiry };
