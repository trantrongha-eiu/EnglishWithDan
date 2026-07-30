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
  name: 'Cam 15 - Test 3',
  testNumber: 3,
  seriesName: 'Cam 15',
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
          instruction: 'Questions 1–10  Complete the notes below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          noteConfig: {
            title: 'Employment Agency: Possible Jobs',
            lines: [
              'First Job',
              'Administrative assistant in a company that produces __Q1__ (North London)',
              'Responsibilities',
              '●   data entry',
              '●   go to __Q2__ and take notes',
              '●   general admin',
              '●   management of __Q3__',
              'Requirements',
              '●   good computer skills including spreadsheets',
              '●   good interpersonal skills',
              '●   attention to __Q4__',
              'Experience',
              '●   need a minimum of __Q5__ of experience of teleconferencing',
              'Second Job',
              'Warehouse assistant in South London',
              'Responsibilities',
              '●   stock management',
              '●   managing __Q6__',
              'Requirements',
              '●   ability to work with numbers',
              '●   good computer skills',
              '●   very organised and __Q7__',
              '●   good communication skills',
              '●   used to working in a __Q8__',
              '●   able to cope with items that are __Q9__',
              'Need experience of',
              '●   driving in London',
              '●   warehouse work',
              '●   __Q10__ service',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'furniture' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'meetings' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'diary' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'detail/details' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: '1/one year' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'deliveries' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'tidy' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'team' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'heavy' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'customer' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: 'Street Play Scheme',
      description: '',
      transcript: '',
      questionRange: { start: 11, end: 20 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 11–16  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 11, type: 'multiple-choice',
              questionText: '11   When did the Street Play Scheme first take place?',
              options: [
                'A   two years ago',
                'B   three years ago',
                'C   six years ago',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: '12   How often is Beechwood Road closed to traffic now?',
              options: [
                'A   once a week',
                'B   on Saturdays and Sundays',
                'C   once a month',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   Who is responsible for closing the road?',
              options: [
                'A   a council official',
                'B   the police',
                'C   local wardens',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   Residents who want to use their cars',
              options: [
                'A   have to park in another street.',
                'B   must drive very slowly',
                'C   need permission from a warden.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 15, type: 'multiple-choice',
              questionText: '15   Alice says that Street Play Schemes are most needed in',
              options: [
                'A   wealthy areas',
                'B   quiet suburban areas.',
                'C   areas with heavy traffic.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 16, type: 'multiple-choice',
              questionText: '16   What has been the reaction of residents who are not parents?',
              options: [
                'A   Many of them were unhappy at first.',
                'B   They like seeing children play in the street.',
                'C   They are surprised by the lack of noise.',
              ],
              correctAnswer: 'B',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 17 and 18  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 17, type: 'multi-answer-group',
              questionText: 'Which TWO benefits for children does Alice think are the most important?',
              options: [
                'A   increased physical activity',
                'B   increased sense of independence',
                'C   opportunity to learn new games',
                'D   opportunity to be part of a community',
                'E   opportunity to make new friends',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 18, type: 'multi-answer-group',
              questionText: 'Question 18',
              options: [
                'A   increased physical activity',
                'B   increased sense of independence',
                'C   opportunity to learn new games',
                'D   opportunity to be part of a community',
                'E   opportunity to make new friends',
              ],
              correctAnswer: 'D',
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
              questionText: 'Which TWO results of the King Street experiment surprised Alice?',
              options: [
                'A   more shoppers',
                'B   improved safety',
                'C   less air pollution',
                'D   more relaxed atmosphere',
                'E   less noise pollution',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 20, type: 'multi-answer-group',
              questionText: 'Question 20',
              options: [
                'A   more shoppers',
                'B   improved safety',
                'C   less air pollution',
                'D   more relaxed atmosphere',
                'E   less noise pollution',
              ],
              correctAnswer: 'E',
            },
          ],
        },
      ],
    },

    // ── PART 3 (Q21–30) ─────────────────────────────────────────────
    {
      partNumber: 3,
      title: 'Part 3',
      description: '',
      transcript: '',
      questionRange: { start: 21, end: 30 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 21–26  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'What Hazel should analyse about items in newspapers:',
            lines: [
              '●   what __Q21__ the item is on',
              '●   the __Q22__ of the item, including the headline',
              '●   any __Q23__ accompanying the item',
              "●   the __Q24__ of the item, e.g. what's made prominent",
              "●   the writer's main __Q25__",
              '●   the __Q26__ the writer may make about the reader',
            ],
          },
          questions: [
            { questionNumber: 21, type: 'fill-blank', questionText: 'Question 21', correctAnswer: 'page' },
            { questionNumber: 22, type: 'fill-blank', questionText: 'Question 22', correctAnswer: 'size' },
            { questionNumber: 23, type: 'fill-blank', questionText: 'Question 23', correctAnswer: 'graphic/graphics' },
            { questionNumber: 24, type: 'fill-blank', questionText: 'Question 24', correctAnswer: 'structure' },
            { questionNumber: 25, type: 'fill-blank', questionText: 'Question 25', correctAnswer: 'purpose' },
            { questionNumber: 26, type: 'fill-blank', questionText: 'Question 26', correctAnswer: 'assumption/assumptions' },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 27–30  What does Hazel decide to do about each of the following types of articles? Write the correct letter, A, B or C, next to Questions 27–30.',
          matchingOptionsTitle: 'Types of articles',
          matchingOptions: [
            'She will definitely look for a suitable article.',
            'She may look for a suitable article.',
            "She definitely won't look for an article.",
          ],
          matchingReuseAllowed: true,
          questions: [
            { questionNumber: 27, type: 'matching-info', questionText: 'national news item', correctAnswer: 'A' },
            { questionNumber: 28, type: 'matching-info', questionText: 'editorial', correctAnswer: 'C' },
            { questionNumber: 29, type: 'matching-info', questionText: 'human interest', correctAnswer: 'C' },
            { questionNumber: 30, type: 'matching-info', questionText: 'arts', correctAnswer: 'B' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Early history of keeping clean',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Early history of keeping clean',
            lines: [
              'Prehistoric times:',
              '●   water was used to wash off __Q31__',
              'Ancient Babylon',
              '●   soap-like material found in __Q32__ cylinders',
              'Ancient Greece:',
              '●   people cleaned themselves with sand and other substances',
              '●   used a strigil – scraper made of __Q33__',
              '●   washed clothes in streams',
              'Ancient Germany and Gaul:',
              '●   used soap to colour their __Q34__',
              'Ancient Rome:',
              '●   animal fat, ashes and clay mixed through action of rain, used for washing clothes',
              '●   from about 312 BC, water carried to Roman __Q35__ by aqueducts',
              'Europe in Middle Ages:',
              '●   decline in bathing contributed to occurrence of __Q36__',
              '●   __Q37__ began to be added to soap',
              'Europe from 17th century:',
              '●   1600s: cleanliness and bathing started becoming usual',
              '●   1791: Leblanc invented a way of making soda ash from __Q38__',
              '●   early 1800s: Chevreul turned soapmaking into a __Q39__',
              '●   from 1800s, there was no longer a __Q40__ on soap.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'mud' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'clay' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'metal' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'hair' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'bath/baths' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'disease/diseases' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'perfume' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'salt' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'science' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'tax' },
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
