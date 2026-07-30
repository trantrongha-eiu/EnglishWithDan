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
  name: 'Cam 15 - Test 4',
  testNumber: 4,
  seriesName: 'Cam 15',
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
          instruction: 'Questions 1–10  Complete the form below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          noteConfig: {
            title: 'Customer Satisfaction Survey',
            lines: [
              'Customer details',
              'Name: Sophie Bird',
              'Occupation: __Q1__',
              'Reason for travel today: __Q2__',
              'Journey information',
              'Name of station returning to: __Q3__',
              'Type of ticket purchased: Standard __Q4__ ticket',
              'Cost of ticket: £__Q5__',
              'When ticket was purchased: Yesterday',
              'Where ticket was bought: __Q6__',
              'Satisfaction with journey',
              'Most satisfied with: the wifi',
              'Least satisfied with: the __Q7__ this morning.',
              'Satisfaction with station facilities',
              'Most satisfied with: how much __Q8__ was provided',
              'Least satisfied with: lack of seats, particularly on the __Q9__',
              'Neither satisfied nor dissatisfied with: the __Q10__ available',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'journalist' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'shopping' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'Staunfirth' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'return' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: '23.70' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'online' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'delay' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'information' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'platform/platforms' },
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
          groupType: 'map',
          groupTitle: '',
          instruction: 'Questions 11–16  Label the map below.  Write the correct letter, A-H, next to Questions 11–16.',
          imageUrl: '', // admin: upload the park map/plan image here
          questions: [
            { questionNumber: 11, type: 'map-labelling', questionText: 'café', correctAnswer: 'D' },
            { questionNumber: 12, type: 'map-labelling', questionText: 'toilets', correctAnswer: 'C' },
            { questionNumber: 13, type: 'map-labelling', questionText: 'formal gardens', correctAnswer: 'G' },
            { questionNumber: 14, type: 'map-labelling', questionText: 'outdoor gym', correctAnswer: 'H' },
            { questionNumber: 15, type: 'map-labelling', questionText: 'skateboard ramp', correctAnswer: 'A' },
            { questionNumber: 16, type: 'map-labelling', questionText: 'wild flowers', correctAnswer: 'E' },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 17 and 18  Choose TWO letters, A-E.',
          questions: [
            {
              questionNumber: 17, type: 'multi-answer-group',
              questionText: 'What does the speakers say about the adventure playground?',
              options: [
                'A   Children must be supervised.',
                'B   It costs more in winter.',
                'C   Some activities are only for younger children.',
                'D   No payment is required.',
                'E   It was recently expanded.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 18, type: 'multi-answer-group',
              questionText: 'Question 18',
              options: [
                'A   Children must be supervised.',
                'B   It costs more in winter.',
                'C   Some activities are only for younger children.',
                'D   No payment is required.',
                'E   It was recently expanded.',
              ],
              correctAnswer: 'D',
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
              questionText: 'What does the speaker say about the glass houses?',
              options: [
                'A   They are closed at weekends.',
                'B   Volunteers are needed to work there.',
                'C   They were badly damaged by fire.',
                'D   More money is needed to repair some of the glass.',
                'E   Visitors can see palm trees from tropical regions.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 20, type: 'multi-answer-group',
              questionText: 'Question 20',
              options: [
                'A   They are closed at weekends.',
                'B   Volunteers are needed to work there.',
                'C   They were badly damaged by fire.',
                'D   More money is needed to repair some of the glass.',
                'E   Visitors can see palm trees from tropical regions.',
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
      title: 'Presentation about refrigeration',
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
              questionText: '21   What did Annie discover from reading about icehouses?',
              options: [
                'A   why they were first created',
                'B   how the ice was kept frozen',
                'C   where they were located',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 22, type: 'multiple-choice',
              questionText: '22   What point does Annie make about refrigeration in ancient Rome?',
              options: [
                'A   It became a commercial business.',
                'B   It used snow from nearby.',
                'C   It took a long time to become popular.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 23, type: 'multiple-choice',
              questionText: '23   In connection with modern refrigerator, both Annie and Jack are worried about',
              options: [
                'A   the complexity of the technology.',
                'B   the fact that some are disposed of irresponsibly.',
                'C   the large number that quickly break down.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 24, type: 'multiple-choice',
              questionText: '24   What do Jack and Annie agree regarding domestic fridges?',
              options: [
                'A   They are generally good value for money.',
                'B   There are plenty of useful variations.',
                'C   They are more useful than other domestic appliances.',
              ],
              correctAnswer: 'A',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 25–30  Who is going to do research into each topic? Write the correct letter, A, B or C, next to Questions 25–30.',
          matchingOptionsTitle: 'Topics',
          matchingOptions: [
            'Annie',
            'Jack',
            'both Annie and Jack',
          ],
          matchingReuseAllowed: true,
          questions: [
            { questionNumber: 25, type: 'matching-info', questionText: 'the goods that are refrigerated', correctAnswer: 'A' },
            { questionNumber: 26, type: 'matching-info', questionText: 'the effects on health', correctAnswer: 'A' },
            { questionNumber: 27, type: 'matching-info', questionText: 'the impact on food producers', correctAnswer: 'B' },
            { questionNumber: 28, type: 'matching-info', questionText: 'the impact on cities', correctAnswer: 'B' },
            { questionNumber: 29, type: 'matching-info', questionText: 'refrigerated transport', correctAnswer: 'A' },
            { questionNumber: 30, type: 'matching-info', questionText: 'domestic fridges', correctAnswer: 'C' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'How the Industrial Revolution affected life in Britain',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'How the Industrial Revolution affected life in Britain',
            lines: [
              '19th century',
              "●   For the first time, people's possessions were used to measure Britain's __Q31__.",
              '●   Developments in production of goods and in __Q32__ greatly changed lives.',
              'MAIN AREAS OF CHANGE',
              'Manufacturing',
              '●   The Industrial Revolution would not have happened without the new types of __Q33__ that were used then.',
              '●   The leading industry was __Q34__ (its products became widely available).',
              '●   New __Q35__ made factories necessary and so more people moved into towns.',
              'Transport',
              '●   The railways took the place of canals.',
              '●   Because of the new transport:',
              '○   greater access to __Q36__ made people more aware of what they could buy in shops.',
              '○   when shopping, people were not limited to buying __Q37__ goods.',
              'Retailing',
              '●   The first department stores were opened.',
              '●   The displays of goods were more visible:',
              '○   inside stores because of better __Q38__.',
              '○   outside stores, because __Q39__ were bigger.',
              '●   __Q40__ that was persuasive became much more common.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'wealth' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'technology' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'power' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'textile/textiles' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'machines' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'newspapers' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'local' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'lighting' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'windows' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'Advertising' },
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
