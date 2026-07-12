const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const task1PracticeController = require('../controllers/task1Practice.controller');

// GET /api/task1/meta – số câu theo level + skillType (không cần auth)
router.get('/meta', task1PracticeController.getMeta);

// GET /api/task1/exercises
router.get('/exercises', auth, task1PracticeController.listExercises);

// POST /api/task1/check
router.post('/check', auth, task1PracticeController.checkAnswer);

// GET /api/task1/test-questions
router.get('/test-questions', auth, task1PracticeController.getTestQuestions);

// POST /api/task1/check-test
router.post('/check-test', auth, task1PracticeController.checkTest);

// POST /api/task1/save-batch  (auth optional — saves if logged in)
router.post('/save-batch', auth, task1PracticeController.saveBatch);

// GET /api/task1/progress  (auth required)
router.get('/progress', auth, task1PracticeController.getProgress);

// GET /api/task1/history  (auth required)
router.get('/history', auth, task1PracticeController.getHistory);

module.exports = router;
