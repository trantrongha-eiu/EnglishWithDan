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
  name: 'Cam 17 - Test 3',
  testNumber: 3,
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
            title: 'Advice on surfing holidays',
            lines: [
              "Jack's advice",
              '●   Recommends surfing for __Q1__ holidays in the summer',
              '●   Need to be quite __Q2__',
              'Irish surfing locations',
              '●   County Clare',
              '○   Lahinch has some good quality __Q3__ and surf schools',
              '○   There are famous cliffs nearby',
              '●   County Mayo',
              '○   Good surf school at __Q4__ beach',
              '○   Surf camp lasts for one __Q5__',
              '○   Can also explore the local __Q6__ by kayak',
              'Weather',
              '●   Best month to go: __Q7__',
              '●   Average temperature in summer: approx. __Q8__ degrees',
              'Costs',
              '●   Equipment',
              '○   Wetsuit and surfboard: __Q9__ euros per day',
              '○   Also advisable to hire __Q10__ for warmth',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'family' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'fit' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'hotels' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'Carrowniskey' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'week' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'bay' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'September' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: '19/nineteen' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: '30/thirty' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'boots' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    // Note: the source text headed this "Questions 11 - 14 / Choose TWO
    // letters" then separately "Questions 13-15" — an overlapping/typo'd
    // range in the original. The answer key's "11&12" pairing is
    // unambiguous, so the choose-two group is treated as Q11–12 only and
    // the MC group starts at Q13, matching the answer key exactly.
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
              questionText: "Which TWO facts are given about the school's extended hours childcare service?",
              options: [
                'A   It started recently.',
                'B   More children attend after school than before school.',
                'C   An average of 50 children attend in the mornings.',
                'D   A child cannot attend both the before and after school sessions.',
                'E   The maximum number of children who can attend is 70.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 12, type: 'multi-answer-group',
              questionText: 'Question 12',
              options: [
                'A   It started recently.',
                'B   More children attend after school than before school.',
                'C   An average of 50 children attend in the mornings.',
                'D   A child cannot attend both the before and after school sessions.',
                'E   The maximum number of children who can attend is 70.',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 13–15  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   How much does childcare cost for a complete afternoon session per child?',
              options: [
                'A   £3.50',
                'B   £5.70',
                'C   £7.20',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   What does the manager say about food?',
              options: [
                'A   Children with allergies should bring their own food.',
                'B   Children may bring healthy snacks with them.',
                'C   Children are given a proper meal at 5 p.m.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 15, type: 'multiple-choice',
              questionText: '15   What is different about arrangements in the school holidays?',
              options: [
                'A   Children from other schools can attend.',
                'B   Older children can attend.',
                'C   A greater number of children can attend.',
              ],
              correctAnswer: 'A',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 16–20  What information is given about each of the following activities on offer? Choose FIVE answers from the box and write the correct letter, A-G, next to Questions 16–20.',
          matchingOptionsTitle: 'Information',
          matchingOptions: [
            'has limited availability',
            'is no longer available',
            'is for over 8s only',
            'requires help from parents',
            'involves an additional fee',
            'is a new activity',
            'was requested by children',
          ],
          questions: [
            { questionNumber: 16, type: 'matching-info', questionText: 'Spanish', correctAnswer: 'E' },
            { questionNumber: 17, type: 'matching-info', questionText: 'Music', correctAnswer: 'D' },
            { questionNumber: 18, type: 'matching-info', questionText: 'Painting', correctAnswer: 'G' },
            { questionNumber: 19, type: 'matching-info', questionText: 'Yoga', correctAnswer: 'F' },
            { questionNumber: 20, type: 'matching-info', questionText: 'Cooking', correctAnswer: 'C' },
          ],
        },
      ],
    },

    // ── PART 3 (Q21–30) ─────────────────────────────────────────────
    {
      partNumber: 3,
      title: "Holly's Work Placement Tutorial",
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
              questionText: '21   Holly has chosen the Orion Stadium placement because',
              options: [
                'A   it involves children.',
                'B   it is outdoors.',
                'C   it sounds like fun.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 22, type: 'multiple-choice',
              questionText: '22   Which aspect of safety does Dr Green emphasise most?',
              options: [
                'A   ensuring children stay in the stadium',
                'B   checking the equipment children will use',
                'C   removing obstacles in changing rooms',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 23, type: 'multiple-choice',
              questionText: '23   What does Dr Green say about the spectators?',
              options: [
                'A   They can be hard to manage.',
                'B   They make useful volunteers.',
                "C   They shouldn't take photographs.",
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 24, type: 'multiple-choice',
              questionText: '24   What has affected the schedule in the past?',
              options: [
                'A   bad weather',
                'B   an injury',
                'C   extra time',
              ],
              correctAnswer: 'B',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 25–30  What do Holly and her tutor agree is an important aspect of each of the following events management skills? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25–30.',
          matchingOptionsTitle: 'Important aspects',
          matchingOptions: [
            'being flexible',
            'focusing on details',
            'having a smart appearance',
            'hiding your emotions',
            'relying on experts',
            'trusting your own views',
            'doing one thing at a time',
            'thinking of the future',
          ],
          questions: [
            { questionNumber: 25, type: 'matching-info', questionText: 'Communication', correctAnswer: 'C' },
            { questionNumber: 26, type: 'matching-info', questionText: 'Organisation', correctAnswer: 'A' },
            { questionNumber: 27, type: 'matching-info', questionText: 'Time management', correctAnswer: 'D' },
            { questionNumber: 28, type: 'matching-info', questionText: 'Creativity', correctAnswer: 'B' },
            { questionNumber: 29, type: 'matching-info', questionText: 'Leadership', correctAnswer: 'F' },
            { questionNumber: 30, type: 'matching-info', questionText: 'Networking', correctAnswer: 'H' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Bird Migration Theory',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Bird Migration Theory',
            lines: [
              'Most birds are believed to migrate seasonally.',
              'Hibernation theory',
              '●   It was believed that birds hibernated underwater or buried themselves in __Q31__.',
              '●   This theory was later disproved by experiments on caged birds.',
              'Transmutation theory',
              '●   Aristotle believed birds changed from one species into another in summer and winter.',
              '○   In autumn he observed that redstarts experience the loss of __Q32__ and thought they then turned into robins.',
              "○   Aristotle's assumptions were logical because the two species of birds had a similar __Q33__.",
              '17th century',
              '●   Charles Morton popularised the idea that birds fly to the __Q34__ in winter.',
              'Scientific developments',
              '●   In 1822, a stork was killed in Germany which had an African spear in its __Q35__.',
              '○   previously there had been no __Q36__ that storks migrate to Africa',
              '●   Little was known about the __Q37__ and journeys of migrating birds until the practice of ringing was established.',
              '○   It was thought large birds carried small birds on some journeys because they were considered incapable of travelling across huge __Q38__.',
              "○   Ringing depended on what is called the '__Q39__' of dead birds.",
              '●   In 1931, the first __Q40__ to show the migration of European birds was printed.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'mud' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'feathers' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'shape' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'moon' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'neck' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'evidence' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'destinations' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'oceans' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'recovery' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'atlas' },
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
