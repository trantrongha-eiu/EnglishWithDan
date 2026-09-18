const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const examTimetableController = require('../controllers/examTimetable.controller');

// The "7-week exam timetable" tracker lives on reading-listening-strategy.html,
// a reference page with no premium gate anywhere else on it (see the page's
// own dictionary-lookup comment: "reference material — always on, no exam
// gate"). This tracker is a personal study-planning aid, not skill practice
// content, so it stays login-only too — no requirePremium here.
router.get('/', auth, examTimetableController.getProgress);
router.put('/checklist/:key', auth, examTimetableController.setChecklistItem);
router.post('/logs', auth, examTimetableController.addLog);
router.patch('/logs/:logId', auth, examTimetableController.updateLog);
router.delete('/logs/:logId', auth, examTimetableController.deleteLog);

module.exports = router;
