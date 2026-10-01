const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const catchAsync = require('../middleware/catchAsync');
const proctorShotService = require('../services/proctorShotService');

// POST /api/proctor/shot
// body: { context: 'simulation'|'mock'|'entrance', attemptId, type, image
//         (JPEG data URL), skill?, attemptType? (simulation only) }
// Screenshot of the student's shared screen right after a strike — see
// services/proctorShotService.js and frontend/js/shared/proctor-capture.js.
router.post('/shot', auth, catchAsync(async (req, res) => {
  const result = await proctorShotService.saveShot(req.user._id, req.body || {});
  res.json({ success: true, ...result });
}));

module.exports = router;
