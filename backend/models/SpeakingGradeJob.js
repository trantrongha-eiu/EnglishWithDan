const mongoose = require('mongoose');

/**
 * SpeakingGradeJob — a Speaking answer whose AI grading failed at submit
 * time (Gemini overloaded / timed out / returned an unusable analysis, and
 * the fallbacks failed too). Instead of an error, the student is told "AI
 * đang xử lý — điểm sẽ gửi sau" and can keep practising; the
 * speakingGradeQueue cron (cron/speakingGradeQueue.js) retries the job with
 * backoff, finalizes the SpeakingAttempt and sends the student an inbox
 * message with the band.
 *
 * The recording is kept here (not on the attempt) so a retry can still
 * grade Pronunciation from the real audio; the job — audio included — is
 * deleted as soon as it succeeds or gives up, and a TTL backstop removes
 * anything left behind.
 */
const SpeakingGradeJobSchema = new mongoose.Schema({
  attemptId:     { type: mongoose.Schema.Types.ObjectId, ref: 'SpeakingAttempt', required: true, unique: true },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionText:  { type: String, default: '' },
  transcript:    { type: String, default: '' },
  part:          { type: Number, default: 1 },
  durationSec:   { type: Number, default: 0 },
  audio:         { type: Buffer },
  audioMimeType: { type: String, default: '' },
  tries:         { type: Number, default: 0 },
  nextRunAt:     { type: Date, default: Date.now },
  lastError:     { type: String, default: '' },
}, { timestamps: true });

SpeakingGradeJobSchema.index({ nextRunAt: 1 });
// Backstop only — the worker deletes a job long before this (it gives up
// after MAX_TRIES, well under a day).
SpeakingGradeJobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2 * 24 * 60 * 60 });

module.exports = mongoose.model('SpeakingGradeJob', SpeakingGradeJobSchema);
