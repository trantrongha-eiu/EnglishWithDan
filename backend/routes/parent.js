const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const c = require('../controllers/parent.controller');

// Phụ huynh — read-only view of their linked children. See
// controllers/parent.controller.js; links are managed by staff in
// routes/admin/parents.js.
router.use(auth, c.parentOnly);

router.get('/children', c.listChildren);
router.get('/children/:childId/classes',  c.loadLinkedChild, c.getClasses);
router.get('/children/:childId/homework', c.loadLinkedChild, c.getHomework);
router.get('/children/:childId/scores',   c.loadLinkedChild, c.getScores);
router.get('/children/:childId/tuition',  c.loadLinkedChild, c.getTuition);

module.exports = router;
