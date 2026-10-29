'use strict';

// Speaking practice recordings saved to the student's history.
//
// The recording that /api/speaking/analyze (and /mock-submit) receives is
// uploaded to R2 under speaking-recordings/ and its URL stored on the
// SpeakingAttempt (audioUrl), so History can replay it on any device — for
// the student and the teacher. Kept 3 months, the same as the attempt
// itself (SpeakingAttempt's 90-day TTL): the Mongo TTL can't delete the R2
// file, so a daily cron (cron/speakingRecordingCleanup.js) removes every
// recording older than RETENTION_DAYS.
//
// R2 only — there is no Cloudinary fallback (the account was emptied
// 2026-10-14). Without R2 (local dev, tests) nothing is uploaded and the
// student just doesn't get the cloud copy. Best-effort throughout: a failed
// upload never affects grading.
const SpeakingAttempt = require('../models/SpeakingAttempt');
const r2Service = require('./r2Service');
const logger = require('../utils/logger');

const FOLDER = 'speaking-recordings';
const RETENTION_DAYS = 90;
const AUDIO_EXT = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav' };

// Upload `file` (multer memory file) and attach it to the attempt.
// Returns the URL, or '' when nothing was saved. Never throws.
async function save(attemptId, file) {
  if (!attemptId || !file || !file.buffer || !file.buffer.length) return '';
  if (!r2Service.isConfigured()) return '';
  try {
    const type = String(file.mimetype || 'audio/webm').split(';')[0].toLowerCase();
    const name = `sp_${attemptId}_${Date.now()}`;
    const r = await r2Service.uploadAudio(file.buffer, {
      folder: FOLDER, public_id: name, ext: AUDIO_EXT[type] || 'webm', contentType: type,
    });
    const url = r.secure_url;
    const updated = await SpeakingAttempt.findByIdAndUpdate(attemptId, { audioUrl: url }).select('_id').lean();
    if (!updated) { // attempt discarded (no genuine answer) while uploading
      await remove(url);
      return '';
    }
    return url;
  } catch (e) {
    logger.error('speaking', 'recording upload failed', { attemptId: String(attemptId), errorMessage: e.message });
    return '';
  }
}

// Delete one stored recording by its URL. Never throws.
async function remove(audioUrl) {
  const key = r2Service.keyOf(audioUrl);
  if (!key || !r2Service.isConfigured()) return 0;
  try {
    return await r2Service.deleteObjects([key]);
  } catch (e) {
    logger.error('speaking', 'recording delete failed', { key, errorMessage: e.message });
    return 0;
  }
}

// Daily sweep: delete every recording older than RETENTION_DAYS (+1 day of
// slack so a file is never removed before its attempt expires).
async function purgeOld() {
  if (!r2Service.isConfigured()) return { deleted: 0 };
  const keys = await r2Service.listOldKeys(FOLDER, RETENTION_DAYS + 1);
  const deleted = keys.length ? await r2Service.deleteObjects(keys) : 0;
  return { deleted };
}

module.exports = { save, remove, purgeOld, FOLDER, RETENTION_DAYS };
