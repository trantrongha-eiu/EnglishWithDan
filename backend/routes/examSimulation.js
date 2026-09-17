const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/examSimulation.controller');

// Test Simulation mode for standalone Reading/Listening/Writing (full test
// + individual "lẻ" practice) — see backend/services/examSimulationService.js.
// Deliberately separate from /api/mock-test (the 4-skill Full Mock Test),
// which is untouched by this feature.
router.get('/cooldown', auth, ctrl.cooldown);
router.post('/violation', auth, ctrl.violation);

module.exports = router;
