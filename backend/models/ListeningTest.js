const mongoose = require('mongoose');

const ListeningSchema = new mongoose.Schema({
  title:String,
  audioUrl:String,
  questions:[{
    question:String,
    options:[String],
    correctAnswer:String
  }]
});

module.exports = mongoose.model("ListeningTest",ListeningSchema);
