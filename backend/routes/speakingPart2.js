const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const ctrl    = require('../controllers/speakingPart2.controller');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const multer  = require('multer');

// One short sentence per upload (a shadowing take) — never stored, only
// transcribed. 2 MB is ~1 min of opus/aac, far above one sentence.
const clipUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const withClip = (req, res, next) => clipUpload.single('audio')(req, res, (err) => {
  if (err) return res.status(413).json({ success: false, message: 'Bản ghi âm quá dài — hãy nói từng câu một.' });
  next();
});
// A whole frame is ~30 sentences with retries — generous, but caps loops.
const transcribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req.ip),
  message: { success: false, message: 'Bạn nhại hơi nhanh quá — nghỉ vài phút rồi thử lại nhé.' },
  skip: (req) => req.user?.role === 'admin',
});

// Speaking Part 2 · 7 câu chuyện gốc (speaking-part2.html).
// GET /content — full story text for Premium / staff / trial; everyone else
// gets the story list only ({ locked: true }) so the page can show what's
// inside next to the upgrade button.
router.get('/content', auth, ctrl.getContent);

// GET /full/:storyId — the story word for word as in the framework docx
// ("📄 Xem full bài mẫu"), Premium like the content itself.
router.get('/full/:storyId', auth, requirePremium(), ctrl.getFull);

// GET /progress — { [storyId]: { read, ok, speak, best, steps, completedAt } }
router.get('/progress', auth, requirePremium(), ctrl.getProgress);

// PUT /progress/:storyId — merge this browser's progress (see
// speakingPart2Service.saveProgress); drives the `speaking_part2` homework.
router.put('/progress/:storyId', auth, requirePremium(), ctrl.saveProgress);

// POST /transcribe — multipart 'audio' → { transcript } (Groq Whisper).
// Shadowing (🎙️ Nhại) on devices whose browser speech-to-text can't hear
// the student (iPhone Safari / Zalo / in-app browsers, no SpeechRecognition)
// and as a fallback when it returned nothing although the take has voice.
router.post('/transcribe', auth, requirePremium(), transcribeLimiter, withClip, ctrl.transcribe);

module.exports = router;
