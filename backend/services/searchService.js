'use strict';

// Site-wide title/name search (the 🔍 in the top nav).
//
// Small catalog (a few thousand titles), so instead of 12 regex queries per
// keystroke the searchable titles are loaded once into memory (refreshed
// every CATALOG_TTL_MS) and matched with utils/searchMatch — the same matcher
// every page's own search box uses: accent-insensitive, any word order,
// "cam18 test4" = "Cam 18 - Test 4", "cambridge" = "cam", ranked by
// relevance. Deliberately title/name only, not full-text inside passage /
// question bodies.
const ReadingTest = require('../models/ReadingTest');
const ListeningTest = require('../models/ListeningTest');
const ListeningSection = require('../models/ListeningSection');
const Passage = require('../models/Passage');
const { NOT_COURSE } = require('../utils/courseContent');
const WritingTask1 = require('../models/WritingTask1');
const WritingTask2 = require('../models/WritingTask2');
const SpeakingQuestion = require('../models/SpeakingQuestion');
const VocabularyLesson = require('../models/VocabularyLesson');
const VocabUnit = require('../models/VocabUnit');
const EssentialGrammarLesson = require('../models/EssentialGrammarLesson');
const ShadowingLesson = require('../models/ShadowingLesson');
const ReadingTip = require('../models/ReadingTip');
const ListeningTip = require('../models/ListeningTip');
const WritingTip = require('../models/WritingTip');
const SpeakingTip = require('../models/SpeakingTip');
const SearchMatch = require('../utils/searchMatch');

const RESULTS_PER_CATEGORY = 5;
const MAX_RESULTS = 40;
const CATALOG_TTL_MS = 2 * 60 * 1000;
// WritingTask1/2 have no title field, just the full exam prompt — shown
// verbatim in the task list UI too, but a search results dropdown needs a
// short label, not a whole paragraph.
const PROMPT_LABEL_MAX = 90;
function truncatePrompt(s) {
  return s.length > PROMPT_LABEL_MAX ? s.slice(0, PROMPT_LABEL_MAX).trim() + '…' : s;
}

const PASSAGE_CAT = { passage1: 'Passage 1', passage2: 'Passage 2', passage3: 'Passage 3' };

