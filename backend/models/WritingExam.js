const mongoose = require('mongoose');

const WritingExamSchema = new mongoose.Schema({
  name: { type: String, required: true },  // "Academic Writing Test 1"

  task1: {
    imageUrl:     { type: String, default: '' },         // Cloudinary / any image URL
    instructions: { type: String, default: 'You should spend about 20 minutes on this task. Write at least 150 words.' },
    prompt:       { type: String, default: '' }          // description / chart description
  },
  task2: {
    instructions: { type: String, default: 'You should spend about 40 minutes on this task. Write at least 250 words.' },
    prompt:       { type: String, default: '' }          // essay question
  },

  // "Đề tự ghép" (admin Lớp học → Tạo bài tập → Full đề Writing): the teacher
  // pairs ONE Task 1 + ONE Task 2 from the practice banks, and every student
  // who opens this exam gets exactly those two prompts. Without them (every
  // older exam) writingService.startExam still draws a random pair per run.
  task1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'WritingTask1', default: null },
  task2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'WritingTask2', default: null },
  // Custom pairs are homework-only: never the no-examId default exam and
  // never drawn at random for a mock test (see writingService/mockTestService).
  isCustom:  { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  duration: { type: Number, default: 60 },   // minutes
  isActive:  { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('WritingExam', WritingExamSchema);
