const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const ReadingTest = require('./models/ReadingTest'); 
require('dotenv').config();

async function addReadingTests() {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('✅ Đã kết nối MongoDB thành công');

    // FIX ĐƯỜNG DẪN Ở ĐÂY
    // __dirname là thư mục backend, kết hợp với tên file để ra đường dẫn tuyệt đối
    const dataPath = path.join(__dirname, 'ReadingData.json'); 
    
    if (!fs.existsSync(dataPath)) {
      console.log('❌ Lỗi: Không tìm thấy file ReadingData.json tại: ' + dataPath);
      return;
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const readingTests = JSON.parse(rawData);
    
    console.log(`📂 Đã đọc file JSON (${readingTests.length} bài test)`);

    // Làm sạch dữ liệu cũ và thêm mới (Giống importVocab.js)
    await ReadingTest.deleteMany({});
    console.log('🗑️  Đã xóa dữ liệu cũ');

    await ReadingTest.insertMany(readingTests);
    console.log(`🚀 Import thành công ${readingTests.length} bài test!`);

  } catch (error) {
    console.error('❌ Lỗi thực thi:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
    process.exit();
  }
}

addReadingTests();