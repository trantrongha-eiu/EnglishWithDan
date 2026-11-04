const mongoose = require('mongoose');

// "Mời bạn viết cùng" on the Task 2 writer (task2-practice.html compose
// screen): a small group of students writing the SAME lesson topic, each in
// their own essay (Task2LessonWork stays per-student), who see each other's
// text live so they can check one another's work. The text here is only a
// live mirror — the real essay is still saved to Task2LessonWork — so the
// whole room expires a few hours after its last activity.
const sectionsSchema = new mongoose.Schema({
  intro:      { type: String, default: '' },
  body1:      { type: String, default: '' },
  body2:      { type: String, default: '' },
  conclusion: { type: String, default: '' }
}, { _id: false });

const memberSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, default: '' },
  avatar:    { type: String, default: '' },
  // invited → joined | declined; joined → left. A declined/left member can
  // be invited again.
  status:    { type: String, enum: ['invited', 'joined', 'declined', 'left'], default: 'invited' },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  invitedAt: { type: Date, default: null },
  joinedAt:  { type: Date, default: null },
  sections:  { type: sectionsSchema, default: () => ({}) },
  textAt:    { type: Date, default: null },   // last time this member's text changed
  seenAt:    { type: Date, default: null }    // last poll from the writer screen (presence)
}, { _id: false });

const task2CoWriteRoomSchema = new mongoose.Schema({
  topicId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Task2Topic', required: true },
  hostId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:   [memberSchema],
  // Bumped on every change a client must re-render for (text, membership),
  // so the 2-3s poll can answer "nothing new" without sending the text.
  rev:       { type: Number, default: 1 },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

task2CoWriteRoomSchema.index({ 'members.userId': 1, topicId: 1 });
task2CoWriteRoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Task2CoWriteRoom', task2CoWriteRoomSchema);
