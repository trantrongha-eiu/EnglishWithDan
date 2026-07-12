'use strict';

// backend/routes/admin/index.js
//
// Was a single 2,700-line backend/routes/admin.js (125 routes across 27
// hand-marked sections). Split into one file per domain, listed below in
// the same order the sections originally appeared. Every route's path,
// HTTP method, and middleware chain is unchanged — only the file each
// lives in moved. server.js still does exactly one thing:
//   app.use('/api/admin', require('./routes/admin'))
// which now resolves here instead of to the old single file.

const express = require('express');
const router = express.Router();

router.use(require('./passages'));         // Passages, Reading Tests, Listening Tests dropdown
router.use(require('./accessKeys'));       // Access Keys
router.use(require('./stats'));            // Stats, db-status, history, recent-attempts, listening-history
router.use(require('./writingContent'));   // Writing Tests dropdown, Writing Exams, Writing History, Task1/Task2 pools
router.use(require('./speaking'));         // Speaking Questions, Materials, History
router.use(require('./writingSamples'));   // Writing Samples (PDF)
router.use(require('./users'));            // User Management, Online Users
router.use(require('./courses'));          // Courses
router.use(require('./attempts'));         // Delete Exam Attempts
router.use(require('./writingGrading'));   // Writing AI Grading
router.use(require('./vocabAnalytics'));   // Vocab Student Analytics
router.use(require('./writingPracticeWP')); // Writing Practice (WP) Topics/Exercises/Attempts
router.use(require('./task1Exercises'));   // Task 1 Exercises CRUD
router.use(require('./task2Topics'));      // Task 2 Topics CRUD + maintenance endpoints
router.use(require('./task2Templates'));   // Task 2 Templates CRUD
router.use(require('./messages'));         // Messages
router.use(require('./billing'));          // Plan Management, Upgrade Requests

module.exports = router;
