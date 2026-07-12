'use strict';

const difficultWordsService = require('../services/difficultWordsService');

function guard(logTag, handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (e) {
      console.error(`[DifficultWords] ${logTag}`, e);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
}

exports.list = guard('GET / error:', async (req, res) => {
  const words = await difficultWordsService.listHardWords(req.user._id);
  res.json({ success: true, words });
});

exports.report = guard('POST /report error:', async (req, res) => {
  const { words = [], source = '' } = req.body;
  if (!words.length) return res.json({ success: true });
  await difficultWordsService.reportWrongWords(req.user._id, words, source);
  res.json({ success: true });
});

exports.update = guard('PATCH /:id error:', async (req, res) => {
  const doc = await difficultWordsService.updateWord(req.params.id, req.user._id, req.body);
  if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  res.json({ success: true, word: doc });
});

exports.remove = guard('DELETE /:id error:', async (req, res) => {
  await difficultWordsService.deleteWord(req.params.id, req.user._id);
  res.json({ success: true });
});
