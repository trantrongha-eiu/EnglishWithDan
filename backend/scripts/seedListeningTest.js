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
  name: 'Cam 16 - Test 3',
  testNumber: 3,
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
            title: 'JUNIOR CYCLE CAMP',
            lines: [
              'The course focuses on skills and safety',
              '●   Charlie would be placed in Level 5.',
              '●   First of all, children at this level are taken to practise in a __Q1__.',
              'Instructors',
              '●   Instructors wear __Q2__ shirts.',
              '●   A __Q3__ is required and training is given.',
              'Classes',
              '●   The size of the classes is limited.',
              '●   There are quiet times during the morning for a __Q4__ or a game.',
              '●   Classes are held even if there is __Q5__.',
              'What to bring',
              '●   a change of clothing',
              '●   a __Q6__',
              '●   shoes (not sandals)',
              "●   Charlie's __Q7__",
              'Day 1',
              '●   Charlie should arrive at 9.20 am on the first day.',
              '●   Before the class, his __Q8__ will be checked.',
              '●   He should then go to the __Q9__ to meet his class instructor.',
              'Cost',
              '●   The course costs $__Q10__ per week.',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'park' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'blue' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'reference' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'story' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'rain' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'snack' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'medication' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'helmet' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'tent' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: '199' },
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
              questionText: 'According to Megan, what are the TWO main advantages of working in the agriculture and horticulture sectors?',
              options: [
                'A   the active lifestyle',
                'B   the above-average salaries',
                'C   the flexible working opportunities',
                'D   the opportunities for overseas travel',
                'E   the chance to be in a natural environment',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 12, type: 'multi-answer-group',
              questionText: 'Question 12',
              options: [
                'A   the active lifestyle',
                'B   the above-average salaries',
                'C   the flexible working opportunities',
                'D   the opportunities for overseas travel',
                'E   the chance to be in a natural environment',
              ],
              correctAnswer: 'C',
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
              questionText: 'Which TWO of the following are likely to be disadvantages for people working outdoors?',
              options: [
                'A   the increasing risk of accidents',
                'B   being in a very quiet location',
                'C   difficult weather conditions at times',
                'D   the cost of housing',
                'E   the level of physical fitness required',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 14, type: 'multi-answer-group',
              questionText: 'Question 14',
              options: [
                'A   the increasing risk of accidents',
                'B   being in a very quiet location',
                'C   difficult weather conditions at times',
                'D   the cost of housing',
                'E   the level of physical fitness required',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 15–20  What information does Megan give about each of the following job opportunities? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 15–20.',
          matchingOptionsTitle: 'Information',
          matchingOptions: [
            'not a permanent job',
            'involves leading a team',
            'experience not essential',
            'intensive work but also fun',
            'chance to earn more through overtime',
            'chance for rapid promotion',
            'accommodation available',
            'local travel involved',
          ],
          questions: [
            { questionNumber: 15, type: 'matching-info', questionText: 'Fresh food commercial manager', correctAnswer: 'D' },
            { questionNumber: 16, type: 'matching-info', questionText: 'Agronomist', correctAnswer: 'F' },
            { questionNumber: 17, type: 'matching-info', questionText: 'Fresh produce buyer', correctAnswer: 'A' },
            { questionNumber: 18, type: 'matching-info', questionText: 'Garden centre sales manager', correctAnswer: 'H' },
            { questionNumber: 19, type: 'matching-info', questionText: 'Tree technician', correctAnswer: 'C' },
            { questionNumber: 20, type: 'matching-info', questionText: 'Farm worker', correctAnswer: 'G' },
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
              questionText: 'Which TWO points does Adam make about his experiment on artificial sweeteners?',
              options: [
                'A   The results were what he had predicted.',
                'B   The experiment was simple to set up',
                'C   A large sample of people was tested.',
                'D   The subjects were unaware of what they were drinking.',
                'E   The test was repeated several times for each person.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 22, type: 'multi-answer-group',
              questionText: 'Question 22',
              options: [
                'A   The results were what he had predicted.',
                'B   The experiment was simple to set up',
                'C   A large sample of people was tested.',
                'D   The subjects were unaware of what they were drinking.',
                'E   The test was repeated several times for each person.',
              ],
              correctAnswer: 'D',
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
              questionText: 'Which TWO problems did Rosie have when measuring the fat content of nuts?',
              options: [
                'A   She used the wrong sort of nuts.',
                'B   She used an unsuitable chemical.',
                'C   She did not grind the nuts finely enough.',
                'D   The information on the nut package was incorrect.',
                'E   The weighing scales may have been unsuitable.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 24, type: 'multi-answer-group',
              questionText: 'Question 24',
              options: [
                'A   She used the wrong sort of nuts.',
                'B   She used an unsuitable chemical.',
                'C   She did not grind the nuts finely enough.',
                'D   The information on the nut package was incorrect.',
                'E   The weighing scales may have been unsuitable.',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 25–30  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 25, type: 'multiple-choice',
              questionText: '25   Adam suggests that restaurants could reduce obesity if their menus',
              options: [
                'A   offered fewer options.',
                'B   had more low-calorie foods.',
                'C   were organised in a particular way.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 26, type: 'multiple-choice',
              questionText: '26   The students agree that food manufacturers deliberately',
              options: [
                'A   make calorie counts hard to understand.',
                'B   fail to provide accurate calorie counts.',
                'C   use ineffective methods to reduce calories.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 27, type: 'multiple-choice',
              questionText: '27   What does Rosie say about levels of exercise in England?',
              options: [
                'A   The amount recommended is much too low.',
                'B   Most people overestimate how much they do.',
                'C   Women now exercise more than they used to.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 28, type: 'multiple-choice',
              questionText: '28   Adam refers to the location and width of stairs in a train station to illustrate',
              options: [
                "A   practical changes that can influence people's behaviour.",
                'B   methods of helping people who have mobility problems.',
                'C   ways of preventing accidents by controlling crowd movement.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 29, type: 'multiple-choice',
              questionText: '29   What do the students agree about including reference to exercise in their presentation?',
              options: [
                'A   They should probably leave it out.',
                'B   They need to do more research on it.',
                'C   They should discuss this with their tutor.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 30, type: 'multiple-choice',
              questionText: '30   What are the students going to do next for their presentation?',
              options: [
                'A   prepare some slides for it',
                'B   find out how long they have for it',
                'C   decide on its content and organisation',
              ],
              correctAnswer: 'C',
            },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Hand knitting',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Hand knitting',
            lines: [
              'Interest in knitting',
              '●   Knitting has a long history around the world.',
              '●   We imagine someone like a __Q31__ knitting.',
              '●   A __Q32__ ago, knitting was expected to disappear.',
              '●   The number of knitting classes is now increasing.',
              '●   People are buying more __Q33__ for knitting nowadays.',
              'Benefits of knitting',
              '●   gives support in times of __Q34__ difficulty',
              '●   requires only __Q35__ skills and little money to start',
              '●   reduces stress in a busy life',
              'Early knitting',
              '●   The origins are not known.',
              '●   Findings show early knitted items to be __Q36__ in shape.',
              '●   The first needles were made of natural materials such as wood and __Q37__.',
              '●   Early yarns felt __Q38__ to touch.',
              '●   Wool became the most popular yarn for spinning.',
              '●   Geographical areas had their own __Q39__ of knitting.',
              '●   Everyday tasks like looking after __Q40__ were done while knitting.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'grandmother' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'decade' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'equipment' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'economic' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'basic' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'round' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'bone' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'rough' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'style' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'sheep' },
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
