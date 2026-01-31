const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
  title:String,
  passage:String,
  questions:[{
    question:String,
    options:[String],
    correctAnswer:String
  }]
});

module.exports = mongoose.model("ReadingTest",ReadingSchema);
