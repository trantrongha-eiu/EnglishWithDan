'use strict';

// Site-wide title/name search — small-catalog site, so a plain Mongo regex
// query across a handful of models is entirely sufficient (no Elasticsearch/
// Algolia anywhere in this stack). Deliberately title/name only, not full-text
// search inside passage/question bodies — that's a much larger feature (real
// text index + relevance tuning) out of scope here. See
// docs/PRODUCT_FEATURE_AUDIT.md's search phase for the reasoning.
const ReadingTest = require('../models/ReadingTest');
const ListeningTest = require('../models/ListeningTest');
const ListeningSection = require('../models/ListeningSection');
const WritingTask1 = require('../models/WritingTask1');
const WritingTask2 = require('../models/WritingTask2');
const SpeakingQuestion = require('../models/SpeakingQuestion');
const VocabularyLesson = require('../models/VocabularyLesson');
const VocabUnit = require('../models/VocabUnit');
const ReadingTip = require('../models/ReadingTip');
const ListeningTip = require('../models/ListeningTip');
const WritingTip = require('../models/WritingTip');
const SpeakingTip = require('../models/SpeakingTip');
const { escapeRegex } = require('../utils/strings');

const RESULTS_PER_CATEGORY = 5;
// WritingTask1/2 have no title field, just the full exam prompt — shown
// verbatim in the task list UI too, but a search results dropdown needs a
// short label, not a whole paragraph.
const PROMPT_LABEL_MAX = 90;
function truncatePrompt(s) {
  return s.length > PROMPT_LABEL_MAX ? s.slice(0, PROMPT_LABEL_MAX).trim() + '…' : s;
}

async function search(query, user) {
  const q = (query || '').trim();
  if (!q) return [];
  const re = new RegExp(escapeRegex(q), 'i');

  const [
    reading, listening, listeningSections, writingTask1, writingTask2, speakingTopics,
    vocabLessons, vocabUnits, readingTips, listeningTips, writingTips, speakingTips,
  ] = await Promise.all([
    ReadingTest.find({ name: re, isActive: true }).select('name').limit(RESULTS_PER_CATEGORY).lean(),
    ListeningTest.find({ name: re, isActive: true }).select('name').limit(RESULTS_PER_CATEGORY).lean(),
    ListeningSection.find({ title: re, isActive: true }).select('title partNumber').limit(RESULTS_PER_CATEGORY).lean(),
    WritingTask1.find({ prompt: re, isActive: true }).select('prompt').limit(RESULTS_PER_CATEGORY).lean(),
    WritingTask2.find({ prompt: re, isActive: true }).select('prompt').limit(RESULTS_PER_CATEGORY).lean(),
    // Many questions share the same topic — search returns distinct topics,
    // not individual questions, matching how the practice screen itself is
    // organized (pick a topic, then see all its questions).
    SpeakingQuestion.distinct('topic', { topic: re, isActive: true }),
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
    ...listeningSections.map(s => ({ category: 'Listening · Bài lẻ', label: s.title, url: `listening.html?sectionId=${s._id}&part=${s.partNumber}` })),
    ...writingTask1.map(t => ({ category: 'Writing Task 1', label: truncatePrompt(t.prompt), url: `writing.html?taskType=1&taskId=${t._id}` })),
    ...writingTask2.map(t => ({ category: 'Writing Task 2', label: truncatePrompt(t.prompt), url: `writing.html?taskType=2&taskId=${t._id}` })),
    ...speakingTopics.slice(0, RESULTS_PER_CATEGORY).map(topic => ({ category: 'Speaking', label: topic, url: `speaking.html?tab=practice&topic=${encodeURIComponent(topic)}` })),
    ...vocabLessons.map(l => ({ category: 'Vocab · Bài giao', label: l.title, url: `dashboard.html?view=lesson&lessonId=${l._id}` })),
    ...vocabUnits.map(u => ({ category: 'Vocab · Paraphrase', label: u.title, url: `dashboard.html?view=unit&unit=${u._id}` })),
    ...readingTips.map(t => ({ category: 'Reading Tips', label: t.title, url: 'reading.html?mode=tips' })),
    ...listeningTips.map(t => ({ category: 'Listening Tips', label: t.title, url: 'listening.html?mode=tips' })),
    ...writingTips.map(t => ({ category: 'Writing Tips', label: t.title, url: 'writing.html?view=writing-tips' })),
    ...speakingTips.map(t => ({ category: 'Speaking Tips', label: t.title, url: 'speaking.html?tab=speaking-tips' })),
  ];
}

module.exports = { search };
