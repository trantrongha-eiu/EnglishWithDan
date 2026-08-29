'use strict';

const dictionaryCollocationService = require('../services/dictionaryCollocationService');
const dictionaryExampleService = require('../services/dictionaryExampleService');

// One AI-generated example sentence for a single word (cache-first).
exports.getExample = async (req, res) => {
  const word = (req.params.word || '').trim();
  if (!word) return res.status(400).json({ success: false, message: 'Thiếu từ cần tra' });

  try {
    const result = await dictionaryExampleService.getExample(word);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.isOverloaded ? 503 : 500;
    console.error('[Dictionary/example]', err);
    res.status(status).json({ success: false, message: err.isOverloaded ? 'Dịch vụ đang quá tải, vui lòng thử lại sau.' : 'Lỗi server' });
  }
};

// Example sentences for a list of words ("Nhập hàng loạt"). Body: { words: [...] }.
// Always 200 with an { word: sentence } map — a word the AI couldn't do
// comes back "" rather than failing the batch.
exports.getExamples = async (req, res) => {
  const words = Array.isArray(req.body && req.body.words) ? req.body.words : null;
  if (!words || !words.length) return res.status(400).json({ success: false, message: 'Thiếu danh sách từ' });
  if (words.length > 100) return res.status(400).json({ success: false, message: 'Tối đa 100 từ mỗi lần' });

  try {
    const result = await dictionaryExampleService.getExamplesBulk(words);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Dictionary/examples]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getCollocations = async (req, res) => {
  const word = (req.params.word || '').trim();
  if (!word) return res.status(400).json({ success: false, message: 'Thiếu từ cần tra' });

  try {
    const result = await dictionaryCollocationService.getCollocations(word);
    res.json({ success: true, ...result });
  } catch (err) {
    // classifyGeminiError() (inside geminiService) tags quota/overload
    // errors with .isOverloaded — same 503-vs-500 split every other
    // Gemini-backed controller in this app already uses.
    const status = err.isOverloaded ? 503 : 500;
    console.error('[Dictionary]', err);
    res.status(status).json({ success: false, message: err.isOverloaded ? 'Dịch vụ đang quá tải, vui lòng thử lại sau.' : 'Lỗi server' });
  }
};
