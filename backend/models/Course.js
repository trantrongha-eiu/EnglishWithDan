const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  subtitle:    { type: String, default: '' },          // "Dành cho: ..."
  description: { type: String, default: '' },
  price:       { type: String, default: 'Liên hệ tư vấn' },
  imageUrl:    { type: String, default: '' },          // img/course-xxx.jpg or Cloudinary URL
  placeholder: { type: String, default: '📚' },       // emoji fallback
  category:    { type: String, enum: ['ielts', 'speaking', 'comm', 'speaking ielts'], default: 'ielts' },
  level:       { type: String, default: '' },          // "Mất gốc", "Nâng cao"...
  levelColor:  { type: String, enum: ['red','blue','green','purple'], default: 'blue' },
  duration:    { type: String, default: '' },          // "6–8 tháng"
  classSize:   { type: String, default: '' },          // "Nhóm ≤ 8 người"
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
