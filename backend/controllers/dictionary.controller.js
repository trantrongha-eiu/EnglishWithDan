'use strict';

const dictionaryCollocationService = require('../services/dictionaryCollocationService');

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
