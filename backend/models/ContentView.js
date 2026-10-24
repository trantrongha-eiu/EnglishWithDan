const mongoose = require('mongoose');

// "The student opened this" — for homework items whose only requirement is
// viewing the content (shadowing videos, Tips lectures, Vocab/Paraphrase
// units). Shadowing is recorded server-side when the lesson is fetched; the
// others are a beacon from the page (POST /api/assignments/viewed).
// resourceType matches Assignment.resources[].resourceType.
const ContentViewSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resourceType: { type: String, required: true },
  resourceId:   { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

ContentViewSchema.index({ userId: 1, resourceType: 1, resourceId: 1, createdAt: -1 });
// Same 3-month retention as every other practice-history collection.
ContentViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ContentView', ContentViewSchema);
