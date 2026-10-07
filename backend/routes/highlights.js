const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { userRateLimiter } = require('../middleware/rateLimit');
const attemptHighlightController = require('../controllers/attemptHighlight.controller');

// The client debounces (one PUT per burst of highlighting), so even a
// student highlighting non-stop through a 60-minute test stays far below
// this; it only stops a runaway loop / script.
const saveLimiter = userRateLimiter({
  max: 300,
  message: 'Bạn lưu highlight quá nhanh, vui lòng thử lại sau ít phút.',
  name: 'highlights:save',
});

// PUT /api/highlights/:kind/:attemptId
// kind: reading | reading-practice | listening | listening-practice
router.put('/:kind/:attemptId', auth, saveLimiter, attemptHighlightController.saveHighlights);

module.exports = router;
