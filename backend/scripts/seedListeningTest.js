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
  name: 'Cam 19 - Test 1',
  testNumber: 1,
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
          instruction: 'Questions 1–10  Complete the notes below.  Write ONE WORD AND/OR A NUMBER for each answer.',
          noteConfig: {
            title: 'Hinchingbrooke Country Park',
            lines: [
              'The park',
              'Area: __Q1__ hectares',
              'Habitats: wetland, grassland and woodland',
              'Wetland: lakes, ponds and a __Q2__',
              'Wildlife includes birds, insects and animals',
              'Subjects studied in educational visits include',
              'Science: Children look at __Q3__ about plants, etc.',
              'Geography: includes learning to use a __Q4__ and compass',
              'History: changes in land use',
              "Leisure and tourism: mostly concentrates on the park's __Q5__",
              'Music: Children make __Q6__ with natural materials, and experiment with rhythm and speed.',
              'Benefits of outdoor educational visits',
              'They give children a feeling of __Q7__ that they may not have elsewhere.',
              'Children learn new __Q8__ and gain self-confidence.',
              'Practical issues',
              'Cost per child: £__Q9__',
              'Adults, such as __Q10__, free',
            ],
          },
          questions: [
            { questionNumber: 1, type: 'fill-blank', questionText: 'Question 1', correctAnswer: '69/sixty-nine' },
            { questionNumber: 2, type: 'fill-blank', questionText: 'Question 2', correctAnswer: 'stream' },
            { questionNumber: 3, type: 'fill-blank', questionText: 'Question 3', correctAnswer: 'data' },
            { questionNumber: 4, type: 'fill-blank', questionText: 'Question 4', correctAnswer: 'map' },
            { questionNumber: 5, type: 'fill-blank', questionText: 'Question 5', correctAnswer: 'visitors' },
            { questionNumber: 6, type: 'fill-blank', questionText: 'Question 6', correctAnswer: 'sounds' },
            { questionNumber: 7, type: 'fill-blank', questionText: 'Question 7', correctAnswer: 'freedom' },
            { questionNumber: 8, type: 'fill-blank', questionText: 'Question 8', correctAnswer: 'skills' },
            { questionNumber: 9, type: 'fill-blank', questionText: 'Question 9', correctAnswer: '4.95' },
            { questionNumber: 10, type: 'fill-blank', questionText: 'Question 10', correctAnswer: 'leaders' },
          ],
        },
      ],
    },

    // ── PART 2 (Q11–20) ─────────────────────────────────────────────
    {
      partNumber: 2,
      title: 'Stanthorpe Twinning Association',
      description: '',
      transcript: '',
      questionRange: { start: 11, end: 20 },
      questionGroups: [
        {
          groupType: 'plain',
          groupTitle: '',
          instruction: 'Questions 11–15  Choose the correct letter, A, B or C.',
          questions: [
            {
              questionNumber: 11, type: 'multiple-choice',
              questionText: '11   During the visit to Malatte, in France, members especially enjoyed',
              options: [
                'A   going to a theme park.',
                'B   experiencing a river trip.',
                'C   visiting a cheese factory.',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 12, type: 'multiple-choice',
              questionText: '12   What will happen in Stanthorpe to mark the 25th anniversary of the Twinning Association?',
              options: [
                'A   A tree will be planted.',
                'B   A garden seat will be bought.',
                'C   A footbridge will be built.',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 13, type: 'multiple-choice',
              questionText: '13   Which event raised most funds this year?',
              options: [
                'A   the film show',
                'B   the pancake evening',
                'C   the cookery demonstration',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 14, type: 'multiple-choice',
              questionText: '14   For the first evening with the French visitors host families are advised to',
              options: [
                'A   take them for a walk round the town.',
                'B   go to a local restaurant.',
                'C   have a meal at home.',
              ],
              correctAnswer: 'C',
            },
            {
              questionNumber: 15, type: 'multiple-choice',
              questionText: '15   On Saturday evening there will be the chance to',
              options: [
                'A   listen to a concert.',
                'B   watch a match.',
                'C   take part in a competition.',
              ],
              correctAnswer: 'A',
            },
          ],
        },
        {
          groupType: 'map',
          groupTitle: '',
          instruction: 'Questions 16–20  Label the map below.  Write the correct letter, A-H, next to Questions 16–20.',
          imageUrl: '', // admin: upload the estate/garden map image here
          questions: [
            { questionNumber: 16, type: 'map-labelling', questionText: 'Farm shop', correctAnswer: 'G' },
            { questionNumber: 17, type: 'map-labelling', questionText: 'Disabled entry', correctAnswer: 'C' },
            { questionNumber: 18, type: 'map-labelling', questionText: 'Adventure playground', correctAnswer: 'B' },
            { questionNumber: 19, type: 'map-labelling', questionText: 'Kitchen gardens', correctAnswer: 'D' },
            { questionNumber: 20, type: 'map-labelling', questionText: 'The Temple of the Four Winds', correctAnswer: 'A' },
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
              questionText: 'Which TWO things did Colin find most satisfying about his bread reuse project?',
              options: [
                'A   receiving support from local restaurants',
                'B   finding a good way to prevent waste',
                'C   overcoming problems in a basis process',
                'D   experimenting with designs and colours',
                'E   learning how to apply 3-D priting',
              ],
              correctAnswer: 'B',
            },
            {
              questionNumber: 22, type: 'multi-answer-group',
              questionText: 'Question 22',
              options: [
                'A   receiving support from local restaurants',
                'B   finding a good way to prevent waste',
                'C   overcoming problems in a basis process',
                'D   experimenting with designs and colours',
                'E   learning how to apply 3-D priting',
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
              questionText: 'Which TWO ways do the students agree that touch-sensitive sensors for food labels could be developed in future?',
              options: [
                'A   for use on medical products',
                'B   to show that food is no longer fit to eat',
                'C   for use with drinks as well as foods',
                'D   to provide applications for blind people',
                'E   to indicate the weight of certain foods',
              ],
              correctAnswer: 'A',
            },
            {
              questionNumber: 24, type: 'multi-answer-group',
              questionText: 'Question 24',
              options: [
                'A   for use on medical products',
                'B   to show that food is no longer fit to eat',
                'C   for use with drinks as well as foods',
                'D   to provide applications for blind people',
                'E   to indicate the weight of certain foods',
              ],
              correctAnswer: 'E',
            },
          ],
        },
        {
          groupType: 'matching-options',
          groupTitle: '',
          instruction: "Questions 25–30  What is the students' opinion about each of the following food trends? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25–30.",
          matchingOptionsTitle: 'Opinions',
          matchingOptions: [
            'This is only relevant to young people.',
            'This may have disappointing results.',
            'This already seems to be widespread.',
            'Retailers should do more to encourage this.',
            'More financial support is needed for this.',
            'Most people know little about this.',
            'There should be stricter regulations about this.',
            'This could be dangerous.',
          ],
          questions: [
            { questionNumber: 25, type: 'matching-info', questionText: 'Use of local products', correctAnswer: 'D' },
            { questionNumber: 26, type: 'matching-info', questionText: 'Reduction in unnecessary packaging', correctAnswer: 'G' },
            { questionNumber: 27, type: 'matching-info', questionText: 'Gluten-free and lactose-free food', correctAnswer: 'C' },
            { questionNumber: 28, type: 'matching-info', questionText: 'Use of branded products related to celebrity chefs', correctAnswer: 'B' },
            { questionNumber: 29, type: 'matching-info', questionText: "Development of 'ghost kitchens' for takeaway food", correctAnswer: 'F' },
            { questionNumber: 30, type: 'matching-info', questionText: 'Use of mushrooms for common health concerns', correctAnswer: 'H' },
          ],
        },
      ],
    },

    // ── PART 4 (Q31–40) ─────────────────────────────────────────────
    {
      partNumber: 4,
      title: 'Céide Fields',
      description: '',
      transcript: '',
      questionRange: { start: 31, end: 40 },
      questionGroups: [
        {
          groupType: 'note-form',
          groupTitle: '',
          instruction: 'Questions 31–40  Complete the notes below.  Write ONE WORD ONLY for each answer.',
          noteConfig: {
            title: 'Céide Fields',
            lines: [
              '●   an important Neolithic archaeological site in the northwest of Ireland',
              'Discovery',
              '●   In the 1930s, a local teacher realised that stones beneath the bog surface were once __Q31__.',
              '●   His __Q32__ became an archaeologist and undertook an investigation of the site:',
              '○   a traditional method used by local people to dig for __Q33__ was used to identify where stones were located',
              '○   carbon dating later proved the site was Neolithic.',
              '●   Items are well preserved in the bog because of a lack of __Q34__.',
              'Neolithic farmers',
              '●   Houses were __Q35__ in shape and had a hole in the roof.',
              '●   Neolithic innovations include:',
              '○   cooking indoors',
              '○   pots used for storage and to make __Q36__.',
              '●   Each field at Céide was large enough to support a big __Q37__.',
              '●   The fields were probably used to restrict the grazing of animals – no evidence of structures to house them during __Q38__.',
              'Reasons for the decline in farming',
              '●   a decline in __Q39__ quality',
              '●   an increase in __Q40__',
            ],
          },
          questions: [
            { questionNumber: 31, type: 'fill-blank', questionText: 'Question 31', correctAnswer: 'walls' },
            { questionNumber: 32, type: 'fill-blank', questionText: 'Question 32', correctAnswer: 'son' },
            { questionNumber: 33, type: 'fill-blank', questionText: 'Question 33', correctAnswer: 'fuel' },
            { questionNumber: 34, type: 'fill-blank', questionText: 'Question 34', correctAnswer: 'oxygen' },
            { questionNumber: 35, type: 'fill-blank', questionText: 'Question 35', correctAnswer: 'rectangular' },
            { questionNumber: 36, type: 'fill-blank', questionText: 'Question 36', correctAnswer: 'lamps' },
            { questionNumber: 37, type: 'fill-blank', questionText: 'Question 37', correctAnswer: 'family' },
            { questionNumber: 38, type: 'fill-blank', questionText: 'Question 38', correctAnswer: 'winter' },
            { questionNumber: 39, type: 'fill-blank', questionText: 'Question 39', correctAnswer: 'soil' },
            { questionNumber: 40, type: 'fill-blank', questionText: 'Question 40', correctAnswer: 'rain' },
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
