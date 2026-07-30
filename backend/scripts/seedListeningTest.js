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
  name: 'Cam 19 - Test 4',
  testNumber: 4,
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
            title: 'First day at work',
            lines: [
              '●   Name of supervisor: __Q1__',
              '●   Where to leave coat and bag: use __Q2__ in staffroom',
              '●   See Tiffany in HR: to give __Q3__ number, to collect __Q4__',
              '●   Location of HR office: on __Q5__ floor',
              "●   Supervisor's mobile number: __Q6__",
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'Kaeden' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'locker/lockers' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'passport' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'uniform' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'third/3rd' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: '0412 665 903' },
          ],
        },
        {
          groupType: 'table',
          groupTitle: '',
          instruction: 'Questions 7–10  Complete the table below.  Write ONE WORD ONLY for each answer.',
          tableConfig: {
            headers: ['', 'Task 1', 'Task 2', 'Notes'],
            rows: [
              ['Bakery section', 'Check sell-by dates', 'Change price labels', 'Use __Q7__ labels'],
              ['Sushi takeaway counter', 'Re-stock with __Q8__ boxes if needed', 'Wipe preparation area and clean the sink', 'Do not clean any knives'],
              ['Meat and fish counters', 'Clean the serving area, including the weighing scales', 'Collect __Q9__ for the fish from the cold-room', 'Must wear special __Q10__'],
            ],
          },
          questions: [
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'yellow' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'plastic' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'ice' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'gloves' },
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
              questionText: 'Which TWO problems with some training programmes for new runners does Liz mention?',
              options: [
                'A   There is a risk of serious injury.',
                'B   They are unsuitable for certain age groups.',
                'C   They are unsuitable for people with health issues.',
                'D   It is difficult to stay motivated.',
                'E   There is a lack of individual support.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 12, type: 'multi-answer-group',
              questionText: 'Question 12',
              options: [
                'A   There is a risk of serious injury.',
                'B   They are unsuitable for certain age groups.',
                'C   They are unsuitable for people with health issues.',
                'D   It is difficult to stay motivated.',
                'E   There is a lack of individual support.',
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
              questionText: 'Which TWO tips does Liz recommend for new runners?',
              options: [
                'A   doing two runs a week',
                'B   running in the evening',
                'C   going on runs with a friend',
                'D   listening to music during runs',
                'E   running very slowly',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 14, type: 'multi-answer-group',
              questionText: 'Question 14',
              options: [
                'A   doing two runs a week',
                'B   running in the evening',
                'C   going on runs with a friend',
                'D   listening to music during runs',
                'E   running very slowly',
              ],
              correctAnswer: 'D',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 15–18  What reason prevented each of the following members of the Compton Park Runners Club from joining until recently? Write the correct answer, A, B, or C next to Questions 15–18.',
          matchingOptionsTitle: 'Reasons',
          matchingOptions: [
            'a lack of confidence',
            'a dislike of running',
            'a lack of time',
          ],
          matchingReuseAllowed: true,
          questions: [
            { questionNumber: 15, type: 'matching-info', questionText: 'Ceri', correctAnswer: 'A' },
            { questionNumber: 16, type: 'matching-info', questionText: 'James', correctAnswer: 'B' },
            { questionNumber: 17, type: 'matching-info', questionText: 'Leo', correctAnswer: 'C' },
            { questionNumber: 18, type: 'matching-info', questionText: 'Mark', correctAnswer: 'A' },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 19 and 20  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 19, type: 'multiple-choice',
              questionText: '19   What does Liz say about running her first marathon?',
              options: [
                'A   It had always been her ambition.',
                'B   Her husband persuaded her to do it.',
                'C   She nearly gave up before the end.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 20, type: 'multiple-choice',
              questionText: '20   Liz says new runners should sign up for a race',
              options: [
                'A   every six months.',
                'B   within a few weeks of taking up running.',
                'C   after completing several practice runs.',
              ],
              correctAnswer: 'B',
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
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 21–25  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 21, type: 'multiple-choice',
              questionText: "21   Kieran thinks the packing advice given by Jane's grandfather is",
              options: [
                'A   common sense.',
                'B   hard to follow.',
                'C   over-protective.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 22, type: 'multiple-choice',
              questionText: '22   How does Jane feel about the books her grandfather has given her?',
              options: [
                'A   They are not worth keeping.',
                'B   They should go to a collector.',
                'C   They have sentimental value for her.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 23, type: 'multiple-choice',
              questionText: '23   Jane and Kieran agree that hardback books should be',
              options: [
                'A   put out on display.',
                'B   given as gifts to visitors.',
                'C   more attractively designed.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 24, type: 'multiple-choice',
              questionText: '24   While talking about taking a book from a shelf, Jane',
              options: [
                'A   describes the mistakes other people make doing it.',
                'B   reflects on a significant childhood experience.',
                'C   explains why some books are easier to remove than others.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 25, type: 'multiple-choice',
              questionText: '25   What do Jane and Kieran suggest about new books?',
              options: [
                'A   Their parents liked buying them as presents.',
                'B   They would like to buy more of them.',
                'C   Not everyone can afford them.',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: "Questions 26–30  Where does Jane's grandfather keep each of the following types of books in his shop? Choose FIVE answers from the box and write the correct letter, A-G, next to Questions 26–30.",
          matchingOptionsTitle: 'Location of books',
          matchingOptions: [
            'near the entrance',
            'in the attic',
            'at the back of the shop',
            'on a high shelf',
            'near the stairs',
            'in a specially designed space',
            'within the café',
          ],
          questions: [
            { questionNumber: 26, type: 'matching-info', questionText: 'rare books', correctAnswer: 'D' },
            { questionNumber: 27, type: 'matching-info', questionText: "children's books", correctAnswer: 'F' },
            { questionNumber: 28, type: 'matching-info', questionText: 'unwanted books', correctAnswer: 'A' },
            { questionNumber: 29, type: 'matching-info', questionText: 'requested books', correctAnswer: 'C' },
            { questionNumber: 30, type: 'matching-info', questionText: 'coursebooks', correctAnswer: 'G' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Tree planting',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Tree planting',
            lines: [
              'Reforestation projects should:',
              '●   include a range of tree species',
              '●   not include invasive species because of possible __Q31__ with native species.',
              '●   aim to capture carbon, protect the environment and provide sustainable sources of __Q32__ for local people',
              '●   use tree seeds with a high genetic diversity to increase resistance to __Q33__ and climate change',
              '●   plant trees on previously forested land which is in a bad condition, not select land which is being used for __Q34__',
              'Large-scale reforestation projects',
              '●   Base planning decisions on information from accurate __Q35__.',
              '●   Drones are useful for identifying areas in Brazil which are endangered by keeping __Q36__ and illegal logging.',
              'Lampang Province, Northern Thailand',
              '●   A forest was restored in an area damaged by mining.',
              '●   A variety of native fig trees were planted, which are important for',
              '○   supporting many wildlife species',
              '○   increasing the __Q37__ of recovery by attracting animals and birds, e.g., __Q38__ were soon attracted to the area.',
              'Involving local communities',
              '●   Destruction of mangrove forests in Madagascar made it difficult for people to make a living from __Q39__.',
              '●   The mangrove reforestation project:',
              '○   provided employment for local people',
              '○   restored a healthy ecosystem',
              '○   protects against the higher risk of __Q40__.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'competition' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'food' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'disease' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'agriculture' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'maps' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'cattle' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'speed' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'monkeys' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'fishing' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'flooding' },
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
