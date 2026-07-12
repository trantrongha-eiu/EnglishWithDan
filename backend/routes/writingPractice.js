const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const writingPracticeController = require('../controllers/writingPractice.controller');

// GET /api/writing-practice/exercises
router.get('/exercises', auth, writingPracticeController.listExercises);

// GET /api/writing-practice/test-questions
router.get('/test-questions', auth, writingPracticeController.getTestQuestions);

// GET /api/writing-practice/meta
router.get('/meta', writingPracticeController.getMeta);

// GET /api/writing-practice/topics
router.get('/topics', writingPracticeController.listTopics);

// POST /api/writing-practice/check
router.post('/check', auth, writingPracticeController.checkAnswer);

// POST /api/writing-practice/check-test
router.post('/check-test', auth, writingPracticeController.checkTest);

// POST /api/writing-practice/save-batch
router.post('/save-batch', auth, writingPracticeController.saveBatch);

// POST /api/writing-practice/save
router.post('/save', auth, writingPracticeController.saveSingle);

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
