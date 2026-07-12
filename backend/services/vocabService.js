'use strict';

// Extracted from routes/vocab.js, verbatim logic. splitUnit() and
// splitAllUnits() look like duplicated "chunk a unit's words" logic, but
// they use different unitNumber-counter strategies: splitUnit computes a
// single maxNum once and offsets by loop index (safe since it only ever
// touches one unit), while splitAllUnits increments a running counter
// across every large unit in the batch (needed so two different units'
// new chunks never collide). Left as two separate functions rather than
// risking an off-by-one in production vocab data by forcing a shared helper.
const VocabUnit = require('../models/VocabUnit');

async function listUnits() {
  return VocabUnit.find({ isActive: true })
    .select('unitNumber title description level')
    .sort({ unitNumber: 1 });
}

async function getUnitByNumber(number) {
  return VocabUnit.findOne({ unitNumber: number, isActive: true });
}

async function listAdminUnits() {
  const units = await VocabUnit.find()
    .select('unitNumber sortOrder title level isActive words createdAt')
    .sort({ sortOrder: 1, unitNumber: 1 });

  return units.map(u => ({
    _id: u._id, unitNumber: u.unitNumber, sortOrder: u.sortOrder, title: u.title,
    level: u.level, isActive: u.isActive, wordCount: u.words.length, createdAt: u.createdAt
  }));
}

async function getAdminUnit(id) {
  return VocabUnit.findById(id);
}

async function createUnit(body) {
  const existing = await VocabUnit.findOne({ unitNumber: body.unitNumber });
  if (existing) return { status: 'duplicate' };
  const unit = new VocabUnit(body);
  await unit.save();
  return { status: 'ok', unit };
}

async function updateUnit(id, body) {
  const { unitNumber, title, description, level, isActive } = body;
  const update = {};
  if (unitNumber !== undefined) update.unitNumber = unitNumber;
  if (title !== undefined) update.title = title;
  if (description !== undefined) update.description = description;
  if (level !== undefined) update.level = level;
  if (isActive !== undefined) update.isActive = isActive;
  return VocabUnit.findByIdAndUpdate(id, update, { new: true });
}

async function deleteUnit(id) {
  await VocabUnit.findByIdAndDelete(id);
}

async function reorderUnits(items) {
  // Bước 1: set unitNumber sang vùng tạm (10000+) để tránh unique conflict
  await Promise.all(items.map(({ _id }, i) =>
    VocabUnit.findByIdAndUpdate(_id, { sortOrder: i, unitNumber: 10000 + i })
  ));
  // Bước 2: set unitNumber chính thức (1-based theo vị trí mới)
  await Promise.all(items.map(({ _id }, i) =>
    VocabUnit.findByIdAndUpdate(_id, { unitNumber: i + 1 })
  ));
}

async function addWord(unitId, wordBody) {
  const unit = await VocabUnit.findById(unitId);
  if (!unit) return { status: 'not_found' };

  const dup = unit.words.find(w => w.word.toLowerCase() === wordBody.word?.toLowerCase()?.trim());
  if (dup) return { status: 'duplicate', word: wordBody.word };

  unit.words.push(wordBody);
  await unit.save();
  return { status: 'ok', wordCount: unit.words.length, word: wordBody.word };
}

async function updateWord(unitId, wordIndex, body) {
  const unit = await VocabUnit.findById(unitId);
  if (!unit) return { status: 'not_found' };

  const idx = Number(wordIndex);
  if (isNaN(idx) || idx < 0 || idx >= unit.words.length) return { status: 'bad_index' };

  const fields = ['type', 'word', 'meaning', 'example', 'phonetic', 'partOfSpeech', 'level', 'difficulty', 'audioUrl', 'paraphrase', 'explanation'];
  fields.forEach(f => { if (body[f] !== undefined) unit.words[idx][f] = body[f]; });
  unit.markModified('words');
  await unit.save();
  return { status: 'ok', word: unit.words[idx] };
}

async function deleteWord(unitId, wordIndex) {
  const unit = await VocabUnit.findById(unitId);
  if (!unit) return { status: 'not_found' };

  const idx = Number(wordIndex);
  if (isNaN(idx) || idx < 0 || idx >= unit.words.length) return { status: 'bad_index' };

  const removed = unit.words[idx].word;
  unit.words.splice(idx, 1);
  unit.markModified('words');
  await unit.save();
  return { status: 'ok', removed };
}

async function bulkAddWords(unitId, words, replace) {
  const unit = await VocabUnit.findById(unitId);
  if (!unit) return { status: 'not_found' };

  if (replace) {
    unit.words = words;
  } else {
    const existing = new Set(unit.words.map(w => w.word.toLowerCase()));
    const newWords = words.filter(w => !existing.has(w.word?.toLowerCase()));
    unit.words.push(...newWords);
  }

  unit.markModified('words');
  await unit.save();
  return { status: 'ok', unitNumber: unit.unitNumber, wordCount: unit.words.length };
}

