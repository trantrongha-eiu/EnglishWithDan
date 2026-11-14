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

// Upload `file` (multer memory file) under speaking-recordings/ without
// attaching it anywhere — the caller stores the URL. Used by the course
// speaking exercises (WT1Submission.audioUrl / itemResults[].audioUrl) so a
// teacher can listen from the admin review queue; same folder, so the same
// 90-day purge covers them. Returns the URL, or '' when nothing was saved.
// Never throws.
async function upload(file, tag) {
  if (!file || !file.buffer || !file.buffer.length) return '';
  if (!r2Service.isConfigured()) return '';
  try {
    const type = String(file.mimetype || 'audio/webm').split(';')[0].toLowerCase();
    const name = `sp_${tag || 'rec'}_${Date.now()}`;
    const r = await r2Service.uploadAudio(file.buffer, {
      folder: FOLDER, public_id: name, ext: AUDIO_EXT[type] || 'webm', contentType: type,
    });
    return r.secure_url || '';
  } catch (e) {
    logger.error('speaking', 'recording upload failed', { tag: String(tag || ''), errorMessage: e.message });
    return '';
  }
}

// Upload `file` (multer memory file) and attach it to the attempt.
// Returns the URL, or '' when nothing was saved. Never throws.
async function save(attemptId, file) {
  if (!attemptId || !file || !file.buffer || !file.buffer.length) return '';
  if (!r2Service.isConfigured()) return '';
  try {
    const url = await upload(file, attemptId);
    if (!url) return '';
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

// Download a saved recording back as a multer-like { buffer, mimetype } so
// "Thử chấm lại" can grade from what the student really said — an answer
// recorded on a browser with no speech-to-text has no transcript at all,
// only this file. null when there is none / it can't be read. Never throws.
const EXT_TYPE = { webm: 'audio/webm', ogg: 'audio/ogg', m4a: 'audio/mp4', mp3: 'audio/mpeg', wav: 'audio/wav' };
const MAX_FETCH_BYTES = 12 * 1024 * 1024; // same cap as the /analyze upload
async function fetchForGrading(audioUrl) {
  if (!audioUrl || !/^https?:\/\//i.test(audioUrl)) return null;
  try {
    const res = await fetch(audioUrl, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (!buffer.length || buffer.length > MAX_FETCH_BYTES) return null;
    const ext = (String(audioUrl).split('?')[0].match(/\.([a-z0-9]+)$/i) || [])[1] || '';
    const headerType = String(res.headers.get('content-type') || '').split(';')[0].toLowerCase();
    const mimetype = EXT_TYPE[ext.toLowerCase()] || (headerType.startsWith('audio/') ? headerType : 'audio/webm');
    return { buffer, mimetype };
  } catch (e) {
    logger.error('speaking', 'recording fetch failed', { errorMessage: e.message });
    return null;
  }
}

// Per-question recordings of a multi-question run (POST /api/speaking/clip)
// are uploaded while the student is still answering, then listed on the
// attempt by /analyze. Tag = u<userId>_q<index>, so cleanClips() can check a
// client-sent URL really is one of THIS student's uploads — nobody can attach
// someone else's file (or an arbitrary URL) to their attempt.
const MAX_CLIPS = 40;
function clipTag(userId, index) {
  return `u${userId}_q${Math.max(0, Math.min(MAX_CLIPS, Number(index) || 0))}`;
}
function cleanClips(userId, raw) {
  let list = raw;
  if (typeof list === 'string') { try { list = JSON.parse(list); } catch { return []; } }
  if (!Array.isArray(list)) return [];
  const prefix = `${FOLDER}/sp_u${userId}_`;
  const seen = new Set();
  const out = [];
  for (const c of list.slice(0, MAX_CLIPS)) {
    if (!c || typeof c.url !== 'string') continue;
    const key = r2Service.keyOf(c.url);
    if (!key || !key.startsWith(prefix) || seen.has(c.url)) continue;
    seen.add(c.url);
    out.push({
      index: Math.max(0, Number(c.index) || 0),
      questionId: String(c.questionId || '').slice(0, 40),
      question: String(c.question || '').slice(0, 1000),
      url: c.url,
    });
  }
  return out.sort((a, b) => a.index - b.index);
}

// Daily sweep: delete every recording older than RETENTION_DAYS (+1 day of
// slack so a file is never removed before its attempt expires).
async function purgeOld() {
  if (!r2Service.isConfigured()) return { deleted: 0 };
  const keys = await r2Service.listOldKeys(FOLDER, RETENTION_DAYS + 1);
  const deleted = keys.length ? await r2Service.deleteObjects(keys) : 0;
  return { deleted };
}

module.exports = { upload, save, remove, fetchForGrading, purgeOld, clipTag, cleanClips, FOLDER, RETENTION_DAYS };
