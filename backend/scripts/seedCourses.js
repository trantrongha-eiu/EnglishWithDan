/**
 * Seed script for Course collection.
 * Imports the 6 courses that were previously hardcoded in frontend/index.html
 * and frontend/courses.html's STATIC_COURSES fallback array, so the admin
 * Courses page (admin-src/src/pages/Courses.jsx) has real data to manage
 * instead of an empty list, and both public pages can read from /api/courses
 * instead of their static fallbacks.
 * Run: node backend/scripts/seedCourses.js
 */

const courses = [
  {
    title: 'IELTS Mất Gốc → 6.0+',
    subtitle: 'Học viên chưa có nền tảng',
    description: 'Bắt đầu từ phát âm, ngữ pháp cơ bản đến 4 kỹ năng IELTS. Lộ trình 6–8 tháng để đạt band 6.0 từ con số 0.',
    price: 'Liên hệ tư vấn',
    imageUrl: 'img/course-starter.jpg',
    placeholder: '🌱',
    category: 'ielts',
    level: 'Mất gốc',
    levelColor: 'red',
    duration: '6–8 tháng',
    classSize: 'Nhóm ≤ 8 người',
    isActive: true,
    order: 0,
  },
  {
    title: 'IELTS 3.0 → 6.0+',
    subtitle: 'Band 3.0–4.5',
    description: 'Củng cố ngữ pháp, mở rộng từ vựng học thuật, luyện kỹ năng thi theo chuẩn IDP/BC. Mục tiêu band 6.0–6.5.',
    price: 'Liên hệ tư vấn',
    imageUrl: 'img/course-3to6.jpg',
    placeholder: '📈',
    category: 'ielts',
    level: 'Cơ bản → Nâng cao',
    levelColor: 'blue',
    duration: '4–5 tháng',
    classSize: 'Nhóm ≤ 8 người',
    isActive: true,
    order: 1,
  },
  {
    title: 'IELTS 6.0 → 7.0+',
    subtitle: 'Band 5.5–6.5',
    description: 'Chuyên sâu Writing Task 2, Speaking Band 7, kỹ thuật Skimming/Scanning cho Reading và dự đoán Listening. Mục tiêu 7.0–7.5.',
    price: 'Liên hệ tư vấn',
    imageUrl: 'img/course-6to7.jpg',
    placeholder: '🚀',
    category: 'ielts',
    level: 'Nâng cao',
    levelColor: 'green',
    duration: '3–4 tháng',
    classSize: '1–1 hoặc nhóm nhỏ',
    isActive: true,
    order: 2,
  },
  {
    title: 'IELTS Speaking Chuyên Sâu',
    subtitle: 'Học viên muốn đột phá Speaking',
    description: 'Phát âm chuẩn, fluency, từ vựng band 7+, chiến lược trả lời Part 1–3. Luyện mock test 1–1 với giáo viên.',
    price: '2.500.000đ / khóa',
    imageUrl: 'img/course-speaking.jpg',
    placeholder: '🎤',
    category: 'speaking ielts',
    level: 'Speaking chuyên sâu',
    levelColor: 'purple',
    duration: '6–8 tuần',
    classSize: '1–1 hoặc nhóm 4',
    isActive: true,
    order: 3,
  },
  {
    title: 'Giao Tiếp Tiếng Anh Cơ Bản',
    subtitle: 'Người mất gốc hoặc mới bắt đầu',
    description: 'Phát âm, hội thoại thực tế hàng ngày, tự tin giao tiếp với người nước ngoài. Không cần nền tảng trước.',
    price: '900.000đ / tháng',
    imageUrl: 'img/course-comm.jpg',
    placeholder: '💬',
    category: 'comm',
    level: 'Giao tiếp',
    levelColor: 'blue',
    duration: '3 tháng',
    classSize: 'Nhóm ≤ 10',
    isActive: true,
    order: 4,
  },
  {
    title: 'Tiếng Anh Giao Tiếp Văn Phòng',
    subtitle: 'Người đi làm, dân văn phòng',
    description: 'Email chuyên nghiệp, meeting, thuyết trình, đàm phán bằng tiếng Anh. Từ vựng Business English thực chiến.',
    price: 'Liên hệ tư vấn',
    imageUrl: 'img/course-business.jpg',
    placeholder: '💼',
    category: 'comm',
    level: 'Business',
    levelColor: 'green',
    duration: '2–3 tháng',
    classSize: 'Nhóm hoặc 1–1',
    isActive: true,
    order: 5,
  },
];

async function runSeed() {
  const Course = require('../models/Course');
  // Matched on title (the natural unique key here — same convention as the
  // hardcoded content it replaces) so re-running this script updates
  // existing rows instead of duplicating them.
  const ops = courses.map(c => ({
    replaceOne: { filter: { title: c.title }, replacement: c, upsert: true }
  }));
  const result = await Course.bulkWrite(ops);
  console.log(`[CourseSeed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} courses`);
}

// Allow direct execution: node backend/scripts/seedCourses.js
if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      await runSeed();
      await mongoose.disconnect();
      console.log('[CourseSeed] Done');
    })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, courses };
