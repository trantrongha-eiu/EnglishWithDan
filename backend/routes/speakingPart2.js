const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const ctrl    = require('../controllers/speakingPart2.controller');

// Speaking Part 2 · 7 câu chuyện gốc (speaking-part2.html).
// GET /content — full story text for Premium / staff / trial; everyone else
// gets the story list only ({ locked: true }) so the page can show what's
// inside next to the upgrade button.
router.get('/content', auth, ctrl.getContent);

// GET /progress — { [storyId]: { read, ok, speak, best, steps, completedAt } }
router.get('/progress', auth, requirePremium(), ctrl.getProgress);

// PUT /progress/:storyId — merge this browser's progress (see
// speakingPart2Service.saveProgress); drives the `speaking_part2` homework.
router.put('/progress/:storyId', auth, requirePremium(), ctrl.saveProgress);

module.exports = router;
