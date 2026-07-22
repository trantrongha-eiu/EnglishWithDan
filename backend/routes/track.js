const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const trackController = require('../controllers/track.controller');

// Public, unauthenticated beacon (anonymous visitors need tracking too) —
// rate-limited per IP as a defense-in-depth backstop against non-browser
// spam, since the frontend already self-limits to one ping/day/browser.
// Over-limit requests are dropped silently (204) rather than erroring, to
// match the "never let analytics affect the page" contract.
const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(204).end(),
});

/**
 * POST /api/track/visit
 * Public – không cần đăng nhập. Body rỗng.
 */
router.post('/visit', trackLimiter, trackController.recordVisit);

module.exports = router;
