const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const weaknessController = require('../controllers/weakness.controller');

// No extra AI cost here (pure aggregation over existing attempt history),
// but gated the same as every other skill for consistency — a locked-out
// free account has no practice history to analyze anyway.
const fullAccess = requirePremium();

// GET /api/weakness  – điểm cần cải thiện theo dạng câu hỏi (Reading/
// Listening) và tiêu chí chấm điểm (Writing/Speaking), tổng hợp từ lịch sử
// luyện tập đã có sẵn.
router.get('/', auth, fullAccess, weaknessController.getWeaknessProfile);

module.exports = router;
