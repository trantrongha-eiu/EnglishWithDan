'use strict';

/**
 * proctorShotService — stores the screenshot a proctored page takes of the
 * student's shared screen ~1s after a strike (they switched tab / app), so a
 * teacher can see what they switched to. One endpoint for all three
 * proctored flows: Test Simulation, the Full Mock Test, the Entrance Test.
 *
 * The page can only see the screen because the student shared it (mandatory
 * on desktop — see frontend/js/shared/proctor-capture.js). The image goes to
 * Cloudinary; the attempt keeps { url, type, at } in proctor.shots.
 */
const mongoose = require('mongoose');
const { ValidationError, NotFoundError, AppError } = require('../errors/AppError');
const MockTestAttempt = require('../models/MockTestAttempt');
const EntranceTestAttempt = require('../models/EntranceTestAttempt');
const examSimulationService = require('./examSimulationService');
const cloudinaryService = require('./cloudinaryService');
const TestAttempt = require('../models/TestAttempt');
const ReadingPracticeAttempt = require('../models/ReadingPracticeAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');
const WritingAttempt = require('../models/WritingAttempt');
const logger = require('../utils/logger');
const {
  PROCTOR_TYPES, SHOT_CAP, SHOT_WINDOW_MS, SHOT_MAX_BYTES, SHOT_DATA_URL,
  SHOT_RETENTION_DAYS, SHOT_FOLDER,
} = require('./proctorPolicy');

const CONTEXTS = ['simulation', 'mock', 'entrance'];

function targetFor({ context, skill, attemptType, attemptId }, userId) {
  if (!CONTEXTS.includes(context)) throw new ValidationError('context không hợp lệ');
  if (!mongoose.isValidObjectId(attemptId)) throw new ValidationError('attemptId không hợp lệ');
  if (context === 'simulation') {
    return { Model: examSimulationService.modelFor(skill, attemptType), filter: { _id: attemptId, userId, mode: 'simulation' } };
  }
  if (context === 'mock') return { Model: MockTestAttempt, filter: { _id: attemptId, userId } };
  return { Model: EntranceTestAttempt, filter: { _id: attemptId, userId } };
}

async function saveShot(userId, body = {}) {
  const { type, image, skill } = body;
  if (!PROCTOR_TYPES.includes(type)) throw new ValidationError('Loại vi phạm không hợp lệ');
  if (typeof image !== 'string' || !SHOT_DATA_URL.test(image)) throw new ValidationError('Ảnh không hợp lệ');
  const bytes = Math.floor((image.length - image.indexOf(',') - 1) * 3 / 4);
  if (bytes > SHOT_MAX_BYTES) throw new AppError('Ảnh quá lớn', 413);

  const { Model, filter } = targetFor(body, userId);
  const doc = await Model.findOne(filter).select('proctor.events proctor.shots').lean();
  if (!doc) throw new NotFoundError('Không tìm thấy bài làm');

  // Only right after a recorded strike, and at most one shot per strike
  // (+1 slack for a share-stopped race) — never a free image host.
  const events = (doc.proctor && doc.proctor.events) || [];
  const shots = (doc.proctor && doc.proctor.shots) || [];
  const last = events[events.length - 1];
  if (!last || Date.now() - new Date(last.at).getTime() > SHOT_WINDOW_MS) {
    throw new AppError('Không có vi phạm gần đây để đính kèm ảnh', 409);
  }
  if (shots.length >= SHOT_CAP || shots.length > events.length) {
    throw new AppError('Đã đủ ảnh cho lượt làm bài này', 409);
  }

  const uploaded = await cloudinaryService.uploadImage(image, { folder: SHOT_FOLDER });
  const shot = {
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
    type,
    skill: typeof skill === 'string' ? skill.slice(0, 20) : undefined,
    at: new Date(),
  };
  // $push (not load-modify-save): the violation endpoint saves the same
  // doc concurrently, and this must neither lose nor clobber its write.
  await Model.updateOne({ _id: doc._id }, { $push: { 'proctor.shots': { $each: [shot], $slice: -SHOT_CAP } } });
  return { url: shot.url };
}

// Every model whose proctor sub-doc can hold shots.
const SHOT_MODELS = [
  TestAttempt, ReadingPracticeAttempt, ListeningAttempt, ListeningPracticeAttempt,
  WritingAttempt, MockTestAttempt, EntranceTestAttempt,
];
const PURGE_BATCH = 200;

// Deletes every screenshot older than SHOT_RETENTION_DAYS: the Cloudinary
// image first, then its entry on the attempt. Then a folder sweep by upload
// date catches images whose attempt no longer exists (admin delete, the
// 3-month practice-history TTL). Returns { shots, attempts, orphans }.
async function purgeOldShots({ now = Date.now(), maxRounds = 50 } = {}) {
  const cutoff = new Date(now - SHOT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const old = { 'proctor.shots': { $elemMatch: { at: { $lt: cutoff } } } };
  let shots = 0, attempts = 0, orphans = 0;

  for (const Model of SHOT_MODELS) {
    for (let round = 0; round < maxRounds; round++) {
      const docs = await Model.find(old).select('_id proctor.shots').limit(PURGE_BATCH).lean();
      if (!docs.length) break;
      const publicIds = [];
      docs.forEach(d => (d.proctor.shots || []).forEach(s => {
        if (new Date(s.at) < cutoff && s.publicId) publicIds.push(s.publicId);
      }));
      // An image that fails to delete here is caught by the folder sweep below.
      await cloudinaryService.destroyAssets(publicIds).catch(e =>
        logger.error('cron', 'ProctorShotCleanup: Cloudinary delete failed', { errorMessage: e.message }));
      for (const d of docs) {
        // Scoped to this one attempt and only its expired shots.
        await Model.updateOne({ _id: d._id }, { $pull: { 'proctor.shots': { at: { $lt: cutoff } } } });
      }
      shots += publicIds.length;
      attempts += docs.length;
      if (docs.length < PURGE_BATCH) break;
    }
  }

  try {
    for (let round = 0; round < maxRounds; round++) {
      const ids = await cloudinaryService.listOldImages(SHOT_FOLDER, SHOT_RETENTION_DAYS + 1);
      if (!ids.length) break;
      orphans += await cloudinaryService.destroyAssets(ids);
      if (ids.length < 100) break;
    }
  } catch (e) {
    logger.error('cron', 'ProctorShotCleanup: folder sweep failed', { errorMessage: e.message });
  }
  return { shots, attempts, orphans };
}

module.exports = { saveShot, purgeOldShots, CONTEXTS };
