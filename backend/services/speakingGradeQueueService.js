'use strict';

/**
 * speakingGradeQueueService — "AI đang xử lý, điểm sẽ gửi sau".
 *
 * When grading fails at submit time (see speaking.controller.analyze), the
 * pending SpeakingAttempt is handed to this queue instead of being marked
 * as an error: the student keeps practising, and processDueJobs() (run every
 * minute by cron/speakingGradeQueue.js) retries with backoff. On success the
 * attempt is finalized exactly like a live grade (streak/badges included)
 * and the student gets an inbox message with the band; after MAX_TRIES it
 * is marked 'error' (the History tab's "Thử chấm lại" still works) and the
 * student is told so.
 */
const SpeakingGradeJob = require('../models/SpeakingGradeJob');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const Message = require('../models/Message');
const User = require('../models/User');
const speakingService = require('./speakingService');
const logger = require('../utils/logger');

// Minutes to wait before try N+1 (index = tries already made). Short at
// first — a Gemini 503 overload usually clears within minutes.
const BACKOFF_MIN = [1, 2, 5, 10, 20, 30, 60, 120];
const MAX_TRIES = BACKOFF_MIN.length;
const BATCH = 5;

let isRunning = false;
let senderCache = null;

// Inbox messages need a real sender — the first admin account, cached.
async function systemSender() {
  if (senderCache) return senderCache;
  const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 }).select('_id username').lean();
  if (admin) senderCache = { _id: admin._id, name: 'EnglishWithDan' };
  return senderCache;
}

async function notify(userId, subject, body) {
  try {
    const sender = await systemSender();
    if (!sender) return;
    await Message.create({ fromId: sender._id, fromName: sender.name, toId: userId, subject, body, type: 'personal' });
  } catch (err) {
    logger.error('speaking-queue', 'notify failed', { userId: String(userId), errorMessage: err.message });
  }
}

/**
 * Queue a pending attempt for a later grade. `audio` is the multer file
 * ({ buffer, mimetype }) or null. Never throws — returns true when queued.
 */
async function enqueue(attemptId, { userId, questionText, transcript, part, durationSec, audio }) {
  try {
    await SpeakingGradeJob.create({
      attemptId, userId,
      questionText: questionText || '',
      transcript: transcript || '',
      part: Number(part) || 1,
      durationSec: Number(durationSec) || 0,
      audio: audio && audio.buffer && audio.buffer.length ? audio.buffer : undefined,
      audioMimeType: (audio && audio.mimetype) || '',
      nextRunAt: new Date(Date.now() + BACKOFF_MIN[0] * 60 * 1000),
    });
    // Keeps attemptTimeoutSweep from flipping it to 'error' while it waits.
    await SpeakingAttempt.updateOne({ _id: attemptId }, { $set: { gradingQueued: true } });
    return true;
  } catch (err) {
    logger.error('speaking-queue', 'enqueue failed', { attemptId: String(attemptId), errorMessage: err.message });
    return false;
  }
}

function shortQuestion(q) {
  const s = String(q || '').replace(/\s+/g, ' ').trim();
  return s.length > 90 ? s.slice(0, 89) + '…' : s;
}

