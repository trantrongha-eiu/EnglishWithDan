const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const contactController = require('../controllers/contact.controller');
const logger = require('../utils/logger');

// Public, unauthenticated endpoint that triggers an outbound email per
// request — rate-limited to prevent inbox flooding / Resend quota abuse
// (security audit finding, Phase 9).
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' });
  }
});

/**
 * POST /api/contact
 * Public – không cần đăng nhập
 * Body: { name, phone, email, course, message }
 */
router.post('/', contactLimiter, contactController.submitInquiry);

module.exports = router;
