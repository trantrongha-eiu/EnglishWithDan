const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upgradeController = require('../controllers/upgrade.controller');

// POST /api/upgrade/request — học viên gửi yêu cầu nâng cấp
router.post('/request', auth, upgradeController.createRequest);

// GET /api/upgrade/status — lấy yêu cầu mới nhất của học viên
router.get('/status', auth, upgradeController.getStatus);

module.exports = router;
