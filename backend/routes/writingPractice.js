const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const writingPracticeController = require('../controllers/writingPractice.controller');

const premiumOnly = requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.');

// GET /api/writing-practice/exercises
router.get('/exercises', auth, premiumOnly, writingPracticeController.listExercises);

// GET /api/writing-practice/test-questions
router.get('/test-questions', auth, premiumOnly, writingPracticeController.getTestQuestions);

// GET /api/writing-practice/meta
router.get('/meta', writingPracticeController.getMeta);

// GET /api/writing-practice/topics
router.get('/topics', writingPracticeController.listTopics);

// POST /api/writing-practice/check
router.post('/check', auth, premiumOnly, writingPracticeController.checkAnswer);

// POST /api/writing-practice/check-test
router.post('/check-test', auth, premiumOnly, writingPracticeController.checkTest);

// POST /api/writing-practice/save-batch
router.post('/save-batch', auth, premiumOnly, writingPracticeController.saveBatch);

// POST /api/writing-practice/save
router.post('/save', auth, premiumOnly, writingPracticeController.saveSingle);

// GET /api/writing-practice/history
router.get('/history', auth, writingPracticeController.getHistory);

// GET /api/writing-practice/my-stats
router.get('/my-stats', auth, writingPracticeController.getMyStats);

// ══════════════════════════════════════════════════════════════
//  ADMIN – bulk add / soft delete
// ══════════════════════════════════════════════════════════════
router.post('/admin/exercises', auth, writingPracticeController.adminBulkAddExercises);
router.delete('/admin/exercises/:id', auth, writingPracticeController.adminSoftDeleteExercise);

module.exports = router;
