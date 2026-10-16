'use strict';

const DictionaryPhrase = require('../models/DictionaryPhrase');
const geminiService = require('./geminiService');

const DIRECTIONS = ['vi-en', 'en-vi'];
const MAX_QUERY_LEN = 50; // matches the panel's "0/50 ký tự" counter

function normalizeQuery(raw) {
  return String(raw || '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, MAX_QUERY_LEN);
}

function toResult(doc, cached) {
  return {
    dir: doc.dir,
    query: doc.query,
    phrase: doc.phrase || '',
    meaning: doc.meaning || '',
    alternatives: doc.alternatives || [],
    examples: (doc.examples || []).map(e => ({ en: e.en, highlight: e.highlight || '', vi: e.vi || '' })),
    cached,
  };
}

// Cache-first, mirrors dictionaryCollocationService.getCollocations —
// including the E11000 race swallow (two students looking up the same new
// phrase at once both generate; the first create() wins the unique key and
// the loser just returns what it generated).
async function lookup(rawQuery, dir) {
  if (!DIRECTIONS.includes(dir)) {
    const err = new Error('Chiều tra không hợp lệ');
    err.status = 400;
    throw err;
  }
  const query = normalizeQuery(rawQuery);
  if (!query) return toResult({ dir, query: '' }, false);

  const key = `${dir}:${query}`;
  const existing = await DictionaryPhrase.findOne({ key }).lean();
  if (existing) return toResult(existing, true);

  const generated = await geminiService.generatePhraseLookup(query, dir);
  const doc = { key, dir, query, ...generated };
  try {
    await DictionaryPhrase.create(doc);
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
  return toResult(doc, false);
}

module.exports = { lookup, normalizeQuery, DIRECTIONS, MAX_QUERY_LEN };
