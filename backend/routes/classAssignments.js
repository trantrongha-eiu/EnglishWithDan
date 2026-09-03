const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const validateObjectIdParam = require('../middleware/validateObjectIdParam');
const { staffOnly, loadOwnedClass } = require('../middleware/classAccess');
const c = require('../controllers/assignment.controller');

// Same image-upload setup as routes/tuition.js's QR upload.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter(req, file, cb) {
    if (/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ chấp nhận ảnh PNG/JPEG/WebP'));
  },
});
function handleUpload(req, res, next) {
  upload.array('images', 10)(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}

// Teacher-side homework routes, mounted at /api/classes ALONGSIDE
// routes/classAttendance.js. Middleware is attached PER ROUTE (not via a
// blanket router.use) so any unmatched path — e.g. the student's
// /api/classes/my/attendance-status — falls straight through to the other
// router instead of being 403'd by this one's staffOnly.
const cid = validateObjectIdParam('classId');
const aid = validateObjectIdParam('assignmentId');
const gate = [auth, staffOnly];

// Resource picker catalog — not class-scoped
router.get('/resources/catalog', ...gate, c.getResourceCatalog);

// Class-scoped assignment CRUD
router.get('/:classId/assignments', ...gate, cid, loadOwnedClass, c.listAssignments);
router.post('/:classId/assignments', ...gate, cid, loadOwnedClass, c.createAssignment);
router.post('/:classId/assignments/images', ...gate, cid, loadOwnedClass, handleUpload, c.uploadAssignmentImages);
router.get('/:classId/assignments/:assignmentId', ...gate, cid, aid, loadOwnedClass, c.getAssignment);
router.put('/:classId/assignments/:assignmentId', ...gate, cid, aid, loadOwnedClass, c.updateAssignment);
router.post('/:classId/assignments/:assignmentId/status', ...gate, cid, aid, loadOwnedClass, c.setAssignmentStatus);

module.exports = router;
