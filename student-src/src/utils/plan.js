// Cached plan check — mirrors app-shell.js AuthService.hasPremiumAccess
// (server: backend/utils/plan.js hasFullAccess). UI decisions only; the
// server is the real gate (requirePremium → err.body.requiresPremium).
const TRIAL_MS = 24 * 60 * 60 * 1000;

export function hasPremiumAccess(user) {
  const u = user || (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
  if (!u) return false;
  if (u.plan === 'premium' || u.role === 'admin' || u.role === 'teacher') return true;
  // free-plan 24h trial; an unverified local account has none
  if (u.emailVerified === false) return false;
  const anchor = u.trialStartedAt || u.createdAt;
  return !!anchor && Date.now() - new Date(anchor).getTime() < TRIAL_MS;
}
