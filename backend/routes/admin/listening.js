'use strict';
// Split out of backend/routes/listening.js (2026-07-25, admin panel audit
// finding #7): every Listening ADMIN route used to live mixed in with the
// student-facing Listening routes, mounted at /api/listening — so while
// ReadingTests.jsx called /api/admin/tests (consistent with every other
// content-management page), ListeningTests.jsx had to call the differently
// -shaped /api/listening/admin/tests. This file moves the admin routes
// under /api/admin (mounted via routes/admin/index.js) like everything
// else, re-pathed under /listening/* instead of /admin/* since the /admin
// prefix is now redundant (this whole file only exists inside the admin
// router). backend/routes/listening.js keeps only the student-facing
// routes and stays mounted at /api/listening.
//
// Every handler body below is unchanged from the original — only the path
// prefix and require paths (one extra ../ level) moved.

const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');
const listeningController = require('../../controllers/listening.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/mp4') cb(null, true);
    else cb(new Error('Chỉ chấp nhận file audio'));
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// CRUD Tests
// ══════════════════════════════════════════════════════════════════════════════
router.get('/listening/tests', auth, teacherOnly, listeningController.listAdminTests);
router.get('/listening/tests/:id', auth, teacherOnly, listeningController.getAdminTest);
router.post('/listening/tests', auth, teacherOnly, listeningController.createAdminTest);
router.put('/listening/tests/:id', auth, teacherOnly, listeningController.updateAdminTest);
router.delete('/listening/tests/:id', auth, teacherOnly, listeningController.hideAdminTest);
router.delete('/listening/tests/:id/permanent', auth, teacherOnly, listeningController.deleteAdminTestPermanent);

// ══════════════════════════════════════════════════════════════════════════════
// Upload Audio
// ══════════════════════════════════════════════════════════════════════════════
router.post('/listening/tests/:id/audio', auth, teacherOnly, upload.single('audio'), listeningController.uploadTestAudio);
router.post('/listening/upload-audio', auth, teacherOnly, upload.single('audio'), listeningController.uploadStandaloneAudio);

// ══════════════════════════════════════════════════════════════════════════════
// Upload Map/Diagram Image
// ══════════════════════════════════════════════════════════════════════════════
router.post('/listening/upload-map-image', auth, teacherOnly, listeningController.uploadMapImage);

// ══════════════════════════════════════════════════════════════════════════════
// Transcript (per section)
// ══════════════════════════════════════════════════════════════════════════════
router.put('/listening/tests/:id/transcript', auth, teacherOnly, listeningController.updateTranscript);

// ══════════════════════════════════════════════════════════════════════════════
// Lịch sử tất cả học viên (cho trang admin)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/listening/attempts', auth, teacherOnly, listeningController.listAdminAttempts);
router.get('/listening/attempts/stats', auth, teacherOnly, listeningController.getAdminAttemptsStats);

// ══════════════════════════════════════════════════════════════════════════════
// CRUD Practice Sections
// ══════════════════════════════════════════════════════════════════════════════
router.get('/listening/sections', auth, teacherOnly, listeningController.listAdminSections);
router.get('/listening/sections/:id', auth, teacherOnly, listeningController.getAdminSection);
router.post('/listening/sections', auth, teacherOnly, listeningController.createAdminSection);
router.put('/listening/sections/:id', auth, teacherOnly, listeningController.updateAdminSection);
router.delete('/listening/sections/:id', auth, teacherOnly, listeningController.hideAdminSection);
router.delete('/listening/sections/:id/permanent', auth, teacherOnly, listeningController.deleteAdminSectionPermanent);
router.post('/listening/sections/:id/audio', auth, teacherOnly, upload.single('audio'), listeningController.uploadSectionAudio);

// POST /api/admin/listening/assemble – tạo ListeningTest từ 4 ListeningSection
router.post('/listening/assemble', auth, teacherOnly, listeningController.assembleTest);

module.exports = router;
