/**
 * addPassages.js
 * Chạy: node addPassages.js
 * Đặt file này trong thư mục backend/ (cùng cấp với server.js)
 * File JSON đặt cùng thư mục: passages_data.json
 */

const mongoose = require('mongoose');
const fs       = require('fs');
const path     = require('path');
require('dotenv').config();

// Import models
const Passage     = require('./models/Passage');
const ReadingTest = require('./models/ReadingTest');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối MongoDB');

    // ── 1. Import Passages ──────────────────────────────────────
    const passagePath = path.join(__dirname, 'passages_data.json');
    if (!fs.existsSync(passagePath)) {
      console.error('❌ Không tìm thấy passages_data.json tại: ' + passagePath);
      process.exit(1);
    }

    const passages = JSON.parse(fs.readFileSync(passagePath, 'utf8'));

    // Xóa data cũ
    await Passage.deleteMany({});
    console.log('🗑️  Đã xóa Passage cũ');

    const inserted = await Passage.insertMany(passages);
    console.log(`📖 Đã import ${inserted.length} passages`);

    // Kiểm tra đủ mỗi category chưa
    const p1 = passages.filter(p => p.category === 'passage1').length;
    const p2 = passages.filter(p => p.category === 'passage2').length;
    const p3 = passages.filter(p => p.category === 'passage3').length;
    console.log(`   ↳ passage1: ${p1} | passage2: ${p2} | passage3: ${p3}`);

    if (!p1 || !p2 || !p3) {
      console.warn('⚠️  CẢNH BÁO: Thiếu passage ở một hoặc nhiều category!');
      console.warn('   Route /start sẽ báo lỗi "Database chưa đủ bài đọc"');
    }

    // ── 2. Import ReadingTests (metadata) ──────────────────────
    const testPath = path.join(__dirname, 'ReadingData.json');
    if (fs.existsSync(testPath)) {
      const tests = JSON.parse(fs.readFileSync(testPath, 'utf8'));
      await ReadingTest.deleteMany({});
      await ReadingTest.insertMany(tests);
      console.log(`📝 Đã import ${tests.length} ReadingTest`);
    } else {
      // Tạo 1 test mặc định nếu chưa có ReadingData.json
      await ReadingTest.deleteMany({});
      await ReadingTest.create({
        name: 'Orange Test 1',
        seriesName: 'Orange Test',
        testNumber: 1,
        isActive: true
      });
      console.log('📝 Đã tạo ReadingTest mặc định: Orange Test 1');
    }

    console.log('\n🚀 Seed hoàn tất! Bạn có thể chạy server bình thường rồi.');

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
    process.exit();
  }
}

seed();