async function splitUnit(unitId, chunkSize) {
  const unit = await VocabUnit.findById(unitId);
  if (!unit) return { status: 'not_found' };
  if (unit.words.length <= chunkSize) return { status: 'too_small', wordCount: unit.words.length };

  const chunks = [];
  for (let i = 0; i < unit.words.length; i += chunkSize) {
    chunks.push(unit.words.slice(i, i + chunkSize));
  }
  const n = chunks.length;

  const maxDoc = await VocabUnit.findOne().sort({ unitNumber: -1 }).select('unitNumber').lean();
  const maxNum = maxDoc ? maxDoc.unitNumber : 0;

  await VocabUnit.updateMany(
    { _id: { $ne: unit._id }, sortOrder: { $gt: unit.sortOrder } },
    { $inc: { sortOrder: n - 1 } }
  );

  const baseTitle = unit.title.replace(/\s*\(\d+\/\d+\)$/, '');
  unit.title = `${baseTitle} (1/${n})`;
  unit.words = chunks[0];
  unit.markModified('words');
  await unit.save();

  for (let i = 1; i < n; i++) {
    await VocabUnit.create({
      unitNumber: maxNum + i,
      sortOrder: unit.sortOrder + i,
      title: `${baseTitle} (${i + 1}/${n})`,
      description: unit.description, level: unit.level, isActive: unit.isActive,
      words: chunks[i]
    });
  }

  return { status: 'ok', baseTitle, parts: n };
}

async function splitAllUnits(chunkSize) {
  const allUnits = await VocabUnit.find({ isActive: true }).sort({ sortOrder: 1, unitNumber: 1 });
  const largeUnits = allUnits.filter(u => u.words.length > chunkSize);

  if (largeUnits.length === 0) return { status: 'none', parts: 0 };

  const maxDoc = await VocabUnit.findOne().sort({ unitNumber: -1 }).select('unitNumber').lean();
  let maxNum = maxDoc ? maxDoc.unitNumber : 0;

  let totalCreated = 0;
  const results = [];

  for (const unit of largeUnits) {
    const chunks = [];
    for (let i = 0; i < unit.words.length; i += chunkSize) {
      chunks.push(unit.words.slice(i, i + chunkSize));
    }
    const n = chunks.length;

    await VocabUnit.updateMany(
      { _id: { $ne: unit._id }, sortOrder: { $gt: unit.sortOrder } },
      { $inc: { sortOrder: n - 1 } }
    );

    const baseTitle = unit.title.replace(/\s*\(\d+\/\d+\)$/, '');
    unit.title = `${baseTitle} (1/${n})`;
    unit.words = chunks[0];
    unit.markModified('words');
    await unit.save();

    for (let i = 1; i < n; i++) {
      await VocabUnit.create({
        unitNumber: maxNum + 1,
        sortOrder: unit.sortOrder + i,
        title: `${baseTitle} (${i + 1}/${n})`,
        description: unit.description, level: unit.level, isActive: unit.isActive,
        words: chunks[i]
      });
      maxNum++;
    }

    totalCreated += n - 1;
    results.push({ title: baseTitle, parts: n });
  }

  // Renumber toàn bộ unitNumber theo sortOrder
  const sorted = await VocabUnit.find().sort({ sortOrder: 1, unitNumber: 1 }).select('_id');
  await Promise.all(sorted.map(({ _id }, i) =>
    VocabUnit.findByIdAndUpdate(_id, { unitNumber: 10000 + i })
  ));
  await Promise.all(sorted.map(({ _id }, i) =>
    VocabUnit.findByIdAndUpdate(_id, { unitNumber: i + 1 })
  ));

  return { status: 'ok', unitCount: largeUnits.length, totalCreated, results };
}

async function importUnits(data) {
  const results = [];

  for (const unitData of data) {
    if (!unitData.unitNumber || !unitData.title) {
      results.push({ unitNumber: unitData.unitNumber, status: 'skipped', reason: 'Missing unitNumber or title' });
      continue;
    }

    const existing = await VocabUnit.findOne({ unitNumber: unitData.unitNumber });
    if (existing) {
      existing.title = unitData.title || existing.title;
      existing.description = unitData.description || existing.description;
      existing.level = unitData.level || existing.level;
      if (unitData.words?.length) existing.words = unitData.words;
      existing.markModified('words');
      await existing.save();
      results.push({ unitNumber: unitData.unitNumber, status: 'updated', wordCount: existing.words.length });
    } else {
      const unit = new VocabUnit(unitData);
      await unit.save();
      results.push({ unitNumber: unitData.unitNumber, status: 'created', wordCount: unit.words.length });
    }
  }

  const created = results.filter(r => r.status === 'created').length;
  const updated = results.filter(r => r.status === 'updated').length;
  return { created, updated, results };
}

module.exports = {
  listUnits, getUnitByNumber, listAdminUnits, getAdminUnit, createUnit, updateUnit, deleteUnit,
  reorderUnits, addWord, updateWord, deleteWord, bulkAddWords, splitUnit, splitAllUnits, importUnits,
};
