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
  name: 'Cam 21 - Test 2',
  testNumber: 2,
  seriesName: 'Cam 21',
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
          groupType: 'table',
          groupTitle: 'One-day classes at Steynford College',
          instruction: 'Questions 1–10  Complete the table below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          tableConfig: {
            headers: ['Course', 'Date', 'Cost', 'Notes'],
            rows: [
              ['Vietnamese food', '__Q1__', '£59', 'It provides information on the use of herbs.<br>There are no places at present.'],
              ['Bread making', '20 March', '£__Q2__', 'There is also an extra charge for ingredients.<br>Participants make white bread, sourdough and __Q3__.'],
              ['Face massage', '23 February', '£35', 'The teacher trained in __Q4__.<br>Bring a __Q5__.'],
              ['Candle making', '__Q6__', '£52', 'Only __Q7__ ingredients are used.<br>The candles can be used as presents.'],
              ['Silk painting', '18 May', '£__Q8__', 'Bring an apron or old __Q9__.'],
              ['DIY for beginners', '24 February', '£125', 'Learn how to<br>●   use a drill, saw and __Q10__.<br>●   put up a shelf.'],
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: '13 January/13th January/the 13th of January/13.01/13.1' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: '48/forty-eight' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'pizza' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'India' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'mirror' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: '6 April/6th April/the 6th of April/06.04/6.4' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'natural' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: '67.50/sixty-seven fifty' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'shirt' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'hammer' },
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
          instruction: 'Questions 11 and 12  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 11, type: 'multi-answer-group',
              questionText: 'Which TWO pieces of advice are given about the Marsden Coastal Walk?',
              options: [
                'A   Stop for lunch in an ancient town.',
                "B   Don't miss the ruins of a certain building.",
                'C   Catch a boat to the start of this walk.',
                'D   Be careful of the steep and rocky paths.',
                "E   Don't worry about getting lost.",
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 12, type: 'multi-answer-group',
              questionText: 'Question 12',
              options: [
                'A   Stop for lunch in an ancient town.',
                "B   Don't miss the ruins of a certain building.",
                'C   Catch a boat to the start of this walk.',
                'D   Be careful of the steep and rocky paths.',
                "E   Don't worry about getting lost.",
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 13 and 14  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 13, type: 'multi-answer-group',
              questionText: 'Which TWO things are said about the Melby Heritage Walk?',
              options: [
                'A   This walk is mostly downhill.',
                'B   The paths can get busy during the day.',
                'C   This is a circular walk.',
                'D   A tower stands on the site of an older structure.',
                'E   There are far-reaching views the whole way.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 14, type: 'multi-answer-group',
              questionText: 'Question 14',
              options: [
                'A   This walk is mostly downhill.',
                'B   The paths can get busy during the day.',
                'C   This is a circular walk.',
                'D   A tower stands on the site of an older structure.',
                'E   There are far-reaching views the whole way.',
              ],
              correctAnswer: 'D',
            },
          ],
        },
        {
          groupType: 'map',
          groupTitle: '',
          instruction: 'Questions 15–20  Label the map below.  Write the correct letter, A-I, next to Questions 15–20.',
          imageUrl: '', // admin: upload the "Melby Coal Mine" map/plan image here
          questions: [
            { questionNumber: 15, type: 'map-labelling', questionText: 'Exhibition', correctAnswer: 'F' },
            { questionNumber: 16, type: 'map-labelling', questionText: 'Baths', correctAnswer: 'B' },
            { questionNumber: 17, type: 'map-labelling', questionText: 'Tools', correctAnswer: 'D' },
            { questionNumber: 18, type: 'map-labelling', questionText: 'Vehicles', correctAnswer: 'A' },
            { questionNumber: 19, type: 'map-labelling', questionText: 'Ponies', correctAnswer: 'H' },
            { questionNumber: 20, type: 'map-labelling', questionText: 'Education centre', correctAnswer: 'E' },
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
              questionText: 'Which TWO facts in the sessions on food safety were new information for Nadia and Fergus?',
              options: [
                'A   the amount of plastic in the ocean',
                'B   the number of diseases caused by contaminated food',
                'C   the amount of food that is wasted',
                'D   the number of people who are obese',
                'E   the result of treating animals with antibiotics',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 22, type: 'multi-answer-group',
              questionText: 'Question 22',
              options: [
                'A   the amount of plastic in the ocean',
                'B   the number of diseases caused by contaminated food',
                'C   the amount of food that is wasted',
                'D   the number of people who are obese',
                'E   the result of treating animals with antibiotics',
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
              questionText: 'Which TWO features of a project aiming to prevent food fraud impressed Fergus?',
              options: [
                'A   the new technology it used',
                'B   the publicity it received',
                'C   the use of multiple tests on food items',
                'D   the variety of dietary requirements included',
                'E   the way information was made widely accessible',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 24, type: 'multi-answer-group',
              questionText: 'Question 24',
              options: [
                'A   the new technology it used',
                'B   the publicity it received',
                'C   the use of multiple tests on food items',
                'D   the variety of dietary requirements included',
                'E   the way information was made widely accessible',
              ],
              correctAnswer: 'D',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 25 and 26  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 25, type: 'multi-answer-group',
              questionText: 'Which TWO topics do both students recommend should be included in the course?',
              options: [
                'A   sustainable fishing',
                'B   targeted nutrition',
                'C   global differences in consumption',
                'D   sustainable agriculture',
                'E   digital technology and food',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 26, type: 'multi-answer-group',
              questionText: 'Question 26',
              options: [
                'A   sustainable fishing',
                'B   targeted nutrition',
                'C   global differences in consumption',
                'D   sustainable agriculture',
                'E   digital technology and food',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'summary-completion',
          groupTitle: 'Student project: developing a new food product',
          instruction: 'Questions 27–30  Complete the flow-chart below.  Choose FOUR answers from the box and write the correct letter, A-F, next to Questions 27–30.',
          summaryConfig: {
            text: 'Initial aim<br>__Q27__<br>↓<br>Literature review<br>__Q28__<br>↓<br>Product development<br>__Q29__<br>↓<br>Product production<br>__Q30__',
            wordBank: [
              { letter: 'A', word: 'This was challenging but enjoyable.' },
              { letter: 'B', word: 'This led to some disagreement.' },
              { letter: 'C', word: 'This was easy to decide on.' },
              { letter: 'D', word: 'This was helped by the guidelines provided.' },
              { letter: 'E', word: 'This seemed like an unnecessary stage.' },
              { letter: 'F', word: 'This involved selecting a new ingredient.' },
            ],
          },
          questions: [
            { questionNumber: 27, type: 'fill-blank', questionText: 'Question 27', correctAnswer: 'This was easy to decide on.' },
            { questionNumber: 28, type: 'fill-blank', questionText: 'Question 28', correctAnswer: 'This was helped by the guidelines provided.' },
            { questionNumber: 29, type: 'fill-blank', questionText: 'Question 29', correctAnswer: 'This led to some disagreement.' },
            { questionNumber: 30, type: 'fill-blank', questionText: 'Question 30', correctAnswer: 'This involved selecting a new ingredient.' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Challenges facing the cruise ship industry',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Challenges facing the cruise ship industry',
            lines: [
              'Problems with overtourism',
              '●   __Q31__ is one of the worst problems.',
              '●   A tourist __Q32__ is being introduced in some cities to reduce numbers, e.g. Barcelona.',
              "●   Bruges: action was taken to limit day trips from the nearby port because the city was becoming a 'theme park' (e.g. many shops were only stocking __Q33__ and souvenirs).",
              '●   Dubrovnik: limits the number of tourists by managing the __Q34__ of cruise ship arrivals.',
              'Problems of perception',
              '●   Cruises are generally associated with the elderly.',
              '●   There is an assumption about the __Q35__ of cruises.',
              '●   People think there may be too many __Q36__.',
              'Solutions',
              'Cruise lines are attracting younger customers by:',
              '●   becoming more sustainable e.g. using hybrid engines.',
              '●   having a wide range of activities e.g. boxing, __Q37__ and well-being programmes.',
              '●   offering a diverse selection of food including __Q38__ options.',
              '●   providing reliable __Q39__.',
              '●   improving marketing on social media with high quality __Q40__.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'Pollution' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'tax' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'chocolate' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'timing' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'cost' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'rules' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'diving' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'vegan' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'wifi' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'videos' },
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
