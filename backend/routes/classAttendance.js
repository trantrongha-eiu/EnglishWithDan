const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validateObjectIdParam = require('../middleware/validateObjectIdParam');
const c = require('../controllers/classAttendance.controller');

// ── Student self-view (must come BEFORE the /:classId routes so "my" isn't
//    parsed as a class id) ──────────────────────────────────────────────
router.get('/my/attendance-status', auth, c.myAttendanceStatus);
router.get('/my/enrollments', auth, c.myEnrollments);

// ── Everything below is staff-only (teacher | admin) ──────────────────
router.use(auth, c.staffOnly);

// Class list + create
router.get('/', c.listClasses);
router.post('/', c.createClass);

// Single class — loadOwnedClass enforces "a teacher only touches their own class"
router.get('/:classId', validateObjectIdParam('classId'), c.loadOwnedClass, c.getClass);
router.put('/:classId', validateObjectIdParam('classId'), c.loadOwnedClass, c.updateClass);
router.post('/:classId/status', validateObjectIdParam('classId'), c.loadOwnedClass, c.setClassStatus);

// Roster
router.post('/:classId/students', validateObjectIdParam('classId'), c.loadOwnedClass, c.addStudents);
router.delete('/:classId/students/:enrollmentId', validateObjectIdParam('classId'), validateObjectIdParam('enrollmentId'), c.loadOwnedClass, c.removeStudent);
router.put('/:classId/students/:enrollmentId/status', validateObjectIdParam('classId'), validateObjectIdParam('enrollmentId'), c.loadOwnedClass, c.setEnrollmentStatus);

// Sessions
router.get('/:classId/sessions', validateObjectIdParam('classId'), c.loadOwnedClass, c.listSessions);
router.post('/:classId/sessions', validateObjectIdParam('classId'), c.loadOwnedClass, c.createSession);
router.put('/:classId/sessions/:sessionId', validateObjectIdParam('classId'), validateObjectIdParam('sessionId'), c.loadOwnedClass, c.loadSession, c.updateSession);

// Attendance for one session
router.get('/:classId/sessions/:sessionId/attendance', validateObjectIdParam('classId'), validateObjectIdParam('sessionId'), c.loadOwnedClass, c.loadSession, c.getSessionAttendance);
router.put('/:classId/sessions/:sessionId/attendance', validateObjectIdParam('classId'), validateObjectIdParam('sessionId'), c.loadOwnedClass, c.loadSession, c.saveSessionAttendance);

// Dashboard
router.get('/:classId/dashboard', validateObjectIdParam('classId'), c.loadOwnedClass, c.getDashboard);

module.exports = router;
