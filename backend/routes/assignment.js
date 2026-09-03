const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validateObjectIdParam = require('../middleware/validateObjectIdParam');
const c = require('../controllers/assignment.controller');

// Student self-view. Authorization is always derived from req.user._id + a
// live ClassEnrollment lookup inside the controller/service — a student
// cannot reach another class's homework by editing an id.
router.get('/mine', auth, c.myAssignments);
router.get('/mine/summary', auth, c.myHomeworkSummary);
router.get('/:assignmentId', auth, validateObjectIdParam('assignmentId'), c.getMyAssignment);
router.post('/:assignmentId/items/:itemId/complete', auth, validateObjectIdParam('assignmentId'), validateObjectIdParam('itemId'), c.completeItem);

module.exports = router;
