/**
 * backend/importVocab.js
 * Dùng để import dữ liệu vocab từ file JSON vào MongoDB
 *
 * Cách dùng:
 *   node importVocab.js              → import vocabData.json (tạo mới, bỏ qua unit đã có)
 *   node importVocab.js --replace    → xoá tất cả units cũ rồi import lại
 *   node importVocab.js --file path/to/file.json  → chỉ định file khác
 *
 * Format file JSON:
 *   Array: [{ unitNumber, title, words: [...] }, ...]
 *   hoặc Single object: { unitNumber, title, words: [...] }
 */

const mongoose  = require('mongoose');
const VocabUnit = require('./models/VocabUnit');
require('dotenv').config();

// ── Parse CLI args ──────────────────────────────────────
const args    = process.argv.slice(2);
const replace = args.includes('--replace');
const fileArg = args.find(a => a.startsWith('--file='));
const filePath= fileArg ? fileArg.split('=')[1] : './vocabData.json';

async function importData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    // Load JSON data
    let data;
    try {
      data = require(filePath.startsWith('.') ? filePath : `./${filePath}`);
    } catch {
      console.error(`❌ Cannot load file: ${filePath}`);
      process.exit(1);
    }
    const units = Array.isArray(data) ? data : [data];
    console.log(`📦 Found ${units.length} unit(s) in ${filePath}\n`);

    // Replace mode: xoá tất cả trước
    if (replace) {
      const count = await VocabUnit.countDocuments();
      await VocabUnit.deleteMany();
      console.log(`🗑  Cleared ${count} existing units\n`);
    }

    let created = 0, updated = 0, skipped = 0;

    for (const unitData of units) {
      if (!unitData.unitNumber || !unitData.title) {
        console.warn(`⚠️  Skipping invalid unit (missing unitNumber or title)`);
        skipped++;
        continue;
      }

      const existing = await VocabUnit.findOne({ unitNumber: unitData.unitNumber });

      if (existing && !replace) {
        // Update nếu có data mới
        existing.title       = unitData.title;
        if (unitData.description) existing.description = unitData.description;
        if (unitData.level)       existing.level       = unitData.level;
        if (unitData.words?.length) {
          existing.words = unitData.words;
          existing.markModified('words');
        }
        await existing.save();
        console.log(`🔄 Updated  Unit ${String(unitData.unitNumber).padStart(2,'0')}: ${unitData.title} (${unitData.words?.length || 0} words)`);
        updated++;
      } else if (!existing) {
        await VocabUnit.create(unitData);
        console.log(`✨ Created  Unit ${String(unitData.unitNumber).padStart(2,'0')}: ${unitData.title} (${unitData.words?.length || 0} words)`);
        created++;
      }
    }

    console.log(`\n${'─'.repeat(50)}`);
    console.log(`✅ Done! Created: ${created}  Updated: ${updated}  Skipped: ${skipped}`);
    console.log(`📊 Total units in DB: ${await VocabUnit.countDocuments()}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

importData();