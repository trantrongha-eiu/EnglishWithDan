'use strict';
// Append the Part 2 master-story vocab (scripts/data/part2StoryVocab.js) to
// the 7 "IELTS Speaking – …" Vocab Topics lessons. Words a lesson already
// has (same term, ignoring case/articles/someone-sth placeholders) are
// skipped, and new words go at the END so existing progress keeps working.
//
//   node scripts/seedPart2StoryVocab.js          # dry run
//   node scripts/seedPart2StoryVocab.js --apply

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const mongoose = require('mongoose');
const VocabularyLesson = require('../models/VocabularyLesson');
const { parseLessonText, lessonToText } = require('../services/vocabularyLessonParser');
const DATA = require('./data/part2StoryVocab');

const APPLY = process.argv.includes('--apply');
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// "Look up to someone" == "look up to"; "a hidden gem" == "hidden gem".
const norm = s => s.toLowerCase()
  .replace(/[‘’]/g, "'").replace(/[–—]/g, '-').replace(/…|\.\.\./g, ' ')
  .replace(/\b(someone's|someone|something|sb's|sb|sth|one's)\b/g, ' ')
  .replace(/^\s*(a|an|the|be)\s+/, '')
  .replace(/\s+/g, ' ').trim();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  let total = 0;
  for (const [title, rows] of Object.entries(DATA)) {
    const lesson = await VocabularyLesson.findOne({ title });
    if (!lesson) throw new Error(`Lesson not found: ${title}`);
    const have = new Set(lesson.words.map(w => norm(w.word)));
    const add = [];
    const skipped = [];
    for (const [word, meaning, example, definition, partOfSpeech] of rows) {
      if (have.has(norm(word))) { skipped.push(word); continue; }
      have.add(norm(word));
      add.push({ word, meaning, example, definition, partOfSpeech, ipa: '', collocations: [], distractors: [], imageUrl: '' });
    }
    // Same safety net as the admin import: the words must round-trip
    // through the lesson text format.
    const parsed = add.length ? parseLessonText(lessonToText({ title, difficulty: lesson.difficulty, words: add })) : { valid: true, words: [] };
    if (!parsed.valid) throw new Error(`${title}: parser rejected ${JSON.stringify(parsed.errors).slice(0, 500)}`);
    if (parsed.words.length !== add.length) throw new Error(`${title}: round-trip lost words`);
    const noBlank = add.filter(w => !new RegExp(`\\b${escRe(w.word)}\\b`, 'i').test(w.example)).map(w => w.word);

    console.log(`\n## ${title}: ${lesson.words.length} → ${lesson.words.length + add.length} (+${add.length})`);
    if (skipped.length) console.log(`   already there: ${skipped.join(' · ')}`);
    if (noBlank.length) console.log(`   fill-blank uses definition: ${noBlank.join(' · ')}`);
    total += add.length;
    if (APPLY && add.length) {
      lesson.words.push(...add);
      if (lesson.rawImport) lesson.rawImport = lessonToText(lesson.toObject());
      await lesson.save();
    }
  }
  console.log(`\n${total} words ${APPLY ? 'added' : 'to add (dry run — re-run with --apply)'}.`);
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
