const mongoose = require('mongoose');

// One row per (blocker -> blocked) direction. Blocking is one-sided by
// design (A can block B without B knowing), but message-sending checks
// both directions so either side blocking the other stops the thread.
const BlockSchema = new mongoose.Schema({
  blockerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blockedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

BlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
// Peer-message send checks "has either of us blocked the other" both ways.
BlockSchema.index({ blockedId: 1, blockerId: 1 });

module.exports = mongoose.model('Block', BlockSchema);
