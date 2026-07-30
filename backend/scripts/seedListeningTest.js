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
  name: 'Cam 21 - Test 3',
  testNumber: 3,
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
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 1–10  Complete the notes below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          noteConfig: {
            title: 'Ferry to Shetland Islands',
            lines: [
              'Name of ferry company: __Q1__ Ferries',
              'Ferries depart seven times per __Q2__ in summer',
              'Cost for four people with car: a little less than £__Q3__',
              'Cancellation policy: receive a __Q4__ (if cancelled a month in advance)',
              'Advice',
              'Cabins:',
              '○   book one with a __Q5__',
              '○   luxury cabins have a TV',
              'Bring snacks and __Q6__ for the children',
              'A __Q7__ is required for the dog kennels',
              'Try to see __Q8__ in the morning',
              'If time, visit __Q9__ Castle',
              'The __Q10__ restaurant in a nearby village is recommended',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: 'Northern' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'week' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: '250/two hundred and fifty' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'voucher' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'window' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'books' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'blanket' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'dolphins' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: 'Drum' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'Italian' },
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
              questionText: 'Which TWO explanations for the popularity of street food are given?',
              options: [
                'A   low price',
                'B   locally sourced',
                'C   freshly made',
                'D   convenience',
                'E   unusual food',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 12, type: 'multi-answer-group',
              questionText: 'Question 12',
              options: [
                'A   low price',
                'B   locally sourced',
                'C   freshly made',
                'D   convenience',
                'E   unusual food',
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
              questionText: 'Which TWO places are recommended for new street food businesses?',
              options: [
                'A   music festivals',
                'B   food markets',
                'C   weddings',
                'D   parties',
                'E   parks',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 14, type: 'multi-answer-group',
              questionText: 'Question 14',
              options: [
                'A   music festivals',
                'B   food markets',
                'C   weddings',
                'D   parties',
                'E   parks',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 15–16  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 15, type: 'multiple-choice',
              questionText: '15   What does the speaker say about getting equipment for a street food business?',
              options: [
                'A   High quality equipment is a good investment.',
                "B   It's best to buy second-hand equipment.",
                'C   Renting equipment can be cheap.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 16, type: 'multiple-choice',
              questionText: '16   What advice is given about creating a product for a street food business?',
              options: [
                'A   Provide information about the ingredients.',
                'B   It is important to have an original product.',
                'C   The presentation is an important factor.',
              ],
              correctAnswer: 'C',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 17–20  What problem did the owners of each of the following street food businesses experience? Choose FOUR answers from the box and write the correct letter, A-F, next to Questions 17–20.',
          matchingOptionsTitle: 'Problems',
          matchingOptions: [
            'Some ingredients were too expensive.',
            'The meals took a long time to prepare.',
            'They had no money for marketing.',
            'It was difficult to get a permit to sell food.',
            'A competitor was selling similar food in their area.',
            'They worked very long hours.',
          ],
          questions: [
            { questionNumber: 17, type: 'matching-info', questionText: 'Thai Basil', correctAnswer: 'F' },
            { questionNumber: 18, type: 'matching-info', questionText: 'Basque', correctAnswer: 'A' },
            { questionNumber: 19, type: 'matching-info', questionText: "Lou's kitchen", correctAnswer: 'B' },
            { questionNumber: 20, type: 'matching-info', questionText: 'Chip Chop', correctAnswer: 'D' },
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
              questionText: "Which TWO points do the speakers make about the terms 'ethical' and 'sustainable' fashion?",
              options: [
                'A   Their definitions keep changing.',
                'B   People think they mean the same thing.',
                "C   The term 'eco-friendly' is preferable.",
                'D   They are often used imprecisely.',
                'E   Companies should avoid using them on clothing labels.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 22, type: 'multi-answer-group',
              questionText: 'Question 22',
              options: [
                'A   Their definitions keep changing.',
                'B   People think they mean the same thing.',
                "C   The term 'eco-friendly' is preferable.",
                'D   They are often used imprecisely.',
                'E   Companies should avoid using them on clothing labels.',
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
              questionText: 'Which TWO claims about wool production do the speakers disagree with?',
              options: [
                'A   Sheep are generally well-treated.',
                'B   Wool is easy to recycle.',
                'C   Wool is a long-lasting fabric.',
                'D   Wool production involves few chemicals.',
                'E   Sheep do less environmental damage than other livestock.',
              ],
              correctAnswer: 'D',
            },
            {
              questionNumber: 24, type: 'multi-answer-group',
              questionText: 'Question 24',
              options: [
                'A   Sheep are generally well-treated.',
                'B   Wool is easy to recycle.',
                'C   Wool is a long-lasting fabric.',
                'D   Wool production involves few chemicals.',
                'E   Sheep do less environmental damage than other livestock.',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: 'Questions 25–30  What comment do the speakers make about each of the following semi-synthetic fabrics? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25–30.',
          matchingOptionsTitle: 'Comments',
          matchingOptions: [
            'The production process is fuel efficient.',
            'It is the least sustainable of alternative fabrics.',
            'Production costs are high.',
            'It provides additional health benefits.',
            'It is not durable in the long-term.',
            'It needs to be produced in a certain way to be sustainable.',
            'Chemicals required for production can be reused.',
            'This is from a wholly sustainable source.',
          ],
          questions: [
            { questionNumber: 25, type: 'matching-info', questionText: 'Lyocell', correctAnswer: 'G' },
            { questionNumber: 26, type: 'matching-info', questionText: 'Cupro', correctAnswer: 'B' },
            { questionNumber: 27, type: 'matching-info', questionText: 'Bamboo', correctAnswer: 'F' },
            { questionNumber: 28, type: 'matching-info', questionText: 'EcoVero', correctAnswer: 'A' },
            { questionNumber: 29, type: 'matching-info', questionText: 'Cork', correctAnswer: 'H' },
            { questionNumber: 30, type: 'matching-info', questionText: 'Hemp', correctAnswer: 'D' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Invasive species',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Invasive species',
            lines: [
              'Definition: an animal or plant that causes harm to an environment after being introduced by humans',
              'An invasive species can be a problem when it:',
              '●   eats native species.',
              '●   introduces a new __Q31__.',
              '●   takes food from native species.',
              '●   threatens an entire __Q32__.',
              'How invasive species spread',
              '●   accidentally e.g. via people returning from their __Q33__ or on cargo ships',
              '●   intentionally e.g. for pest control, or as __Q34__',
              'Examples of invasive species',
              '●   Rhinella marina (toads)',
              '○   were introduced to Australia from Hawaii in 1935 to eat a type of insect that was damaging the __Q35__ plantations.',
              '○   failed to solve the problem and became widespread in the north of Australia.',
              '○   are poisonous for any species that eats them and reduce the food available for native frogs.',
              '●   Japanese knotweed plants were popular among 19th-century gardeners in the UK.',
              '●   Rhododendron plants prevent __Q36__ from reaching native plants.',
              "●   Grey squirrels from N. America reduce sources of food for the UK's native red squirrels and spread a __Q37__ that kills red squirrels.",
              'Tackling invasive species',
              '●   Monitoring helps us to understand the __Q38__ of invasive species and the impact they have.',
              '●   Setting up a national __Q39__ makes it easier to track them.',
              '●   Asking the public to __Q40__ and report them helps with monitoring.',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'disease' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'ecosystem' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'holiday/holidays' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'pets' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'sugar' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'light' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'virus' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'behaviour/behavior' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'database' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'photograph' },
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
