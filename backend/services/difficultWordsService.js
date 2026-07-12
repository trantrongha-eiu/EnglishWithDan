'use strict';

const DifficultWord = require('../models/DifficultWord');

async function listHardWords(userId) {
  return DifficultWord.find({ userId, wrongCount: { $gte: 3 } })
    .sort({ wrongCount: -1, lastWrongAt: -1 })
    .lean();
}

async function reportWrongWords(userId, words, source) {
  if (!words.length) return;
  const ops = words.map(w => ({
    updateOne: {
      filter: { userId, word: w.word },
      update: {
        $inc: { wrongCount: 1 },
        $setOnInsert: {
          userId,
          word: w.word,
          meaning: w.meaning || '',
          phonetic: w.phonetic || '',
          partOfSpeech: w.partOfSpeech || '',
          example: w.example || '',
          source: w.source || source,
          addedAt: new Date(),
        },
        $set: { lastWrongAt: new Date() },
      },
      upsert: true,
    },
  }));
  await DifficultWord.bulkWrite(ops);
}

async function updateWord(id, userId, body) {
  const updates = {};
  if (body.meaning !== undefined) updates.meaning = body.meaning;
  if (body.phonetic !== undefined) updates.phonetic = body.phonetic;
  return DifficultWord.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    { new: true }
  );
}

async function deleteWord(id, userId) {
  await DifficultWord.deleteOne({ _id: id, userId });
}

module.exports = { listHardWords, reportWrongWords, updateWord, deleteWord };
