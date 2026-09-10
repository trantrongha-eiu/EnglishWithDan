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

// Free-plan gating model: a brand-new account gets full access to every
// feature for 24h from creation, then everything locks (see
// docs/PRODUCT_FEATURE_AUDIT.md's gating note + the product decision this
// implements). Computed live from `createdAt` — every User already has one
// via {timestamps:true}, so this applies retroactively to existing free
// accounts with zero migration.
const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000;

function isWithinTrial(user) {
  if (!user) return false;
  // A local account created through the verify-email flow gets NO trial
  // until the email is confirmed — this is the anti trial-farming gate.
  // `emailVerified` is only ever explicitly `false` on such accounts;
  // every pre-feature doc (field absent → schema default true) and every
  // social login reads as verified, so this line is inert for them.
  if (user.emailVerified === false) return false;
  // Trial clock starts at email verification for post-feature accounts
  // (trialStartedAt), and falls back to account creation for everyone
  // else — identical behavior to before this change.
  const anchor = user.trialStartedAt || user.createdAt;
  return !!anchor && (Date.now() - new Date(anchor).getTime()) < TRIAL_DURATION_MS;
}

// The single source of truth for "can this user use a gated feature right
// now" — premium (no time limit), staff (always), or still inside their
// first-24h trial window. requirePremium.js and any route that used to have
// its own free-tier carve-out should all funnel through this.
function hasFullAccess(user) {
  if (!user) return false;
  if (user.plan === 'premium') return true;
  if (['admin', 'teacher'].includes(user.role)) return true;
  return isWithinTrial(user);
}

module.exports = { computePlanExpiry, isWithinTrial, hasFullAccess, TRIAL_DURATION_MS };
