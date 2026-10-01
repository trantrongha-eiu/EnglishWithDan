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
const {
  PROCTOR_TYPES, SHOT_CAP, SHOT_WINDOW_MS, SHOT_MAX_BYTES, SHOT_DATA_URL,
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

  const uploaded = await cloudinaryService.uploadImage(image, { folder: 'proctor-shots' });
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

module.exports = { saveShot, CONTEXTS };
