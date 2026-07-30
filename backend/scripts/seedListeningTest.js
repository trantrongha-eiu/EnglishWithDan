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
  name: 'Cam 19 - Test 2',
  testNumber: 2,
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
          instruction: 'Questions 1–6  Complete the form below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          noteConfig: {
            title: 'Guitar Group',
            lines: [
              'Coordinator: Gary __Q1__',
              'Level: __Q2__',
              'Place: the __Q3__',
              '__Q4__ Street',
              'First floor, Room T347',
              'Time: Thursday morning at __Q5__',
              "Recommended website: 'The perfect __Q6__'",
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'Mathieson' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'beginners' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'college' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'New' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: '11/eleven' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'instrument' },
          ],
        },
        {
          groupType: 'table',
          groupTitle: '',
          instruction: 'Questions 7–10  Complete the table below.  Write ONE WORD ONLY for each answer.',
          tableConfig: {
            headers: ['Time', 'Activity', 'Notes'],
            rows: [
              ['5 minutes', 'tuning guitars', 'using an app or by __Q7__'],
              ['10 minutes', 'strumming chords using our thumbs', 'keeping time while the teacher is __Q8__'],
              ['15 minutes', 'playing songs', 'often listening to a __Q9__ of a song'],
              ['10 minutes', 'playing single notes and simple tunes', 'playing together, then __Q10__'],
              ['5 minutes', 'noting things to practise at home', ''],
            ],
          },
          questions: [
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'ear' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'clapping' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'recording' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'alone' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: 'Working as a lifeboat volunteer',
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
              questionText: '11   What made David leave London and move to Northsea?',
              options: [
                'A   He was eager to develop a hobby.',
                'B   He wanted to work shorter hours.',
                'C   He found his job in website design unsatisfying.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: '12   The Lifeboat Institution in Northsea was built with money provided by',
              options: [
                'A   a local organisation.',
                'B   a local resident.',
                'C   the local council.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   In his health assessment, the doctor was concerned about the fact that David',
              options: [
                'A   might be colour blind.',
                'B   was rather short-sighted.',
                'C   had undergone eye surgery.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   After arriving at the lifeboat station, they aim to launch the boat within',
              options: [
                'A   five minutes.',
                'B   six to eight minutes.',
                'C   eight and a half minutes.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 15, type: 'multiple-choice',
              questionText: '15   As a \'helmsman\', David has the responsibility of deciding',
              options: [
                'A   who will be the members of his crew.',
                'B   what equipment it will be necessary to take.',
                'C   if the lifeboat should be launched.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 16, type: 'multiple-choice',
              questionText: '16   As well as going out on the lifeboat, David',
              options: [
                'A   gives talks on safety at sea.',
                'B   helps with fundraising.',
                'C   recruits new volunteers.',
              ],
              correctAnswer: 'A',
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
              questionText: 'Which TWO things does David say about the lifeboat volunteer training?',
              options: [
                'A   The residential course developed his leadership skills.',
                'B   The training in use of ropes and knots was quite brief.',
                'C   The training exercises have built up his mental strength.',
                'D   The casualty care activities were particularly challenging for him.',
                'E   The wave tank activities provided practice in survival techniques.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 18, type: 'multi-answer-group',
              questionText: 'Question 18',
              options: [
                'A   The residential course developed his leadership skills.',
                'B   The training in use of ropes and knots was quite brief.',
                'C   The training exercises have built up his mental strength.',
                'D   The casualty care activities were particularly challenging for him.',
                'E   The wave tank activities provided practice in survival techniques.',
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
              questionText: 'Which TWO things does David find most motivating about the work he does?',
              options: [
                'A   working as part of a team',
                'B   experiences when working in winter',
                'C   being thanked by those he has helped',
                'D   the fact that it keeps him fit',
                'E   the chance to develop new equipment',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 20, type: 'multi-answer-group',
              questionText: 'Question 20',
              options: [
                'A   working as part of a team',
                'B   experiences when working in winter',
                'C   being thanked by those he has helped',
                'D   the fact that it keeps him fit',
                'E   the chance to develop new equipment',
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
          instruction: 'Questions 21–24  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 21, type: 'multiple-choice',
              questionText: '21   At first, Don thought the topic of recycling footwear might be too',
              options: [
                'A   limited in scope.',
                'B   hard to research.',
                'C   boring for listeners.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 22, type: 'multiple-choice',
              questionText: '22   When discussing trainers, Bella and Don disagree about',
              options: [
                'A   how popular they are among young people.',
                'B   how suitable they are for school.',
                'C   how quickly they wear out.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 23, type: 'multiple-choice',
              questionText: '23   Bella says that she sometimes recycles shoes because',
              options: [
                'A   they no longer fit.',
                'B   she no longer likes them.',
                'C   they are no longer in fashion.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 24, type: 'multiple-choice',
              questionText: '24   What did the article say that confused Don?',
              options: [
                'A   Public consumption of footwear has risen.',
                'B   Less footwear is recycled now than in the past.',
                'C   People dispose of more footwear than they used to.',
              ],
              correctAnswer: 'B',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 25–28  What reasons did the recycling manager give for rejecting footwear, according to the students? Choose FOUR answers from the box and write the correct letter, A-F, next to Questions 25–28.',
          matchingOptionsTitle: 'Reasons',
          matchingOptions: [
            'one shoe was missing',
            'the colour of one shoe had faded',
            'one shoe had a hole in it',
            'the shoes were brand new',
            'the shoes were too dirty',
            'the stitching on the shoes was broken',
          ],
          questions: [
            { questionNumber: 25, type: 'matching-info', questionText: 'the high-heeled shoes', correctAnswer: 'E' },
            { questionNumber: 26, type: 'matching-info', questionText: 'the ankle boots', correctAnswer: 'B' },
            { questionNumber: 27, type: 'matching-info', questionText: 'the baby shoes', correctAnswer: 'A' },
            { questionNumber: 28, type: 'matching-info', questionText: 'the trainers', correctAnswer: 'C' },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 29–30  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 29, type: 'multiple-choice',
              questionText: "29   Why did the project to make 'new' shoes out of old shoes fail?",
              options: [
                "A   People believed the 'new' pairs of shoes were unhygienic.",
                'B   There were not enough good parts to use in the old shoes.',
                "C   The shoes in the 'new' pairs were not completely alike.",
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 30, type: 'multiple-choice',
              questionText: '30   Bella and Don agree that they can present their topic',
              options: [
                'A   from a new angle.',
                'B   with relevant images.',
                'C   in a straightforward way.',
              ],
              correctAnswer: 'A',
            },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Tardigrades',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Tardigrades',
            lines: [
              '●   more than 1,000 species, 0.05–1.2 millimetres long',
              "●   also known as water 'bears' (due to how they __Q31__) and 'moss piglets'",
              'Physical appearance',
              '●   a __Q32__ round body and four pairs of legs',
              '●   claws or __Q33__ for gripping',
              '●   absence of respiratory organs',
              '●   body filled with a liquid that carries both __Q34__ and blood',
              '●   mouth shaped like a __Q35__ with teeth called stylets',
              'Habitat',
              '●   often found at the bottom of a lake or on plants',
              '●   very resilient and can exist in very low or high __Q36__',
              'Cryptobiosis',
              "●   In dry conditions, they roll into a ball called a 'tun'.",
              '●   They stay alive with a much lower metabolism than usual.',
              '●   A type of __Q37__ ensures their DNA is not damaged.',
              '●   Research is underway to find out how many days they can stay alive in __Q38__.',
              'Feeding',
              '●   consume liquids, e.g., those found in moss or __Q39__',
              '●   may eat other tardigrades',
              'Conservation status',
              '●   They are not considered to be __Q40__.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'move' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'short' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'discs' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'oxygen' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'tube' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'temperatures' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'protein' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'space' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'seaweed' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'endangered' },
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
