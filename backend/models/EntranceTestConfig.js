const mongoose = require('mongoose');

/**
 * EntranceTestConfig — which fixed content currently makes up the IELTS
 * Entrance Test ("Test đầu vào"). Exactly one document should have
 * isActive:true at a time (enforced in entranceTestService.updateConfig,
 * not by a unique index — a brief two-active window during a save is
 * harmless since callers always read the newest active one).
 *
 * Deliberately references content by direct ID, not by re-running the
 * normal student-facing "published/active" list queries — an admin
 * unpublishing readingPassageId/listeningSectionId/writingTask1Id from the
 * normal Reading/Listening/Writing catalogue must NOT break the Entrance
 * Test. entranceTestService resolves these IDs with Passage.findById /
 * ListeningSection.findById / WritingTask1.findById directly, skipping the
 * `isActive` filter those models' normal list/start queries apply — the
 * same "attempt review bypasses isActive" convention already used by
 * readingService.getAttemptReview / listeningService.getHistoryDetail.
 *
 * Grammar has no equivalent "one test" content unit to reference by ID —
 * see EntranceGrammarQuestion.js — so grammarSetKey just selects which
 * tagged group of questions in that bank is currently "the" 25-question
 * Grammar section.
 */
const EntranceTestConfigSchema = new mongoose.Schema({
  readingPassageId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Passage' },
  listeningSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ListeningSection' },
  writingTask1Id:      { type: mongoose.Schema.Types.ObjectId, ref: 'WritingTask1' },
  grammarSetKey:       { type: String, default: 'default' },
  isActive:            { type: Boolean, default: true },
  updatedBy:           { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

EntranceTestConfigSchema.index({ isActive: 1, updatedAt: -1 });

module.exports = mongoose.model('EntranceTestConfig', EntranceTestConfigSchema);
