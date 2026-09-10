'use strict';

// Shared per-user rate limiter.
//
// The codebase has ~12 near-identical inline `rateLimit({...})` blocks
// (routes/auth.js, reading.js, wt1.js, speaking.js, task2Practice.js,
// dictionary.js, essentialGrammar.js, …) that all repeat the same three
// things: key by `req.user._id` with an IPv6-normalised IP fallback, emit
// one `logger.security('Rate limit exceeded', …)` line on breach, and
// return `429 { success:false, message }` (the shape ApiClient /
// reading-v2 / listening already understand). This factory is that shared
// core so new limiters don't add a 13th hand-rolled copy.
//
// It is NOT authorization — every route keeps its own `auth` /
// `requirePremium` / `requireReviewComplete` / field-stripping. This only
// throttles request *rate*.
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const logger = require('../utils/logger');

const FIFTEEN_MIN = 15 * 60 * 1000;

/**
 * @param {object}   opts
 * @param {number}   opts.max         requests allowed per window per key
 * @param {number}  [opts.windowMs]   default 15 min
 * @param {string}  [opts.message]    429 body message (frontend shows it)
 * @param {string[]}[opts.skipRoles]  roles that bypass entirely (default admin+teacher)
 * @param {string}  [opts.name]       label for the security log line
 * @param {(req,res,next)=>void} [opts.onLimit]  custom breach handler
 *        (e.g. degrade instead of 429 — see wt1 checkLimiter). When given,
 *        it fully replaces the default 429 response.
 */
function userRateLimiter({
  max,
  windowMs = FIFTEEN_MIN,
  message = 'Quá nhiều yêu cầu, vui lòng thử lại sau ít phút.',
  skipRoles = ['admin', 'teacher'],
  name = 'user',
  onLimit,
} = {}) {
  const skip = new Set(skipRoles);
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req.ip),
    skip: (req) => skip.has(req.user?.role),
    handler: (req, res, next) => {
      logger.security('Rate limit exceeded', {
        limiter: name,
        path: req.path,
        userId: req.user?._id?.toString(),
        ip: req.ip,
      });
      if (onLimit) return onLimit(req, res, next);
      res.status(429).json({ success: false, message });
    },
  });
}

module.exports = { userRateLimiter, FIFTEEN_MIN };
