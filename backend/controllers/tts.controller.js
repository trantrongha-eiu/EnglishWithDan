'use strict';

const ttsService = require('../services/ttsService');
const { publicVoices, DEFAULT_EXAMINER_VOICE } = require('../constants/ttsVoices');

// `enabled: false` tells the page to hide the picker and keep the browser voice.
exports.listVoices = (req, res) => {
  const enabled = ttsService.isEnabled();
  res.json({
    success: true,
    enabled,
    defaultVoice: DEFAULT_EXAMINER_VOICE,
    voices: enabled ? publicVoices() : [],
  });
};

// Body: { text, voice? }. Answers with the MP3's public URL.
exports.getSpeech = async (req, res) => {
  const { text, voice } = req.body || {};
  const url = await ttsService.getSpeechUrl({
    text,
    voiceId: typeof voice === 'string' ? voice : undefined,
    userId: req.user._id.toString(),
  });
  res.json({ success: true, url });
};
