'use strict';

const DictionaryExample = require('../models/DictionaryExample');
const geminiService = require('./geminiService');
const logger = require('../utils/logger');

// Hard cap on how many brand-new words one bulk request will send to the AI
// (a "Nhập hàng loạt" paste is realistically < 30 words; this stops a giant
// paste from turning into a huge fan-out of AI calls).
const MAX_GENERATE_PER_REQUEST = 40;
// How many AI calls to have in flight at once for a bulk request.
const GENERATE_CONCURRENCY = 4;

function normalizeWord(raw) {
  return String(raw || '').trim().toLowerCase().slice(0, 100);
}

// Cache-first single lookup. A word is sent to the AI AT MOST ONCE across
// the whole system, ever — mirrors dictionaryCollocationService.getCollocations
// (including the E11000 race swallow: two callers racing the same new word
// both generate, first create() wins the unique index, the loser just
// returns what it generated).
async function getExample(rawWord) {
  const word = normalizeWord(rawWord);
  if (!word) return { word: '', example: '', cached: false };

  const existing = await DictionaryExample.findOne({ word }).lean();
  if (existing) return { word, example: existing.example, cached: true };

  const example = await geminiService.generateExampleSentence(word);
  try {
    await DictionaryExample.create({ word, example });
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
  return { word, example, cached: false };
}

// Bulk lookup for "Nhập hàng loạt". Returns a plain { word: exampleSentence }
// map. Cached words are one indexed read; the (capped) misses are generated
// with bounded concurrency. A single word's generation failing (AI overload,
// bad JSON) never fails the whole request — that word just comes back "".
async function getExamplesBulk(rawWords) {
  const words = [...new Set(
    (Array.isArray(rawWords) ? rawWords : []).map(normalizeWord).filter(Boolean)
  )];
  const out = {};
  if (!words.length) return { examples: out, generated: 0 };

  const cached = await DictionaryExample.find({ word: { $in: words } }).lean();
  const cachedSet = new Set();
  for (const doc of cached) { out[doc.word] = doc.example; cachedSet.add(doc.word); }

  const misses = words.filter(w => !cachedSet.has(w)).slice(0, MAX_GENERATE_PER_REQUEST);
  for (const w of words) if (!(w in out)) out[w] = ''; // words past the cap → ""

  let generated = 0;
  for (let i = 0; i < misses.length; i += GENERATE_CONCURRENCY) {
    const batch = misses.slice(i, i + GENERATE_CONCURRENCY);
    await Promise.all(batch.map(async (w) => {
      try {
        const example = await geminiService.generateExampleSentence(w);
        try { await DictionaryExample.create({ word: w, example }); }
        catch (err) { if (err.code !== 11000) throw err; }
        out[w] = example;
        generated++;
      } catch (err) {
        logger.ai('getExamplesBulk: one word failed', { word: w, errorMessage: err.message });
        out[w] = '';
      }
    }));
  }

  return { examples: out, generated };
}

module.exports = { getExample, getExamplesBulk, normalizeWord, MAX_GENERATE_PER_REQUEST };
