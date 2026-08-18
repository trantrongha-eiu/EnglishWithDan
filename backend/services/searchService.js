'use strict';

// Site-wide title/name search — small-catalog site, so a plain Mongo regex
// query across a handful of models is entirely sufficient (no Elasticsearch/
// Algolia anywhere in this stack). Deliberately title/name only, not full-text
// search inside passage/question bodies — that's a much larger feature (real
// text index + relevance tuning) out of scope here. See
// docs/PRODUCT_FEATURE_AUDIT.md's search phase for the reasoning.
const ReadingTest = require('../models/ReadingTest');
const ListeningTest = require('../models/ListeningTest');
const VocabularyLesson = require('../models/VocabularyLesson');
const VocabUnit = require('../models/VocabUnit');
const ReadingTip = require('../models/ReadingTip');
const ListeningTip = require('../models/ListeningTip');
const WritingTip = require('../models/WritingTip');
const SpeakingTip = require('../models/SpeakingTip');
const { escapeRegex } = require('../utils/strings');

const RESULTS_PER_CATEGORY = 5;

async function search(query, user) {
  const q = (query || '').trim();
  if (!q) return [];
  const re = new RegExp(escapeRegex(q), 'i');

  const [reading, listening, vocabLessons, vocabUnits, readingTips, listeningTips, writingTips, speakingTips] = await Promise.all([
    ReadingTest.find({ name: re, isActive: true }).select('name').limit(RESULTS_PER_CATEGORY).lean(),
    ListeningTest.find({ name: re, isActive: true }).select('name').limit(RESULTS_PER_CATEGORY).lean(),
    VocabularyLesson.find({
      title: re, published: true,
      $or: [{ targetClass: '' }, { targetClass: { $exists: false } }, { targetClass: user?.className || '__none__' }],
    }).select('title').limit(RESULTS_PER_CATEGORY).lean(),
    VocabUnit.find({ title: re, isActive: true }).select('title').limit(RESULTS_PER_CATEGORY).lean(),
    ReadingTip.find({ title: re, isActive: true }).select('title').limit(RESULTS_PER_CATEGORY).lean(),
    ListeningTip.find({ title: re, isActive: true }).select('title').limit(RESULTS_PER_CATEGORY).lean(),
    WritingTip.find({ title: re, isActive: true }).select('title').limit(RESULTS_PER_CATEGORY).lean(),
    SpeakingTip.find({ title: re, isActive: true }).select('title').limit(RESULTS_PER_CATEGORY).lean(),
  ]);

  return [
    ...reading.map(t => ({ category: 'Reading', label: t.name, url: `reading.html?testId=${t._id}` })),
    ...listening.map(t => ({ category: 'Listening', label: t.name, url: `listening.html?testId=${t._id}` })),
    ...vocabLessons.map(l => ({ category: 'Vocab · Bài giao', label: l.title, url: `dashboard.html?view=lesson&lessonId=${l._id}` })),
    ...vocabUnits.map(u => ({ category: 'Vocab · Paraphrase', label: u.title, url: `dashboard.html?view=unit&unit=${u._id}` })),
    ...readingTips.map(t => ({ category: 'Reading Tips', label: t.title, url: 'reading.html?mode=tips' })),
    ...listeningTips.map(t => ({ category: 'Listening Tips', label: t.title, url: 'listening.html?mode=tips' })),
    ...writingTips.map(t => ({ category: 'Writing Tips', label: t.title, url: 'writing.html?view=writing-tips' })),
    ...speakingTips.map(t => ({ category: 'Speaking Tips', label: t.title, url: 'speaking.html?tab=speaking-tips' })),
  ];
}

module.exports = { search };
