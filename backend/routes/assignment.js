const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validateObjectIdParam = require('../middleware/validateObjectIdParam');
const c = require('../controllers/assignment.controller');
const requirePremium = require('../middleware/requirePremium');

// Student self-view. Authorization is always derived from req.user._id + a
// live ClassEnrollment lookup inside the controller/service — a student
// cannot reach another class's homework by editing an id.
router.get('/mine', auth, c.myAssignments);
router.get('/mine/summary', auth, c.myHomeworkSummary);
router.post('/viewed', auth, c.recordView);
router.get('/:assignmentId', auth, validateObjectIdParam('assignmentId'), c.getMyAssignment);
router.post('/:assignmentId/items/:itemId/complete', auth, validateObjectIdParam('assignmentId'), validateObjectIdParam('itemId'), c.completeItem);
// writes words into the student's vocab book — same plan gate as /api/vocabbook writes
router.post('/:assignmentId/items/:itemId/vocab-list/start', auth, requirePremium(), validateObjectIdParam('assignmentId'), validateObjectIdParam('itemId'), c.startVocabList);

module.exports = router;
