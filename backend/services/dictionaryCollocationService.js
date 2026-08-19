'use strict';

const DictionaryCollocation = require('../models/DictionaryCollocation');
const geminiService = require('./geminiService');

function normalizeWord(raw) {
  return String(raw || '').trim().toLowerCase().slice(0, 100);
}

// Cache-first: a word is sent to Gemini AT MOST ONCE across the whole
// system, ever. Every later lookup of the same word (by any student) is a
// plain indexed DB read, matching the pattern already proven by
// SpeakingQuestion.sampleAnswer/hints (generate-once-cache-forever).
//
// Race handling: two students double-clicking the same brand-new word at
// the same moment can both pass the cache-miss check and both call Gemini —
// harmless (a few seconds of duplicate AI cost, not a correctness bug).
// Whichever create() reaches Mongo first wins the unique index on `word`;
// the second gets an E11000 duplicate-key error, which we swallow and just
// return the collocations we ourselves already generated (still accurate —
// Gemini is deterministic-ish at temperature 0.3 for the same word, and even
// if it weren't, this specific student still gets a valid answer instantly
// rather than an error).
async function getCollocations(rawWord) {
  const word = normalizeWord(rawWord);
  if (!word) return { word: '', collocations: [], cached: false };

  const existing = await DictionaryCollocation.findOne({ word }).lean();
  if (existing) return { word, collocations: existing.collocations, cached: true };

  const collocations = await geminiService.generateCollocations(word);
  try {
    await DictionaryCollocation.create({ word, collocations });
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
  return { word, collocations, cached: false };
}

module.exports = { getCollocations, normalizeWord };
