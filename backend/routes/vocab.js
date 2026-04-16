const router    = require('express').Router();
const VocabUnit = require('../models/VocabUnit');
const auth      = require('../middleware/auth');

// Middleware chỉ cho teacher/admin
const teacherOnly = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền' });
  }
  next();
};

// ══════════════════════════════════════════════════════
// PUBLIC (học sinh – cần đăng nhập)
// ══════════════════════════════════════════════════════

// GET /api/vocab/units  – danh sách tất cả units (chỉ lấy số + tiêu đề)
router.get('/units', auth, async (req, res) => {
  try {
    const units = await VocabUnit.find({ isActive: true })
      .select('unitNumber title description level')
      .sort({ unitNumber: 1 });
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: 'Cannot load units' });
  }
});

// GET /api/vocab/unit/:number  – chi tiết 1 unit (có đầy đủ words)
router.get('/unit/:number', auth, async (req, res) => {
  try {
    const unit = await VocabUnit.findOne({
      unitNumber: Number(req.params.number),
      isActive: true
    });
    if (!unit) return res.status(404).json({ message: 'Unit not found' });
    res.json(unit);
  } catch (err) {
    res.status(500).json({ message: 'Cannot load unit' });
  }
});

// ══════════════════════════════════════════════════════
// ADMIN – quản lý vocab units
// ══════════════════════════════════════════════════════