async function loadCatalog() {
  const [
    reading, listening, listeningSections, passages, writingTask1, writingTask2, speakingTopics,
    vocabLessons, vocabUnits, grammar, shadowing, readingTips, listeningTips, writingTips, speakingTips,
  ] = await Promise.all([
    ReadingTest.find({ isActive: true }).select('name').lean(),
    ListeningTest.find({ isActive: true }).select('name').lean(),
    ListeningSection.find({ isActive: true, ...NOT_COURSE }).select('title partNumber isActualTest').lean(),
    Passage.find({ isActive: true, ...NOT_COURSE }).select('title category isActualTest').lean(),
    WritingTask1.find({ isActive: true }).select('prompt').lean(),
    WritingTask2.find({ isActive: true }).select('prompt').lean(),
    // Many questions share the same topic — search returns distinct topics,
    // not individual questions, matching how the practice screen itself is
    // organized (pick a topic, then see all its questions).
    SpeakingQuestion.distinct('topic', { isActive: true }),
    VocabularyLesson.find({ published: true }).select('title targetClass').lean(),
    VocabUnit.find({ isActive: true }).select('title').lean(),
    EssentialGrammarLesson.find({ isActive: true }).select('title category lessonKey').lean(),
    ShadowingLesson.find({ isPublished: true }).select('title slug sourceTitle').lean(),
    ReadingTip.find({ isActive: true }).select('title').lean(),
    ListeningTip.find({ isActive: true }).select('title').lean(),
    WritingTip.find({ isActive: true }).select('title').lean(),
    SpeakingTip.find({ isActive: true }).select('title').lean(),
  ]);

  const items = [];
  // `text` = what is matched (may include extra keywords); `label` = shown.
  const add = (category, label, url, text, extra) => {
    if (!label) return;
    items.push({ category, label, url, p: SearchMatch.prepare(text || label), ...extra });
  };
  reading.forEach(t => add('Reading', t.name, `reading.html?testId=${t._id}`));
  listening.forEach(t => add('Listening', t.name, `listening.html?testId=${t._id}`));
  passages.forEach(p => add('Reading · Bài lẻ', p.title, `reading.html?passageId=${p._id}`,
    [p.title, p.isActualTest ? 'actual test' : PASSAGE_CAT[p.category] || '']));
  listeningSections.forEach(s => add('Listening · Bài lẻ', s.title, `listening.html?sectionId=${s._id}&part=${s.partNumber}`,
    [s.title, s.isActualTest ? 'actual test' : `part ${s.partNumber}`]));
  writingTask1.forEach(t => t.prompt && add('Writing Task 1', truncatePrompt(t.prompt), `writing.html?taskType=1&taskId=${t._id}`, t.prompt));
  writingTask2.forEach(t => t.prompt && add('Writing Task 2', truncatePrompt(t.prompt), `writing.html?taskType=2&taskId=${t._id}`, t.prompt));
  speakingTopics.forEach(topic => add('Speaking', topic, `speaking.html?tab=practice&topic=${encodeURIComponent(topic)}`));
  vocabLessons.forEach(l => add('Vocab · Bài giao', l.title, `dashboard.html?view=lesson&lessonId=${l._id}`, null,
    { targetClass: l.targetClass || '' }));
  vocabUnits.forEach(u => add('Vocab · Paraphrase', u.title, `dashboard.html?view=unit&unit=${u._id}`));
  grammar.forEach(g => add('Ngữ pháp', g.title, `essential-grammar.html?lesson=${encodeURIComponent(g.lessonKey)}`,
    [g.title, g.category]));
  shadowing.forEach(s => add('Shadowing', s.title, `shadowing.html?lesson=${encodeURIComponent(s.slug)}`,
    [s.title, s.sourceTitle]));
  readingTips.forEach(t => add('Reading Tips', t.title, 'reading.html?mode=tips'));
  listeningTips.forEach(t => add('Listening Tips', t.title, 'listening.html?mode=tips'));
  writingTips.forEach(t => add('Writing Tips', t.title, 'writing.html?view=writing-tips'));
  speakingTips.forEach(t => add('Speaking Tips', t.title, 'speaking.html?tab=speaking-tips'));
  return items;
}

// Stale-while-revalidate: once loaded, an expired catalog is still served
// while a fresh one loads in the background, so no keystroke waits for the
// (~1.5 s) reload. Only the very first search after a restart waits.
let cache = null;     // { at, items }
let loading = null;   // in-flight loadCatalog() promise
function refresh() {
  if (!loading) {
    loading = loadCatalog()
      .then(items => { cache = { at: Date.now(), items }; return items; })
      .finally(() => { loading = null; });
  }
  return loading;
}
async function getCatalog() {
  if (!cache) return refresh();
  if (Date.now() - cache.at > CATALOG_TTL_MS) refresh().catch(() => {});
  return cache.items;
}
function clearCache() { cache = null; }

async function search(query, user) {
  const q = String(query || '').trim().slice(0, 100);
  if (!SearchMatch.norm(q)) return [];
  const catalog = await getCatalog();
  const userClass = (user && user.className) || '';

  const byCategory = new Map(); // category → [{ item, s }]
  catalog.forEach((item, i) => {
    // class-scoped vocab lessons only for that class (mirrors listPublicLessons)
    if (item.targetClass && item.targetClass !== userClass) return;
    const s = SearchMatch.score(item.p, q);
    if (s < 0) return;
    if (!byCategory.has(item.category)) byCategory.set(item.category, []);
    byCategory.get(item.category).push({ item, s, i });
  });

  // Best category first, best items first inside it; ties keep catalog order.
  const groups = [...byCategory.values()].map(rows => {
    rows.sort((a, b) => (b.s - a.s) || (a.i - b.i));
    return rows.slice(0, RESULTS_PER_CATEGORY);
  });
  groups.sort((a, b) => (b[0].s - a[0].s) || (a[0].i - b[0].i));

  return groups.flat().slice(0, MAX_RESULTS)
    .map(({ item }) => ({ category: item.category, label: item.label, url: item.url }));
}

module.exports = { search, clearCache };
