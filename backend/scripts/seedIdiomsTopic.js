'use strict';
// One-off: add "IELTS Speaking – Idioms thông dụng" to Vocab Topics
// (VocabularyLesson) from scripts/data/idiomsIeltsSpeaking.json
// ([word, meaning, definition, example] per idiom; 119 idioms — the source
// list "120 idioms" skips #88).
//
// Fill-in-the-blank blanks `word` inside `example`; idioms with a placeholder
// ("give someone a hand") can't match and fall back to "definition → _____".
// Those are listed in the dry run.
//
//   node scripts/seedIdiomsTopic.js          # dry run
//   node scripts/seedIdiomsTopic.js --apply

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const VocabularyLesson = require('../models/VocabularyLesson');
const { parseLessonText, lessonToText } = require('../services/vocabularyLessonParser');
const rows = require('./data/idiomsIeltsSpeaking.json');

const APPLY = process.argv.includes('--apply');
const TITLE = 'IELTS Speaking – Idioms thông dụng';

const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

(async () => {
  const words = rows.map(([word, meaning, definition, example]) => ({
    word, meaning, definition, example, partOfSpeech: 'idiom', collocations: [], distractors: [],
  }));
  const noBlank = words.filter(w => !new RegExp(`\\b${escRe(w.word)}\\b`, 'i').test(w.example)).map(w => w.word);

  await mongoose.connect(process.env.MONGO_URI);
  const last = await VocabularyLesson.findOne({}).sort({ order: -1 }).lean();
  const admin = await VocabularyLesson.findOne({ published: true }).sort({ createdAt: -1 }).lean();
  const lesson = {
    title: TITLE,
    description: `${words.length} idioms thông dụng cho IELTS Speaking: nghĩa tiếng Việt, định nghĩa tiếng Anh và câu ví dụ.`,
    difficulty: 'B2',
    order: (last?.order ?? 0) + 1,
    targetClass: '',
    published: true,
    createdBy: admin.createdBy,
    words,
  };
  lesson.rawImport = lessonToText(lesson);
  const parsed = parseLessonText(lesson.rawImport);
  if (!parsed.valid) throw new Error(`parser rejected: ${JSON.stringify(parsed.errors).slice(0, 800)}`);
  if (parsed.words.length !== words.length) throw new Error(`round-trip lost words: ${parsed.words.length}/${words.length}`);

  console.log(`${words.length} idioms, order ${lesson.order}, createdBy ${lesson.createdBy}`);
  console.log(`No exact match in example (fill-blank uses definition): ${noBlank.length}\n  ${noBlank.join('\n  ')}`);
  if (await VocabularyLesson.exists({ title: TITLE })) throw new Error('Lesson already exists');
  if (!APPLY) { console.log('Dry run OK. Re-run with --apply.'); process.exit(0); }

  const created = await VocabularyLesson.create(lesson);
  console.log(`Created lesson ${created._id}`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
