const mongoose = require("mongoose");

const PracticeResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  unitNumber: {
    type: Number,
    required: true
  },
  total: Number,
  correct: Number,
  wrong: Number,
  percentage: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("PracticeResult", PracticeResultSchema);
