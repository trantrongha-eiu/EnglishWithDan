// One-time content backfill: IELTS Speaking topic vocabulary/collocations,
// one VocabularyLesson per topic (see models/VocabularyLesson.js) — a
// shared/curriculum lesson, NOT a personal VocabBook notebook (VocabBook is
// strictly per-user with no shared concept, so pre-populated topic content
// belongs here instead; the 5 default VocabBook notebooks stay untouched).
//
// Source: 17 collocation/vocabulary PDFs (Vocab for ielts/*.pdf) — word list
// + Vietnamese meaning extracted from the PDFs (verified accurate), example
// sentences reused from the source where available and otherwise authored
// here, English definitions authored here (the source only has Vietnamese
// meanings, no English definitions).
//
// Run: node scripts/seedVocabLessonsIeltsSpeakingTopics.js
'use strict';

const ADMIN_EMAIL = 'tranhadeeptry@gmail.com'; // existing admin — createdBy, same as seedVocabLessonsMindset0.js

const topics = [
  { key: 'advertising', title: 'IELTS Speaking – Advertising & Marketing', desc: 'Advertising & Marketing' },
  { key: 'education', title: 'IELTS Speaking – Education', desc: 'Education' },
  { key: 'environment', title: 'IELTS Speaking – Environment', desc: 'Environment' },
  { key: 'transport', title: 'IELTS Speaking – Transport', desc: 'Transport' },
  { key: 'music', title: 'IELTS Speaking – Music', desc: 'Music' },
  { key: 'news', title: 'IELTS Speaking – News & Media', desc: 'News & Media' },
  { key: 'travel', title: 'IELTS Speaking – Travel & Tourism', desc: 'Travel & Tourism' },
  { key: 'weather', title: 'IELTS Speaking – Weather', desc: 'Weather' },
  { key: 'work', title: 'IELTS Speaking – Work & Career', desc: 'Work & Career' },
  { key: 'character', title: 'IELTS Speaking – Character & Behaviour', desc: 'Character & Behaviour' },
  { key: 'eating', title: 'IELTS Speaking – Food & Eating Habits', desc: 'Food & Eating Habits' },
  { key: 'health', title: 'IELTS Speaking – Health', desc: 'Health' },
  { key: 'housing', title: 'IELTS Speaking – Housing & Accommodation', desc: 'Housing & Accommodation' },
  { key: 'movies', title: 'IELTS Speaking – Movies & Entertainment', desc: 'Movies & Entertainment' },
  { key: 'social_issues', title: 'IELTS Speaking – Social Issues', desc: 'Social Issues' },
  { key: 'feelings', title: 'IELTS Speaking – Feelings & Emotions', desc: 'Feelings & Emotions' },
  { key: 'relationship', title: 'IELTS Speaking – Relationships', desc: 'Relationships' },
];

const lessons = topics.map((t, i) => ({
  title: t.title,
  description: `Từ vựng & collocation thường dùng cho IELTS Speaking chủ đề ${t.desc} (Part 2/3).`,
  difficulty: 'B2',
  order: 19 + i,
  words: require('./data/vocabIeltsSpeaking/vocab_' + t.key + '.js'),
}));

function toWordDoc([word, meaning, example, definition]) {
  return { word, meaning, example, definition, ipa: '', partOfSpeech: '', collocations: [], distractors: [] };
}

async function runSeed() {
  const VocabularyLesson = require('../models/VocabularyLesson');
  const User = require('../models/User');

  const admin = await User.findOne({ email: ADMIN_EMAIL }).select('_id').lean();
  if (!admin) throw new Error(`Admin user not found: ${ADMIN_EMAIL}`);

  for (const lesson of lessons) {
    const existing = await VocabularyLesson.findOne({ title: lesson.title }).lean();
    if (existing) {
      console.log(`[SeedVocabIeltsSpeaking] "${lesson.title}" already exists (_id=${existing._id}) – skip`);
      continue;
    }
    const doc = await VocabularyLesson.create({
      title: lesson.title,
      description: lesson.description,
      difficulty: lesson.difficulty,
      order: lesson.order,
      targetClass: '',
      published: true,
      createdBy: admin._id,
      words: lesson.words.map(toWordDoc),
    });
    console.log(`[SeedVocabIeltsSpeaking] Inserted "${doc.title}" (_id=${doc._id}, ${doc.words.length} words)`);
  }
}

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedVocabIeltsSpeaking] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, lessons };
