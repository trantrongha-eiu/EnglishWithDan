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
  name: 'Cam 17 - Test 1',
  testNumber: 1,
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
          instruction: 'Questions 1–10  Complete the notes below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          noteConfig: {
            title: 'Buckworth Conservation Group',
            lines: [
              'Regular activities',
              'Beach',
              '●   making sure the beach does not have __Q1__ on it',
              '●   no __Q2__',
              'Nature reserve',
              '●   maintaining paths',
              '●   nesting boxes for birds installed',
              '●   next task is taking action to attract __Q3__ to the place',
              '●   identifying types of __Q4__',
              '●   building a new __Q5__',
              'Forthcoming events',
              'Saturday',
              '●   meet at Dunsmore Beach car park',
              '●   walk across the sands and reach the __Q6__',
              '●   take a picnic',
              '●   wear appropriate __Q7__',
              'Woodwork session',
              '●   suitable for __Q8__ to participate in',
              '●   making __Q9__ out of wood',
              '●   17th, from 10 a.m. to 3 p.m.',
              '●   cost of session (no camping): £__Q10__',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'litter' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'dogs' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'insects' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'butterflies' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'wall' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'island' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'boots' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'beginners' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'spoons' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: '35/thirty five' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: 'Boat trip round Tasmania',
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
              questionText: '11   What is the maximum number of people who can stand on each side of the boat?',
              options: [
                'A   9',
                'B   15',
                'C   18',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: '12   What colour are the tour boats?',
              options: [
                'A   dark red',
                'B   jet black',
                'C   light green',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: "13   Which lunchbox is suitable for someone who doesn't eat meat or fish?",
              options: [
                'A   Lunchbox 1',
                'B   Lunch box 2',
                'C   Lunch box 3',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   What should people do with their litter?',
              options: [
                'A   take it home',
                'B   hand it to a member of staff',
                'C   put it in the bins provided on the boat',
              ],
              correctAnswer: 'B',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 15 and 16  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 15, type: 'multi-answer-group',
              questionText: 'Which TWO features of the lighthouse does Lou mention?',
              options: [
                'A   why it was built',
                'B   who built it',
                'C   how long it took to build',
                'D   who staffed it',
                'E   what it was built with',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 16, type: 'multi-answer-group',
              questionText: 'Question 16',
              options: [
                'A   why it was built',
                'B   who built it',
                'C   how long it took to build',
                'D   who staffed it',
                'E   what it was built with',
              ],
              correctAnswer: 'D',
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
              questionText: 'Which TWO types of creature might come close to the boat?',
              options: [
                'A   sea eagles',
                'B   fur seals',
                'C   dolphins',
                'D   whales',
                'E   penguins',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 18, type: 'multi-answer-group',
              questionText: 'Question 18',
              options: [
                'A   sea eagles',
                'B   fur seals',
                'C   dolphins',
                'D   whales',
                'E   penguins',
              ],
              correctAnswer: 'C',
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
              questionText: 'Which TWO points does Lou make about the caves?',
              options: [
                'A   Only large tourist boats can visit them.',
                'B   The entrances to them are often blocked.',
                'C   It is too dangerous for individuals to go near them.',
                'D   Someone will explain what is inside them.',
                'E   They cannot be reached on foot.',
              ],
              correctAnswer: 'D',
            },
            {
              questionNumber: 20, type: 'multi-answer-group',
              questionText: 'Question 20',
              options: [
                'A   Only large tourist boats can visit them.',
                'B   The entrances to them are often blocked.',
                'C   It is too dangerous for individuals to go near them.',
                'D   Someone will explain what is inside them.',
                'E   They cannot be reached on foot.',
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
      title: 'Work experience for veterinary science students',
      description: '',
      transcript: '',
      questionRange: { start: 21, end: 30 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 21–26  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 21, type: 'multiple-choice',
              questionText: '21   What problem did both Diana and Tim have when arranging their work experience?',
              options: [
                'A   make initial contact with suitable farms',
                'B   organising transport to and from the farm',
                'C   finding a placement for the required length of time',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 22, type: 'multiple-choice',
              questionText: '22   Tim was pleased to be able to help',
              options: [
                'A   a lamb that had a broken leg.',
                'B   a sheep that was having difficult giving birth.',
                'C   a newly born lamb that was having trouble feeding.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 23, type: 'multiple-choice',
              questionText: '23   Diana says the sheep on her farm',
              options: [
                'A   were of various different varieties.',
                'B   were mainly reared for their meat.',
                'C   had better quality wool than sheep on the hills.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 24, type: 'multiple-choice',
              questionText: '24   What did the students learn about adding supplements to chicken feed?',
              options: [
                'A   These should only be given if specially needed.',
                'B   It is worth paying extra for the most effective ones.',
                'C   The amount given at one time should be limited.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 25, type: 'multiple-choice',
              questionText: '25   What happened when Diana was working with dairy cows?',
              options: [
                'A   She identified some cows incorrectly.',
                'B   She accidentally threw some milk away.',
                'C   She made a mistake when storing milk.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 26, type: 'multiple-choice',
              questionText: '26   What did both farmers mention about vets and farming?',
              options: [
                'A   Vets are failing to cope with some aspects of animal health.',
                'B   There needs to be a fundamental change in the training of vets.',
                'C   Some jobs could be done by the farmer rather than by a vet.',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 27–30  What opinion do the students give about each of the following modules on their veterinary science course? Choose FOUR answers from the box and write the correct letter, A-F, next to Questions 27–30.',
          matchingOptionsTitle: 'Opinions',
          matchingOptions: [
            'Tim found this easier than expected.',
            'Tim thought this was not very clearly organised.',
            'Diana may do some further study on this.',
            'They both found the reading required for this was difficult.',
            'Tim was shocked at something he learned on this module.',
            'They were both surprised how little is known about some aspects of this.',
          ],
          questions: [
            { questionNumber: 27, type: 'matching-info', questionText: 'Medical terminology', correctAnswer: 'A' },
            { questionNumber: 28, type: 'matching-info', questionText: 'Diet and nutrition', correctAnswer: 'E' },
            { questionNumber: 29, type: 'matching-info', questionText: 'Animal disease', correctAnswer: 'F' },
            { questionNumber: 30, type: 'matching-info', questionText: 'Wildlife medication', correctAnswer: 'C' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Labyrinths',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Labyrinths',
            lines: [
              'Definition',
              '●   a winding spiral path leading to a central area',
              'Labyrinths compared with mazes',
              '●   Mazes are a type of __Q31__',
              '○   __Q32__ is needed to navigate through a maze',
              "○   the word 'maze' is derived from a word meaning a feeling of __Q33__",
              '●   Labyrinths represent a journey through life',
              '○   they have frequently been used in __Q34__ and prayer',
              'Early examples of the labyrinth spiral',
              '●   Ancient carvings on __Q35__ have been found across many cultures',
              '●   The Pima, a Native American tribe, wove the symbol on baskets',
              '●   Ancient Greeks used the symbol on __Q36__',
              'Walking labyrinths',
              '●   The largest surviving example of a turf labyrinth once had a big __Q37__ at its centre',
              'Labyrinths nowadays',
              "●   Believed to have a beneficial impact on mental and physical health, e.g., walking a maze can reduce a person's __Q38__ rate",
              '●   Used in medical and health and fitness settings and also prisons',
              '●   Popular with patients, visitors and staff in hospitals',
              "○   patients who can't walk can use 'finger labyrinths' made from __Q39__",
              "○   research has shown that Alzheimer's sufferers experience less __Q40__",
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'puzzle' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'logic' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'confusion' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'meditation' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'stone' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'coins' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'tree' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'breathing' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'paper' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'anxiety' },
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
