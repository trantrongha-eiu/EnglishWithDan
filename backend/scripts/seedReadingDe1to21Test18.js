// Reading de 1-21, Test 18. Passages 2 ("The return of monkey life") and 3
// ("Innovation in Business") already existed in the DB with content and
// answers. This script only adds the missing Passage 1 ("Jewels from the
// sea"). Same caveat as other newly-added tests: no answer key in the
// source PDF; correctAnswer/explanation values derived directly from
// passage text — treat as draft pending review. content is a placeholder
// with isActive:false — paste real passage text via admin UI, then flip
// isActive to true.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

const PLACEHOLDER_CONTENT = '[CẦN DÁN NỘI DUNG BÀI ĐỌC — Reading de 1-21, Test 18, Reading Passage 1: "Jewels from the sea"]';

const TARGET = {
  title: 'Jewels from the sea',
  category: 'passage1',
  content: PLACEHOLDER_CONTENT,
  questionRange: { start: 1, end: 13 },
  isActualTest: true,
  isActive: false,
  questionGroups: [
    {
      groupType: 'plain',
      instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
      questions: [
        { questionNumber: 1, type: 'true-false-ng', questionText: 'After European settlement, Tasmanian Aboriginals stopped making necklaces for a short time.', correctAnswer: 'FALSE', explanation: 'Necklace-making "continued without interruption since before the Europeans settled."' },
        { questionNumber: 2, type: 'true-false-ng', questionText: 'Aboriginal women on the Furneaux Islands made the most beautiful necklaces.', correctAnswer: 'NOT GIVEN', explanation: 'Furneaux Island women\'s tradition is described, but no comparison to other groups\' beauty is made.' },
        { questionNumber: 3, type: 'true-false-ng', questionText: 'An 1866 photograph of the leader Truganini shows her wearing a necklace she had made herself.', correctAnswer: 'NOT GIVEN', explanation: 'The photograph is mentioned, but the passage never says Truganini made the necklace herself.' },
        { questionNumber: 4, type: 'true-false-ng', questionText: 'Men assist in gathering shells growing on sea plants.', correctAnswer: 'TRUE', explanation: 'Men help collect maireener shells "found on kelp, a type of seaweed."' },
        { questionNumber: 5, type: 'true-false-ng', questionText: 'Tasmanian Aboriginal men wore long necklaces when hunting.', correctAnswer: 'FALSE', explanation: 'Hunters "would not have risked getting snagged by long necklaces" while tracking game.' },
        { questionNumber: 6, type: 'true-false-ng', questionText: 'Tasmanian Aboriginal necklaces are appreciated outside Australia.', correctAnswer: 'TRUE', explanation: 'They are included in "many national and international museum, gallery, and private collections."' },
      ],
    },
    {
      groupType: 'note-form',
      instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
      noteConfig: {
        title: 'The process of shell-stringing',
        lines: [
          'Shell-stringers must have patience and an understanding of resources available near the sea.',
          'The traditional procedure',
          "●   Hole put in shell with an instrument made of animal's bone and __Q7__",
          '●   Shells strung on natural fibre and smoked',
          '●   Shells wiped with __Q8__ to achieve a pearly surface',
          '●   Animal __Q9__ applied',
          'Changes after the Europeans arrived',
          '●   Cleaning substances like __Q10__ were used',
          '●   More complex designs achieved using needles as a tool',
          'Furneaux Islands',
          '●   Shells need to be gathered in the right __Q11__',
          '●   Shell collectors walk along the beach then __Q12__ in order to pick up shells',
          '●   Shells from beach not suitable as do not keep __Q13__ and break easily',
        ],
      },
      questions: [
        { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'tooth', explanation: 'The piercing tool was "a jawbone and sharpened tooth of a kangaroo or wallaby."' },
        { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'grass', explanation: 'Shells were "rubbed in grass to remove their outer coating and reveal the pearly surface."' },
        { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'oil', explanation: 'Shells "were later treated with penguin or muttonbird oil."' },
        { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'vinegar', explanation: 'Colonisation introduced "acidic liquids such as vinegar to clean the shells."' },
        { questionNumber: 11, type: 'fill-blank', questionText: 'Question 11', correctAnswer: 'season', explanation: '"Shell collection has its season."' },
        { questionNumber: 12, type: 'fill-blank', questionText: 'Question 12', correctAnswer: 'crawl', explanation: '"We take our lunch and crawl along on our hands and knees to get the shells."' },
        { questionNumber: 13, type: 'fill-blank', questionText: 'Question 13', correctAnswer: 'colour', explanation: 'Beach shells "are too brittle and they lose their colour."' },
      ],
    },
  ],
};

async function runSeed() {
  let created = 0, updated = 0;
  const existing = await Passage.findOne({ title: TARGET.title });
  if (!existing) {
    await Passage.create(TARGET);
    created++;
    console.log(`[SeedReadingDe1to21Test18] Created "${TARGET.title}" (placeholder content, isActive:false).`);
  } else {
    existing.questionGroups = TARGET.questionGroups;
    existing.questionRange = TARGET.questionRange;
    await existing.save();
    updated++;
    console.log(`[SeedReadingDe1to21Test18] Updated question groups for existing "${TARGET.title}" (content left untouched).`);
  }
  console.log(`\n[SeedReadingDe1to21Test18] Done. created=${created} updated=${updated}.`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingDe1to21Test18] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGET };
