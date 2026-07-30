// Generic one-off content seed — inserts the TEST doc below as a normal
// ListeningTest so it shows up in admin's Đề Listening list exactly like
// every other hand-entered test (Cam 20, Actual Tests, ...): editable name,
// editable questions, and ready for the admin to attach the full-test audio
// and any map images via the existing admin UI (the schema only supports
// one audio file per test, not per-part — same as all existing tests, so
// audio is left blank here for admin to upload).
//
// Reused per test: edit TEST below to the next test's content, then run
// `node scripts/seedListeningTest.js` from backend/. Safe to re-run — skips
// if a test with this exact name already exists. Each past run's content is
// preserved in git history (see log for prior seeds under this filename).

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningTest = require('../models/ListeningTest');

const TEST = {
  name: 'Cam 19 - Test 3',
  testNumber: 3,
  seriesName: 'Cam 19',
  audioUrl: '',
  audioFileName: '',
  audioDuration: 0,
  isActive: true,
  sections: [
    // ── PART 1 (Q1–10) ──────────────────────────────────────────────
    {
      partNumber: 1,
      title: 'Part 1',
      description: '',
      transcript: '',
      questionRange: { start: 1, end: 10 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 1–6  Complete the notes below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          noteConfig: {
            title: 'Local food shops',
            lines: [
              'Where to go',
              '●   Kite Place – near the __Q1__',
              'Fish market',
              '●   cross the __Q2__ and turn right',
              '●   best to go before __Q3__ pm, earlier than closing time',
              'Organic shop',
              "●   called '__Q4__'",
              '●   below a restaurant in the large, grey building',
              '●   look for the large __Q5__ outside',
              'Supermarket',
              '●   take a __Q6__ minibus, number 289',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'harbour/harbor' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'bridge' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: '3.30/three thirty/½/half 3/three' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'Rose/rose' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'sign' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'purple' },
          ],
        },
        {
          groupType: 'table',
          groupTitle: '',
          instruction: 'Questions 7–10  Complete the table below.  Write ONE WORD ONLY for each answer.',
          tableConfig: {
            headers: ['', 'To buy', 'Other ideas'],
            rows: [
              ['Fish market', 'a dozen prawns', 'a handful of __Q7__ (type of seaweed)'],
              ['Organic shop', 'beans and a __Q8__ for dessert', 'spices and __Q9__'],
              ['Bakery', 'a brown loaf', 'a __Q10__ tart'],
            ],
          },
          questions: [
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'samphire' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'melon' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'coconut' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'strawberry' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: 'Part 2',
      description: '',
      transcript: '',
      questionRange: { start: 11, end: 20 },
      questionGroups: [
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 11–16  What information is given about each of the following festival workshops? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 11–16.',
          matchingOptionsTitle: 'Information',
          matchingOptions: [
            'involves painting and drawing',
            'will be led by a prize-winning author',
            'is aimed at children with a disability',
            'involves a drama activity',
            'focuses on new relationships',
            'explores an unhappy feeling',
            'is aimed at a specific age group',
            'raises awareness of a particular culture',
          ],
          questions: [
            { questionNumber: 11, type: 'matching-info', questionText: 'Superheroes', correctAnswer: 'C' },
            { questionNumber: 12, type: 'matching-info', questionText: 'Just do it', correctAnswer: 'D' },
            { questionNumber: 13, type: 'matching-info', questionText: 'Count on me', correctAnswer: 'F' },
            { questionNumber: 14, type: 'matching-info', questionText: 'Speak up', correctAnswer: 'G' },
            { questionNumber: 15, type: 'matching-info', questionText: 'Jump for joy', correctAnswer: 'B' },
            { questionNumber: 16, type: 'matching-info', questionText: 'Sticks and stones', correctAnswer: 'H' },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 17 and 18  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 17, type: 'multi-answer-group',
              questionText: 'Which TWO reasons does the speaker give for recommending Alive and Kicking?',
              options: [
                'A   It will appeal to both boys and girls.',
                'B   The author is well known.',
                'C   It has colourful illustrations.',
                'D   It is funny.',
                'E   It deals with an important topic.',
              ],
              correctAnswer: 'D',
            },
            {
              questionNumber: 18, type: 'multi-answer-group',
              questionText: 'Question 18',
              options: [
                'A   It will appeal to both boys and girls.',
                'B   The author is well known.',
                'C   It has colourful illustrations.',
                'D   It is funny.',
                'E   It deals with an important topic.',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 19 and 20  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 19, type: 'multi-answer-group',
              questionText: 'Which TWO pieces of advice does the speaker give to parents about reading?',
              options: [
                'A   Encourage children to write down new vocabulary.',
                'B   Allow children to listen to audio books.',
                'C   Get recommendations from librarians.',
                'D   Give children a choice about what they read.',
                'E   Only read aloud to children until they can read independently.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 20, type: 'multi-answer-group',
              questionText: 'Question 20',
              options: [
                'A   Encourage children to write down new vocabulary.',
                'B   Allow children to listen to audio books.',
                'C   Get recommendations from librarians.',
                'D   Give children a choice about what they read.',
                'E   Only read aloud to children until they can read independently.',
              ],
              correctAnswer: 'C',
            },
          ],
        },
      ],
    },

    // ── PART 3 (Q21–30) ─────────────────────────────────────────────
    {
      partNumber: 3,
      title: 'Science experiment for Year 12 students',
      description: '',
      transcript: '',
      questionRange: { start: 21, end: 30 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 21-25  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 21, type: 'multiple-choice',
              questionText: '21   How does Clare feel about the students in her Year 12 science class?',
              options: [
                'A   worried that they are not making progress',
                'B   challenged by their poor behaviour in class',
                'C   frustrated at their lack of interest in the subject',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 22, type: 'multiple-choice',
              questionText: "22   How does Jake react to Clare's suggestion about an experiment based on children's diet?",
              options: [
                'A   He is concerned that the results might not be meaningful.',
                'B   He feels some of the data might be difficult to obtain.',
                'C   He suspects that the conclusions might be upsetting.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 23, type: 'multiple-choice',
              questionText: '23   What problem do they agree may be involved in an experiment involving animals?',
              options: [
                'A   Any results may not apply to humans.',
                'B   It may be complicated to get permission.',
                'C   Students may not be happy about animal experiments.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 24, type: 'multiple-choice',
              questionText: '24   What question do they decide the experiment should address?',
              options: [
                'A   Are mice capable of controlling their food intake?',
                'B   Does an increase in sugar lead to health problems?',
                'C   How much do supplements of different kinds affect health?',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 25, type: 'multiple-choice',
              questionText: '25   Clare might also consider doing another experiment involving',
              options: [
                'A   other types of food supplement.',
                'B   different genetic strains of mice.',
                'C   varying amounts of exercise.',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'summary-completion',
          groupTitle: '',
          instruction: 'Questions 26-30  Complete the flowchart below.  Choose FIVE answers from the box and write the correct letter, A-H, next to Questions 26-30.',
          summaryConfig: {
            text: 'Choose mice which are all the same __Q26__.<br>↓<br>Divide the mice into two groups, each with a different __Q27__.<br>↓<br>Put each group in a separate cage.<br>Feed group A commercial mouse food.<br>Feed group B the same, but also sugar contained in __Q28__.<br>↓<br>Take measurements using an electronic scale.<br>Place them in a weighing chamber to prevent __Q29__.<br>↓<br>Do all necessary __Q30__.',
            wordBank: [
              { letter: 'A', word: 'size' },
              { letter: 'B', word: 'escape' },
              { letter: 'C', word: 'age' },
              { letter: 'D', word: 'water' },
              { letter: 'E', word: 'cereal' },
              { letter: 'F', word: 'calculations' },
              { letter: 'G', word: 'changes' },
              { letter: 'H', word: 'colour' },
            ],
          },
          questions: [
            { questionNumber: 26, type: 'fill-blank', questionText: 'Question 26', correctAnswer: 'age' },
            { questionNumber: 27, type: 'fill-blank', questionText: 'Question 27', correctAnswer: 'size' },
            { questionNumber: 28, type: 'fill-blank', questionText: 'Question 28', correctAnswer: 'cereal' },
            { questionNumber: 29, type: 'fill-blank', questionText: 'Question 29', correctAnswer: 'escape' },
            { questionNumber: 30, type: 'fill-blank', questionText: 'Question 30', correctAnswer: 'calculations' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Microplastics',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Microplastics',
            lines: [
              'Where microplastics come from',
              '●   fibres from some __Q31__ during washing',
              '●   the breakdown of large pieces of plastic',
              '●   waste from industry',
              '●   the action of vehicle tyres on roads',
              'Effects of microplastics',
              '●   They cause injuries to the __Q32__ of wildlife and affect their digestive systems.',
              '●   They enter the food chain, e.g., in bottled and tap water, __Q33__ and seafood.',
              '●   They may not affect human health, but they are already banned in skin cleaning products and __Q34__ in some countries.',
              '●   Microplastics enter the soil through the air, rain and __Q35__.',
              'Microplastics in the soil – a study by Anglia Ruskin University',
              '●   Earthworms are important because they add __Q36__ to the soil.',
              '●   The study aimed to find whether microplastics in earthworms affect the __Q37__ of plants.',
              '●   The study found that microplastics caused:',
              '○   __Q38__ loss in earthworms',
              '○   fewer seeds to germinate',
              '○   a rise in the level of __Q39__ in the soil.',
              'The study concluded:',
              '○   soil should be seen as an important natural process.',
              '○   changes to soil damage both ecosystems and __Q40__.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'clothing' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'mouths' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'salt' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'toothpaste' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'fertilisers/fertilizers' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'nutrients' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'growth' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'weight' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'acid' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'society' },
          ],
        },
      ],
    },
  ],
};

async function runSeed() {
  const existing = await ListeningTest.findOne({ name: TEST.name }).lean();
  if (existing) {
    console.log(`[SeedListeningTest] "${TEST.name}" already exists (_id=${existing._id}) – skip`);
    return existing;
  }
  const doc = await ListeningTest.create(TEST);
  console.log(`[SeedListeningTest] Inserted "${TEST.name}" (_id=${doc._id}, ${doc.totalQuestions} questions)`);
  return doc;
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedListeningTest] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TEST };
