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
  name: 'Cam 18 - Test 4',
  testNumber: 4,
  seriesName: 'Cam 18',
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
            title: 'Job details from employment agency',
            lines: [
              'Role __Q1__',
              'Location Fordham __Q2__ Centre',
              '__Q3__ Road, Fordham',
              'Work involves',
              '●   dealing with enquiries',
              '●   making __Q4__ and reorganising them',
              '●   maintaining the internal __Q5__',
              '●   general administration',
              'Requirements',
              '●   __Q6__ (essential)',
              '●   a calm and __Q7__ manner',
              '●   good IT skills',
              'Other information',
              '●   a __Q8__ job – further opportunities may be available',
              '●   hours: 7.45 a.m. to __Q9__ p.m. Monday to Friday',
              '●   __Q10__ is available onsite',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'receptionist' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'Medical' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'Chastons' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'appointments' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'database' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'experience' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'confident' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'temporary' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: '1.15' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'parking' },
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
              questionText: '11   The museum building was originally',
              options: [
                'A   a factory.',
                'B   a private home.',
                'C   a hall of residence.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: '12   The university uses part of the museum building as',
              options: [
                'A   teaching rooms.',
                'B   a research library.',
                'C   administration offices.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   What does the guide say about the entrance fee?',
              options: [
                'A   Visitors decide whether or not they wish to pay.',
                'B   Only children and students receive a discount.',
                'C   The museum charges extra for special exhibitions.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   What are visitors advised to leave in the cloakroom?',
              options: [
                'A   cameras',
                'B   coats',
                'C   bags',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 15–20  What information does the speaker give about each of the following areas of the museum? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 15–20.',
          matchingOptionsTitle: 'Information',
          matchingOptions: [
            'Parents must supervise their children.',
            'There are new things to see.',
            'It is closed today.',
            'This is only for school groups.',
            'There is a quiz for visitors.',
            'It features something created by students.',
            'An expert is here today.',
            'There is a one-way system.',
          ],
          questions: [
            { questionNumber: 15, type: 'matching-info', questionText: 'Four Seasons', correctAnswer: 'F' },
            { questionNumber: 16, type: 'matching-info', questionText: 'Farmhouse Kitchen', correctAnswer: 'G' },
            { questionNumber: 17, type: 'matching-info', questionText: 'A Year on the Farm', correctAnswer: 'E' },
            { questionNumber: 18, type: 'matching-info', questionText: 'Wagon Walk', correctAnswer: 'A' },
            { questionNumber: 19, type: 'matching-info', questionText: 'Bees are Magic', correctAnswer: 'C' },
            { questionNumber: 20, type: 'matching-info', questionText: 'The Pond', correctAnswer: 'B' },
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
              questionText: 'Which TWO educational skills were shown in the video of children doing origami?',
              options: [
                'A   solving problems',
                'B   following instructions',
                'C   working cooperatively',
                'D   learning through play',
                'E   developing hand-eye coordination',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 22, type: 'multi-answer-group',
              questionText: 'Question 22',
              options: [
                'A   solving problems',
                'B   following instructions',
                'C   working cooperatively',
                'D   learning through play',
                'E   developing hand-eye coordination',
              ],
              correctAnswer: 'D',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 23–27  Which comment do the students make about each of the following children in the video? Choose FIVE answers from the box and write the correct letter, A-G, next to Questions 23–27.',
          matchingOptionsTitle: 'Comments',
          matchingOptions: [
            'demonstrated independence',
            'asked for teacher support',
            'developed a competitive attitude',
            'seemed to find the activity calming',
            'seemed pleased with the results',
            'seemed confused',
            'seemed to find the activity easy',
          ],
          questions: [
            { questionNumber: 23, type: 'matching-info', questionText: 'Sid', correctAnswer: 'D' },
            { questionNumber: 24, type: 'matching-info', questionText: 'Jack', correctAnswer: 'A' },
            { questionNumber: 25, type: 'matching-info', questionText: 'Naomi', correctAnswer: 'C' },
            { questionNumber: 26, type: 'matching-info', questionText: 'Anya', correctAnswer: 'G' },
            { questionNumber: 27, type: 'matching-info', questionText: 'Zara', correctAnswer: 'F' },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 28–30  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 28, type: 'multiple-choice',
              questionText: '28   Before starting an origami activity in class, the students think it is important for the teacher to',
              options: [
                'A   make models that demonstrate the different stages.',
                'B   check children understand the terminology involved.',
                "C   tell children not to worry if they find the activity difficult.",
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 29, type: 'multiple-choice',
              questionText: '29   The students agree that some teachers might be unwilling to use origami in class because',
              options: [
                'A   they may not think that crafts are important.',
                'B   they may not have the necessary skills.',
                'C   they may worry that it will take up too much time.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 30, type: 'multiple-choice',
              questionText: '30   Why do the students decide to use origami in their maths teaching practice?',
              options: [
                'A   to correct a particular misunderstanding',
                'B   to set a challenge',
                'C   to introduce a new concept',
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
      title: 'Victor Hugo',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Victor Hugo',
            lines: [
              'His novel, Les Misérables',
              '●   It has been adapted for theatre and cinema.',
              '●   We know more about its overall __Q31__ than about its author.',
              'His early career',
              '●   In Paris, his career was successful and he led the Romantic movement.',
              '●   He spoke publicly about social issues, such as __Q32__ and education.',
              '●   Napoleon III disliked his views and exiled him.',
              'His exile from France',
              '●   Victor Hugo had to live elsewhere in __Q33__',
              '●   He used his income from the sale of some __Q34__ he had written to buy a house on Guernsey.',
              'His house on Guernsey',
              '●   Victor Hugo lived in this house until the end of the Empire in France.',
              '●   The ground floor contains portraits, __Q35__ and tapestries that he valued.',
              '●   He bought cheap __Q36__ made of wood and turned this into beautiful wall carvings.',
              '●   The first floor consists of furnished areas with wallpaper and __Q37__ that have a Chinese design.',
              '●   The library still contains many of his favourite books.',
              '●   He wrote in a room at the top of the house that had a view of the __Q38__.',
              '●   He entertained other writers as well as poor __Q39__ in his house.',
              "●   Victor Hugo's __Q40__ gave ownership of the house to the city of Paris in 1927.",
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'plot' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'poverty' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'Europe' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'poetry' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'drawings' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'furniture' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'lamps' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'harbour/harbor' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'children' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'relatives' },
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
