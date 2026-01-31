const mongoose = require('mongoose');

const WritingSchema = new mongoose.Schema({
  taskType:String,
  prompt:String,
  sampleAnswer:String
});

module.exports = mongoose.model("WritingTask",WritingSchema);
