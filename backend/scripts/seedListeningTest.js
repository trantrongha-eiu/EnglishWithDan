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
  name: 'Cam 17 - Test 4',
  testNumber: 4,
  seriesName: 'Cam 17',
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
          instruction: 'Questions 1–10  Complete the notes below.  Write ONE WORD for each answer.',
          noteConfig: {
            title: 'Easy Life Cleaning Services',
            lines: [
              'Basic cleaning package offered',
              '●   Cleaning all surfaces',
              '●   Cleaning the __Q1__ throughout the apartment',
              '●   Cleaning shower, sinks, toilet etc.',
              'Additional services agreed',
              '●   Every week',
              '○   Cleaning the __Q2__',
              '○   Ironing clothes - __Q3__ only',
              '●   Every month',
              '○   Cleaning all the __Q4__ from the inside',
              '○   Washing down the __Q5__',
              'Other possibilities',
              '●   They can organise a plumber or an __Q6__ if necessary.',
              '●   A special cleaning service is available for customers who are allergic to __Q7__',
              'Information on the cleaners',
              '●   Before being hired, all cleaners have a background check carried out by the __Q8__',
              '●   References are required.',
              '●   All cleaners are given __Q9__ for two weeks.',
              '●   Customers send a __Q10__ after each visit.',
              '●   Usually, each customer has one regular cleaner.',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'floor/floors' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'fridge' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'shirts' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'windows' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'balcony' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'electrician' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'dust' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'police' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'training' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'review' },
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
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 11–14  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 11, type: 'multiple-choice',
              questionText: '11   Many hotel managers are unaware that their staff often leave because of',
              options: [
                'A   a lack of training.',
                'B   long hours.',
                'C   low pay.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: '12   What is the impact of high staff turnover on managers?',
              options: [
                'A   an increased workload',
                'B   low morale',
                'C   an inability to meet targets',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   What mistake should managers always avoid?',
              options: [
                'A   failing to treat staff equally',
                'B   reorganising shifts without warning',
                'C   neglecting to have enough staff during busy periods',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   What unexpected benefit did Dunwich Hotel notice after improving staff retention rates?',
              options: [
                'A   a fall in customer complaints',
                'B   an increase in loyalty club membership',
                'C   a rise in spending per customer',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 15–20  Which way of reducing staff turnover was used in each of the following hotels? Write the correct letter, A, B or C, next to Questions 15–20.',
          matchingOptionsTitle: 'Ways of reducing staff turnover',
          matchingOptions: [
            'improving relationships and teamwork',
            'offering incentives and financial benefits',
            'providing career opportunities',
          ],
          matchingReuseAllowed: true,
          questions: [
            { questionNumber: 15, type: 'matching-info', questionText: 'The Sun Club', correctAnswer: 'A' },
            { questionNumber: 16, type: 'matching-info', questionText: 'The Portland', correctAnswer: 'C' },
            { questionNumber: 17, type: 'matching-info', questionText: 'Bluewater Hotels', correctAnswer: 'B' },
            { questionNumber: 18, type: 'matching-info', questionText: 'Pentlow Hotels', correctAnswer: 'C' },
            { questionNumber: 19, type: 'matching-info', questionText: 'Green Planet', correctAnswer: 'B' },
            { questionNumber: 20, type: 'matching-info', questionText: 'The Amesbury', correctAnswer: 'A' },
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
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 21 and 22  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 21, type: 'multi-answer-group',
              questionText: "Which TWO points do Thomas and Jeanne make about Thomas's sporting activities at school?",
              options: [
                'A   He should have felt more positive about them.',
                'B   The training was too challenging for him.',
                'C   He could have worked harder at them.',
                'D   His parents were disappointed in him.',
                'E   His fellow students admired him.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 22, type: 'multi-answer-group',
              questionText: 'Question 22',
              options: [
                'A   He should have felt more positive about them.',
                'B   The training was too challenging for him.',
                'C   He could have worked harder at them.',
                'D   His parents were disappointed in him.',
                'E   His fellow students admired him.',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 23 and 24  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 23, type: 'multi-answer-group',
              questionText: 'Which TWO feelings did Thomas experience when he was in Kenya?',
              options: [
                'A   disbelief',
                'B   relief',
                'C   stress',
                'D   gratitude',
                'E   homesickness',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 24, type: 'multi-answer-group',
              questionText: 'Question 24',
              options: [
                'A   disbelief',
                'B   relief',
                'C   stress',
                'D   gratitude',
                'E   homesickness',
              ],
              correctAnswer: 'D',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 25–30  What comment do the students make about the development of each of the following items of sporting equipment? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25–30.',
          matchingOptionsTitle: 'Comments about the development of the equipment',
          matchingOptions: [
            'It could cause excessive sweating.',
            'The material was being mass produced for another purpose.',
            'People often needed to make their own.',
            'It often had to be replaced.',
            'The material was expensive.',
            'It was unpopular among spectators.',
            'It caused injuries.',
            'No one ring it liked it at first.',
          ],
          questions: [
            { questionNumber: 25, type: 'matching-info', questionText: 'the table tennis bat', correctAnswer: 'B' },
            { questionNumber: 26, type: 'matching-info', questionText: 'the cricket helmet', correctAnswer: 'F' },
            { questionNumber: 27, type: 'matching-info', questionText: 'the cycle helmet', correctAnswer: 'A' },
            { questionNumber: 28, type: 'matching-info', questionText: 'the golf club', correctAnswer: 'D' },
            { questionNumber: 29, type: 'matching-info', questionText: 'the hockey stick', correctAnswer: 'C' },
            { questionNumber: 30, type: 'matching-info', questionText: 'the football', correctAnswer: 'G' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Maple syrup',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Maple syrup',
            lines: [
              'What is maple syrup?',
              '●   made from the sap of the maple tree',
              '●   added to food or used in cooking',
              '●   colour described as __Q31__',
              '●   very __Q32__ compared to refined sugar',
              'The maple tree',
              '●   has many species',
              '●   needs sunny days and cool nights',
              '●   maple leaf has been on the Canadian flag since 1964',
              '●   needs moist soil but does not need fertiliser as well',
              '●   best growing conditions and __Q33__ are in Canada and North America',
              'Early maple sugar producers',
              '●   made holes in the tree trunks',
              '●   used hot __Q34__ to heat the sap',
              '●   used tree bark to make containers for collection',
              '●   sweetened food and drink with sugar',
              "Today's maple syrup",
              'The trees',
              '●   Tree trunks may not have the correct __Q35__ until they have been growing for 40 years.',
              '●   The changing temperature and movement of water within the tree produces the sap.',
              'The production',
              '●   A tap drilled into the trunk and a __Q36__ carries the sap into a bucket.',
              '●   Large pans of sap called evaporators are heated by means of a __Q37__.',
              '●   A lot of __Q38__ is produced during the evaporation process.',
              "●   'Sugar sand' is removed because it makes the syrup look __Q39__ and affects the taste.",
              '●   The syrup is ready for use.',
              '●   A huge quantity of sap is needed to make a __Q40__ of maple syrup.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'golden' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'healthy' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'climate' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'rock/rocks' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'diameter' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'tube' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'fire' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'steam' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'cloudy' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'litre/liter' },
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
