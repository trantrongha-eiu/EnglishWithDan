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
  name: 'Cam 18 - Test 1',
  testNumber: 1,
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
            title: 'Transport survey',
            lines: [
              'Name: Sadie Jones',
              'Year of birth: 1991',
              'Postcode: __Q1__',
              'Travelling by bus',
              'Date of bus journey: __Q2__',
              'Reason for trip: shopping and visit to the __Q3__',
              'Travelled by bus because cost of __Q4__ too high',
              'Got on bus at __Q5__ Street',
              'Complaints about bus service:',
              '○   bus today was __Q6__',
              '○   frequency of buses in the __Q7__',
              'Travelling by car',
              'Goes to the __Q8__ by car',
              'Travelling by bicycle',
              'Dislikes travelling by bike in the city centre because of the __Q9__',
              "Doesn't own a bike because of a lack of __Q10__",
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'DW30 7YZ' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: '24 April/24th April' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'dentist' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'parking' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'Claxby' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'late' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'evening' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'supermarket' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'pollution' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'storage' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: 'Becoming a volunteer for ACE',
      description: '',
      transcript: '',
      questionRange: { start: 11, end: 20 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 11–13  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 11, type: 'multiple-choice',
              questionText: '11   Why does the speaker apologise about the seats?',
              options: [
                'A   They are too small.',
                'B   There are not enough of them.',
                'C   Some of them are very close together.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: '12   What does the speaker say about the age of volunteers?',
              options: [
                'A   The age of volunteers is less important than other factors.',
                'B   Young volunteers are less reliable than older ones.',
                'C   Most volunteers are about 60 years old.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   What does the speaker say about training?',
              options: [
                'A   It is continuous.',
                'B   It is conducted by a manager.',
                'C   It takes place online.',
              ],
              correctAnswer: 'A',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 14 and 15  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 14, type: 'multi-answer-group',
              questionText: 'Which TWO issues does the speaker ask the audience to consider before they apply to be volunteers?',
              options: [
                'A   their financial situation',
                'B   their level of commitment',
                'C   their work experience',
                'D   their ambition',
                'E   their availability',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 15, type: 'multi-answer-group',
              questionText: 'Question 15',
              options: [
                'A   their financial situation',
                'B   their level of commitment',
                'C   their work experience',
                'D   their ambition',
                'E   their availability',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 16–20  What does the speaker suggest would be helpful for each of the following areas of voluntary work? Choose FIVE answers from the box and write the correct letter, A-G, next to Questions 16–20.',
          matchingOptionsTitle: 'Helpful things volunteers might offer',
          matchingOptions: [
            'experience on stage',
            'original, new ideas',
            'parenting skills',
            'an understanding of food and diet',
            'retail experience',
            'a good memory',
            'a good level of fitness',
          ],
          questions: [
            { questionNumber: 16, type: 'matching-info', questionText: 'Fundraising', correctAnswer: 'B' },
            { questionNumber: 17, type: 'matching-info', questionText: 'Litter collection', correctAnswer: 'G' },
            { questionNumber: 18, type: 'matching-info', questionText: "'Playmates'", correctAnswer: 'D' },
            { questionNumber: 19, type: 'matching-info', questionText: 'Story club', correctAnswer: 'A' },
            { questionNumber: 20, type: 'matching-info', questionText: 'First aid', correctAnswer: 'F' },
          ],
        },
      ],
    },

    // ── PART 3 (Q21–30) ─────────────────────────────────────────────
    {
      partNumber: 3,
      title: 'Talk on jobs in fashion design',
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
              questionText: '21   What problem did Chantal have at the start of the talk?',
              options: [
                'A   Her view of the speaker was blocked.',
                'B   She was unable to find an empty seat.',
                'C   The students next to her were talking.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 22, type: 'multiple-choice',
              questionText: '22   What were Hugo and Chantal surprised to hear about the job market?',
              options: [
                'A   It has become more competitive than it used to be.',
                'B   There is more variety in it than they had realised.',
                'C   Some areas of it are more exciting than others.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 23, type: 'multiple-choice',
              questionText: "23   Hugo and Chantal agree that the speaker's message was",
              options: [
                'A   unfair to them at times.',
                'B   hard for them to follow.',
                'C   critical of the industry.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 24, type: 'multiple-choice',
              questionText: '24   What do Hugo and Chantal criticise about their school careers advice?',
              options: [
                'A   when they received the advice',
                'B   how much advice was given',
                'C   who gave the advice',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 25, type: 'multiple-choice',
              questionText: '25   When discussing their future, Hugo and Chantal disagree on',
              options: [
                'A   which is the best career in fashion.',
                'B   when to choose a career in fashion.',
                'C   why they would like a career in fashion.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 26, type: 'multiple-choice',
              questionText: '26   How does Hugo feel about being an unpaid assistant?',
              options: [
                'A   He is realistic about the practice.',
                'B   He feels the practice is dishonest.',
                'C   He thinks others want to change the practice.',
              ],
              correctAnswer: 'A',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 27 and 28  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 27, type: 'multi-answer-group',
              questionText: 'Which TWO mistakes did the speaker admit she made in her first job?',
              options: [
                'A   being dishonest to her employer',
                'B   paying too much attention to how she looked',
                'C   expecting to become well known',
                'D   trying to earn a lot of money',
                'E   openly disliking her client',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 28, type: 'multi-answer-group',
              questionText: 'Question 28',
              options: [
                'A   being dishonest to her employer',
                'B   paying too much attention to how she looked',
                'C   expecting to become well known',
                'D   trying to earn a lot of money',
                'E   openly disliking her client',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 29 and 30  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 29, type: 'multi-answer-group',
              questionText: 'Which TWO pieces of retail information do Hugo and Chantal agree would be useful?',
              options: [
                'A   the reasons people return fashion items',
                'B   how much time people have to shop for clothes',
                "C   fashion designs people want but can't find",
                'D   the best time of year for fashion buying',
                'E   the most popular fashion sizes',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 30, type: 'multi-answer-group',
              questionText: 'Question 30',
              options: [
                'A   the reasons people return fashion items',
                'B   how much time people have to shop for clothes',
                "C   fashion designs people want but can't find",
                'D   the best time of year for fashion buying',
                'E   the most popular fashion sizes',
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
      title: 'Elephant translocation',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Elephant translocation',
            lines: [
              'Reasons for overpopulation at Majete National Park',
              '●   strict enforcement of anti-poaching laws',
              '●   successful breeding',
              'Problems caused by elephant overpopulation',
              '●   greater competition, causing hunger for elephants',
              '●   damage to __Q31__ in the park',
              'The translocation process',
              '●   a suitable group of elephants from the same __Q32__ was selected',
              '●   vets and park staff made use of __Q33__ to help guide the elephants into an open plain',
              '●   elephants were immobilised with tranquilisers',
              '○   this process had to be completed quickly to reduce __Q34__',
              '○   elephants had to be turned on their __Q35__ to avoid damage to their lungs',
              "○   elephants' __Q36__ had to be monitored constantly",
              '○   tracking devices were fitted to the matriarchs',
              '○   data including the size of their tusks and __Q37__ was taken',
              '●   elephants were taken by truck to their new reserve',
              'Advantages of translocation at Nkhotakota Wildlife Park',
              '●   __Q38__ opportunities',
              '●   a reduction in the number of poachers and __Q39__',
              '●   an example of conservation that other parks can follow',
              '●   an increase in __Q40__ as a contributor to GDP',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'fences' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'family' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'helicopters' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'stress' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'sides' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'breathing' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'feet' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'employment' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'weapons' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'tourism' },
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