async function runJob(job) {
  const audio = job.audio && job.audio.length
    ? speakingService.normalizeAudioForGemini(job.audio, job.audioMimeType)
    : null;
  let feedback;
  try {
    feedback = await speakingService.gradeSpeaking(job.questionText, job.transcript, job.part, audio, job.durationSec);
  } catch (err) {
    // Same fallback as the live route: if the audio part is what tripped
    // grading, try transcript-only before counting this as a failed try.
    if (!audio || !String(job.transcript || '').trim() || err.isOverloaded) throw err;
    feedback = await speakingService.gradeSpeaking(job.questionText, job.transcript, job.part, null, job.durationSec);
  }

  const q = shortQuestion(job.questionText);
  if (feedback.noGenuineAnswer) {
    await speakingService.discardPendingAttempt(job.attemptId);
    await notify(job.userId, 'Speaking: không phát hiện câu trả lời',
      `AI đã nghe lại bài nói cho câu "${q}" nhưng không phát hiện được nội dung trả lời (có thể micro không thu được tiếng). Hãy kiểm tra micro và luyện lại câu này nhé.`);
    return;
  }

  const resolvedTranscript = String(job.transcript || '').trim() || String(feedback.transcript || '').trim();
  const user = await User.findById(job.userId);
  await speakingService.finalizeAttempt(job.attemptId, feedback, user, resolvedTranscript);
  await SpeakingAttempt.updateOne({ _id: job.attemptId }, { $set: { gradingQueued: false } });
  const band = feedback.overallBand != null ? Number(feedback.overallBand).toFixed(1) : '—';
  await notify(job.userId, `Đã có điểm Speaking: Band ${band}`,
    `✅ AI đã chấm xong câu "${q}".\n\n• Band tổng: ${band}${feedback.provisional ? ' (tạm tính — chưa chấm phát âm vì không có bản ghi âm)' : ''}\n`
    + `• Fluency & Coherence: ${feedback.fluency ?? '—'} · Lexical Resource: ${feedback.vocabulary ?? '—'} · Grammar: ${feedback.grammar ?? '—'} · Pronunciation: ${feedback.pronunciation ?? 'N/A'}\n\n`
    + 'Xem nhận xét chi tiết từng tiêu chí trong trang Speaking → Lịch sử.');
}

async function failJob(job, err) {
  const tries = (job.tries || 0) + 1;
  if (tries >= MAX_TRIES) {
    await speakingService.markAttemptError(job.attemptId);
    await SpeakingAttempt.updateOne({ _id: job.attemptId }, { $set: { gradingQueued: false } });
    await SpeakingGradeJob.deleteOne({ _id: job._id });
    await notify(job.userId, 'Speaking: chưa chấm được bài nói',
      `AI vẫn chưa chấm được câu "${shortQuestion(job.questionText)}" sau nhiều lần thử. Vào Speaking → Lịch sử và bấm "Thử chấm lại" khi rảnh nhé.`);
    logger.error('speaking-queue', 'gave up after max tries', { attemptId: String(job.attemptId), errorMessage: err.message });
    return;
  }
  await SpeakingGradeJob.updateOne({ _id: job._id }, { $set: {
    tries,
    lastError: String(err.message || 'error').slice(0, 300),
    nextRunAt: new Date(Date.now() + BACKOFF_MIN[tries] * 60 * 1000),
  } });
}

/**
 * Grades up to BATCH due jobs, one at a time. Stops early on an overload
 * (the rest would fail the same way) — they simply stay due for the next
 * tick. Guarded against overlapping ticks.
 */
async function processDueJobs() {
  if (isRunning) return { skipped: true };
  isRunning = true;
  let graded = 0, failed = 0;
  try {
    const jobs = await SpeakingGradeJob.find({ nextRunAt: { $lte: new Date() } }).sort({ nextRunAt: 1 }).limit(BATCH);
    for (const job of jobs) {
      const attempt = await SpeakingAttempt.findById(job.attemptId).select('status').lean();
      if (!attempt || attempt.status !== 'pending') { // deleted, or re-graded some other way meanwhile
        await SpeakingGradeJob.deleteOne({ _id: job._id });
        continue;
      }
      try {
        await runJob(job);
        await SpeakingGradeJob.deleteOne({ _id: job._id });
        graded++;
      } catch (err) {
        failed++;
        await failJob(job, err);
        if (err.isOverloaded) break;
      }
    }
  } catch (err) {
    logger.error('speaking-queue', 'run error', { errorMessage: err.message });
  } finally {
    isRunning = false;
  }
  return { graded, failed };
}

module.exports = { enqueue, processDueJobs, MAX_TRIES, BACKOFF_MIN };
