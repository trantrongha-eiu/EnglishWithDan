'use strict';
// One-off: move "Irregular Verbs" out of the Paraphrase units (VocabUnit #21)
// into Vocab Topics (VocabularyLesson). Each card becomes
//   word    = past form as used in the example ("arose")
//   meaning = "arise (nảy sinh, phát sinh)"
// so the quiz still drills base verb → past form (fill-blank, MCQ, listen...).
// The unit is backed up to scripts/data/ before it is deleted.
//
//   node scripts/moveIrregularVerbsToTopics.js          # dry run
//   node scripts/moveIrregularVerbsToTopics.js --apply

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const VocabUnit = require('../models/VocabUnit');
const VocabularyLesson = require('../models/VocabularyLesson');
const { parseLessonText, lessonToText } = require('../services/vocabularyLessonParser');

const APPLY = process.argv.includes('--apply');
const UNIT_NUMBER = 21;
const FIXES = { 'bust (nổ, vỡ)': 'burst (nổ, vỡ)' }; // typo in the original unit

const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const unit = await VocabUnit.findOne({ unitNumber: UNIT_NUMBER }).lean();
  if (!unit || !/irregular/i.test(unit.title)) throw new Error(`Unit ${UNIT_NUMBER} is not Irregular Verbs`);

  const problems = [];
  const words = unit.words.map(w => {
    const label = FIXES[w.word] || w.word;                 // "arise (nảy sinh, phát sinh)"
    const base = label.replace(/\s*\(.*$/, '').trim();     // "arise"
    const forms = w.meaning.split('/').map(s => s.trim()).filter(Boolean);
    // Use the form that appears in the example so fill-in-the-blank works.
    const form = forms.find(f => new RegExp(`\\b${escRe(f)}\\b`, 'i').test(w.example)) || forms[0];
    if (!new RegExp(`\\b${escRe(form)}\\b`, 'i').test(w.example)) problems.push(`${base}: "${form}" not in example`);
    const definition = forms.length > 1
      ? `Past simple (V2) of "${base}": ${forms.join(' / ')}`
      : `Past simple (V2) of "${base}"`;
    return { word: form, meaning: label, example: w.example, definition, collocations: [], distractors: [] };
  });

  const dupes = words.map(w => w.word.toLowerCase()).filter((w, i, a) => a.indexOf(w) !== i);
  if (dupes.length) problems.push(`duplicate words: ${dupes.join(', ')}`);

  const last = await VocabularyLesson.findOne({}).sort({ order: -1 }).lean();
  const admin = await VocabularyLesson.findOne({ published: true }).sort({ createdAt: -1 }).lean();
  const lesson = {
    title: unit.title,
    description: '150 động từ bất quy tắc thường gặp: học dạng quá khứ (V2) qua câu ví dụ.',
    difficulty: 'B1',
    order: (last?.order ?? 0) + 1,
    targetClass: '',
    published: true,
    createdBy: admin.createdBy,
    words,
  };
  lesson.rawImport = lessonToText(lesson);
  const parsed = parseLessonText(lesson.rawImport);
  if (!parsed.valid) problems.push(`parser rejected: ${JSON.stringify(parsed.errors).slice(0, 500)}`);

  console.log(`${words.length} words, order ${lesson.order}`);
  words.slice(0, 4).forEach(w => console.log(' ', w.word, '|', w.meaning, '|', w.definition));
  if (problems.length) { console.log('PROBLEMS:\n ' + problems.join('\n ')); process.exit(1); }
  if (await VocabularyLesson.exists({ title: lesson.title })) throw new Error('Lesson already exists');
  if (!APPLY) { console.log('Dry run OK. Re-run with --apply.'); process.exit(0); }

  const backup = path.join(__dirname, 'data', `vocabUnit${UNIT_NUMBER}_irregularVerbs_backup.json`);
  fs.writeFileSync(backup, JSON.stringify(unit, null, 2));
  const created = await VocabularyLesson.create(lesson);
  await VocabUnit.deleteOne({ _id: unit._id });
  console.log(`Created lesson ${created._id}, deleted unit ${unit._id}. Backup: ${backup}`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
