const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validateObjectIdParam = require('../middleware/validateObjectIdParam');
const { staffOnly, loadOwnedClass } = require('../middleware/classAccess');
const c = require('../controllers/speakingExam.controller');

// 🎤 Đăng kí thi Speaking — mounted at /api/classes ALONGSIDE
// routes/classAssignments.js + routes/classAttendance.js. Gates are attached
// PER ROUTE (no blanket router.use) so unmatched paths fall through to the
// other class routers untouched.
const cid = validateObjectIdParam('classId');
const sid = validateObjectIdParam('slotId');
const staff = [auth, staffOnly];

// Student self-service (before the /:classId routes so "my" isn't a class id)
router.get('/my/speaking-exam', auth, c.myOverview);
router.post('/my/speaking-exam/:slotId/book', auth, sid, c.book);
router.post('/my/speaking-exam/:slotId/cancel', auth, sid, c.cancel);

// Teacher / admin, per class
router.get('/:classId/speaking-exam', ...staff, cid, loadOwnedClass, c.listSlots);
router.post('/:classId/speaking-exam', ...staff, cid, loadOwnedClass, c.createSlots);
router.post('/:classId/speaking-exam/copy-week', ...staff, cid, loadOwnedClass, c.copyWeek);
router.post('/:classId/speaking-exam/clear-week', ...staff, cid, loadOwnedClass, c.clearWeek);
router.put('/:classId/speaking-exam/:slotId', ...staff, cid, sid, loadOwnedClass, c.updateSlot);
router.delete('/:classId/speaking-exam/:slotId', ...staff, cid, sid, loadOwnedClass, c.deleteSlot);

module.exports = router;