// GET /api/vocab/admin/units  – toàn bộ units (cả isActive=false)
router.get('/admin/units', auth, teacherOnly, async (req, res) => {
  try {
    const units = await VocabUnit.find()
      .select('unitNumber sortOrder title level isActive words createdAt')
      .sort({ sortOrder: 1, unitNumber: 1 });

    // Thêm wordCount vào mỗi unit
    const result = units.map(u => ({
      _id:        u._id,
      unitNumber: u.unitNumber,
      sortOrder:  u.sortOrder,
      title:      u.title,
      level:      u.level,
      isActive:   u.isActive,
      wordCount:  u.words.length,
      createdAt:  u.createdAt
    }));

    res.json({ success: true, units: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/vocab/admin/units/:id  – chi tiết 1 unit đầy đủ (để edit)
router.get('/admin/units/:id', auth, teacherOnly, async (req, res) => {
  try {
    const unit = await VocabUnit.findById(req.params.id);
    if (!unit) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, unit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/vocab/admin/units  – tạo unit mới
// Body: { unitNumber, title, description, level, words: [...] }
router.post('/admin/units', auth, teacherOnly, async (req, res) => {
  try {
    const existing = await VocabUnit.findOne({ unitNumber: req.body.unitNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: `Unit ${req.body.unitNumber} đã tồn tại` });
    }
    const unit = new VocabUnit(req.body);
    await unit.save();
    res.status(201).json({ success: true, unit, message: `Đã tạo Unit ${unit.unitNumber}: ${unit.title}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/vocab/admin/units/:id  – cập nhật metadata unit (title, level, isActive…)
// Không cập nhật words ở đây – dùng word routes riêng
router.put('/admin/units/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { unitNumber, title, description, level, isActive } = req.body;
    const update = {};
    if (unitNumber  !== undefined) update.unitNumber  = unitNumber;
    if (title       !== undefined) update.title       = title;
    if (description !== undefined) update.description = description;
    if (level       !== undefined) update.level       = level;
    if (isActive    !== undefined) update.isActive    = isActive;

    const unit = await VocabUnit.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!unit) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, unit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/vocab/admin/units/:id  – xoá hẳn khỏi DB
router.delete('/admin/units/:id', auth, teacherOnly, async (req, res) => {
  try {
    await VocabUnit.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá unit' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/vocab/admin/units/reorder  – đổi thứ tự + renumber unitNumber
// Body: [{ _id }, ...] – thứ tự mới từ đầu đến cuối
router.patch('/admin/units/reorder', auth, teacherOnly, async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ success: false, message: 'Body phải là array' });

    // Bước 1: set unitNumber sang vùng tạm (10000+) để tránh unique conflict
    await Promise.all(items.map(({ _id }, i) =>
      VocabUnit.findByIdAndUpdate(_id, { sortOrder: i, unitNumber: 10000 + i })
    ));
    // Bước 2: set unitNumber chính thức (1-based theo vị trí mới)
    await Promise.all(items.map(({ _id }, i) =>
      VocabUnit.findByIdAndUpdate(_id, { unitNumber: i + 1 })
    ));

    res.json({ success: true, message: 'Đã cập nhật thứ tự' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Word management trong unit ──────────────────────────────────────────────

// POST /api/vocab/admin/units/:id/words  – thêm từ vào unit
// Body: { word, meaning, example, phonetic, partOfSpeech, level, difficulty }
router.post('/admin/units/:id/words', auth, teacherOnly, async (req, res) => {
  try {
    const unit = await VocabUnit.findById(req.params.id);
    if (!unit) return res.status(404).json({ success: false, message: 'Không tìm thấy unit' });

    const dup = unit.words.find(w => w.word.toLowerCase() === req.body.word?.toLowerCase()?.trim());
    if (dup) return res.json({ success: false, message: `"${req.body.word}" đã có trong unit này` });

    unit.words.push(req.body);
    await unit.save();
    res.status(201).json({ success: true, message: `Đã thêm "${req.body.word}"`, wordCount: unit.words.length });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/vocab/admin/units/:id/words/:wordIndex  – sửa 1 từ theo index
router.put('/admin/units/:id/words/:wordIndex', auth, teacherOnly, async (req, res) => {
  try {
    const unit = await VocabUnit.findById(req.params.id);
    if (!unit) return res.status(404).json({ success: false, message: 'Không tìm thấy unit' });

    const idx = Number(req.params.wordIndex);
    if (isNaN(idx) || idx < 0 || idx >= unit.words.length) {
      return res.status(400).json({ success: false, message: 'Index không hợp lệ' });
    }

    // Merge fields
    const fields = ['word', 'meaning', 'example', 'phonetic', 'partOfSpeech', 'level', 'difficulty', 'audioUrl'];
    fields.forEach(f => { if (req.body[f] !== undefined) unit.words[idx][f] = req.body[f]; });
    unit.markModified('words');
    await unit.save();
    res.json({ success: true, word: unit.words[idx] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/vocab/admin/units/:id/words/:wordIndex  – xoá 1 từ theo index
router.delete('/admin/units/:id/words/:wordIndex', auth, teacherOnly, async (req, res) => {
  try {
    const unit = await VocabUnit.findById(req.params.id);
    if (!unit) return res.status(404).json({ success: false, message: 'Không tìm thấy unit' });

    const idx = Number(req.params.wordIndex);
    if (isNaN(idx) || idx < 0 || idx >= unit.words.length) {
      return res.status(400).json({ success: false, message: 'Index không hợp lệ' });
    }

    const removed = unit.words[idx].word;
    unit.words.splice(idx, 1);
    unit.markModified('words');
    await unit.save();
    res.json({ success: true, message: `Đã xoá "${removed}"` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/vocab/admin/units/:id/words/bulk  – import nhiều từ cùng lúc
// Body: { words: [...], replace: true/false }
// replace=true → xoá hết words cũ trước khi import
router.post('/admin/units/:id/words/bulk', auth, teacherOnly, async (req, res) => {
  try {
    const { words = [], replace = false } = req.body;
    if (!Array.isArray(words) || !words.length) {
      return res.status(400).json({ success: false, message: 'Danh sách từ trống' });
    }

    const unit = await VocabUnit.findById(req.params.id);
    if (!unit) return res.status(404).json({ success: false, message: 'Không tìm thấy unit' });

    if (replace) {
      unit.words = words;
    } else {
      // Chỉ thêm từ chưa tồn tại
      const existing = new Set(unit.words.map(w => w.word.toLowerCase()));
      const newWords = words.filter(w => !existing.has(w.word?.toLowerCase()));
      unit.words.push(...newWords);
    }

    unit.markModified('words');
    await unit.save();
    res.json({
      success: true,
      message: `Đã import ${replace ? words.length : 'mới'} từ vào Unit ${unit.unitNumber}`,
      wordCount: unit.words.length
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/vocab/admin/import  – import toàn bộ từ JSON (tạo/update nhiều units)
// Body: Array<{ unitNumber, title, words: [...] }> hoặc single object
router.post('/admin/import', auth, teacherOnly, async (req, res) => {
  try {
    const data = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];

    for (const unitData of data) {
      if (!unitData.unitNumber || !unitData.title) {
        results.push({ unitNumber: unitData.unitNumber, status: 'skipped', reason: 'Missing unitNumber or title' });
        continue;
      }

      const existing = await VocabUnit.findOne({ unitNumber: unitData.unitNumber });
      if (existing) {
        // Update
        existing.title       = unitData.title       || existing.title;
        existing.description = unitData.description || existing.description;
        existing.level       = unitData.level       || existing.level;
        if (unitData.words?.length) existing.words = unitData.words;
        existing.markModified('words');
        await existing.save();
        results.push({ unitNumber: unitData.unitNumber, status: 'updated', wordCount: existing.words.length });
      } else {
        // Create
        const unit = new VocabUnit(unitData);
        await unit.save();
        results.push({ unitNumber: unitData.unitNumber, status: 'created', wordCount: unit.words.length });
      }
    }

    const created = results.filter(r => r.status === 'created').length;
    const updated = results.filter(r => r.status === 'updated').length;
    res.json({
      success: true,
      message: `Import xong: ${created} tạo mới, ${updated} cập nhật`,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;