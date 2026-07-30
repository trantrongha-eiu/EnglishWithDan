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
  name: 'Cam 16 - Test 2',
  testNumber: 2,
  seriesName: 'Cam 16',
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
            title: 'Copying photos to digital format',
            lines: [
              'Name of company: Picturerep',
              'Requirements',
              '●   Maximum size of photos is 30 cm, minimum size 4 cm.',
              '●   Photos must not be in a __Q1__ or an album.',
              'Cost',
              '●   The cost for 360 photos is £__Q2__ (including one disk).',
              '●   Before the complete order is sent, __Q3__ is required.',
              'Services included in the price',
              '●   Photos can be placed in a folder, e.g. with the name __Q4__.',
              '●   The __Q5__ and contrast can be improved if necessary.',
              '●   Photos which are very fragile will be scanned by __Q6__.',
              'Special restore service (costs extra)',
              '●   It may be possible to remove an object from a photo, or change the __Q7__.',
              '●   A photo which is not correctly in __Q8__ cannot be fixed.',
              'Other information',
              '●   Orders are completed within __Q9__.',
              '●   Send the photos in a box (not __Q10__).',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'frame' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: '195' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'payment' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'Grandparents' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'colour/color' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'hand' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'background' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'focus' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'ten days/10 days' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'plastic' },
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
          instruction: 'Questions 11–15  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 11, type: 'multiple-choice',
              questionText: '11   Dartfield House school used to be',
              options: [
                'A   a tourist information centre.',
                'B   a private home.',
                'C   a local council building.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: '12   What is planned with regard to the lower school?',
              options: [
                'A   All buildings on the main site will be improved.',
                'B   The lower school site will be used for new homes.',
                'C   Additional school buildings will be constructed on the lower school site.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   The catering has been changed because of',
              options: [
                'A   long queuing times.',
                'B   changes to the school timetable.',
                'C   dissatisfaction with the menus.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   Parents are asked to',
              options: [
                'A   help their children to decide in advance which serving point to use.',
                'B   make sure their children have enough money for food.',
                'C   advise their children on healthy food to eat.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 15, type: 'multiple-choice',
              questionText: '15   What does the speaker say about the existing canteen?',
              options: [
                'A   Food will still be served there.',
                'B   Only staff will have access to it.',
                'C   Pupils can take their food into it.',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 16–18  What comment does the speaker make about each of the following serving points in the Food Hall? Choose THREE answers from the box and write the correct letter, A-D, next to Questions 16–18.',
          matchingOptionsTitle: 'Comments',
          matchingOptions: [
            'pupils help to plan menus',
            'only vegetarian food',
            'different food every week',
            'daily change in menu',
          ],
          questions: [
            { questionNumber: 16, type: 'matching-info', questionText: 'World Adventures', correctAnswer: 'D' },
            { questionNumber: 17, type: 'matching-info', questionText: 'Street Life', correctAnswer: 'A' },
            { questionNumber: 18, type: 'matching-info', questionText: 'Speedy Italian', correctAnswer: 'B' },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 19 and 20  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 19, type: 'multi-answer-group',
              questionText: 'Which TWO optional after-school lessons are new?',
              options: [
                'A   swimming',
                'B   piano',
                'C   acting',
                'D   cycling',
                'E   theatre sound and lighting',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 20, type: 'multi-answer-group',
              questionText: 'Question 20',
              options: [
                'A   swimming',
                'B   piano',
                'C   acting',
                'D   cycling',
                'E   theatre sound and lighting',
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
      title: 'Assignment on sleep and dreams',
      description: '',
      transcript: '',
      questionRange: { start: 21, end: 30 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 21–24  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 21, type: 'multiple-choice',
              questionText: '21   Luke read that one reason why we often forget dreams is that',
              options: [
                'A   our memories cannot cope with too much information.',
                'B   we might otherwise be confused about what is real.',
                'C   we do not think they are important.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 22, type: 'multiple-choice',
              questionText: '22   What do Luke and Susie agree about dreams predicting the future?',
              options: [
                'A   It may just be due to chance.',
                'B   It only happens with certain types of event.',
                'C   It happens more often than some people think.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 23, type: 'multiple-choice',
              questionText: '23   Susie says that a study on pre-school children having a short nap in the day',
              options: [
                'A   had controversial results.',
                'B   used faulty research methodology.',
                'C   failed to reach any clear conclusions.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 24, type: 'multiple-choice',
              questionText: '24   In their last assignment, both students had problems with',
              options: [
                'A   statistical analysis.',
                'B   making an action plan.',
                'C   self-assessment',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 25–30  Complete the flow chart below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Assignment plan',
            lines: [
              'Decide on research question:',
              'Is there a relationship between hours of sleep and number of dreams?',
              '↓',
              'Decide on sample:',
              'Twelve students from the __Q25__ department',
              '↓',
              'Decide on methodology:',
              'Self-reporting',
              '↓',
              'Decide on procedure:',
              'Answers on __Q26__',
              '↓',
              'Check ethical guidelines for working with __Q27__',
              'Ensure that risk is assessed and __Q28__ is kept to a minimum',
              '↓',
              'Analyse the results',
              'Calculate the correlation and make a __Q29__',
              '↓',
              '__Q30__ the research',
            ],
          },
          questions: [
            { questionNumber: 25, type: 'fill-blank', questionText: 'Question 25', correctAnswer: 'history' },
            { questionNumber: 26, type: 'fill-blank', questionText: 'Question 26', correctAnswer: 'paper' },
            { questionNumber: 27, type: 'fill-blank', questionText: 'Question 27', correctAnswer: 'humans/people' },
            { questionNumber: 28, type: 'fill-blank', questionText: 'Question 28', correctAnswer: 'stress' },
            { questionNumber: 29, type: 'fill-blank', questionText: 'Question 29', correctAnswer: 'graph' },
            { questionNumber: 30, type: 'fill-blank', questionText: 'Question 30', correctAnswer: 'evaluate' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Health benefits of dance',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Health benefits of dance',
            lines: [
              'Recent findings:',
              '●   All forms of dance produce various hormones associated with feelings of happiness.',
              '●   Dancing with others has a more positive impact than dancing alone.',
              '●   An experiment on university students suggested that dance increases __Q31__.',
              '●   For those with mental illness, dance could be used as a form of __Q32__.',
              'Benefits of dance for older people:',
              '●   accessible for people with low levels of __Q33__',
              '●   reduces the risk of heart disease',
              '●   better __Q34__ reduces the risk of accidents',
              '●   improves __Q35__ function by making it work faster',
              "●   improves participants' general well-being",
              '●   gives people more __Q36__ to take exercise',
              '●   can lessen the feeling of __Q37__, very common in older people',
              'Benefits of Zumba:',
              '●   A study at The University of Wisconsin showed that doing Zumba for 40 minutes uses up as many __Q38__ as other quite intense forms of exercise.',
              '●   The American Journal of Health Behavior study showed that:',
              '○   women suffering from __Q39__ benefited from doing Zumba.',
              '○   Zumba became a __Q40__ for the participants.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'creativity' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'therapy' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'fitness' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'balance' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'brain' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'motivation' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'isolation' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'calories' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'obesity' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'habit' },
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
